import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_MENU_ITEMS, INITIAL_STORE_CONFIG } from './src/data/initialMenu.js';
import { MenuItem, Order, OrderStatus, StoreConfig } from './src/types.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store
let menuItems: MenuItem[] = [...INITIAL_MENU_ITEMS];
let storeConfig: StoreConfig = { ...INITIAL_STORE_CONFIG };
let orders: Order[] = [];
let nextOrderNumber = 101;

// SSE Client Connections
type SSEClient = {
  id: string;
  res: express.Response;
};
let sseClients: SSEClient[] = [];

// Helper to broadcast SSE event
function broadcastSSE(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.res.write(payload);
    } catch (err) {
      console.error('Failed to send SSE to client:', client.id, err);
    }
  });
}

// External Webhook Notification Handler (Discord / Custom Webhook)
async function sendWebhookNotification(order: Order) {
  const webhook = storeConfig.webhookConfig;
  if (!webhook || !webhook.enabled) return;

  const orderItemsSummary = order.items
    .map((item) => {
      const opts = item.selectedOptions.map((o) => o.choiceName).join(', ');
      const optStr = opts ? ` (${opts})` : '';
      return `• ${item.menuItem.name}${optStr} x ${item.quantity} = ₩${item.totalPrice.toLocaleString()}`;
    })
    .join('\n');

  const contentMessage = `📢 **[꽃돼지 PC방] 새로운 주문 접수!**\n` +
    `🪑 **좌석:** ${order.seatNumber}번 PC\n` +
    `🧾 **주문번호:** #${order.orderNumber}\n` +
    `🍱 **주문 메뉴:**\n${orderItemsSummary}\n` +
    `💰 **총 금액:** ₩${order.totalAmount.toLocaleString()}\n` +
    `💬 **요청사항:** ${order.requestNote || '없음'}\n` +
    `⏰ **주문시간:** ${new Date(order.createdAt).toLocaleTimeString('ko-KR')}`;

  // 1) Discord Webhook
  if (webhook.discordUrl && webhook.discordUrl.startsWith('http')) {
    try {
      await fetch(webhook.discordUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: '꽃돼지 PC방 주문 알리미',
          avatar_url: 'https://em-content.zobj.net/source/microsoft-teams/337/pig-face_1f437.png',
          content: contentMessage,
          embeds: [
            {
              title: `🐷 PC ${order.seatNumber}번 자리 주문 (#${order.orderNumber})`,
              color: 16738740, // Pink pig tone
              fields: [
                { name: '좌석 번호', value: `${order.seatNumber}번`, inline: true },
                { name: '총 금액', value: `₩${order.totalAmount.toLocaleString()}`, inline: true },
                { name: '요청사항', value: order.requestNote || '없음', inline: false },
                { name: '주문 항목', value: orderItemsSummary, inline: false },
              ],
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
      console.log('Discord webhook dispatched successfully');
    } catch (err) {
      console.error('Discord webhook error:', err);
    }
  }

  // 2) Custom HTTP Webhook
  if (webhook.customUrl && webhook.customUrl.startsWith('http')) {
    try {
      await fetch(webhook.customUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'new_order',
          order,
          storeName: storeConfig.storeName,
        }),
      });
      console.log('Custom webhook dispatched successfully');
    } catch (err) {
      console.error('Custom webhook error:', err);
    }
  }
}

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Store Configuration
app.get('/api/config', (_req, res) => {
  res.json(storeConfig);
});

app.put('/api/config', (req, res) => {
  storeConfig = { ...storeConfig, ...req.body };
  broadcastSSE('config_updated', storeConfig);
  res.json(storeConfig);
});

// Menu Endpoints
app.get('/api/menu', (_req, res) => {
  res.json(menuItems);
});

app.post('/api/menu', (req, res) => {
  const newItem: MenuItem = {
    ...req.body,
    id: `item-${Date.now()}`,
  };
  menuItems.push(newItem);
  broadcastSSE('menu_updated', menuItems);
  res.status(201).json(newItem);
});

app.put('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  const index = menuItems.findIndex((m) => m.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }
  menuItems[index] = { ...menuItems[index], ...req.body };
  broadcastSSE('menu_updated', menuItems);
  res.json(menuItems[index]);
});

app.delete('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  menuItems = menuItems.filter((m) => m.id !== id);
  broadcastSSE('menu_updated', menuItems);
  res.json({ success: true });
});

// Order Endpoints
app.get('/api/orders', (_req, res) => {
  res.json(orders);
});

app.post('/api/orders', async (req, res) => {
  const { seatNumber, items, totalAmount, requestNote } = req.body;

  if (!seatNumber || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Valid seat number and items are required' });
    return;
  }

  const newOrder: Order = {
    id: `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    orderNumber: nextOrderNumber++,
    seatNumber: Number(seatNumber),
    items,
    totalAmount: Number(totalAmount),
    requestNote: requestNote || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.unshift(newOrder);

  // Broadcast via Real-time SSE to Admin Dashboard
  broadcastSSE('new_order', newOrder);

  // Send External Notification (Discord / Custom Webhook)
  sendWebhookNotification(newOrder).catch((e) => console.error(e));

  res.status(201).json(newOrder);
});

app.put('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status: OrderStatus };

  const orderIndex = orders.findIndex((o) => o.id === id);
  if (orderIndex === -1) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  orders[orderIndex].status = status;
  orders[orderIndex].updatedAt = new Date().toISOString();

  const updatedOrder = orders[orderIndex];

  // Broadcast real-time status update to both customer and admin
  broadcastSSE('order_status_changed', updatedOrder);

  res.json(updatedOrder);
});

app.delete('/api/orders', (_req, res) => {
  orders = [];
  broadcastSSE('orders_cleared', {});
  res.json({ success: true, message: 'All orders cleared' });
});

// Webhook Test Endpoint
app.post('/api/test-webhook', async (req, res) => {
  const { url, type } = req.body;
  if (!url || !url.startsWith('http')) {
    res.status(400).json({ error: 'Invalid URL' });
    return;
  }

  try {
    if (type === 'discord') {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: '꽃돼지 PC방 알림 테스트',
          content: '🔔 **꽃돼지 PC방 주문 알림 연동 테스트 성공!**\n손님이 주문하면 이곳으로 실시간 알림이 발송됩니다.',
        }),
      });
    } else {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'test_webhook',
          message: '꽃돼지 PC방 웹훅 테스트 성공!',
          timestamp: new Date().toISOString(),
        }),
      });
    }
    res.json({ success: true, message: 'Test message sent successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to send webhook test' });
  }
});

// SSE Endpoint
app.get('/api/orders/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = `client-${Date.now()}-${Math.random()}`;
  const newClient: SSEClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send initial handshake with current orders & config
  res.write(`event: init\ndata: ${JSON.stringify({ orders, config: storeConfig, menuItems })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🐷 꽃돼지 PC방 Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

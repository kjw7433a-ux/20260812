import React, { useState, useEffect, useRef } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { CustomerView } from './components/CustomerView';
import { AdminView } from './components/AdminView';
import { MenuItemDetailModal } from './components/MenuItemDetailModal';
import { SeatSelectionModal } from './components/SeatSelectionModal';
import { WebhookSettingsModal } from './components/WebhookSettingsModal';
import { AddMenuModal } from './components/AddMenuModal';
import { AiKeyModal } from './components/AiKeyModal';
import { AiMenuRecommenderModal } from './components/AiMenuRecommenderModal';
import { audioAlert } from './utils/audioAlert';
import {
  MenuItem,
  CartItem,
  CartItemOptionSelection,
  Order,
  OrderStatus,
  StoreConfig,
} from './types';
import { INITIAL_MENU_ITEMS, INITIAL_STORE_CONFIG } from './data/initialMenu';

export default function App() {
  const [currentView, setCurrentView] = useState<'customer' | 'admin'>('customer');
  const [seatNumber, setSeatNumber] = useState<number>(5);

  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(INITIAL_STORE_CONFIG);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [sseConnected, setSseConnected] = useState<boolean>(false);

  // AI API Key state in localStorage
  const [aiApiKey, setAiApiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });

  // Modals state
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState<boolean>(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState<boolean>(false);
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState<boolean>(false);
  const [isCustomerOrdersModalOpen, setIsCustomerOrdersModalOpen] = useState<boolean>(false);
  const [isAiKeyModalOpen, setIsAiKeyModalOpen] = useState<boolean>(false);
  const [isAiRecommendModalOpen, setIsAiRecommendModalOpen] = useState<boolean>(false);

  const handleSaveAiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setAiApiKey(key);
  };

  const handleDeleteAiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setAiApiKey('');
  };

  // Store config ref for callback access inside SSE
  const configRef = useRef<StoreConfig>(storeConfig);
  useEffect(() => {
    configRef.current = storeConfig;
  }, [storeConfig]);

  // Connect to SSE for real-time order notifications
  useEffect(() => {
    const eventSource = new EventSource('/api/orders/stream');

    eventSource.onopen = () => {
      setSseConnected(true);
    };

    eventSource.addEventListener('init', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.orders) setOrders(data.orders);
        if (data.config) setStoreConfig(data.config);
        if (data.menuItems) setMenuItems(data.menuItems);
      } catch (err) {
        console.error('SSE init parse error:', err);
      }
    });

    eventSource.addEventListener('new_order', (e: MessageEvent) => {
      try {
        const newOrder: Order = JSON.parse(e.data);
        setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);

        // Sound & Speech Alert Trigger
        const currentCfg = configRef.current;
        if (currentCfg.soundEnabled) {
          audioAlert.playOrderChime(currentCfg.volume);
        }
        if (currentCfg.ttsEnabled) {
          audioAlert.speakKoreanNotification(
            `PC ${newOrder.seatNumber}번 좌석에서 신규 주문이 접수되었습니다!`
          );
        }
        audioAlert.sendBrowserNotification(`🐷 PC ${newOrder.seatNumber}번 자리 신규 주문!`, {
          body: `주문금액: ₩${newOrder.totalAmount.toLocaleString()} (${newOrder.items.length}개 메뉴)`,
        });
      } catch (err) {
        console.error('SSE new_order parse error:', err);
      }
    });

    eventSource.addEventListener('order_status_changed', (e: MessageEvent) => {
      try {
        const updatedOrder: Order = JSON.parse(e.data);
        setOrders((prev) =>
          prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
        );
      } catch (err) {
        console.error('SSE order_status_changed error:', err);
      }
    });

    eventSource.addEventListener('menu_updated', (e: MessageEvent) => {
      try {
        const updatedMenu: MenuItem[] = JSON.parse(e.data);
        setMenuItems(updatedMenu);
      } catch (err) {
        console.error('SSE menu_updated error:', err);
      }
    });

    eventSource.addEventListener('config_updated', (e: MessageEvent) => {
      try {
        const updatedConfig: StoreConfig = JSON.parse(e.data);
        setStoreConfig(updatedConfig);
      } catch (err) {
        console.error('SSE config_updated error:', err);
      }
    });

    eventSource.addEventListener('orders_cleared', () => {
      setOrders([]);
    });

    eventSource.onerror = () => {
      setSseConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Fetch initial data fallback
  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data) => setMenuItems(data))
      .catch(() => {});

    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setStoreConfig(data))
      .catch(() => {});

    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch(() => {});
  }, []);

  // Cart operations
  const handleAddToCart = (
    item: MenuItem,
    selectedOptions: CartItemOptionSelection[],
    quantity: number,
    itemNote: string
  ) => {
    const optionsCost = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
    const unitPrice = item.price + optionsCost;
    const totalPrice = unitPrice * quantity;

    const newCartItem: CartItem = {
      cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      menuItem: item,
      selectedOptions,
      quantity,
      unitPrice,
      totalPrice,
      itemNote,
    };

    setCart((prev) => [...prev, newCartItem]);
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Order Submission
  const handleSubmitOrder = async (requestNote: string): Promise<boolean> => {
    if (cart.length === 0) return false;

    const totalAmount = cart.reduce((sum, i) => sum + i.totalPrice, 0);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seatNumber,
          items: cart,
          totalAmount,
          requestNote,
        }),
      });

      if (res.ok) {
        setCart([]);
        setIsCustomerOrdersModalOpen(true);
        return true;
      } else {
        alert('주문 전송 실패. 다시 시도해주세요.');
        return false;
      }
    } catch (e) {
      console.error('Submit order error:', e);
      alert('서버 통신 오류가 발생했습니다.');
      return false;
    }
  };

  // Admin Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      console.error('Update status error:', e);
    }
  };

  const handleClearAllOrders = async () => {
    if (!window.confirm('모든 주문 내역을 초기화하시겠습니까?')) return;
    try {
      await fetch('/api/orders', { method: 'DELETE' });
    } catch (e) {
      console.error('Clear orders error:', e);
    }
  };

  // Store config update
  const handleUpdateConfig = async (updated: Partial<StoreConfig>) => {
    const newConfig = { ...storeConfig, ...updated };
    setStoreConfig(newConfig);
    try {
      await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
    } catch (e) {
      console.error('Update config error:', e);
    }
  };

  // Menu management
  const handleToggleOutOfStock = async (itemId: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/menu/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOutOfStock: !currentStatus }),
      });
    } catch (e) {
      console.error('Toggle stock error:', e);
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    if (!window.confirm('해당 메뉴를 삭제하시겠습니까?')) return;
    try {
      await fetch(`/api/menu/${itemId}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Delete menu error:', e);
    }
  };

  const handleAddMenuItem = async (newItemData: Omit<MenuItem, 'id'>) => {
    try {
      await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemData),
      });
    } catch (e) {
      console.error('Add menu error:', e);
    }
  };

  const handleTestSound = () => {
    audioAlert.playOrderChime(storeConfig.volume);
    if (storeConfig.ttsEnabled) {
      audioAlert.speakKoreanNotification('주문 알림 소리 테스트입니다.');
    }
  };

  // Active orders for customer's current seat
  const mySeatOrders = orders.filter((o) => o.seatNumber === seatNumber);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-pink-500 selection:text-white">
      {/* Top Navigation Header */}
      <HeaderBar
        currentView={currentView}
        onViewChange={setCurrentView}
        seatNumber={seatNumber}
        onOpenSeatModal={() => setIsSeatModalOpen(true)}
        pendingOrderCount={pendingCount}
        storeConfig={storeConfig}
        onTestSound={handleTestSound}
        activeOrdersCount={mySeatOrders.length}
        onOpenCustomerOrders={() => setIsCustomerOrdersModalOpen(true)}
        onOpenAiKeyModal={() => setIsAiKeyModalOpen(true)}
        onOpenAiRecommendModal={() => setIsAiRecommendModalOpen(true)}
        hasAiKey={!!aiApiKey}
      />

      {/* Main View Router */}
      {currentView === 'customer' ? (
        <CustomerView
          menuItems={menuItems}
          seatNumber={seatNumber}
          onOpenSeatModal={() => setIsSeatModalOpen(true)}
          storeConfig={storeConfig}
          cart={cart}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onSubmitOrder={handleSubmitOrder}
          activeOrders={mySeatOrders}
          onOpenItemModal={(item) => setSelectedMenuItem(item)}
          isOrdersModalOpen={isCustomerOrdersModalOpen}
          onCloseOrdersModal={() => setIsCustomerOrdersModalOpen(false)}
        />
      ) : (
        <AdminView
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onClearAllOrders={handleClearAllOrders}
          storeConfig={storeConfig}
          onUpdateConfig={handleUpdateConfig}
          menuItems={menuItems}
          onToggleOutOfStock={handleToggleOutOfStock}
          onDeleteMenuItem={handleDeleteMenuItem}
          onOpenAddMenuModal={() => setIsAddMenuModalOpen(true)}
          onOpenWebhookModal={() => setIsWebhookModalOpen(true)}
          onTestSound={handleTestSound}
          sseConnected={sseConnected}
        />
      )}

      {/* Item Option Selection Modal */}
      {selectedMenuItem && (
        <MenuItemDetailModal
          item={selectedMenuItem}
          onClose={() => setSelectedMenuItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Seat Number Selection Modal */}
      {isSeatModalOpen && (
        <SeatSelectionModal
          currentSeat={seatNumber}
          onSelectSeat={setSeatNumber}
          onClose={() => setIsSeatModalOpen(false)}
        />
      )}

      {/* External Webhook Modal */}
      {isWebhookModalOpen && (
        <WebhookSettingsModal
          storeConfig={storeConfig}
          onSaveConfig={handleUpdateConfig}
          onClose={() => setIsWebhookModalOpen(false)}
        />
      )}

      {/* Add New Menu Modal */}
      {isAddMenuModalOpen && (
        <AddMenuModal
          onAddMenuItem={handleAddMenuItem}
          onClose={() => setIsAddMenuModalOpen(false)}
        />
      )}

      {/* AI Key Settings Modal */}
      <AiKeyModal
        isOpen={isAiKeyModalOpen}
        onClose={() => setIsAiKeyModalOpen(false)}
        apiKey={aiApiKey}
        onSaveKey={handleSaveAiKey}
        onDeleteKey={handleDeleteAiKey}
      />

      {/* AI Menu Recommender Modal */}
      <AiMenuRecommenderModal
        isOpen={isAiRecommendModalOpen}
        onClose={() => setIsAiRecommendModalOpen(false)}
        apiKey={aiApiKey}
        onOpenKeyModal={() => setIsAiKeyModalOpen(true)}
        menuItems={menuItems}
        onSelectItem={(item) => setSelectedMenuItem(item)}
      />
    </div>
  );
}

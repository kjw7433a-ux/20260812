export type MenuCategory = 'all' | 'noodles' | 'potato' | 'drinks' | 'rice' | 'snack';

export interface OptionChoice {
  name: string;
  price: number;
}

export interface MenuItemOption {
  id: string;
  title: string;
  required: boolean;
  choices: OptionChoice[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  categoryName: string;
  imageEmoji: string;
  badge?: string;
  isPopular?: boolean;
  isSignature?: boolean;
  isOutOfStock?: boolean;
  options?: MenuItemOption[];
}

export interface CartItemOptionSelection {
  optionTitle: string;
  choiceName: string;
  price: number;
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  selectedOptions: CartItemOptionSelection[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  itemNote?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'completed' | 'canceled';

export interface Order {
  id: string;
  orderNumber: number;
  seatNumber: number;
  items: CartItem[];
  totalAmount: number;
  requestNote: string;
  status: OrderStatus;
  createdAt: string; // ISO string
  updatedAt: string;
}

export interface WebhookConfig {
  discordUrl: string;
  customUrl: string;
  enabled: boolean;
}

export interface StoreConfig {
  storeName: string;
  noticeBanner: string;
  isEventActive: boolean;
  eventTitle: string;
  eventDescription: string;
  soundEnabled: boolean;
  ttsEnabled: boolean;
  volume: number;
  webhookConfig: WebhookConfig;
}

export interface OrderStats {
  totalOrdersToday: number;
  totalRevenueToday: number;
  pendingCount: number;
  preparingCount: number;
  completedCount: number;
  canceledCount: number;
}

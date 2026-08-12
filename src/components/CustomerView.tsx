import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  Flame,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Plus,
  Trash2,
  Gift,
  MapPin,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  MenuItem,
  MenuCategory,
  CartItem,
  CartItemOptionSelection,
  Order,
  StoreConfig,
} from '../types';

interface CustomerViewProps {
  menuItems: MenuItem[];
  seatNumber: number;
  onOpenSeatModal: () => void;
  storeConfig: StoreConfig;
  cart: CartItem[];
  onAddToCart: (
    item: MenuItem,
    selectedOptions: CartItemOptionSelection[],
    quantity: number,
    itemNote: string
  ) => void;
  onRemoveFromCart: (cartItemId: string) => void;
  onClearCart: () => void;
  onSubmitOrder: (requestNote: string) => Promise<boolean>;
  activeOrders: Order[];
  onOpenItemModal: (item: MenuItem) => void;
  isOrdersModalOpen: boolean;
  onCloseOrdersModal: () => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  menuItems,
  seatNumber,
  onOpenSeatModal,
  storeConfig,
  cart,
  onRemoveFromCart,
  onClearCart,
  onSubmitOrder,
  activeOrders,
  onOpenItemModal,
  isOrdersModalOpen,
  onCloseOrdersModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderRequestNote, setOrderRequestNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const categories: { key: MenuCategory; label: string; icon: string }[] = [
    { key: 'all', label: '전체 메뉴', icon: '🍽️' },
    { key: 'noodles', label: '면류 & 분식', icon: '🍜' },
    { key: 'potato', label: "꽃돼지's 시그니처 감자", icon: '🥔' },
    { key: 'drinks', label: '추억의 음료 & 디저트', icon: '🥛' },
    { key: 'rice', label: '밥류 & 덮밥', icon: '🍚' },
    { key: 'snack', label: '스낵 & 음료', icon: '🍿' },
  ];

  // Filter Menu Items
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalCartAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleOrderSubmit = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    const success = await onSubmitOrder(orderRequestNote);
    setIsSubmitting(false);
    if (success) {
      setOrderRequestNote('');
      setIsCartOpen(false);
    }
  };

  return (
    <div className="pb-32 min-h-screen bg-[#0a0a0a] text-neutral-200">
      {/* Event Banner (Inspired by PDF Page 2 Invitation) */}
      {storeConfig.isEventActive && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="relative overflow-hidden bg-[#0d0d0d] border border-neutral-800 rounded-xl p-5 md:p-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded border border-amber-500/20">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{storeConfig.eventTitle || '✨ VIP PREMIUM INVITATION ✨'}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-serif italic text-white tracking-tight">
                  꽃돼지 PC방 프리미엄 오픈 초대권 🐷
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 font-medium pt-1">
                  <span className="flex items-center gap-1 bg-[#111] px-2.5 py-1 rounded border border-neutral-800">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>일시: 2026년 8월 14일 (단 하루!)</span>
                  </span>
                  <span className="flex items-center gap-1 bg-[#111] px-2.5 py-1 rounded border border-neutral-800">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>장소: 꽃돼지 PC방 프리미엄 본점 (부영 106-1002)</span>
                  </span>
                </div>
              </div>

              <div className="bg-amber-500 text-black font-bold text-xs md:text-sm px-4 py-3 rounded-lg shadow-lg shadow-amber-500/10 flex items-center gap-2 border border-amber-400">
                <Gift className="w-5 h-5 shrink-0" />
                <span>{storeConfig.eventDescription}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        {/* Search Bar & Seat Indicator Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="메뉴명 또는 키워드로 검색 (예: 라면, 떡볶이)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-xs md:text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
            <div className="text-xs text-neutral-500 font-bold">
              현재 좌석:{' '}
              <span className="text-amber-400 font-bold">
                {seatNumber}번 PC
              </span>
            </div>
            <button
              onClick={onOpenSeatModal}
              className="text-xs bg-[#111] hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-medium px-3 py-1.5 rounded-lg transition"
            >
              좌석 변경
            </button>
          </div>
        </div>

        {/* Category Horizontal Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none custom-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold'
                    : 'bg-[#0d0d0d] border border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Menu Items Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm uppercase tracking-widest text-neutral-500 font-bold flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>
                {categories.find((c) => c.key === selectedCategory)?.label || '전체 메뉴'}
              </span>
              <span className="text-xs font-normal text-neutral-600">
                ({filteredMenuItems.length})
              </span>
            </h3>
          </div>

          {filteredMenuItems.length === 0 ? (
            <div className="text-center py-16 bg-[#0d0d0d] border border-neutral-800 rounded-xl space-y-2">
              <div className="text-4xl">🔍</div>
              <p className="text-sm font-bold text-neutral-400">검색 결과가 없습니다.</p>
              <p className="text-xs text-neutral-600">다른 검색어나 카테고리를 선택해보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.isOutOfStock && onOpenItemModal(item)}
                  className={`bg-[#111] rounded-xl border border-neutral-800 flex flex-col overflow-hidden group hover:border-amber-900 transition-colors cursor-pointer ${
                    item.isOutOfStock ? 'opacity-50 grayscale pointer-events-none' : ''
                  }`}
                >
                  {/* Image / Emoji Box */}
                  <div className="h-32 bg-neutral-900 overflow-hidden relative flex items-center justify-center text-5xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent opacity-60"></div>
                    <span className="relative z-10 transition-transform group-hover:scale-110">{item.imageEmoji}</span>

                    {/* Badges */}
                    {item.badge && (
                      <div className="absolute top-3 left-3 bg-amber-500 text-black px-2 py-0.5 text-[10px] font-bold rounded uppercase shadow-md">
                        {item.badge}
                      </div>
                    )}

                    {item.isOutOfStock && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center text-xs font-bold text-red-500 uppercase tracking-widest z-20">
                        일시 품절
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-serif italic text-white group-hover:text-amber-300 transition-colors">
                        {item.name}
                      </h3>
                      {item.isPopular && (
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <span className="text-amber-400 font-mono font-bold text-base">
                        ₩ {item.price.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!item.isOutOfStock) onOpenItemModal(item);
                        }}
                        className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center text-lg hover:bg-white hover:text-black transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto z-40">
          <div className="bg-[#0d0d0d] border border-neutral-800 rounded-xl p-4 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative bg-amber-500 text-black p-3 rounded-lg shadow-lg shadow-amber-500/10 font-bold">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0d0d0d] shadow">
                  {totalCartCount}
                </span>
              </div>
              <div>
                <div className="text-[11px] text-neutral-500 font-bold">
                  {seatNumber}번 PC 선택 메뉴
                </div>
                <div className="text-xl font-serif italic text-white">
                  ₩ {totalCartAmount.toLocaleString()}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs md:text-sm px-5 py-3 rounded-lg shadow-lg shadow-amber-500/10 flex items-center gap-2 transition"
            >
              <span>주문서 확인</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
          <div className="bg-[#0d0d0d] border border-neutral-800 rounded-t-xl sm:rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif italic text-lg text-white">
                  {seatNumber}번 PC 주문 내역
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
              {cart.map((cartItem) => (
                <div
                  key={cartItem.cartItemId}
                  className="bg-[#111] border border-neutral-800 rounded-lg p-3.5 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl bg-neutral-900 p-2 rounded border border-neutral-800">
                      {cartItem.menuItem.imageEmoji}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-white">
                        {cartItem.menuItem.name}
                      </h4>

                      {/* Selected Options */}
                      {cartItem.selectedOptions.length > 0 && (
                        <div className="text-xs text-neutral-500 mt-0.5 space-x-1">
                          {cartItem.selectedOptions.map((opt, i) => (
                            <span key={i} className="inline-block bg-neutral-900 px-1.5 py-0.5 rounded text-[11px] border border-neutral-800">
                              {opt.choiceName}
                            </span>
                          ))}
                        </div>
                      )}

                      {cartItem.itemNote && (
                        <div className="text-[11px] text-amber-400/80 italic mt-1">
                          요청: "{cartItem.itemNote}"
                        </div>
                      )}

                      <div className="text-xs font-mono text-neutral-400 mt-1">
                        ₩{cartItem.unitPrice.toLocaleString()} x {cartItem.quantity}개
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between h-full gap-2">
                    <div className="font-mono font-bold text-sm text-amber-400">
                      ₩{cartItem.totalPrice.toLocaleString()}
                    </div>
                    <button
                      onClick={() => onRemoveFromCart(cartItem.cartItemId)}
                      className="text-xs text-neutral-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Order Special Request Note */}
              <div className="pt-2">
                <label className="text-xs font-bold text-neutral-400 mb-1 block">
                  특별 요청사항
                </label>
                <textarea
                  placeholder="예: 얼음컵 챙겨주세요, 휴지 필요해요"
                  value={orderRequestNote}
                  onChange={(e) => setOrderRequestNote(e.target.value)}
                  className="w-full bg-[#111] border border-neutral-800 rounded-lg p-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                  rows={2}
                />
              </div>
            </div>

            {/* Footer / Submit Button */}
            <div className="p-5 border-t border-neutral-800 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400 font-bold">총 결제 금액</span>
                <span className="text-2xl font-serif italic text-white">
                  ₩ {totalCartAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onClearCart}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold px-4 py-3 rounded-lg transition"
                >
                  비우기
                </button>
                <button
                  onClick={handleOrderSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm py-3.5 px-6 rounded-lg shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? '주문 전송 중...' : '주문하기'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Active Orders Tracker Modal */}
      {isOrdersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0d0d0d] border border-neutral-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif italic text-lg text-white">실시간 주문 현황</h3>
              </div>
              <button
                onClick={onCloseOrdersModal}
                className="p-1.5 bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              {activeOrders.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <div className="text-3xl">📭</div>
                  <p className="text-xs text-neutral-500">진행 중인 주문이 없습니다.</p>
                </div>
              ) : (
                activeOrders.map((order) => {
                  const getStatusBadge = () => {
                    switch (order.status) {
                      case 'pending':
                        return (
                          <span className="flex items-center gap-1 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded font-bold animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                            <span>접수 대기 중</span>
                          </span>
                        );
                      case 'preparing':
                        return (
                          <span className="flex items-center gap-1 text-xs bg-amber-500 text-black px-2.5 py-1 rounded font-bold">
                            <Flame className="w-3.5 h-3.5 animate-bounce" />
                            <span>조리 중</span>
                          </span>
                        );
                      case 'completed':
                        return (
                          <span className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>배달 완료</span>
                          </span>
                        );
                      case 'canceled':
                        return (
                          <span className="flex items-center gap-1 text-xs bg-neutral-800 text-neutral-400 px-2.5 py-1 rounded font-bold">
                            <XCircle className="w-3.5 h-3.5 text-red-500" />
                            <span>주문 취소/거절</span>
                          </span>
                        );
                    }
                  };

                  return (
                    <div
                      key={order.id}
                      className="bg-[#111] border border-neutral-800 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                        <div>
                          <span className="text-xs font-mono font-bold text-amber-400">
                            주문 #{order.orderNumber}
                          </span>
                          <span className="text-[11px] text-neutral-500 ml-2">
                            {new Date(order.createdAt).toLocaleTimeString('ko-KR')}
                          </span>
                        </div>
                        {getStatusBadge()}
                      </div>

                      <div className="space-y-1.5">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-xs text-neutral-300">
                            <span>
                              {item.menuItem.name} x {item.quantity}
                            </span>
                            <span className="font-mono text-amber-400 font-bold">₩{item.totalPrice.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      {order.requestNote && (
                        <div className="text-xs bg-neutral-900 p-2 rounded text-neutral-400 border border-neutral-800">
                          요청사항: {order.requestNote}
                        </div>
                      )}

                      <div className="pt-2 border-t border-neutral-800 flex justify-between items-center text-sm font-bold">
                        <span className="text-neutral-500 uppercase tracking-widest text-xs">Total</span>
                        <span className="text-amber-400 font-mono text-lg">
                          ₩{order.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  BellRing,
  Volume2,
  VolumeX,
  Mic,
  Monitor,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Plus,
  Trash2,
  Settings,
  BarChart3,
  Layers,
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Order, OrderStatus, StoreConfig, MenuItem } from '../types';

interface AdminViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onClearAllOrders: () => void;
  storeConfig: StoreConfig;
  onUpdateConfig: (updated: Partial<StoreConfig>) => void;
  menuItems: MenuItem[];
  onToggleOutOfStock: (itemId: string, currentStatus: boolean) => void;
  onDeleteMenuItem: (itemId: string) => void;
  onOpenAddMenuModal: () => void;
  onOpenWebhookModal: () => void;
  onTestSound: () => void;
  sseConnected: boolean;
}

export const AdminView: React.FC<AdminViewProps> = ({
  orders,
  onUpdateOrderStatus,
  onClearAllOrders,
  storeConfig,
  onUpdateConfig,
  menuItems,
  onToggleOutOfStock,
  onDeleteMenuItem,
  onOpenAddMenuModal,
  onOpenWebhookModal,
  onTestSound,
  sseConnected,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'seats' | 'stats' | 'menu' | 'config'>(
    'orders'
  );
  const [seatFilter, setSeatFilter] = useState('');

  // Order Counts
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const canceledOrders = orders.filter((o) => o.status === 'canceled');

  const totalSalesToday = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Filter orders by seat search
  const filteredOrders = orders.filter((o) => {
    if (!seatFilter) return true;
    return o.seatNumber.toString().includes(seatFilter);
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 pb-20">
      {/* Top Notification Control Bar */}
      <div className="bg-[#0d0d0d] border-b border-neutral-800 p-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Connection & Pending Alarm Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#111] px-3 py-1.5 rounded-lg border border-neutral-800 text-xs">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  sseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                }`}
              />
              <span className="font-medium text-neutral-300">
                {sseConnected ? '실시간 연동 중 (SSE)' : '연결 중...'}
              </span>
            </div>

            {pendingOrders.length > 0 && (
              <div className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg animate-bounce">
                <BellRing className="w-4 h-4" />
                <span>신규 미접수 주문 {pendingOrders.length}건!</span>
              </div>
            )}
          </div>

          {/* Quick Alarm Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Sound Alarm Toggle */}
            <button
              onClick={() => onUpdateConfig({ soundEnabled: !storeConfig.soundEnabled })}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                storeConfig.soundEnabled
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-[#111] text-neutral-500 border-neutral-800'
              }`}
            >
              {storeConfig.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-amber-400" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
              <span>소리 알림 {storeConfig.soundEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {/* Voice TTS Toggle */}
            <button
              onClick={() => onUpdateConfig({ ttsEnabled: !storeConfig.ttsEnabled })}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                storeConfig.ttsEnabled
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-[#111] text-neutral-500 border-neutral-800'
              }`}
            >
              <Mic className="w-4 h-4 text-amber-400" />
              <span>음성 읽어주기 {storeConfig.ttsEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {/* Sound Test Button */}
            <button
              onClick={onTestSound}
              className="bg-[#111] hover:bg-neutral-800 text-amber-400 border border-neutral-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            >
              🔊 알림음 시연
            </button>

            {/* External Webhook Settings Button */}
            <button
              onClick={onOpenWebhookModal}
              className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>디스코드/스마트폰 알림 연동</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Container */}
      <div className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
              activeTab === 'orders'
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold'
                : 'bg-[#0d0d0d] border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <BellRing className="w-4 h-4" />
            <span>실시간 주문 수신함</span>
            {pendingOrders.length > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {pendingOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('seats')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
              activeTab === 'seats'
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold'
                : 'bg-[#0d0d0d] border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>PC 좌석별 현황</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
              activeTab === 'stats'
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold'
                : 'bg-[#0d0d0d] border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>매출 & 통계</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
              activeTab === 'menu'
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold'
                : 'bg-[#0d0d0d] border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>메뉴 & 품절 관리</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
              activeTab === 'config'
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold'
                : 'bg-[#0d0d0d] border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>매장 설정 & 이벤트</span>
          </button>
        </div>

        {/* TAB 1: Live Orders Kanban */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Filter & Clear Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0d0d0d] p-4 rounded-xl border border-neutral-800">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="PC 좌석 번호 검색 (예: 5)"
                  value={seatFilter}
                  onChange={(e) => setSeatFilter(e.target.value)}
                  className="w-full bg-[#111] border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <div className="text-xs text-neutral-500 font-bold">
                  총 주문: <span className="font-bold text-white">{orders.length}건</span> |
                  오늘 매출: <span className="font-bold text-amber-400">₩{totalSalesToday.toLocaleString()}</span>
                </div>
                <button
                  onClick={onClearAllOrders}
                  className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-red-400 font-bold px-3 py-2 rounded-lg transition flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>내역 초기화</span>
                </button>
              </div>
            </div>

            {/* Orders Kanban Grid Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1: Pending Orders (미접수 주문) */}
              <div className="bg-[#0d0d0d] border border-neutral-800 rounded-xl p-4 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                    <h3 className="font-bold text-xs uppercase tracking-widest text-red-400">
                      신규 미접수 주문 ({pendingOrders.length})
                    </h3>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-semibold">알림 발생 중</span>
                </div>

                <div className="space-y-3">
                  {pendingOrders.length === 0 ? (
                    <div className="text-center py-12 text-neutral-600 text-xs font-semibold">
                      대기 중인 신규 주문이 없습니다.
                    </div>
                  ) : (
                    pendingOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-[#111] border border-red-500/50 rounded-lg p-4 space-y-3 shadow-lg animate-fade-in"
                      >
                        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-amber-500 text-black font-bold text-xs px-2.5 py-1 rounded">
                              {order.seatNumber}번 PC
                            </span>
                            <span className="text-xs text-neutral-500 font-mono font-bold">
                              #{order.orderNumber}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-500">
                            {new Date(order.createdAt).toLocaleTimeString('ko-KR')}
                          </span>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-1.5 py-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="text-xs text-neutral-200">
                              <div className="flex justify-between font-medium">
                                <span>
                                  {item.menuItem.name} x {item.quantity}
                                </span>
                                <span className="font-mono text-amber-400 font-bold">₩{item.totalPrice.toLocaleString()}</span>
                              </div>
                              {item.selectedOptions.length > 0 && (
                                <div className="text-[11px] text-neutral-500 pl-2">
                                  - {item.selectedOptions.map((o) => o.choiceName).join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {order.requestNote && (
                          <div className="bg-neutral-900 border border-neutral-800 p-2 rounded text-xs text-amber-400/80">
                            요청: {order.requestNote}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                          <div className="text-sm font-mono font-bold text-amber-400">
                            ₩{order.totalAmount.toLocaleString()}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'canceled')}
                              className="bg-neutral-800 hover:bg-neutral-700 text-red-400 text-xs font-bold px-2.5 py-2 rounded-lg transition"
                            >
                              거절
                            </button>
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow transition flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>접수 (조리시작)</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Column 2: Preparing Orders (조리 중) */}
              <div className="bg-[#0d0d0d] border border-neutral-800 rounded-xl p-4 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-500 animate-bounce" />
                    <h3 className="font-bold text-xs uppercase tracking-widest text-amber-400">
                      조리 중 ({preparingOrders.length})
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  {preparingOrders.length === 0 ? (
                    <div className="text-center py-12 text-neutral-600 text-xs font-semibold">
                      현재 조리 중인 메뉴가 없습니다.
                    </div>
                  ) : (
                    preparingOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-[#111] border border-amber-500/30 rounded-lg p-4 space-y-3 shadow"
                      >
                        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-xs px-2.5 py-1 rounded">
                            {order.seatNumber}번 PC (조리 중)
                          </span>
                          <span className="text-[11px] text-neutral-500 font-mono">
                            #{order.orderNumber}
                          </span>
                        </div>

                        <div className="space-y-1 py-1 text-xs text-neutral-300">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>
                                {item.menuItem.name} x {item.quantity}
                              </span>
                              <span className="font-mono text-amber-400 font-bold">
                                ₩{item.totalPrice.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                          <div className="text-xs font-mono font-bold text-neutral-400">
                            ₩{order.totalAmount.toLocaleString()}
                          </div>
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'completed')}
                            className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-4 py-2 rounded-lg shadow transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>배달 완료</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Column 3: Completed Orders (완료 내역) */}
              <div className="bg-[#0d0d0d] border border-neutral-800 rounded-xl p-4 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <h3 className="font-bold text-xs uppercase tracking-widest text-neutral-400">
                      최근 완료 내역 ({completedOrders.length})
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  {completedOrders.length === 0 ? (
                    <div className="text-center py-12 text-neutral-600 text-xs font-semibold">
                      완료된 주문이 없습니다.
                    </div>
                  ) : (
                    completedOrders.slice(0, 10).map((order) => (
                      <div
                        key={order.id}
                        className="bg-[#111] border border-neutral-800 rounded-lg p-3 space-y-2 opacity-80"
                      >
                        <div className="flex justify-between text-xs text-neutral-400 font-bold">
                          <span className="font-mono">SEAT #{order.seatNumber}</span>
                          <span className="text-emerald-400 font-mono font-bold">
                            ₩{order.totalAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate">
                          {order.items.map((i) => `${i.menuItem.name} x${i.quantity}`).join(', ')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PC Seat Matrix (01~30) */}
        {activeTab === 'seats' && (
          <div className="bg-[#0d0d0d] border border-neutral-800 rounded-xl p-6 space-y-4">
            <h3 className="font-serif italic text-lg text-white flex items-center gap-2">
              <Monitor className="w-5 h-5 text-amber-500" />
              <span>전체 PC 좌석 주문 모니터링 (01~30번)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((seat) => {
                const seatPending = orders.filter(
                  (o) => o.seatNumber === seat && o.status === 'pending'
                );
                const seatPreparing = orders.filter(
                  (o) => o.seatNumber === seat && o.status === 'preparing'
                );

                let statusBg = 'bg-[#111] border-neutral-800 text-neutral-400';
                if (seatPending.length > 0) {
                  statusBg = 'bg-red-950/80 border-2 border-red-500 text-red-300 animate-pulse';
                } else if (seatPreparing.length > 0) {
                  statusBg = 'bg-amber-500/10 border-2 border-amber-500 text-amber-300';
                }

                return (
                  <div
                    key={seat}
                    className={`p-3 rounded-lg border text-center transition-all ${statusBg}`}
                  >
                    <div className="font-mono font-bold text-sm">SEAT #{seat}</div>
                    <div className="text-[10px] mt-1 font-semibold">
                      {seatPending.length > 0 ? (
                        <span className="text-red-400">미접수 {seatPending.length}</span>
                      ) : seatPreparing.length > 0 ? (
                        <span className="text-amber-400">조리 중</span>
                      ) : (
                        <span className="text-neutral-600">대기</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: Sales Stats */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0d0d0d] border border-neutral-800 rounded-xl p-6 space-y-1">
                <div className="text-xs uppercase tracking-widest text-neutral-500 font-bold">TODAY REVENUE</div>
                <div className="text-3xl font-serif italic text-white">
                  ₩ {totalSalesToday.toLocaleString()}
                </div>
              </div>

              <div className="bg-[#0d0d0d] border border-neutral-800 rounded-xl p-6 space-y-1">
                <div className="text-xs uppercase tracking-widest text-neutral-500 font-bold">TOTAL ORDERS</div>
                <div className="text-3xl font-serif italic text-white">{orders.length}건</div>
              </div>

              <div className="bg-[#0d0d0d] border border-neutral-800 rounded-xl p-6 space-y-1">
                <div className="text-xs uppercase tracking-widest text-neutral-500 font-bold">COMPLETED</div>
                <div className="text-3xl font-serif italic text-emerald-400">
                  {completedOrders.length}건
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Menu & Stock Manager */}
        {activeTab === 'menu' && (
          <div className="bg-[#0d0d0d] border border-neutral-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-lg text-white">메뉴 목록 & 품절 관리</h3>
              <button
                onClick={onOpenAddMenuModal}
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>새 메뉴 추가</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#111] border border-neutral-800 rounded-lg p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl bg-neutral-900 p-2 rounded border border-neutral-800">
                      {item.imageEmoji}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-white">{item.name}</div>
                      <div className="text-xs font-mono text-amber-400 font-bold">
                        ₩{item.price.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleOutOfStock(item.id, !!item.isOutOfStock)}
                      className={`text-xs font-bold px-3 py-1.5 rounded border transition ${
                        item.isOutOfStock
                          ? 'bg-red-600/20 text-red-400 border-red-600/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {item.isOutOfStock ? '품절 중' : '판매 중'}
                    </button>

                    <button
                      onClick={() => onDeleteMenuItem(item.id)}
                      className="p-1.5 text-neutral-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Store Banner & Config */}
        {activeTab === 'config' && (
          <div className="bg-[#0d0d0d] border border-neutral-800 rounded-xl p-6 space-y-6 max-w-2xl">
            <h3 className="font-serif italic text-lg text-white">매장 설정 & 이벤트 공지</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-neutral-500 font-bold block mb-1">매장명</label>
                <input
                  type="text"
                  value={storeConfig.storeName}
                  onChange={(e) => onUpdateConfig({ storeName: e.target.value })}
                  className="w-full bg-[#111] border border-neutral-800 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-neutral-500 font-bold block mb-1">
                  상단 배너 공지 문구
                </label>
                <input
                  type="text"
                  value={storeConfig.noticeBanner}
                  onChange={(e) => onUpdateConfig({ noticeBanner: e.target.value })}
                  className="w-full bg-[#111] border border-neutral-800 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 border-t border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">이벤트 초대의 글 활성화</div>
                    <div className="text-[11px] text-neutral-500">
                      PDF 초대권 이미지 스타일의 이벤트 배너를 손님 메뉴판에 표시합니다.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={storeConfig.isEventActive}
                    onChange={(e) => onUpdateConfig({ isEventActive: e.target.checked })}
                    className="w-5 h-5 accent-amber-500"
                  />
                </div>

                {storeConfig.isEventActive && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-xs uppercase tracking-widest text-neutral-500 font-bold block mb-1">
                        이벤트 제목
                      </label>
                      <input
                        type="text"
                        value={storeConfig.eventTitle}
                        onChange={(e) => onUpdateConfig({ eventTitle: e.target.value })}
                        className="w-full bg-[#111] border border-neutral-800 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-widest text-neutral-500 font-bold block mb-1">
                        무료 혜택 / 이벤트 설명
                      </label>
                      <input
                        type="text"
                        value={storeConfig.eventDescription}
                        onChange={(e) => onUpdateConfig({ eventDescription: e.target.value })}
                        className="w-full bg-[#111] border border-neutral-800 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

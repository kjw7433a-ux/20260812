import React from 'react';
import { Store, Monitor, ShoppingBag, Sparkles, Volume2, ShieldCheck, Key, Bot } from 'lucide-react';
import { StoreConfig } from '../types';

interface HeaderBarProps {
  currentView: 'customer' | 'admin';
  onViewChange: (view: 'customer' | 'admin') => void;
  seatNumber: number;
  onOpenSeatModal: () => void;
  pendingOrderCount: number;
  storeConfig: StoreConfig;
  onTestSound: () => void;
  activeOrdersCount: number;
  onOpenCustomerOrders: () => void;
  onOpenAiKeyModal: () => void;
  onOpenAiRecommendModal: () => void;
  hasAiKey: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentView,
  onViewChange,
  seatNumber,
  onOpenSeatModal,
  pendingOrderCount,
  storeConfig,
  onTestSound,
  activeOrdersCount,
  onOpenCustomerOrders,
  onOpenAiKeyModal,
  onOpenAiRecommendModal,
  hasAiKey,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0d0d0d] border-b border-neutral-800 text-neutral-200 shadow-xl">
      {/* Top Banner Notice */}
      {storeConfig.noticeBanner && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-400 px-4 py-1.5 text-xs md:text-sm font-medium text-center flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>{storeConfig.noticeBanner}</span>
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-amber-200 rounded-full flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-amber-500/10 shrink-0">
            🐷
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif italic text-lg md:text-xl tracking-tight text-white font-bold">
                {storeConfig.storeName || '꽃돼지'} <span className="text-amber-500 not-italic font-sans text-sm md:text-base tracking-widest uppercase font-black">실시간 메뉴판</span>
              </h1>
              <span className="hidden sm:inline-block bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                프리미엄
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 hidden sm:block">
              프리미엄 좌석 실시간 다이닝 서비스
            </p>
          </div>
        </div>

        {/* Seat / View Switcher Actions */}
        <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-end">
          {/* AI Recommender Button */}
          <button
            onClick={onOpenAiRecommendModal}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 border border-amber-500/30 text-amber-300 text-xs px-3 py-2 rounded-lg font-bold transition shadow-sm"
            title="AI 메뉴 추천 받기"
          >
            <Bot className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">AI 메뉴 추천</span>
          </button>

          {/* AI Key Setting Button */}
          <button
            onClick={onOpenAiKeyModal}
            className={`flex items-center gap-1.5 border text-xs px-3 py-2 rounded-lg font-semibold transition relative ${
              hasAiKey
                ? 'bg-[#111] hover:bg-neutral-800 border-emerald-500/40 text-emerald-400'
                : 'bg-[#111] hover:bg-neutral-800 border-amber-500/40 text-amber-400'
            }`}
            title="AI 키 설정"
          >
            <Key className="w-3.5 h-3.5" />
            <span>AI 키 설정</span>
            <span
              className={`w-2 h-2 rounded-full ${
                hasAiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </button>

          {currentView === 'customer' ? (
            <>
              {/* Customer Seat Button */}
              <button
                onClick={onOpenSeatModal}
                className="flex items-center gap-2 bg-[#111] hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-neutral-200 text-xs md:text-sm px-3.5 py-2 rounded-lg font-medium transition-all"
              >
                <Monitor className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-amber-400">{seatNumber}번 PC</span>
                <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded font-bold uppercase">
                  변경
                </span>
              </button>

              {/* Customer My Orders button */}
              {activeOrdersCount > 0 && (
                <button
                  onClick={onOpenCustomerOrders}
                  className="relative flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs md:text-sm px-3.5 py-2 rounded-lg font-bold transition-all shadow-lg shadow-amber-500/10 animate-pulse"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden sm:inline">내 주문현황</span>
                  <span className="bg-black text-amber-400 px-1.5 py-0.2 rounded-full text-xs font-black">
                    {activeOrdersCount}
                  </span>
                </button>
              )}
            </>
          ) : (
            <>
              {/* Admin Quick Sound Test */}
              <button
                onClick={onTestSound}
                className="hidden sm:flex items-center gap-1.5 bg-[#111] hover:bg-neutral-800 border border-neutral-800 text-amber-400 text-xs px-3 py-2 rounded-lg font-semibold transition"
                title="알림음 테스트"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                <span>소리 테스트</span>
              </button>
            </>
          )}

          {/* Mode Selector Toggle */}
          <div className="flex bg-[#111] p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => onViewChange('customer')}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                currentView === 'customer'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>손님 메뉴판</span>
            </button>

            <button
              onClick={() => onViewChange('admin')}
              className={`relative flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                currentView === 'admin'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>사장님 관제탑</span>
              {pendingOrderCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow">
                  {pendingOrderCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};


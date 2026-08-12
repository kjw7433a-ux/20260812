import React, { useState } from 'react';
import { Monitor, Check, X } from 'lucide-react';

interface SeatSelectionModalProps {
  currentSeat: number;
  onSelectSeat: (seatNumber: number) => void;
  onClose: () => void;
}

export const SeatSelectionModal: React.FC<SeatSelectionModalProps> = ({
  currentSeat,
  onSelectSeat,
  onClose,
}) => {
  const [selected, setSelected] = useState<number>(currentSeat);
  const seats = Array.from({ length: 40 }, (_, i) => i + 1);

  const handleConfirm = () => {
    onSelectSeat(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0d0d0d] border border-neutral-800 rounded-xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 bg-[#0d0d0d] border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-amber-500" />
            <h3 className="font-serif italic text-lg text-white">PC 좌석 번호 선택</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          <p className="text-xs text-neutral-400">
            주문하신 음식을 전달받을 PC 좌석 번호를 선택해주세요.
          </p>

          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-2.5">
            {seats.map((seat) => {
              const isCurrent = selected === seat;
              return (
                <button
                  key={seat}
                  type="button"
                  onClick={() => setSelected(seat)}
                  className={`p-3 rounded-lg border text-center font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                    isCurrent
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500 shadow-lg shadow-amber-500/10'
                      : 'bg-[#111] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <Monitor className="w-4 h-4 opacity-70" />
                  <span className="text-xs">{seat}번 PC</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5 border-t border-neutral-800 flex items-center justify-between gap-4">
          <div className="text-xs text-neutral-400 font-bold">
            선택된 좌석:{' '}
            <span className="text-amber-400 font-bold text-sm">{selected}번 PC</span>
          </div>

          <button
            onClick={handleConfirm}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-6 py-3 rounded-lg shadow-lg shadow-amber-500/10 flex items-center gap-2 transition"
          >
            <Check className="w-4 h-4" />
            <span>좌석 설정 완료</span>
          </button>
        </div>
      </div>
    </div>
  );
};

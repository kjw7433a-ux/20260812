import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Check } from 'lucide-react';
import { MenuItem, CartItemOptionSelection } from '../types';

interface MenuItemDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem,
    selectedOptions: CartItemOptionSelection[],
    quantity: number,
    itemNote: string
  ) => void;
}

export const MenuItemDetailModal: React.FC<MenuItemDetailModalProps> = ({
  item,
  onClose,
  onAddToCart,
}) => {
  if (!item) return null;

  // Track selected choices for required and optional groups
  const [selectedChoices, setSelectedChoices] = useState<{ [optionId: string]: string }>(() => {
    const initial: { [optionId: string]: string } = {};
    if (item.options) {
      item.options.forEach((opt) => {
        if (opt.required && opt.choices.length > 0) {
          initial[opt.id] = opt.choices[0].name;
        }
      });
    }
    return initial;
  });

  const [quantity, setQuantity] = useState(1);
  const [itemNote, setItemNote] = useState('');

  const handleToggleOption = (optionId: string, choiceName: string, isRequired: boolean) => {
    setSelectedChoices((prev) => {
      if (isRequired) {
        return { ...prev, [optionId]: choiceName };
      } else {
        // Toggle optional choice
        if (prev[optionId] === choiceName) {
          const updated = { ...prev };
          delete updated[optionId];
          return updated;
        } else {
          return { ...prev, [optionId]: choiceName };
        }
      }
    });
  };

  // Calculate total price for single item based on options
  const calculateUnitPrice = (): number => {
    let base = item.price;
    if (item.options) {
      item.options.forEach((opt) => {
        const selectedName = selectedChoices[opt.id];
        if (selectedName) {
          const choiceObj = opt.choices.find((c) => c.name === selectedName);
          if (choiceObj) {
            base += choiceObj.price;
          }
        }
      });
    }
    return base;
  };

  const unitPrice = calculateUnitPrice();
  const totalPrice = unitPrice * quantity;

  // Build list of CartItemOptionSelection
  const buildSelectionsList = (): CartItemOptionSelection[] => {
    const result: CartItemOptionSelection[] = [];
    if (item.options) {
      item.options.forEach((opt) => {
        const selectedName = selectedChoices[opt.id];
        if (selectedName) {
          const choiceObj = opt.choices.find((c) => c.name === selectedName);
          result.push({
            optionTitle: opt.title,
            choiceName: selectedName,
            price: choiceObj ? choiceObj.price : 0,
          });
        }
      });
    }
    return result;
  };

  const handleConfirm = () => {
    // Validate required options
    if (item.options) {
      for (const opt of item.options) {
        if (opt.required && !selectedChoices[opt.id]) {
          alert(`'${opt.title}' 옵션을 선택해주세요.`);
          return;
        }
      }
    }

    onAddToCart(item, buildSelectionsList(), quantity, itemNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0d0d0d] border border-neutral-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="relative bg-[#0d0d0d] p-6 border-b border-neutral-800 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-4xl shadow-inner shrink-0">
              {item.imageEmoji}
            </div>
            <div>
              {item.badge && (
                <span className="inline-block bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-1">
                  {item.badge}
                </span>
              )}
              <h3 className="text-xl font-serif italic text-white">{item.name}</h3>
              <p className="text-xs text-neutral-500 mt-1">{item.description}</p>
              <div className="text-lg font-mono font-bold text-amber-400 mt-2">
                ₩ {item.price.toLocaleString()}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Options */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {item.options && item.options.length > 0 ? (
            item.options.map((option) => (
              <div key={option.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-1.5">
                    <span>{option.title}</span>
                    {option.required ? (
                      <span className="text-[10px] bg-red-600/20 text-red-400 px-1.5 py-0.5 rounded font-semibold">
                        필수
                      </span>
                    ) : (
                      <span className="text-[10px] bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded">
                        선택
                      </span>
                    )}
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {option.choices.map((choice) => {
                    const isSelected = selectedChoices[option.id] === choice.name;
                    return (
                      <button
                        key={choice.name}
                        type="button"
                        onClick={() =>
                          handleToggleOption(option.id, choice.name, option.required)
                        }
                        className={`flex items-center justify-between p-3.5 rounded-lg border text-sm transition-all ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-white font-bold'
                            : 'bg-[#111] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                              isSelected
                                ? 'bg-amber-500 border-amber-400 text-black'
                                : 'border-neutral-700 bg-neutral-900'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{choice.name}</span>
                        </div>
                        <span className="text-xs font-mono text-neutral-400">
                          {choice.price > 0 ? `+₩${choice.price.toLocaleString()}` : '무료'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-neutral-500 text-center py-2">
              기본 제공 옵션으로 주문됩니다.
            </p>
          )}

          {/* Request Note */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <label className="text-xs font-bold text-neutral-400">
              특별 요청사항
            </label>
            <input
              type="text"
              placeholder="예: 단무지 많이 주세요, 수저 챙겨주세요"
              value={itemNote}
              onChange={(e) => setItemNote(e.target.value)}
              className="w-full bg-[#111] border border-neutral-800 rounded-lg px-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between bg-[#111] p-4 rounded-lg border border-neutral-800">
            <span className="text-xs font-bold text-neutral-400">수량</span>
            <div className="flex items-center gap-3 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 rounded hover:bg-neutral-800 text-neutral-300 transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-mono font-bold text-white w-6 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 rounded hover:bg-neutral-800 text-neutral-300 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-neutral-800 flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold text-neutral-500">총 결제 금액</div>
            <div className="text-2xl font-serif italic text-white">
              ₩ {totalPrice.toLocaleString()}
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="flex-1 max-w-xs bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm py-3.5 px-6 rounded-lg shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>장바구니 담기</span>
          </button>
        </div>
      </div>
    </div>
  );
};

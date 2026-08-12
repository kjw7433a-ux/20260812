import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { MenuItem, MenuCategory } from '../types';

interface AddMenuModalProps {
  onAddMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  onClose: () => void;
}

export const AddMenuModal: React.FC<AddMenuModalProps> = ({ onAddMenuItem, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(4000);
  const [category, setCategory] = useState<MenuCategory>('noodles');
  const [imageEmoji, setImageEmoji] = useState('🍜');
  const [badge, setBadge] = useState('');

  const emojiList = ['🍜', '🌶️', '🥟', '🍝', '🍢', '🧀', '🔥', '🥤', '🥛', '🍦', '🍚', '🍳', '☕', '🌭', '🍗', '🍔', '🍟', '🍕', '🧃'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('메뉴 이름을 입력해주세요.');
      return;
    }

    const categoryNames: { [key in MenuCategory]: string } = {
      all: '전체',
      noodles: '면류 & 분식',
      potato: "꽃돼지's 시그니처 감자",
      drinks: '추억의 음료 & 디저트',
      rice: '밥류 & 덮밥',
      snack: '스낵 & 음료',
    };

    onAddMenuItem({
      name,
      description,
      price: Number(price),
      category,
      categoryName: categoryNames[category],
      imageEmoji,
      badge: badge || undefined,
      isPopular: false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0d0d0d] border border-neutral-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 bg-[#0d0d0d] border-b border-neutral-800 flex items-center justify-between">
          <h3 className="font-serif italic text-lg text-white">신규 메뉴 추가</h3>
          <button onClick={onClose} className="p-1.5 bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          <div>
            <label className="text-xs font-bold text-neutral-400 block mb-1">메뉴 아이콘</label>
            <div className="flex flex-wrap gap-2 bg-[#111] p-2.5 rounded-lg border border-neutral-800">
              {emojiList.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setImageEmoji(e)}
                  className={`p-2 text-xl rounded transition ${
                    imageEmoji === e ? 'bg-amber-500 text-black shadow' : 'bg-neutral-900 hover:bg-neutral-800'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-400 block mb-1">메뉴명 *</label>
            <input
              type="text"
              placeholder="예: 얼큰 차돌 라면"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#111] border border-neutral-800 rounded-lg px-4 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-400 block mb-1">카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MenuCategory)}
              className="w-full bg-[#111] border border-neutral-800 rounded-lg px-4 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
            >
              <option value="noodles">면류 & 분식</option>
              <option value="potato">꽃돼지's 시그니처 감자</option>
              <option value="drinks">추억의 음료 & 디저트</option>
              <option value="rice">밥류 & 덮밥</option>
              <option value="snack">스낵 & 음료</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-400 block mb-1">가격 (원) *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full bg-[#111] border border-neutral-800 rounded-lg px-4 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-400 block mb-1">메뉴 설명</label>
            <input
              type="text"
              placeholder="예: 깊고 진한 차돌박이 육수 라면"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#111] border border-neutral-800 rounded-lg px-4 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-400 block mb-1">배지 문구 (선택)</label>
            <input
              type="text"
              placeholder="예: 최고 인기 👍, 매콤 🌶️"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="w-full bg-[#111] border border-neutral-800 rounded-lg px-4 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-4 border-t border-neutral-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold px-4 py-2.5 rounded-lg transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-5 py-2.5 rounded-lg shadow-lg shadow-amber-500/10 transition"
            >
              메뉴 추가하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

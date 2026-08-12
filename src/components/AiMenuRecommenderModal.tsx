import React, { useState } from 'react';
import { Sparkles, Bot, Key, ExternalLink, Send, ShoppingBag, Loader2, AlertCircle, X } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { MenuItem } from '../types';

interface AiMenuRecommenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onOpenKeyModal: () => void;
  menuItems: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
}

export const AiMenuRecommenderModal: React.FC<AiMenuRecommenderModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onOpenKeyModal,
  menuItems,
  onSelectItem,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePresetClick = (presetText: string) => {
    setPromptInput(presetText);
    runGeminiRecommendation(presetText);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    runGeminiRecommendation(promptInput);
  };

  const runGeminiRecommendation = async (userPrompt: string) => {
    if (!apiKey) {
      setErrorMsg('AI 키를 먼저 넣어 주세요.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setAiResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const menuSummary = menuItems.map((m) => ({
        name: m.name,
        price: `${m.price}원`,
        category: m.categoryName,
        desc: m.description,
        badge: m.badge || '없음',
      }));

      const systemPrompt = `당신은 '꽃돼지 PC방'의 친절하고 센스 있는 AI 맛집 큐레이터입니다.
아래는 현재 판매 중인 메뉴 목록입니다:
${JSON.stringify(menuSummary, null, 2)}

손님의 요청: "${userPrompt}"

안내 지침:
1. 손님의 기분이나 요청에 어울리는 추천 메뉴 조합(2~3개)을 제시해 주세요.
2. 각 메뉴의 특징과 함께 왜 이 조합이 추천되는지 유쾌하고 다정하게 설명해 주세요.
3. 추천된 메뉴 조합의 총 금액 합계도 함께 계산해 주세요.
4. 이모지와 읽기 쉬운 단락 구분을 사용하여 정성스럽게 답변해 주세요.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: systemPrompt,
      });

      const text = response.text;
      if (text) {
        setAiResult(text);
      } else {
        setErrorMsg('AI 응답 생성 실패: 결과를 가져오지 못했습니다.');
      }
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      setErrorMsg(
        `Gemini API 호출 오류: ${err.message || 'API 키가 올바른지 확인해 주세요.'}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0d0d0d] border border-neutral-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-[#0d0d0d] border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            <h3 className="font-serif italic text-lg text-white">Gemini AI 실시간 메뉴 큐레이션</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Missing Key Warning */}
          {!apiKey ? (
            <div className="bg-amber-950/30 border border-amber-500/40 p-5 rounded-xl space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-300 text-base">
                    AI 키를 먼저 넣어 주세요
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Gemini AI 메뉴 추천 서비스를 이용하시려면 API 키 설정이 필요합니다.
                    무료 API 키를 발급받아 등록하시면 맞춤 메뉴 추천 서비스를 받으실 수 있습니다.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-amber-500/20">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-black text-amber-400 border border-amber-500/30 px-3.5 py-2 rounded-lg text-xs font-bold transition"
                >
                  <span>Google AI Studio 키 발급 페이지 바로가기</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => {
                    onClose();
                    onOpenKeyModal();
                  }}
                  className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-lg text-xs font-bold transition shadow"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>AI 키 설정하기</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 block">
                  💡 인기 추천 키워드로 빠르게 질문하기
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handlePresetClick('🌶️ 얼큰하고 매콤한 야식 조합 추천해줘!')}
                    className="bg-[#111] hover:bg-neutral-800 border border-neutral-800 text-amber-400 text-xs px-3 py-1.5 rounded-lg transition"
                  >
                    🌶️ 매콤 칼칼 야식 세트
                  </button>
                  <button
                    onClick={() => handlePresetClick('🥤 달달하고 시원한 음료랑 디저트 추천해줘!')}
                    className="bg-[#111] hover:bg-neutral-800 border border-neutral-800 text-amber-400 text-xs px-3 py-1.5 rounded-lg transition"
                  >
                    🥤 달달 시원 음료 세트
                  </button>
                  <button
                    onClick={() => handlePresetClick('⭐ 꽃돼지 PC방 대표 시그니처 꿀조합 알려줘!')}
                    className="bg-[#111] hover:bg-neutral-800 border border-neutral-800 text-amber-400 text-xs px-3 py-1.5 rounded-lg transition"
                  >
                    ⭐ 시그니처 꿀조합
                  </button>
                  <button
                    onClick={() => handlePresetClick('⚡ 밤샘 게임용 가성비 안졸리는 메뉴 세트')}
                    className="bg-[#111] hover:bg-neutral-800 border border-neutral-800 text-amber-400 text-xs px-3 py-1.5 rounded-lg transition"
                  >
                    ⚡ 밤샘 랭크전 세트
                  </button>
                </div>
              </div>

              {/* Prompt Input */}
              <form onSubmit={handleFormSubmit} className="space-y-3">
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="예: 지금 라면이 땡기는데 같이 먹으면 최고인 사이드 메뉴랑 음료 추천해줘!"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    className="w-full bg-[#111] border border-neutral-800 rounded-lg p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={loading || !promptInput.trim()}
                    className="absolute bottom-3 right-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>생성 중...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>AI 추천받기</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Error Message */}
              {errorMsg && (
                <div className="bg-red-950/40 border border-red-500/30 p-3.5 rounded-lg text-xs text-red-400 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenKeyModal();
                    }}
                    className="text-amber-400 underline font-bold text-xs shrink-0"
                  >
                    키 변경
                  </button>
                </div>
              )}

              {/* AI Result Box */}
              {aiResult && (
                <div className="bg-[#111] border border-amber-500/30 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                    <Bot className="w-5 h-5 text-amber-500" />
                    <h4 className="font-bold text-amber-400 text-sm">
                      AI 맛집 매니저의 추천 레시피
                    </h4>
                  </div>

                  <div className="text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap font-sans">
                    {aiResult}
                  </div>

                  {/* Menu Quick Select Shortcuts */}
                  <div className="pt-3 border-t border-neutral-800">
                    <p className="text-[11px] text-neutral-400 font-bold mb-2">
                      👇 추천 메뉴 바로 담기:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {menuItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            onSelectItem(item);
                            onClose();
                          }}
                          className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 hover:text-white px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition"
                        >
                          <span>{item.imageEmoji}</span>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-amber-400 text-[11px]">
                            ₩{item.price.toLocaleString()}
                          </span>
                          <ShoppingBag className="w-3 h-3 text-neutral-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

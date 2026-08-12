import React, { useState, useEffect } from 'react';
import { Key, ExternalLink, Trash2, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';

interface AiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveKey: (key: string) => void;
  onDeleteKey: () => void;
}

export const AiKeyModal: React.FC<AiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveKey,
  onDeleteKey,
}) => {
  const [inputKey, setInputKey] = useState('');
  const [noticeMessage, setNoticeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setInputKey(apiKey);
    setNoticeMessage(null);
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputKey.trim();
    if (!trimmed) {
      setNoticeMessage({ type: 'error', text: 'API 키를 입력해 주세요.' });
      return;
    }

    onSaveKey(trimmed);
    setNoticeMessage({ type: 'success', text: 'AI 키가 성공적으로 저장되었습니다! (브라우저 내부에만 안전하게 보관됩니다)' });
  };

  const handleDelete = () => {
    if (window.confirm('저장된 AI 키를 정말 삭제하시겠습니까?')) {
      onDeleteKey();
      setInputKey('');
      setNoticeMessage({ type: 'success', text: 'AI 키가 삭제되었습니다.' });
    }
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return `${key.substring(0, 6)}••••••••${key.substring(key.length - 4)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0d0d0d] border border-neutral-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-5 bg-[#0d0d0d] border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-500" />
            <h3 className="font-serif italic text-lg text-white">AI 키 설정 (Gemini API)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Key Status Indicator */}
          <div
            className={`p-3.5 rounded-lg border flex items-center justify-between text-xs ${
              apiKey
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-950/30 border-amber-500/30 text-amber-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {apiKey ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span className="font-bold">
                {apiKey ? 'AI 키 등록 완료' : 'AI 키 미등록 (설정 필요)'}
              </span>
            </div>
            {apiKey && (
              <span className="font-mono text-[11px] bg-emerald-900/50 px-2 py-0.5 rounded text-emerald-300">
                {maskKey(apiKey)}
              </span>
            )}
          </div>

          {!apiKey && (
            <div className="bg-neutral-900/80 border border-neutral-800 p-3.5 rounded-lg text-xs text-neutral-300 space-y-2">
              <p className="font-bold text-amber-400">⚠️ AI 키를 먼저 넣어 주세요</p>
              <p className="text-neutral-400 leading-relaxed">
                Google AI Studio에서 무료로 Gemini API 키를 발급받아 아래에 입력하시면, AI 메뉴 추천 및 스마트 조합 서비스를 이용하실 수 있습니다.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                Gemini API Key
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="w-full bg-[#111] border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            {/* Notice Message */}
            {noticeMessage && (
              <div
                className={`p-3 rounded-lg text-xs ${
                  noticeMessage.type === 'success'
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-950/40 text-red-400 border border-red-500/20'
                }`}
              >
                {noticeMessage.text}
              </div>
            )}

            {/* Security Guarantee Note */}
            <div className="flex items-start gap-2 bg-[#111] p-3 rounded-lg border border-neutral-800 text-[11px] text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                입력하신 API 키는 <strong>사용자 브라우저(localStorage)에만 안전하게 보관</strong>되며 외부 서버로 전송되지 않습니다.
              </span>
            </div>

            {/* Get Key Link */}
            <div className="pt-1">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 transition"
              >
                <span>Google AI Studio에서 API 키 발급받기</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-3">
              {apiKey ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 text-xs px-3.5 py-2.5 rounded-lg font-bold transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>키 삭제</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
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
                  저장하기
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

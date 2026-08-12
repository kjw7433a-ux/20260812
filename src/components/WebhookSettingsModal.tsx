import React, { useState } from 'react';
import { Bell, Send, CheckCircle2, AlertCircle, ShieldAlert, Sparkles, X } from 'lucide-react';
import { StoreConfig, WebhookConfig } from '../types';

interface WebhookSettingsModalProps {
  storeConfig: StoreConfig;
  onSaveConfig: (updatedConfig: Partial<StoreConfig>) => void;
  onClose: () => void;
}

export const WebhookSettingsModal: React.FC<WebhookSettingsModalProps> = ({
  storeConfig,
  onSaveConfig,
  onClose,
}) => {
  const [webhook, setWebhook] = useState<WebhookConfig>(
    storeConfig.webhookConfig || { discordUrl: '', customUrl: '', enabled: false }
  );
  const [testStatus, setTestStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const handleTestWebhook = async (type: 'discord' | 'custom') => {
    const targetUrl = type === 'discord' ? webhook.discordUrl : webhook.customUrl;
    if (!targetUrl) {
      alert('테스트할 웹훅 URL을 입력해주세요.');
      return;
    }

    setTestStatus({ loading: true });
    try {
      const res = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, type }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestStatus({
          loading: false,
          success: true,
          message: '웹훅 테스트 발송 성공! 스마트폰/디스코드 채널을 확인하세요.',
        });
      } else {
        setTestStatus({
          loading: false,
          success: false,
          message: data.error || '웹훅 테스트 실패',
        });
      }
    } catch (err: any) {
      setTestStatus({
        loading: false,
        success: false,
        message: err.message || '웹훅 테스트 중 오류 발생',
      });
    }
  };

  const handleSave = () => {
    onSaveConfig({ webhookConfig: webhook });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0d0d0d] border border-neutral-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-[#0d0d0d] border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <h3 className="font-serif italic text-lg text-white">외부 알림 연동 설정 (웹훅)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>스마트폰/디스코드 실시간 알림이란?</span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              카운터 PC 앞에 없어도 손님이 주문을 넣는 순간 사장님의 디스코드(Discord) 채널이나 모바일 앱으로 실시간 푸시 알림이 발송됩니다!
            </p>
          </div>

          {/* Enable Webhook Toggle */}
          <div className="flex items-center justify-between bg-[#111] p-4 rounded-lg border border-neutral-800">
            <div>
              <div className="text-sm font-medium text-white">외부 웹훅 알림 활성화</div>
              <div className="text-xs text-neutral-500">주문 생성 시 지정된 URL로 알림을 보냅니다.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={webhook.enabled}
                onChange={(e) => setWebhook({ ...webhook, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
            </label>
          </div>

          {/* Discord Webhook URL */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 flex items-center justify-between">
              <span>디스코드 웹훅 URL</span>
              <span className="text-[10px] text-amber-400 font-normal">추천</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://discord.com/api/webhooks/..."
                value={webhook.discordUrl}
                onChange={(e) => setWebhook({ ...webhook, discordUrl: e.target.value })}
                className="flex-1 bg-[#111] border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => handleTestWebhook('discord')}
                disabled={testStatus.loading}
                className="bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 text-xs font-bold px-3 py-2.5 rounded-lg transition shrink-0 flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>테스트</span>
              </button>
            </div>
            <p className="text-[10px] text-neutral-500">
              디스코드 채널 설정 &gt; 연동 &gt; 웹훅 만들기에서 생성된 URL을 입력하세요.
            </p>
          </div>

          {/* Custom Webhook URL */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <label className="text-xs font-bold text-neutral-400">
              커스텀 HTTP POST 웹훅 URL (선택)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://my-server.com/api/order-webhook"
                value={webhook.customUrl}
                onChange={(e) => setWebhook({ ...webhook, customUrl: e.target.value })}
                className="flex-1 bg-[#111] border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => handleTestWebhook('custom')}
                disabled={testStatus.loading}
                className="bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 text-xs font-bold px-3 py-2.5 rounded-lg transition shrink-0 flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>테스트</span>
              </button>
            </div>
          </div>

          {/* Test Status Banner */}
          {testStatus.message && (
            <div
              className={`p-3 rounded-lg text-xs font-bold flex items-center gap-2 ${
                testStatus.success
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {testStatus.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{testStatus.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-neutral-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold px-4 py-2.5 rounded-lg transition"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-5 py-2.5 rounded-lg shadow-lg shadow-amber-500/10 transition"
          >
            설정 저장
          </button>
        </div>
      </div>
    </div>
  );
};

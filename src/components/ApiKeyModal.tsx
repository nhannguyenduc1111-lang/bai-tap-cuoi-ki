import React, { useState } from 'react';
import { X, Key, CheckCircle, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveKey
}) => {
  const [inputVal, setInputVal] = useState(apiKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKey(inputVal.trim());
    onClose();
  };

  const handleTestKey = async () => {
    const keyToTest = inputVal.trim();
    if (!keyToTest) {
      setTestResult({ success: false, message: 'Vui lòng nhập API Key trước khi kiểm tra!' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keyToTest}`);
      if (res.ok) {
        setTestResult({ success: true, message: 'Kết nối thành công tới Gemini API! Khóa hoạt động tốt.' });
      } else {
        const err = await res.json().catch(() => ({}));
        setTestResult({
          success: false,
          message: `Lỗi kết nối (${res.status}): ${err?.error?.message || 'Khóa API không hợp lệ hoặc chưa được kích hoạt dịch vụ Generative Language.'}`
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Lỗi mạng: ${err?.message || 'Không thể kết nối đến Google API servers.'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cài đặt Gemini API Key</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Bảo mật cục bộ (LocalStorage) cho phân tích AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 text-sm">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-300 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold">Cam kết bảo mật tuyệt đối:</p>
              <p>Mã API Key chỉ được lưu trực tiếp trên trình duyệt của bạn (Local Storage) và gửi trực tiếp đến endpoint bảo mật của Google AI Studio. Không lưu trên bất kỳ máy chủ trung gian nào.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Google AI Studio API Key (AIzaSy...)
            </label>
            <input
              type="password"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Dán mã khóa AIzaSy... vào đây"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm font-mono"
            />
          </div>

          {/* Test connection output */}
          {testResult && (
            <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
              testResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}>
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="text-xs text-slate-500 dark:text-slate-400">
            * Nếu bạn chưa có API Key, có thể tạo miễn phí tại{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-gold-600 dark:text-gold-400 underline font-medium hover:text-gold-700"
            >
              Google AI Studio (Get API Key)
            </a>. Hệ thống cũng có sẵn chế độ AI Offline thông minh để phân tích ngay khi không có mạng.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleTestKey}
            disabled={isTesting || !inputVal.trim()}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            {isTesting ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-xs transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-700 hover:to-gold-600 text-white font-semibold text-xs shadow-md shadow-gold-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Lưu & Áp dụng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

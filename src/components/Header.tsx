import React from 'react';
import {
  Sun,
  Moon,
  Key,
  Zap,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock
} from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenApiKeyModal: () => void;
  hasApiKey: boolean;
  onLoadSampleData: () => void;
  onOpenAIAssistant: () => void;
  selectedMonth: string;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleDarkMode,
  onOpenApiKeyModal,
  hasApiKey,
  onLoadSampleData,
  onOpenAIAssistant,
  selectedMonth
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-forest-800 text-gold-400 flex items-center justify-center shadow-md shadow-forest-900/10">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
              HỆ THỐNG ĐIỀU HÀNH NHÂN SỰ & TIỀN LƯƠNG - CÔNG TY A
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20">
              SMART HRM v3.8
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dành cho Ban Giám đốc & Phòng Hành chính - Nhân sự • Kỳ điều hành: <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedMonth}</span>
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Breathing Load Sample Data Button */}
        <button
          onClick={onLoadSampleData}
          className="relative group px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-gold-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-2 overflow-hidden ring-2 ring-gold-400/50 ring-offset-2 dark:ring-offset-slate-900 animate-pulse hover:animate-none"
        >
          <Zap className="w-4 h-4 fill-white text-white group-hover:rotate-12 transition-transform" />
          <span>⚡ Nạp dữ liệu thử nghiệm (Load Sample Data)</span>
        </button>

        {/* AI Assistant Quick Chat Button */}
        <button
          onClick={onOpenAIAssistant}
          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <MessageSquare className="w-3.5 h-3.5 text-forest-800 dark:text-gold-400" />
          <span className="hidden md:inline">Trợ lý AI</span>
        </button>

        {/* API Key Modal Button with Status Badge */}
        <button
          onClick={onOpenApiKeyModal}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium flex items-center gap-2 transition-colors shadow-sm"
          title="Cài đặt Google Gemini API Key"
        >
          <Key className="w-3.5 h-3.5 text-gold-500" />
          <span className="hidden lg:inline text-slate-700 dark:text-slate-300">Cài đặt API Key</span>
          <span
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              hasApiKey
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${hasApiKey ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
            {hasApiKey ? 'Đã kết nối' : 'Chưa có Key'}
          </span>
        </button>

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
          title={isDarkMode ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};

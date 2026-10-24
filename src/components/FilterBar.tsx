import React, { useState } from 'react';
import { Search, Filter, Calendar, Users, X, Copy, Check } from 'lucide-react';
import { GlobalFilter, Department } from '../types';
import { copyToClipboard } from '../services/exportService';

interface FilterBarProps {
  filter: GlobalFilter;
  onFilterChange: (newFilter: Partial<GlobalFilter>) => void;
  departments: Department[];
  totalFilteredCount: number;
  totalCount: number;
  onCopyReport?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  departments,
  totalFilteredCount,
  totalCount,
  onCopyReport
}) => {
  const [copied, setCopied] = useState(false);

  const months = ['07/2026', '08/2026', '09/2026'];
  const statuses = ['Tất cả trạng thái', 'Đang làm việc', 'Thử việc', 'Sắp hết hạn'];

  const handleCopy = async () => {
    if (onCopyReport) {
      onCopyReport();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    onFilterChange({
      department: 'all',
      status: 'all',
      search: ''
    });
  };

  const hasActiveFilters = filter.department !== 'all' || filter.status !== 'all' || filter.search !== '';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Department & Month & Status Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200">
            <Users className="w-3.5 h-3.5 text-forest-800 dark:text-gold-400" />
            <select
              value={filter.department}
              onChange={(e) => onFilterChange({ department: e.target.value })}
              className="bg-transparent font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả 6 phòng ban</option>
              {departments.map((d) => (
                <option key={d.code} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200">
            <Calendar className="w-3.5 h-3.5 text-forest-800 dark:text-gold-400" />
            <select
              value={filter.month}
              onChange={(e) => onFilterChange({ month: e.target.value })}
              className="bg-transparent font-medium focus:outline-none cursor-pointer"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  Kỳ tháng: {m}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200">
            <Filter className="w-3.5 h-3.5 text-forest-800 dark:text-gold-400" />
            <select
              value={filter.status}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              className="bg-transparent font-medium focus:outline-none cursor-pointer"
            >
              {statuses.map((s) => (
                <option key={s} value={s === 'Tất cả trạng thái' ? 'all' : s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>

        {/* Right: Quick Search & Copy Report Button */}
        <div className="flex items-center gap-2.5 flex-1 sm:flex-initial justify-end">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filter.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="Tìm Mã NV, Họ tên, CCCD..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
            {filter.search && (
              <button
                onClick={() => onFilterChange({ search: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {onCopyReport && (
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
              title="Sao chép báo cáo tổng hợp nhanh vào bộ nhớ tạm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-gold-500" />}
              <span>{copied ? 'Đã sao chép!' : '📋 Sao chép nhanh báo cáo'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats counter badge */}
      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        <span>Đang hiển thị: <strong className="text-forest-800 dark:text-gold-400 font-bold">{totalFilteredCount}</strong> / {totalCount} nhân sự</span>
        {filter.department !== 'all' && <span>• Phòng ban: <strong>{filter.department}</strong></span>}
        {filter.status !== 'all' && <span>• Trạng thái: <strong>{filter.status}</strong></span>}
      </div>
    </div>
  );
};

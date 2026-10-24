import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  CalendarCheck,
  FileText,
  UserCheck,
  Check,
  X,
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { ActionItem, ActionItemSeverity, Employee, Contract, LeaveRecord } from '../types';
import { openGoogleCalendarReminder } from '../services/exportService';

interface ActionItemsTabProps {
  actionItems: ActionItem[];
  employees: Employee[];
  contracts: Contract[];
  leaves: LeaveRecord[];
  onApproveLeave: (leaveCode: string) => void;
  onRejectLeave: (leaveCode: string) => void;
  onApproveProbation: (employeeId: string) => void;
  onRenewContract: (employeeId: string) => void;
  onSelectEmployee: (emp: Employee) => void;
  onOpenProbationReview: (emp: Employee, contract: Contract | null) => void;
}

export const ActionItemsTab: React.FC<ActionItemsTabProps> = ({
  actionItems,
  employees,
  contracts,
  leaves,
  onApproveLeave,
  onRejectLeave,
  onApproveProbation,
  onRenewContract,
  onSelectEmployee,
  onOpenProbationReview
}) => {
  const [activeSeverity, setActiveSeverity] = useState<ActionItemSeverity | 'all'>('red');

  const redItems = actionItems.filter(i => i.severity === 'red');
  const yellowItems = actionItems.filter(i => i.severity === 'yellow');
  const greenItems = actionItems.filter(i => i.severity === 'green');

  const displayedItems =
    activeSeverity === 'all'
      ? actionItems
      : actionItems.filter(i => i.severity === activeSeverity);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Top Severity Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setActiveSeverity('red')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeSeverity === 'red'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20 scale-[1.02]'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/20'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
          <span>MÀU ĐỎ (KHẨN CẤP)</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px]">
            {redItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSeverity('yellow')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeSeverity === 'yellow'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-[1.02]'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/20'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>MÀU VÀNG (CHỜ XỬ LÝ)</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-950/15 text-[11px]">
            {yellowItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSeverity('green')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeSeverity === 'green'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-[1.02]'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>MÀU XANH (ỔN ĐỊNH)</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px]">
            {greenItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSeverity('all')}
          className={`px-4 py-2.5 rounded-2xl font-semibold text-xs flex items-center gap-2 transition-all ml-auto ${
            activeSeverity === 'all'
              ? 'bg-slate-800 text-white dark:bg-slate-700'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          <span>Tất cả ({actionItems.length})</span>
        </button>
      </div>

      {/* Action Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedItems.map((item) => {
          const emp = employees.find(e => e.id === item.employeeId);
          const contract = contracts.find(c => c.employeeId === item.employeeId);

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm transition-all flex flex-col justify-between ${
                item.severity === 'red'
                  ? 'border-rose-300 dark:border-rose-900/80 hover:border-rose-500 shadow-rose-500/5'
                  : item.severity === 'yellow'
                  ? 'border-amber-300 dark:border-amber-900/80 hover:border-amber-500 shadow-amber-500/5'
                  : 'border-emerald-300 dark:border-emerald-900/80 hover:border-emerald-500'
              }`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        item.severity === 'red'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : item.severity === 'yellow'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {item.severity === 'red'
                        ? 'Khẩn cấp'
                        : item.severity === 'yellow'
                        ? 'Chờ duyệt'
                        : 'Ổn định'}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                      {item.refCode || item.employeeId}
                    </span>
                  </div>

                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Hạn: {item.dueDate}
                  </span>
                </div>

                {/* Content */}
                <div className="pt-3 space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Phòng ban: <strong className="text-slate-700 dark:text-slate-200">{item.department}</strong>
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
                {/* Contract Expiry Actions */}
                {item.type === 'contract_expiry' && contract && (
                  <>
                    <button
                      onClick={() => openGoogleCalendarReminder(contract)}
                      className="px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-1.5 hover:bg-blue-100"
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      <span>Tạo lịch nhắc Google Calendar</span>
                    </button>

                    <button
                      onClick={() => onRenewContract(item.employeeId)}
                      className="px-3.5 py-1.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5 text-gold-400" />
                      <span>Gia hạn hợp đồng</span>
                    </button>
                  </>
                )}

                {/* Probation End Actions */}
                {item.type === 'probation_end' && emp && (
                  <>
                    <button
                      onClick={() => onOpenProbationReview(emp, contract || null)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1.5 hover:bg-slate-200"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Xem Tờ trình đánh giá</span>
                    </button>

                    <button
                      onClick={() => onApproveProbation(item.employeeId)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Ký HĐ chính thức</span>
                    </button>
                  </>
                )}

                {/* Leave Approval Actions */}
                {item.type === 'leave_pending' && item.refCode && (
                  <>
                    <button
                      onClick={() => onApproveLeave(item.refCode!)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Duyệt đơn</span>
                    </button>

                    <button
                      onClick={() => onRejectLeave(item.refCode!)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Từ chối</span>
                    </button>
                  </>
                )}

                {/* View 360 link */}
                {emp && (
                  <button
                    onClick={() => onSelectEmployee(emp)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 ml-auto transition-colors"
                    title="Mở hồ sơ 360°"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

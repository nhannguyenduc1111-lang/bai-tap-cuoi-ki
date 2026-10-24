import React, { useState } from 'react';
import {
  CalendarOff,
  Download,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { LeaveRecord, LeaveQuota } from '../types';
import { exportToExcel } from '../services/excelService';

interface LeavesTabProps {
  leaves: LeaveRecord[];
  leaveQuotas: LeaveQuota[];
  onApproveLeave: (code: string) => void;
  onRejectLeave: (code: string) => void;
}

export const LeavesTab: React.FC<LeavesTabProps> = ({
  leaves,
  leaveQuotas,
  onApproveLeave,
  onRejectLeave
}) => {
  const [subTab, setSubTab] = useState<'requests' | 'quotas'>('requests');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(leaves.length / pageSize) || 1;
  const currentLeaves = leaves.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExport = () => {
    if (subTab === 'requests') {
      const exportData = leaves.map(l => ({
        'Mã đơn': l.code,
        'Mã NV': l.employeeId,
        'Họ và tên': l.employeeName,
        'Phòng ban': l.department,
        'Loại nghỉ phép': l.leaveType,
        'Từ ngày': l.fromDate,
        'Đến ngày': l.toDate,
        'Số ngày': l.days,
        'Lý do': l.reason,
        'Người phê duyệt': l.approver,
        'Trạng thái': l.status
      }));
      exportToExcel(exportData, `So_theo_doi_don_nghi_phep_2026`);
    } else {
      const exportData = leaveQuotas.map(q => ({
        'Mã NV': q.employeeId,
        'Họ và tên': q.employeeName,
        'Phòng ban': q.department,
        'Phép tiêu chuẩn': q.standardQuota,
        'Phép thâm niên': q.seniorityQuota,
        'Tổng quỹ phép': q.totalQuota,
        'Đã sử dụng': q.usedQuota,
        'Còn lại': q.remainingQuota,
        'Ghi chú': q.notes
      }));
      exportToExcel(exportData, `Bang_tong_hop_quy_phep_nam_2026`);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Top Header & Sub-Tabs */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => { setSubTab('requests'); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                subTab === 'requests'
                  ? 'bg-white dark:bg-slate-700 text-forest-800 dark:text-gold-400 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <CalendarOff className="w-3.5 h-3.5" />
              <span>Đơn xin nghỉ phép ({leaves.length})</span>
            </button>
            <button
              onClick={() => { setSubTab('quotas'); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                subTab === 'quotas'
                  ? 'bg-white dark:bg-slate-700 text-forest-800 dark:text-gold-400 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Quỹ phép năm 2026 ({leaveQuotas.length})</span>
            </button>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="px-3.5 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 text-gold-400" />
          <span>Xuất Excel (.xlsx)</span>
        </button>
      </div>

      {/* SUB-TAB 1: LEAVE REQUESTS */}
      {subTab === 'requests' && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200/80 dark:border-slate-700/80">
                <tr>
                  <th className="py-3.5 px-4 w-28">Mã đơn</th>
                  <th className="py-3.5 px-4 w-24">Mã NV</th>
                  <th className="py-3.5 px-4">Họ và tên</th>
                  <th className="py-3.5 px-4">Phòng ban</th>
                  <th className="py-3.5 px-4">Loại nghỉ</th>
                  <th className="py-3.5 px-4 text-center">Thời gian nghỉ</th>
                  <th className="py-3.5 px-4 text-center">Số ngày</th>
                  <th className="py-3.5 px-4">Lý do</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Phê duyệt nhanh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {currentLeaves.map((l) => {
                  const isPending = l.status === 'Chờ duyệt';

                  return (
                    <tr
                      key={l.code}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                        isPending ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {l.code}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-forest-800 dark:text-gold-400">
                        {l.employeeId}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {l.employeeName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        {l.department}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {l.leaveType}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-[11px] text-slate-500">
                        {l.fromDate} → {l.toDate}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 dark:text-white">
                        {l.days}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={l.reason}>
                        {l.reason}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPending
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 animate-pulse'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onApproveLeave(l.code)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Duyệt</span>
                            </button>
                            <button
                              onClick={() => onRejectLeave(l.code)}
                              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] font-mono">Duyệt bởi {l.approver}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div>
              Hiển thị {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, leaves.length)} trên tổng số{' '}
              <strong className="text-slate-800 dark:text-white font-bold">{leaves.length}</strong> đơn xin nghỉ
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-semibold text-slate-800 dark:text-white">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* SUB-TAB 2: LEAVE QUOTAS */}
      {subTab === 'quotas' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200/80 dark:border-slate-700/80">
              <tr>
                <th className="py-3.5 px-4 w-24">Mã NV</th>
                <th className="py-3.5 px-4">Họ và tên</th>
                <th className="py-3.5 px-4">Phòng ban</th>
                <th className="py-3.5 px-4 text-center">Phép chuẩn</th>
                <th className="py-3.5 px-4 text-center">Thâm niên</th>
                <th className="py-3.5 px-4 text-center font-bold">Tổng quỹ phép</th>
                <th className="py-3.5 px-4 text-center text-amber-600 dark:text-amber-400 font-bold">Đã dùng</th>
                <th className="py-3.5 px-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">Còn lại</th>
                <th className="py-3.5 px-4">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {leaveQuotas.map((q) => (
                <tr key={q.employeeId} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-forest-800 dark:text-gold-400">
                    {q.employeeId}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {q.employeeName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                    {q.department}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                    {q.standardQuota}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                    +{q.seniorityQuota}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-extrabold text-slate-900 dark:text-white">
                    {q.totalQuota}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                    {q.usedQuota}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {q.remainingQuota}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-xs">
                    {q.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

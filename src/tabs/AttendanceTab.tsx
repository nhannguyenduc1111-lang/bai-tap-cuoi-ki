import React, { useState } from 'react';
import {
  Clock,
  Download,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Attendance } from '../types';
import { exportToExcel } from '../services/excelService';

interface AttendanceTabProps {
  attendances: Attendance[];
  selectedMonth: string;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  attendances,
  selectedMonth
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const curAtts = attendances.filter(a => a.month === selectedMonth);
  const totalPages = Math.ceil(curAtts.length / pageSize) || 1;
  const currentItems = curAtts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalActualDays = curAtts.reduce((sum, a) => sum + a.actualDays, 0);
  const totalPaidLeaves = curAtts.reduce((sum, a) => sum + a.leavePaid, 0);
  const totalUnpaidLeaves = curAtts.reduce((sum, a) => sum + a.leaveUnpaid, 0);
  const totalOTNormal = curAtts.reduce((sum, a) => sum + a.otNormalHours, 0);
  const totalOTSun = curAtts.reduce((sum, a) => sum + a.otSundayHours, 0);

  const handleExport = () => {
    const exportData = curAtts.map(a => ({
      'Kỳ công': a.month,
      'Mã NV': a.employeeId,
      'Họ và tên': a.employeeName,
      'Phòng ban': a.department,
      'Chức vụ': a.position,
      'Công chuẩn': a.standardDays,
      'Công thực tế (X)': a.actualDays,
      'Nghỉ phép (P)': a.leavePaid,
      'Nghỉ không lương (Ro)': a.leaveUnpaid,
      'Nghỉ ốm (Om)': a.leaveSick,
      'Nghỉ thai sản (TS)': a.leaveMaternity,
      'Tổng công tính lương': a.totalWorkDays,
      'Tăng ca ngày thường (h)': a.otNormalHours,
      'Tăng ca Chủ nhật (h)': a.otSundayHours,
      'Đi trễ / Về sớm': a.lateEarlyCount,
      'Ghi chú': a.notes
    }));
    exportToExcel(exportData, `Bang_tong_hop_cham_cong_${selectedMonth.replace('/', '_')}`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-forest-800 dark:text-gold-400" />
            Bảng Tổng hợp Chấm công & Tăng ca OT ({selectedMonth})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Định mức: 26 ngày công chuẩn • Tự động nhận diện dòng tiêu đề Dòng 4
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-3.5 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 text-gold-400" />
          <span>Xuất Bảng công (.xlsx)</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200/80 dark:border-slate-700/80">
            <tr>
              <th className="py-3 px-3 w-20">Mã NV</th>
              <th className="py-3 px-3">Họ và tên</th>
              <th className="py-3 px-3">Phòng ban</th>
              <th className="py-3 px-2 text-center">Công chuẩn</th>
              <th className="py-3 px-2 text-center">Đi làm (X)</th>
              <th className="py-3 px-2 text-center">Phép (P)</th>
              <th className="py-3 px-2 text-center">Không lương</th>
              <th className="py-3 px-2 text-center">Nghỉ ốm</th>
              <th className="py-3 px-2 text-center font-bold text-slate-900 dark:text-white">Tổng công</th>
              <th className="py-3 px-3 text-center text-amber-600 dark:text-amber-400 font-bold">OT thường (h)</th>
              <th className="py-3 px-3 text-center text-rose-600 dark:text-rose-400 font-bold">OT CN (h)</th>
              <th className="py-3 px-2 text-center">Đi trễ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {currentItems.map((a, idx) => {
              const totalOT = a.otNormalHours + a.otSundayHours;
              const hasHighOT = totalOT >= 10;

              return (
                <tr
                  key={idx}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                    hasHighOT ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-mono font-bold text-forest-800 dark:text-gold-400">
                    {a.employeeId}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    {a.employeeName}
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                    {a.department}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-slate-500">
                    {a.standardDays}
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {a.actualDays}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-blue-600">
                    {a.leavePaid}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-rose-500">
                    {a.leaveUnpaid}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-slate-500">
                    {a.leaveSick}
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-extrabold text-slate-900 dark:text-white">
                    {a.totalWorkDays}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                    {a.otNormalHours > 0 ? `${a.otNormalHours}h` : '-'}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-rose-600 dark:text-rose-400">
                    {a.otSundayHours > 0 ? `${a.otSundayHours}h` : '-'}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-slate-500">
                    {a.lateEarlyCount > 0 ? a.lateEarlyCount : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Summary Footer */}
          <tfoot>
            <tr className="bg-slate-100 dark:bg-slate-800/90 font-bold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
              <td className="py-3 px-3" colSpan={4}>
                TỔNG CỘNG TOÀN CÔNG TY ({selectedMonth}):
              </td>
              <td className="py-3 px-2 text-center font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
                {totalActualDays}
              </td>
              <td className="py-3 px-2 text-center font-mono text-blue-600">
                {totalPaidLeaves}
              </td>
              <td className="py-3 px-2 text-center font-mono text-rose-600">
                {totalUnpaidLeaves}
              </td>
              <td className="py-3 px-2 text-center font-mono">-</td>
              <td className="py-3 px-2 text-center font-mono font-extrabold text-forest-800 dark:text-gold-400">
                {totalActualDays + totalPaidLeaves}
              </td>
              <td className="py-3 px-3 text-center font-mono text-amber-600 font-extrabold">
                {totalOTNormal}h
              </td>
              <td className="py-3 px-3 text-center font-mono text-rose-600 font-extrabold">
                {totalOTSun}h
              </td>
              <td className="py-3 px-2 text-center font-mono">-</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div>
          Hiển thị {(currentPage - 1) * pageSize + 1} -{' '}
          {Math.min(currentPage * pageSize, curAtts.length)} trên tổng số{' '}
          <strong className="text-slate-800 dark:text-white font-bold">{curAtts.length}</strong> dòng chấm công
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
    </div>
  );
};

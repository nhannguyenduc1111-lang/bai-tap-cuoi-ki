import React, { useState } from 'react';
import {
  DollarSign,
  Download,
  ChevronLeft,
  ChevronRight,
  Printer,
  Mail,
  ExternalLink
} from 'lucide-react';
import { PayrollRecord, Employee } from '../types';
import { exportToExcel } from '../services/excelService';

interface PayrollTabProps {
  payrolls: PayrollRecord[];
  employees: Employee[];
  selectedMonth: string;
  onOpenPayslip: (employee: Employee, payroll: PayrollRecord) => void;
  onSelectEmployee: (employee: Employee) => void;
}

export const PayrollTab: React.FC<PayrollTabProps> = ({
  payrolls,
  employees,
  selectedMonth,
  onOpenPayslip,
  onSelectEmployee
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const curPayrolls = payrolls.filter(p => p.month === selectedMonth);
  const totalPages = Math.ceil(curPayrolls.length / pageSize) || 1;
  const currentItems = curPayrolls.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Totals for filtered records
  const totalGross = curPayrolls.reduce((sum, p) => sum + p.grossIncome, 0);
  const totalBHXH = curPayrolls.reduce((sum, p) => sum + p.bhxhDeduction, 0);
  const totalTax = curPayrolls.reduce((sum, p) => sum + p.pitTax, 0);
  const totalNet = curPayrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const totalOT = curPayrolls.reduce((sum, p) => sum + p.otPay, 0);

  const handleExport = () => {
    const exportData = curPayrolls.map(p => ({
      'Kỳ lương': p.month,
      'Mã NV': p.employeeId,
      'Họ và tên': p.employeeName,
      'Phòng ban': p.department,
      'Chức vụ': p.position,
      'Mức lương HĐ': p.baseSalary,
      'Ngày công': p.workDays,
      'Lương thời gian': p.timeSalary,
      'Phụ cấp TN': p.responsibilityAllowance,
      'Phụ cấp ăn trưa': p.lunchAllowance,
      'Tiền OT': p.otPay,
      'Thưởng hiệu quả': p.performanceBonus,
      'Tổng thu nhập': p.grossIncome,
      'BHXH (10.5%)': p.bhxhDeduction,
      'Thuế TNCN': p.pitTax,
      'Thực lĩnh': p.netSalary,
      'Ghi chú': p.notes
    }));
    exportToExcel(exportData, `Bang_luong_chi_tiet_${selectedMonth.replace('/', '_')}`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-forest-800 dark:text-gold-400" />
            Bảng Thanh toán Tiền lương Chi tiết ({selectedMonth})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cơ chế đối soát 5 chiều: Lương HĐ + Chấm công + OT + BHXH (10.5%) + Thuế TNCN
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-3.5 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 text-gold-400" />
          <span>Xuất Bảng lương (.xlsx)</span>
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
              <th className="py-3 px-2 text-right">Lương HĐ</th>
              <th className="py-3 px-2 text-center">Công</th>
              <th className="py-3 px-2 text-right">Lương TG</th>
              <th className="py-3 px-2 text-right">PC Trách nhiệm</th>
              <th className="py-3 px-2 text-right text-amber-600 dark:text-amber-400 font-bold">Tiền OT</th>
              <th className="py-3 px-2 text-right">Thưởng</th>
              <th className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">Tổng thu nhập</th>
              <th className="py-3 px-2 text-right text-rose-600 dark:text-rose-400">Trừ BHXH (10.5%)</th>
              <th className="py-3 px-2 text-right text-rose-600 dark:text-rose-400">Thuế TNCN</th>
              <th className="py-3 px-3 text-right font-black text-forest-800 dark:text-gold-400 text-sm">Thực lĩnh</th>
              <th className="py-3 px-3 text-center">Phiếu lương</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {currentItems.map((p) => {
              const emp = employees.find(e => e.id === p.employeeId);

              return (
                <tr
                  key={p.employeeId}
                  onClick={() => emp && onSelectEmployee(emp)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-mono font-bold text-forest-800 dark:text-gold-400">
                    {p.employeeId}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    {p.employeeName}
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                    {p.department}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-slate-600 dark:text-slate-400">
                    {p.baseSalary.toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-semibold">
                    {p.workDays}/26
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-slate-700 dark:text-slate-300">
                    {p.timeSalary.toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-slate-500">
                    {p.responsibilityAllowance > 0 ? p.responsibilityAllowance.toLocaleString('vi-VN') : '-'}
                  </td>
                  <td className="py-3 px-2 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                    {p.otPay > 0 ? p.otPay.toLocaleString('vi-VN') : '-'}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-slate-500">
                    {p.performanceBonus > 0 ? p.performanceBonus.toLocaleString('vi-VN') : '-'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {p.grossIncome.toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-rose-600 dark:text-rose-400">
                    -{p.bhxhDeduction.toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-rose-600 dark:text-rose-400">
                    {p.pitTax > 0 ? `-${p.pitTax.toLocaleString('vi-VN')}` : '-'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-forest-800 dark:text-gold-400 text-xs">
                    {p.netSalary.toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    {emp && (
                      <button
                        onClick={() => onOpenPayslip(emp, p)}
                        title="Xem Phiếu lương A5/A4"
                        className="px-2 py-1 rounded-md bg-gold-50 dark:bg-gold-950/40 border border-gold-300 dark:border-gold-800 text-gold-700 dark:text-gold-400 font-semibold hover:bg-gold-500 hover:text-white text-[10px] transition-colors"
                      >
                        Phiếu lương
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Summary Footer */}
          <tfoot>
            <tr className="bg-slate-100 dark:bg-slate-800/90 font-bold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
              <td className="py-3 px-3" colSpan={7}>
                TỔNG CỘNG QUỸ LƯƠNG TOÀN CÔNG TY ({selectedMonth}):
              </td>
              <td className="py-3 px-2 text-right font-mono text-amber-600 font-bold">
                {totalOT.toLocaleString('vi-VN')} đ
              </td>
              <td></td>
              <td className="py-3 px-3 text-right font-mono text-slate-900 dark:text-white font-black text-xs">
                {totalGross.toLocaleString('vi-VN')} đ
              </td>
              <td className="py-3 px-2 text-right font-mono text-rose-600 font-bold">
                -{totalBHXH.toLocaleString('vi-VN')} đ
              </td>
              <td className="py-3 px-2 text-right font-mono text-rose-600 font-bold">
                -{totalTax.toLocaleString('vi-VN')} đ
              </td>
              <td className="py-3 px-3 text-right font-mono text-forest-800 dark:text-gold-400 font-extrabold text-sm">
                {totalNet.toLocaleString('vi-VN')} đ
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div>
          Hiển thị {(currentPage - 1) * pageSize + 1} -{' '}
          {Math.min(currentPage * pageSize, curPayrolls.length)} trên tổng số{' '}
          <strong className="text-slate-800 dark:text-white font-bold">{curPayrolls.length}</strong> nhân sự tính lương
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

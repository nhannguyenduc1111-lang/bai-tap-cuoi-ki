import React, { useState } from 'react';
import {
  FileText,
  Download,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Building
} from 'lucide-react';
import { Contract } from '../types';
import { openGoogleCalendarReminder } from '../services/exportService';
import { exportToExcel } from '../services/excelService';

interface ContractsTabProps {
  contracts: Contract[];
}

export const ContractsTab: React.FC<ContractsTabProps> = ({ contracts }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(contracts.length / pageSize) || 1;
  const currentItems = contracts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalInsuranceSalary = contracts.reduce((sum, c) => sum + c.insuranceSalary, 0);

  const handleExport = () => {
    const exportData = contracts.map(c => ({
      'Số hợp đồng': c.contractNumber,
      'Mã NV': c.employeeId,
      'Họ và tên': c.employeeName,
      'Phòng ban': c.department,
      'Chức danh': c.jobTitle,
      'Loại hợp đồng': c.contractType,
      'Ngày ký': c.signDate,
      'Ngày hiệu lực': c.effectiveDate,
      'Ngày hết hạn': c.expiryDate || 'Không xác định',
      'Lương đóng BH (VNĐ)': c.insuranceSalary,
      'Địa điểm': c.workLocation,
      'Trạng thái': c.status
    }));
    exportToExcel(exportData, `So_theo_doi_hop_dong_lao_dong_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-forest-800 dark:text-gold-400" />
            Sổ Theo dõi Hợp đồng Lao động & Thời hạn
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cảnh báo hạn tái ký hợp đồng và tạo lịch tự động trên Google Calendar
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-3.5 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 text-gold-400" />
          <span>Xuất danh sách HĐ (.xlsx)</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200/80 dark:border-slate-700/80">
            <tr>
              <th className="py-3.5 px-4 w-36">Số hợp đồng</th>
              <th className="py-3.5 px-4 w-24">Mã NV</th>
              <th className="py-3.5 px-4">Họ và tên</th>
              <th className="py-3.5 px-4">Phòng ban</th>
              <th className="py-3.5 px-4">Loại hợp đồng</th>
              <th className="py-3.5 px-4 text-center">Ngày ký</th>
              <th className="py-3.5 px-4 text-center">Ngày hết hạn</th>
              <th className="py-3.5 px-4 text-right">Lương đóng BH</th>
              <th className="py-3.5 px-4 text-center">Trạng thái</th>
              <th className="py-3.5 px-4 text-right">Tạo lịch nhắc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {currentItems.map((c, idx) => {
              const isExpiring = c.status.toLowerCase().includes('hết hạn');

              return (
                <tr
                  key={idx}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                    isExpiring ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {c.contractNumber}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-forest-800 dark:text-gold-400">
                    {c.employeeId}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {c.employeeName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                    {c.department}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    {c.contractType}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-600 dark:text-slate-400">
                    {c.signDate}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold">
                    <span className={isExpiring ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-600 dark:text-slate-400'}>
                      {c.expiryDate || 'Vô thời hạn'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {c.insuranceSalary.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isExpiring
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openGoogleCalendarReminder(c)}
                      title="Tạo lịch nhắc tái ký trên Google Calendar"
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-gold-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-gold-600 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      <CalendarCheck className="w-3.5 h-3.5 text-gold-500" />
                      <span>Nhắc việc</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Summary Footer */}
          <tfoot>
            <tr className="bg-slate-100 dark:bg-slate-800/90 font-bold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
              <td className="py-3 px-4" colSpan={7}>
                TỔNG QUỸ LƯƠNG ĐÓNG BHXH TOÀN BỘ HỢP ĐỒNG (THEO BỘ LỌC):
              </td>
              <td className="py-3 px-4 text-right font-mono text-forest-800 dark:text-gold-400 font-extrabold text-sm">
                {totalInsuranceSalary.toLocaleString('vi-VN')} đ
              </td>
              <td className="py-3 px-4 text-center" colSpan={2}>
                {contracts.length} hợp đồng
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div>
          Hiển thị {(currentPage - 1) * pageSize + 1} -{' '}
          {Math.min(currentPage * pageSize, contracts.length)} trên tổng số{' '}
          <strong className="text-slate-800 dark:text-white font-bold">{contracts.length}</strong> hợp đồng
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

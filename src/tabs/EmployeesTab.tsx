import React, { useState } from 'react';
import {
  Users,
  Search,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Mail,
  Building
} from 'lucide-react';
import { Employee, PayrollRecord } from '../types';
import { exportToExcel } from '../services/excelService';

interface EmployeesTabProps {
  employees: Employee[];
  payrolls: PayrollRecord[];
  selectedMonth: string;
  onSelectEmployee: (emp: Employee) => void;
  onOpenPayslip: (emp: Employee, pay: PayrollRecord) => void;
}

export const EmployeesTab: React.FC<EmployeesTabProps> = ({
  employees,
  payrolls,
  selectedMonth,
  onSelectEmployee,
  onOpenPayslip
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(employees.length / pageSize) || 1;
  const currentItems = employees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExport = () => {
    const exportData = employees.map(e => ({
      'Mã NV': e.id,
      'Họ và tên': e.fullName,
      'Giới tính': e.gender,
      'Ngày sinh': e.birthDate,
      'Số CCCD': e.idCard,
      'Quê quán': e.hometown,
      'Phòng ban': e.department,
      'Chức vụ': e.position,
      'Trình độ': e.education,
      'Ngày vào làm': e.startDate,
      'Email': e.email,
      'Số điện thoại': e.phone,
      'Số TK Ngân hàng': e.bankAccount,
      'Ngân hàng': e.bankName,
      'Mã BHXH': e.bhxhCode,
      'Người phụ thuộc': e.dependents,
      'Trạng thái': e.status
    }));
    exportToExcel(exportData, `Danh_sach_nhan_su_Cong_ty_A_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Table Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-forest-800 dark:text-gold-400" />
            Hồ sơ Nhân sự Toàn diện (360° Master Database)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Nhấn vào bất kỳ hàng nào để mở ngăn kéo trượt chi tiết 5 chiều dữ liệu
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-3.5 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 text-gold-400" />
          <span>Xuất danh sách ra Excel (.xlsx)</span>
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200/80 dark:border-slate-700/80">
            <tr>
              <th className="py-3.5 px-4 w-24">Mã NV</th>
              <th className="py-3.5 px-4">Họ và tên</th>
              <th className="py-3.5 px-4">Phòng ban</th>
              <th className="py-3.5 px-4">Chức vụ</th>
              <th className="py-3.5 px-4">Email & SĐT</th>
              <th className="py-3.5 px-4 text-center">Ngày vào làm</th>
              <th className="py-3.5 px-4 text-center">Trạng thái</th>
              <th className="py-3.5 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {currentItems.map((emp) => {
              const pay = payrolls.find(p => p.employeeId === emp.id && p.month === selectedMonth);
              const isProbation = emp.status.toLowerCase().includes('thử việc');

              return (
                <tr
                  key={emp.id}
                  onClick={() => onSelectEmployee(emp)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-forest-800 dark:text-gold-400">
                    {emp.id}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[11px] group-hover:bg-forest-800 group-hover:text-gold-400 transition-colors">
                        {emp.fullName.split(' ').slice(-1)[0][0]}
                      </div>
                      <span>{emp.fullName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {emp.department}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    {emp.position}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    <div>{emp.email}</div>
                    <div className="text-[10px] text-slate-400">{emp.phone}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-600 dark:text-slate-400">
                    {emp.startDate}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isProbation
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {pay && (
                        <button
                          onClick={() => onOpenPayslip(emp, pay)}
                          title="Xem phiếu lương cá nhân"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-gold-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-gold-600 transition-colors"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onSelectEmployee(emp)}
                        title="Xem Hồ sơ 360°"
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-forest-800 hover:text-white font-semibold text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <span>360°</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div>
          Hiển thị {(currentPage - 1) * pageSize + 1} -{' '}
          {Math.min(currentPage * pageSize, employees.length)} trên tổng số{' '}
          <strong className="text-slate-800 dark:text-white font-bold">{employees.length}</strong> nhân viên
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

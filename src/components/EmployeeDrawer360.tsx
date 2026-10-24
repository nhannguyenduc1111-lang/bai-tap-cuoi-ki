import React, { useState } from 'react';
import {
  X,
  User,
  FileText,
  DollarSign,
  Calendar,
  Clock,
  ExternalLink,
  Mail,
  Phone,
  CreditCard,
  Shield,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import {
  Employee,
  Contract,
  PayrollRecord,
  Attendance,
  LeaveRecord,
  LeaveQuota
} from '../types';
import { openGoogleCalendarReminder, openGmailComposePayslip } from '../services/exportService';

interface EmployeeDrawer360Props {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  contracts: Contract[];
  payrolls: PayrollRecord[];
  attendances: Attendance[];
  leaves: LeaveRecord[];
  leaveQuotas: LeaveQuota[];
  selectedMonth: string;
  onOpenPayslip: (employee: Employee, payroll: PayrollRecord) => void;
  onOpenProbationReview: (employee: Employee, contract: Contract | null) => void;
}

export const EmployeeDrawer360: React.FC<EmployeeDrawer360Props> = ({
  isOpen,
  onClose,
  employee,
  contracts,
  payrolls,
  attendances,
  leaves,
  leaveQuotas,
  selectedMonth,
  onOpenPayslip,
  onOpenProbationReview
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'contract' | 'payroll' | 'leave' | 'attendance'>('profile');

  if (!isOpen || !employee) return null;

  const empContract = contracts.find(c => c.employeeId === employee.id);
  const empPayrolls = payrolls.filter(p => p.employeeId === employee.id);
  const currentPayroll = empPayrolls.find(p => p.month === selectedMonth) || empPayrolls[0];
  const empAttendances = attendances.filter(a => a.employeeId === employee.id);
  const currentAttendance = empAttendances.find(a => a.month === selectedMonth) || empAttendances[0];
  const empLeaves = leaves.filter(l => l.employeeId === employee.id);
  const empQuota = leaveQuotas.find(q => q.employeeId === employee.id);

  const isProbation = employee.status.toLowerCase().includes('thử việc') || empContract?.contractType.includes('Thử việc');
  const isExpiringSoon = empContract?.status.toLowerCase().includes('sắp hết hạn');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm animate-in fade-in flex justify-end">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col slide-in-from-right duration-300">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-forest-800 to-forest-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gold-600/30 border border-gold-400/40 flex items-center justify-center text-gold-400 text-xl font-bold shadow-inner">
              {employee.fullName.split(' ').slice(-1)[0][0]}
            </div>

            <div className="flex-1 pr-8">
              <div className="flex items-center gap-2.5">
                <h3 className="text-xl font-black tracking-wide">{employee.fullName}</h3>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/30 font-semibold">
                  {employee.id}
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-1">
                {employee.position} • {employee.department}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  isProbation
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                }`}>
                  {employee.status}
                </span>
                {isExpiringSoon && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30 animate-pulse">
                    HĐ Sắp hết hạn (30 ngày)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10 text-xs">
            {currentPayroll && (
              <button
                onClick={() => onOpenPayslip(employee, currentPayroll)}
                className="px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-600 text-slate-900 font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Xem Phiếu lương ({selectedMonth})</span>
              </button>
            )}

            {isProbation && (
              <button
                onClick={() => onOpenProbationReview(employee, empContract || null)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tờ trình thử việc</span>
              </button>
            )}

            {empContract && (
              <button
                onClick={() => openGoogleCalendarReminder(empContract)}
                className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-medium flex items-center gap-1.5 transition-colors"
                title="Tạo lịch Google Calendar nhắc tái ký"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-gold-400" />
                <span>Nhắc Google Calendar</span>
              </button>
            )}

            {currentPayroll && (
              <button
                onClick={() => openGmailComposePayslip(employee, currentPayroll)}
                className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors ml-auto"
                title="Gửi email qua Gmail"
              >
                <Mail className="w-4 h-4 text-gold-400" />
              </button>
            )}
          </div>
        </div>

        {/* 5 Tabs Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-6 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'profile'
                ? 'border-gold-500 text-gold-600 dark:text-gold-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. Hồ sơ cá nhân</span>
          </button>

          <button
            onClick={() => setActiveTab('contract')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'contract'
                ? 'border-gold-500 text-gold-600 dark:text-gold-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>2. Hợp đồng</span>
          </button>

          <button
            onClick={() => setActiveTab('payroll')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'payroll'
                ? 'border-gold-500 text-gold-600 dark:text-gold-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>3. Chi tiết lương</span>
          </button>

          <button
            onClick={() => setActiveTab('leave')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'leave'
                ? 'border-gold-500 text-gold-600 dark:text-gold-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>4. Nghỉ phép & Quỹ phép</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'attendance'
                ? 'border-gold-500 text-gold-600 dark:text-gold-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>5. Chấm công OT</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-forest-800 dark:text-gold-400" />
                  Thông tin nhân khẩu & lý lịch nhân sự
                </h4>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  Nguồn: 01_Ho_so_nhan_vien.xlsx
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Giới tính:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{employee.gender}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Ngày sinh:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{employee.birthDate}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Số CCCD:</span>
                  <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{employee.idCard}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Quê quán:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{employee.hometown}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Trình độ đào tạo:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{employee.education}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Ngày vào làm chính thức:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{employee.startDate}</p>
                </div>
              </div>

              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 pt-2">
                <CreditCard className="w-4 h-4 text-forest-800 dark:text-gold-400" />
                Thông tin liên hệ & Pháp lý chi trả
              </h4>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Email công việc:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{employee.email}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Số điện thoại:</span>
                  <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{employee.phone}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Tài khoản Ngân hàng:</span>
                  <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{employee.bankAccount} ({employee.bankName})</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Mã số BHXH:</span>
                  <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{employee.bhxhCode}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Người phụ thuộc giảm trừ:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{employee.dependents} người (Giảm trừ 4.4tr/người)</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Trạng thái hồ sơ:</span>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{employee.status}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTRACT */}
          {activeTab === 'contract' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-forest-800 dark:text-gold-400" />
                  Theo dõi Hợp đồng lao động hiện tại
                </h4>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  Nguồn: 02_Hop_dong.xlsx
                </span>
              </div>

              {empContract ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Số hợp đồng:</span>
                      <p className="font-mono font-bold text-slate-900 dark:text-white text-sm">{empContract.contractNumber}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      empContract.status.includes('hết hạn')
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200'
                    }`}>
                      {empContract.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Loại hợp đồng:</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{empContract.contractType}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Chức danh ký HĐ:</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{empContract.jobTitle}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Ngày ký kết:</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{empContract.signDate}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Ngày có hiệu lực:</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{empContract.effectiveDate}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Ngày hết hạn HĐ:</span>
                      <p className="font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
                        {empContract.expiryDate || 'Không xác định thời hạn'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Mức lương đóng BH:</span>
                      <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {empContract.insuranceSalary.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 dark:text-slate-400">Địa điểm làm việc:</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{empContract.workLocation}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 border border-dashed rounded-xl">
                  Chưa có thông tin hợp đồng trong cơ sở dữ liệu
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PAYROLL */}
          {activeTab === 'payroll' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-forest-800 dark:text-gold-400" />
                  Thu nhập & Lương qua các kỳ tháng
                </h4>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  Nguồn: 05_Bang_luong_2026_*.xlsx
                </span>
              </div>

              {currentPayroll && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-forest-800/10 to-gold-500/10 border border-gold-500/20 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-forest-800 dark:text-gold-400 text-sm">
                      Kỳ hiện tại: {currentPayroll.month}
                    </span>
                    <button
                      onClick={() => onOpenPayslip(employee, currentPayroll)}
                      className="px-2.5 py-1 rounded-md bg-gold-600 text-white font-semibold text-[11px] hover:bg-gold-700"
                    >
                      Mở Phiếu lương đầy đủ
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-center">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Tổng thu nhập</span>
                      <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                        {currentPayroll.grossIncome.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Khấu trừ BHXH+Thuế</span>
                      <p className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm mt-0.5">
                        -{(currentPayroll.bhxhDeduction + currentPayroll.pitTax).toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Thực lĩnh chuyển khoản</span>
                      <p className="font-mono font-bold text-forest-800 dark:text-gold-400 text-sm mt-0.5">
                        {currentPayroll.netSalary.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* History Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                    <tr>
                      <th className="p-2.5">Kỳ lương</th>
                      <th className="p-2.5 text-center">Ngày công</th>
                      <th className="p-2.5 text-right">Lương thời gian</th>
                      <th className="p-2.5 text-right">Tiền OT</th>
                      <th className="p-2.5 text-right">Thực lĩnh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {empPayrolls.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2.5 font-bold text-forest-800 dark:text-gold-400">{p.month}</td>
                        <td className="p-2.5 text-center font-mono">{p.workDays}/26</td>
                        <td className="p-2.5 text-right font-mono">{p.timeSalary.toLocaleString('vi-VN')} đ</td>
                        <td className="p-2.5 text-right font-mono text-gold-600 dark:text-gold-400 font-semibold">{p.otPay.toLocaleString('vi-VN')} đ</td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{p.netSalary.toLocaleString('vi-VN')} đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: LEAVES */}
          {activeTab === 'leave' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-forest-800 dark:text-gold-400" />
                  Quỹ phép năm 2026 & Sổ theo dõi đơn nghỉ
                </h4>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  Nguồn: 04_Nghi_phep_2026.xlsx
                </span>
              </div>

              {/* Leave Quota Card */}
              {empQuota && (
                <div className="grid grid-cols-4 gap-2 text-center text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                    <span className="text-slate-400 text-[10px]">Tiêu chuẩn</span>
                    <p className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">{empQuota.standardQuota} ngày</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                    <span className="text-slate-400 text-[10px]">Thâm niên</span>
                    <p className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">+{empQuota.seniorityQuota} ngày</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                    <span className="text-slate-400 text-[10px]">Đã sử dụng</span>
                    <p className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm mt-0.5">{empQuota.usedQuota} ngày</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                    <span className="text-slate-400 text-[10px]">Còn lại</span>
                    <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">{empQuota.remainingQuota} ngày</p>
                  </div>
                </div>
              )}

              {/* Leave Applications */}
              <div className="space-y-2">
                <h5 className="font-semibold text-xs text-slate-700 dark:text-slate-300">Lịch sử nộp đơn xin nghỉ năm 2026:</h5>
                {empLeaves.length > 0 ? (
                  <div className="space-y-2">
                    {empLeaves.map((l, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-forest-800 dark:text-gold-400">{l.code}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            l.status === 'Đã duyệt'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 animate-pulse'
                          }`}>
                            {l.status}
                          </span>
                        </div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{l.leaveType} ({l.days} ngày)</p>
                        <p className="text-slate-500 dark:text-slate-400">Thời gian: {l.fromDate} đến {l.toDate}</p>
                        <p className="text-slate-600 dark:text-slate-300 italic">Lý do: "{l.reason}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic">Chưa có phát sinh đơn xin nghỉ trong năm 2026.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-forest-800 dark:text-gold-400" />
                  Tổng hợp chấm công & Giờ làm thêm (OT)
                </h4>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  Nguồn: 03_Cham_cong_*.xlsx
                </span>
              </div>

              {currentAttendance && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                  <span className="font-bold text-forest-800 dark:text-gold-400">
                    Kỳ chấm công: {currentAttendance.month}
                  </span>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="text-slate-400">Công chuẩn theo lịch:</span>
                      <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{currentAttendance.standardDays} ngày</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Công thực tế đi làm (X):</span>
                      <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{currentAttendance.actualDays} ngày</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Nghỉ phép hưởng lương (P):</span>
                      <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{currentAttendance.leavePaid} ngày</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Nghỉ không lương (Ro):</span>
                      <p className="font-mono font-bold text-rose-600 dark:text-rose-400">{currentAttendance.leaveUnpaid} ngày</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Tăng ca ngày thường:</span>
                      <p className="font-mono font-bold text-gold-600 dark:text-gold-400">{currentAttendance.otNormalHours} giờ</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Tăng ca Chủ nhật:</span>
                      <p className="font-mono font-bold text-gold-600 dark:text-gold-400">{currentAttendance.otSundayHours} giờ</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

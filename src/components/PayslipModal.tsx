import React, { useRef } from 'react';
import { X, Printer, FileText, Mail, Download, CheckCircle, Building2 } from 'lucide-react';
import { Employee, PayrollRecord } from '../types';
import { exportWordDocument, openGmailComposePayslip } from '../services/exportService';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  payroll: PayrollRecord | null;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  isOpen,
  onClose,
  employee,
  payroll
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !employee || !payroll) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    exportWordDocument(content, `Phieu_luong_${employee.id}_${payroll.month.replace('/', '_')}`);
  };

  const handleSendGmail = () => {
    openGmailComposePayslip(employee, payroll);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400 font-bold text-xs">
              MẪU A5 / CHUẨN DOANH NGHIỆP
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Kỳ lương: {payroll.month}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In PDF</span>
            </button>

            <button
              onClick={handleExportWord}
              className="px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Xuất Word (.doc)</span>
            </button>

            <button
              onClick={handleSendGmail}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-forest-800 to-forest-700 hover:from-forest-900 hover:to-forest-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Mail className="w-3.5 h-3.5 text-gold-400" />
              <span>Gửi qua Gmail</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div ref={printRef} className="p-8 sm:p-10 text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 font-sans print:p-4 print:text-black print:bg-white">
          {/* Header */}
          <div className="flex items-start justify-between pb-6 border-b-2 border-forest-800 dark:border-gold-500">
            <div>
              <div className="flex items-center gap-2 text-forest-800 dark:text-gold-400 font-bold text-lg tracking-wide uppercase">
                <Building2 className="w-6 h-6" />
                CÔNG TY CỔ PHẦN THƯƠNG MẠI & SẢN XUẤT A
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tòa nhà Văn phòng Công ty A, Khu Công nghệ cao, Hà Nội
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Phòng Hành chính - Nhân sự & Kế toán | Hotline: (024) 3888 9999
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                MÃ PHIẾU: PL-{payroll.month.replace('/', '')}-{employee.id}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Ngày lập: 25/{payroll.month.split('/')[0]}/{payroll.month.split('/')[1]}</p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center my-6">
            <h2 className="text-xl sm:text-2xl font-black text-forest-800 dark:text-white uppercase tracking-wider">
              PHIẾU THANH TOÁN TIỀN LƯƠNG
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Kỳ thanh toán: <span className="font-bold text-gold-600 dark:text-gold-400">Tháng {payroll.month}</span>
            </p>
          </div>

          {/* Employee Info Block */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs mb-6">
            <div>
              <p className="text-slate-500 dark:text-slate-400">Họ và tên nhân viên:</p>
              <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{employee.fullName}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Mã nhân viên & CCCD:</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{employee.id} | {employee.idCard}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Phòng ban công tác:</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{employee.department}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Chức vụ / Chức danh:</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{employee.position}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Tài khoản ngân hàng:</p>
              <p className="font-mono font-medium text-slate-800 dark:text-slate-200 mt-0.5">{employee.bankAccount} ({employee.bankName})</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Mã số BHXH & Giảm trừ:</p>
              <p className="font-mono font-medium text-slate-800 dark:text-slate-200 mt-0.5">{employee.bhxhCode} | {employee.dependents} người phụ thuộc</p>
            </div>
          </div>

          {/* Detailed Calculation Table */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-6 text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-forest-800 text-white font-semibold">
                  <th className="py-2.5 px-3 w-12 text-center">STT</th>
                  <th className="py-2.5 px-3">Khoản mục thu nhập / Khấu trừ</th>
                  <th className="py-2.5 px-3 w-28 text-center">Căn cứ / Số ngày</th>
                  <th className="py-2.5 px-3 w-36 text-right">Thành tiền (VNĐ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {/* 1. Thu nhập */}
                <tr className="bg-slate-100/70 dark:bg-slate-800 font-bold text-slate-900 dark:text-white">
                  <td className="py-2 px-3 text-center">I</td>
                  <td className="py-2 px-3" colSpan={2}>CÁC KHOẢN THU NHẬP TRONG KỲ</td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                    {payroll.grossIncome.toLocaleString('vi-VN')} đ
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center text-slate-400">1</td>
                  <td className="py-2 px-3">Mức lương theo Hợp đồng lao động</td>
                  <td className="py-2 px-3 text-center font-mono">26 ngày công chuẩn</td>
                  <td className="py-2 px-3 text-right font-mono">{payroll.baseSalary.toLocaleString('vi-VN')} đ</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center text-slate-400">2</td>
                  <td className="py-2 px-3 font-medium">Lương thực tế theo ngày công</td>
                  <td className="py-2 px-3 text-center font-mono text-blue-600 dark:text-blue-400 font-bold">{payroll.workDays}/26 ngày</td>
                  <td className="py-2 px-3 text-right font-mono font-medium">{payroll.timeSalary.toLocaleString('vi-VN')} đ</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center text-slate-400">3</td>
                  <td className="py-2 px-3">Phụ cấp trách nhiệm công việc</td>
                  <td className="py-2 px-3 text-center">Theo chức vụ</td>
                  <td className="py-2 px-3 text-right font-mono">{payroll.responsibilityAllowance.toLocaleString('vi-VN')} đ</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center text-slate-400">4</td>
                  <td className="py-2 px-3">Phụ cấp ăn trưa theo quy định</td>
                  <td className="py-2 px-3 text-center">Chế độ phúc lợi</td>
                  <td className="py-2 px-3 text-right font-mono">{payroll.lunchAllowance.toLocaleString('vi-VN')} đ</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center text-slate-400">5</td>
                  <td className="py-2 px-3">Tiền làm thêm giờ (Tăng ca OT)</td>
                  <td className="py-2 px-3 text-center font-mono text-gold-600 dark:text-gold-400">Bảng chấm công OT</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-gold-600 dark:text-gold-400">{payroll.otPay.toLocaleString('vi-VN')} đ</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center text-slate-400">6</td>
                  <td className="py-2 px-3">Thưởng hiệu quả công việc (KPI)</td>
                  <td className="py-2 px-3 text-center">Đánh giá tháng</td>
                  <td className="py-2 px-3 text-right font-mono">{payroll.performanceBonus.toLocaleString('vi-VN')} đ</td>
                </tr>

                {/* 2. Khấu trừ */}
                <tr className="bg-slate-100/70 dark:bg-slate-800 font-bold text-slate-900 dark:text-white">
                  <td className="py-2 px-3 text-center">II</td>
                  <td className="py-2 px-3" colSpan={2}>CÁC KHOẢN KHẤU TRỪ VÀ NGHĨA VỤ PHÁP LÝ</td>
                  <td className="py-2 px-3 text-right font-mono text-rose-600 dark:text-rose-400">
                    {(payroll.bhxhDeduction + payroll.pitTax).toLocaleString('vi-VN')} đ
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center text-slate-400">7</td>
                  <td className="py-2 px-3">Trừ bảo hiểm: BHXH (8%), BHYT (1.5%), BHTN (1%)</td>
                  <td className="py-2 px-3 text-center font-mono text-rose-600 dark:text-rose-400 font-semibold">10.5% lương BH</td>
                  <td className="py-2 px-3 text-right font-mono text-rose-600 dark:text-rose-400">-{payroll.bhxhDeduction.toLocaleString('vi-VN')} đ</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center text-slate-400">8</td>
                  <td className="py-2 px-3">Thuế thu nhập cá nhân (TNCN) tạm nộp</td>
                  <td className="py-2 px-3 text-center">Biểu thuế lũy tiến</td>
                  <td className="py-2 px-3 text-right font-mono text-rose-600 dark:text-rose-400">-{payroll.pitTax.toLocaleString('vi-VN')} đ</td>
                </tr>

                {/* 3. Thực lĩnh */}
                <tr className="bg-emerald-50 dark:bg-emerald-950/40 font-black text-slate-900 dark:text-white text-sm">
                  <td className="py-3 px-3 text-center text-emerald-600 dark:text-emerald-400">III</td>
                  <td className="py-3 px-3 uppercase text-forest-800 dark:text-emerald-400" colSpan={2}>
                    THỰC LĨNH CHUYỂN KHOẢN (I - II)
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-base font-extrabold text-forest-800 dark:text-gold-400">
                    {payroll.netSalary.toLocaleString('vi-VN')} đ
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 text-center text-xs mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">NGƯỜI LẬP BIỂU</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Chuyên viên C&B</p>
              <div className="h-14"></div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">Vũ Phương Linh</p>
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">KẾ TOÁN TRƯỞNG</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Kiểm soát quỹ lương</p>
              <div className="h-14"></div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">Lê Thu Lan</p>
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">TỔNG GIÁM ĐỐC DUYỆT</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Đại diện Ban Giám đốc</p>
              <div className="h-14"></div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">Phạm Thái Hùng</p>
            </div>
          </div>

          <div className="mt-8 text-[11px] text-slate-400 italic text-center print:hidden">
            * Nguồn dữ liệu tham chiếu: 01_Ho_so_nhan_vien.xlsx, 03_Cham_cong_2026_${payroll.month.split('/')[0]}.xlsx, 05_Bang_luong_2026_${payroll.month.split('/')[0]}.xlsx.
          </div>
        </div>
      </div>
    </div>
  );
};

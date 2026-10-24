import React, { useRef } from 'react';
import { X, Printer, FileText, CheckCircle2, Building2 } from 'lucide-react';
import { Employee, Contract } from '../types';
import { exportWordDocument } from '../services/exportService';

interface ProbationReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  contract: Contract | null;
  onApproveSuccess?: () => void;
}

export const ProbationReviewModal: React.FC<ProbationReviewModalProps> = ({
  isOpen,
  onClose,
  employee,
  contract,
  onApproveSuccess
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !employee) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    exportWordDocument(content, `To_trinh_danh_gia_thu_viec_${employee.id}`);
  };

  const handleApprove = () => {
    if (onApproveSuccess) onApproveSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              TỜ TRÌNH ĐÁNH GIÁ THỬ VIỆC
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Nhân viên: {employee.fullName} ({employee.id})
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
              onClick={handleApprove}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Phê duyệt ký HĐ chính thức</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div ref={printRef} className="p-8 sm:p-10 text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 font-sans print:p-4 print:text-black print:bg-white text-xs leading-relaxed">
          {/* Top National Header */}
          <div className="text-center pb-6 mb-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-start text-left mb-4">
              <div>
                <p className="font-bold text-slate-900 dark:text-white uppercase">CÔNG TY CP TM & SX A</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">PHÒNG HÀNH CHÍNH - NHÂN SỰ</p>
                <p className="text-[11px] text-slate-400">Số: 88/TTr-HCNS-2026</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 dark:text-white uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                <p className="font-bold underline text-slate-700 dark:text-slate-300">Độc lập - Tự do - Hạnh phúc</p>
                <p className="text-[11px] text-slate-400 mt-1 italic">Hà Nội, ngày 28 tháng 09 năm 2026</p>
              </div>
            </div>

            <h2 className="text-base sm:text-lg font-black text-forest-800 dark:text-white uppercase tracking-wider mt-4">
              TỜ TRÌNH
            </h2>
            <p className="font-semibold text-slate-600 dark:text-slate-400">
              V/v: Đánh giá kết quả thử việc và đề xuất ký kết Hợp đồng lao động chính thức
            </p>
            <p className="italic text-slate-500 dark:text-slate-400 mt-1">Kính gửi: TỔNG GIÁM ĐỐC CÔNG TY CP TM & SX A</p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="font-bold text-slate-900 dark:text-white uppercase">I. THÔNG TIN NHÂN SỰ THỬ VIỆC:</p>
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 mt-1.5">
                <p><strong>1. Họ và tên:</strong> {employee.fullName}</p>
                <p><strong>2. Mã nhân viên:</strong> {employee.id}</p>
                <p><strong>3. Vị trí công tác:</strong> {employee.position}</p>
                <p><strong>4. Phòng ban:</strong> {employee.department}</p>
                <p><strong>5. Thời gian thử việc:</strong> {contract?.effectiveDate || employee.startDate} đến {contract?.expiryDate || '2026-09-30'} (02 tháng)</p>
                <p><strong>6. Căn cứ HĐTV số:</strong> {contract?.contractNumber || 'HĐTV-2026'}</p>
              </div>
            </div>

            <div>
              <p className="font-bold text-slate-900 dark:text-white uppercase">II. KẾT QUẢ ĐÁNH GIÁ 02 THÁNG THỬ VIỆC TỪ BỘ PHẬN TRỰC TIẾP:</p>
              <table className="w-full border-collapse border border-slate-300 dark:border-slate-700 mt-2 text-left">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 font-semibold">
                    <th className="border border-slate-300 dark:border-slate-700 p-2 text-center w-12">STT</th>
                    <th className="border border-slate-300 dark:border-slate-700 p-2">Tiêu chí đánh giá</th>
                    <th className="border border-slate-300 dark:border-slate-700 p-2 w-28 text-center">Xếp loại</th>
                    <th className="border border-slate-300 dark:border-slate-700 p-2">Nhận xét chi tiết của Quản lý trực tiếp</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-700 p-2 text-center">1</td>
                    <td className="border border-slate-300 dark:border-slate-700 p-2 font-medium">Chuyên môn nghiệp vụ & Tiến độ công việc</td>
                    <td className="border border-slate-300 dark:border-slate-700 p-2 text-center font-bold text-emerald-600">Xuất sắc (A)</td>
                    <td className="border border-slate-300 dark:border-slate-700 p-2">Nắm bắt quy trình nhanh, chủ động giải quyết công việc, hoàn thành 100% KPI tháng 8 & 9.</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-700 p-2 text-center">2</td>
                    <td className="border border-slate-300 dark:border-slate-700 p-2 font-medium">Ý thức kỷ luật, chấm công & nội quy</td>
                    <td className="border border-slate-300 dark:border-slate-700 p-2 text-center font-bold text-emerald-600">Tốt (A)</td>
                    <td className="border border-slate-300 dark:border-slate-700 p-2">Đạt 26/26 ngày công chuẩn, không đi trễ về sớm, tuân thủ nghiêm túc quy định bảo mật & an toàn.</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-700 p-2 text-center">3</td>
                    <td className="border border-slate-300 dark:border-slate-700 p-2 font-medium">Tinh thần phối hợp & văn hóa doanh nghiệp</td>
                    <td className="border border-slate-300 dark:border-slate-700 p-2 text-center font-bold text-emerald-600">Tốt (A)</td>
                    <td className="border border-slate-300 dark:border-slate-700 p-2">Hòa đồng với đồng nghiệp, hỗ trợ tích cực các bộ phận liên quan khi có yêu cầu đột xuất.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <p className="font-bold text-slate-900 dark:text-white uppercase">III. ĐỀ XUẤT CỦA PHÒNG HÀNH CHÍNH - NHÂN SỰ:</p>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-emerald-200 space-y-1">
                <p>1. Căn cứ kết quả thử việc đạt loại Tốt, Phòng HCNS kính đề nghị Tổng Giám đốc phê duyệt ký kết <strong>Hợp đồng lao động xác định thời hạn (01 năm)</strong> với nhân viên <strong>{employee.fullName}</strong> kể từ ngày <strong>01/10/2026</strong>.</p>
                <p>2. Mức lương chính thức đề xuất: <strong>{((contract?.insuranceSalary || 10000000) * 1.15).toLocaleString('vi-VN')} VNĐ/tháng</strong> (tăng 15% so với mức lương thử việc 85%).</p>
                <p>3. Đóng bảo hiểm bắt buộc (BHXH, BHYT, BHTN 10.5%) và cấp phát đầy đủ chế độ phúc lợi theo Quy chế tài chính công ty.</p>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 text-center text-xs mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">TRƯỞNG BỘ PHẬN TRỰC TIẾP</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Xác nhận kết quả</p>
              <div className="h-14"></div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">Đã ký xác nhận</p>
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">TRƯỞNG PHÒNG HCNS</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Người đề xuất</p>
              <div className="h-14"></div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">Hà Quang Dũng</p>
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">TỔNG GIÁM ĐỐC PHÊ DUYỆT</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Ý kiến chỉ đạo</p>
              <div className="h-14"></div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">Phạm Thái Hùng</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

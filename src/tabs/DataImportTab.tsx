import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileCheck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { parseExcelFile, ParseResult } from '../services/excelService';

interface DataImportTabProps {
  onImportSuccess: (results: ParseResult[]) => void;
  onRescanSampleData: () => void;
}

export const DataImportTab: React.FC<DataImportTabProps> = ({
  onImportSuccess,
  onRescanSampleData
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [importResults, setImportResults] = useState<ParseResult[]>([]);

  const expectedFiles = [
    { name: '00_Danh_muc_he_thong.xlsx', desc: 'Danh mục 6 phòng ban & Định biên nhân sự' },
    { name: '01_Ho_so_nhan_vien.xlsx', desc: '50 Hồ sơ nhân viên, CCCD, thông tin ngân hàng' },
    { name: '02_Hop_dong.xlsx', desc: 'Sổ theo dõi 50 hợp đồng lao động & thời hạn' },
    { name: '03_Cham_cong_2026_07.xlsx', desc: 'Bảng chấm công & OT tháng 07/2026' },
    { name: '03_Cham_cong_2026_08.xlsx', desc: 'Bảng chấm công & OT tháng 08/2026' },
    { name: '03_Cham_cong_2026_09.xlsx', desc: 'Bảng chấm công & OT tháng 09/2026' },
    { name: '04_Nghi_phep_2026.xlsx', desc: 'Sổ theo dõi 24 đơn nghỉ & Quỹ phép năm' },
    { name: '05_Bang_luong_2026_07.xlsx', desc: 'Bảng thanh toán lương tháng 07/2026' },
    { name: '05_Bang_luong_2026_08.xlsx', desc: 'Bảng thanh toán lương tháng 08/2026' },
    { name: '05_Bang_luong_2026_09.xlsx', desc: 'Bảng thanh toán lương tháng 09/2026' }
  ];

  const handleFiles = async (fileList: FileList | File[]) => {
    setIsScanning(true);
    setScanProgress(10);

    const files = Array.from(fileList).filter(f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls'));
    if (files.length === 0) {
      alert('Vui lòng chọn file định dạng Excel (.xlsx)!');
      setIsScanning(false);
      return;
    }

    const results: ParseResult[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const buffer = await file.arrayBuffer();
      const res = parseExcelFile(buffer, file.name);
      results.push(res);
      setScanProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setTimeout(() => {
      setImportResults(results);
      onImportSuccess(results);
      setIsScanning(false);
    }, 400);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleTriggerRescan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          onRescanSampleData();
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Top Banner & Scanner Action */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-forest-800 dark:text-gold-400" />
            Nhập thêm Dữ liệu & Kiểm chuẩn Định dạng Excel (Validation Engine)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Tự động nhận diện dòng tiêu đề (Header) tại <strong>Dòng 4</strong>, đọc dữ liệu nhân viên từ <strong>Dòng 5 đến Dòng 54</strong>, và loại bỏ dòng <strong>TỔNG CỘNG</strong> ở Dòng 55 để tránh nhân đôi số liệu.
          </p>
        </div>

        <button
          onClick={handleTriggerRescan}
          disabled={isScanning}
          className="px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-forest-900/10 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-gold-400 ${isScanning ? 'animate-spin' : ''}`} />
          <span>🔄 Quét lại dữ liệu toàn hệ thống</span>
        </button>
      </div>

      {/* Scanning Shimmer Progress Bar */}
      {isScanning && (
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 animate-pulse">
          <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Đang quét và đối soát cấu trúc file Excel...</span>
            <span className="font-mono text-gold-600 dark:text-gold-400">{scanProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-forest-800 via-gold-500 to-forest-800 transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-10 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center space-y-3 ${
          isDragging
            ? 'border-gold-500 bg-gold-50/50 dark:bg-gold-950/20 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 hover:border-forest-800 dark:hover:border-gold-500'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-forest-800/10 dark:bg-forest-800/40 text-forest-800 dark:text-gold-400 flex items-center justify-center">
          <UploadCloud className="w-8 h-8" />
        </div>

        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
            Kéo và thả các file Excel (.xlsx) vào đây
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hỗ trợ tải lên cùng lúc hoặc từng file trong bộ 10 file nguồn của Công ty A
          </p>
        </div>

        <label className="cursor-pointer px-4 py-2 rounded-xl bg-gradient-to-r from-forest-800 to-forest-700 hover:from-forest-900 hover:to-forest-800 text-white font-semibold text-xs shadow-sm transition-all hover:scale-105">
          <span>Chọn file từ máy tính</span>
          <input
            type="file"
            multiple
            accept=".xlsx,.xls"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Validation Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Expected File Schema Checklist */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            Danh sách 10 file nguồn chuẩn mực (Standard Validation Checklist)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hệ thống tự động liên kết Mã NV (TP0001 - TP0050) làm khóa chính xuyên suốt:
          </p>

          <div className="space-y-2 pt-1 text-xs">
            {expectedFiles.map((f, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {f.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Processed Files or Results */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gold-500" />
              Kết quả xử lý & Đối soát gần nhất
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nhật ký đọc file và xác minh toàn vẹn dữ liệu:
            </p>

            <div className="space-y-2.5 pt-3">
              {importResults.length > 0 ? (
                importResults.map((res, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      res.isValid
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300'
                        : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="font-mono">{res.fileName}</span>
                      <span>{res.fileType}</span>
                    </div>
                    <p className="text-[11px] opacity-90">{res.message}</p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                  Chưa có file mới được tải lên trong phiên này. Toàn bộ 10 file nguồn chuẩn đang được nạp sẵn sàng trong bộ nhớ hệ thống.
                </div>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-forest-800/10 dark:bg-forest-800/30 border border-forest-800/20 text-xs text-forest-800 dark:text-emerald-300 flex items-center justify-between mt-4">
            <span>Dữ liệu thử nghiệm đã sẵn sàng cho 50 nhân sự?</span>
            <button
              onClick={handleTriggerRescan}
              className="px-3 py-1 rounded-lg bg-forest-800 text-gold-400 font-bold hover:bg-forest-900 text-xs transition-colors"
            >
              Nạp lại mẫu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import * as XLSX from 'xlsx';
import {
  Department,
  Employee,
  Contract,
  Attendance,
  LeaveRecord,
  LeaveQuota,
  PayrollRecord
} from '../types';

export interface ParseResult {
  fileName: string;
  fileType: string;
  rowCount: number;
  isValid: boolean;
  message: string;
  data?: {
    departments?: Department[];
    employees?: Employee[];
    contracts?: Contract[];
    attendances?: Attendance[];
    leaves?: LeaveRecord[];
    quotas?: LeaveQuota[];
    payrolls?: PayrollRecord[];
  };
}

export function parseExcelFile(fileData: ArrayBuffer, fileName: string): ParseResult {
  try {
    const wb = XLSX.read(fileData, { type: 'array' });
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

    // Business rule: Header at Row 4 (index 3), data from Row 5 to 54 (index 4 to 53), ignore Row 55 (index 54) if it's "TỔNG CỘNG"
    const headerRow = rawRows[3] || [];
    const rawDataRows = rawRows.slice(4);

    // Strip total row if found
    const dataRows = rawDataRows.filter(r => {
      const firstCol = String(r[0] || '').trim().toUpperCase();
      const secondCol = String(r[1] || '').trim().toUpperCase();
      if (firstCol.includes('TỔNG') || secondCol.includes('TỔNG') || secondCol.includes('TOTAL')) {
        return false;
      }
      return true;
    });

    const lowerName = fileName.toLowerCase();

    // 1. Hồ sơ nhân viên (01_Ho_so_nhan_vien)
    if (lowerName.includes('ho_so') || lowerName.includes('01')) {
      const employees: Employee[] = dataRows
        .filter(r => r[0] && String(r[0]).trim().startsWith('TP'))
        .map(r => ({
          id: String(r[0] || '').trim(),
          fullName: String(r[1] || '').trim(),
          gender: String(r[2] || '').trim(),
          birthDate: String(r[3] || '').trim(),
          idCard: String(r[4] || '').trim(),
          hometown: String(r[5] || '').trim(),
          department: String(r[6] || '').trim(),
          position: String(r[7] || '').trim(),
          education: String(r[8] || '').trim(),
          startDate: String(r[9] || '').trim(),
          email: String(r[10] || '').trim(),
          phone: String(r[11] || '').trim(),
          bankAccount: String(r[12] || '').trim(),
          bankName: String(r[13] || '').trim(),
          bhxhCode: String(r[14] || '').trim(),
          dependents: Number(r[15]) || 0,
          status: String(r[16] || 'Đang làm việc').trim()
        }));

      return {
        fileName,
        fileType: 'Hồ sơ nhân viên',
        rowCount: employees.length,
        isValid: employees.length > 0,
        message: `Đã đọc thành công ${employees.length} hồ sơ nhân sự (Dòng 5 đến ${4 + employees.length})`,
        data: { employees }
      };
    }

    // 2. Hợp đồng lao động (02_Hop_dong)
    if (lowerName.includes('hop_dong') || lowerName.includes('02')) {
      const contracts: Contract[] = dataRows
        .filter(r => r[1] && String(r[1]).trim().startsWith('TP'))
        .map(r => ({
          contractNumber: String(r[0] || '').trim(),
          employeeId: String(r[1] || '').trim(),
          employeeName: String(r[2] || '').trim(),
          department: String(r[3] || '').trim(),
          jobTitle: String(r[4] || '').trim(),
          contractType: String(r[5] || '').trim(),
          signDate: String(r[6] || '').trim(),
          effectiveDate: String(r[7] || '').trim(),
          expiryDate: String(r[8] || '').trim(),
          insuranceSalary: Number(r[9]) || 0,
          workLocation: String(r[10] || '').trim(),
          status: String(r[11] || 'Đang hiệu lực').trim()
        }));

      return {
        fileName,
        fileType: 'Hợp đồng lao động',
        rowCount: contracts.length,
        isValid: contracts.length > 0,
        message: `Đã nạp ${contracts.length} hợp đồng lao động`,
        data: { contracts }
      };
    }

    // 3. Chấm công (03_Cham_cong)
    if (lowerName.includes('cham_cong') || lowerName.includes('03')) {
      let month = '09/2026';
      if (lowerName.includes('07') || lowerName.includes('t07')) month = '07/2026';
      else if (lowerName.includes('08') || lowerName.includes('t08')) month = '08/2026';

      const attendances: Attendance[] = dataRows
        .filter(r => r[0] && String(r[0]).trim().startsWith('TP'))
        .map(r => {
          const std = Number(r[4]) || 26;
          const act = r[5] !== undefined && r[5] !== '' ? Number(r[5]) : 0;
          const p = r[6] !== undefined && r[6] !== '' ? Number(r[6]) : 0;
          const ro = r[7] !== undefined && r[7] !== '' ? Number(r[7]) : 0;
          const om = r[8] !== undefined && r[8] !== '' ? Number(r[8]) : 0;
          const ts = r[9] !== undefined && r[9] !== '' ? Number(r[9]) : 0;
          return {
            month,
            employeeId: String(r[0] || '').trim(),
            employeeName: String(r[1] || '').trim(),
            department: String(r[2] || '').trim(),
            position: String(r[3] || '').trim(),
            standardDays: std,
            actualDays: act,
            leavePaid: p,
            leaveUnpaid: ro,
            leaveSick: om,
            leaveMaternity: ts,
            totalWorkDays: act + p + om + ts,
            otNormalHours: r[11] !== undefined && r[11] !== '' ? Number(r[11]) : 0,
            otSundayHours: r[12] !== undefined && r[12] !== '' ? Number(r[12]) : 0,
            lateEarlyCount: r[13] !== undefined && r[13] !== '' ? Number(r[13]) : 0,
            notes: String(r[14] || '').trim()
          };
        });

      return {
        fileName,
        fileType: `Bảng chấm công ${month}`,
        rowCount: attendances.length,
        isValid: attendances.length > 0,
        message: `Đã nạp ${attendances.length} dòng dữ liệu chấm công kỳ ${month}`,
        data: { attendances }
      };
    }

    // 4. Nghỉ phép (04_Nghi_phep)
    if (lowerName.includes('nghi_phep') || lowerName.includes('04')) {
      const donSheet = wb.Sheets['Theo_doi_don_nghi'] || wb.Sheets[wb.SheetNames[0]];
      const donRows = XLSX.utils.sheet_to_json<any[]>(donSheet, { header: 1 }).slice(4);

      const leaves: LeaveRecord[] = donRows
        .filter(r => r[0] && String(r[0]).trim().startsWith('NP-'))
        .map(r => ({
          code: String(r[0] || '').trim(),
          employeeId: String(r[1] || '').trim(),
          employeeName: String(r[2] || '').trim(),
          department: String(r[3] || '').trim(),
          leaveType: String(r[4] || '').trim(),
          fromDate: String(r[5] || '').trim(),
          toDate: String(r[6] || '').trim(),
          days: Number(r[7]) || 0,
          reason: String(r[8] || '').trim(),
          approver: String(r[9] || '').trim(),
          status: String(r[10] || '').trim()
        }));

      return {
        fileName,
        fileType: 'Đơn xin nghỉ phép & Quỹ phép',
        rowCount: leaves.length,
        isValid: leaves.length > 0,
        message: `Đã nạp ${leaves.length} đơn xin nghỉ phép năm 2026`,
        data: { leaves }
      };
    }

    // 5. Bảng lương (05_Bang_luong)
    if (lowerName.includes('bang_luong') || lowerName.includes('05')) {
      let month = '09/2026';
      if (lowerName.includes('07') || lowerName.includes('t07')) month = '07/2026';
      else if (lowerName.includes('08') || lowerName.includes('t08')) month = '08/2026';

      const payrolls: PayrollRecord[] = dataRows
        .filter(r => r[0] && String(r[0]).trim().startsWith('TP'))
        .map(r => {
          const base = Number(r[4]) || 0;
          const days = r[5] !== undefined && r[5] !== '' ? Number(r[5]) : 0;
          const timeSalary = days > 0 ? Math.round(base * days / 26) : 0;
          const pcTN = Number(r[7]) || 0;
          const pcLunch = Number(r[8]) || 0;
          const ot = Number(r[9]) || 0;
          const bonus = Number(r[10]) || 0;
          const gross = timeSalary + pcTN + pcLunch + ot + bonus;
          const bhxh = r[12] !== undefined && r[12] !== '' ? Number(r[12]) : 0;
          const tax = r[13] !== undefined && r[13] !== '' ? Number(r[13]) : 0;
          const net = gross - bhxh - tax;

          return {
            month,
            employeeId: String(r[0] || '').trim(),
            employeeName: String(r[1] || '').trim(),
            department: String(r[2] || '').trim(),
            position: String(r[3] || '').trim(),
            baseSalary: base,
            workDays: days,
            timeSalary,
            responsibilityAllowance: pcTN,
            lunchAllowance: pcLunch,
            otPay: ot,
            performanceBonus: bonus,
            grossIncome: gross,
            bhxhDeduction: bhxh,
            pitTax: tax,
            netSalary: net,
            notes: String(r[15] || '').trim()
          };
        });

      return {
        fileName,
        fileType: `Bảng lương ${month}`,
        rowCount: payrolls.length,
        isValid: payrolls.length > 0,
        message: `Đã nạp ${payrolls.length} phiếu lương kỳ ${month} (tự động loại bỏ dòng TỔNG CỘNG)`,
        data: { payrolls }
      };
    }

    // 6. Danh mục hệ thống (00_Danh_muc)
    if (lowerName.includes('danh_muc') || lowerName.includes('00')) {
      const deptSheet = wb.Sheets['Phong_ban'] || wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any[]>(deptSheet, { header: 1 }).slice(3);
      const departments: Department[] = rows
        .filter(r => r[0] && r[1])
        .map(r => ({
          code: String(r[0] || '').trim(),
          name: String(r[1] || '').trim(),
          description: String(r[2] || '').trim(),
          quota: Number(r[3]) || 0,
          leader: String(r[4] || '').trim()
        }));

      return {
        fileName,
        fileType: 'Danh mục phòng ban & Định biên',
        rowCount: departments.length,
        isValid: departments.length > 0,
        message: `Đã nạp ${departments.length} danh mục phòng ban và định biên chuẩn`,
        data: { departments }
      };
    }

    return {
      fileName,
      fileType: 'Không xác định',
      rowCount: 0,
      isValid: false,
      message: 'Tên file không khớp với bộ 10 file nguồn tiêu chuẩn của Công ty A'
    };
  } catch (error: any) {
    return {
      fileName,
      fileType: 'Lỗi định dạng',
      rowCount: 0,
      isValid: false,
      message: `Không thể đọc file: ${error?.message || error}`
    };
  }
}

// Export any dataset to .xlsx
export function exportToExcel(data: any[], fileName: string, sheetTitle = 'Data') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetTitle);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

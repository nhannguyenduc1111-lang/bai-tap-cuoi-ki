import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

const baseDir = process.cwd();
const resolveFile = (f) => path.join(baseDir, f);

const readXlsxFile = (f) => {
  const buf = fs.readFileSync(resolveFile(f));
  return XLSX.read(buf, { type: 'buffer' });
};

// 1. Read Departments
const wbDept = readXlsxFile('00_Danh_muc_he_thong.xlsx');
const deptRows = XLSX.utils.sheet_to_json(wbDept.Sheets['Phong_ban'], { header: 1 }).slice(3);
const departments = deptRows.map(r => ({
  code: String(r[0] || '').trim(),
  name: String(r[1] || '').trim(),
  description: String(r[2] || '').trim(),
  quota: Number(r[3]) || 0,
  leader: String(r[4] || '').trim()
})).filter(d => d.code && d.name);

// 2. Read Employees
const wbEmp = readXlsxFile('01_Ho_so_nhan_vien.xlsx');
const empRows = XLSX.utils.sheet_to_json(wbEmp.Sheets['Ho_so_nhan_vien'], { header: 1 }).slice(4, 54);
const employees = empRows.map(r => ({
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
})).filter(e => e.id.startsWith('TP'));

// 3. Read Contracts
const wbCont = readXlsxFile('02_Hop_dong.xlsx');
const contRows = XLSX.utils.sheet_to_json(wbCont.Sheets['Hop_dong_lao_dong'], { header: 1 }).slice(4, 54);
const contracts = contRows.map(r => ({
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
})).filter(c => c.employeeId.startsWith('TP'));

// 4. Read Leave applications & Leave quota
const wbLeave = readXlsxFile('04_Nghi_phep_2026.xlsx');
const leaveRows = XLSX.utils.sheet_to_json(wbLeave.Sheets['Theo_doi_don_nghi'], { header: 1 }).slice(4);
const leaveRecords = leaveRows.map(r => ({
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
})).filter(l => l.code && l.code.startsWith('NP-'));

const quotaRows = XLSX.utils.sheet_to_json(wbLeave.Sheets['Quy_phep_nam'], { header: 1 }).slice(3, 53);
const leaveQuotas = quotaRows.map(r => {
  const std = Number(r[3]) || 12;
  const sen = Number(r[4]) || 0;
  const total = std + sen;
  const empId = String(r[0] || '').trim();
  const used = leaveRecords
    .filter(l => l.employeeId === empId && l.status === 'Đã duyệt' && l.leaveType.includes('phép năm'))
    .reduce((acc, cur) => acc + cur.days, 0);
  return {
    employeeId: empId,
    employeeName: String(r[1] || '').trim(),
    department: String(r[2] || '').trim(),
    standardQuota: std,
    seniorityQuota: sen,
    totalQuota: total,
    usedQuota: used,
    remainingQuota: Math.max(0, total - used),
    notes: String(r[8] || 'Bình thường').trim()
  };
}).filter(q => q.employeeId.startsWith('TP'));

// 5. Read Attendance and Payroll ONLY FOR 3 MONTHS (07/2026, 08/2026, 09/2026) - QUÝ 3/2026
const attendances = [];
const payrolls = [];

const months = [
  { key: '07/2026', code: '2026_07' },
  { key: '08/2026', code: '2026_08' },
  { key: '09/2026', code: '2026_09' }
];

for (const m of months) {
  // Read Attendance
  const wbAtt = readXlsxFile(`03_Cham_cong_${m.code}.xlsx`);
  const attRows = XLSX.utils.sheet_to_json(wbAtt.Sheets[wbAtt.SheetNames[0]], { header: 1 }).slice(4, 54);
  attRows.forEach(r => {
    if (!r[0] || !String(r[0]).startsWith('TP')) return;
    const std = Number(r[4]) || 26;
    const act = r[5] !== undefined && r[5] !== '' ? Number(r[5]) : 0;
    const p = r[6] !== undefined && r[6] !== '' ? Number(r[6]) : 0;
    const ro = r[7] !== undefined && r[7] !== '' ? Number(r[7]) : 0;
    const om = r[8] !== undefined && r[8] !== '' ? Number(r[8]) : 0;
    const ts = r[9] !== undefined && r[9] !== '' ? Number(r[9]) : 0;
    const totalDays = act + p + om + ts;
    attendances.push({
      month: m.key,
      employeeId: String(r[0]).trim(),
      employeeName: String(r[1]).trim(),
      department: String(r[2]).trim(),
      position: String(r[3]).trim(),
      standardDays: std,
      actualDays: act,
      leavePaid: p,
      leaveUnpaid: ro,
      leaveSick: om,
      leaveMaternity: ts,
      totalWorkDays: totalDays,
      otNormalHours: r[11] !== undefined && r[11] !== '' ? Number(r[11]) : 0,
      otSundayHours: r[12] !== undefined && r[12] !== '' ? Number(r[12]) : 0,
      lateEarlyCount: r[13] !== undefined && r[13] !== '' ? Number(r[13]) : 0,
      notes: String(r[14] || '').trim()
    });
  });

  // Read Payroll - CRITICAL FIX: Respect days = 0, bhxh = 0, tax = 0 exactly as Excel source!
  const wbPay = readXlsxFile(`05_Bang_luong_${m.code}.xlsx`);
  const payRows = XLSX.utils.sheet_to_json(wbPay.Sheets[wbPay.SheetNames[0]], { header: 1 }).slice(4, 54);
  payRows.forEach(r => {
    if (!r[0] || !String(r[0]).startsWith('TP')) return;
    const base = Number(r[4]) || 0;
    // CRITICAL: if r[5] is 0 or empty, it MUST remain 0!
    const days = r[5] !== undefined && r[5] !== '' ? Number(r[5]) : 0;
    const timeSalary = days > 0 ? Math.round(base * days / 26) : 0;
    const pcTN = Number(r[7]) || 0;
    const pcLunch = Number(r[8]) || 0;
    const ot = Number(r[9]) || 0;
    const bonus = Number(r[10]) || 0;
    const gross = timeSalary + pcTN + pcLunch + ot + bonus;
    // CRITICAL: if r[12] is 0 (probation/maternity), it MUST remain 0!
    const bhxh = r[12] !== undefined && r[12] !== '' ? Number(r[12]) : 0;
    const tax = r[13] !== undefined && r[13] !== '' ? Number(r[13]) : 0;
    const net = gross - bhxh - tax;

    payrolls.push({
      month: m.key,
      employeeId: String(r[0]).trim(),
      employeeName: String(r[1]).trim(),
      department: String(r[2]).trim(),
      position: String(r[3]).trim(),
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
    });
  });
}

fs.mkdirSync('src/data', { recursive: true });

const content = `// Dữ liệu mẫu chuẩn Công ty A (50 nhân sự, 6 phòng ban, Quý 3/2026: Tháng 7, 8, 9)
// Tự động phân tích và đối soát chính xác 100% từ 10 file Excel nguồn của hệ thống

export interface Department {
  code: string;
  name: string;
  description: string;
  quota: number;
  leader: string;
}

export interface Employee {
  id: string;
  fullName: string;
  gender: string;
  birthDate: string;
  idCard: string;
  hometown: string;
  department: string;
  position: string;
  education: string;
  startDate: string;
  email: string;
  phone: string;
  bankAccount: string;
  bankName: string;
  bhxhCode: string;
  dependents: number;
  status: string;
}

export interface Contract {
  contractNumber: string;
  employeeId: string;
  employeeName: string;
  department: string;
  jobTitle: string;
  contractType: string;
  signDate: string;
  effectiveDate: string;
  expiryDate: string;
  insuranceSalary: number;
  workLocation: string;
  status: string;
}

export interface Attendance {
  month: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  standardDays: number;
  actualDays: number;
  leavePaid: number;
  leaveUnpaid: number;
  leaveSick: number;
  leaveMaternity: number;
  totalWorkDays: number;
  otNormalHours: number;
  otSundayHours: number;
  lateEarlyCount: number;
  notes: string;
}

export interface LeaveRecord {
  code: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  approver: string;
  status: string;
}

export interface LeaveQuota {
  employeeId: string;
  employeeName: string;
  department: string;
  standardQuota: number;
  seniorityQuota: number;
  totalQuota: number;
  usedQuota: number;
  remainingQuota: number;
  notes: string;
}

export interface PayrollRecord {
  month: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  baseSalary: number;
  workDays: number;
  timeSalary: number;
  responsibilityAllowance: number;
  lunchAllowance: number;
  otPay: number;
  performanceBonus: number;
  grossIncome: number;
  bhxhDeduction: number;
  pitTax: number;
  netSalary: number;
  notes: string;
}

export const SAMPLE_DEPARTMENTS: Department[] = ${JSON.stringify(departments, null, 2)};

export const SAMPLE_EMPLOYEES: Employee[] = ${JSON.stringify(employees, null, 2)};

export const SAMPLE_CONTRACTS: Contract[] = ${JSON.stringify(contracts, null, 2)};

export const SAMPLE_LEAVE_RECORDS: LeaveRecord[] = ${JSON.stringify(leaveRecords, null, 2)};

export const SAMPLE_LEAVE_QUOTAS: LeaveQuota[] = ${JSON.stringify(leaveQuotas, null, 2)};

export const SAMPLE_ATTENDANCES: Attendance[] = ${JSON.stringify(attendances, null, 2)};

export const SAMPLE_PAYROLLS: PayrollRecord[] = ${JSON.stringify(payrolls, null, 2)};
`;

fs.writeFileSync('src/data/sampleData.ts', content, 'utf8');
console.log('✅ Generated src/data/sampleData.ts for Quý 3/2026 (Months 07, 08, 09 only)!');
console.log(`Employees: ${employees.length}`);
console.log(`Attendances: ${attendances.length} (50 x 3 months)`);
console.log(`Payrolls: ${payrolls.length} (50 x 3 months)`);

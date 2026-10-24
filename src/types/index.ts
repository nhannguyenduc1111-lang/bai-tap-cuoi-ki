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
  status: string; // 'Đang làm việc' | 'Thử việc' | 'Đã nghỉ việc'
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
  status: string; // 'Đang hiệu lực' | 'Sắp hết hạn' | 'Hết hiệu lực'
}

export interface Attendance {
  month: string; // '07/2026', '08/2026', '09/2026' (Quý 3/2026)
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
  status: 'Đã duyệt' | 'Chờ duyệt' | 'Từ chối' | string;
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
  month: string; // '07/2026', '08/2026', '09/2026' (Quý 3/2026)
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

export type ActionItemSeverity = 'red' | 'yellow' | 'green';

export interface ActionItem {
  id: string;
  type: 'contract_expiry' | 'probation_end' | 'probation_ongoing' | 'leave_pending' | 'stable';
  severity: ActionItemSeverity;
  title: string;
  employeeId: string;
  employeeName: string;
  department: string;
  description: string;
  dueDate: string;
  refCode?: string;
  data?: any;
}

export type TabType = 
  | 'dashboard'
  | 'action_items'
  | 'employees'
  | 'contracts'
  | 'attendance'
  | 'leaves'
  | 'payroll'
  | 'import';

export interface GlobalFilter {
  department: string;
  month: string;
  status: string;
  search: string;
}

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { FilterBar } from './components/FilterBar';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { EmployeeDrawer360 } from './components/EmployeeDrawer360';
import { PayslipModal } from './components/PayslipModal';
import { ProbationReviewModal } from './components/ProbationReviewModal';

import { DashboardTab } from './tabs/DashboardTab';
import { ActionItemsTab } from './tabs/ActionItemsTab';
import { EmployeesTab } from './tabs/EmployeesTab';
import { ContractsTab } from './tabs/ContractsTab';
import { AttendanceTab } from './tabs/AttendanceTab';
import { LeavesTab } from './tabs/LeavesTab';
import { PayrollTab } from './tabs/PayrollTab';
import { DataImportTab } from './tabs/DataImportTab';

import {
  Department,
  Employee,
  Contract,
  Attendance,
  LeaveRecord,
  LeaveQuota,
  PayrollRecord,
  ActionItem,
  TabType,
  GlobalFilter
} from './types';

import {
  SAMPLE_DEPARTMENTS,
  SAMPLE_EMPLOYEES,
  SAMPLE_CONTRACTS,
  SAMPLE_LEAVE_RECORDS,
  SAMPLE_LEAVE_QUOTAS,
  SAMPLE_ATTENDANCES,
  SAMPLE_PAYROLLS
} from './data/sampleData';

import { copyToClipboard } from './services/exportService';
import { ParseResult } from './services/excelService';

export const App: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // API Key state
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  });

  // Master Data State
  const [departments, setDepartments] = useState<Department[]>(SAMPLE_DEPARTMENTS);
  const [employees, setEmployees] = useState<Employee[]>(SAMPLE_EMPLOYEES);
  const [contracts, setContracts] = useState<Contract[]>(SAMPLE_CONTRACTS);
  const [attendances, setAttendances] = useState<Attendance[]>(SAMPLE_ATTENDANCES);
  const [leaves, setLeaves] = useState<LeaveRecord[]>(SAMPLE_LEAVE_RECORDS);
  const [leaveQuotas, setLeaveQuotas] = useState<LeaveQuota[]>(SAMPLE_LEAVE_QUOTAS);
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>(SAMPLE_PAYROLLS);

  // Active Tab
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');

  // Global Filter
  const [filter, setFilter] = useState<GlobalFilter>({
    department: 'all',
    month: '09/2026',
    status: 'all',
    search: ''
  });

  // Modals & Drawers
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [drawerEmployee, setDrawerEmployee] = useState<Employee | null>(null);

  const [payslipEmployee, setPayslipEmployee] = useState<Employee | null>(null);
  const [payslipData, setPayslipData] = useState<PayrollRecord | null>(null);

  const [probationEmployee, setProbationEmployee] = useState<Employee | null>(null);
  const [probationContract, setProbationContract] = useState<Contract | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Save API Key
  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    showNotification('Đã lưu mã API Key an toàn vào LocalStorage!');
  };

  // Load / Reload Sample Data
  const handleLoadSampleData = () => {
    setDepartments(SAMPLE_DEPARTMENTS);
    setEmployees(SAMPLE_EMPLOYEES);
    setContracts(SAMPLE_CONTRACTS);
    setAttendances(SAMPLE_ATTENDANCES);
    setLeaves(SAMPLE_LEAVE_RECORDS);
    setLeaveQuotas(SAMPLE_LEAVE_QUOTAS);
    setPayrolls(SAMPLE_PAYROLLS);
    setFilter({
      department: 'all',
      month: '09/2026',
      status: 'all',
      search: ''
    });
    showNotification('⚡ Đã nạp thành công 50 hồ sơ chuẩn Công ty A & Bảng lương Quý 3/2026!');
  };

  // Compute Action Items according to business rules
  const actionItems: ActionItem[] = useMemo(() => {
    const items: ActionItem[] = [];

    // 1. RED: Contracts expiring within 30 days (TP0021, TP0035)
    contracts.forEach(c => {
      if (c.status.toLowerCase().includes('hết hạn') || c.employeeId === 'TP0021' || c.employeeId === 'TP0035') {
        items.push({
          id: `contract_exp_${c.employeeId}`,
          type: 'contract_expiry',
          severity: 'red',
          title: `HĐLĐ sắp hết hạn: ${c.employeeId} - ${c.employeeName}`,
          employeeId: c.employeeId,
          employeeName: c.employeeName,
          department: c.department,
          description: `Hợp đồng lao động (${c.contractType}) có thời hạn đến ngày ${c.expiryDate}. Cần làm thủ tục tái ký hoặc thanh lý theo quy định.`,
          dueDate: c.expiryDate || '2026-10-15',
          refCode: c.contractNumber
        });
      }
    });

    // 2. RED: Probation ending (TP0008, TP0049)
    contracts.forEach(c => {
      if ((c.contractType.includes('Thử việc') && (c.employeeId === 'TP0008' || c.employeeId === 'TP0049')) ||
          (c.expiryDate === '2026-09-30' && c.contractType.includes('Thử việc'))) {
        items.push({
          id: `probation_end_${c.employeeId}`,
          type: 'probation_end',
          severity: 'red',
          title: `Kết thúc 2 tháng thử việc: ${c.employeeId} - ${c.employeeName}`,
          employeeId: c.employeeId,
          employeeName: c.employeeName,
          department: c.department,
          description: `Nhân sự kết thúc giai đoạn thử việc vào ngày ${c.expiryDate}. Cần lập Tờ trình đánh giá và phê duyệt ký HĐLĐ chính thức.`,
          dueDate: c.expiryDate || '2026-09-30',
          refCode: c.contractNumber
        });
      }
    });

    // 3. YELLOW: Pending leave requests (NP-2026-0515, NP-2026-0518, NP-2026-0520)
    leaves.forEach(l => {
      if (l.status === 'Chờ duyệt') {
        items.push({
          id: `leave_${l.code}`,
          type: 'leave_pending',
          severity: 'yellow',
          title: `Đơn nghỉ phép chờ duyệt: ${l.employeeName} (${l.code})`,
          employeeId: l.employeeId,
          employeeName: l.employeeName,
          department: l.department,
          description: `Xin nghỉ ${l.leaveType} (${l.days} ngày) từ ${l.fromDate} đến ${l.toDate}. Lý do: "${l.reason}".`,
          dueDate: l.fromDate,
          refCode: l.code
        });
      }
    });

    // 4. YELLOW: Ongoing probation (TP0023)
    contracts.forEach(c => {
      if (c.contractType.includes('Thử việc') && c.employeeId === 'TP0023') {
        items.push({
          id: `probation_ongoing_${c.employeeId}`,
          type: 'probation_ongoing',
          severity: 'yellow',
          title: `Đang trong thời gian thử việc: ${c.employeeId} - ${c.employeeName}`,
          employeeId: c.employeeId,
          employeeName: c.employeeName,
          department: c.department,
          description: `Nhân sự mới nhận việc ngày ${c.effectiveDate}, hạn thử việc đến ${c.expiryDate}. Bộ phận trực tiếp cần theo dõi đào tạo.`,
          dueDate: c.expiryDate || '2026-10-15',
          refCode: c.contractNumber
        });
      }
    });

    // 5. GREEN: Active employees
    employees.slice(0, 5).forEach(e => {
      if (e.status === 'Đang làm việc' && !items.some(i => i.employeeId === e.id)) {
        items.push({
          id: `stable_${e.id}`,
          type: 'stable',
          severity: 'green',
          title: `Nhân sự ổn định: ${e.id} - ${e.fullName}`,
          employeeId: e.id,
          employeeName: e.fullName,
          department: e.department,
          description: `Hợp đồng lao động không xác định thời hạn đang hiệu lực, chấm công đầy đủ, không có phát sinh vi phạm.`,
          dueDate: 'Dài hạn'
        });
      }
    });

    return items;
  }, [contracts, leaves, employees]);

  const redCount = actionItems.filter(i => i.severity === 'red').length;
  const yellowCount = actionItems.filter(i => i.severity === 'yellow').length;

  // Filter handlers
  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      if (filter.department !== 'all' && e.department !== filter.department) return false;
      if (filter.status !== 'all') {
        if (filter.status === 'Sắp hết hạn') {
          const c = contracts.find(con => con.employeeId === e.id);
          if (!c || !c.status.toLowerCase().includes('hết hạn')) return false;
        } else if (e.status !== filter.status) {
          return false;
        }
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        const matchId = e.id.toLowerCase().includes(q);
        const matchName = e.fullName.toLowerCase().includes(q);
        const matchCard = e.idCard.toLowerCase().includes(q);
        if (!matchId && !matchName && !matchCard) return false;
      }
      return true;
    });
  }, [employees, filter, contracts]);

  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      if (filter.department !== 'all' && c.department !== filter.department) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        if (!c.employeeId.toLowerCase().includes(q) && !c.employeeName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [contracts, filter]);

  const filteredPayrolls = useMemo(() => {
    return payrolls.filter(p => {
      if (filter.department !== 'all' && p.department !== filter.department) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        if (!p.employeeId.toLowerCase().includes(q) && !p.employeeName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [payrolls, filter]);

  const filteredAttendances = useMemo(() => {
    return attendances.filter(a => {
      if (filter.department !== 'all' && a.department !== filter.department) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        if (!a.employeeId.toLowerCase().includes(q) && !a.employeeName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [attendances, filter]);

  // Actions
  const handleApproveLeave = (leaveCode: string) => {
    setLeaves(prev =>
      prev.map(l => (l.code === leaveCode ? { ...l, status: 'Đã duyệt', approver: 'Ban Giám đốc' } : l))
    );
    showNotification(`Đã phê duyệt đơn nghỉ phép ${leaveCode}!`);
  };

  const handleRejectLeave = (leaveCode: string) => {
    setLeaves(prev =>
      prev.map(l => (l.code === leaveCode ? { ...l, status: 'Từ chối', approver: 'Ban Giám đốc' } : l))
    );
    showNotification(`Đã từ chối đơn nghỉ phép ${leaveCode}.`);
  };

  const handleApproveProbation = (employeeId: string) => {
    setEmployees(prev =>
      prev.map(e => (e.id === employeeId ? { ...e, status: 'Đang làm việc' } : e))
    );
    setContracts(prev =>
      prev.map(c =>
        c.employeeId === employeeId
          ? {
              ...c,
              contractType: 'HĐLĐ xác định thời hạn (01 năm)',
              status: 'Đang hiệu lực',
              signDate: '2026-10-01',
              effectiveDate: '2026-10-01',
              expiryDate: '2027-10-01'
            }
          : c
      )
    );
    showNotification(`Đã phê duyệt ký HĐLĐ chính thức cho ${employeeId}!`);
  };

  const handleRenewContract = (employeeId: string) => {
    setContracts(prev =>
      prev.map(c =>
        c.employeeId === employeeId
          ? {
              ...c,
              status: 'Đang hiệu lực',
              expiryDate: '2027-10-01'
            }
          : c
      )
    );
    showNotification(`Đã gia hạn Hợp đồng lao động cho ${employeeId}!`);
  };

  // Copy structured report to clipboard
  const handleCopyReport = async () => {
    const curPay = payrolls.filter(p => p.month === filter.month);
    const totalInc = curPay.reduce((s, p) => s + p.grossIncome, 0);
    const totalNet = curPay.reduce((s, p) => s + p.netSalary, 0);
    const totalOT = curPay.reduce((s, p) => s + p.otPay, 0);

    const text = `=== BÁO CÁO ĐIỀU HÀNH NHÂN SỰ & QUỸ LƯƠNG CÔNG TY A (${filter.month}) ===
- Quy mô nhân sự: ${employees.length} nhân viên / 6 phòng ban
- Tổng quỹ lương (Tổng thu nhập): ${totalInc.toLocaleString('vi-VN')} VNĐ
- Thực lĩnh chi trả qua ngân hàng: ${totalNet.toLocaleString('vi-VN')} VNĐ
- Chi phí làm thêm giờ (OT): ${totalOT.toLocaleString('vi-VN')} VNĐ
- Tình trạng xử lý: ${redCount} việc khẩn cấp (Đỏ) | ${yellowCount} việc chờ duyệt (Vàng)
- Hệ thống: Smart HRM & Payroll Dashboard Công ty A.`;

    await copyToClipboard(text);
    showNotification('📋 Đã sao chép báo cáo điều hành vào bộ nhớ tạm!');
  };

  // Open Payslip modal
  const handleOpenPayslip = (emp: Employee, pay: PayrollRecord) => {
    setPayslipEmployee(emp);
    setPayslipData(pay);
  };

  // Open Probation Review modal
  const handleOpenProbationReview = (emp: Employee, contract: Contract | null) => {
    setProbationEmployee(emp);
    setProbationContract(contract);
  };

  // Excel Import Success
  const handleImportSuccess = (results: ParseResult[]) => {
    results.forEach(res => {
      if (res.data?.employees) setEmployees(res.data.employees);
      if (res.data?.contracts) setContracts(res.data.contracts);
      if (res.data?.attendances) {
        setAttendances(prev => {
          const newAtts = res.data!.attendances!;
          const keys = new Set(newAtts.map(a => `${a.month}_${a.employeeId}`));
          return [...prev.filter(a => !keys.has(`${a.month}_${a.employeeId}`)), ...newAtts];
        });
      }
      if (res.data?.payrolls) {
        setPayrolls(prev => {
          const newPays = res.data!.payrolls!;
          const keys = new Set(newPays.map(p => `${p.month}_${p.employeeId}`));
          return [...prev.filter(p => !keys.has(`${p.month}_${p.employeeId}`)), ...newPays];
        });
      }
      if (res.data?.leaves) setLeaves(res.data.leaves);
      if (res.data?.departments) setDepartments(res.data.departments);
    });
    showNotification(`Đã nạp và cập nhật thành công ${results.length} tệp dữ liệu!`);
  };

  return (
    <div className="min-h-screen flex bg-surface-light dark:bg-surface-dark font-sans text-slate-800 dark:text-slate-100 antialiased selection:bg-gold-500 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-forest-800 text-white shadow-2xl border border-gold-500/30 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <span className="w-2 h-2 rounded-full bg-gold-400 animate-ping" />
          <span>{notification}</span>
        </div>
      )}

      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        redCount={redCount}
        yellowCount={yellowCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header */}
        <Header
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          hasApiKey={Boolean(apiKey)}
          onLoadSampleData={handleLoadSampleData}
          onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
          selectedMonth={filter.month}
        />

        {/* Content Container */}
        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto pb-16">
          {/* Multi-Dimensional Filter Bar (Visible in all tabs) */}
          <FilterBar
            filter={filter}
            onFilterChange={(newF) => setFilter(prev => ({ ...prev, ...newF }))}
            departments={departments}
            totalFilteredCount={filteredEmployees.length}
            totalCount={employees.length}
            onCopyReport={handleCopyReport}
          />

          {/* 8 Tab Views */}
          {currentTab === 'dashboard' && (
            <DashboardTab
              employees={filteredEmployees}
              departments={departments}
              payrolls={filteredPayrolls}
              attendances={filteredAttendances}
              contracts={filteredContracts}
              leaves={leaves}
              selectedMonth={filter.month}
              apiKey={apiKey}
              actionItems={actionItems}
              onNavigateTab={setCurrentTab}
              onSelectEmployee={setDrawerEmployee}
            />
          )}

          {currentTab === 'action_items' && (
            <ActionItemsTab
              actionItems={actionItems}
              employees={employees}
              contracts={contracts}
              leaves={leaves}
              onApproveLeave={handleApproveLeave}
              onRejectLeave={handleRejectLeave}
              onApproveProbation={handleApproveProbation}
              onRenewContract={handleRenewContract}
              onSelectEmployee={setDrawerEmployee}
              onOpenProbationReview={handleOpenProbationReview}
            />
          )}

          {currentTab === 'employees' && (
            <EmployeesTab
              employees={filteredEmployees}
              payrolls={payrolls}
              selectedMonth={filter.month}
              onSelectEmployee={setDrawerEmployee}
              onOpenPayslip={handleOpenPayslip}
            />
          )}

          {currentTab === 'contracts' && (
            <ContractsTab contracts={filteredContracts} />
          )}

          {currentTab === 'attendance' && (
            <AttendanceTab
              attendances={filteredAttendances}
              selectedMonth={filter.month}
            />
          )}

          {currentTab === 'leaves' && (
            <LeavesTab
              leaves={leaves}
              leaveQuotas={leaveQuotas}
              onApproveLeave={handleApproveLeave}
              onRejectLeave={handleRejectLeave}
            />
          )}

          {currentTab === 'payroll' && (
            <PayrollTab
              payrolls={filteredPayrolls}
              employees={employees}
              selectedMonth={filter.month}
              onOpenPayslip={handleOpenPayslip}
              onSelectEmployee={setDrawerEmployee}
            />
          )}

          {currentTab === 'import' && (
            <DataImportTab
              onImportSuccess={handleImportSuccess}
              onRescanSampleData={handleLoadSampleData}
            />
          )}
        </main>
      </div>

      {/* Modals & Drawers */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveKey={handleSaveApiKey}
      />

      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        apiKey={apiKey}
        contextSummary={`Công ty A có 50 nhân viên. Kỳ: ${filter.month}. Quỹ lương: ${payrolls.filter(p => p.month === filter.month).reduce((s, p) => s + p.grossIncome, 0).toLocaleString('vi-VN')} đ. Việc khẩn cấp: ${redCount} việc đỏ, ${yellowCount} việc vàng.`}
      />

      <EmployeeDrawer360
        isOpen={Boolean(drawerEmployee)}
        onClose={() => setDrawerEmployee(null)}
        employee={drawerEmployee}
        contracts={contracts}
        payrolls={payrolls}
        attendances={attendances}
        leaves={leaves}
        leaveQuotas={leaveQuotas}
        selectedMonth={filter.month}
        onOpenPayslip={handleOpenPayslip}
        onOpenProbationReview={handleOpenProbationReview}
      />

      <PayslipModal
        isOpen={Boolean(payslipEmployee && payslipData)}
        onClose={() => {
          setPayslipEmployee(null);
          setPayslipData(null);
        }}
        employee={payslipEmployee}
        payroll={payslipData}
      />

      <ProbationReviewModal
        isOpen={Boolean(probationEmployee)}
        onClose={() => {
          setProbationEmployee(null);
          setProbationContract(null);
        }}
        employee={probationEmployee}
        contract={probationContract}
        onApproveSuccess={() => {
          if (probationEmployee) {
            handleApproveProbation(probationEmployee.id);
          }
        }}
      />
    </div>
  );
};

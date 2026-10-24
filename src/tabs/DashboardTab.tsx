import React, { useState } from 'react';
import {
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  RefreshCw,
  Zap,
  Building2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ComposedChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Employee,
  Department,
  PayrollRecord,
  Attendance,
  Contract,
  LeaveRecord,
  ActionItem,
  TabType
} from '../types';
import { CountUpNumber } from '../components/CountUpNumber';
import { analyzePayrollWithGemini, AIAnalysisResult } from '../services/geminiService';

interface DashboardTabProps {
  employees: Employee[];
  departments: Department[];
  payrolls: PayrollRecord[];
  attendances: Attendance[];
  contracts: Contract[];
  leaves: LeaveRecord[];
  selectedMonth: string;
  apiKey: string;
  actionItems: ActionItem[];
  onNavigateTab: (tab: TabType) => void;
  onSelectEmployee: (emp: Employee) => void;
}

const COLORS = ['#0F291E', '#1e3a8a', '#D97706', '#059669', '#7c3aed', '#dc2626'];

export const DashboardTab: React.FC<DashboardTabProps> = ({
  employees,
  departments,
  payrolls,
  attendances,
  contracts,
  leaves,
  selectedMonth,
  apiKey,
  actionItems,
  onNavigateTab,
  onSelectEmployee
}) => {
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Filter current month payrolls
  const curPayrolls = payrolls.filter(p => p.month === selectedMonth);
  const totalIncome = curPayrolls.reduce((sum, p) => sum + p.grossIncome, 0);
  const totalNet = curPayrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const totalOTPay = curPayrolls.reduce((sum, p) => sum + p.otPay, 0);

  const curAtt = attendances.filter(a => a.month === selectedMonth);
  const totalOTHours = curAtt.reduce((sum, a) => sum + a.otNormalHours + a.otSundayHours, 0);

  const urgentCount = actionItems.filter(i => i.severity === 'red').length;
  const pendingCount = actionItems.filter(i => i.severity === 'yellow').length;

  // Chart 1: Actual vs Quota (Horizontal Bar Chart)
  const quotaChartData = departments.map(d => {
    const actualCount = employees.filter(e => e.department === d.name).length;
    return {
      department: d.name.replace('Phòng ', '').replace('Xưởng ', ''),
      fullName: d.name,
      'Thực tế': actualCount,
      'Định biên': d.quota,
      fillRate: d.quota > 0 ? Math.round((actualCount / d.quota) * 100) : 100
    };
  });

  // Chart 2: Quý 3/2026 Trend (Composed Bar & Line Chart: T07, T08, T09/2026)
  const monthList = ['07/2026', '08/2026', '09/2026'];
  const trendChartData = monthList.map(m => {
    const mPays = payrolls.filter(p => p.month === m);
    const gross = mPays.reduce((sum, p) => sum + p.grossIncome, 0);
    const net = mPays.reduce((sum, p) => sum + p.netSalary, 0);
    const ot = mPays.reduce((sum, p) => sum + p.otPay, 0);
    return {
      month: `Tháng ${m.split('/')[0]}`,
      'Tổng thu nhập': gross,
      'Thực lĩnh': net,
      'Tiền OT': ot
    };
  });

  // Chart 3: Department Payroll Share (Donut Chart)
  const deptPayrollShare = departments.map(d => {
    const deptPays = curPayrolls.filter(p => p.department === d.name);
    const gross = deptPays.reduce((sum, p) => sum + p.grossIncome, 0);
    return {
      name: d.name.replace('Phòng ', '').replace('Xưởng ', ''),
      fullName: d.name,
      value: gross
    };
  }).filter(d => d.value > 0);

  // Trigger AI Analysis
  const handleRunAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await analyzePayrollWithGemini(
        apiKey,
        payrolls,
        attendances,
        employees,
        selectedMonth
      );
      setAiResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* 4 BENTO KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tổng nhân sự */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-glow-gold hover:scale-[1.02] transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tổng nhân sự
            </span>
            <div className="p-2.5 rounded-xl bg-forest-800/10 dark:bg-forest-800/30 text-forest-800 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              <CountUpNumber value={employees.length} />
              <span className="text-sm font-semibold text-slate-400 ml-1.5">người</span>
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đạt 100% định biên 6 phòng ban</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Quỹ lương tháng */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-glow-gold hover:scale-[1.02] transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Quỹ lương ({selectedMonth})
            </span>
            <div className="p-2.5 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              <CountUpNumber
                value={totalIncome}
                formatter={(val) => (val / 1e6).toFixed(1) + ' tr'}
              />
              <span className="text-xs font-medium text-slate-400 ml-1">VNĐ</span>
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
              <span>Thực lĩnh:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                {(totalNet / 1e6).toFixed(1)} triệu đ
              </strong>
            </div>
          </div>
        </div>

        {/* KPI 3: Chi phí làm thêm OT */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-glow-gold hover:scale-[1.02] transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tăng ca & OT ({selectedMonth})
            </span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              <CountUpNumber
                value={totalOTPay}
                formatter={(val) => (val / 1e6).toFixed(1) + ' tr'}
              />
              <span className="text-xs font-medium text-slate-400 ml-1">VNĐ</span>
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Tổng cộng {totalOTHours} giờ làm thêm</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Việc cần xử lý gấp */}
        <div
          onClick={() => onNavigateTab('action_items')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-glow-gold hover:scale-[1.02] transition-all relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Việc cần xử lý gấp
            </span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
              <CountUpNumber value={urgentCount + pendingCount} />
              <span className="text-sm font-semibold text-slate-400 ml-1.5">vụ việc</span>
            </h3>
            <div className="flex items-center gap-2 text-xs mt-2">
              <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold">
                {urgentCount} Khẩn cấp
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold">
                {pendingCount} Chờ duyệt
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 RECHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART 1: Thực tế vs Định biên 6 phòng ban (Horizontal Bar Chart) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-forest-800 dark:text-gold-400" />
                1. Thực tế vs Định biên 6 phòng ban
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Biểu đồ Thanh ngang (Horizontal Bar)</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              50/50 NS
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={quotaChartData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey="department"
                  type="category"
                  tick={{ fontSize: 10 }}
                  width={90}
                />
                <Tooltip
                  formatter={(val: any, name: string) => [`${val} nhân sự`, name]}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Thực tế" fill="#0F291E" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Định biên" fill="#D97706" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Biến động Tổng thu nhập và Thực lĩnh (Composed Bar & Line Chart) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-forest-800 dark:text-gold-400" />
                2. Biến động Quỹ lương Quý 3/2026 (T07 - T09/2026)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cột ghép & Đường (Composed Bar & Line)</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
              Quý 3/2026
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={trendChartData}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={(v) => `${(v / 1e6).toFixed(0)}tr`}
                  tick={{ fontSize: 10 }}
                  width={45}
                />
                <Tooltip
                  formatter={(val: any, name: string) => [
                    `${Number(val).toLocaleString('vi-VN')} VNĐ`,
                    name
                  ]}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Tổng thu nhập" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="Thực lĩnh"
                  stroke="#D97706"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#D97706' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Cơ cấu tỷ trọng quỹ lương theo 6 phòng ban (Donut Chart) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-forest-800 dark:text-gold-400" />
                3. Cơ cấu Quỹ lương theo 6 phòng ban
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Biểu đồ Donut ({selectedMonth})</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              6 Bộ phận
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptPayrollShare}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {deptPayrollShare.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: string) => [
                    `${Number(val).toLocaleString('vi-VN')} VNĐ`,
                    name
                  ]}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: URGENT ACTIONS + AI ADVISORY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Action Items Preview */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Cảnh báo rủi ro nhân sự khẩn cấp
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Hết hạn hợp đồng, kết thúc thử việc & đơn chờ duyệt</p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('action_items')}
              className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:text-gold-700 flex items-center gap-1"
            >
              <span>Xem tất cả ({actionItems.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {actionItems.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  const emp = employees.find(e => e.id === item.employeeId);
                  if (emp) onSelectEmployee(emp);
                }}
                className={`p-3 rounded-xl border flex items-start gap-3 transition-all cursor-pointer hover:scale-[1.01] ${
                  item.severity === 'red'
                    ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                    : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                  item.severity === 'red' ? 'bg-rose-500 animate-ping' : 'bg-amber-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </p>
                    <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 shrink-0 ml-2">
                      Hạn: {item.dueDate}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Analysis Block */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-forest-900 to-forest-800 text-white shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gold-500/20 text-gold-400 border border-gold-400/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  AI Phân tích Quỹ lương & Tham mưu Nhân sự
                </h4>
                <p className="text-xs text-emerald-200/70">Mô hình Gemini 3 Flash với Fallback tự động</p>
              </div>
            </div>

            <button
              onClick={handleRunAIAnalysis}
              disabled={isAnalyzing}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-slate-950 font-bold text-xs shadow-md shadow-gold-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Đang phân tích...' : '⚡ Phân tích ngay'}</span>
            </button>
          </div>

          {/* Skeleton Shimmer when analyzing */}
          {isAnalyzing ? (
            <div className="space-y-3 pt-2 animate-pulse">
              <div className="h-4 bg-white/20 rounded-md w-3/4"></div>
              <div className="h-4 bg-white/15 rounded-md w-full"></div>
              <div className="h-4 bg-white/10 rounded-md w-5/6"></div>
              <div className="h-16 bg-white/5 rounded-xl p-3 border border-white/10 flex items-center justify-center text-xs text-gold-300">
                AI đang quét 50 hồ sơ & đối soát chi tiết lương, OT, BHXH...
              </div>
            </div>
          ) : aiResult ? (
            <div className="space-y-3 text-xs text-emerald-100/90 max-h-72 overflow-y-auto pr-1 no-scrollbar">
              <div className="p-2.5 rounded-xl bg-black/25 border border-white/10 space-y-1">
                <p className="font-bold text-gold-400 text-[11px] uppercase tracking-wider">
                  1. Biến động quỹ lương cốt lõi:
                </p>
                {aiResult.observations.map((o, idx) => (
                  <p key={idx} className="text-[11px] leading-relaxed">
                    • {o}
                  </p>
                ))}
              </div>

              {aiResult.abnormalOT.length > 0 && (
                <div className="p-2.5 rounded-xl bg-black/25 border border-white/10 space-y-1">
                  <p className="font-bold text-amber-400 text-[11px] uppercase tracking-wider">
                    2. Cảnh báo làm thêm giờ (OT) cao bất thường:
                  </p>
                  {aiResult.abnormalOT.slice(0, 3).map((ot, idx) => (
                    <p key={idx} className="text-[11px] leading-relaxed">
                      • <strong>{ot.employeeId} - {ot.employeeName}</strong> ({ot.department}):{' '}
                      <span className="text-gold-300 font-bold">{ot.hours}h OT</span>
                    </p>
                  ))}
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-black/25 border border-white/10 space-y-1">
                <p className="font-bold text-emerald-400 text-[11px] uppercase tracking-wider">
                  3. Đề xuất hành động cho Trưởng phòng HCNS:
                </p>
                {aiResult.recommendations.map((r, idx) => (
                  <p key={idx} className="text-[11px] leading-relaxed">
                    {idx + 1}. {r}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-black/20 border border-white/10 text-center space-y-2">
              <p className="text-xs text-emerald-100/80">
                Nhấn nút <strong className="text-gold-400">⚡ Phân tích ngay</strong> để kích hoạt AI Gemini phân tích chi tiết biến động quỹ lương, rà soát OT bất thường và tham mưu các giải pháp tối ưu cho kỳ {selectedMonth}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

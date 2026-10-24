import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  FileText,
  Clock,
  CalendarOff,
  DollarSign,
  UploadCloud,
  ChevronRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import { TabType } from '../types';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  redCount: number;
  yellowCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  redCount,
  yellowCount
}) => {
  const menuItems: Array<{
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', label: 'Bảng điều hành', icon: LayoutDashboard },
    {
      id: 'action_items',
      label: 'Việc cần xử lý',
      icon: AlertTriangle,
      badge: redCount + yellowCount,
      badgeColor: redCount > 0 ? 'bg-rose-500' : 'bg-amber-500'
    },
    { id: 'employees', label: 'Danh sách nhân viên & 360°', icon: Users },
    { id: 'contracts', label: 'Hợp đồng lao động', icon: FileText },
    { id: 'attendance', label: 'Chấm công', icon: Clock },
    { id: 'leaves', label: 'Nghỉ phép', icon: CalendarOff },
    { id: 'payroll', label: 'Bảng lương', icon: DollarSign },
    { id: 'import', label: 'Nhập thêm dữ liệu', icon: UploadCloud }
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#0F291E] text-white flex flex-col justify-between border-r border-[#153a2b] select-none h-screen sticky top-0">
      {/* Brand & Logo */}
      <div>
        <div className="px-6 py-5 border-b border-[#1c4d39]/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold-600/30 border border-gold-500/40 flex items-center justify-center text-gold-400 font-bold shadow-inner">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">
              CÔNG TY CỔ PHẦN A
            </h2>
            <p className="text-[11px] text-emerald-200/70 font-medium">Smart HRM & Payroll</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200/50">
            Phân hệ Quản trị
          </div>

          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-slate-950 font-bold shadow-lg shadow-gold-500/20 scale-[1.02]'
                    : 'text-emerald-100/80 hover:bg-[#153a2b] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-slate-950' : 'text-emerald-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm ${
                        item.badgeColor || 'bg-rose-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-950" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile footer */}
      <div className="p-4 border-t border-[#1c4d39]/40 bg-[#0a1d15]/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-gold-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            BGD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">Ban Giám đốc</p>
            <p className="text-[10px] text-emerald-300/80 truncate">Phòng Hành chính - Nhân sự</p>
          </div>
          <div title="Quyền Quản trị viên cấp cao">
            <ShieldCheck className="w-4 h-4 text-gold-400" />
          </div>
        </div>
      </div>
    </aside>
  );
};

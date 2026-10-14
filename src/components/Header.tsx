import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Building2, UserCircle, Printer, LogIn, LogOut } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { NavTab } from './Navigation';

interface HeaderProps {
  onOpenGateReport: () => void;
  onNavigate?: (tab: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGateReport, onNavigate }) => {
  const { 
    currentUser, 
    setCurrentUser, 
    users, 
    branches, 
    selectedBranchId, 
    setSelectedBranchId, 
    settings,
    students,
    checkStudentBan,
    logout
  } = useApp();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Count banned students in current branch filter
  const filteredStudents = selectedBranchId === 'all' 
    ? students 
    : students.filter(s => s.branchId === selectedBranchId);

  const bannedCount = filteredStudents.filter(s => checkStudentBan(s.id).isBanned).length;

  const roleLabels: Record<string, string> = {
    admin: 'المدير والأعضاء',
    finance: 'مشرفة التحصيل المالي',
    data_entry: 'مدخلة البيانات',
    attendance_supervisor: 'مشرفة الغياب',
    board: 'عضو إدارة'
  };

  const userAllowedBranches = branches.filter(b => {
    if (currentUser.branchIds.includes('all')) return true;
    return currentUser.branchIds.includes(b.id);
  });

  // Auto-switch selected branch if currentUser does not have access
  React.useEffect(() => {
    if (!currentUser.branchIds.includes('all')) {
      if (selectedBranchId === 'all' || !currentUser.branchIds.includes(selectedBranchId)) {
        if (currentUser.branchIds.length > 0) {
          setSelectedBranchId(currentUser.branchIds[0]);
        }
      }
    }
  }, [currentUser, selectedBranchId, setSelectedBranchId]);

  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#E8DCCF] shadow-xs w-full overflow-hidden">
      {/* Subtle Golden Top Border */}
      <div className="h-1 bg-gradient-to-r from-[#4A2F18] via-[#D4AF37] to-[#4A2F18]" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 min-h-[64px]">
        
        {/* Zone 1: Logo & School Name */}
        <div className="flex items-center gap-3 shrink-0 justify-between w-full md:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <img 
                src={settings.logoUrl || '/school_logo.jpg'} 
                alt="شعار المدرسة" 
                className="w-10 h-10 rounded-full object-cover border-2 border-[#D4AF37] shadow-xs bg-white"
                referrerPolicy="no-referrer"
                onError={(e) => { e.currentTarget.src = '/school_logo.jpg'; }}
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" title="النظام نشط" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold text-[#4A2F18] tracking-tight leading-tight">
                  {settings.schoolName || 'مدرسة السعيد القرآنية'}
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-[#8C6D53] font-medium leading-tight">
                {settings.associationName}
              </span>
            </div>
          </div>

          {/* Mobile Gate Status Action */}
          <div className="md:hidden">
            {bannedCount > 0 ? (
              <button
                onClick={onOpenGateReport}
                className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-[10px] font-bold flex items-center gap-1"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                <span>الممنوعون ({bannedCount})</span>
              </button>
            ) : (
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold">
                لا يوجد ممنوعون
              </span>
            )}
          </div>
        </div>

        {/* Zone 2: Branch & User Selectors + Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2 w-full md:w-auto text-xs">
          
          {/* Branch Switcher */}
          <div className="flex items-center gap-1.5 bg-[#F6EEE4] px-2.5 py-1.5 rounded-xl border border-[#E8DCCF]">
            <Building2 className="w-3.5 h-3.5 text-[#8C6D53] shrink-0" />
            <span className="text-[#4A2F18] font-bold hidden sm:inline text-[11px]">الفرع:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-transparent text-[#4A2F18] font-semibold focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[170px] truncate text-xs"
            >
              {currentUser.branchIds.includes('all') && (
                <option value="all">كل الفروع (مركزي)</option>
              )}
              {userAllowedBranches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* User Switcher */}
          <div className="flex items-center gap-1.5 bg-[#F6EEE4] px-2.5 py-1.5 rounded-xl border border-[#E8DCCF]">
            <UserCircle className="w-3.5 h-3.5 text-[#8C6D53] shrink-0" />
            <span className="text-[#4A2F18] font-bold hidden sm:inline text-[11px]">المستخدم:</span>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const found = users.find(u => u.id === e.target.value);
                if (found) setCurrentUser(found);
              }}
              className="bg-transparent text-[#4A2F18] font-semibold focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[170px] truncate text-xs"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({roleLabels[u.role] || u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Login Portal Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsLoginModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl font-bold text-xs transition cursor-pointer border border-[#4A2F18] shrink-0"
            title="بوابة تسجيل الدخول واستعادة الحسابات"
          >
            <LogIn className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden lg:inline">بوابة الدخول والحسابات</span>
          </button>

          {/* Banned Report Button (Desktop) */}
          <div className="hidden md:block shrink-0">
            {bannedCount > 0 ? (
              <button
                onClick={onOpenGateReport}
                title="عرض وطباعة كشف الممنوعين من الدخول اليوم للبوابة"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                <span>{bannedCount} ممنوع</span>
                <Printer className="w-3.5 h-3.5 mr-0.5" />
              </button>
            ) : (
              <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium">
                لا يوجد ممنوعون
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold text-xs transition cursor-pointer shrink-0"
            title="تسجيل الخروج"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج</span>
          </button>

        </div>

      </div>

      <AuthModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Building2, UserCircle, Printer, LogIn, LogOut, Lock, Check, Key, UserCheck } from 'lucide-react';
import { UserRole } from '../types';
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
    isSupabaseConnected,
    isSyncing,
    logout
  } = useApp();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Check if current user is the system owner / admin
  const isSystemOwner = currentUser.role === 'admin';

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

  // Auto-switch selected branch if currentUser does not have access to 'all' or to current selection
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
    <header className="sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#E8DCCF] shadow-xs">
      {/* Subtle Golden Islamic Top Border Accent */}
      <div className="h-1 bg-gradient-to-r from-[#4A2F18] via-[#D4AF37] to-[#4A2F18]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Wordmark with School Crest */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <img 
              src={settings.logoUrl || '/school_logo.jpg'} 
              alt="شعار المدرسة" 
              className="w-11 h-11 rounded-full object-cover border-2 border-[#D4AF37] shadow-xs"
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.src = '/school_logo.jpg'; }}
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" title="النظام متصل ونشط" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-extrabold text-[#4A2F18] tracking-tight leading-tight">
                {settings.schoolName}
              </span>
              <span className="hidden lg:inline-flex items-center gap-1 text-[10px] bg-[#B9895B]/15 text-[#4A2F18] font-black px-2.5 py-0.5 rounded-full border border-[#B9895B]/30">
                <span>منصة السعيد</span>
                <span className="text-[#8C6D53]">•</span>
                <span>إدارة المدارس القرآنية</span>
              </span>
            </div>
            <span className="text-[11px] text-[#8C6D53] font-medium leading-tight">
              {settings.associationName}
            </span>
          </div>
        </div>

        {/* Zone 2: Branch Selector and Fast Role Switcher */}
        <div className="hidden md:flex items-center gap-3 text-xs">
          {/* Branch Switcher */}
          <div className="flex items-center gap-2 bg-[#F6EEE4] px-3 py-1.5 rounded-xl border border-[#E8DCCF]">
            <Building2 className="w-4 h-4 text-[#8C6D53]" />
            <span className="text-[#4A2F18] font-bold">الفرع:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-transparent text-[#4A2F18] font-semibold focus:outline-hidden cursor-pointer"
            >
              {currentUser.branchIds.includes('all') && (
                <option value="all">كل الفروع (مركزي)</option>
              )}
              {userAllowedBranches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* User Profile Pill & Switcher */}
          <div className="flex items-center gap-2 bg-[#F6EEE4] px-3 py-1.5 rounded-xl border border-[#E8DCCF]">
            <UserCircle className="w-4 h-4 text-[#8C6D53]" />
            <span className="text-[#4A2F18] font-bold">المستخدم:</span>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const found = users.find(u => u.id === e.target.value);
                if (found) setCurrentUser(found);
              }}
              className="bg-transparent text-[#4A2F18] font-semibold focus:outline-hidden cursor-pointer max-w-[200px] truncate"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({roleLabels[u.role] || u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Login / Auth Portal Button with Forgot Password & Security options */}
          <button
            type="button"
            onClick={() => setIsLoginModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-2xs border border-[#4A2F18]"
            title="بوابة تسجيل الدخول واستعادة الحسابات"
          >
            <LogIn className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>بوابة الدخول والحسابات</span>
          </button>

          {/* Supabase Real Database Status Indicator (Only Visible To System Owner / Admin) */}
          {isSystemOwner && (
            <button 
              type="button"
              onClick={() => onNavigate?.('settings')}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all shadow-2xs cursor-pointer hover:shadow-xs ${
                isSupabaseConnected 
                  ? 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border-emerald-200' 
                  : 'bg-amber-50 hover:bg-amber-100/80 text-amber-800 border-amber-200'
              }`}
              title="حالة الاتصال الفعلي بقاعدة بيانات Supabase السحابية (خاصة بصاحب النظام)"
            >
              <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-ping' : isSupabaseConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{isSyncing ? 'مزامنة...' : isSupabaseConnected ? 'قاعدة Supabase متصلة' : 'قاعدة Supabase'}</span>
            </button>
          )}

          {/* Logout Action Button */}
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold text-xs transition cursor-pointer"
            title="تسجيل الخروج من المنصة والعودة لشاشة الدخول"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>

        {/* Zone 3: Banned Indicator & Gatekeeper Print Action */}
        <div className="flex items-center gap-3 shrink-0">
          {bannedCount > 0 ? (
            <button
              onClick={onOpenGateReport}
              title="عرض وطباعة كشف الممنوعين من الدخول اليوم للبوابة"
              className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-red-600 animate-pulse" />
              <span>{bannedCount} ممنوع من الدخول</span>
              <Printer className="w-3.5 h-3.5 mr-1" />
            </button>
          ) : (
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium">
              لا يوجد ممنوعون اليوم
            </div>
          )}

          {/* Mobile Login Button */}
          <button
            type="button"
            onClick={() => setIsLoginModalOpen(true)}
            className="md:hidden p-2 bg-[#4A2F18] text-white rounded-xl cursor-pointer"
            title="بوابة تسجيل الدخول"
          >
            <LogIn className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </div>

      </div>

      {/* Comprehensive Authentication & Password Recovery Modal */}
      <AuthModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
};

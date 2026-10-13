import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../types';
import { 
  Settings as SettingsIcon, 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  History, 
  ShieldAlert, 
  CheckCircle2, 
  MessageSquare,
  FileText,
  Users,
  UserPlus,
  Edit3,
  Trash2,
  Lock,
  Building2,
  Sliders,
  Eye,
  Stamp,
  Printer,
  Key,
  ShieldCheck,
  CheckSquare,
  Square,
  Sparkles,
  Info,
  Database,
  RefreshCw,
  Copy,
  Check,
  Image as ImageIcon
} from 'lucide-react';

import { getSupabaseDetails, testSupabaseConnection } from '../lib/supabase';
import { SUPABASE_SQL_SCHEMA } from '../lib/supabaseSchemaCode';
import { OFFICIAL_SCHOOL_LOGO } from '../data/initialData';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    messageTemplates, 
    updateMessageTemplate, 
    auditLogs, 
    exportBackupJson, 
    importBackupJson, 
    resetToDemoData, 
    clearMockData,
    currentUser,
    setCurrentUser,
    users,
    addUser,
    updateUser,
    deleteUser,
    branches,
    isSupabaseConnected,
    isSyncing,
    syncStatusMessage,
    seedInitialDataToSupabase,
    fetchFromSupabase,
    students,
    studentAttendance,
    teacherAttendance,
    disciplineCases,
    dues,
    payments,
    storeItems,
    sales,
    pointsLedger,
    rewards,
    rewardGrants,
    families,
    messageLogs,
    studentNotes,
    departments,
    groups,
    teachers
  } = useApp();

  // Only the system owner / admin can view or configure the Supabase Database Tab
  const isSystemOwner = currentUser.role === 'admin';

  type SettingsTab = 'users' | 'database' | 'report_template' | 'discipline_rules' | 'general' | 'fees' | 'templates' | 'audit' | 'backup';
  const [activeTab, setActiveTab] = useState<SettingsTab>('users');
  const [localSettings, setLocalSettings] = useState(settings);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [dbSyncLoading, setDbSyncLoading] = useState(false);
  const [dbNotice, setDbNotice] = useState<string | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);

  // User Management State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  // Add User Form State
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('data_entry');
  const [newRoleCustomTitle, setNewRoleCustomTitle] = useState('');
  const [newBranchScope, setNewBranchScope] = useState<'all' | 'custom'>('all');
  const [newSelectedBranchIds, setNewSelectedBranchIds] = useState<string[]>(['b1']);
  const [newAllowedModules, setNewAllowedModules] = useState<string[]>([
    'students', 'student_attendance', 'teacher_attendance'
  ]);

  // Edit User Form State
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('data_entry');
  const [editRoleCustomTitle, setEditRoleCustomTitle] = useState('');
  const [editBranchScope, setEditBranchScope] = useState<'all' | 'custom'>('all');
  const [editSelectedBranchIds, setEditSelectedBranchIds] = useState<string[]>([]);
  const [editAllowedModules, setEditAllowedModules] = useState<string[]>([]);
  const [editActive, setEditActive] = useState(true);

  // All Available Modules for Permission Configuration
  const availableModules: { id: string; label: string; desc: string }[] = [
    { id: 'dashboard', label: 'لوحة التحكم والإحصائيات', desc: 'متابعة المؤشرات العامة ومعدلات الحضور والإيراد' },
    { id: 'branches', label: 'إدارة الفروع والمقارنة', desc: 'بيانات الفروع وسعتها ومقارنة الأداء' },
    { id: 'students', label: 'شؤون الطلاب والتقديم', desc: 'تسجيل الطلاب، تعديل البيانات، وتسجيل الانقطاع' },
    { id: 'student_attendance', label: 'تحضير الطلاب اليومي', desc: 'تسجيل حضور وغياب وأعذار الطلاب' },
    { id: 'teacher_attendance', label: 'حضور وانصراف المعلمين', desc: 'تفريغ دفتر حضور المعلمين وساعات العمل والأعذار' },
    { id: 'finance', label: 'التحصيل المالي ومبيعات الكتب', desc: 'الاشتراكات الشهرية، الإيصالات، ومتجر الكتب والمستلزمات' },
    { id: 'points', label: 'بنك النقاط والجوائز التكريمية', desc: 'سلم الجوائز، إضافة هدايا، وإجراء تسليم المكافآت' },
    { id: 'discipline', label: 'شؤون الانضباط والمنع', desc: 'متابعة استدعاءات أولياء الأمور وغرامات الغياب والتسويات' },
    { id: 'whatsapp', label: 'رسائل وإشعارات واتساب', desc: 'إرسال التنبيهات الميدانية لأولياء الأمور' },
    { id: 'reports', label: 'التقارير والكشوفات الرسمية', desc: 'طباعة كشف البوابة، تقارير الحلقات، وسجل الشرف' },
    { id: 'settings', label: 'إعدادات النظام واللائحة', desc: 'إدارة المستخدمين، قالب التقارير، والنسخ الاحتياطي' },
  ];

  // Helper to get default modules for a role
  const getDefaultModulesForRole = (role: UserRole): string[] => {
    switch (role) {
      case 'admin':
      case 'board':
        return availableModules.map(m => m.id);
      case 'finance':
        return ['dashboard', 'finance', 'reports'];
      case 'data_entry':
        return ['dashboard', 'students', 'student_attendance', 'teacher_attendance'];
      case 'attendance_supervisor':
        return ['dashboard', 'student_attendance', 'teacher_attendance', 'discipline', 'whatsapp', 'reports'];
      default:
        return ['students', 'student_attendance'];
    }
  };

  const roleLabels: Record<UserRole, string> = {
    admin: 'المدير والأعضاء (كامل الصلاحيات)',
    board: 'عضو مجلس إدارة',
    finance: 'مشرفة التحصيل المالي',
    data_entry: 'مدخلة البيانات',
    attendance_supervisor: 'مشرفة الغياب والحضور'
  };

  // Role change handler in add modal to update default modules
  const handleRoleChangeForAdd = (role: UserRole) => {
    setNewRole(role);
    setNewAllowedModules(getDefaultModulesForRole(role));
  };

  // Open Edit User Modal
  const handleOpenEditUser = (user: User) => {
    setUserToEdit(user);
    setEditFullName(user.fullName);
    setEditUsername(user.username);
    setEditPhone(user.phone || '');
    setEditPassword(user.password || '');
    setEditRole(user.role);
    setEditRoleCustomTitle(user.roleCustomTitle || '');
    const isAll = user.branchIds.includes('all');
    setEditBranchScope(isAll ? 'all' : 'custom');
    setEditSelectedBranchIds(isAll ? branches.map(b => b.id) : user.branchIds);
    setEditAllowedModules(user.allowedModules || getDefaultModulesForRole(user.role));
    setEditActive(user.active);
  };

  // Save New User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newUsername.trim()) return;

    const branchIds = newBranchScope === 'all' ? ['all'] : newSelectedBranchIds;

    addUser({
      fullName: newFullName.trim(),
      username: newUsername.trim(),
      phone: newPhone.trim(),
      password: newPassword.trim(),
      role: newRole,
      roleCustomTitle: newRoleCustomTitle.trim() || undefined,
      branchIds: branchIds.length > 0 ? branchIds : ['all'],
      allowedModules: newAllowedModules,
      active: true
    });

    setIsAddUserModalOpen(false);
    setNewFullName('');
    setNewUsername('');
    setNewPhone('');
    setNewPassword('');
    setNewRole('data_entry');
    setNewRoleCustomTitle('');
    setNewBranchScope('all');
    setNewSelectedBranchIds(['b1']);
    setNewAllowedModules(getDefaultModulesForRole('data_entry'));

    setSuccessMessage('تم إنشاء حساب الموظف وتحديد الفروع والصلاحيات المسموحة بنجاح!');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Save Edit User
  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit || !editFullName.trim() || !editUsername.trim()) return;

    const branchIds = editBranchScope === 'all' ? ['all'] : editSelectedBranchIds;

    updateUser(userToEdit.id, {
      fullName: editFullName.trim(),
      username: editUsername.trim(),
      phone: editPhone.trim(),
      password: editPassword.trim(),
      role: editRole,
      roleCustomTitle: editRoleCustomTitle.trim() || undefined,
      branchIds: branchIds.length > 0 ? branchIds : ['all'],
      allowedModules: editAllowedModules,
      active: editActive
    });

    setUserToEdit(null);
    setSuccessMessage(`تم تحديث بيانات وصلاحيات الحساب (${editFullName.trim()}) بنجاح!`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Handle general settings save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(localSettings);
    setSuccessMessage('تم حفظ وتحديث إعدادات المدرسة واللوائح وقالب التقارير بنجاح!');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Handle JSON backup download
  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `نسخة_احتياطية_منصة_السعيد_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle JSON restore
  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackupJson(content);
      if (success) {
        alert('تمت استعادة البيانات بنجاح من ملف النسخة الاحتياطية!');
      } else {
        alert('حدث خطأ أثناء قراءة ملف النسخة الاحتياطية، يرجى التأكد من صحة الملف.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#4A2F18]">إعدادات النظام، الصلاحيات وقالب التقارير</h2>
            <p className="text-xs text-[#8C6D53]">
              إدارة حسابات العاملين وتحديد الفروع المسموحة، تخصيص قالب الطباعة، وضبط لوائح الانضباط والرسوم
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-[#F6EEE4] p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'users' ? 'bg-[#4A2F18] text-white shadow-xs' : 'text-[#6D4C3D] hover:text-[#4A2F18]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>حسابات العاملين والصلاحيات</span>
            </button>

            {/* Supabase Database Tab (Restricted Strictly to System Owner) */}
            {isSystemOwner && (
              <button
                onClick={() => setActiveTab('database')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'database' ? 'bg-[#4A2F18] text-white shadow-xs' : 'text-[#6D4C3D] hover:text-[#4A2F18]'
                }`}
                title="إدارة قاعدة بيانات Supabase (خاص بصاحب النظام)"
              >
                <Database className="w-3.5 h-3.5 text-amber-500" />
                <span>قاعدة بيانات Supabase</span>
                <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
              </button>
            )}

            <button
              onClick={() => setActiveTab('report_template')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'report_template' ? 'bg-[#4A2F18] text-white shadow-xs' : 'text-[#6D4C3D] hover:text-[#4A2F18]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>قالب طباعة التقارير</span>
            </button>

            <button
              onClick={() => setActiveTab('discipline_rules')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'discipline_rules' ? 'bg-[#4A2F18] text-white shadow-xs' : 'text-[#6D4C3D] hover:text-[#4A2F18]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>لوائح الانضباط المدرسي</span>
            </button>

            <button
              onClick={() => setActiveTab('general')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'general' ? 'bg-[#4A2F18] text-white shadow-xs' : 'text-[#6D4C3D] hover:text-[#4A2F18]'
              }`}
            >
              بيانات وهوية المدرسة
            </button>

            <button
              onClick={() => setActiveTab('fees')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'fees' ? 'bg-[#4A2F18] text-white shadow-xs' : 'text-[#6D4C3D] hover:text-[#4A2F18]'
              }`}
            >
              الرسوم والاشتراكات
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'templates' ? 'bg-[#4A2F18] text-white shadow-xs' : 'text-[#6D4C3D] hover:text-[#4A2F18]'
              }`}
            >
              قوالب واتساب
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'audit' ? 'bg-[#4A2F18] text-white shadow-xs' : 'text-[#6D4C3D] hover:text-[#4A2F18]'
              }`}
            >
              سجل الرقابة (Audit)
            </button>

            <button
              onClick={() => setActiveTab('backup')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'backup' ? 'bg-[#4A2F18] text-white shadow-xs' : 'text-[#6D4C3D] hover:text-[#4A2F18]'
              }`}
            >
              النسخ الاحتياطي
            </button>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: USER ACCOUNTS & PERMISSIONS (إدارة حسابات العاملين والصلاحيات)     */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          
          {/* Header Action Row */}
          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8DCCF] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#4A2F18]">حسابات العاملين وتحديد الصفة ونطاق الفروع والصلاحيات</h3>
              <p className="text-xs text-[#8C6D53]">
                التصنيفات المعتمدة: (المدير والأعضاء • مشرفة التحصيل المالي • مدخلة البيانات • أدوار مخصصة).
                يمكنك حصر الحساب على فرع معين أو السماح بكافة الفروع، وتخصيص التبويبات المتاحة له بدقة.
              </p>
            </div>

            <button
              onClick={() => {
                setNewFullName('');
                setNewUsername('');
                setNewPhone('');
                setNewPassword('');
                setNewRole('data_entry');
                setNewRoleCustomTitle('');
                setNewBranchScope('all');
                setNewSelectedBranchIds(['b1']);
                setNewAllowedModules(getDefaultModulesForRole('data_entry'));
                setIsAddUserModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#D8C3AE]" />
              <span>إضافة حساب موظف جديد</span>
            </button>
          </div>

          {/* Quick Notice Banner */}
          <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-900">ملاحظة حول تجربة وفحص الحسابات:</span>
              <p className="text-[11px] text-amber-900/90 leading-relaxed">
                يمكنك تجربة واجهة أي موظف فوراً بالنقر على زر <strong>(تجربة الحساب)</strong> في بطاقة الموظف بالأسفل، أو من القائمة العلوية للهيدر، لمشاهدة ما يراه بالضبط بناءً على فروعه وصلاحياته المحددة.
              </p>
            </div>
          </div>

          {/* Users Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(user => {
              const isCurrent = currentUser.id === user.id;
              const hasAllBranches = user.branchIds.includes('all');
              const assignedBranches = branches.filter(b => user.branchIds.includes(b.id));

              return (
                <div 
                  key={user.id} 
                  className={`bg-[#FFFFFF] p-5 rounded-2xl border transition shadow-2xs flex flex-col justify-between ${
                    isCurrent ? 'border-[#4A2F18] ring-2 ring-[#4A2F18]/20 bg-[#FDFBF9]' : 'border-[#E8DCCF]'
                  }`}
                >
                  <div className="space-y-3">
                    
                    {/* Header: Name, Active & Current indicators */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-[#4A2F18]">{user.fullName}</h4>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4A2F18] text-white">
                              الحساب الحالي
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#8C6D53] font-mono mt-0.5 block">
                          @{user.username} {user.phone ? `• ${user.phone}` : ''}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        user.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {user.active ? 'نشط' : 'معطل'}
                      </span>
                    </div>

                    {/* Role Badge */}
                    <div className="p-2.5 bg-[#F6EEE4] rounded-xl border border-[#E8DCCF] flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#8C6D53]">الصفة / الدور:</span>
                      <span className="text-xs font-black text-[#4A2F18]">
                        {user.roleCustomTitle || roleLabels[user.role] || user.role}
                      </span>
                    </div>

                    {/* Branch Scope */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-[#8C6D53] block">نطاق الفروع المتاح له:</span>
                      {hasAllBranches ? (
                        <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-bold">
                          كافة الفروع (مركزي)
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {assignedBranches.length === 0 ? (
                            <span className="text-[10px] text-gray-400">لا يوجد فروع مسندة</span>
                          ) : (
                            assignedBranches.map(b => (
                              <span key={b.id} className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-[10px] font-bold">
                                {b.name}
                              </span>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    {/* Permitted Modules count */}
                    <div className="pt-2 border-t border-[#E8DCCF]">
                      <span className="text-[10px] text-[#8C6D53] block">
                        الصلاحيات: {user.allowedModules ? user.allowedModules.length : availableModules.length} من {availableModules.length} تبويبات مسموحة
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(user.allowedModules || availableModules.map(m => m.id)).slice(0, 4).map(modId => {
                          const mInfo = availableModules.find(m => m.id === modId);
                          return (
                            <span key={modId} className="text-[9px] bg-gray-100 text-[#4A2F18] px-1.5 py-0.5 rounded font-medium">
                              {mInfo?.label || modId}
                            </span>
                          );
                        })}
                        {(user.allowedModules || []).length > 4 && (
                          <span className="text-[9px] bg-gray-200 text-[#6D4C3D] px-1.5 py-0.5 rounded font-bold">
                            +{(user.allowedModules || []).length - 4} أخرى
                          </span>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Actions footer */}
                  <div className="pt-4 mt-4 border-t border-[#E8DCCF] flex items-center justify-between gap-2">
                    <button
                      onClick={() => setCurrentUser(user)}
                      disabled={isCurrent || !user.active}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        isCurrent 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-[#F6EEE4] hover:bg-[#EADDCF] text-[#4A2F18]'
                      }`}
                      title="المعاينة والدخول بهذا الحساب لفحص الصلاحيات"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isCurrent ? 'حسابك الحالي' : 'تجربة الحساب'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditUser(user)}
                        className="p-1.5 rounded-lg bg-[#F6EEE4] hover:bg-[#EADDCF] text-[#4A2F18] transition cursor-pointer"
                        title="تعديل بيانات الحساب والصلاحيات"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {users.length > 1 && user.id !== 'u1' && (
                        <button
                          onClick={() => {
                            if (window.confirm(`هل أنت متأكد من حذف حساب (${user.fullName})؟`)) {
                              deleteUser(user.id);
                              setSuccessMessage(`تم حذف حساب الموظف بنجاح.`);
                              setTimeout(() => setSuccessMessage(null), 3000);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition cursor-pointer"
                          title="حذف الحساب"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REPORT PRINT TEMPLATE (قالب طباعة التقارير والمستندات الرسمية)      */}
      {/* ========================================================================= */}
      {activeTab === 'report_template' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-6 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DCCF] pb-4">
              <div>
                <h3 className="text-sm font-bold text-[#4A2F18]">تخصيص قالب طباعة التقارير والكشوفات الرسمية</h3>
                <p className="text-[11px] text-[#8C6D53]">
                  تعديل الترويسة العليا، الأختام، مسميات التوقيعات، والملاحظات القانونية أسفل المستندات المطبوعة
                </p>
              </div>

              <button
                type="submit"
                className="px-5 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>حفظ تعديلات القالب</span>
              </button>
            </div>

            {/* Header Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">الترويسة الرئيسية (أعلى الوثيقة)</label>
                <input
                  type="text"
                  value={localSettings.reportHeaderTitle || localSettings.schoolName}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, reportHeaderTitle: e.target.value }))}
                  placeholder="مثال: مدرسة السعيد القرآنية — الجمعية الشرعية لتعاون العاملين بالكتاب والسنة"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">العنوان الفرعي للترويسة</label>
                <input
                  type="text"
                  value={localSettings.reportSubtitle || ''}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, reportSubtitle: e.target.value }))}
                  placeholder="مثال: إدارة شؤون الحلقات والامتحانات والتحصيل المالي"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] text-xs"
                />
              </div>
            </div>

            {/* Logo and Stamp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#E8DCCF]">
              <div className="flex items-center gap-3 p-3 bg-[#F6EEE4] rounded-xl border border-[#E8DCCF]">
                <input
                  type="checkbox"
                  id="chkShowLogo"
                  checked={localSettings.reportShowLogo !== false}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, reportShowLogo: e.target.checked }))}
                  className="w-4 h-4 text-[#4A2F18] rounded cursor-pointer"
                />
                <label htmlFor="chkShowLogo" className="text-xs font-bold text-[#4A2F18] cursor-pointer">
                  إظهار شعار المدرسة والجمعية في ترويسة التقارير الرسمية
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">نص الختم المعتمد أسفل التقرير</label>
                <input
                  type="text"
                  value={localSettings.reportStampText || 'خاتم اعتماد مدرسة السعيد القرآنية'}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, reportStampText: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] text-xs font-bold"
                />
              </div>
            </div>

            {/* Signatures Titles */}
            <div className="pt-4 border-t border-[#E8DCCF] space-y-3">
              <h4 className="text-xs font-bold text-[#4A2F18]">مسميات تواقيع الاعتماد الرسمية الثلاثة أسفل التقرير:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#8C6D53] mb-1">الموقع الأول (شؤون الطلاب والغياب):</label>
                  <input
                    type="text"
                    value={localSettings.reportSupervisorTitle || 'مشرفة الغياب وشؤون الطلاب'}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, reportSupervisorTitle: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#8C6D53] mb-1">الموقع الثاني (الشؤون المالية والخزينة):</label>
                  <input
                    type="text"
                    value={localSettings.reportFinanceTitle || 'مشرف التحصيل والشؤون المالية'}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, reportFinanceTitle: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#8C6D53] mb-1">الموقع الثالث (المدير والاعتماد):</label>
                  <input
                    type="text"
                    value={localSettings.reportDirectorTitle || 'مدير عام المدرسة واعتماد الجمعية'}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, reportDirectorTitle: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Footer notes & Gatekeeper notes */}
            <div className="pt-4 border-t border-[#E8DCCF] space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">الملاحظات القانونية والتحذيرية أسفل المستند المطبوع (Footer Notes)</label>
                <textarea
                  rows={2}
                  value={localSettings.reportFooterNotes || 'وثيقة رسمية صادرة من نظام مدرسة السعيد القرآنية — لا يعتد بأي تعديل يدوي غير مختوم.'}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, reportFooterNotes: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">تعليمات كشف أمن البوابة (لحراس الأمن والاستقبال)</label>
                <textarea
                  rows={2}
                  value={localSettings.reportGateNotes || 'يمنع دخول أي طالب مدون في هذا الكشف للحلقات حتى إحضار إشعار إذن رسمي من الإدارة أو إيصال سداد مختوم.'}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, reportGateNotes: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] text-xs leading-relaxed"
                />
              </div>
            </div>

            {/* Live Template Visual Preview */}
            <div className="pt-4 border-t border-[#E8DCCF]">
              <span className="block text-xs font-bold text-[#4A2F18] mb-3">معاينة شكل التقرير المطبوع بالقالب المخصص:</span>
              <div className="bg-[#FFFFFF] p-6 rounded-2xl border-2 border-dashed border-[#B9895B]/50 shadow-inner space-y-4 max-w-3xl mx-auto">
                
                {/* Header preview */}
                <div className="flex items-center justify-between border-b-2 border-[#4A2F18] pb-3">
                  <div className="flex items-center gap-3">
                    {localSettings.reportShowLogo !== false && (
                      <img 
                        src={localSettings.logoUrl || '/school_logo.jpg'} 
                        alt="شعار" 
                        className="w-12 h-12 rounded-full object-cover border border-[#4A2F18]"
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.src = '/school_logo.jpg'; }}
                      />
                    )}
                    <div>
                      <h4 className="font-extrabold text-sm text-[#4A2F18]">
                        {localSettings.reportHeaderTitle || localSettings.schoolName}
                      </h4>
                      <p className="text-[11px] text-[#8C6D53]">
                        {localSettings.reportSubtitle || localSettings.associationName}
                      </p>
                    </div>
                  </div>
                  <div className="text-left text-[10px] text-[#8C6D53] font-mono">
                    <div>التاريخ: {new Date().toLocaleDateString('ar-EG')}</div>
                    <div>العام: 1447-1448 هـ</div>
                  </div>
                </div>

                {/* Dummy table preview */}
                <div className="py-2">
                  <div className="bg-gray-100 p-2 rounded text-center text-xs font-bold text-gray-700">
                    [ محتوى التقرير المطلوب: كشف البوابة / كشف الدرجات / التحصيل المالي / الحضور والغياب ]
                  </div>
                </div>

                {/* Signatures and Stamp Preview */}
                <div className="pt-4 border-t border-gray-300 grid grid-cols-3 gap-4 text-center text-[10px]">
                  <div>
                    <span className="font-bold text-gray-700 block mb-4">{localSettings.reportSupervisorTitle || 'مشرفة الغياب'}</span>
                    <span className="text-gray-400 block border-b border-dotted border-gray-400 w-24 mx-auto pb-1">التوقيع: .........</span>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-red-500/60 flex items-center justify-center text-[9px] text-red-600 font-bold p-1 text-center rotate-[-8deg]">
                      {localSettings.reportStampText || 'ختم المدرسة'}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-gray-700 block mb-4">{localSettings.reportDirectorTitle || 'مدير عام المدرسة'}</span>
                    <span className="text-gray-400 block border-b border-dotted border-gray-400 w-24 mx-auto pb-1">الاعتماد: .........</span>
                  </div>
                </div>

                <div className="text-[9px] text-gray-500 text-center pt-2 border-t border-gray-200">
                  {localSettings.reportFooterNotes}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8DCCF] flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات في النظام</span>
              </button>
            </div>

          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DISCIPLINE RULES (لوائح الانضباط وحدود الغياب المدرسية)            */}
      {/* ========================================================================= */}
      {activeTab === 'discipline_rules' && (
        <form onSubmit={handleSaveSettings} className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#4A2F18]">تعديل مستويات ولائحة الانضباط والمنع من الدخول</h3>
              <p className="text-[11px] text-[#8C6D53]">
                تحديد عدد حصص الغياب الشهرية الموجبة للإنذار الأول، استدعاء ولي الأمر، الغرامة المالية، والفصل المؤقت
              </p>
            </div>

            <button
              type="submit"
              className="px-5 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>حفظ مستويات الانضباط</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Level 1 */}
            <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-orange-900">المستوى الأول: الإنذار والاستدعاء</span>
                <span className="text-[10px] bg-orange-200 text-orange-900 px-2 py-0.5 rounded font-bold">إنذار 1</span>
              </div>
              <p className="text-[11px] text-orange-800 leading-relaxed">
                استدعاء ولي الأمر، تعليق دخول الحلقات، ولا يرفع المنع إلا بحضور ولي الأمر وتوقيع تعهد الالتزام.
              </p>
              <div>
                <label className="block text-[11px] font-bold text-orange-950 mb-1">حد الغياب الموجب للمستوى الأول:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={localSettings.absenceThresholds.level1}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      absenceThresholds: { ...prev.absenceThresholds, level1: Number(e.target.value) }
                    }))}
                    className="w-20 px-3 py-1.5 rounded-lg border border-orange-300 bg-white font-bold text-center tabular-nums"
                  />
                  <span className="font-bold text-orange-900">حصص غياب شهرياً</span>
                </div>
              </div>
            </div>

            {/* Level 2 */}
            <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-red-900">المستوى الثاني: الغرامة المالية</span>
                <span className="text-[10px] bg-red-200 text-red-900 px-2 py-0.5 rounded font-bold">غرامة + منع</span>
              </div>
              <p className="text-[11px] text-red-800 leading-relaxed">
                فرض غرامة انضباط مالية تضاف فوراً لذمة الطالب بالخزينة، واستدعاء ولي الأمر.
              </p>
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-bold text-red-950 mb-1">حد الغياب الموجب للمستوى الثاني:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={25}
                      value={localSettings.absenceThresholds.level2}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        absenceThresholds: { ...prev.absenceThresholds, level2: Number(e.target.value) }
                      }))}
                      className="w-20 px-3 py-1.5 rounded-lg border border-red-300 bg-white font-bold text-center tabular-nums"
                    />
                    <span className="font-bold text-red-900">حصص غياب شهرياً</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-red-950 mb-1">مبلغ غرامة الانضباط المقررة:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      step={5}
                      value={localSettings.absenceFineAmount}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        absenceFineAmount: Number(e.target.value)
                      }))}
                      className="w-20 px-3 py-1.5 rounded-lg border border-red-300 bg-white font-bold text-center tabular-nums"
                    />
                    <span className="font-bold text-red-900">ج.م مصري</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Level 3 */}
            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-purple-900">المستوى الثالث: الفصل المؤقت</span>
                <span className="text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded font-bold">فصل مؤقت</span>
              </div>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                صدور قرار فصل مؤقت ومنع دخول، ولا يعود الطالب إلا بعد انقضاء المدة وتظلم معتمد من المدير.
              </p>
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-bold text-purple-950 mb-1">حد الغياب الموجب للفصل المؤقت:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={localSettings.absenceThresholds.level3}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        absenceThresholds: { ...prev.absenceThresholds, level3: Number(e.target.value) }
                      }))}
                      className="w-20 px-3 py-1.5 rounded-lg border border-purple-300 bg-white font-bold text-center tabular-nums"
                    />
                    <span className="font-bold text-purple-900">حصص غياب شهرياً</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-950 mb-1">مدة الفصل المؤقت المقررة:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={localSettings.suspensionMonths}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        suspensionMonths: Number(e.target.value)
                      }))}
                      className="w-20 px-3 py-1.5 rounded-lg border border-purple-300 bg-white font-bold text-center tabular-nums"
                    />
                    <span className="font-bold text-purple-900">أشهر دراسية</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-3 border-t border-[#E8DCCF] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>حفظ واعتماد التعديلات</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: GENERAL & IDENTITY (الهوية وبيانات المدرسة وشروط الالتحاق)         */}
      {/* ========================================================================= */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveSettings} className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-[#4A2F18] border-b border-[#E8DCCF] pb-2">بيانات وهوية المدرسة والجمعية</h3>

          {/* Official Logo Display & Customizer */}
          <div className="p-4 bg-gradient-to-r from-[#F6EEE4] via-[#FDFBF7] to-[#F6EEE4] rounded-2xl border border-[#D4AF37]/50 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src={localSettings.logoUrl || '/school_logo.jpg'} 
                  alt="شعار المدرسة" 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-3 border-[#D4AF37] shadow-md bg-white"
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.src = '/school_logo.jpg'; }}
                />
                <span className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-[#361E10] p-1 rounded-full shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="space-y-1 text-right">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#4A2F18]">الشعار الرسمي المعتمد للمنصة والمدرسة</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    نشط ومعتمد
                  </span>
                </div>
                <p className="text-[11px] text-[#8C6D53]">
                  يظهر في الترويسة الرئيسية، شاشة الدخول، استمارات الالتحاق، الشهادات، وكشوفات الطباعة.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, logoUrl: OFFICIAL_SCHOOL_LOGO || '/school_logo.jpg' }))}
                    className="text-[11px] bg-[#4A2F18] hover:bg-[#382312] text-white px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3 h-3 text-[#D4AF37]" />
                    <span>تطبيق الشعار الرسمي فوراً</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full sm:w-72 space-y-1">
              <label className="block text-[11px] font-bold text-[#4A2F18]">رابط الشعار المخصص (URL)</label>
              <input
                type="text"
                value={localSettings.logoUrl}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                placeholder="/school_logo.jpg"
                className="w-full px-3 py-1.5 rounded-xl border border-[#E8DCCF] bg-white font-mono text-[11px]"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#4A2F18] mb-1">اسم الجمعية التابعة</label>
              <input
                type="text"
                value={localSettings.associationName}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, associationName: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A2F18] mb-1">اسم المدرسة القرآنية</label>
              <input
                type="text"
                value={localSettings.schoolName}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, schoolName: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A2F18] mb-1">رقم الهاتف الرسمي</label>
              <input
                type="text"
                value={localSettings.phone}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A2F18] mb-1">العنوان والمقر الرئيسي</label>
              <input
                type="text"
                value={localSettings.address}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#E8DCCF]">
            <label className="block text-xs font-bold text-[#4A2F18] mb-1">نص شروط الالتحاق الثمانية للطباعة والتوقيع</label>
            <textarea
              rows={8}
              value={localSettings.termsText}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, termsText: e.target.value }))}
              className="w-full p-3 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] leading-relaxed font-mono text-[11px]"
            />
          </div>

          <div className="pt-3 border-t border-[#E8DCCF] flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>حفظ الإعدادات العامة</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: FEES & SUBSCRIPTIONS (الرسوم والاشتراكات)                           */}
      {/* ========================================================================= */}
      {activeTab === 'fees' && (
        <form onSubmit={handleSaveSettings} className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-[#4A2F18] border-b border-[#E8DCCF] pb-2">رسوم المراحل التعليمية ومواعيد الاستحقاق</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {localSettings.feePlans.map((plan, idx) => (
              <div key={plan.stage} className="p-4 bg-[#F6EEE4] rounded-xl border border-[#E8DCCF]">
                <span className="font-bold text-[#4A2F18] block text-xs">{plan.stageNameAr}</span>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    value={plan.monthlyAmount}
                    onChange={(e) => {
                      const updated = [...localSettings.feePlans];
                      updated[idx].monthlyAmount = Number(e.target.value);
                      setLocalSettings(prev => ({ ...prev, feePlans: updated }));
                    }}
                    className="w-24 px-2.5 py-1.5 rounded-lg border border-[#E8DCCF] bg-white font-bold tabular-nums text-left"
                  />
                  <span className="font-bold text-[#8C6D53]">ج.م شهرياً</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E8DCCF]">
            <div>
              <label className="block text-xs font-bold text-[#4A2F18] mb-1">خصم الإخوة (لكل أسرة شقيقة)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={localSettings.siblingDiscountAmount}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, siblingDiscountAmount: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] tabular-nums font-bold text-left"
                />
                <span className="text-[#8C6D53] font-bold">ج.م</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A2F18] mb-1">يوم الاستحقاق الشهري (تاريخ التحصيل)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={localSettings.dueDay}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, dueDay: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] tabular-nums font-bold text-center"
                />
                <span className="text-[#8C6D53] font-bold">من كل شهر</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A2F18] mb-1">فترة السماح قبل المنع والتعليق</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={localSettings.graceDays}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, graceDays: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] tabular-nums font-bold text-center"
                />
                <span className="text-[#8C6D53] font-bold">أيام إضافية</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E8DCCF] flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>حفظ وتحديث الرسوم</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: WHATSAPP TEMPLATES (قوالب رسائل واتساب)                           */}
      {/* ========================================================================= */}
      {activeTab === 'templates' && (
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-2">
            <h3 className="text-sm font-bold text-[#4A2F18]">تعديل قوالب رسائل واتساب المتغيرة</h3>
            <span className="text-[11px] text-[#8C6D53]">
              المتغيرات المدعومة: {'{اسم_الطالب}'} {'{التاريخ}'} {'{المبلغ}'} {'{الشهر}'} {'{اسم_المدرسة}'}
            </span>
          </div>

          <div className="space-y-4">
            {messageTemplates.map(tpl => (
              <div key={tpl.id} className="p-4 bg-[#F6EEE4] rounded-xl border border-[#E8DCCF] space-y-2">
                <span className="font-bold text-xs text-[#4A2F18] block">{tpl.name}</span>
                <textarea
                  rows={3}
                  value={tpl.template}
                  onChange={(e) => updateMessageTemplate(tpl.id, e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#E8DCCF] bg-white leading-relaxed text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: AUDIT LOG (سجل الرقابة الإدارية)                                    */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] overflow-hidden shadow-2xs">
          <div className="p-4 bg-[#F6EEE4] border-b border-[#E8DCCF] flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#4A2F18]">سجل العمليات الحساسة والرقابة الإدارية (Audit Log)</h3>
            <span className="text-[11px] text-[#8C6D53]">
              يوثق عمليات الحذف، الانقطاع، التعديلات المالية، ورفع المنع
            </span>
          </div>

          <div className="divide-y divide-[#E8DCCF] max-h-96 overflow-y-auto">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3.5 flex items-start justify-between gap-4 text-xs hover:bg-[#FDFBF9]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#4A2F18]">{log.action}</span>
                    <span className="text-[10px] bg-[#F6EEE4] text-[#8C6D53] px-2 py-0.5 rounded font-bold">
                      بواسطة: {log.userName}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8C6D53] mt-1">{log.details}</p>
                </div>
                <span className="text-[10px] text-[#8C6D53] tabular-nums shrink-0">
                  {new Date(log.timestamp).toLocaleString('ar-EG')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: BACKUP & RESTORE (النسخ الاحتياطي)                                  */}
      {/* ========================================================================= */}
      {activeTab === 'backup' && (
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-6 text-xs">
          <div>
            <h3 className="text-sm font-bold text-[#4A2F18]">النسخ الاحتياطي الشامل واستعادة النظام</h3>
            <p className="text-[11px] text-[#8C6D53] mt-1">
              تصدير ملف JSON يحتوي كافة البيانات والطلاب والحسابات والعمليات لحفظها بأمان أو نقلها لجهاز آخر
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Download */}
            <div className="p-4 rounded-xl border border-[#E8DCCF] bg-[#F6EEE4] flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-xs text-[#4A2F18] flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-[#8C6D53]" />
                  <span>تصدير نسخة احتياطية (JSON)</span>
                </h4>
                <p className="text-[11px] text-[#8C6D53] mt-1">
                  تنزيل ملف كامل بكل سجلات المدرسة والطلاب والحضور والماليات.
                </p>
              </div>
              <button
                onClick={handleDownloadBackup}
                className="mt-4 w-full py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>تنزيل النسخة الآن</span>
              </button>
            </div>

            {/* Restore */}
            <div className="p-4 rounded-xl border border-[#E8DCCF] bg-[#F6EEE4] flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-xs text-[#4A2F18] flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-[#8C6D53]" />
                  <span>استعادة نسخة احتياطية</span>
                </h4>
                <p className="text-[11px] text-[#8C6D53] mt-1">
                  رفع ملف JSON محفوظ سابقاً لاسترجاع الحالة الكاملة للبيانات.
                </p>
              </div>
              <label className="mt-4 w-full py-2 bg-[#B9895B] hover:bg-[#A37549] text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-center">
                <span>اختيار ملف والاستعادة</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileRestore}
                  className="hidden"
                />
              </label>
            </div>

            {/* Reset */}
            <div className="p-4 rounded-xl border border-red-200 bg-red-50 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-xs text-red-900 flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-red-700" />
                  <span>إعادة تهيئة البيانات التجريبية</span>
                </h4>
                <p className="text-[11px] text-red-800 mt-1">
                  مسح التعديلات واستعادة البيانات الأولية الافتراضية مع الاحتفاظ بالقوالب.
                </p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('تحذير: هل أنت متأكد من إعادة تعيين البيانات للوضع النموذجي؟ سيتم مسح التغييرات غير المحفوظة.')) {
                    resetToDemoData();
                    alert('تمت استعادة البيانات النموذجية الافتراضية بنجاح.');
                  }
                }}
                className="mt-4 w-full py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>إعادة ضبط البيانات</span>
              </button>
            </div>

            {/* Clear all mock/fake data completely */}
            <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-amber-700" />
                  <span>تفريغ وحذف كافة البيانات الوهمية</span>
                </h4>
                <p className="text-[11px] text-amber-900 mt-1 leading-relaxed">
                  حذف أي طلاب أو حضور أو سجلات وهمية متبقية لتكون المنصة نظيفة وجاهزة لإدخال بياناتك الحقيقية.
                </p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('هل أنت متأكد من رغبتك في حذف وتفريغ كافة البيانات الوهمية من المنصة لتصبح نظيفة تماماً؟')) {
                    clearMockData();
                    alert('تم تفريغ كافة البيانات الوهمية بنجاح! المنصة الآن نظيفة وجاهزة تماماً لاستقبال بياناتكم.');
                  }
                }}
                className="mt-4 w-full py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>حذف البيانات الوهمية الآن</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: SUPABASE CLOUD DATABASE (قاعدة بيانات Supabase السحابية - لصاحب النظام فقط) */}
      {/* ========================================================================= */}
      {activeTab === 'database' && isSystemOwner && (
        <div className="space-y-6 text-xs">
          
          {/* Header Banner */}
          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700">
                  <Database className="w-5 h-5 text-[#8C6D53]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#4A2F18]">الربط بقاعدة بيانات Supabase السحابية الحقيقية</h3>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isSupabaseConnected 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConnected ? 'bg-emerald-600' : 'bg-amber-600 animate-ping'}`} />
                      {isSupabaseConnected ? 'متصل بقاعدة البيانات' : 'بانتظار التحقق من الجداول'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8C6D53] mt-0.5">
                    تخزين ومزامنة بيانات الطلاب، الحضور والغياب، الرسوم والاشتراكات، وحسابات الموظفين بشكل دائم ومباشر في السحابة
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={dbSyncLoading || isSyncing}
                  onClick={async () => {
                    setDbSyncLoading(true);
                    setDbNotice('جارٍ فحص الاتصال بـ Supabase...');
                    const res = await testSupabaseConnection();
                    setDbNotice(res.message);
                    setDbSyncLoading(false);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#F6EEE4] hover:bg-[#EBDDCF] text-[#4A2F18] font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${dbSyncLoading ? 'animate-spin' : ''}`} />
                  <span>فحص الاتصال</span>
                </button>

                <button
                  type="button"
                  disabled={dbSyncLoading || isSyncing}
                  onClick={async () => {
                    setDbSyncLoading(true);
                    setDbNotice('جارٍ رفع ومزامنة كافة البيانات إلى Supabase...');
                    const res = await seedInitialDataToSupabase();
                    setDbNotice(res.message);
                    setDbSyncLoading(false);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#4A2F18] hover:bg-[#382312] text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-300" />
                  <span>رفع ومزامنة كافة البيانات (Seed)</span>
                </button>

                <button
                  type="button"
                  disabled={dbSyncLoading || isSyncing}
                  onClick={async () => {
                    setDbSyncLoading(true);
                    setDbNotice('جارٍ جلب البيانات وتحديث الذاكرة المحلية...');
                    const res = await fetchFromSupabase();
                    setDbNotice(res.message);
                    setDbSyncLoading(false);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#B9895B] hover:bg-[#A37549] text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>تحديث البيانات من السحابة</span>
                </button>
              </div>
            </div>

            {/* Status notice */}
            {(dbNotice || syncStatusMessage) && (
              <div className="p-3 bg-[#FDFBF9] border border-[#E8DCCF] rounded-xl flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#8C6D53] shrink-0" />
                  <span className="text-[#4A2F18] font-semibold">{dbNotice || syncStatusMessage}</span>
                </div>
                {isSyncing && <span className="text-[10px] text-amber-700 animate-pulse font-bold">جارٍ النقل...</span>}
              </div>
            )}
          </div>

          {/* Connection Details Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Project URL */}
            <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-2">
              <span className="text-[11px] font-bold text-[#8C6D53]">رابط خادم المشروع (SUPABASE_URL)</span>
              <div className="flex items-center justify-between gap-2 p-2 bg-[#F6EEE4] rounded-xl font-mono text-[11px] text-[#4A2F18] overflow-hidden text-ellipsis">
                <span className="truncate">{getSupabaseDetails().url}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(getSupabaseDetails().url);
                    setSuccessMessage('تم نسخ رابط Supabase بنجاح');
                    setTimeout(() => setSuccessMessage(null), 2500);
                  }}
                  className="p-1 hover:bg-white rounded text-[#8C6D53] cursor-pointer"
                  title="نسخ الرابط"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-[#8C6D53]">معرّف المشروع: <span className="font-mono font-bold text-[#4A2F18]">{getSupabaseDetails().projectId}</span></p>
            </div>

            {/* Anon Key */}
            <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-2">
              <span className="text-[11px] font-bold text-[#8C6D53]">مفتاح الوصول العام (SUPABASE_ANON_KEY)</span>
              <div className="flex items-center justify-between gap-2 p-2 bg-[#F6EEE4] rounded-xl font-mono text-[11px] text-[#4A2F18] overflow-hidden">
                <span className="truncate">{getSupabaseDetails().maskedKey}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('sb_publishable_-8_bp-u9qj6Xy85t-MfP_Q_BueUQMnq');
                    setSuccessMessage('تم نسخ مفتاح Anon Key بنجاح');
                    setTimeout(() => setSuccessMessage(null), 2500);
                  }}
                  className="p-1 hover:bg-white rounded text-[#8C6D53] cursor-pointer"
                  title="نسخ المفتاح"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>مفتاح آمن ومشفر داخل .env.local و .env</span>
              </p>
            </div>

            {/* Engine & Status */}
            <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#8C6D53]">محرك ومكتبة الاتصال (Driver)</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-[#4A2F18] text-white rounded-lg font-mono text-xs font-bold">@supabase/supabase-js v2</span>
                  <span className="text-[11px] text-[#8C6D53]">PostgreSQL Cloud</span>
                </div>
              </div>
              <div className="pt-2 border-t border-[#E8DCCF] flex items-center justify-between text-[11px]">
                <span className="text-[#8C6D53]">إجمالي الجداول المدعومة:</span>
                <span className="font-bold text-[#4A2F18]">22 جدولاً شاملاً</span>
              </div>
            </div>

          </div>

          {/* Database Tables Overview Grid */}
          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-[#4A2F18]">جداول قاعدة بيانات منصة السعيد وإحصائيات السجلات</h4>
                <p className="text-[11px] text-[#8C6D53] mt-0.5">عدد السجلات المحملة والجاهزة للتخزين والمزامنة السحابية الفورية</p>
              </div>
              <span className="text-[11px] bg-[#F6EEE4] text-[#4A2F18] font-bold px-2.5 py-1 rounded-lg">
                22 جدولاً مهيأً
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {[
                { name: 'الطلاب', table: 'students', count: students.length, icon: '👨‍🎓' },
                { name: 'حضور الطلاب', table: 'student_attendance', count: studentAttendance.length, icon: '📅' },
                { name: 'حضور المعلمين', table: 'teacher_attendance', count: teacherAttendance.length, icon: '⏱️' },
                { name: 'المعلمين', table: 'teachers', count: teachers.length, icon: '👳' },
                { name: 'الحلقات', table: 'groups', count: groups.length, icon: '📖' },
                { name: 'الفروع', table: 'branches', count: branches.length, icon: '🏛️' },
                { name: 'المستخدمين', table: 'users', count: users.length, icon: '👥' },
                { name: 'المستحقات', table: 'dues', count: dues.length, icon: '💳' },
                { name: 'المدفوعات', table: 'payments', count: payments.length, icon: '🧾' },
                { name: 'متجر الكتب', table: 'store_items', count: storeItems.length, icon: '📚' },
                { name: 'المبيعات', table: 'sales', count: sales.length, icon: '🛍️' },
                { name: 'دفتر النقاط', table: 'points_ledger', count: pointsLedger.length, icon: '⭐' },
                { name: 'سلم الجوائز', table: 'rewards', count: rewards.length, icon: '🏆' },
                { name: 'تسليم الجوائز', table: 'reward_grants', count: rewardGrants.length, icon: '🎁' },
                { name: 'شؤون الانضباط', table: 'discipline_cases', count: disciplineCases.length, icon: '⚖️' },
                { name: 'الأسر والعائلات', table: 'families', count: families.length, icon: '👨‍👩‍👦' },
                { name: 'ملاحظات الطلاب', table: 'student_notes', count: studentNotes.length, icon: '📝' },
                { name: 'قوالب الرسائل', table: 'message_templates', count: messageTemplates.length, icon: '💬' },
                { name: 'سجل الرسائل', table: 'message_logs', count: messageLogs.length, icon: '📱' },
                { name: 'الأقسام', table: 'departments', count: departments.length, icon: '🏷️' },
                { name: 'سجل الرقابة', table: 'audit_logs', count: auditLogs.length, icon: '🛡️' },
                { name: 'إعدادات المدرسة', table: 'settings', count: 1, icon: '⚙️' },
              ].map(item => (
                <div key={item.table} className="p-3 bg-[#FDFBF9] hover:bg-[#F6EEE4] transition rounded-xl border border-[#E8DCCF] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-base">{item.icon}</span>
                    <span className="font-bold text-xs text-[#4A2F18] font-mono bg-white px-2 py-0.5 rounded border border-[#E8DCCF]">
                      {item.count}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="block font-bold text-[11px] text-[#4A2F18] truncate">{item.name}</span>
                    <span className="block text-[9px] font-mono text-[#8C6D53] truncate">{item.table}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SQL Schema Execution Guide & 1-Click Copy */}
          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-xs text-[#4A2F18] flex items-center gap-2">
                  <Stamp className="w-4 h-4 text-[#8C6D53]" />
                  <span>استعلامات SQL Schema الشاملة لإنشاء الجداول في Supabase</span>
                </h4>
                <p className="text-[11px] text-[#8C6D53] mt-0.5">
                  انسخ هذا الكود بالكامل، ثم افتح Supabase SQL Editor والصقه لتوليد كافة الجداول وسياسات الأمان (RLS) فوراً
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                    setCopiedSchema(true);
                    setSuccessMessage('تم نسخ كود SQL Schema بالكامل إلى الحافظة!');
                    setTimeout(() => {
                      setCopiedSchema(false);
                      setSuccessMessage(null);
                    }, 3500);
                  }}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    copiedSchema 
                      ? 'bg-emerald-700 text-white' 
                      : 'bg-[#4A2F18] hover:bg-[#382312] text-white'
                  }`}
                >
                  {copiedSchema ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSchema ? 'تم النسخ بنجاح!' : 'نسخ كود SQL بالكامل (1-Click)'}</span>
                </button>

                <a
                  href="https://supabase.com/dashboard/project/woeexrunqmeaudksuiis/sql/new"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[#F6EEE4] hover:bg-[#EBDDCF] text-[#4A2F18] font-bold text-xs transition flex items-center gap-1.5"
                >
                  <span>فتح Supabase SQL Editor ↗</span>
                </a>
              </div>
            </div>

            {/* Quick 3-Step Guide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/70 text-amber-950">
              <div className="space-y-1">
                <span className="font-bold text-[11px] flex items-center gap-1 text-amber-900">
                  <span className="w-4 h-4 rounded-full bg-amber-200 flex items-center justify-center text-[10px]">1</span>
                  <span>نسخ الكود:</span>
                </span>
                <p className="text-[10px] text-amber-900/80 leading-relaxed">
                  اضغط على زر <strong>(نسخ كود SQL بالكامل)</strong> بالأعلى.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[11px] flex items-center gap-1 text-amber-900">
                  <span className="w-4 h-4 rounded-full bg-amber-200 flex items-center justify-center text-[10px]">2</span>
                  <span>تشغيل في Supabase:</span>
                </span>
                <p className="text-[10px] text-amber-900/80 leading-relaxed">
                  ادخل إلى <strong>SQL Editor</strong> في لوحة Supabase، الصق الكود واضغط <strong>Run</strong>.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[11px] flex items-center gap-1 text-amber-900">
                  <span className="w-4 h-4 rounded-full bg-amber-200 flex items-center justify-center text-[10px]">3</span>
                  <span>رفع البيانات (Seed):</span>
                </span>
                <p className="text-[10px] text-amber-900/80 leading-relaxed">
                  اضغط زر <strong>(رفع ومزامنة كافة البيانات)</strong> لملء الجداول بالبيانات الأولية للمدرسة فوراً.
                </p>
              </div>
            </div>

            {/* SQL Code Preview Container */}
            <div className="relative rounded-xl border border-gray-800 bg-[#1A1A1A] text-gray-200 overflow-hidden font-mono text-[11px] dir-ltr text-left">
              <div className="px-4 py-2 bg-[#111] border-b border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
                <span className="font-bold text-gray-300">supabase_schema.sql (22 Tables + RLS Policies)</span>
                <span>{SUPABASE_SQL_SCHEMA.split('\n').length} lines</span>
              </div>
              <pre className="p-4 max-h-72 overflow-y-auto leading-relaxed text-emerald-400 select-all">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD EMPLOYEE USER (إضافة حساب موظف جديد)                           */}
      {/* ========================================================================= */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E8DCCF] shadow-xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F6EEE4] flex items-center justify-center text-[#4A2F18]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#4A2F18]">إنشاء حساب موظف جديد</h3>
                  <p className="text-[11px] text-[#8C6D53]">تحديد الصفة، الفروع المسموح بها، وصلاحيات التبويبات بدقة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">الاسم الكامل للموظف *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أ. زينب محمود الشافعي"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">اسم المستخدم (لتسجيل الدخول) *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: zainab_finance"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-mono text-left"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">كلمة المرور المؤقتة</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">رقم الهاتف / الواتساب</label>
                  <input
                    type="text"
                    placeholder="010XXXXXXXX"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] tabular-nums"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="p-3.5 bg-[#F6EEE4] rounded-xl border border-[#E8DCCF] space-y-2">
                <label className="block text-xs font-bold text-[#4A2F18]">الصفة والتصنيف الوظيفي الأساسي:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleChangeForAdd('admin')}
                    className={`p-2.5 rounded-lg border text-right transition cursor-pointer ${
                      newRole === 'admin' ? 'bg-[#4A2F18] text-white border-[#4A2F18]' : 'bg-white text-[#4A2F18] border-[#E8DCCF]'
                    }`}
                  >
                    <span className="font-bold block text-xs">المدير والأعضاء</span>
                    <span className={`text-[10px] block mt-0.5 ${newRole === 'admin' ? 'text-amber-200' : 'text-[#8C6D53]'}`}>كامل الصلاحيات المركزية</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChangeForAdd('finance')}
                    className={`p-2.5 rounded-lg border text-right transition cursor-pointer ${
                      newRole === 'finance' ? 'bg-[#4A2F18] text-white border-[#4A2F18]' : 'bg-white text-[#4A2F18] border-[#E8DCCF]'
                    }`}
                  >
                    <span className="font-bold block text-xs">مشرفة التحصيل المالي</span>
                    <span className={`text-[10px] block mt-0.5 ${newRole === 'finance' ? 'text-amber-200' : 'text-[#8C6D53]'}`}>الاشتراكات، الإيصالات والكتب</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChangeForAdd('data_entry')}
                    className={`p-2.5 rounded-lg border text-right transition cursor-pointer ${
                      newRole === 'data_entry' ? 'bg-[#4A2F18] text-white border-[#4A2F18]' : 'bg-white text-[#4A2F18] border-[#E8DCCF]'
                    }`}
                  >
                    <span className="font-bold block text-xs">مدخلة البيانات</span>
                    <span className={`text-[10px] block mt-0.5 ${newRole === 'data_entry' ? 'text-amber-200' : 'text-[#8C6D53]'}`}>الطلاب والتحضير والحلقات</span>
                  </button>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#8C6D53]">مسمى وظيفي مخصص (اختياري):</span>
                  <input
                    type="text"
                    placeholder="مثال: منسقة شؤون طالبات فرع روضة السعيد"
                    value={newRoleCustomTitle}
                    onChange={(e) => setNewRoleCustomTitle(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-[#E8DCCF] bg-white"
                  />
                </div>
              </div>

              {/* Branch Scope Selection */}
              <div className="p-3.5 bg-[#FFFFFF] rounded-xl border border-[#E8DCCF] space-y-2">
                <label className="block text-xs font-bold text-[#4A2F18]">نطاق الفروع المتاح لهذا الموظف رؤيتها:</label>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="newBranchScope"
                      checked={newBranchScope === 'all'}
                      onChange={() => setNewBranchScope('all')}
                      className="text-[#4A2F18]"
                    />
                    <span>كافة الفروع بدون قيود (إشراف مركزي)</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="newBranchScope"
                      checked={newBranchScope === 'custom'}
                      onChange={() => setNewBranchScope('custom')}
                      className="text-[#4A2F18]"
                    />
                    <span>حصر الحساب على فروع محددة فقط</span>
                  </label>
                </div>

                {newBranchScope === 'custom' && (
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {branches.map(b => {
                      const isChecked = newSelectedBranchIds.includes(b.id);
                      return (
                        <label 
                          key={b.id} 
                          className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition ${
                            isChecked ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold' : 'bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewSelectedBranchIds(prev => [...prev, b.id]);
                              } else {
                                setNewSelectedBranchIds(prev => prev.filter(id => id !== b.id));
                              }
                            }}
                            className="rounded text-[#4A2F18]"
                          />
                          <span className="text-xs">{b.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Permitted Modules Checkboxes */}
              <div className="p-3.5 bg-[#F6EEE4] rounded-xl border border-[#E8DCCF] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#4A2F18]">تحديد ما يستطيع رؤيته والوصول إليه من التبويبات:</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNewAllowedModules(availableModules.map(m => m.id))}
                      className="text-[10px] text-[#4A2F18] underline font-bold cursor-pointer"
                    >
                      تحديد الكل
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setNewAllowedModules([])}
                      className="text-[10px] text-red-700 underline font-bold cursor-pointer"
                    >
                      إلغاء التحديد
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-48 overflow-y-auto">
                  {availableModules.map(mod => {
                    const isChecked = newAllowedModules.includes(mod.id);
                    return (
                      <label 
                        key={mod.id} 
                        className={`p-2 rounded-lg border flex items-start gap-2 cursor-pointer transition ${
                          isChecked ? 'bg-white border-[#B9895B] text-[#4A2F18]' : 'bg-[#FAF6F2] border-gray-200 text-gray-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewAllowedModules(prev => [...prev, mod.id]);
                            } else {
                              setNewAllowedModules(prev => prev.filter(id => id !== mod.id));
                            }
                          }}
                          className="mt-0.5 rounded text-[#4A2F18]"
                        />
                        <div>
                          <span className="font-bold text-xs block">{mod.label}</span>
                          <span className="text-[10px] text-[#8C6D53] block leading-tight">{mod.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-[#E8DCCF] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#6D4C3D] hover:bg-[#F6EEE4] rounded-lg transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#4A2F18] hover:bg-[#382312] rounded-lg transition shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>إنشاء الحساب وحفظ الصلاحيات</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT EMPLOYEE USER (تعديل حساب موظف)                              */}
      {/* ========================================================================= */}
      {userToEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E8DCCF] shadow-xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F6EEE4] flex items-center justify-center text-[#4A2F18]">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#4A2F18]">تعديل حساب وصلاحيات: {userToEdit.fullName}</h3>
                  <p className="text-[11px] text-[#8C6D53]">تحديث الصفة، الفروع المسموح بها، وقائمة التبويبات المتاحة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUserToEdit(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-4 text-xs">
              
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">اسم المستخدم *</label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-mono text-left"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">تحديث كلمة المرور</label>
                  <input
                    type="password"
                    placeholder="اتركه فارغاً للاحتفاظ بكلمة المرور الحالية"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] tabular-nums"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="p-3.5 bg-[#F6EEE4] rounded-xl border border-[#E8DCCF] space-y-2">
                <label className="block text-xs font-bold text-[#4A2F18]">الصفة والتصنيف الوظيفي:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditRole('admin')}
                    className={`p-2.5 rounded-lg border text-right transition cursor-pointer ${
                      editRole === 'admin' ? 'bg-[#4A2F18] text-white border-[#4A2F18]' : 'bg-white text-[#4A2F18] border-[#E8DCCF]'
                    }`}
                  >
                    <span className="font-bold block text-xs">المدير والأعضاء</span>
                    <span className={`text-[10px] block mt-0.5 ${editRole === 'admin' ? 'text-amber-200' : 'text-[#8C6D53]'}`}>كامل الصلاحيات</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditRole('finance')}
                    className={`p-2.5 rounded-lg border text-right transition cursor-pointer ${
                      editRole === 'finance' ? 'bg-[#4A2F18] text-white border-[#4A2F18]' : 'bg-white text-[#4A2F18] border-[#E8DCCF]'
                    }`}
                  >
                    <span className="font-bold block text-xs">مشرفة التحصيل المالي</span>
                    <span className={`text-[10px] block mt-0.5 ${editRole === 'finance' ? 'text-amber-200' : 'text-[#8C6D53]'}`}>الاشتراكات، الإيصالات والكتب</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditRole('data_entry')}
                    className={`p-2.5 rounded-lg border text-right transition cursor-pointer ${
                      editRole === 'data_entry' ? 'bg-[#4A2F18] text-white border-[#4A2F18]' : 'bg-white text-[#4A2F18] border-[#E8DCCF]'
                    }`}
                  >
                    <span className="font-bold block text-xs">مدخلة البيانات</span>
                    <span className={`text-[10px] block mt-0.5 ${editRole === 'data_entry' ? 'text-amber-200' : 'text-[#8C6D53]'}`}>الطلاب والتحضير والحلقات</span>
                  </button>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#8C6D53]">مسمى وظيفي مخصص:</span>
                  <input
                    type="text"
                    value={editRoleCustomTitle}
                    onChange={(e) => setEditRoleCustomTitle(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-[#E8DCCF] bg-white"
                  />
                </div>
              </div>

              {/* Branch Scope Selection */}
              <div className="p-3.5 bg-[#FFFFFF] rounded-xl border border-[#E8DCCF] space-y-2">
                <label className="block text-xs font-bold text-[#4A2F18]">نطاق الفروع المتاح له:</label>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="editBranchScope"
                      checked={editBranchScope === 'all'}
                      onChange={() => setEditBranchScope('all')}
                      className="text-[#4A2F18]"
                    />
                    <span>كافة الفروع بدون قيود (إشراف مركزي)</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="editBranchScope"
                      checked={editBranchScope === 'custom'}
                      onChange={() => setEditBranchScope('custom')}
                      className="text-[#4A2F18]"
                    />
                    <span>حصر الحساب على فروع محددة فقط</span>
                  </label>
                </div>

                {editBranchScope === 'custom' && (
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {branches.map(b => {
                      const isChecked = editSelectedBranchIds.includes(b.id);
                      return (
                        <label 
                          key={b.id} 
                          className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition ${
                            isChecked ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold' : 'bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditSelectedBranchIds(prev => [...prev, b.id]);
                              } else {
                                setEditSelectedBranchIds(prev => prev.filter(id => id !== b.id));
                              }
                            }}
                            className="rounded text-[#4A2F18]"
                          />
                          <span className="text-xs">{b.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Permitted Modules Checkboxes */}
              <div className="p-3.5 bg-[#F6EEE4] rounded-xl border border-[#E8DCCF] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#4A2F18]">التبويبات المسموحة للحساب:</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditAllowedModules(availableModules.map(m => m.id))}
                      className="text-[10px] text-[#4A2F18] underline font-bold cursor-pointer"
                    >
                      تحديد الكل
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setEditAllowedModules([])}
                      className="text-[10px] text-red-700 underline font-bold cursor-pointer"
                    >
                      إلغاء التحديد
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-48 overflow-y-auto">
                  {availableModules.map(mod => {
                    const isChecked = editAllowedModules.includes(mod.id);
                    return (
                      <label 
                        key={mod.id} 
                        className={`p-2 rounded-lg border flex items-start gap-2 cursor-pointer transition ${
                          isChecked ? 'bg-white border-[#B9895B] text-[#4A2F18]' : 'bg-[#FAF6F2] border-gray-200 text-gray-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditAllowedModules(prev => [...prev, mod.id]);
                            } else {
                              setEditAllowedModules(prev => prev.filter(id => id !== mod.id));
                            }
                          }}
                          className="mt-0.5 rounded text-[#4A2F18]"
                        />
                        <div>
                          <span className="font-bold text-xs block">{mod.label}</span>
                          <span className="text-[10px] text-[#8C6D53] block leading-tight">{mod.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  id="chkEditActive"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="rounded text-[#4A2F18] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="chkEditActive" className="text-xs font-bold text-gray-800 cursor-pointer">
                  حساب نشط ومفعل (إلغاء التحديد يعطل تسجيل دخول هذا الموظف)
                </label>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-[#E8DCCF] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setUserToEdit(null)}
                  className="px-4 py-2 text-xs font-bold text-[#6D4C3D] hover:bg-[#F6EEE4] rounded-lg transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#4A2F18] hover:bg-[#382312] rounded-lg transition shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Branch, Teacher, Group } from '../types';
import { 
  Building2, 
  Plus, 
  MapPin, 
  Phone, 
  UserCheck, 
  Users, 
  BookOpen, 
  Edit3, 
  Power, 
  Trash2,
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  Clock,
  Calendar,
  Sparkles,
  Search,
  Filter,
  GraduationCap,
  MessageCircle,
  UserPlus,
  Layers,
  ChevronDown,
  X
} from 'lucide-react';

interface BranchesViewProps {
  onNavigateToStats: () => void;
}

export const BranchesView: React.FC<BranchesViewProps> = ({ onNavigateToStats }) => {
  const { 
    branches, 
    addBranch, 
    updateBranch, 
    toggleBranchStatus, 
    deleteBranch,
    students, 
    teachers, 
    addTeacher,
    updateTeacher,
    deleteTeacher,
    groups, 
    addGroup,
    updateGroup,
    deleteGroup,
    departments,
    dues, 
    setSelectedBranchId, 
    selectedBranchId,
    currentUser 
  } = useApp();

  // Active Sub-Tab
  const [subTab, setSubTab] = useState<'branches' | 'teachers' | 'groups'>('branches');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBranchId, setFilterBranchId] = useState<string>('all');
  const [filterDeptId, setFilterDeptId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Notice Banner State
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // =========================================================================
  // 1. BRANCH MODALS & FORM STATES
  // =========================================================================
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [bName, setBName] = useState('');
  const [bCity, setBCity] = useState('');
  const [bAddress, setBAddress] = useState('');
  const [bPhone, setBPhone] = useState('');
  const [bManagerName, setBManagerName] = useState('');
  const [bCapacity, setBCapacity] = useState<number>(100);
  const [bNotes, setBNotes] = useState('');

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName.trim()) return;

    addBranch({
      name: bName.trim(),
      city: bCity.trim() || 'الشرقية',
      address: bAddress.trim(),
      phone: bPhone.trim(),
      managerName: bManagerName.trim() || 'إدارة الفرع',
      capacity: Number(bCapacity) || 100,
      establishedDate: new Date().toISOString().slice(0, 10),
      notes: bNotes.trim(),
      active: true
    });

    setIsAddBranchOpen(false);
    setBName('');
    setBCity('');
    setBAddress('');
    setBPhone('');
    setBManagerName('');
    setBCapacity(100);
    setBNotes('');
    showNotice('تمت إضافة الفرع المدرسي الجديد بنجاح وإدراجه في النظام المركزي.');
  };

  const handleUpdateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch || !editingBranch.name.trim()) return;

    updateBranch(editingBranch.id, {
      name: editingBranch.name.trim(),
      city: editingBranch.city?.trim(),
      address: editingBranch.address.trim(),
      phone: editingBranch.phone.trim(),
      managerName: editingBranch.managerName?.trim(),
      capacity: Number(editingBranch.capacity) || 100,
      notes: editingBranch.notes?.trim()
    });

    setEditingBranch(null);
    showNotice('تم تحديث بيانات الفرع بنجاح.');
  };

  // =========================================================================
  // 2. TEACHER MODALS & FORM STATES
  // =========================================================================
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [tFullName, setTFullName] = useState('');
  const [tPhone, setTPhone] = useState('');
  const [tBranchId, setTBranchId] = useState<string>(branches[0]?.id || 'b1');
  const [tDeptIds, setTDeptIds] = useState<string[]>(['tahfeez']);
  const [tNotes, setTNotes] = useState('');
  const [tActive, setTActive] = useState(true);

  const handleOpenAddTeacher = () => {
    setTFullName('');
    setTPhone('');
    setTBranchId(selectedBranchId !== 'all' ? selectedBranchId : branches[0]?.id || 'b1');
    setTDeptIds(['tahfeez']);
    setTNotes('');
    setTActive(true);
    setIsAddTeacherOpen(true);
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tFullName.trim()) return;

    addTeacher({
      fullName: tFullName.trim(),
      phone: tPhone.trim(),
      branchId: tBranchId || branches[0]?.id || 'b1',
      departmentIds: tDeptIds.length > 0 ? tDeptIds : ['tahfeez'],
      active: tActive,
      notes: tNotes.trim()
    });

    setIsAddTeacherOpen(false);
    showNotice(`تمت إضافة المعلم/المحفظ الشيخ (${tFullName.trim()}) بنجاح.`);
  };

  const handleOpenEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setTFullName(teacher.fullName);
    setTPhone(teacher.phone || '');
    setTBranchId(teacher.branchId);
    setTDeptIds(teacher.departmentIds && teacher.departmentIds.length > 0 ? teacher.departmentIds : ['tahfeez']);
    setTNotes(teacher.notes || '');
    setTActive(teacher.active);
  };

  const handleUpdateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher || !tFullName.trim()) return;

    updateTeacher(editingTeacher.id, {
      fullName: tFullName.trim(),
      phone: tPhone.trim(),
      branchId: tBranchId,
      departmentIds: tDeptIds.length > 0 ? tDeptIds : ['tahfeez'],
      active: tActive,
      notes: tNotes.trim()
    });

    setEditingTeacher(null);
    showNotice(`تم تحديث بيانات المعلم (${tFullName.trim()}) بنجاح.`);
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    const assignedGroups = groups.filter(g => g.teacherId === id);
    if (assignedGroups.length > 0) {
      alert(`لا يمكن حذف المعلم (${name}) لأنه مسؤول حالياً عن ${assignedGroups.length} حلقة قرآنية. يرجى نقل الحلقات لمعلم آخر أولاً أو إيقاف المعلم.`);
      return;
    }
    if (window.confirm(`هل أنت متأكد من حذف المعلم (${name}) نهائياً من النظام؟`)) {
      deleteTeacher(id);
      showNotice(`تم حذف المعلم (${name}) من النظام.`);
    }
  };

  // =========================================================================
  // 3. GROUP / CIRCLE MODALS & FORM STATES
  // =========================================================================
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [viewingGroupStudents, setViewingGroupStudents] = useState<Group | null>(null);

  const [gName, setGName] = useState('');
  const [gDeptId, setGDeptId] = useState<string>('tahfeez');
  const [gBranchId, setGBranchId] = useState<string>(branches[0]?.id || 'b1');
  const [gTeacherId, setGTeacherId] = useState<string>('');
  const [gDays, setGDays] = useState<string[]>(['السبت', 'الاثنين', 'الأربعاء']);
  const [gStartTime, setGStartTime] = useState('15:30');
  const [gEndTime, setGEndTime] = useState('17:30');
  const [gCapacity, setGCapacity] = useState<number>(20);
  const [gYear, setGYear] = useState('2026-2027');
  const [gActive, setGActive] = useState(true);

  const allDaysOfWeek = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  const handleOpenAddGroup = () => {
    const defaultBranch = selectedBranchId !== 'all' ? selectedBranchId : branches[0]?.id || 'b1';
    const branchAvailableTeachers = teachers.filter(t => t.branchId === defaultBranch && t.active);
    
    setGName('');
    setGDeptId('tahfeez');
    setGBranchId(defaultBranch);
    setGTeacherId(branchAvailableTeachers[0]?.id || teachers[0]?.id || '');
    setGDays(['السبت', 'الاثنين', 'الأربعاء']);
    setGStartTime('15:30');
    setGEndTime('17:30');
    setGCapacity(20);
    setGYear('2026-2027');
    setGActive(true);
    setIsAddGroupOpen(true);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gName.trim()) return;

    addGroup({
      name: gName.trim(),
      departmentId: gDeptId || 'tahfeez',
      branchId: gBranchId || branches[0]?.id || 'b1',
      teacherId: gTeacherId || teachers[0]?.id || '',
      days: gDays.length > 0 ? gDays : ['السبت'],
      startTime: gStartTime || '15:30',
      endTime: gEndTime || '17:30',
      capacity: Number(gCapacity) || 20,
      year: gYear.trim() || '2026-2027',
      active: gActive
    });

    setIsAddGroupOpen(false);
    showNotice(`تمت إضافة الحلقة القرآنية (${gName.trim()}) بنجاح.`);
  };

  const handleOpenEditGroup = (group: Group) => {
    setEditingGroup(group);
    setGName(group.name);
    setGDeptId(group.departmentId);
    setGBranchId(group.branchId);
    setGTeacherId(group.teacherId);
    setGDays(group.days || ['السبت']);
    setGStartTime(group.startTime || '15:30');
    setGEndTime(group.endTime || '17:30');
    setGCapacity(group.capacity || 20);
    setGYear(group.year || '2026-2027');
    setGActive(group.active);
  };

  const handleUpdateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup || !gName.trim()) return;

    updateGroup(editingGroup.id, {
      name: gName.trim(),
      departmentId: gDeptId,
      branchId: gBranchId,
      teacherId: gTeacherId,
      days: gDays.length > 0 ? gDays : ['السبت'],
      startTime: gStartTime,
      endTime: gEndTime,
      capacity: Number(gCapacity) || 20,
      year: gYear.trim() || '2026-2027',
      active: gActive
    });

    setEditingGroup(null);
    showNotice(`تم تحديث بيانات الحلقة القرآنية (${gName.trim()}) بنجاح.`);
  };

  const handleDeleteGroup = (id: string, name: string) => {
    const enrolledStudents = students.filter(s => s.tahfeezGroupId === id || s.tarbawiGroupId === id);
    if (enrolledStudents.length > 0) {
      alert(`لا يمكن حذف الحلقة (${name}) لوجود ${enrolledStudents.length} طالب مقيدين بها. يرجى نقل الطلاب لحلقة أخرى أولاً.`);
      return;
    }
    if (window.confirm(`هل أنت متأكد من حذف الحلقة القرآنية (${name}) نهائياً؟`)) {
      deleteGroup(id);
      showNotice(`تم حذف الحلقة القرآنية (${name}) من النظام.`);
    }
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => {
      setActionNotice(null);
    }, 4500);
  };

  // Helper calculation for branches
  const totalCapacity = branches.reduce((sum, b) => sum + (b.capacity || 100), 0);
  const totalStudents = students.length;
  const overallOccupancy = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0;
  const activeBranchesCount = branches.filter(b => b.active).length;

  // Filtered Teachers
  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      if (filterBranchId !== 'all' && t.branchId !== filterBranchId) return false;
      if (selectedBranchId !== 'all' && t.branchId !== selectedBranchId) return false;
      if (filterStatus === 'active' && !t.active) return false;
      if (filterStatus === 'inactive' && t.active) return false;
      if (filterDeptId !== 'all' && (!t.departmentIds || !t.departmentIds.includes(filterDeptId))) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = t.fullName.toLowerCase().includes(q);
        const matchesPhone = t.phone.toLowerCase().includes(q);
        const matchesNotes = (t.notes || '').toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesNotes) return false;
      }
      return true;
    });
  }, [teachers, filterBranchId, selectedBranchId, filterStatus, filterDeptId, searchQuery]);

  // Filtered Groups
  const filteredGroups = useMemo(() => {
    return groups.filter(g => {
      if (filterBranchId !== 'all' && g.branchId !== filterBranchId) return false;
      if (selectedBranchId !== 'all' && g.branchId !== selectedBranchId) return false;
      if (filterDeptId !== 'all' && g.departmentId !== filterDeptId) return false;
      if (filterStatus === 'active' && !g.active) return false;
      if (filterStatus === 'inactive' && g.active) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = g.name.toLowerCase().includes(q);
        const teacher = teachers.find(t => t.id === g.teacherId);
        const matchesTeacher = teacher?.fullName.toLowerCase().includes(q);
        if (!matchesName && !matchesTeacher) return false;
      }
      return true;
    });
  }, [groups, filterBranchId, selectedBranchId, filterDeptId, filterStatus, searchQuery, teachers]);

  return (
    <div className="space-y-6">
      
      {/* Top Main Navigation Banner */}
      <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8DCCF] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#4A2F18]">
                إدارة الفروع والحلقات القرآنية وهيئة التدريس
              </h2>
              <span className="text-[10px] bg-[#D4AF37]/20 text-[#4A2F18] border border-[#D4AF37]/40 font-bold px-2.5 py-0.5 rounded-full">
                الإدارة المركزية
              </span>
            </div>
            <p className="text-xs text-[#8C6D53] mt-1">
              المقر الموحد لإدارة الفروع المدرسية، تعيين المعلمين والمحفظين، وجدولة الحلقات القرآنية والتربوية
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onNavigateToStats}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F6EEE4] hover:bg-[#EADDCF] text-[#4A2F18] rounded-xl text-xs font-bold transition cursor-pointer border border-[#E8DCCF]"
            >
              <BarChart3 className="w-4 h-4 text-[#8C6D53]" />
              <span>مقارنة إحصائيات الفروع</span>
            </button>

            {/* Contextual Action Button based on active subtab */}
            {currentUser?.role === 'admin' && (
              <>
                {subTab === 'branches' && (
                  <button
                    onClick={() => setIsAddBranchOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer border border-[#4A2F18]"
                  >
                    <Plus className="w-4 h-4 text-[#D8C3AE]" />
                    <span>إضافة فرع جديد</span>
                  </button>
                )}

                {subTab === 'teachers' && (
                  <button
                    onClick={handleOpenAddTeacher}
                    className="flex items-center gap-2 px-4 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer border border-[#4A2F18]"
                  >
                    <UserPlus className="w-4 h-4 text-[#D8C3AE]" />
                    <span>إضافة معلم جديد</span>
                  </button>
                )}

                {subTab === 'groups' && (
                  <button
                    onClick={handleOpenAddGroup}
                    className="flex items-center gap-2 px-4 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer border border-[#4A2F18]"
                  >
                    <Plus className="w-4 h-4 text-[#D8C3AE]" />
                    <span>إضافة حلقة جديدة</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
          <div className="flex items-center gap-1.5 bg-[#F6EEE4] p-1 rounded-xl border border-[#E8DCCF] text-xs font-bold">
            <button
              onClick={() => { setSubTab('branches'); setSearchQuery(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition cursor-pointer ${
                subTab === 'branches' 
                  ? 'bg-[#4A2F18] text-white shadow-xs' 
                  : 'text-[#6D4C3D] hover:text-[#4A2F18]'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>الفروع المدرسية ({branches.length})</span>
            </button>

            <button
              onClick={() => { setSubTab('teachers'); setSearchQuery(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition cursor-pointer ${
                subTab === 'teachers' 
                  ? 'bg-[#4A2F18] text-white shadow-xs' 
                  : 'text-[#6D4C3D] hover:text-[#4A2F18]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>المعلمون والمحفظون ({teachers.length})</span>
            </button>

            <button
              onClick={() => { setSubTab('groups'); setSearchQuery(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition cursor-pointer ${
                subTab === 'groups' 
                  ? 'bg-[#4A2F18] text-white shadow-xs' 
                  : 'text-[#6D4C3D] hover:text-[#4A2F18]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>الحلقات القرآنية ({groups.length})</span>
            </button>
          </div>

          {/* Quick Branch Context Indicator */}
          {selectedBranchId !== 'all' && (
            <div className="flex items-center gap-2 text-xs bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl font-bold">
              <span>الفرع النشط حالياً:</span>
              <strong className="text-[#4A2F18]">{branches.find(b => b.id === selectedBranchId)?.name}</strong>
              <button
                onClick={() => setSelectedBranchId('all')}
                className="text-amber-700 hover:text-amber-900 underline text-[11px] cursor-pointer mr-1"
              >
                عرض كل الفروع
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global Success / Action Notification */}
      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-900 text-xs">✕</button>
        </div>
      )}

      {/* SUBTAB 1: BRANCHES VIEW */}
      {subTab === 'branches' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-4 rounded-2xl border border-[#E8DCCF] shadow-2xs">
              <span className="text-[#8C6D53] font-bold block text-[11px]">الفروع النشطة</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#4A2F18] tabular-nums">{activeBranchesCount}</span>
                <span className="text-[10px] text-[#8C6D53]">من إجمالي {branches.length} فرع</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E8DCCF] shadow-2xs">
              <span className="text-[#8C6D53] font-bold block text-[11px]">إجمالي الطاقة الاستيعابية</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#4A2F18] tabular-nums">{totalCapacity}</span>
                <span className="text-[10px] text-[#8C6D53]">مقعد دارس</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E8DCCF] shadow-2xs">
              <span className="text-[#8C6D53] font-bold block text-[11px]">الطلاب المسجلون</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-emerald-800 tabular-nums">{totalStudents}</span>
                <span className="text-[10px] text-[#8C6D53]">طالب وطالبة</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E8DCCF] shadow-2xs">
              <span className="text-[#8C6D53] font-bold block text-[11px]">متوسط نسبة الإشغال</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#B9895B] tabular-nums">{overallOccupancy}%</span>
                <span className="text-[10px] text-[#8C6D53]">من السعة الكلية</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {branches.map(branch => {
              const branchStudents = students.filter(s => s.branchId === branch.id);
              const branchTeachers = teachers.filter(t => t.branchId === branch.id);
              const branchGroups = groups.filter(g => g.branchId === branch.id);
              const branchDues = dues.filter(d => d.branchId === branch.id);
              
              const collected = branchDues.reduce((sum, d) => sum + d.paidAmount, 0);
              const totalDue = branchDues.reduce((sum, d) => sum + d.amount, 0);
              const collectionRate = totalDue > 0 ? Math.round((collected / totalDue) * 100) : 100;
              
              const bCap = branch.capacity || 100;
              const occupancyRate = Math.min(100, Math.round((branchStudents.length / bCap) * 100));
              const isSelected = selectedBranchId === branch.id;

              return (
                <div 
                  key={branch.id} 
                  className={`bg-[#FFFFFF] rounded-2xl border transition shadow-2xs flex flex-col justify-between overflow-hidden ${
                    isSelected ? 'border-[#4A2F18] ring-2 ring-[#4A2F18]/20' : 'border-[#E8DCCF]'
                  }`}
                >
                  <div>
                    <div className="p-4 bg-[#F6EEE4] border-b border-[#E8DCCF] flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#E8DCCF] flex items-center justify-center text-[#4A2F18] shadow-2xs">
                          <Building2 className="w-5 h-5 text-[#8C6D53]" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-xs sm:text-sm text-[#4A2F18] line-clamp-1">{branch.name}</h3>
                          <span className="text-[11px] text-[#8C6D53]">{branch.city || 'الشرقية'}</span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        branch.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {branch.active ? 'نشط' : 'متوقف'}
                      </span>
                    </div>

                    <div className="p-4 space-y-3 text-xs">
                      <div className="space-y-1.5 text-[11px] text-[#6D4C3D]">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5 text-[#8C6D53] shrink-0" />
                          <span>مدير الفرع: <strong className="text-[#4A2F18]">{branch.managerName || 'غير محدد'}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#8C6D53] shrink-0" />
                          <span className="line-clamp-1">العنوان: {branch.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-[#8C6D53] shrink-0" />
                          <span className="tabular-nums dir-ltr">{branch.phone}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E8DCCF] text-center">
                        <div className="p-2 bg-[#FBF8F5] rounded-xl border border-[#E8DCCF]/60">
                          <span className="text-[10px] text-[#8C6D53] block">الطلاب</span>
                          <strong className="text-sm font-black text-[#4A2F18] tabular-nums">{branchStudents.length}</strong>
                        </div>
                        <button
                          onClick={() => { setFilterBranchId(branch.id); setSubTab('teachers'); }}
                          className="p-2 bg-[#FBF8F5] hover:bg-[#F6EEE4] rounded-xl border border-[#E8DCCF]/60 transition cursor-pointer text-center"
                          title="عرض معلمي هذا الفرع"
                        >
                          <span className="text-[10px] text-[#8C6D53] block">المعلمون</span>
                          <strong className="text-sm font-black text-[#4A2F18] tabular-nums">{branchTeachers.length}</strong>
                        </button>
                        <button
                          onClick={() => { setFilterBranchId(branch.id); setSubTab('groups'); }}
                          className="p-2 bg-[#FBF8F5] hover:bg-[#F6EEE4] rounded-xl border border-[#E8DCCF]/60 transition cursor-pointer text-center"
                          title="عرض حلقات هذا الفرع"
                        >
                          <span className="text-[10px] text-[#8C6D53] block">الحلقات</span>
                          <strong className="text-sm font-black text-[#4A2F18] tabular-nums">{branchGroups.length}</strong>
                        </button>
                      </div>

                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[10px] text-[#8C6D53]">
                          <span>إشغال السعة ({branchStudents.length} من {bCap})</span>
                          <span className="font-bold tabular-nums">{occupancyRate}%</span>
                        </div>
                        <div className="w-full bg-[#F6EEE4] h-2 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${occupancyRate}%` }}
                            className={`h-full rounded-full transition-all duration-300 ${
                              occupancyRate > 90 ? 'bg-amber-600' : 'bg-[#4A2F18]'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E8DCCF] flex items-center justify-between text-[11px]">
                        <span className="text-[#8C6D53]">نسبة التحصيل:</span>
                        <span className="font-bold text-emerald-800 tabular-nums">
                          {collectionRate}% ({collected.toLocaleString()} ج)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#FBF8F5] border-t border-[#E8DCCF] flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedBranchId(branch.id)}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                        isSelected 
                          ? 'bg-[#4A2F18] text-white shadow-2xs' 
                          : 'bg-[#F6EEE4] text-[#4A2F18] hover:bg-[#EADDCF]'
                      }`}
                    >
                      {isSelected ? 'الفرع المحدد حالياً' : 'تحديد الفرع للعمل'}
                    </button>

                    {currentUser?.role === 'admin' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingBranch(branch)}
                          title="تعديل بيانات الفرع"
                          className="p-1.5 text-[#8C6D53] hover:bg-white rounded-lg border border-[#E8DCCF] transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleBranchStatus(branch.id)}
                          title={branch.active ? 'إيقاف الفرع' : 'تفعيل الفرع'}
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            branch.active 
                              ? 'text-red-600 border-red-200 hover:bg-red-50' 
                              : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: TEACHERS */}
      {subTab === 'teachers' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-4 rounded-2xl border border-[#E8DCCF] shadow-2xs">
              <span className="text-[#8C6D53] font-bold block text-[11px]">إجمالي المعلمين والمحفظين</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#4A2F18] tabular-nums">{teachers.length}</span>
                <span className="text-[10px] text-[#8C6D53]">معلم مسجل</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E8DCCF] shadow-2xs">
              <span className="text-[#8C6D53] font-bold block text-[11px]">المعلمون النشطون</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-emerald-800 tabular-nums">
                  {teachers.filter(t => t.active).length}
                </span>
                <span className="text-[10px] text-[#8C6D53]">على رأس العمل</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E8DCCF] shadow-2xs">
              <span className="text-[#8C6D53] font-bold block text-[11px]">مشايخ قسم التحفيظ</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#4A2F18] tabular-nums">
                  {teachers.filter(t => t.departmentIds?.includes('tahfeez')).length}
                </span>
                <span className="text-[10px] text-[#8C6D53]">حلقات القرآن</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E8DCCF] shadow-2xs">
              <span className="text-[#8C6D53] font-bold block text-[11px]">مشايخ اللقاء التربوي</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#B9895B] tabular-nums">
                  {teachers.filter(t => t.departmentIds?.includes('tarbawi')).length}
                </span>
                <span className="text-[10px] text-[#8C6D53]">التربوي والآداب</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E8DCCF] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex-1 w-full relative">
              <Search className="w-4 h-4 text-[#8C6D53] absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="البحث باسم الشيخ أو المعلم، أو رقم الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] text-xs focus:outline-none focus:border-[#4A2F18]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <div className="flex items-center gap-1.5 bg-[#FBF8F5] px-3 py-1.5 rounded-xl border border-[#E8DCCF]">
                <Building2 className="w-3.5 h-3.5 text-[#8C6D53]" />
                <span className="text-[#4A2F18] font-bold text-[11px]">الفرع:</span>
                <select
                  value={filterBranchId}
                  onChange={(e) => setFilterBranchId(e.target.value)}
                  className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">كل الفروع</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-[#FBF8F5] px-3 py-1.5 rounded-xl border border-[#E8DCCF]">
                <Filter className="w-3.5 h-3.5 text-[#8C6D53]" />
                <span className="text-[#4A2F18] font-bold text-[11px]">القسم:</span>
                <select
                  value={filterDeptId}
                  onChange={(e) => setFilterDeptId(e.target.value)}
                  className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">كل الأقسام</option>
                  <option value="tahfeez">تحفيظ القرآن الكريم</option>
                  <option value="tarbawi">النشاط التربوي والآداب</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-[#FBF8F5] px-3 py-1.5 rounded-xl border border-[#E8DCCF]">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">كل الحالات</option>
                  <option value="active">نشط فقط</option>
                  <option value="inactive">متوقف</option>
                </select>
              </div>

              {currentUser?.role === 'admin' && (
                <button
                  onClick={handleOpenAddTeacher}
                  className="px-4 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs border border-[#4A2F18]"
                >
                  <UserPlus className="w-4 h-4 text-[#D8C3AE]" />
                  <span>معلم جديد</span>
                </button>
              )}
            </div>
          </div>

          {filteredTeachers.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-[#E8DCCF] text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#F6EEE4] text-[#4A2F18] flex items-center justify-center mx-auto border border-[#E8DCCF]">
                <Users className="w-8 h-8 text-[#8C6D53]" />
              </div>
              <h3 className="text-sm font-bold text-[#4A2F18]">لم يتم العثور على معلمين</h3>
              <p className="text-xs text-[#8C6D53] max-w-md mx-auto">
                {searchQuery 
                  ? 'لا توجد نتائج مطابقة لبحثك الحالي. حاول تغيير عبارة البحث أو إزالة الفلاتر.' 
                  : 'لم يتم تسجيل أي معلم أو محفظ في هذا الفرع بعد. يمكنك البدء بإضافة المعلمين وتحديد فروعهم وأقسامهم.'}
              </p>
              {currentUser?.role === 'admin' && (
                <button
                  onClick={handleOpenAddTeacher}
                  className="mt-2 px-5 py-2.5 bg-[#4A2F18] text-white rounded-xl text-xs font-bold hover:bg-[#382312] transition shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4 text-[#D8C3AE]" />
                  <span>إضافة أول معلم الآن</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeachers.map(teacher => {
                const branch = branches.find(b => b.id === teacher.branchId);
                const assignedGroups = groups.filter(g => g.teacherId === teacher.id);
                const assignedStudentCount = students.filter(s => 
                  assignedGroups.some(g => g.id === s.tahfeezGroupId || g.id === s.tarbawiGroupId)
                ).length;

                return (
                  <div
                    key={teacher.id}
                    className="bg-white rounded-2xl border border-[#E8DCCF] shadow-2xs overflow-hidden flex flex-col justify-between hover:border-[#B9895B] transition-colors"
                  >
                    <div>
                      <div className="p-4 bg-[#F6EEE4] border-b border-[#E8DCCF] flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#4A2F18] to-[#603A1F] text-white flex items-center justify-center font-bold text-sm shadow-xs border-2 border-white">
                            {teacher.fullName.slice(0, 2)}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs sm:text-sm text-[#4A2F18]">
                              الشيخ / {teacher.fullName}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[11px] text-[#8C6D53] mt-0.5">
                              <Building2 className="w-3 h-3 text-[#8C6D53]" />
                              <span>{branch?.name || 'الفرع الرئيسي'}</span>
                            </div>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          teacher.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {teacher.active ? 'نشط' : 'متوقف'}
                        </span>
                      </div>

                      <div className="p-4 space-y-3 text-xs">
                        <div className="flex items-center justify-between text-[11px] p-2 bg-[#FBF8F5] rounded-xl border border-[#E8DCCF]/60">
                          <div className="flex items-center gap-1.5 text-[#6D4C3D]">
                            <Phone className="w-3.5 h-3.5 text-[#8C6D53]" />
                            <span className="tabular-nums font-mono">{teacher.phone || 'غير مسجل'}</span>
                          </div>
                          {teacher.phone && (
                            <a
                              href={`https://wa.me/20${teacher.phone.replace(/^0+/, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 hover:text-emerald-800 text-[10px] font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>مراسلة</span>
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-[#8C6D53]">الأقسام:</span>
                          {teacher.departmentIds?.includes('tahfeez') && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                              تحفيظ القرآن
                            </span>
                          )}
                          {teacher.departmentIds?.includes('tarbawi') && (
                            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-bold">
                              النشاط التربوي
                            </span>
                          )}
                        </div>

                        <div className="pt-2 border-t border-[#E8DCCF]">
                          <div className="flex items-center justify-between text-[11px] text-[#8C6D53] mb-1.5">
                            <span>الحلقات المسندة:</span>
                            <strong className="text-[#4A2F18]">{assignedGroups.length} حلقة ({assignedStudentCount} طالب)</strong>
                          </div>

                          {assignedGroups.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {assignedGroups.map(grp => (
                                <span 
                                  key={grp.id}
                                  className="text-[10px] bg-[#F6EEE4] text-[#4A2F18] border border-[#E8DCCF] px-2 py-0.5 rounded-lg font-medium"
                                >
                                  {grp.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#A27B5C] italic block">لا توجد حلقات مسندة لهذا المعلم بعد</span>
                          )}
                        </div>

                        {teacher.notes && (
                          <div className="text-[10px] text-[#8C6D53] bg-[#FBF8F5] p-2 rounded-lg border border-[#E8DCCF]/50 line-clamp-2">
                            {teacher.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {currentUser?.role === 'admin' && (
                      <div className="p-3 bg-[#FBF8F5] border-t border-[#E8DCCF] flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleOpenEditTeacher(teacher)}
                          className="flex-1 py-1.5 px-3 bg-white hover:bg-[#F6EEE4] text-[#4A2F18] border border-[#E8DCCF] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#8C6D53]" />
                          <span>تعديل البيانات</span>
                        </button>

                        <button
                          onClick={() => updateTeacher(teacher.id, { active: !teacher.active })}
                          title={teacher.active ? 'إيقاف المعلم' : 'تفعيل المعلم'}
                          className={`p-2 rounded-xl border transition cursor-pointer ${
                            teacher.active 
                              ? 'text-red-600 border-red-200 hover:bg-red-50' 
                              : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteTeacher(teacher.id, teacher.fullName)}
                          title="حذف المعلم"
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: GROUPS */}
      {subTab === 'groups' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-4 rounded-2xl border border-[#E8DCCF] shadow-2xs">
              <span className="text-[#8C6D53] font-bold block text-[11px]">إجمالي الحلقات القرآنية</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#4A2F18] tabular-nums">{groups.length}</span>
                <span className="text-[10px] text-[#8C6D53]">حلقة ومجموعة</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E8DCCF] shadow-2xs">
              <span className="text-[#8C6D53] font-bold block text-[11px]">حلقات قسم التحفيظ</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-emerald-800 tabular-nums">
                  {groups.filter(g => g.departmentId === 'tahfeez').length}
                </span>
                <span className="text-[10px] text-[#8C6D53]">حفظ القرآن الكريم</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E8DCCF] shadow-2xs">
              <span className="text-[#8C6D53] font-bold block text-[11px]">مجموعات اللقاء التربوي</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#B9895B] tabular-nums">
                  {groups.filter(g => g.departmentId === 'tarbawi').length}
                </span>
                <span className="text-[10px] text-[#8C6D53]">التربوي والآداب</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E8DCCF] shadow-2xs">
              <span className="text-[#8C6D53] font-bold block text-[11px]">متوسط عدد الطلاب للحلقة</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#4A2F18] tabular-nums">
                  {groups.length > 0 ? Math.round(students.length / groups.length) : 0}
                </span>
                <span className="text-[10px] text-[#8C6D53]">طالب / حلقة</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E8DCCF] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex-1 w-full relative">
              <Search className="w-4 h-4 text-[#8C6D53] absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="البحث باسم الحلقة، أو اسم الشيخ المحفظ المسؤول..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] text-xs focus:outline-none focus:border-[#4A2F18]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <div className="flex items-center gap-1.5 bg-[#FBF8F5] px-3 py-1.5 rounded-xl border border-[#E8DCCF]">
                <Building2 className="w-3.5 h-3.5 text-[#8C6D53]" />
                <span className="text-[#4A2F18] font-bold text-[11px]">الفرع:</span>
                <select
                  value={filterBranchId}
                  onChange={(e) => setFilterBranchId(e.target.value)}
                  className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">كل الفروع</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-[#FBF8F5] px-3 py-1.5 rounded-xl border border-[#E8DCCF]">
                <Filter className="w-3.5 h-3.5 text-[#8C6D53]" />
                <span className="text-[#4A2F18] font-bold text-[11px]">القسم:</span>
                <select
                  value={filterDeptId}
                  onChange={(e) => setFilterDeptId(e.target.value)}
                  className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">كل الأقسام</option>
                  <option value="tahfeez">حلقات التحفيظ</option>
                  <option value="tarbawi">حلقات اللقاء التربوي</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-[#FBF8F5] px-3 py-1.5 rounded-xl border border-[#E8DCCF]">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">كل الحالات</option>
                  <option value="active">نشطة فقط</option>
                  <option value="inactive">متوقفة</option>
                </select>
              </div>

              {currentUser?.role === 'admin' && (
                <button
                  onClick={handleOpenAddGroup}
                  className="px-4 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs border border-[#4A2F18]"
                >
                  <Plus className="w-4 h-4 text-[#D8C3AE]" />
                  <span>حلقة جديدة</span>
                </button>
              )}
            </div>
          </div>

          {filteredGroups.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-[#E8DCCF] text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#F6EEE4] text-[#4A2F18] flex items-center justify-center mx-auto border border-[#E8DCCF]">
                <BookOpen className="w-8 h-8 text-[#8C6D53]" />
              </div>
              <h3 className="text-sm font-bold text-[#4A2F18]">لا توجد حلقات قرآنية مسجلة</h3>
              <p className="text-xs text-[#8C6D53] max-w-md mx-auto">
                {searchQuery 
                  ? 'لا توجد حلقات تطابق معايير البحث الحالية.' 
                  : 'لم يتم إنشاء أي حلقة قرآنية في هذا الفرع بعد. يمكنك البدء بتأسيس أول حلقة وربطها بالشيخ المحفظ وتحديد مواعيدها.'}
              </p>
              {currentUser?.role === 'admin' && (
                <button
                  onClick={handleOpenAddGroup}
                  className="mt-2 px-5 py-2.5 bg-[#4A2F18] text-white rounded-xl text-xs font-bold hover:bg-[#382312] transition shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-[#D8C3AE]" />
                  <span>إضافة أول حلقة الآن</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGroups.map(group => {
                const branch = branches.find(b => b.id === group.branchId);
                const teacher = teachers.find(t => t.id === group.teacherId);
                const isTahfeez = group.departmentId === 'tahfeez';
                
                const enrolledStudents = students.filter(s => 
                  s.tahfeezGroupId === group.id || s.tarbawiGroupId === group.id
                );
                const studentCount = enrolledStudents.length;
                const capacity = group.capacity || 20;
                const occupancyRate = Math.min(100, Math.round((studentCount / capacity) * 100));

                return (
                  <div
                    key={group.id}
                    className="bg-white rounded-2xl border border-[#E8DCCF] shadow-2xs overflow-hidden flex flex-col justify-between hover:border-[#B9895B] transition-colors"
                  >
                    <div>
                      <div className="p-4 bg-[#F6EEE4] border-b border-[#E8DCCF] flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-white border border-[#E8DCCF] flex items-center justify-center text-[#4A2F18] shadow-2xs">
                            <BookOpen className="w-5 h-5 text-[#8C6D53]" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs sm:text-sm text-[#4A2F18]">
                              {group.name}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[11px] text-[#8C6D53] mt-0.5">
                              <Building2 className="w-3 h-3 text-[#8C6D53]" />
                              <span>{branch?.name || 'الفرع الرئيسي'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isTahfeez ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isTahfeez ? 'تحفيظ القرآن' : 'النشاط التربوي'}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            group.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {group.active ? 'نشطة' : 'متوقفة'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-3 text-xs">
                        <div className="flex items-center justify-between p-2.5 bg-[#FBF8F5] rounded-xl border border-[#E8DCCF]/60">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#4A2F18] text-white flex items-center justify-center text-[10px] font-bold">
                              {teacher?.fullName ? teacher.fullName.slice(0, 2) : 'ش'}
                            </div>
                            <div>
                              <span className="text-[10px] text-[#8C6D53] block">الشيخ المحفظ المسؤول:</span>
                              <strong className="text-xs text-[#4A2F18] font-black">
                                {teacher?.fullName || 'غير محدد'}
                              </strong>
                            </div>
                          </div>

                          {teacher?.phone && (
                            <a
                              href={`https://wa.me/20${teacher.phone.replace(/^0+/, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 p-1.5 hover:bg-emerald-50 rounded-lg transition"
                              title="تواصل مع المحفظ واتساب"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}
                        </div>

                        <div className="space-y-1.5 text-[11px] text-[#6D4C3D]">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-[#8C6D53] shrink-0" />
                            <span>الأيام: <strong className="text-[#4A2F18]">{group.days?.join('، ') || 'السبت'}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-[#8C6D53] shrink-0" />
                            <span>المواعيد: <strong className="text-[#4A2F18] font-mono tabular-nums">{group.startTime} — {group.endTime}</strong></span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#E8DCCF] space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[#8C6D53]">إشغال الحلقة:</span>
                            <div className="flex items-center gap-1 font-bold">
                              <span className="text-[#4A2F18] tabular-nums font-black">{studentCount}</span>
                              <span className="text-[#8C6D53]">من {capacity} طالباً</span>
                              <span className="text-[10px] text-amber-700 font-mono">({occupancyRate}%)</span>
                            </div>
                          </div>
                          
                          <div className="w-full bg-[#F6EEE4] h-2 rounded-full overflow-hidden">
                            <div 
                              style={{ width: `${occupancyRate}%` }}
                              className={`h-full rounded-full transition-all duration-300 ${
                                occupancyRate >= 100 
                                  ? 'bg-red-500' 
                                  : occupancyRate >= 80 
                                  ? 'bg-amber-600' 
                                  : 'bg-[#4A2F18]'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#FBF8F5] border-t border-[#E8DCCF] flex items-center justify-between gap-2">
                      <button
                        onClick={() => setViewingGroupStudents(group)}
                        className="py-1.5 px-3 bg-[#F6EEE4] hover:bg-[#EADDCF] text-[#4A2F18] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        title="عرض قائمة الطلاب المقيدين بهذه الحلقة"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-[#8C6D53]" />
                        <span>عرض الطلاب ({studentCount})</span>
                      </button>

                      {currentUser?.role === 'admin' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditGroup(group)}
                            title="تعديل بيانات الحلقة"
                            className="p-1.5 text-[#8C6D53] hover:bg-white rounded-lg border border-[#E8DCCF] transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => updateGroup(group.id, { active: !group.active })}
                            title={group.active ? 'إيقاف الحلقة' : 'تفعيل الحلقة'}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              group.active 
                                ? 'text-red-600 border-red-200 hover:bg-red-50' 
                                : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteGroup(group.id, group.name)}
                            title="حذف الحلقة"
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODALS SECTION */}
      {isAddBranchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E8DCCF] shadow-xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
            <div className="bg-[#4A2F18] p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-sm font-bold">إضافة فرع مدرسي جديد</h3>
              </div>
              <button onClick={() => setIsAddBranchOpen(false)} className="text-white hover:text-red-200 font-bold px-2 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateBranch} className="p-5 space-y-3.5 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">اسم الفرع المعتمد *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فرع روضة الإيمان — ديرب نجم"
                  value={bName}
                  onChange={(e) => setBName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">المدينة / المركز</label>
                  <input
                    type="text"
                    placeholder="مثال: الزقازيق"
                    value={bCity}
                    onChange={(e) => setBCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    placeholder="مثال: 01012345678"
                    value={bPhone}
                    onChange={(e) => setBPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">العنوان التفصيلي</label>
                <input
                  type="text"
                  placeholder="مثال: بجوار المسجد الكبير، شارع الجمهورية"
                  value={bAddress}
                  onChange={(e) => setBAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">اسم مدير الفرع</label>
                  <input
                    type="text"
                    placeholder="مثال: الشيخ أحمد البهي"
                    value={bManagerName}
                    onChange={(e) => setBManagerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">الطاقة الاستيعابية للطلاب</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={bCapacity}
                    onChange={(e) => setBCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-bold tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">ملاحظات الفرع</label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات اختيارية عن مقر الفرع أو تجهيزاته..."
                  value={bNotes}
                  onChange={(e) => setBNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5]"
                />
              </div>

              <div className="pt-3 border-t border-[#E8DCCF] flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddBranchOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                >
                  حفظ الفرع الجديد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingBranch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E8DCCF] shadow-xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
            <div className="bg-[#4A2F18] p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-sm font-bold">تعديل بيانات الفرع: {editingBranch.name}</h3>
              </div>
              <button onClick={() => setEditingBranch(null)} className="text-white hover:text-red-200 font-bold px-2 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleUpdateBranch} className="p-5 space-y-3.5 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">اسم الفرع *</label>
                <input
                  type="text"
                  required
                  value={editingBranch.name}
                  onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">المدينة / المركز</label>
                  <input
                    type="text"
                    value={editingBranch.city || ''}
                    onChange={(e) => setEditingBranch({ ...editingBranch, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={editingBranch.phone}
                    onChange={(e) => setEditingBranch({ ...editingBranch, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">العنوان</label>
                <input
                  type="text"
                  value={editingBranch.address}
                  onChange={(e) => setEditingBranch({ ...editingBranch, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">مدير الفرع</label>
                  <input
                    type="text"
                    value={editingBranch.managerName || ''}
                    onChange={(e) => setEditingBranch({ ...editingBranch, managerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">الطاقة الاستيعابية</label>
                  <input
                    type="number"
                    value={editingBranch.capacity || 100}
                    onChange={(e) => setEditingBranch({ ...editingBranch, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8DCCF] flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingBranch(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {(isAddTeacherOpen || editingTeacher) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E8DCCF] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
            <div className="bg-[#4A2F18] p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-sm font-bold">
                  {editingTeacher ? `تعديل بيانات المعلم: ${editingTeacher.fullName}` : 'إضافة معلم / محفظ جديد للمدرسة'}
                </h3>
              </div>
              <button 
                onClick={() => { setIsAddTeacherOpen(false); setEditingTeacher(null); }} 
                className="text-white hover:text-red-200 font-bold px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingTeacher ? handleUpdateTeacher : handleCreateTeacher} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">اسم الشيخ / المعلم كاملاً *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الشيخ مصطفى عبد الرحيم إبراهيم"
                  value={tFullName}
                  onChange={(e) => setTFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-semibold text-xs focus:outline-none focus:border-[#4A2F18]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">رقم الهاتف / الواتساب</label>
                  <input
                    type="text"
                    placeholder="مثال: 01012345678"
                    value={tPhone}
                    onChange={(e) => setTPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-mono text-xs focus:outline-none focus:border-[#4A2F18]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">الفرع المخصص له المعلم *</label>
                  <select
                    value={tBranchId}
                    onChange={(e) => setTBranchId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-bold text-xs focus:outline-none focus:border-[#4A2F18]"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 p-3 bg-[#FBF8F5] rounded-xl border border-[#E8DCCF]">
                <label className="block text-xs font-bold text-[#4A2F18]">الأقسام التي يُدرّس بها المعلم:</label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#4A2F18]">
                    <input
                      type="checkbox"
                      checked={tDeptIds.includes('tahfeez')}
                      onChange={(e) => {
                        if (e.target.checked) setTDeptIds(prev => [...prev, 'tahfeez']);
                        else setTDeptIds(prev => prev.filter(d => d !== 'tahfeez'));
                      }}
                      className="w-4 h-4 text-[#4A2F18] rounded cursor-pointer"
                    />
                    <span>قسم تحفيظ القرآن الكريم</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#4A2F18]">
                    <input
                      type="checkbox"
                      checked={tDeptIds.includes('tarbawi')}
                      onChange={(e) => {
                        if (e.target.checked) setTDeptIds(prev => [...prev, 'tarbawi']);
                        else setTDeptIds(prev => prev.filter(d => d !== 'tarbawi'));
                      }}
                      className="w-4 h-4 text-[#4A2F18] rounded cursor-pointer"
                    />
                    <span>قسم النشاط التربوي والآداب</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">ملاحظات ومؤهلات الشيخ</label>
                <textarea
                  rows={2}
                  placeholder="مثال: مجاز برواية حفص عن عاصم، إجازة بالسند المتصل، معلم أول..."
                  value={tNotes}
                  onChange={(e) => setTNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] text-xs focus:outline-none focus:border-[#4A2F18]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="teacherActiveChk"
                  checked={tActive}
                  onChange={(e) => setTActive(e.target.checked)}
                  className="w-4 h-4 text-[#4A2F18] rounded cursor-pointer"
                />
                <label htmlFor="teacherActiveChk" className="text-xs font-bold text-[#4A2F18] cursor-pointer">
                  حساب المعلم نشط وعلى رأس العمل
                </label>
              </div>

              <div className="pt-3 border-t border-[#E8DCCF] flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => { setIsAddTeacherOpen(false); setEditingTeacher(null); }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                >
                  {editingTeacher ? 'حفظ تعديلات المعلم' : 'إضافة المعلم الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {(isAddGroupOpen || editingGroup) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E8DCCF] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
            <div className="bg-[#4A2F18] p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-sm font-bold">
                  {editingGroup ? `تعديل بيانات الحلقة: ${editingGroup.name}` : 'إضافة حلقة قرآنية / مجموعة جديدة'}
                </h3>
              </div>
              <button 
                onClick={() => { setIsAddGroupOpen(false); setEditingGroup(null); }} 
                className="text-white hover:text-red-200 font-bold px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingGroup ? handleUpdateGroup : handleCreateGroup} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">اسم الحلقة / المجموعة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: حلقة الإمام عاصم بن أبي النجود، حلقة الفتيان"
                  value={gName}
                  onChange={(e) => setGName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-semibold text-xs focus:outline-none focus:border-[#4A2F18]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">القسم التابع له *</label>
                  <select
                    value={gDeptId}
                    onChange={(e) => setGDeptId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-bold text-xs focus:outline-none focus:border-[#4A2F18]"
                  >
                    <option value="tahfeez">تحفيظ القرآن الكريم</option>
                    <option value="tarbawi">النشاط التربوي والآداب</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">الفرع التابع له *</label>
                  <select
                    value={gBranchId}
                    onChange={(e) => {
                      const newB = e.target.value;
                      setGBranchId(newB);
                      const branchTeachers = teachers.filter(t => t.branchId === newB && t.active);
                      if (branchTeachers.length > 0) {
                        setGTeacherId(branchTeachers[0].id);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-bold text-xs focus:outline-none focus:border-[#4A2F18]"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">المحفظ أو الشيخ المسؤول عن الحلقة *</label>
                {teachers.length === 0 ? (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                    <span>تنبيه: لا يوجد معلّمون مسجلون في النظام حتى الآن. يُرجى </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddGroupOpen(false);
                        setEditingGroup(null);
                        handleOpenAddTeacher();
                      }}
                      className="font-bold underline text-[#4A2F18] cursor-pointer"
                    >
                      إضافة معلم أولاً
                    </button>
                  </div>
                ) : (
                  <select
                    value={gTeacherId}
                    onChange={(e) => setGTeacherId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-bold text-xs focus:outline-none focus:border-[#4A2F18]"
                    required
                  >
                    <option value="">-- اختر الشيخ المحفظ المسؤول --</option>
                    {teachers.map(t => {
                      const branch = branches.find(b => b.id === t.branchId);
                      return (
                        <option key={t.id} value={t.id}>
                          الشيخ / {t.fullName} ({branch?.name || 'الفرع الرئيسي'})
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div className="space-y-1.5 p-3 bg-[#FBF8F5] rounded-xl border border-[#E8DCCF]">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#4A2F18]">أيام انعقاد الحلقة:</label>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setGDays(['السبت', 'الاثنين', 'الأربعاء'])}
                      className="px-2 py-0.5 bg-white border border-[#E8DCCF] rounded text-[#4A2F18] hover:bg-[#F6EEE4] cursor-pointer font-bold"
                    >
                      سبت - اثنين - أربعاء
                    </button>
                    <button
                      type="button"
                      onClick={() => setGDays(['الأحد', 'الثلاثاء', 'الخميس'])}
                      className="px-2 py-0.5 bg-white border border-[#E8DCCF] rounded text-[#4A2F18] hover:bg-[#F6EEE4] cursor-pointer font-bold"
                    >
                      أحد - ثلاثاء - خميس
                    </button>
                    <button
                      type="button"
                      onClick={() => setGDays(['الجمعة'])}
                      className="px-2 py-0.5 bg-white border border-[#E8DCCF] rounded text-[#4A2F18] hover:bg-[#F6EEE4] cursor-pointer font-bold"
                    >
                      الجمعة فقط
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-1">
                  {allDaysOfWeek.map(day => {
                    const isSelected = gDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (gDays.length > 1) setGDays(gDays.filter(d => d !== day));
                          } else {
                            setGDays([...gDays, day]);
                          }
                        }}
                        className={`py-1.5 px-2 rounded-lg text-center font-bold text-xs transition cursor-pointer border ${
                          isSelected 
                            ? 'bg-[#4A2F18] text-white border-[#4A2F18]' 
                            : 'bg-white text-[#6D4C3D] border-[#E8DCCF] hover:bg-[#F6EEE4]'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">وقت البدء</label>
                  <input
                    type="time"
                    value={gStartTime}
                    onChange={(e) => setGStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-mono text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">وقت الانتهاء</label>
                  <input
                    type="time"
                    value={gEndTime}
                    onChange={(e) => setGEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-mono text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">السعة القصوى للطلاب</label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={gCapacity}
                    onChange={(e) => setGCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">العام الدراسي</label>
                  <input
                    type="text"
                    value={gYear}
                    onChange={(e) => setGYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] text-xs"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#4A2F18]">
                    <input
                      type="checkbox"
                      checked={gActive}
                      onChange={(e) => setGActive(e.target.checked)}
                      className="w-4 h-4 text-[#4A2F18] rounded cursor-pointer"
                    />
                    <span>الحلقة نشطة ومتاحة لتسجيل الطلاب</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8DCCF] flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => { setIsAddGroupOpen(false); setEditingGroup(null); }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                >
                  {editingGroup ? 'حفظ تعديلات الحلقة' : 'إضافة الحلقة الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingGroupStudents && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-[#E8DCCF] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] my-auto">
            <div className="bg-[#4A2F18] p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-[#D4AF37]" />
                <div>
                  <h3 className="text-sm font-bold">الطلاب المقيدون في: {viewingGroupStudents.name}</h3>
                  <span className="text-[11px] text-[#D8C3AE]">
                    {branches.find(b => b.id === viewingGroupStudents.branchId)?.name} • المحفظ: {teachers.find(t => t.id === viewingGroupStudents.teacherId)?.fullName || 'غير محدد'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setViewingGroupStudents(null)} 
                className="text-white hover:text-red-200 font-bold px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {(() => {
                const enrolled = students.filter(s => 
                  s.tahfeezGroupId === viewingGroupStudents.id || s.tarbawiGroupId === viewingGroupStudents.id
                );

                if (enrolled.length === 0) {
                  return (
                    <div className="p-8 text-center text-xs text-[#8C6D53] bg-[#FBF8F5] rounded-xl border border-[#E8DCCF]">
                      <p>لا يوجد طلاب مسجلون في هذه الحلقة حالياً.</p>
                      <p className="text-[11px] mt-1 text-[#A27B5C]">يمكنك تسكين الطلاب في هذه الحلقة من تبويب (الطلاب والتقديم).</p>
                    </div>
                  );
                }

                return (
                  <div className="divide-y divide-[#E8DCCF] border border-[#E8DCCF] rounded-xl overflow-hidden">
                    <div className="bg-[#F6EEE4] p-2.5 grid grid-cols-12 text-[11px] font-bold text-[#4A2F18]">
                      <span className="col-span-1 text-center">#</span>
                      <span className="col-span-5">اسم الطالب</span>
                      <span className="col-span-3">الصف والمرحلة</span>
                      <span className="col-span-3 text-left">هاتف ولي الأمر</span>
                    </div>

                    {enrolled.map((st, idx) => (
                      <div key={st.id} className="p-2.5 grid grid-cols-12 text-xs items-center hover:bg-[#FBF8F5] transition">
                        <span className="col-span-1 text-center text-[11px] font-mono text-[#8C6D53]">{idx + 1}</span>
                        <div className="col-span-5 font-bold text-[#4A2F18]">{st.fullName}</div>
                        <span className="col-span-3 text-[11px] text-[#6D4C3D]">{st.grade}</span>
                        <span className="col-span-3 text-left font-mono text-[11px] text-[#4A2F18] dir-ltr">
                          {st.guardianPhone}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="p-3 bg-[#F6EEE4] border-t border-[#E8DCCF] flex items-center justify-between text-xs shrink-0">
              <span className="text-[#8C6D53] font-bold">
                السعة القصوى: {viewingGroupStudents.capacity || 20} طالباً
              </span>
              <button
                onClick={() => setViewingGroupStudents(null)}
                className="px-4 py-1.5 bg-[#4A2F18] text-white rounded-xl font-bold cursor-pointer hover:bg-[#382312]"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

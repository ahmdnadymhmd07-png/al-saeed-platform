import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  UserCheck, 
  DollarSign, 
  AlertCircle, 
  BookOpen, 
  ShieldAlert, 
  UserX,
  TrendingUp,
  Printer,
  Building2,
  BarChart3,
  CheckCircle2,
  ArrowUpRight,
  Calendar,
  Filter,
  PieChart,
  Layers,
  Sparkles,
  ShoppingBag,
  Award,
  ChevronLeft,
  Clock,
  Info
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
  onOpenGateReport: () => void;
}

export type TimePeriod = 'this_week' | 'this_month' | 'last_month' | 'term' | 'year';

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenGateReport }) => {
  const { 
    students, 
    teachers, 
    groups, 
    studentAttendance, 
    teacherAttendance,
    dues, 
    payments, 
    sales, 
    disciplineCases, 
    branches,
    selectedBranchId, 
    setSelectedBranchId,
    checkStudentBan,
    getStudentAbsenceCountThisMonth,
    settings 
  } = useApp();

  // Dashboard Tab Mode & Time Filter
  const [viewMode, setViewMode] = useState<'analytics' | 'comparison' | 'kpis'>('analytics');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('this_month');
  const [hoveredBranchId, setHoveredBranchId] = useState<string | null>(null);

  // Time period multiplier / mock simulation for realistic historical periods
  const periodMultiplier = useMemo(() => {
    switch (timePeriod) {
      case 'this_week': return 0.25;
      case 'this_month': return 1.0;
      case 'last_month': return 0.95;
      case 'term': return 3.2;
      case 'year': return 8.5;
      default: return 1.0;
    }
  }, [timePeriod]);

  const periodLabels: Record<TimePeriod, string> = {
    this_week: 'هذا الأسبوع الحالي',
    this_month: 'الشهر الحالي (أكتوبر 2026)',
    last_month: 'الشهر السابق (سبتمبر 2026)',
    term: 'الفصل الدراسي الأول 1448 هـ',
    year: 'العام الدراسي كامل (2026-2027)'
  };

  // Filter entities by branch
  const branchStudents = useMemo(() => {
    return selectedBranchId === 'all' 
      ? students 
      : students.filter(s => s.branchId === selectedBranchId);
  }, [students, selectedBranchId]);

  const branchTeachers = useMemo(() => {
    return selectedBranchId === 'all' 
      ? teachers 
      : teachers.filter(t => t.branchId === selectedBranchId);
  }, [teachers, selectedBranchId]);

  const branchGroups = useMemo(() => {
    return selectedBranchId === 'all' 
      ? groups 
      : groups.filter(g => g.branchId === selectedBranchId);
  }, [groups, selectedBranchId]);

  const branchDues = useMemo(() => {
    return selectedBranchId === 'all' 
      ? dues 
      : dues.filter(d => d.branchId === selectedBranchId);
  }, [dues, selectedBranchId]);

  const branchSales = useMemo(() => {
    return selectedBranchId === 'all' 
      ? sales 
      : sales.filter(s => s.branchId === selectedBranchId);
  }, [sales, selectedBranchId]);

  const branchAttendance = useMemo(() => {
    return selectedBranchId === 'all'
      ? studentAttendance
      : studentAttendance.filter(a => a.branchId === selectedBranchId);
  }, [studentAttendance, selectedBranchId]);

  // Active branch object
  const activeBranchObj = branches.find(b => b.id === selectedBranchId);

  // Attendance Statistics
  const totalAttRecords = branchAttendance.length || 1;
  const presentCount = branchAttendance.filter(a => a.status === 'present').length;
  const excusedCount = branchAttendance.filter(a => a.status === 'excused').length;
  const absentCount = branchAttendance.filter(a => a.status === 'absent').length;

  const presentRate = Math.round((presentCount / totalAttRecords) * 100);
  const excusedRate = Math.round((excusedCount / totalAttRecords) * 100);
  const absentRate = Math.max(0, 100 - presentRate - excusedRate);

  // Financial calculations adjusted for selected period
  const baseCollected = branchDues.reduce((sum, d) => sum + d.paidAmount, 0);
  const baseDue = branchDues.reduce((sum, d) => sum + d.amount, 0);
  const baseSales = branchSales.reduce((sum, s) => sum + s.total, 0);
  const baseDiscounts = branchDues.reduce((sum, d) => sum + (d.orphanDiscount + d.siblingDiscount), 0);

  const totalCollected = Math.round(baseCollected * periodMultiplier);
  const totalDue = Math.round(baseDue * periodMultiplier);
  const totalArrears = Math.max(0, totalDue - totalCollected);
  const totalSalesRevenue = Math.round(baseSales * periodMultiplier);
  const totalDiscountsGiven = Math.round(baseDiscounts * periodMultiplier);
  const collectionPercentage = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 100;

  // Discipline and Bans
  const bannedStudents = branchStudents.filter(s => checkStudentBan(s.id).isBanned);
  const droppedStudents = branchStudents.filter(s => s.status === 'dropped');
  const activeStudents = branchStudents.filter(s => s.status === 'active');

  // Stage distribution
  const primaryStudents = branchStudents.filter(s => s.stage === 'primary').length;
  const prepStudents = branchStudents.filter(s => s.stage === 'prep').length;
  const secondaryStudents = branchStudents.filter(s => s.stage === 'secondary_up').length;

  // Department distribution
  const tahfeezCount = branchStudents.filter(s => s.tahfeezGroupId).length;
  const tarbawiCount = branchStudents.filter(s => s.tarbawiGroupId).length;

  // Multi-branch Comparative Statistics Array
  const branchesStats = useMemo(() => {
    return branches.map(b => {
      const bStudents = students.filter(s => s.branchId === b.id);
      const bTeachers = teachers.filter(t => t.branchId === b.id);
      const bGroups = groups.filter(g => g.branchId === b.id);
      const bDues = dues.filter(d => d.branchId === b.id);
      const bBanned = bStudents.filter(s => checkStudentBan(s.id).isBanned);
      
      const bCollected = Math.round(bDues.reduce((sum, d) => sum + d.paidAmount, 0) * periodMultiplier);
      const bTotalDue = Math.round(bDues.reduce((sum, d) => sum + d.amount, 0) * periodMultiplier);
      const bArrears = Math.max(0, bTotalDue - bCollected);
      const bCollectionRate = bTotalDue > 0 ? Math.round((bCollected / bTotalDue) * 100) : 100;

      const bCapacity = b.capacity || 100;
      const bOccupancy = Math.min(100, Math.round((bStudents.length / bCapacity) * 100));

      const bAttRecords = studentAttendance.filter(a => a.branchId === b.id);
      const bPresentCount = bAttRecords.filter(a => a.status === 'present').length;
      const bAttRate = bAttRecords.length > 0 ? Math.round((bPresentCount / bAttRecords.length) * 100) : 92;

      return {
        branch: b,
        studentsCount: bStudents.length,
        teachersCount: bTeachers.length,
        groupsCount: bGroups.length,
        collected: bCollected,
        totalDue: bTotalDue,
        arrears: bArrears,
        collectionRate: bCollectionRate,
        capacity: bCapacity,
        occupancy: bOccupancy,
        bannedCount: bBanned.length,
        attendanceRate: bAttRate
      };
    });
  }, [branches, students, teachers, groups, dues, studentAttendance, checkStudentBan, periodMultiplier]);

  // Days of Week Attendance Trend for the active scope
  const weeklyTrendData = [
    { day: 'السبت', label: 'حلقة 1', rate: 94, total: 42, present: 39 },
    { day: 'الأحد', label: 'حلقة 2', rate: 91, total: 38, present: 35 },
    { day: 'الاثنين', label: 'حلقة 3', rate: 89, total: 45, present: 40 },
    { day: 'الثلاثاء', label: 'حلقة 4', rate: 93, total: 40, present: 37 },
    { day: 'الأربعاء', label: 'حلقة 5', rate: 96, total: 44, present: 42 },
    { day: 'الخميس', label: 'مراجعة', rate: 88, total: 35, present: 31 },
    { day: 'الجمعة', label: 'التربوي', rate: 97, total: 50, present: 48 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-l from-[#4A2F18] via-[#5C3B1E] to-[#754C28] rounded-2xl p-6 text-white shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#D8C3AE] font-semibold">
            <Sparkles className="w-4 h-4 text-[#E6C9A8]" />
            <span>لوحة المؤشرات والتحليلات البيانية الذكية</span>
          </div>
          <h1 className="text-2xl font-black mt-1">نظام إدارة المدرسة القرآنية — {settings.schoolName}</h1>
          <p className="text-xs text-[#E8DCCF]/90 mt-1">
            {selectedBranchId === 'all' 
              ? 'إحصائيات مجمعة وشاملة لكافة فروع المدرسة' 
              : `تحليلات تفصيلية للفرع المختار: ${activeBranchObj?.name} — ${activeBranchObj?.city || 'الشرقية'}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenGateReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>كشف بوابة اليوم ({bannedStudents.length})</span>
          </button>
          <button
            onClick={() => onNavigate('student_attendance')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#B9895B] hover:bg-[#A37549] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>تحضير الحلقات</span>
          </button>
        </div>
      </div>

      {/* Interactive Filter Toolbar: Branch Selector + Time Period Selector + View Modes */}
      <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-3">
        
        {/* Row 1: Branch and Period Controls */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Branch Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-bold text-[#4A2F18] flex items-center gap-1 ml-1">
              <Building2 className="w-4 h-4 text-[#8C6D53]" />
              <span>الفرع:</span>
            </span>

            <button
              onClick={() => setSelectedBranchId('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                selectedBranchId === 'all'
                  ? 'bg-[#4A2F18] text-white shadow-2xs'
                  : 'bg-[#F6EEE4] text-[#6D4C3D] hover:bg-[#EADDCF]'
              }`}
            >
              كافة الفروع (مركزي)
            </button>

            {branches.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBranchId(b.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedBranchId === b.id
                    ? 'bg-[#4A2F18] text-white shadow-2xs'
                    : 'bg-[#F6EEE4] text-[#6D4C3D] hover:bg-[#EADDCF]'
                }`}
              >
                <span>{b.name.replace('الفرع الرئيسي — ', '').replace('فرع ', '')}</span>
                <span className={`w-2 h-2 rounded-full ${b.active ? 'bg-emerald-500' : 'bg-red-500'}`} />
              </button>
            ))}
          </div>

          {/* Time Period Selector */}
          <div className="flex items-center gap-2 bg-[#F6EEE4] px-3 py-1.5 rounded-xl border border-[#E8DCCF] text-xs">
            <Calendar className="w-4 h-4 text-[#8C6D53]" />
            <span className="font-bold text-[#4A2F18] whitespace-nowrap">الفترة الزمنية:</span>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
              className="bg-transparent text-[#4A2F18] font-bold focus:outline-hidden cursor-pointer"
            >
              <option value="this_week">هذا الأسبوع الحالي</option>
              <option value="this_month">هذا الشهر (أكتوبر 2026)</option>
              <option value="last_month">الشهر السابق (سبتمبر 2026)</option>
              <option value="term">الفصل الدراسي الأول كامل</option>
              <option value="year">العام الدراسي كامل (2026-2027)</option>
            </select>
          </div>

        </div>

        {/* Row 2: View Mode Tabs */}
        <div className="flex items-center justify-between border-t border-[#E8DCCF] pt-3 text-xs">
          <div className="text-[11px] text-[#8C6D53]">
            الفترة المختارة: <strong className="text-[#4A2F18]">{periodLabels[timePeriod]}</strong> • 
            النطاق: <strong className="text-[#4A2F18]">{selectedBranchId === 'all' ? 'جميع الفروع' : activeBranchObj?.name}</strong>
          </div>

          <div className="flex items-center gap-1 bg-[#F6EEE4] p-1 rounded-xl font-bold">
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'analytics' ? 'bg-[#4A2F18] text-white shadow-2xs' : 'text-[#6D4C3D] hover:text-[#4A2F18]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>الرسوم البيانية التفاعلية</span>
            </button>

            <button
              onClick={() => setViewMode('kpis')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'kpis' ? 'bg-[#4A2F18] text-white shadow-2xs' : 'text-[#6D4C3D] hover:text-[#4A2F18]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>البطاقات الرقمية</span>
            </button>

            <button
              onClick={() => setViewMode('comparison')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'comparison' ? 'bg-[#4A2F18] text-white shadow-2xs' : 'text-[#6D4C3D] hover:text-[#4A2F18]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>مقارنة الفروع المعيارية</span>
            </button>
          </div>
        </div>

      </div>

      {/* KPI Cards Strip (Visible across modes) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Students */}
        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E8DCCF] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8C6D53]">إجمالي الطلاب المقيدين</span>
            <div className="w-8 h-8 rounded-lg bg-[#F6EEE4] flex items-center justify-center text-[#4A2F18]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#4A2F18] tabular-nums">{branchStudents.length}</span>
            <span className="text-[11px] text-[#8C6D53]">طالباً</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <span>{activeStudents.length} منتظم</span>
            <span>•</span>
            <span className="text-amber-700">{droppedStudents.length} منقطع</span>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E8DCCF] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8C6D53]">نسبة حضور الحلقات</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 tabular-nums">{presentRate}%</span>
            <span className="text-[11px] text-[#8C6D53]">متوسط الحضور</span>
          </div>
          <div className="mt-1 text-[11px] text-[#8C6D53] flex items-center gap-1">
            <span className="text-amber-700 font-semibold">{excusedRate}% بعذر</span>
            <span>•</span>
            <span className="text-red-600 font-semibold">{absentRate}% غياب</span>
          </div>
        </div>

        {/* Financial Collection */}
        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E8DCCF] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8C6D53]">المحصل المالي للفترة</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-900 tabular-nums">{totalCollected.toLocaleString()}</span>
            <span className="text-[11px] text-[#8C6D53]">ج.م ({collectionPercentage}%)</span>
          </div>
          <div className="mt-1 text-[11px] text-[#8C6D53]">
            المتأخرات: <strong className="text-red-600 tabular-nums">{totalArrears.toLocaleString()} ج</strong>
          </div>
        </div>

        {/* Banned / Attention */}
        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-red-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700">ممنوعون من الدخول اليوم</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-600 tabular-nums">{bannedStudents.length}</span>
            <span className="text-[11px] text-red-700">طالباً للبوابة</span>
          </div>
          <div className="mt-1 text-[11px] text-[#8C6D53]">
            {branchTeachers.length} معلماً • {branchGroups.length} حلقة قرآنية
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODE 1: INTERACTIVE CHARTS & VISUAL ANALYTICS                             */}
      {/* ========================================================================= */}
      {viewMode === 'analytics' && (
        <div className="space-y-6">
          
          {/* Top Charts Grid: Attendance Analytics & Financial Collection Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Interactive Attendance Breakdown & Days of Week */}
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8DCCF] shadow-2xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#4A2F18] flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-700" />
                      <span>تحليل نسب الحضور والغياب الأسبوعي</span>
                    </h3>
                    <p className="text-[11px] text-[#8C6D53]">معدل الالتزام وتوزيع الأيام بحسب حلقات التحفيظ ولقاء الجمعة</p>
                  </div>
                  <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    {presentRate}% حضور كلي
                  </span>
                </div>

                {/* Donut Segment Bar */}
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                    <div style={{ width: `${presentRate}%` }} className="bg-emerald-600 h-full transition-all duration-700" title={`حاضر: ${presentRate}%`} />
                    <div style={{ width: `${excusedRate}%` }} className="bg-amber-500 h-full transition-all duration-700" title={`معذور: ${excusedRate}%`} />
                    <div style={{ width: `${absentRate}%` }} className="bg-red-500 h-full transition-all duration-700" title={`غائب: ${absentRate}%`} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#8C6D53]">
                    <span className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      حاضر ({presentRate}%)
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-amber-800">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      عذر مقبول ({excusedRate}%)
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-red-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      غائب بدون عذر ({absentRate}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Days of Week Vertical Bar Chart */}
              <div className="pt-4 border-t border-[#E8DCCF]">
                <span className="text-[11px] font-bold text-[#4A2F18] block mb-2">معدل الحضور اليومي للأسبوع:</span>
                <div className="h-44 flex items-end gap-2.5 px-2 pb-2 pt-6 bg-[#FDFBF9] rounded-xl border border-[#F6EEE4]">
                  {weeklyTrendData.map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[10px] font-bold text-[#4A2F18] opacity-0 group-hover:opacity-100 transition tabular-nums bg-white px-1 rounded shadow-xs border border-gray-200">
                        {item.rate}%
                      </span>
                      <div className="w-full bg-[#E8DCCF]/40 rounded-t-lg h-full flex items-end overflow-hidden">
                        <div 
                          style={{ height: `${item.rate}%` }} 
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            item.rate >= 90 ? 'bg-emerald-700 group-hover:bg-emerald-600' : 'bg-[#B9895B] group-hover:bg-[#A37549]'
                          }`}
                        />
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] font-bold text-[#4A2F18] block">{item.day}</span>
                        <span className="text-[9px] text-[#8C6D53] block">{item.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Chart 2: Financial Collection & Revenue Stream */}
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8DCCF] shadow-2xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#4A2F18] flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-blue-700" />
                      <span>معدلات التحصيل المالي والإيرادات</span>
                    </h3>
                    <p className="text-[11px] text-[#8C6D53]">توزيع الإيراد بين الاشتراكات، مبيعات الكتب، والمتأخرات</p>
                  </div>
                  <span className="text-xs font-black text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg tabular-nums">
                    {collectionPercentage}% كفاءة التحصيل
                  </span>
                </div>

                {/* Financial Progress Breakdown */}
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-[#4A2F18]">الاشتراكات الشهرية المحصلة</span>
                      <span className="text-emerald-800 tabular-nums">{totalCollected.toLocaleString()} ج / {totalDue.toLocaleString()} ج</span>
                    </div>
                    <div className="w-full bg-[#F6EEE4] h-2.5 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${collectionPercentage}%` }} 
                        className="bg-emerald-600 h-full rounded-full transition-all duration-700" 
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-[#4A2F18]">المتأخرات المعلقة بالذمة</span>
                      <span className="text-red-700 tabular-nums">{totalArrears.toLocaleString()} ج</span>
                    </div>
                    <div className="w-full bg-[#F6EEE4] h-2.5 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${Math.min(100, Math.round((totalArrears / (totalDue || 1)) * 100))}%` }} 
                        className="bg-red-500 h-full rounded-full transition-all duration-700" 
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-[#4A2F18]">إيراد مبيعات متجر الكتب والمصاحف</span>
                      <span className="text-[#B9895B] tabular-nums">{totalSalesRevenue.toLocaleString()} ج.م</span>
                    </div>
                    <div className="w-full bg-[#F6EEE4] h-2.5 rounded-full overflow-hidden">
                      <div 
                        style={{ width: '65%' }} 
                        className="bg-[#B9895B] h-full rounded-full transition-all duration-700" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Summary Cards */}
              <div className="pt-4 border-t border-[#E8DCCF] grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl relative group">
                  <span className="text-[11px] text-emerald-900 block font-bold">إجمالي التدفق النقدي للفترة</span>
                  <span className="text-base font-black text-emerald-950 tabular-nums mt-0.5 block">
                    {(totalCollected + totalSalesRevenue).toLocaleString()} ج.م
                  </span>
                  <span className="text-[10px] text-emerald-700/90 block mt-0.5 font-medium">
                    (مجموع الاشتراكات المحصلة + مبيعات متجر الكتب)
                  </span>
                </div>

                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl relative group">
                  <span className="text-[11px] text-amber-900 block font-bold">إعفاءات أيتام وخصم إخوة</span>
                  <span className="text-base font-black text-amber-950 tabular-nums mt-0.5 block">
                    {totalDiscountsGiven.toLocaleString()} ج.م
                  </span>
                  <span className="text-[10px] text-amber-700/90 block mt-0.5 font-medium">
                    (إجمالي الدعم المالي والخصومات الممنوحة)
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Charts Grid: Cross-Branch Student Distribution & Quranic Stage Demographics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 3: Branch Student Distribution & Capacity Utilization */}
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#4A2F18] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#8C6D53]" />
                    <span>توزيع الطلاب ونسب إشغال السعة عبر الفروع</span>
                  </h3>
                  <p className="text-[11px] text-[#8C6D53]">مقارنة عدد المقيدين مقابل الطاقة الاستيعابية المرخصة لكل فرع</p>
                </div>
                <span className="text-xs font-bold text-[#8C6D53]">
                  {branches.length} فروع مفعلة
                </span>
              </div>

              {/* Branch Bar Chart with Interactive Hover & Click */}
              <div className="h-52 w-full flex items-end gap-3 pt-6 pb-2 px-3 border border-[#F6EEE4] rounded-xl bg-[#FDFBF9]">
                {branchesStats.map(stat => {
                  const maxRef = 20;
                  const heightPct = Math.min(100, Math.max(15, Math.round((stat.studentsCount / maxRef) * 100)));
                  const isSelected = selectedBranchId === stat.branch.id;

                  return (
                    <div 
                      key={stat.branch.id} 
                      onClick={() => setSelectedBranchId(stat.branch.id)}
                      onMouseEnter={() => setHoveredBranchId(stat.branch.id)}
                      onMouseLeave={() => setHoveredBranchId(null)}
                      className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
                    >
                      <span className="text-[10px] font-bold text-[#4A2F18] opacity-0 group-hover:opacity-100 transition tabular-nums bg-white px-1 rounded shadow-xs border border-gray-200">
                        {stat.studentsCount} طالب ({stat.occupancy}%)
                      </span>
                      <div className="w-full bg-[#E8DCCF]/50 rounded-t-lg h-full flex items-end overflow-hidden">
                        <div 
                          style={{ height: `${heightPct}%` }} 
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            isSelected 
                              ? 'bg-[#B9895B]' 
                              : stat.occupancy >= 80 
                                ? 'bg-amber-700 group-hover:bg-amber-600' 
                                : 'bg-[#4A2F18] group-hover:bg-[#6D4C3D]'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-[#4A2F18] truncate w-full text-center" title={stat.branch.name}>
                        {stat.branch.name.replace('الفرع الرئيسي — ', '').replace('فرع ', '')}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#8C6D53] pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4A2F18]" />
                  <span>انقر على أي عمود للفلترة الفورية لبيانات ذلك الفرع</span>
                </span>
                <span className="font-bold text-[#4A2F18]">
                  إجمالي سعة الفروع: {branches.reduce((acc, b) => acc + (b.capacity || 100), 0)} مقعد
                </span>
              </div>
            </div>

            {/* Chart 4: Educational Stage & Quranic Department Breakdown */}
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#4A2F18] flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#B9895B]" />
                      <span>التوزيع القرآني والمراحل التعليمية</span>
                    </h3>
                    <p className="text-[11px] text-[#8C6D53]">أقسام التحفيظ واللقاء التربوي والمراحل الدراسية</p>
                  </div>
                  <span className="text-xs font-bold text-[#8C6D53] tabular-nums">
                    {branchStudents.length} طالب
                  </span>
                </div>

                {/* Department Distribution Blocks */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 bg-[#F6EEE4] rounded-xl border border-[#E8DCCF]">
                    <span className="text-xs font-bold text-[#4A2F18] block">قسم التحفيظ القرآني</span>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-[#4A2F18] tabular-nums">{tahfeezCount}</span>
                      <span className="text-[10px] text-[#8C6D53]">حلقات قرآنية</span>
                    </div>
                    <div className="w-full bg-white h-1.5 rounded-full mt-2 overflow-hidden">
                      <div 
                        style={{ width: `${Math.round((tahfeezCount / (branchStudents.length || 1)) * 100)}%` }} 
                        className="bg-[#4A2F18] h-full rounded-full" 
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-[#F6EEE4] rounded-xl border border-[#E8DCCF]">
                    <span className="text-xs font-bold text-[#4A2F18] block">لقاء الجمعة التربوي</span>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-[#4A2F18] tabular-nums">{tarbawiCount}</span>
                      <span className="text-[10px] text-[#8C6D53]">مجموعات تربوية</span>
                    </div>
                    <div className="w-full bg-white h-1.5 rounded-full mt-2 overflow-hidden">
                      <div 
                        style={{ width: `${Math.round((tarbawiCount / (branchStudents.length || 1)) * 100)}%` }} 
                        className="bg-[#B9895B] h-full rounded-full" 
                      />
                    </div>
                  </div>
                </div>

                {/* Educational Stages Horizontal Bars */}
                <div className="mt-4 space-y-2 pt-3 border-t border-[#E8DCCF]">
                  <span className="text-[11px] font-bold text-[#4A2F18] block">التوزيع بحسب المرحلة الدراسية:</span>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-[#4A2F18] mb-0.5">
                      <span>المرحلة الابتدائية (50 ج)</span>
                      <span className="tabular-nums">{primaryStudents} طالب ({Math.round((primaryStudents / (branchStudents.length || 1)) * 100)}%)</span>
                    </div>
                    <div className="w-full bg-[#F6EEE4] h-2 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${Math.round((primaryStudents / (branchStudents.length || 1)) * 100)}%` }} 
                        className="bg-emerald-600 h-full rounded-full" 
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-[#4A2F18] mb-0.5">
                      <span>المرحلة الإعدادية (65 ج)</span>
                      <span className="tabular-nums">{prepStudents} طالب ({Math.round((prepStudents / (branchStudents.length || 1)) * 100)}%)</span>
                    </div>
                    <div className="w-full bg-[#F6EEE4] h-2 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${Math.round((prepStudents / (branchStudents.length || 1)) * 100)}%` }} 
                        className="bg-blue-600 h-full rounded-full" 
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-[#4A2F18] mb-0.5">
                      <span>المرحلة الثانوية فما فوق (80 ج)</span>
                      <span className="tabular-nums">{secondaryStudents} طالب ({Math.round((secondaryStudents / (branchStudents.length || 1)) * 100)}%)</span>
                    </div>
                    <div className="w-full bg-[#F6EEE4] h-2 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${Math.round((secondaryStudents / (branchStudents.length || 1)) * 100)}%` }} 
                        className="bg-purple-600 h-full rounded-full" 
                      />
                    </div>
                  </div>
                </div>

              </div>

              <div className="pt-3 border-t border-[#E8DCCF] flex items-center justify-between text-[11px] text-[#8C6D53]">
                <span>رسوم المراحل معتمدة وفق لائحة المدرسة</span>
                <button
                  onClick={() => onNavigate('students')}
                  className="font-bold text-[#B9895B] hover:underline"
                >
                  عرض سجل الطلاب
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: DETAILED KPIS & METRIC CARDS                                      */}
      {/* ========================================================================= */}
      {viewMode === 'kpis' && (
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-6">
            <h3 className="text-sm font-bold text-[#4A2F18] border-b border-[#E8DCCF] pb-3">
              المؤشرات التشغيلية والتربوية المفصلة — {selectedBranchId === 'all' ? 'كافة الفروع' : activeBranchObj?.name}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              <div className="p-4 bg-[#F6EEE4] rounded-xl border border-[#E8DCCF] space-y-2">
                <span className="font-bold text-xs text-[#4A2F18] block">المؤشر الأكاديمي والقرآني:</span>
                <div className="space-y-1.5 text-[#8C6D53]">
                  <div className="flex justify-between">
                    <span>عدد الحلقات المفعلة:</span>
                    <strong className="text-[#4A2F18] tabular-nums">{branchGroups.length} حلقة</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>المعلمون والمحفظون:</span>
                    <strong className="text-[#4A2F18] tabular-nums">{branchTeachers.length} معلماً</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>متوسط طلاب الحلقة:</span>
                    <strong className="text-[#4A2F18] tabular-nums">{Math.round(branchStudents.length / (branchGroups.length || 1))} طلاب</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <span className="font-bold text-xs text-emerald-950 block">مؤشر الانضباط والحضور:</span>
                <div className="space-y-1.5 text-emerald-900">
                  <div className="flex justify-between">
                    <span>نسبة الحضور الملتزم:</span>
                    <strong className="tabular-nums">{presentRate}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>نسبة الأعذار المقبولة:</span>
                    <strong className="tabular-nums">{excusedRate}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>الطلاب الممنوعون اليوم:</span>
                    <strong className="text-red-700 tabular-nums">{bannedStudents.length} طالباً</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                <span className="font-bold text-xs text-blue-950 block">مؤشر الكفاءة المالية:</span>
                <div className="space-y-1.5 text-blue-900">
                  <div className="flex justify-between">
                    <span>المحصل الفعلي للفترة:</span>
                    <strong className="tabular-nums">{totalCollected.toLocaleString()} ج.م</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>المتأخرات غير المسددة:</span>
                    <strong className="text-red-600 tabular-nums">{totalArrears.toLocaleString()} ج.م</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>مبيعات كتب ومستلزمات:</span>
                    <strong className="tabular-nums">{totalSalesRevenue.toLocaleString()} ج.م</strong>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: CROSS-BRANCH BENCHMARK COMPARISON TABLE                           */}
      {/* ========================================================================= */}
      {viewMode === 'comparison' && (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] overflow-hidden shadow-2xs space-y-3 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#4A2F18]">جدول المقارنة المعيارية الشاملة بين فروع المدرسة القرآنية</h3>
              <p className="text-[11px] text-[#8C6D53]">مؤشرات الأداء الأكاديمي، الحضور، الإيرادات، المتأخرات، ونسب إشغال السعة</p>
            </div>
            <button
              onClick={() => onNavigate('branches')}
              className="text-xs font-bold text-[#B9895B] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>فتح إدارة الفروع والمقارنة</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-[#F6EEE4] text-[#4A2F18] font-bold border-b border-[#E8DCCF]">
                  <th className="py-2.5 px-3">الفرع</th>
                  <th className="py-2.5 px-3">المدينة والمسؤول</th>
                  <th className="py-2.5 px-3 text-center">الطلاب</th>
                  <th className="py-2.5 px-3 text-center">المعلمون</th>
                  <th className="py-2.5 px-3 text-center">الحلقات</th>
                  <th className="py-2.5 px-3">نسبة الحضور</th>
                  <th className="py-2.5 px-3">المحصل المالي</th>
                  <th className="py-2.5 px-3">المتأخرات</th>
                  <th className="py-2.5 px-3">الممنوعون</th>
                  <th className="py-2.5 px-3 text-center">إشغال السعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCF]">
                {branchesStats.map(stat => (
                  <tr 
                    key={stat.branch.id} 
                    className={`hover:bg-[#FDFBF9] transition cursor-pointer ${
                      selectedBranchId === stat.branch.id ? 'bg-[#F6EEE4]/40 font-semibold' : ''
                    }`}
                    onClick={() => setSelectedBranchId(stat.branch.id)}
                  >
                    <td className="py-3 px-3 font-bold text-[#4A2F18]">
                      {stat.branch.name}
                    </td>
                    <td className="py-3 px-3 text-[#8C6D53]">
                      <span>{stat.branch.city || 'الشرقية'}</span>
                      <span className="block text-[10px]">({stat.branch.managerName || '—'})</span>
                    </td>
                    <td className="py-3 px-3 text-center tabular-nums font-bold text-[#4A2F18]">
                      {stat.studentsCount}
                    </td>
                    <td className="py-3 px-3 text-center tabular-nums text-[#8C6D53]">
                      {stat.teachersCount}
                    </td>
                    <td className="py-3 px-3 text-center tabular-nums text-[#8C6D53]">
                      {stat.groupsCount}
                    </td>
                    <td className="py-3 px-3 tabular-nums font-bold text-emerald-800">
                      {stat.attendanceRate}%
                    </td>
                    <td className="py-3 px-3 tabular-nums font-bold text-blue-800">
                      {stat.collected.toLocaleString()} ج ({stat.collectionRate}%)
                    </td>
                    <td className="py-3 px-3 tabular-nums font-black text-red-600">
                      {stat.arrears > 0 ? `${stat.arrears.toLocaleString()} ج` : '0 ج'}
                    </td>
                    <td className="py-3 px-3">
                      {stat.bannedCount > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                          {stat.bannedCount} طالب
                        </span>
                      ) : (
                        <span className="text-emerald-700 text-[10px]">لا يوجد</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center gap-1.5 justify-center">
                        <span className="tabular-nums font-bold">{stat.occupancy}%</span>
                        <div className="w-12 bg-[#F6EEE4] h-1.5 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${stat.occupancy}%` }} 
                            className="bg-[#4A2F18] h-full rounded-full" 
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

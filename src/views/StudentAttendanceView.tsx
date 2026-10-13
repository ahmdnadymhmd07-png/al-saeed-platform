import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AttendanceStatus } from '../types';
import { 
  Check, 
  X, 
  HelpCircle, 
  Calendar, 
  Users, 
  ShieldAlert, 
  Save, 
  AlertTriangle, 
  CheckCheck,
  MessageSquare,
  Sparkles,
  Printer
} from 'lucide-react';

interface StudentAttendanceViewProps {
  onNavigateToWhatsApp?: () => void;
}

export const StudentAttendanceView: React.FC<StudentAttendanceViewProps> = ({ onNavigateToWhatsApp }) => {
  const { 
    groups, 
    departments, 
    students, 
    teachers, 
    studentAttendance, 
    saveStudentAttendanceBatch, 
    getStudentAbsenceCountThisMonth,
    checkStudentBan,
    selectedBranchId,
    branches,
    settings
  } = useApp();

  const [showRollPrintModal, setShowRollPrintModal] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('tahfeez');
  const [selectedGroupId, setSelectedGroupId] = useState<string>(() => {
    return groups.find(g => g.departmentId === 'tahfeez')?.id || groups[0]?.id || '';
  });
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  
  // Local attendance state for current sheet: Record<studentId, { status: AttendanceStatus, excuseReason?: string }>
  const [attendanceSheet, setAttendanceSheet] = useState<Record<string, { 
    status: AttendanceStatus; 
    excuseReason?: string;
  }>>({});
  const [activeExcuseStudentId, setActiveExcuseStudentId] = useState<string | null>(null);
  const [tempExcuseReason, setTempExcuseReason] = useState<string>('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Filter groups by department and branch
  const availableGroups = useMemo(() => {
    return groups.filter(g => {
      if (g.departmentId !== selectedDeptId) return false;
      if (selectedBranchId !== 'all' && g.branchId !== selectedBranchId) return false;
      return true;
    });
  }, [groups, selectedDeptId, selectedBranchId]);

  // Keep group selection synced
  const activeGroup = groups.find(g => g.id === selectedGroupId) || availableGroups[0];
  const activeTeacher = teachers.find(t => t.id === activeGroup?.teacherId);

  // Group Students: enrolled in this group
  const groupStudents = useMemo(() => {
    if (!activeGroup) return [];
    return students.filter(s => {
      if (s.status === 'suspended') return false; // Temporarily suspended do not appear on attendance sheets (FR-15)
      if (s.status === 'left') return false;
      if (activeGroup.departmentId === 'tahfeez') return s.tahfeezGroupId === activeGroup.id;
      if (activeGroup.departmentId === 'tarbawi') return s.tarbawiGroupId === activeGroup.id;
      return false;
    });
  }, [students, activeGroup]);

  // Load existing attendance for this date & group, or initialize default
  React.useEffect(() => {
    if (!activeGroup) return;
    const initialMap: Record<string, { 
      status: AttendanceStatus; 
      excuseReason?: string; 
    }> = {};
    
    groupStudents.forEach(s => {
      const existing = studentAttendance.find(a => 
        a.studentId === s.id && 
        a.departmentId === activeGroup.departmentId && 
        a.date === selectedDate
      );
      if (existing) {
        initialMap[s.id] = { 
          status: existing.status, 
          excuseReason: existing.excuseReason
        };
      } else {
        // default: present
        initialMap[s.id] = { 
          status: 'present'
        };
      }
    });
    setAttendanceSheet(initialMap);
    setSaveSuccessNotice(null);
  }, [selectedGroupId, selectedDate, activeGroup, groupStudents, studentAttendance]);

  // Check if date matches group scheduled days
  const isScheduledDay = useMemo(() => {
    if (!activeGroup) return true;
    const dateObj = new Date(selectedDate);
    const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const currentDayName = dayNames[dateObj.getDay()];
    return activeGroup.days.includes(currentDayName);
  }, [activeGroup, selectedDate]);

  // Set single student status
  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    if (status === 'excused') {
      setActiveExcuseStudentId(studentId);
      setTempExcuseReason(attendanceSheet[studentId]?.excuseReason || 'عذر قهري مرضي مع إفادة ولي الأمر');
    } else {
      setAttendanceSheet(prev => ({
        ...prev,
        [studentId]: { 
          ...(prev[studentId] || { status: 'present' }), 
          status, 
          excuseReason: undefined 
        }
      }));
    }
  };

  // Confirm Excuse
  const handleConfirmExcuse = () => {
    if (!activeExcuseStudentId) return;
    setAttendanceSheet(prev => ({
      ...prev,
      [activeExcuseStudentId]: { 
        ...(prev[activeExcuseStudentId] || { status: 'excused' }), 
        status: 'excused', 
        excuseReason: tempExcuseReason.trim() || 'عذر قهري' 
      }
    }));
    setActiveExcuseStudentId(null);
  };

  // Mark All Present
  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; excuseReason?: string }> = {};
    groupStudents.forEach(s => {
      updated[s.id] = { 
        status: 'present'
      };
    });
    setAttendanceSheet(updated);
  };

  // Save Attendance
  const handleSaveAttendance = () => {
    if (!activeGroup) return;

    const records = groupStudents.map(s => {
      const entry = attendanceSheet[s.id] || { status: 'present' };
      return {
        studentId: s.id,
        departmentId: activeGroup.departmentId,
        groupId: activeGroup.id,
        date: selectedDate,
        status: entry.status,
        excuseReason: entry.excuseReason
      };
    });

    saveStudentAttendanceBatch(records);

    setSaveSuccessNotice('تم حفظ تحضير الحلقة بنجاح! احتسبت النقاط وحُدث عداد الغياب.');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter & Group Selector */}
      <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8DCCF] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#4A2F18]">دفتر تحضير الطلاب</h2>
            <p className="text-xs text-[#8C6D53]">
              رصد الحضور والغياب اليومي للطلاب، والربط المباشر بلائحة الانضباط
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowRollPrintModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#F6EEE4] hover:bg-[#EADDCF] text-[#4A2F18] rounded-xl text-xs font-bold transition cursor-pointer"
              title="طباعة كشف حضور الحلقة الورقي للتعليق بالقاعة"
            >
              <Printer className="w-4 h-4 text-[#8C6D53]" />
              <span>طباعة كشف الحلقة الورقي</span>
            </button>
            <button
              onClick={handleMarkAllPresent}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F6EEE4] hover:bg-[#EADDCF] text-[#4A2F18] rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-[#B9895B]" />
              <span>الكل حاضر</span>
            </button>
            <button
              onClick={handleSaveAttendance}
              className="flex items-center gap-2 px-5 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#D8C3AE]" />
              <span>حفظ التحضير</span>
            </button>
          </div>
        </div>

        {/* Filter Selectors Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Department Choice */}
          <div>
            <label className="block text-xs font-bold text-[#4A2F18] mb-1">القسم</label>
            <select
              value={selectedDeptId}
              onChange={(e) => {
                setSelectedDeptId(e.target.value);
                const firstGrp = groups.find(g => g.departmentId === e.target.value);
                if (firstGrp) setSelectedGroupId(firstGrp.id);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] text-[#4A2F18] font-bold"
            >
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Group Choice */}
          <div>
            <label className="block text-xs font-bold text-[#4A2F18] mb-1">الحلقة / المجموعة</label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] text-[#4A2F18] font-bold"
            >
              {availableGroups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Date Choice */}
          <div>
            <label className="block text-xs font-bold text-[#4A2F18] mb-1">تاريخ الحصة</label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] text-[#4A2F18] font-bold"
              />
            </div>
          </div>

        </div>

        {/* Group Info Strip & Schedule Notice */}
        {activeGroup && (
          <div className="pt-3 border-t border-[#E8DCCF] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-[#4A2F18]">
              <span>المعلم المشرف: <strong className="text-[#8C6D53]">{activeTeacher?.fullName || 'غير محدد'}</strong></span>
              <span>أيام الانعقاد: <strong className="text-[#8C6D53]">{activeGroup.days.join('، ')}</strong></span>
              <span>الموعد: <strong className="text-[#8C6D53]">{activeGroup.startTime} – {activeGroup.endTime}</strong></span>
              <span>عدد المقيدين: <strong className="text-[#8C6D53] tabular-nums">{groupStudents.length} طالب</strong></span>
            </div>

            {!isScheduledDay && (
              <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-[11px] font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>اليوم المختار ليس من المواعيد الرسمية للمجموعة (مسموح بتحضير استثنائي).</span>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Save Feedback strip */}
      {saveSuccessNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-bold">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessNotice}</span>
          </div>
          {onNavigateToWhatsApp && (
            <button
              onClick={onNavigateToWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold transition shadow-xs cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>إرسال رسائل غياب واتساب</span>
            </button>
          )}
        </div>
      )}

      {/* Student Attendance List */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] overflow-hidden shadow-2xs">
        <div className="p-4 bg-[#F6EEE4] border-b border-[#E8DCCF] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#4A2F18]">قائمة الطلاب للتحضير الفوري</h3>
          <span className="text-[11px] text-[#8C6D53]">
            الحاضر يكتسب +1 نقطة • الغياب يحسب في العداد الشهري
          </span>
        </div>

        <div className="divide-y divide-[#E8DCCF]">
          {groupStudents.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8C6D53]">
              لا يوجد طلاب مسجلون في هذه الحلقة حالياً.
            </div>
          ) : (
            groupStudents.map((student, idx) => {
              const currentStatus = attendanceSheet[student.id]?.status || 'present';
              const excuseReason = attendanceSheet[student.id]?.excuseReason;
              const absenceCount = getStudentAbsenceCountThisMonth(student.id);
              const banInfo = checkStudentBan(student.id);

              return (
                <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FDFBF9] transition">
                  
                  {/* Student Details & Absence Counter */}
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#F6EEE4] text-[#4A2F18] font-bold text-[11px] flex items-center justify-center shrink-0 tabular-nums">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#4A2F18]">{student.fullName}</span>
                        {banInfo.isBanned && (
                          <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold" title={banInfo.details}>
                            <ShieldAlert className="w-3 h-3 text-red-600" />
                            ممنوع من الدخول ({banInfo.reasons[0]?.split('—')[0]})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#8C6D53] mt-0.5">
                        <span>{student.grade}</span>
                        <span>•</span>
                        <span className={`font-bold tabular-nums ${
                          absenceCount >= 6 ? 'text-red-700' :
                          absenceCount >= 4 ? 'text-amber-700' : 'text-[#4A2F18]'
                        }`}>
                          عداد الغياب الشهري: {absenceCount} من 16
                        </span>
                        {excuseReason && (
                          <>
                            <span>•</span>
                            <span className="text-amber-800 italic">العذر: {excuseReason}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3-State Interactive Action Buttons (حاضر / غائب / غائب بعذر) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                      
                      {/* Present */}
                      <button
                        type="button"
                        onClick={() => handleSetStatus(student.id, 'present')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          currentStatus === 'present'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>حاضر</span>
                      </button>

                      {/* Absent */}
                      <button
                        type="button"
                        onClick={() => handleSetStatus(student.id, 'absent')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          currentStatus === 'absent'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>غائب</span>
                      </button>

                      {/* Excused (mandatory excuse reason) */}
                      <button
                        type="button"
                        onClick={() => handleSetStatus(student.id, 'excused')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          currentStatus === 'excused'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>غائب بعذر</span>
                      </button>

                    </div>

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Mandatory Excuse Dialog Modal */}
      {activeExcuseStudentId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] w-full max-w-md rounded-2xl border border-[#E8DCCF] shadow-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#4A2F18]">
              تسجيل عذر غياب قهري (شرط الالتحاق 3)
            </h3>
            <p className="text-xs text-[#8C6D53]">
              وفق شروط الالتحاق: "لا غياب إلا لعذر قهري مع بيان العذر". يرجى توثيق سبب الغذر المعتمد:
            </p>
            <textarea
              rows={3}
              value={tempExcuseReason}
              onChange={(e) => setTempExcuseReason(e.target.value)}
              placeholder="اكتب بيان العذر القهري (مرضي، سفر، ظرف عائلي طارئ...)"
              className="w-full p-2.5 text-xs rounded-xl border border-[#E8DCCF] focus:border-[#4A2F18] focus:outline-hidden bg-[#FBF8F5]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveExcuseStudentId(null)}
                className="px-3 py-1.5 text-xs font-bold text-[#6D4C3D] hover:bg-[#F6EEE4] rounded-lg cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmExcuse}
                className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg cursor-pointer"
              >
                تأكيد العذر
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Printable Halaqah Paper Roll Sheet Modal */}
      {showRollPrintModal && activeGroup && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] w-full max-w-4xl rounded-2xl border border-[#E8DCCF] shadow-2xl overflow-hidden my-4">
            
            {/* Modal Controls (Hidden during print) */}
            <div className="no-print bg-[#4A2F18] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#D8C3AE]" />
                <h3 className="text-xs font-bold">معاينة كشف حضور الحلقة الورقي للطباعة ({activeGroup.name})</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-[#B9895B] hover:bg-[#A37549] text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة الكشف الآن (A4)</span>
                </button>
                <button 
                  onClick={() => setShowRollPrintModal(false)} 
                  className="text-white hover:text-red-200 text-lg font-bold px-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Sheet (Crisp black & white A4 printable layout) */}
            <div className="p-6 sm:p-8 text-black space-y-4">
              
              {/* Official Header */}
              <div className="border-b-2 border-black pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-sm font-extrabold text-black">{settings.associationName}</h1>
                    <h2 className="text-base font-black text-black mt-0.5">{settings.schoolName} — {branches.find(b => b.id === activeGroup.branchId)?.name || 'الفرع الرئيسي'}</h2>
                    <h3 className="text-xs font-bold text-gray-700 mt-0.5">
                      {departments.find(d => d.id === activeGroup.departmentId)?.name} • دفتر التحضير الورقي للحلقة
                    </h3>
                  </div>
                  {settings.reportShowLogo !== false && (
                    <img 
                      src={settings.logoUrl || '/school_logo.jpg'} 
                      alt="شعار" 
                      className="w-14 h-14 rounded-full object-cover border-2 border-black" 
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.src = '/school_logo.jpg'; }}
                    />
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-gray-300 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-bold text-gray-800">
                  <div><span>الحلقة: </span><strong className="text-black">{activeGroup.name}</strong></div>
                  <div><span>المحفظ: </span><strong className="text-black">{activeTeacher?.fullName || 'الشيخ المحفظ'}</strong></div>
                  <div><span>المواعيد: </span><strong className="text-black">{activeGroup.days?.join('، ')} ({activeGroup.startTime} - {activeGroup.endTime})</strong></div>
                  <div><span>شهر/عام: </span><strong className="text-black">{new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}</strong></div>
                </div>
              </div>

              {/* Student Roster Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-[10px] border border-black">
                  <thead>
                    <tr className="bg-gray-100 font-bold border-b border-black text-center">
                      <th className="py-2 px-1 border-l border-black w-8">م</th>
                      <th className="py-2 px-2 border-l border-black w-44 text-right">اسم الطالب رباعياً</th>
                      <th className="py-2 px-1 border-l border-black w-16">الصف</th>
                      <th className="py-2 px-1 border-l border-black w-14">كود الطالب</th>
                      {Array.from({ length: 12 }).map((_, i) => (
                        <th key={i} className="py-1 px-0.5 border-l border-black text-center w-6 tabular-nums">
                          {i + 1}
                        </th>
                      ))}
                      <th className="py-2 px-1 border-l border-black w-14">حضور</th>
                      <th className="py-2 px-1 border-l border-black w-14">غياب</th>
                      <th className="py-2 px-2 w-28">ملاحظات المحفظ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {groupStudents.length === 0 ? (
                      <tr>
                        <td colSpan={19} className="py-4 text-center text-gray-500 font-bold">
                          لا يوجد طلاب مقيدين في هذه الحلقة حالياً
                        </td>
                      </tr>
                    ) : (
                      groupStudents.map((s, idx) => (
                        <tr key={s.id} className="h-7.5">
                          <td className="py-1 px-1 border-l border-black text-center font-bold tabular-nums">{idx + 1}</td>
                          <td className="py-1 px-2 border-l border-black font-bold text-black text-xs">{s.fullName}</td>
                          <td className="py-1 px-1 border-l border-black text-center">{s.grade}</td>
                          <td className="py-1 px-1 border-l border-black text-center font-mono text-[9px]">{s.id.toUpperCase()}</td>
                          {Array.from({ length: 12 }).map((_, i) => (
                            <td key={i} className="py-1 px-0.5 border-l border-black text-center"></td>
                          ))}
                          <td className="py-1 px-1 border-l border-black text-center text-[9px]">.....</td>
                          <td className="py-1 px-1 border-l border-black text-center text-[9px]">.....</td>
                          <td className="py-1 px-2 text-[9px] text-gray-400">...................</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer and Signatures */}
              <div className="pt-3 border-t border-black space-y-3">
                <div className="flex items-center justify-between text-[10px] text-gray-700">
                  <span>دليل الرموز المعتمدة: [ ✔ حاضر ] [ ✘ غائب ] [ ع غائب بعذر رسمي ]</span>
                  <span>إجمالي طلاب الحلقة: <strong className="text-black">{groupStudents.length} طالب</strong></span>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-3 text-center text-xs font-bold text-black border-t border-dotted border-gray-400">
                  <div>
                    <span>توقيع الشيخ المحفظ</span>
                    <div className="h-8 border-b border-dotted border-black w-36 mx-auto mt-2" />
                  </div>
                  <div>
                    <span>اعتماد المشرف التربوي</span>
                    <div className="h-8 border-b border-dotted border-black w-36 mx-auto mt-2" />
                  </div>
                  <div>
                    <span>اعتماد مدير الفرع</span>
                    <div className="h-8 border-b border-dotted border-black w-36 mx-auto mt-2" />
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

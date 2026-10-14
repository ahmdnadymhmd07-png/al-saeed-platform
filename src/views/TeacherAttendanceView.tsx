import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TeacherAttendanceSource } from '../types';
import { 
  Clock, 
  Check, 
  X, 
  HelpCircle, 
  Calendar, 
  Save, 
  FileText,
  AlertCircle,
  UserPlus,
  Building2
} from 'lucide-react';

export const TeacherAttendanceView: React.FC = () => {
  const { 
    teachers, 
    addTeacher,
    groups, 
    branches,
    teacherAttendance, 
    saveTeacherAttendance, 
    selectedBranchId, 
    currentUser 
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [source, setSource] = useState<TeacherAttendanceSource>('register');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Quick Add Teacher Modal State
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBranchId, setNewBranchId] = useState<string>(selectedBranchId !== 'all' ? selectedBranchId : branches[0]?.id || 'b1');
  const [newDeptIds, setNewDeptIds] = useState<string[]>(['tahfeez']);
  const [newNotes, setNewNotes] = useState('');

  const handleOpenAddTeacher = () => {
    setNewFullName('');
    setNewPhone('');
    setNewBranchId(selectedBranchId !== 'all' ? selectedBranchId : branches[0]?.id || 'b1');
    setNewDeptIds(['tahfeez']);
    setNewNotes('');
    setIsAddTeacherOpen(true);
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim()) return;

    addTeacher({
      fullName: newFullName.trim(),
      phone: newPhone.trim(),
      branchId: newBranchId || branches[0]?.id || 'b1',
      departmentIds: newDeptIds.length > 0 ? newDeptIds : ['tahfeez'],
      active: true,
      notes: newNotes.trim()
    });

    setIsAddTeacherOpen(false);
    setSaveNotice(`تمت إضافة المعلم الشيخ (${newFullName.trim()}) بنجاح إلى سجل الحضور.`);
  };

  // Filter teachers by branch
  const branchTeachers = useMemo(() => {
    return teachers.filter(t => {
      if (selectedBranchId !== 'all' && t.branchId !== selectedBranchId) return false;
      return t.active;
    });
  }, [teachers, selectedBranchId]);

  // Form entries map: Record<teacherId, { status: 'present'|'absent'|'excused', checkIn: string, checkOut: string, excuseReason: string }>
  const [entries, setEntries] = useState<Record<string, { status: 'present'|'absent'|'excused'; checkIn: string; checkOut: string; excuseReason: string }>>({});

  // Sync entries when date or branch changes
  React.useEffect(() => {
    const map: Record<string, { status: 'present'|'absent'|'excused'; checkIn: string; checkOut: string; excuseReason: string }> = {};
    branchTeachers.forEach(t => {
      const existing = teacherAttendance.find(ta => ta.teacherId === t.id && ta.date === selectedDate);
      if (existing) {
        map[t.id] = {
          status: existing.status,
          checkIn: existing.checkIn || '15:30',
          checkOut: existing.checkOut || '18:00',
          excuseReason: existing.excuseReason || ''
        };
      } else {
        map[t.id] = {
          status: 'present',
          checkIn: '15:30',
          checkOut: '18:00',
          excuseReason: ''
        };
      }
    });
    setEntries(map);
    setSaveNotice(null);
  }, [selectedDate, branchTeachers, teacherAttendance]);

  // Update single field
  const updateTeacherEntry = (teacherId: string, updates: Partial<{ status: 'present'|'absent'|'excused'; checkIn: string; checkOut: string; excuseReason: string }>) => {
    setEntries(prev => ({
      ...prev,
      [teacherId]: { ...(prev[teacherId] || { status: 'present', checkIn: '15:30', checkOut: '18:00', excuseReason: '' }), ...updates }
    }));
  };

  // Save all teachers attendance for current date
  const handleSaveAll = () => {
    branchTeachers.forEach(t => {
      const entry = entries[t.id] || { status: 'present', checkIn: '15:30', checkOut: '18:00', excuseReason: '' };
      saveTeacherAttendance({
        branchId: t.branchId,
        teacherId: t.id,
        date: selectedDate,
        status: entry.status,
        checkIn: entry.status === 'present' ? entry.checkIn : undefined,
        checkOut: entry.status === 'present' ? entry.checkOut : undefined,
        excuseReason: entry.status === 'excused' ? (entry.excuseReason?.trim() || 'عذر مقبول مسبقاً') : undefined,
        source,
        enteredBy: currentUser.fullName
      });
    });

    setSaveNotice(`تم حفظ دفتر حضور المعلمين ليوم ${selectedDate} بنجاح مع توثيق أسباب الأعذار وساعات العمل.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8DCCF] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#4A2F18]">دفتر حضور وانصراف المعلمين والمحفظين</h2>
            <p className="text-xs text-[#8C6D53]">
              نقل البيانات من الدفتر الورقي لحساب ساعات الحصص ودقائق التأخير ومعدل الالتزام
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddTeacher}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#F6EEE4] hover:bg-[#EADDCF] text-[#4A2F18] border border-[#E8DCCF] rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#8C6D53]" />
              <span>إضافة معلم جديد</span>
            </button>
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-2 px-5 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer border border-[#4A2F18]"
            >
              <Save className="w-4 h-4 text-[#D8C3AE]" />
              <span>حفظ سجل اليوم</span>
            </button>
          </div>
        </div>

        {/* Date & Source selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#4A2F18] mb-1">تاريخ الحضور</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] text-[#4A2F18] font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4A2F18] mb-1">المصدر المعتمد</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as TeacherAttendanceSource)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] text-[#4A2F18] font-bold"
            >
              <option value="register">دفتر الحضور الورقي (تفريغ يدوي)</option>
              <option value="qr">مسح الرمز السريع (QR Code)</option>
              <option value="fingerprint">جهاز البصمة الإلكتروني</option>
            </select>
          </div>
        </div>
      </div>

      {saveNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Teachers Attendance Input Grid */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] overflow-hidden shadow-2xs">
        <div className="p-4 bg-[#F6EEE4] border-b border-[#E8DCCF] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#4A2F18]">كشف معلمي الفرع (مرتب حسب تسلسل الدفتر)</h3>
          <span className="text-[11px] text-[#8C6D53]">
            مدخل البيانات: {currentUser.fullName}
          </span>
        </div>

        <div className="divide-y divide-[#E8DCCF]">
          {branchTeachers.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#8C6D53] space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#F6EEE4] text-[#8C6D53] flex items-center justify-center mx-auto border border-[#E8DCCF]">
                <UserPlus className="w-6 h-6" />
              </div>
              <p className="font-bold text-[#4A2F18] text-sm">لا يوجد معلمون مسجلون في هذا الفرع حالياً</p>
              <p className="text-[11px] max-w-sm mx-auto">
                يمكنك إضافة المعلمين والمحفظين للفرع الآن للبدء في توثيق الحضور والغياب وساعات الحصص.
              </p>
              <button
                type="button"
                onClick={handleOpenAddTeacher}
                className="mt-1 px-4 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-4 h-4 text-[#D8C3AE]" />
                <span>إضافة أول معلم الآن</span>
              </button>
            </div>
          ) : (
            branchTeachers.map((teacher, index) => {
              const entry = entries[teacher.id] || { status: 'present', checkIn: '15:30', checkOut: '18:00' };
              const teacherGroups = groups.filter(g => g.teacherId === teacher.id);

              return (
                <div key={teacher.id} className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#FDFBF9] transition">
                  
                  {/* Teacher Info */}
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#F6EEE4] text-[#4A2F18] font-bold text-[11px] flex items-center justify-center shrink-0 tabular-nums">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-[#4A2F18]">{teacher.fullName}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-[#8C6D53] mt-0.5">
                        <span className="tabular-nums dir-ltr">{teacher.phone}</span>
                        <span>•</span>
                        <span>{teacherGroups.length} مجموعات وحلقات مسندة</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Timing Inputs */}
                  <div className="flex flex-wrap items-center gap-4">
                    
                    {/* Status Toggle */}
                    <div className="flex items-center gap-1 bg-[#F6EEE4] p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => updateTeacherEntry(teacher.id, { status: 'present' })}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                          entry.status === 'present' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-[#6D4C3D]'
                        }`}
                      >
                        حاضر
                      </button>
                      <button
                        type="button"
                        onClick={() => updateTeacherEntry(teacher.id, { status: 'absent' })}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                          entry.status === 'absent' ? 'bg-red-600 text-white shadow-2xs' : 'text-[#6D4C3D]'
                        }`}
                      >
                        غائب
                      </button>
                      <button
                        type="button"
                        onClick={() => updateTeacherEntry(teacher.id, { status: 'excused' })}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                          entry.status === 'excused' ? 'bg-amber-600 text-white shadow-2xs' : 'text-[#6D4C3D]'
                        }`}
                      >
                        عذر
                      </button>
                    </div>

                    {/* Time fields (only if present) */}
                    {entry.status === 'present' && (
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#8C6D53] font-medium">الحضور:</span>
                          <input
                            type="time"
                            value={entry.checkIn}
                            onChange={(e) => updateTeacherEntry(teacher.id, { checkIn: e.target.value })}
                            className="px-2 py-1 rounded-md border border-[#E8DCCF] bg-[#FBF8F5] text-xs font-bold text-[#4A2F18]"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#8C6D53] font-medium">الانصراف:</span>
                          <input
                            type="time"
                            value={entry.checkOut}
                            onChange={(e) => updateTeacherEntry(teacher.id, { checkOut: e.target.value })}
                            className="px-2 py-1 rounded-md border border-[#E8DCCF] bg-[#FBF8F5] text-xs font-bold text-[#4A2F18]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Excuse Reason Input (when status is excused) */}
                    {entry.status === 'excused' && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-amber-50 p-2 rounded-xl border border-amber-200">
                        <span className="text-[11px] font-bold text-amber-900 whitespace-nowrap">سبب العذر:</span>
                        <input
                          type="text"
                          placeholder="بيان سبب العذر (إلزامي للتوثيق)..."
                          value={entry.excuseReason || ''}
                          onChange={(e) => updateTeacherEntry(teacher.id, { excuseReason: e.target.value })}
                          className="px-2.5 py-1 text-xs rounded-lg border border-amber-300 bg-white text-[#4A2F18] min-w-[180px] focus:outline-hidden font-medium"
                        />
                        <div className="flex items-center gap-1">
                          {['وعكة صحية', 'ظرف عائلي', 'مأمورية رسمية', 'عذر مسبق'].map(reason => (
                            <button
                              key={reason}
                              type="button"
                              onClick={() => updateTeacherEntry(teacher.id, { excuseReason: reason })}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold transition cursor-pointer"
                            >
                              {reason}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: Quick Add Teacher */}
      {isAddTeacherOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E8DCCF] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
            <div className="bg-[#4A2F18] p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-sm font-bold">إضافة معلم / محفظ جديد</h3>
              </div>
              <button onClick={() => setIsAddTeacherOpen(false)} className="text-white hover:text-red-200 font-bold px-2 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateTeacher} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">اسم الشيخ / المعلم كاملاً *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الشيخ مصطفى عبد الرحيم"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-semibold text-xs focus:outline-none focus:border-[#4A2F18]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">رقم الهاتف / الواتساب</label>
                  <input
                    type="text"
                    placeholder="مثال: 01012345678"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-mono text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">الفرع المخصص *</label>
                  <select
                    value={newBranchId}
                    onChange={(e) => setNewBranchId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-bold text-xs focus:outline-none"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Departments */}
              <div className="space-y-1.5 p-3 bg-[#FBF8F5] rounded-xl border border-[#E8DCCF]">
                <label className="block text-xs font-bold text-[#4A2F18]">الأقسام التي يُدرّس بها:</label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#4A2F18]">
                    <input
                      type="checkbox"
                      checked={newDeptIds.includes('tahfeez')}
                      onChange={(e) => {
                        if (e.target.checked) setNewDeptIds(prev => [...prev, 'tahfeez']);
                        else setNewDeptIds(prev => prev.filter(d => d !== 'tahfeez'));
                      }}
                      className="w-4 h-4 text-[#4A2F18] rounded cursor-pointer"
                    />
                    <span>قسم تحفيظ القرآن الكريم</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#4A2F18]">
                    <input
                      type="checkbox"
                      checked={newDeptIds.includes('tarbawi')}
                      onChange={(e) => {
                        if (e.target.checked) setNewDeptIds(prev => [...prev, 'tarbawi']);
                        else setNewDeptIds(prev => prev.filter(d => d !== 'tarbawi'));
                      }}
                      className="w-4 h-4 text-[#4A2F18] rounded cursor-pointer"
                    />
                    <span>قسم النشاط التربوي</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">ملاحظات ومؤهلات الشيخ</label>
                <textarea
                  rows={2}
                  placeholder="إجازات قرآنية، مؤهل أزهري، ملاحظات..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E8DCCF] flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddTeacherOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                >
                  حفظ المعلم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

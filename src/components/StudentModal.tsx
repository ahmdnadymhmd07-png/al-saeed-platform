import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { 
  User, 
  Calendar, 
  DollarSign, 
  Award, 
  AlertTriangle, 
  FileText, 
  ShieldAlert, 
  Printer, 
  Plus, 
  PhoneCall, 
  Eye 
} from 'lucide-react';

interface StudentModalProps {
  student: Student | null;
  onClose: () => void;
  onPrintAdmissionSlip: (student: Student) => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({ student, onClose, onPrintAdmissionSlip }) => {
  const { 
    groups, 
    teachers, 
    studentAttendance, 
    dues, 
    payments, 
    pointsLedger, 
    rewardGrants, 
    disciplineCases, 
    studentNotes, 
    addStudentNote, 
    checkStudentBan, 
    getStudentAbsenceCountThisMonth, 
    getStudentPoints,
    currentUser 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'info' | 'attendance' | 'finance' | 'points' | 'discipline' | 'notes'>('info');
  const [noteType, setNoteType] = useState<'appearance' | 'behavior' | 'guardian_contact'>('behavior');
  const [noteText, setNoteText] = useState('');

  if (!student) return null;

  const banInfo = checkStudentBan(student.id);
  const absenceCount = getStudentAbsenceCountThisMonth(student.id);
  const points = getStudentPoints(student.id);

  const tahfeezGrp = groups.find(g => g.id === student.tahfeezGroupId);
  const tarbawiGrp = groups.find(g => g.id === student.tarbawiGroupId);

  const studentAttHistory = studentAttendance.filter(a => a.studentId === student.id).slice(0, 15);
  const studentDuesHistory = dues.filter(d => d.studentId === student.id);
  const studentPaymentsHistory = payments.filter(p => p.studentId === student.id);
  const studentDisciplineHistory = disciplineCases.filter(c => c.studentId === student.id);
  const studentNotesList = studentNotes.filter(n => n.studentId === student.id);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    addStudentNote(student.id, noteType, noteText.trim());
    setNoteText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] w-full max-w-3xl rounded-2xl border border-[#E8DCCF] shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-[#4A2F18] p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#B9895B]/30 border border-[#D8C3AE] flex items-center justify-center font-bold text-lg text-white">
              {student.fullName.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black">{student.fullName}</h3>
                {banInfo.isBanned && (
                  <span className="flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <ShieldAlert className="w-3 h-3" />
                    <span>ممنوع من الدخول</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#D8C3AE] mt-0.5">
                {student.grade} • تاريخ الالتحاق: {student.joinDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintAdmissionSlip(student)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#B9895B] hover:bg-[#A37549] text-white rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الاستمارة والشروط</span>
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 text-lg font-bold px-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Ban banner if banned */}
        {banInfo.isBanned && (
          <div className="bg-red-50 p-3.5 border-b border-red-200 flex items-center gap-3 text-red-900 text-xs">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <span className="font-bold">أسباب المنع من دخول الحلقات والمدرسة:</span>
              <p className="text-[11px] text-red-700 mt-0.5">{banInfo.details}</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-[#F6EEE4] p-1.5 border-b border-[#E8DCCF] overflow-x-auto text-xs">
          {[
            { id: 'info', label: 'البيانات والمجموعات', icon: User },
            { id: 'attendance', label: `الحضور والغياب (${absenceCount}/16)`, icon: Calendar },
            { id: 'finance', label: 'الاشتراكات والمدفوعات', icon: DollarSign },
            { id: 'points', label: `النقاط والجوائز (${points} ن)`, icon: Award },
            { id: 'discipline', label: 'شؤون الانضباط', icon: AlertTriangle },
            { id: 'notes', label: 'المظهر والسلوك والتواصل', icon: FileText },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                  isActive ? 'bg-[#4A2F18] text-white' : 'text-[#6D4C3D] hover:bg-[#EADDCF]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D8C3AE]' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-6 max-h-[60vh] overflow-y-auto text-xs space-y-4">
          
          {/* 1. Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-[#FBF8F5] p-4 rounded-xl border border-[#E8DCCF]">
                <div>
                  <span className="text-[#8C6D53] block text-[11px]">رقم هاتف ولي الأمر (واتساب):</span>
                  <span className="font-bold text-[#4A2F18] tabular-nums dir-ltr block text-right mt-0.5">
                    {student.guardianPhone}
                  </span>
                </div>
                <div>
                  <span className="text-[#8C6D53] block text-[11px]">حالة الطالب الاجتماعية:</span>
                  <span className="font-bold text-[#4A2F18] block mt-0.5">
                    {student.isOrphan ? 'يتيم الأب' : 'غير يتيم'}
                  </span>
                </div>
                <div>
                  <span className="text-[#8C6D53] block text-[11px]">حالة ونظام السداد:</span>
                  <span className="font-bold text-[#4A2F18] block mt-0.5">
                    {student.feeMode === 'exempt' ? 'معفى بالكامل (100%)' :
                     student.feeMode === 'discount' ? `خصم بمبلغ ${student.feeDiscountAmount} ج` :
                     'سداد عادي كامل'}
                  </span>
                </div>
                <div>
                  <span className="text-[#8C6D53] block text-[11px]">ربط الأسرة (خصم الإخوة):</span>
                  <span className="font-bold text-[#4A2F18] block mt-0.5">
                    {student.familyId ? 'مسجل ضمن أسرة (مستفيد من خصم الإخوة)' : 'طالب منفرد'}
                  </span>
                </div>
              </div>

              {/* Two Core Groups */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#F6EEE4] rounded-xl border border-[#E8DCCF]">
                  <span className="font-bold text-xs text-[#4A2F18] block">قسم التحفيظ القرآني</span>
                  <div className="mt-2 text-[11px] text-[#6D4C3D] space-y-1">
                    <p>الحلقة: <strong>{tahfeezGrp?.name || 'غير محدد'}</strong></p>
                    <p>المعلم: <strong>{teachers.find(t => t.id === tahfeezGrp?.teacherId)?.fullName || '—'}</strong></p>
                    <p>المواعيد: <strong>{tahfeezGrp?.days.join('، ')} ({tahfeezGrp?.startTime} - {tahfeezGrp?.endTime})</strong></p>
                  </div>
                </div>

                <div className="p-4 bg-[#F6EEE4] rounded-xl border border-[#E8DCCF]">
                  <span className="font-bold text-xs text-[#4A2F18] block">قسم لقاء الجمعة (التربوي)</span>
                  <div className="mt-2 text-[11px] text-[#6D4C3D] space-y-1">
                    <p>المجموعة: <strong>{tarbawiGrp?.name || 'غير محدد'}</strong></p>
                    <p>المشرف التربوي: <strong>{teachers.find(t => t.id === tarbawiGrp?.teacherId)?.fullName || '—'}</strong></p>
                    <p>المواعيد: <strong>{tarbawiGrp?.days.join('، ')} ({tarbawiGrp?.startTime} - {tarbawiGrp?.endTime})</strong></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Attendance History */}
          {activeTab === 'attendance' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#4A2F18]">
                <span>سجل الحصص الأخيرة للقسمين</span>
                <span className="tabular-nums">عداد الغياب الشهري: {absenceCount} من 16</span>
              </div>
              <div className="divide-y divide-[#E8DCCF] border border-[#E8DCCF] rounded-xl overflow-hidden">
                {studentAttHistory.map(att => (
                  <div key={att.id} className="p-3 flex items-center justify-between hover:bg-[#FDFBF9]">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        att.status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                        att.status === 'absent' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {att.status === 'present' ? 'حاضر' :
                         att.status === 'absent' ? 'غائب' : 'غائب بعذر'}
                      </span>
                      <div>
                        <span className="font-bold text-[#4A2F18]">
                          {att.departmentId === 'tahfeez' ? 'قسم التحفيظ' : 'لقاء الجمعة التربوي'}
                        </span>
                        {att.excuseReason && (
                          <span className="text-[10px] text-amber-800 block">العذر: {att.excuseReason}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-[#8C6D53] tabular-nums">{att.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Finance History */}
          {activeTab === 'finance' && (
            <div className="space-y-4">
              <h4 className="font-bold text-xs text-[#4A2F18]">الاستحقاقات الشهرية والغرامات</h4>
              <div className="space-y-2">
                {studentDuesHistory.map(d => (
                  <div key={d.id} className="p-3 bg-[#F6EEE4] rounded-xl border border-[#E8DCCF] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#4A2F18]">
                        {d.kind === 'fine' ? 'غرامة انضباط' : `اشتراك شهر ${d.month}`}
                      </span>
                      <div className="text-[10px] text-[#8C6D53] mt-0.5 flex gap-2">
                        <span>الأصل: {d.grossAmount} ج</span>
                        {d.orphanDiscount > 0 && <span>خصم أيتام: -{d.orphanDiscount} ج</span>}
                        {d.siblingDiscount > 0 && <span>خصم إخوة: -{d.siblingDiscount} ج</span>}
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="font-black text-[#4A2F18] block tabular-nums">{d.amount} ج.م</span>
                      <span className={`text-[10px] font-bold ${
                        d.status === 'paid' ? 'text-emerald-700' : 'text-red-700'
                      }`}>
                        {d.status === 'paid' ? 'مسدد بالكامل' : `متبقي ${d.amount - d.paidAmount} ج`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Points & Rewards */}
          {activeTab === 'points' && (
            <div className="space-y-3">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-900">رصيد النقاط التحفيزية الفعلي</span>
                  <p className="text-[11px] text-amber-800">مكتسبة من الحضور والتفوق</p>
                </div>
                <span className="text-2xl font-black text-amber-900 tabular-nums">{points} نقطة</span>
              </div>

              <h4 className="font-bold text-xs text-[#4A2F18] mt-3">سجل الجوائز المستلمة</h4>
              <div className="space-y-2">
                {rewardGrants.filter(g => g.studentId === student.id).map(g => (
                  <div key={g.id} className="p-3 bg-[#F6EEE4] rounded-xl border border-[#E8DCCF] flex items-center justify-between">
                    <span className="font-bold text-[#4A2F18]">{g.rewardTitle}</span>
                    <span className="text-[11px] text-[#8C6D53] tabular-nums">سلمت بتاريخ: {g.deliveredAt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Discipline History */}
          {activeTab === 'discipline' && (
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-[#4A2F18]">سجل قرارات الاستدعاء والإنذارات</h4>
              <div className="space-y-2">
                {studentDisciplineHistory.length === 0 ? (
                  <p className="text-[#8C6D53] text-center py-4">لا توجد سجلات انضباط على الطالب.</p>
                ) : (
                  studentDisciplineHistory.map(c => (
                    <div key={c.id} className="p-3 bg-red-50/70 border border-red-200 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-900">مستوى {c.level} ({c.absenceCount} غيابات)</span>
                        <span className="text-[10px] text-red-700 tabular-nums">{c.month}</span>
                      </div>
                      <p className="text-[11px] text-red-800">{c.note}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 6. Notes & Conduct (شروط الالتحاق: الزي الإسلامي والمظهر والسلوك وتواصل ولي الأمر) */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <form onSubmit={handleAddNote} className="p-3.5 bg-[#F6EEE4] rounded-xl border border-[#E8DCCF] space-y-3">
                <span className="font-bold text-xs text-[#4A2F18] block">تدوين ملاحظة تربوية أو تواصل ولي أمر</span>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value as any)}
                    className="col-span-1 px-2.5 py-1.5 text-xs rounded-lg border border-[#E8DCCF] bg-white font-medium text-[#4A2F18]"
                  >
                    <option value="appearance">الزي الإسلامي والمظهر</option>
                    <option value="behavior">السلوك والانضباط</option>
                    <option value="guardian_contact">تواصل مع ولي الأمر</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="اكتب الملاحظة التربوية..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="col-span-2 px-3 py-1.5 text-xs rounded-lg border border-[#E8DCCF] bg-white"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    إضافة إلى ملف الطالب
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                {studentNotesList.map(n => (
                  <div key={n.id} className="p-3 bg-[#FBF8F5] rounded-xl border border-[#E8DCCF]">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#4A2F18]">
                        {n.type === 'appearance' ? 'الزي الإسلامي والمظهر' :
                         n.type === 'behavior' ? 'السلوك والانضباط' : 'تواصل مع ولي الأمر'}
                      </span>
                      <span className="text-[#8C6D53] tabular-nums">{n.date} • {n.userName}</span>
                    </div>
                    <p className="text-xs text-[#6D4C3D] mt-1">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

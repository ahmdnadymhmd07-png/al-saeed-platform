import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DisciplineCase } from '../types';
import { 
  ShieldAlert, 
  UserCheck, 
  AlertTriangle, 
  Calendar, 
  FileCheck, 
  CheckCircle2, 
  DollarSign, 
  Sparkles,
  UserX,
  Sliders,
  Settings
} from 'lucide-react';

interface DisciplineViewProps {
  onOpenWhatsApp?: (studentId: string, caseLevel: number) => void;
}

export const DisciplineView: React.FC<DisciplineViewProps> = ({ onOpenWhatsApp }) => {
  const { 
    disciplineCases = [], 
    students = [], 
    dues = [], 
    recordGuardianAttendance, 
    adminExceptionalUnban, 
    currentUser, 
    selectedBranchId,
    checkStudentBan,
    settings,
    updateSettings
  } = useApp();

  const [activeCaseForGuardian, setActiveCaseForGuardian] = useState<DisciplineCase | null>(null);
  const [guardianName, setGuardianName] = useState('');
  const [guardianNotes, setGuardianNotes] = useState('');

  const [activeCaseForAdminUnban, setActiveCaseForAdminUnban] = useState<DisciplineCase | null>(null);
  const [adminUnbanReason, setAdminUnbanReason] = useState('');

  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Edit discipline thresholds modal state
  const [isEditThresholdsOpen, setIsEditThresholdsOpen] = useState(false);
  const [lvl1Limit, setLvl1Limit] = useState(settings?.absenceThresholds?.level1 || 3);
  const [lvl2Limit, setLvl2Limit] = useState(settings?.absenceThresholds?.level2 || 5);
  const [lvl2Fine, setLvl2Fine] = useState(settings?.absenceFineAmount || 50);
  const [lvl3Limit, setLvl3Limit] = useState(settings?.absenceThresholds?.level3 || 8);
  const [suspMonths, setSuspMonths] = useState(settings?.suspensionMonths || 1);

  // Filter cases
  const filteredCases = disciplineCases.filter(c => {
    if (selectedBranchId !== 'all' && c.branchId !== selectedBranchId) return false;
    return true;
  });

  // Handle Guardian Attendance Record (lifts Level 1 ban)
  const handleRecordGuardian = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCaseForGuardian || !guardianName.trim()) return;

    recordGuardianAttendance(activeCaseForGuardian.id, guardianName.trim(), guardianNotes.trim());
    setActiveCaseForGuardian(null);
    setGuardianName('');
    setGuardianNotes('');
    setFeedbackNotice('تم توثيق حضور ولي الأمر بنجاح، ورفع المنع عن الطالب ومتابعة الالتزام.');
  };

  // Handle Admin Exceptional Unban
  const handleAdminOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCaseForAdminUnban || !adminUnbanReason.trim()) return;

    adminExceptionalUnban(activeCaseForAdminUnban.id, adminUnbanReason.trim());
    setActiveCaseForAdminUnban(null);
    setAdminUnbanReason('');
    setFeedbackNotice('تم رفع المنع استثنائياً بقرار من إدارة المدرسة وتوثيق ذلك في سجل العمليات الرقابي.');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#4A2F18]">شؤون الانضباط ومتابعة الغياب التراكمي</h2>
            <p className="text-xs text-[#8C6D53]">
              متابعة حدود الغياب ({settings?.absenceThresholds?.level1} حصص: استدعاء • {settings?.absenceThresholds?.level2} حصص: غرامة {settings?.absenceFineAmount} ج • {settings?.absenceThresholds?.level3} حصص: فصل مؤقت {settings?.suspensionMonths} شهر)
            </p>
          </div>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => {
                setLvl1Limit(settings?.absenceThresholds?.level1 || 3);
                setLvl2Limit(settings?.absenceThresholds?.level2 || 5);
                setLvl2Fine(settings?.absenceFineAmount || 50);
                setLvl3Limit(settings?.absenceThresholds?.level3 || 8);
                setSuspMonths(settings?.suspensionMonths || 1);
                setIsEditThresholdsOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F6EEE4] hover:bg-[#EADDCF] text-[#4A2F18] rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              <Sliders className="w-4 h-4 text-[#8C6D53]" />
              <span>تعديل مستويات ولائحة الانضباط</span>
            </button>
          )}
        </div>

        {/* 3 Discipline Threshold Explanation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          
          <div className="p-3 bg-orange-50/80 border border-orange-200 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-orange-900">المستوى الأول ({settings?.absenceThresholds?.level1} حصص غياب)</span>
              <span className="text-[10px] bg-orange-200 text-orange-900 px-1.5 py-0.5 rounded font-bold">إنذار أول</span>
            </div>
            <p className="text-[11px] text-orange-800 mt-1 leading-relaxed">
              فتح استدعاء لولي الأمر، إرسال واتساب، وتعليق دخول الحلقات حتى تسجيل حضور ولي الأمر وتعهده.
            </p>
          </div>

          <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-red-900">المستوى الثاني ({settings?.absenceThresholds?.level2} حصص غياب)</span>
              <span className="text-[10px] bg-red-200 text-red-900 px-1.5 py-0.5 rounded font-bold">غرامة + منع</span>
            </div>
            <p className="text-[11px] text-red-800 mt-1 leading-relaxed">
              إضافة غرامة {settings?.absenceFineAmount} ج على الحساب المالي، ولا يرفع المنع إلا بحضور ولي الأمر وسداد الغرامة.
            </p>
          </div>

          <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-purple-900">المستوى الثالث ({settings?.absenceThresholds?.level3} حصص غياب)</span>
              <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded font-bold">فصل مؤقت</span>
            </div>
            <p className="text-[11px] text-purple-800 mt-1 leading-relaxed">
              فصل مؤقت لمدة {settings?.suspensionMonths} شهر؛ يختفي من كشوف التحضير، وتتوقف الاستحقاقات، ويُحسب تاريخ العودة.
            </p>
          </div>

        </div>
      </div>

      {feedbackNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Discipline Cases Table */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] overflow-hidden shadow-2xs">
        <div className="p-4 bg-[#F6EEE4] border-b border-[#E8DCCF] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#4A2F18]">سجل حالات الانضباط والمنع المفتوحة</h3>
          <span className="text-[11px] text-[#8C6D53]">
            {filteredCases.filter(c => c.status === 'open').length} حالات بانتظار الحضور والسداد
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E8DCCF] text-[#8C6D53] font-bold">
                <th className="py-3 px-4">الطالب</th>
                <th className="py-3 px-3">الشهر</th>
                <th className="py-3 px-3">المستوى والغياب</th>
                <th className="py-3 px-3">الغرامة المستحقة</th>
                <th className="py-3 px-3">حالة الإجراء</th>
                <th className="py-3 px-3">التفاصيل والملاحظات</th>
                <th className="py-3 px-4 text-center">إجراءات رفع المنع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCCF]">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#8C6D53]">
                    سجل الانضباط نظيف، لا توجد حالات استدعاء أو منع مفتوحة حالياً.
                  </td>
                </tr>
              ) : (
                filteredCases.map(c => {
                  const student = students.find(s => s.id === c.studentId);
                  const fineDue = dues.find(d => d.id === c.fineDueId);
                  const isFinePaid = fineDue?.status === 'paid';
                  const banInfo = checkStudentBan ? checkStudentBan(c.studentId) : { isBanned: false };

                  return (
                    <tr key={c.id} className="hover:bg-[#FDFBF9] transition">
                      
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#4A2F18] block">{student?.fullName || 'طالب'}</span>
                        <span className="text-[10px] text-[#8C6D53] tabular-nums dir-ltr block text-right">
                          {student?.guardianPhone}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-semibold text-[#4A2F18] tabular-nums">
                        {c.month}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          c.level === 3 ? 'bg-purple-100 text-purple-900' :
                          c.level === 2 ? 'bg-red-100 text-red-900' :
                          'bg-orange-100 text-orange-900'
                        }`}>
                          مستوى {c.level} ({c.absenceCount} غياب)
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {c.level >= 2 ? (
                          <div className="flex items-center gap-1 font-bold">
                            <span className="tabular-nums">{settings?.absenceFineAmount || 50} ج</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                              isFinePaid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {isFinePaid ? 'مسددة' : 'مستحقة'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#8C6D53] text-[11px]">بدون غرامة</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          c.status === 'open' ? 'bg-red-50 text-red-700 border border-red-200' :
                          c.status === 'suspended' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          'bg-emerald-50 text-emerald-700'
                        }`}>
                          {c.status === 'open' ? 'ممنوع من الدخول' :
                           c.status === 'suspended' ? `فصل حتى ${c.suspendedTo}` :
                           c.status === 'guardian_attended' ? 'حضر ولي الأمر' : 'مغلقة'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-[#8C6D53] text-[11px] max-w-xs truncate" title={c.note}>
                        {c.note}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* Record Guardian Attendance Button */}
                          {c.status === 'open' && (
                            <button
                              onClick={() => {
                                setActiveCaseForGuardian(c);
                                setGuardianName('');
                              }}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>توثيق حضور ولي الأمر</span>
                            </button>
                          )}

                          {/* Admin Exceptional Override Button */}
                          {currentUser?.role === 'admin' && c.status === 'open' && (
                            <button
                              onClick={() => {
                                setActiveCaseForAdminUnban(c);
                                setAdminUnbanReason('');
                              }}
                              className="px-2 py-1 bg-[#F6EEE4] hover:bg-[#EADDCF] text-[#4A2F18] rounded-lg text-[11px] font-bold transition cursor-pointer"
                              title="رفع المنع استثنائياً بقرار المدير"
                            >
                              رفع استثنائي
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Guardian Modal */}
      {activeCaseForGuardian && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start sm:items-center justify-center p-4 overflow-y-auto pt-10 sm:pt-4">
          <div className="bg-[#FFFFFF] w-full max-w-md rounded-2xl border border-[#E8DCCF] shadow-xl overflow-hidden my-auto">
            <div className="bg-[#4A2F18] p-4 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">تسجيل حضور ولي الأمر لرفع الاستدعاء</h3>
              <button onClick={() => setActiveCaseForGuardian(null)} className="text-white hover:text-red-200 font-bold px-2 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordGuardian} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">
                  اسم الحاضر من أولياء الأمور <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد محمد الشافعي (الوالد)"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8DCCF] bg-[#FBF8F5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">
                  تعهد ولي الأمر وملاحظات المقابلة
                </label>
                <textarea
                  rows={3}
                  value={guardianNotes}
                  onChange={(e) => setGuardianNotes(e.target.value)}
                  placeholder="تمت مناقشة أسباب الغياب وتعهد بالمتابعة والالتزام بمواعيد الحلقات..."
                  className="w-full p-2.5 text-xs rounded-xl border border-[#E8DCCF] bg-[#FBF8F5]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E8DCCF]">
                <button
                  type="button"
                  onClick={() => setActiveCaseForGuardian(null)}
                  className="px-4 py-2 text-xs font-bold text-[#6D4C3D] hover:bg-[#F6EEE4] rounded-lg cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>اعتماد الحضور ورفع المنع</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Override Modal */}
      {activeCaseForAdminUnban && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start sm:items-center justify-center p-4 overflow-y-auto pt-10 sm:pt-4">
          <div className="bg-[#FFFFFF] w-full max-w-md rounded-2xl border border-[#E8DCCF] shadow-xl overflow-hidden my-auto">
            <div className="bg-red-800 p-4 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">رفع المنع استثنائياً بقرار المدير (سجل رقابي)</h3>
              <button onClick={() => setActiveCaseForAdminUnban(null)} className="text-white hover:text-red-200 font-bold px-2 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAdminOverride} className="p-5 space-y-4 text-xs">
              <p className="text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200 font-medium leading-relaxed">
                تنبيه: المدير وحده يملك صلاحية رفع المنع استثنائياً مع كتابة السبب، وسيتم تدوين هذا الإجراء في سجل العمليات الرقابي (Audit Log).
              </p>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">
                  السبب الإداري المعتمد للاستثناء <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={adminUnbanReason}
                  onChange={(e) => setAdminUnbanReason(e.target.value)}
                  placeholder="اكتب سبب الاستثناء وظروف الطالب الخاصة..."
                  className="w-full p-2.5 text-xs rounded-xl border border-[#E8DCCF] bg-[#FBF8F5]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E8DCCF]">
                <button
                  type="button"
                  onClick={() => setActiveCaseForAdminUnban(null)}
                  className="px-4 py-2 text-xs font-bold text-[#6D4C3D] hover:bg-[#F6EEE4] rounded-lg cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg cursor-pointer"
                >
                  تأكيد الرفع وتوثيق القرار
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT DISCIPLINE THRESHOLDS & FINES (تم تعديل الهيكل لمنع القطع) */}
      {isEditThresholdsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start sm:items-center justify-center p-4 overflow-y-auto pt-8 pb-8">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E8DCCF] shadow-xl p-5 space-y-4 text-xs max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-3 sticky top-0 bg-white z-10 pt-1">
              <div className="flex items-center gap-2 text-[#4A2F18]">
                <Sliders className="w-5 h-5 text-[#B9895B]" />
                <h3 className="font-bold text-sm">تعديل مستويات ولائحة الانضباط المدرسي</h3>
              </div>
              <button onClick={() => setIsEditThresholdsOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer font-bold px-1">✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              updateSettings({
                absenceThresholds: {
                  level1: Number(lvl1Limit),
                  level2: Number(lvl2Limit),
                  level3: Number(lvl3Limit),
                },
                absenceFineAmount: Number(lvl2Fine),
                suspensionMonths: Number(suspMonths)
              });
              setIsEditThresholdsOpen(false);
              setFeedbackNotice('تم تحديث مستويات ولائحة الانضباط وغرامات الغياب بنجاح!');
              setTimeout(() => setFeedbackNotice(null), 4000);
            }} className="space-y-4">
              
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 leading-relaxed text-[11px]">
                يمكن لإدارة المدرسة تعديل عدد حصص الغياب الشهرية التي تحفز كل إجراء انضباطي ومبالغ الغرامات، وتسري فوراً على حسابات الحضور والمنع.
              </div>

              {/* Level 1 Settings */}
              <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-200 space-y-2">
                <span className="font-bold text-orange-950 block">المستوى الأول: استدعاء ولي الأمر والمنع المؤقت</span>
                <div>
                  <label className="block text-[#4A2F18] mb-1 font-medium">عدد حصص الغياب شهرياً لتحفيز الاستدعاء:</label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    required
                    value={lvl1Limit}
                    onChange={(e) => setLvl1Limit(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-orange-300 bg-white font-bold tabular-nums"
                  />
                </div>
              </div>

              {/* Level 2 Settings */}
              <div className="p-3 bg-red-50/60 rounded-xl border border-red-200 space-y-2">
                <span className="font-bold text-red-950 block">المستوى الثاني: غرامة الانضباط والاستدعاء الثاني</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#4A2F18] mb-1 font-medium">حد الغياب (حصص):</label>
                    <input
                      type="number"
                      min={lvl1Limit + 1}
                      max="16"
                      required
                      value={lvl2Limit}
                      onChange={(e) => setLvl2Limit(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-red-300 bg-white font-bold tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[#4A2F18] mb-1 font-medium">قيمة الغرامة (ج.م):</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={lvl2Fine}
                      onChange={(e) => setLvl2Fine(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-red-300 bg-white font-bold tabular-nums"
                    />
                  </div>
                </div>
              </div>

              {/* Level 3 Settings */}
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 space-y-2">
                <span className="font-bold text-purple-950 block">المستوى الثالث: الفصل المؤقت وتعليق القيد</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#4A2F18] mb-1 font-medium">حد الغياب (حصص):</label>
                    <input
                      type="number"
                      min={lvl2Limit + 1}
                      max="16"
                      required
                      value={lvl3Limit}
                      onChange={(e) => setLvl3Limit(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-purple-300 bg-white font-bold tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[#4A2F18] mb-1 font-medium">مدة الفصل (شهور):</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      required
                      value={suspMonths}
                      onChange={(e) => setSuspMonths(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-purple-300 bg-white font-bold tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E8DCCF] sticky bottom-0 bg-white pb-1">
                <button
                  type="button"
                  onClick={() => setIsEditThresholdsOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#6D4C3D] hover:bg-[#F6EEE4] rounded-lg cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#4A2F18] hover:bg-[#382312] rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#D8C3AE]" />
                  <span>اعتماد اللائحة الجديدة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

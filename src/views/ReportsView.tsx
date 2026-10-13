import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Printer, 
  Download, 
  ShieldAlert, 
  Users, 
  UserCheck, 
  DollarSign, 
  BookOpen, 
  Award, 
  AlertTriangle,
  Building2,
  Settings,
  CheckCircle2,
  FileCheck,
  CheckSquare,
  Calendar,
  Contact,
  PenTool,
  QrCode,
  Sparkles,
  ClipboardList
} from 'lucide-react';

interface ReportsViewProps {
  onOpenGateReport: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onOpenGateReport }) => {
  const { 
    students, 
    teachers, 
    groups, 
    studentAttendance, 
    teacherAttendance, 
    dues, 
    sales, 
    disciplineCases, 
    rewards, 
    rewardGrants, 
    settings, 
    updateSettings,
    branches, 
    selectedBranchId, 
    checkStudentBan,
    getStudentAbsenceCountThisMonth 
  } = useApp();

  // Active Report / Document Type
  const [activeReportType, setActiveReportType] = useState<string>('guardian_summons');
  const [selectedStudentForDoc, setSelectedStudentForDoc] = useState<string>(students[0]?.id || '');
  const [selectedGroupForRoll, setSelectedGroupForRoll] = useState<string>(groups[0]?.id || '');

  // Full direct editing capability state for any report
  const [isEditable, setIsEditable] = useState<boolean>(true);

  // Dedicated summons letter customization state
  const [summonsTitle, setSummonsTitle] = useState<string>('خطاب استدعاء ولي أمر رسمي (شؤون الانضباط)');
  const [summonsSubtitle, setSummonsSubtitle] = useState<string>('يُسلّم باليد للطالب لتبليغ ولي الأمر بالحضور لمقر إدارة المدرسة');
  const [summonsReasonKind, setSummonsReasonKind] = useState<string>('تكرار الغياب');
  const [summonsDeadline, setSummonsDeadline] = useState<string>('خلال 48 ساعة');
  const [summonsOfficer, setSummonsOfficer] = useState<string>('المشرف العام');
  const [summonsBody, setSummonsBody] = useState<string>(
    'نحيط سيادتكم علماً بأنه نظراً لتغيب نجلكم وتجاوزه الحد المقرر في لائحة الانضباط لمدرسة السعيد القرآنية، نرجو من سيادتكم التكرم بالحضور لمقر إدارة المدرسة لمقابلة المشرف العام في موعد غايته (خلال 48 ساعة) من تاريخ هذا الخطاب.'
  );
  const [summonsWarning, setSummonsWarning] = useState<string>(
    'تنبيه هام: عدم الحضور يترتب عليه تعليق دخول الطالب للحلقات القرآنية وفق اللائحة المعتمدة بالمدرسة.'
  );
  const [summonsTearoffText, setSummonsTearoffText] = useState<string>(
    'أقر أنا ولي أمر الطالب المذكور أعلاه باستلامي خطاب الاستدعاء الرسمي الصادر من مدرسة السعيد القرآنية، وسأحضر للإدارة بمشيئة الله تعالى في الموعد المحدد.'
  );
  
  // Report template customization state
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [tmplAssociation, setTmplAssociation] = useState(settings.associationName);
  const [tmplSchool, setTmplSchool] = useState(settings.schoolName);
  const [tmplSubtitle, setTmplSubtitle] = useState(settings.reportSubtitle || '');
  const [tmplShowLogo, setTmplShowLogo] = useState(settings.reportShowLogo !== false);
  const [tmplSupervisor, setTmplSupervisor] = useState(settings.reportSupervisorTitle || 'مشرفة الغياب وشؤون الطلاب');
  const [tmplFinance, setTmplFinance] = useState(settings.reportFinanceTitle || 'مشرف التحصيل والشؤون المالية');
  const [tmplDirector, setTmplDirector] = useState(settings.reportDirectorTitle || 'مدير عام المدرسة واعتماد الجمعية');
  const [tmplFooterNotes, setTmplFooterNotes] = useState(settings.reportFooterNotes || 'وثيقة رسمية صادرة من نظام مدرسة السعيد القرآنية — لا يعتد بأي تعديل يدوي غير مختوم.');
  const [templateSavedNotice, setTemplateSavedNotice] = useState<string | null>(null);

  const handleReasonKindChange = (kind: string) => {
    setSummonsReasonKind(kind);
    if (kind === 'تكرار الغياب') {
      setSummonsBody(`نحيط سيادتكم علماً بأنه نظراً لتغيب نجلكم وتجاوزه الحد المقرر في لائحة الانضباط لمدرسة السعيد القرآنية، نرجو من سيادتكم التكرم بالحضور لمقر إدارة المدرسة لمقابلة ${summonsOfficer} في موعد غايته (${summonsDeadline}) من تاريخ هذا الخطاب.`);
      setSummonsWarning('تنبيه هام: عدم الحضور يترتب عليه تعليق دخول الطالب للحلقات القرآنية وفق اللائحة المعتمدة بالمدرسة.');
    } else if (kind === 'تراجع الحفظ') {
      setSummonsBody(`نحيط سيادتكم علماً بوجود تراجع ملحوظ في مستوى حفظ ومراجعة نجلكم خلال الفترة الأخيرة، وحرصاً على تقدمه القرآني، نرجو من سيادتكم التكرم بالحضور لمقابلة ${summonsOfficer} في موعد غايته (${summonsDeadline}) للتشاور ووضع خطة تحسين مشتركة.`);
      setSummonsWarning('ملاحظة: التعاون بين البيت والمدرسة ركيزة أساسية لتثبيت حفظ كتاب الله تعالى.');
    } else if (kind === 'مخالفة سلوكية') {
      setSummonsBody(`نحيط سيادتكم علماً بصدور ملاحظة سلوكية تستوجب حضوركم العاجل لمقر المدرسة لمقابلة ${summonsOfficer} في موعد غايته (${summonsDeadline}) لمناقشة الأمر مع الإدارة التربوية.`);
      setSummonsWarning('تنبيه هام: الانضباط الأخلاقي شرط أساسي للاستمرار في حلقات القرآن الكريم.');
    } else if (kind === 'متأخرات مالية') {
      setSummonsBody(`نحيط سيادتكم علماً بوجود متأخرات في الرسوم الشهرية المقررة، ويرجى التكرم بمراجعة مكتب الحسابات والشؤون المالية بالمدرسة في موعد غايته (${summonsDeadline}) لتسوية الموقف.`);
      setSummonsWarning('تنبيه: لتجنب تعليق استلام الكتب أو تعليق الدخول يرجى المبادرة بالتسوية.');
    }
  };

  const handleResetSummons = () => {
    setSummonsTitle('خطاب استدعاء ولي أمر رسمي (شؤون الانضباط)');
    setSummonsSubtitle('يُسلّم باليد للطالب لتبليغ ولي الأمر بالحضور لمقر إدارة المدرسة');
    setSummonsBody('نحيط سيادتكم علماً بأنه نظراً لتغيب نجلكم وتجاوزه الحد المقرر في لائحة الانضباط لمدرسة السعيد القرآنية، نرجو من سيادتكم التكرم بالحضور لمقر إدارة المدرسة لمقابلة المشرف العام في موعد غايته (خلال 48 ساعة) من تاريخ هذا الخطاب.');
    setSummonsWarning('تنبيه هام: عدم الحضور يترتب عليه تعليق دخول الطالب للحلقات القرآنية وفق اللائحة المعتمدة بالمدرسة.');
    setSummonsTearoffText('أقر أنا ولي أمر الطالب المذكور أعلاه باستلامي خطاب الاستدعاء الرسمي الصادر من مدرسة السعيد القرآنية، وسأحضر للإدارة بمشيئة الله تعالى في الموعد المحدد.');
    setSummonsReasonKind('تكرار الغياب');
    setSummonsDeadline('خلال 48 ساعة');
    setSummonsOfficer('المشرف العام');
  };

  // Filter students by branch
  const branchStudents = selectedBranchId === 'all' ? students : students.filter(s => s.branchId === selectedBranchId);
  const currentBranchName = selectedBranchId === 'all' 
    ? 'الإدارة المركزية (كافة الفروع)' 
    : (branches.find(b => b.id === selectedBranchId)?.name || 'الفرع المعتمد');

  // Active student object for single student documents (e.g. Booklet, Monthly Card)
  const targetStudent = students.find(s => s.id === selectedStudentForDoc) || branchStudents[0] || students[0];
  const targetGroup = groups.find(g => g.id === (targetStudent?.tahfeezGroupId || selectedGroupForRoll)) || groups[0];
  const targetTeacher = teachers.find(t => t.id === targetGroup?.teacherId);

  // Group for paper roll sheet
  const activeRollGroup = groups.find(g => g.id === selectedGroupForRoll) || groups[0];
  const activeRollTeacher = teachers.find(t => t.id === activeRollGroup?.teacherId);
  const activeRollStudents = students.filter(s => s.tahfeezGroupId === activeRollGroup?.id || s.tarbawiGroupId === activeRollGroup?.id);

  // Banned students today for the gatekeeper report
  const bannedStudents = branchStudents.filter(s => checkStudentBan(s.id).isBanned);

  // Trigger print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner (hidden in print) */}
      <div className="no-print bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8DCCF] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#4A2F18]">الدفاتر الميدانية والوثائق الحضورية والتقارير الإدارية</h2>
            <p className="text-xs text-[#8C6D53]">
              طباعة خطابات استدعاء أولياء الأمور، كشوف الحلقات الورقية، وكشوفات الممنوعين من الدخول مع إمكانية التعديل التام المباشر على أي نص قبل الطباعة
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditable(!isEditable)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                isEditable 
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-2xs' 
                  : 'bg-[#F6EEE4] hover:bg-[#EADDCF] text-[#4A2F18]'
              }`}
              title="تفعيل إمكانية النقر وتعديل أي نص مباشرة في المستند قبل الطباعة"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{isEditable ? 'التعديل المباشر: مُفعل (انقر لتعديل أي نص)' : 'تفعيل التعديل المباشر'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#D8C3AE]" />
              <span>طباعة المستند الحالي (A4)</span>
            </button>
          </div>
        </div>

        {/* Sub-categories Selector: Offline Field Documents vs Management Reports */}
        <div className="space-y-3">
          
          {/* Category 1: Offline Field Documents */}
          <div>
            <span className="text-[11px] font-extrabold text-[#4A2F18] block mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#B9895B]" />
              <span>وثائق ونماذج العمل الحضوري المباشر مع الطالب وولي الأمر:</span>
            </span>

            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { id: 'guardian_summons', label: 'خطاب استدعاء ولي الأمر (مع كعب استلام)', icon: AlertTriangle },
                { id: 'paper_roll', label: 'كشف حضور الحلقة الورقي (للتعليق)', icon: ClipboardList },
              ].map(type => {
                const Icon = type.icon;
                const isActive = activeReportType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setActiveReportType(type.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition cursor-pointer ${
                      isActive
                        ? 'bg-[#4A2F18] text-white shadow-2xs'
                        : 'bg-[#F6EEE4] text-[#6D4C3D] hover:bg-[#EADDCF]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D8C3AE]' : 'text-[#8C6D53]'}`} />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category 2: Management & Administrative Reports */}
          <div className="pt-2 border-t border-[#E8DCCF]">
            <span className="text-[11px] font-bold text-[#8C6D53] block mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>التقارير والكشوفات الإدارية والمالية:</span>
            </span>

            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { id: 'gatekeeper', label: 'كشف الممنوعين من الدخول (للبوابة والأمن)', icon: ShieldAlert, danger: true },
                { id: 'students', label: 'كشف قيد الطلاب العام المعتمد', icon: Users },
                { id: 'finance', label: 'كشف التحصيل والمتأخرات المالية', icon: DollarSign },
                { id: 'branch_comparison', label: 'تقرير مقارنة أداء الفروع', icon: Building2 },
                { id: 'teachers', label: 'كشف دوام وحضور المعلمين', icon: UserCheck }
              ].map(type => {
                const Icon = type.icon;
                const isActive = activeReportType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setActiveReportType(type.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                      isActive
                        ? 'bg-[#4A2F18] text-white shadow-2xs'
                        : type.danger
                        ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                        : 'bg-gray-100 text-[#4A2F18] hover:bg-gray-200'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D8C3AE]' : ''}`} />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student Picker for Guardian Summons */}
          {activeReportType === 'guardian_summons' && (
            <div className="p-3 bg-[#F6EEE4] rounded-xl border border-[#E8DCCF] flex flex-wrap items-center gap-3 text-xs">
              <span className="font-bold text-[#4A2F18]">تخصيص المستند لطالب محدد:</span>
              <select
                value={selectedStudentForDoc}
                onChange={(e) => setSelectedStudentForDoc(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[#E8DCCF] bg-white font-bold text-[#4A2F18] cursor-pointer"
              >
                {branchStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.grade} — {groups.find(g => g.id === s.tahfeezGroupId)?.name || 'حلقة عامة'})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-[#8C6D53]">
                سيتم توليد الخطاب مطبوعاً باسم الطالب ورقم قيده وبيانات حلقته فوراً
              </span>
            </div>
          )}

          {/* Dedicated Guardian Summons Customization Controls */}
          {activeReportType === 'guardian_summons' && (
            <div className="p-4 bg-[#FBF8F5] rounded-xl border border-[#B9895B]/40 space-y-3">
              <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-2">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-[#B9895B]" />
                  <span className="font-extrabold text-xs text-[#4A2F18]">لوحة التعديل والتحكم الكامل في نص خطاب الاستدعاء</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetSummons}
                  className="text-[11px] text-[#8C6D53] hover:text-[#4A2F18] font-bold underline cursor-pointer"
                >
                  استعادة النص الافتراضي
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A2F18] mb-1">سبب الاستدعاء السريع:</label>
                  <select
                    value={summonsReasonKind}
                    onChange={(e) => handleReasonKindChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8DCCF] bg-white font-bold text-[#4A2F18]"
                  >
                    <option value="تكرار الغياب">تكرار الغياب وتجاوز الحد</option>
                    <option value="تراجع الحفظ">تراجع ملحوظ في الحفظ والمراجعة</option>
                    <option value="مخالفة سلوكية">ملاحظة سلوكية وانضباطية</option>
                    <option value="متأخرات مالية">متأخرات مالية ومصروفات</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4A2F18] mb-1">المهلة المحددة للحضور:</label>
                  <input
                    type="text"
                    value={summonsDeadline}
                    onChange={(e) => {
                      setSummonsDeadline(e.target.value);
                      setSummonsBody(prev => prev.replace(/\(خلال.*?\)/, `(${e.target.value})`));
                    }}
                    placeholder="خلال 48 ساعة"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8DCCF] bg-white font-bold text-[#4A2F18]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4A2F18] mb-1">المطلوب مقابلته:</label>
                  <input
                    type="text"
                    value={summonsOfficer}
                    onChange={(e) => {
                      setSummonsOfficer(e.target.value);
                      setSummonsBody(prev => prev.replace(/لمقابلة .*? في موعد/, `لمقابلة ${e.target.value} في موعد`));
                    }}
                    placeholder="المشرف العام / مدير المدرسة"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8DCCF] bg-white font-bold text-[#4A2F18]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4A2F18] mb-1">نص الخطاب الموجه لولي الأمر (قابل للتعديل الكامل):</label>
                <textarea
                  rows={2}
                  value={summonsBody}
                  onChange={(e) => setSummonsBody(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg border border-[#E8DCCF] bg-white text-[#2C1810] font-medium leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A2F18] mb-1">نص التنبيه الإداري:</label>
                  <input
                    type="text"
                    value={summonsWarning}
                    onChange={(e) => setSummonsWarning(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8DCCF] bg-white text-[#2C1810]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4A2F18] mb-1">نص تعهد ولي الأمر في كعب الاستلام:</label>
                  <input
                    type="text"
                    value={summonsTearoffText}
                    onChange={(e) => setSummonsTearoffText(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8DCCF] bg-white text-[#2C1810]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeReportType === 'paper_roll' && (
            <div className="p-3 bg-[#F6EEE4] rounded-xl border border-[#E8DCCF] flex flex-wrap items-center gap-3 text-xs">
              <span className="font-bold text-[#4A2F18]">اختيار الحلقة لطباعة كشف التحضير الورقي:</span>
              <select
                value={selectedGroupForRoll}
                onChange={(e) => setSelectedGroupForRoll(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[#E8DCCF] bg-white font-bold text-[#4A2F18] cursor-pointer"
              >
                {groups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name} — {teachers.find(t => t.id === g.teacherId)?.fullName || 'المحفظ'} ({branches.find(b => b.id === g.branchId)?.name})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-[#8C6D53]">
                كشف جاهز للتعليق بالقاعة للتحضير بالقلم الرصاص أو الجاف طوال أيام الشهر
              </span>
            </div>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRINTABLE SHEET CONTAINER (A4 FORMATTED)                                  */}
      {/* ========================================================================= */}
      <div 
        contentEditable={isEditable} 
        suppressContentEditableWarning={true}
        className={`bg-[#FFFFFF] p-8 sm:p-10 rounded-2xl border border-[#E8DCCF] shadow-sm print:shadow-none print:border-none print:p-0 text-black transition-all ${
          isEditable ? 'ring-2 ring-amber-400/40' : ''
        }`}
      >
        {isEditable && (
          <div className="no-print mb-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs font-bold text-amber-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <PenTool className="w-4 h-4 text-amber-700" />
              <span>وضع التحرير المباشر نَشط: انقر مباشرة فوق أي عنوان، نص، أو خلية جدول لتعديلها بحرية تامة قبل الطباعة.</span>
            </span>
            <span className="text-[11px] bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-md font-mono">
              تعديلاتك تُطبع مباشرة
            </span>
          </div>
        )}
        
        {/* Document Official Header */}
        <div className="border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-extrabold text-black">{settings.associationName}</h1>
              <h2 className="text-sm font-black text-black mt-0.5">{settings.schoolName}</h2>
              <h3 className="text-xs font-bold text-gray-700 mt-0.5">{currentBranchName}</h3>
            </div>
            
            {settings.reportShowLogo !== false && (
              <img 
                src={settings.logoUrl || '/school_logo.jpg'} 
                alt="شعار المدرسة" 
                className="w-16 h-16 rounded-full object-cover border-2 border-black/40 shadow-xs"
                referrerPolicy="no-referrer"
                onError={(e) => { e.currentTarget.src = '/school_logo.jpg'; }}
              />
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-gray-300 flex items-center justify-between text-[11px] text-gray-700 font-bold">
            <span>التاريخ: <strong className="text-black tabular-nums">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
            <span>العام الدراسي: <strong className="text-black">1447-1448 هـ / 2026-2027 م</strong></span>
            <span>رقم الوثيقة: <strong className="text-black font-mono">DOC-{targetStudent ? targetStudent.id.toUpperCase() : 'PRINT'}-2026</strong></span>
          </div>
        </div>





        {/* ======================================================================= */}
        {/* DOCUMENT 3: CLASSROOM PAPER ATTENDANCE ROLL SHEET (كشف تحضير الحلقة)     */}
        {/* ======================================================================= */}
        {activeReportType === 'paper_roll' && (
          <div className="space-y-4">
            <div className="text-center border-b-2 border-black pb-2">
              <h2 className="text-base font-black text-black">دفتر كشف حضور وغياب الحلقة الورقي (للتعليق بالحلقة)</h2>
              <p className="text-xs text-gray-800 mt-0.5">
                الحلقة: <strong>{activeRollGroup.name}</strong> • المحفظ: <strong>{activeRollTeacher?.fullName || 'الشيخ'}</strong> • الفرع: <strong>{branches.find(b => b.id === activeRollGroup.branchId)?.name}</strong>
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-gray-800">
              <span>مواعيد الحلقة: {activeRollGroup.days.join('، ')} ({activeRollGroup.startTime} – {activeRollGroup.endTime})</span>
              <span>شهر: أكتوبر 2026 م • عدد الطلاب: {activeRollStudents.length}</span>
            </div>

            <table className="w-full text-right border-collapse text-[10px] border border-black">
              <thead>
                <tr className="bg-gray-100 font-bold border-b border-black text-center">
                  <th className="py-2 px-1 border-l border-black w-8">م</th>
                  <th className="py-2 px-2 border-l border-black w-44 text-right">اسم الطالب رباعي</th>
                  <th className="py-2 px-1 border-l border-black w-16">الصف</th>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <th key={i} className="py-1 px-0.5 border-l border-black text-center w-6 tabular-nums">
                      {i + 1}
                    </th>
                  ))}
                  <th className="py-2 px-1 border-l border-black w-16">إجمالي الحضور</th>
                  <th className="py-2 px-1 border-l border-black w-16">إجمالي الغياب</th>
                  <th className="py-2 px-2 w-32">ملاحظات المحفظ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {activeRollStudents.map((s, idx) => (
                  <tr key={s.id} className="h-8">
                    <td className="py-1 px-1 border-l border-black text-center font-bold tabular-nums">{idx + 1}</td>
                    <td className="py-1 px-2 border-l border-black font-bold text-black text-xs">{s.fullName}</td>
                    <td className="py-1 px-1 border-l border-black text-center">{s.grade}</td>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <td key={i} className="py-1 px-0.5 border-l border-black text-center">
                        {/* Empty box for teacher pen checkmark */}
                      </td>
                    ))}
                    <td className="py-1 px-1 border-l border-black text-center text-[10px]">
                      ......
                    </td>
                    <td className="py-1 px-1 border-l border-black text-center text-[10px]">
                      ......
                    </td>
                    <td className="py-1 px-2 text-[9px] text-gray-400">
                      ...................
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between text-[10px] text-gray-700 pt-2 border-t border-black">
              <span>الرموز المعتمدة: [ ✔ حاضر ] [ ✘ غائب ] [ ع غائب بعذر ]</span>
              <span>توقيع الشيخ المحفظ: .......................................</span>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* DOCUMENT: GUARDIAN SUMMONS WITH TEAR-OFF RECEIPT (استدعاء ولي الأمر)     */}
        {/* ======================================================================= */}
        {activeReportType === 'guardian_summons' && targetStudent && (
          <div className="space-y-6">
            <div className="text-center border-b-2 border-black pb-2">
              <h2 
                contentEditable={isEditable} 
                suppressContentEditableWarning={true}
                className={`text-base font-black text-black outline-hidden ${isEditable ? 'hover:bg-amber-50/60 rounded px-1' : ''}`}
              >
                {summonsTitle}
              </h2>
              <p 
                contentEditable={isEditable} 
                suppressContentEditableWarning={true}
                className={`text-xs text-gray-800 mt-0.5 outline-hidden ${isEditable ? 'hover:bg-amber-50/60 rounded px-1' : ''}`}
              >
                {summonsSubtitle}
              </p>
            </div>

            <div className="p-4 border border-black rounded-lg space-y-3 text-xs leading-relaxed">
              <div className="flex justify-between font-bold border-b border-gray-300 pb-2">
                <span contentEditable={isEditable} suppressContentEditableWarning={true} className="outline-hidden">
                  إلى ولي أمر الطالب: <strong>{targetStudent.fullName}</strong>
                </span>
                <span contentEditable={isEditable} suppressContentEditableWarning={true} className="outline-hidden">
                  الصف: <strong>{targetStudent.grade}</strong> • الفرع: <strong>{currentBranchName}</strong>
                </span>
              </div>

              <div 
                contentEditable={isEditable} 
                suppressContentEditableWarning={true}
                className={`outline-hidden whitespace-pre-line leading-relaxed text-xs text-[#2C1810] ${isEditable ? 'hover:bg-amber-50/60 rounded p-1 border border-dashed border-amber-300' : ''}`}
              >
                {summonsBody}
              </div>

              <div 
                contentEditable={isEditable} 
                suppressContentEditableWarning={true}
                className={`p-2.5 bg-red-50 border border-red-300 rounded text-[11px] text-red-900 font-bold outline-hidden ${isEditable ? 'hover:bg-red-100/60' : ''}`}
              >
                {summonsWarning}
              </div>
            </div>

            {/* Tear-off Bottom Slip */}
            <div className="pt-6 border-t-2 border-dashed border-black space-y-3 text-xs">
              <div className="flex justify-between font-bold">
                <span contentEditable={isEditable} suppressContentEditableWarning={true} className="outline-hidden">
                  كعب استلام إخطار الاستدعاء (يقطعه ولي الأمر ويوقعه ويعيده مع الطالب):
                </span>
                <span contentEditable={isEditable} suppressContentEditableWarning={true} className="outline-hidden">
                  التاريخ: ..... / ..... / 2026 م
                </span>
              </div>
              <p 
                contentEditable={isEditable} 
                suppressContentEditableWarning={true}
                className={`text-[11px] text-gray-800 outline-hidden ${isEditable ? 'hover:bg-amber-50/60 rounded p-1' : ''}`}
              >
                {summonsTearoffText}
              </p>
              <div className="flex justify-between items-end pt-3 font-bold">
                <span contentEditable={isEditable} suppressContentEditableWarning={true} className="outline-hidden">
                  رقم هاتف ولي الأمر: {targetStudent.guardianPhone || '.......................................'}
                </span>
                <span contentEditable={isEditable} suppressContentEditableWarning={true} className="outline-hidden">
                  توقيع ولي الأمر: .......................................
                </span>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================================= */}
        {/* DOCUMENT 7: GATEKEEPER BANNED STUDENTS (كشف أمن البوابة)                 */}
        {/* ======================================================================= */}
        {activeReportType === 'gatekeeper' && (
          <div className="space-y-4">
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-center justify-between text-red-900">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-red-700 shrink-0" />
                <div>
                  <h3 className="text-sm font-black">كشف الممنوعين من الدخول اليوم (خاص بمشرف البوابة والأمن)</h3>
                  <p className="text-xs text-red-700 mt-0.5">
                    يُسلّم هذا الكشف يومياً لمشرف البوابة لمنع الطلاب المدرجة أسماؤهم من دخول الحلقات لحين مراجعة الإدارة.
                  </p>
                </div>
              </div>
              <div className="text-center font-black text-xl tabular-nums bg-white px-4 py-2 rounded-lg border border-red-300">
                {bannedStudents.length} ممنوع
              </div>
            </div>

            <table className="w-full text-right border-collapse text-xs border border-black">
              <thead>
                <tr className="bg-red-100 text-red-900 font-bold border-b border-black">
                  <th className="py-2.5 px-3 border-l border-black w-12 text-center">م</th>
                  <th className="py-2.5 px-4 border-l border-black">الاسم رباعي</th>
                  <th className="py-2.5 px-3 border-l border-black">المرحلة والصف</th>
                  <th className="py-2.5 px-3 border-l border-black">هاتف ولي الأمر</th>
                  <th className="py-2.5 px-4">سبب المنع والإجراء المطلوب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {bannedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-emerald-800 font-bold">
                      لا يوجد أي طالب ممنوع من الدخول اليوم. كافة الطلاب ملتزمون ومسددون.
                    </td>
                  </tr>
                ) : (
                  bannedStudents.map((student, idx) => {
                    const ban = checkStudentBan(student.id);
                    return (
                      <tr key={student.id} className="hover:bg-red-50/40">
                        <td className="py-2.5 px-3 border-l border-black text-center font-bold tabular-nums">{idx + 1}</td>
                        <td className="py-2.5 px-4 border-l border-black font-black text-black">{student.fullName}</td>
                        <td className="py-2.5 px-3 border-l border-black">{student.grade}</td>
                        <td className="py-2.5 px-3 border-l border-black tabular-nums dir-ltr text-right font-medium">{student.guardianPhone}</td>
                        <td className="py-2.5 px-4 text-red-700 font-bold">{ban.details}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ======================================================================= */}
        {/* DOCUMENT 8: STUDENTS GENERAL LIST (كشف قيد الطلاب العام)                 */}
        {/* ======================================================================= */}
        {activeReportType === 'students' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-black border-b border-black pb-2">
              سجل قيد الطلاب المعتمد — إجمالي المقيدين ({branchStudents.length} طالب)
            </h3>
            <table className="w-full text-right border-collapse text-xs border border-black">
              <thead>
                <tr className="bg-gray-100 text-black font-bold border-b border-black">
                  <th className="py-2.5 px-3 border-l border-black w-12 text-center">م</th>
                  <th className="py-2.5 px-4 border-l border-black">الاسم رباعي</th>
                  <th className="py-2.5 px-3 border-l border-black">الصف والمرحلة</th>
                  <th className="py-2.5 px-3 border-l border-black">هاتف ولي الأمر</th>
                  <th className="py-2.5 px-3 border-l border-black">حلقة التحفيظ</th>
                  <th className="py-2.5 px-3 border-l border-black">لقاء الجمعة</th>
                  <th className="py-2.5 px-3">الحالة والغياب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {branchStudents.map((s, idx) => (
                  <tr key={s.id}>
                    <td className="py-2 px-3 border-l border-black text-center font-bold tabular-nums">{idx + 1}</td>
                    <td className="py-2 px-4 border-l border-black font-bold text-black">{s.fullName}</td>
                    <td className="py-2 px-3 border-l border-black">{s.grade}</td>
                    <td className="py-2 px-3 border-l border-black tabular-nums dir-ltr text-right">{s.guardianPhone}</td>
                    <td className="py-2 px-3 border-l border-black">{groups.find(g => g.id === s.tahfeezGroupId)?.name || '—'}</td>
                    <td className="py-2 px-3 border-l border-black">{groups.find(g => g.id === s.tarbawiGroupId)?.name || '—'}</td>
                    <td className="py-2 px-3 tabular-nums font-bold">
                      {s.status === 'active' ? `منتظم (${getStudentAbsenceCountThisMonth(s.id)} غياب)` : s.status === 'dropped' ? `منقطع (${s.droppedReason || ''})` : s.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ======================================================================= */}
        {/* DOCUMENT 9: FINANCIAL DUES & COLLECTIONS (كشف التحصيل المالي)           */}
        {/* ======================================================================= */}
        {activeReportType === 'finance' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-black border-b border-black pb-2">
              تقرير الاستحقاقات المالية والتحصيل والمتأخرات
            </h3>
            <table className="w-full text-right border-collapse text-xs border border-black">
              <thead>
                <tr className="bg-gray-100 text-black font-bold border-b border-black">
                  <th className="py-2.5 px-3 border-l border-black w-12 text-center">م</th>
                  <th className="py-2.5 px-4 border-l border-black">الطالب</th>
                  <th className="py-2.5 px-3 border-l border-black">الشهر والبند</th>
                  <th className="py-2.5 px-3 border-l border-black">المستحق</th>
                  <th className="py-2.5 px-3 border-l border-black">المحصل</th>
                  <th className="py-2.5 px-3 border-l border-black">المتبقي</th>
                  <th className="py-2.5 px-3">حالة السداد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {dues.map((d, idx) => {
                  const student = students.find(s => s.id === d.studentId);
                  const rem = d.amount - d.paidAmount;
                  return (
                    <tr key={d.id}>
                      <td className="py-2 px-3 border-l border-black text-center font-bold tabular-nums">{idx + 1}</td>
                      <td className="py-2 px-4 border-l border-black font-bold text-black">{student?.fullName}</td>
                      <td className="py-2 px-3 border-l border-black">{d.month} ({d.kind === 'fine' ? 'غرامة' : 'اشتراك'})</td>
                      <td className="py-2 px-3 border-l border-black tabular-nums font-bold">{d.amount} ج</td>
                      <td className="py-2 px-3 border-l border-black tabular-nums text-emerald-800 font-bold">{d.paidAmount} ج</td>
                      <td className="py-2 px-3 border-l border-black tabular-nums text-red-700 font-black">{rem} ج</td>
                      <td className="py-2 px-3 font-bold">{d.status === 'paid' ? 'مسدد' : 'متأخر'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ======================================================================= */}
        {/* DOCUMENT 10: BRANCH COMPARISON                                          */}
        {/* ======================================================================= */}
        {activeReportType === 'branch_comparison' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-black border-b border-black pb-2">
              تقرير المقارنة الشاملة بين فروع المدرسة القرآنية
            </h3>
            <table className="w-full text-right border-collapse text-xs border border-black">
              <thead>
                <tr className="bg-gray-100 text-black font-bold border-b border-black">
                  <th className="py-2.5 px-3 border-l border-black text-center w-10">م</th>
                  <th className="py-2.5 px-4 border-l border-black">اسم الفرع</th>
                  <th className="py-2.5 px-3 border-l border-black">المدينة والمسؤول</th>
                  <th className="py-2.5 px-3 border-l border-black text-center">الطلاب</th>
                  <th className="py-2.5 px-3 border-l border-black text-center">المعلمون</th>
                  <th className="py-2.5 px-3 border-l border-black text-center">السعة والإشغال</th>
                  <th className="py-2.5 px-3 border-l border-black">المحصل المالي</th>
                  <th className="py-2.5 px-3 border-l border-black">المتأخرات</th>
                  <th className="py-2.5 px-3 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {branches.map((b, idx) => {
                  const bStudents = students.filter(s => s.branchId === b.id);
                  const bTeachers = teachers.filter(t => t.branchId === b.id);
                  const bDues = dues.filter(d => d.branchId === b.id);
                  const bCollected = bDues.reduce((sum, d) => sum + d.paidAmount, 0);
                  const bTotalDue = bDues.reduce((sum, d) => sum + d.amount, 0);
                  const bArrears = Math.max(0, bTotalDue - bCollected);
                  const bCapacity = b.capacity || 100;
                  const bOccupancy = Math.min(100, Math.round((bStudents.length / bCapacity) * 100));

                  return (
                    <tr key={b.id}>
                      <td className="py-2.5 px-3 border-l border-black text-center font-bold tabular-nums">{idx + 1}</td>
                      <td className="py-2.5 px-4 border-l border-black font-bold text-black">{b.name}</td>
                      <td className="py-2.5 px-3 border-l border-black">{b.city} — {b.managerName}</td>
                      <td className="py-2.5 px-3 border-l border-black text-center tabular-nums font-black">{bStudents.length}</td>
                      <td className="py-2.5 px-3 border-l border-black text-center tabular-nums">{bTeachers.length}</td>
                      <td className="py-2.5 px-3 border-l border-black text-center tabular-nums font-bold">{bStudents.length}/{bCapacity} ({bOccupancy}%)</td>
                      <td className="py-2.5 px-3 border-l border-black tabular-nums font-bold text-emerald-800">{bCollected.toLocaleString()} ج</td>
                      <td className="py-2.5 px-3 border-l border-black tabular-nums font-black text-red-700">{bArrears.toLocaleString()} ج</td>
                      <td className="py-2.5 px-3 text-center font-bold">{b.active ? 'نشط' : 'متوقف'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ======================================================================= */}
        {/* DOCUMENT 11: TEACHERS ATTENDANCE ROLL                                   */}
        {/* ======================================================================= */}
        {activeReportType === 'teachers' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-black border-b border-black pb-2">
              كشف حضور وانصراف المعلمين والمحفظين وساعات العمل المعتمدة
            </h3>
            <table className="w-full text-right border-collapse text-xs border border-black">
              <thead>
                <tr className="bg-gray-100 text-black font-bold border-b border-black">
                  <th className="py-2.5 px-3 border-l border-black w-10 text-center">م</th>
                  <th className="py-2.5 px-4 border-l border-black">اسم المعلم / المحفظ</th>
                  <th className="py-2.5 px-3 border-l border-black">رقم الهاتف</th>
                  <th className="py-2.5 px-3 border-l border-black text-center">الحالة</th>
                  <th className="py-2.5 px-3 border-l border-black text-center">وقت الحضور</th>
                  <th className="py-2.5 px-3 border-l border-black text-center">وقت الانصراف</th>
                  <th className="py-2.5 px-4">سبب العذر / الملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {teachers.filter(t => selectedBranchId === 'all' || t.branchId === selectedBranchId).map((t, idx) => {
                  const att = teacherAttendance.find(a => a.teacherId === t.id);
                  return (
                    <tr key={t.id}>
                      <td className="py-2.5 px-3 border-l border-black text-center font-bold tabular-nums">{idx + 1}</td>
                      <td className="py-2.5 px-4 border-l border-black font-bold">{t.fullName}</td>
                      <td className="py-2.5 px-3 border-l border-black tabular-nums dir-ltr text-right">{t.phone}</td>
                      <td className="py-2.5 px-3 border-l border-black text-center font-bold">
                        {att?.status === 'present' ? 'حاضر' : att?.status === 'excused' ? 'معذور' : 'حاضر'}
                      </td>
                      <td className="py-2.5 px-3 border-l border-black text-center tabular-nums">{att?.checkIn || '15:30'}</td>
                      <td className="py-2.5 px-3 border-l border-black text-center tabular-nums">{att?.checkOut || '18:00'}</td>
                      <td className="py-2.5 px-4 text-gray-700">{att?.excuseReason || 'دوام منتظم'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Document Footer Signatures */}
        <div className="mt-10 pt-6 border-t-2 border-black grid grid-cols-3 gap-4 text-center text-xs font-bold text-black">
          <div>
            <span>{settings.reportSupervisorTitle || 'مشرفة الغياب وشؤون الطلاب'}</span>
            <div className="h-10 border-b border-dotted border-black w-32 mx-auto mt-2" />
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-red-600 flex items-center justify-center text-[9px] text-red-700 font-bold p-1 text-center rotate-[-6deg]">
              {settings.reportStampText || 'خاتم المدرسة المعتمد'}
            </div>
          </div>

          <div>
            <span>{settings.reportDirectorTitle || 'مدير عام المدرسة واعتماد الجمعية'}</span>
            <div className="h-10 border-b border-dotted border-black w-32 mx-auto mt-2" />
          </div>
        </div>

        <div className="text-[9px] text-gray-600 text-center pt-4 mt-2 border-t border-gray-300">
          {settings.reportFooterNotes || 'وثيقة رسمية صادرة من نظام مدرسة السعيد القرآنية — لا يعتد بأي تعديل يدوي غير مختوم.'}
        </div>

      </div>

    </div>
  );
};

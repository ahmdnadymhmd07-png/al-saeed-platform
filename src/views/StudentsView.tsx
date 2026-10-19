import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Student, EducationalStage, FeeMode } from '../types';
import { 
  UserPlus, 
  Search, 
  Download, 
  ShieldAlert, 
  Eye, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  AlertCircle,
  UserMinus,
  RefreshCw,
  X,
  Edit3
} from 'lucide-react';

interface StudentsViewProps {
  onSelectStudent: (student: Student) => void;
  onPrintAdmissionSlip: (student: Student) => void;
}

// دالة مساعدة موحدة ومضبوطة للتحقق مما إذا كان حقل gender مسجلاً كأنثى بأي صيغة
const checkIsFemale = (genderValue: string | undefined | null): boolean => {
  if (!genderValue) return false;
  const normalized = String(genderValue).trim().toLowerCase();
  return normalized === 'female' || normalized === 'أنثى' || normalized === 'أنثي';
};

export const StudentsView: React.FC<StudentsViewProps> = ({ onSelectStudent, onPrintAdmissionSlip }) => {
  const { 
    students, 
    groups, 
    teachers, 
    branches, 
    families, 
    selectedBranchId, 
    addStudent, 
    updateStudent,
    deleteStudent, 
    setStudentDropped,
    reactivateStudent,
    checkStudentBan,
    getStudentAbsenceCountThisMonth,
    currentUser
  } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [bannedFilter, setBannedFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Drop student modal
  const [studentToDrop, setStudentToDrop] = useState<Student | null>(null);
  const [dropReason, setDropReason] = useState('انتقال لظروف عائلية أو سكنية');
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);
  
  // Permanent delete modal
  const [studentToDeletePermanent, setStudentToDeletePermanent] = useState<Student | null>(null);

  // Form state
  const [studentBranchId, setStudentBranchId] = useState<string>(
    selectedBranchId !== 'all' ? selectedBranchId : branches[0]?.id || 'b1'
  );
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [stage, setStage] = useState<EducationalStage>('primary');
  const [grade, setGrade] = useState('الصف الرابع الابتدائي');
  const [tahfeezGroupId, setTahfeezGroupId] = useState(groups.find(g => g.departmentId === 'tahfeez')?.id || '');
  const [tarbawiGroupId, setTarbawiGroupId] = useState(groups.find(g => g.departmentId === 'tarbawi')?.id || '');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [isOrphan, setIsOrphan] = useState(false);
  const [feeMode, setFeeMode] = useState<FeeMode>('normal');
  const [feeDiscountAmount, setFeeDiscountAmount] = useState<number>(0);
  const [feeReason, setFeeReason] = useState('');
  const [familyId, setFamilyId] = useState<string>('');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Filter students based on branch and criteria
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const isFemale = checkIsFemale(s.gender);
      const actualGender = isFemale ? 'female' : 'male';

      if (selectedBranchId !== 'all' && s.branchId !== selectedBranchId) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (genderFilter !== 'all' && actualGender !== genderFilter) return false;
      if (stageFilter !== 'all' && s.stage !== stageFilter) return false;
      if (groupFilter !== 'all' && s.tahfeezGroupId !== groupFilter && s.tarbawiGroupId !== groupFilter) return false;
      if (bannedFilter === 'banned') {
        if (!checkStudentBan(s.id).isBanned) return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = s.fullName.toLowerCase().includes(query);
        const matchesPhone = s.guardianPhone.includes(query);
        if (!matchesName && !matchesPhone) return false;
      }
      return true;
    });
  }, [students, selectedBranchId, statusFilter, genderFilter, stageFilter, groupFilter, bannedFilter, searchQuery, checkStudentBan]);

  // Selected Group Helper for Tahfeez & Tarbawi
  const selectedTahfeezGroup = groups.find(g => g.id === tahfeezGroupId);
  const selectedTahfeezTeacher = teachers.find(t => t.id === selectedTahfeezGroup?.teacherId);

  const selectedTarbawiGroup = groups.find(g => g.id === tarbawiGroupId);
  const selectedTarbawiTeacher = teachers.find(t => t.id === selectedTarbawiGroup?.teacherId);

  const handleGuardianPhoneChange = (val: string) => {
    setGuardianPhone(val);
    const cleaned = val.replace(/\D/g, '').replace(/^0+/, '');
    const norm = cleaned.startsWith('20') ? cleaned : '20' + cleaned;
    const existingWithSamePhone = students.find(s => s.guardianPhone === norm || s.guardianPhone.endsWith(cleaned.slice(-9)));
    if (existingWithSamePhone?.familyId) {
      setFamilyId(existingWithSamePhone.familyId);
    }
  };

  const handleStageChange = (newStage: EducationalStage) => {
    setStage(newStage);
    if (newStage === 'primary') setGrade('الصف الرابع الابتدائي');
    else if (newStage === 'prep') setGrade('الصف الثاني الإعدادي');
    else setGrade('الصف الأول الثانوي');
  };

  const resetFormFields = () => {
    setEditingStudentId(null);
    setFullName('');
    setGender('male');
    setGuardianPhone('');
    setIsOrphan(false);
    setFeeMode('normal');
    setFeeDiscountAmount(0);
    setFeeReason('');
    setFamilyId('');
    setNotes('');
    setAgreementAccepted(false);
    setFormError(null);
  };

  const handleOpenAddNew = () => {
    resetFormFields();
    setStudentBranchId(selectedBranchId !== 'all' ? selectedBranchId : branches[0]?.id || 'b1');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    const isFemale = checkIsFemale(student.gender);
    setEditingStudentId(student.id);
    setStudentBranchId(student.branchId);
    setFullName(student.fullName);
    setGender(isFemale ? 'female' : 'male');
    setStage(student.stage);
    setGrade(student.grade);
    setTahfeezGroupId(student.tahfeezGroupId || '');
    setTarbawiGroupId(student.tarbawiGroupId || '');
    setGuardianPhone(student.guardianPhone);
    setIsOrphan(student.isOrphan || false);
    setFeeMode(student.feeMode || 'normal');
    setFeeDiscountAmount(student.feeDiscountAmount || 0);
    setFeeReason(student.feeReason || '');
    setFamilyId(student.familyId || '');
    setJoinDate(student.joinDate || new Date().toISOString().slice(0, 10));
    setNotes(student.notes || '');
    setAgreementAccepted(true);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSubmitStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
    if (nameParts.length < 4) {
      setFormError('الاسم رباعي إلزامي: يرجى كتابة الاسم الرباعي كاملاً (4 أجزاء على الأقل)');
      return;
    }

    const cleaned = guardianPhone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setFormError('يرجى إدخال رقم هاتف ولي الأمر صحيحاً');
      return;
    }
    let finalPhone = cleaned;
    if (finalPhone.startsWith('0')) {
      finalPhone = '20' + finalPhone.substring(1);
    } else if (!finalPhone.startsWith('20')) {
      finalPhone = '20' + finalPhone;
    }

    if (!agreementAccepted) {
      setFormError('يجب تأكيد اطلاع ولي الأمر على شروط الالتحاق والموافقة عليها');
      return;
    }

    const studentData = {
      branchId: studentBranchId,
      fullName: fullName.trim(),
      gender: gender, // تُرسل 'female' أو 'male' صراحةً
      grade,
      stage,
      guardianPhone: finalPhone,
      isOrphan,
      feeMode: isOrphan ? feeMode : 'normal',
      feeDiscountAmount: isOrphan ? feeDiscountAmount : 0,
      feeReason: isOrphan ? feeReason : '',
      familyId: familyId || undefined,
      joinDate,
      notes: notes.trim(),
      status: 'active' as const,
      agreementAccepted: true,
      agreementDate: joinDate,
      tahfeezGroupId,
      tarbawiGroupId
    };

    if (editingStudentId) {
      updateStudent(editingStudentId, studentData);
      setActionSuccessNotice(`تم تعديل بيانات الطالب (${fullName.trim()}) بنجاح!`);
      setTimeout(() => setActionSuccessNotice(null), 4000);
      setIsFormOpen(false);
      resetFormFields();
    } else {
      const newStudent = addStudent(studentData);
      setIsFormOpen(false);
      resetFormFields();
      onPrintAdmissionSlip(newStudent);
    }
  };

  const handleExportCSV = () => {
    const headers = ['المعرف', 'الاسم رباعي', 'النوع', 'المرحلة', 'الصف', 'هاتف ولي الأمر', 'اليتيم', 'حالة الاشتراك', 'الحالة'];
    const rows = filteredStudents.map(s => {
      const isFemale = checkIsFemale(s.gender);
      return [
        s.id,
        `"${s.fullName}"`,
        isFemale ? 'أنثى' : 'ذكر',
        s.stage === 'primary' ? 'ابتدائي' : s.stage === 'prep' ? 'إعدادي' : 'ثانوي فما فوق',
        `"${s.grade}"`,
        s.guardianPhone,
        s.isOrphan ? 'يتيم' : 'غير يتيم',
        s.feeMode,
        s.status
      ];
    });
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `طلاب_مدرسة_السعيد_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body, html {
            height: auto !important;
            overflow: visible !important;
            background: #fff !important;
          }
          .printable-admission-modal {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            padding-top: 12mm !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FFFFFF] p-4 rounded-xl border border-[#E8DCCF] shadow-2xs no-print">
        <div>
          <h2 className="text-base font-bold text-[#4A2F18]">شؤون الطلاب واستمارة القيد والتسجيل</h2>
          <p className="text-xs text-[#8C6D53]">
            تسجيل الطلاب الجدد، تعديل البيانات، ربط الإخوة، ضبط إعفاءات الأيتام، ومتابعة حالات المنع من الدخول
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#F6EEE4] hover:bg-[#EADDCF] text-[#4A2F18] rounded-lg text-xs font-bold transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#8C6D53]" />
            <span>تصدير CSV</span>
          </button>
          
          {(currentUser.role === 'admin' || currentUser.role === 'data_entry') && (
            <button
              onClick={handleOpenAddNew}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#D8C3AE]" />
              <span>استمارة تقديم طالب جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-6 gap-2.5 bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E8DCCF] no-print">
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 absolute right-3 top-2.5 text-[#8C6D53]" />
          <input
            type="text"
            placeholder="بحث بالاسم أو الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-1.5 text-xs rounded-lg border border-[#E8DCCF] focus:outline-hidden focus:border-[#4A2F18] bg-[#FBF8F5]"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-[#E8DCCF] focus:outline-hidden bg-[#FBF8F5] text-[#4A2F18] font-bold"
          >
            <option value="all">كل حالات القيد</option>
            <option value="active">الطلاب المنتظمون</option>
            <option value="dropped">الطلاب المنقطعون</option>
            <option value="suspended">المفصولون مؤقتاً</option>
          </select>
        </div>

        <div>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-[#E8DCCF] focus:outline-hidden bg-[#FBF8F5] text-[#4A2F18] font-medium"
          >
            <option value="all">الجميع (بنين وبنات)</option>
            <option value="male">بنين (ذكور)</option>
            <option value="female">بنات (إناث)</option>
          </select>
        </div>

        <div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-[#E8DCCF] focus:outline-hidden bg-[#FBF8F5] text-[#4A2F18] font-medium"
          >
            <option value="all">جميع المراحل</option>
            <option value="primary">ابتدائي (50 ج)</option>
            <option value="prep">إعدادي (65 ج)</option>
            <option value="secondary_up">ثانوي فما فوق (80 ج)</option>
          </select>
        </div>

        <div>
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-[#E8DCCF] focus:outline-hidden bg-[#FBF8F5] text-[#4A2F18] font-medium"
          >
            <option value="all">جميع الحلقات</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={bannedFilter}
            onChange={(e) => setBannedFilter(e.target.value)}
            className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-[#E8DCCF] focus:outline-hidden bg-[#FBF8F5] text-[#4A2F18] font-medium"
          >
            <option value="all">كافة حالات الدخول</option>
            <option value="banned">الممنوعون فقط</option>
          </select>
        </div>
      </div>

      {actionSuccessNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccessNotice}</span>
        </div>
      )}

      {/* Admission / Edit Student Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 pt-6 md:pt-10 overflow-y-auto printable-admission-modal">
          <div className="bg-[#FFFFFF] w-full max-w-2xl rounded-2xl border border-[#E8DCCF] shadow-xl overflow-hidden my-auto max-h-[90vh] flex flex-col print:max-h-none print:shadow-none print:border-none">
            
            {/* Modal Header */}
            <div className="bg-[#4A2F18] p-4 text-white flex items-center justify-between shrink-0 no-print">
              <div>
                <h3 className="text-sm font-bold">
                  {editingStudentId ? 'تعديل بيانات الطالب المسجل' : 'استمارة تقديم وقيد طالب جديد'}
                </h3>
                <p className="text-[11px] text-[#D8C3AE]">التحاق بالمدرسة القرآنية ولقاء الجمعة التربوي</p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-white hover:text-red-200 p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitStudent} className="p-6 space-y-4 overflow-y-auto flex-1 print:overflow-visible print:p-0">
              
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-700 flex items-center gap-2 no-print">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 0. Branch Selection */}
              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">
                  الفرع / المدرسة المخصصة <span className="text-red-600">*</span>
                </label>
                <select
                  value={studentBranchId}
                  onChange={(e) => setStudentBranchId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] font-bold text-[#4A2F18]"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* 1. Full 4-part name */}
              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">
                  الاسم رباعي (إلزامي، 4 أجزاء على الأقل) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عمر أحمد محمد الشافعي"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] focus:border-[#4A2F18] focus:outline-hidden bg-[#FBF8F5]"
                />
              </div>

              {/* 1.1 Gender Selection */}
              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">
                  النوع (الجنس) <span className="text-red-600">*</span>
                </label>
                <div className="flex items-center gap-6 bg-[#FBF8F5] p-2.5 rounded-lg border border-[#E8DCCF]">
                  <label className="flex items-center gap-2 font-bold text-xs text-[#4A2F18] cursor-pointer">
                    <input
                      type="radio"
                      name="studentGender"
                      value="male"
                      checked={gender === 'male'}
                      onChange={() => setGender('male')}
                      className="w-4 h-4 text-[#4A2F18] cursor-pointer"
                    />
                    <span>ذكر (طالب)</span>
                  </label>

                  <label className="flex items-center gap-2 font-bold text-xs text-[#4A2F18] cursor-pointer">
                    <input
                      type="radio"
                      name="studentGender"
                      value="female"
                      checked={gender === 'female'}
                      onChange={() => setGender('female')}
                      className="w-4 h-4 text-[#4A2F18] cursor-pointer"
                    />
                    <span>أنثى (طالبة)</span>
                  </label>
                </div>
              </div>

              {/* 2. Educational Stage & Grade */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">المرحلة الدراسية</label>
                  <select
                    value={stage}
                    onChange={(e) => handleStageChange(e.target.value as EducationalStage)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5]"
                  >
                    <option value="primary">ابتدائي (قيمة الاشتراك: 50 ج)</option>
                    <option value="prep">إعدادي (قيمة الاشتراك: 65 ج)</option>
                    <option value="secondary_up">ثانوي فما فوق (قيمة الاشتراك: 80 ج)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">الصف الدراسي</label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="مثال: الصف الرابع الابتدائي"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5]"
                  />
                </div>
              </div>

              {/* 3. Core Departments & Groups Selection */}
              <div className="p-3.5 bg-[#F6EEE4] rounded-xl border border-[#E8DCCF] space-y-3">
                <div className="text-xs font-extrabold text-[#4A2F18] flex items-center justify-between">
                  <span>توزيع القسمين الأساسيين (مجموعة لكل قسم)</span>
                  <span className="text-[11px] text-[#8C6D53]">المعلم والميعاد يملآن تلقائياً</span>
                </div>

                {/* Tahfeez Group */}
                <div className="bg-white p-2.5 rounded-lg border border-[#E8DCCF]">
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">مجموعة قسم التحفيظ القرآني</label>
                  <select
                    value={tahfeezGroupId}
                    onChange={(e) => setTahfeezGroupId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[#E8DCCF] mb-1.5"
                  >
                    {groups.filter(g => g.departmentId === 'tahfeez' && (g.branchId === studentBranchId || !g.branchId)).map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  <div className="text-[11px] text-[#8C6D53] flex items-center justify-between">
                    <span>المعلم: <strong className="text-[#4A2F18]">{selectedTahfeezTeacher?.fullName || 'غير محدد'}</strong></span>
                    <span>الميعاد: <strong className="text-[#4A2F18]">{selectedTahfeezGroup?.days.join('، ')} ({selectedTahfeezGroup?.startTime} - {selectedTahfeezGroup?.endTime})</strong></span>
                  </div>
                </div>

                {/* Tarbawi Group */}
                <div className="bg-white p-2.5 rounded-lg border border-[#E8DCCF]">
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">مجموعة لقاء الجمعة (التربوي)</label>
                  <select
                    value={tarbawiGroupId}
                    onChange={(e) => setTarbawiGroupId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[#E8DCCF] mb-1.5"
                  >
                    {groups.filter(g => g.departmentId === 'tarbawi' && (g.branchId === studentBranchId || !g.branchId)).map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  <div className="text-[11px] text-[#8C6D53] flex items-center justify-between">
                    <span>المعلم: <strong className="text-[#4A2F18]">{selectedTarbawiTeacher?.fullName || 'غير محدد'}</strong></span>
                    <span>الميعاد: <strong className="text-[#4A2F18]">{selectedTarbawiGroup?.days.join('، ')} ({selectedTarbawiGroup?.startTime} - {selectedTarbawiGroup?.endTime})</strong></span>
                  </div>
                </div>
              </div>

              {/* 4. Guardian WhatsApp Phone & Sibling Linking */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">
                    رقم ولي الأمر (واتساب) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="010XXXXXXXX"
                    value={guardianPhone}
                    onChange={(e) => handleGuardianPhoneChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] text-left tabular-nums"
                  />
                  <span className="text-[10px] text-[#8C6D53]">يحول تلقائياً للصيغة الدولية +20</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">ربط الإخوة (الأسرة لخصم 10 ج)</label>
                  <select
                    value={familyId}
                    onChange={(e) => setFamilyId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5]"
                  >
                    <option value="">طالب منفرد (بدون أسرة مسجلة)</option>
                    {families.map(f => (
                      <option key={f.id} value={f.id}>{f.familyName} ({f.note})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 5. Orphan Status & Fee Mode */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isOrphanCheckbox"
                    checked={isOrphan}
                    onChange={(e) => setIsOrphan(e.target.checked)}
                    className="w-4 h-4 text-[#4A2F18] rounded cursor-pointer"
                  />
                  <label htmlFor="isOrphanCheckbox" className="text-xs font-bold text-[#4A2F18] cursor-pointer">
                    الطالب يتيم (تحديد حالة الدفع أو الخصم/الإعفاء)
                  </label>
                </div>

                {isOrphan && (
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-amber-200">
                    <div>
                      <label className="block text-[11px] font-bold text-[#4A2F18] mb-1">حالة السداد</label>
                      <select
                        value={feeMode}
                        onChange={(e) => setFeeMode(e.target.value as FeeMode)}
                        className="w-full px-2 py-1 text-xs rounded border border-amber-300 bg-white"
                      >
                        <option value="normal">يدفع كاملاً</option>
                        <option value="discount">خصم بمبلغ محدد</option>
                        <option value="exempt">معفى بالكامل (100%)</option>
                      </select>
                    </div>

                    {feeMode === 'discount' && (
                      <div>
                        <label className="block text-[11px] font-bold text-[#4A2F18] mb-1">قيمة الخصم (ج)</label>
                        <input
                          type="number"
                          value={feeDiscountAmount}
                          onChange={(e) => setFeeDiscountAmount(Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs rounded border border-amber-300 bg-white tabular-nums"
                        />
                      </div>
                    )}

                    <div className={feeMode === 'discount' ? 'col-span-1' : 'col-span-2'}>
                      <label className="block text-[11px] font-bold text-[#4A2F18] mb-1">سبب الاستثناء / الإعفاء</label>
                      <input
                        type="text"
                        placeholder="سبب اعتمده المدير أو المشرف"
                        value={feeReason}
                        onChange={(e) => setFeeReason(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border border-amber-300 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Date & Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">تاريخ الالتحاق</label>
                  <input
                    type="date"
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">ملاحظات إضافية</label>
                  <input
                    type="text"
                    placeholder="أي ملاحظات حول الحفظ أو السلوك..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5]"
                  />
                </div>
              </div>

              {/* 7. Agreement Checkbox */}
              <div className="p-3 bg-[#F6EEE4] rounded-xl border border-[#E8DCCF] flex items-center gap-3">
                <input
                  type="checkbox"
                  id="agreementCheckbox"
                  checked={agreementAccepted}
                  onChange={(e) => setAgreementAccepted(e.target.checked)}
                  className="w-4 h-4 text-[#4A2F18] rounded cursor-pointer shrink-0"
                />
                <label htmlFor="agreementCheckbox" className="text-xs font-bold text-[#4A2F18] cursor-pointer">
                  اطلع ولي الأمر على شروط الالتحاق الثمانية بمدرسة السعيد ووافق عليها وتعهد بالالتزام بها.
                </label>
              </div>

              {/* Form Actions */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E8DCCF] no-print">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#6D4C3D] hover:bg-[#F6EEE4] rounded-lg transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#4A2F18] hover:bg-[#382312] rounded-lg transition shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingStudentId ? 'تحديث البيانات' : 'حفظ الطالب وطباعة الاستمارة'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Students Data Table */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] overflow-hidden shadow-2xs no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-[#F6EEE4] border-b border-[#E8DCCF] text-[#4A2F18] font-bold">
                <th className="py-3 px-4">الطالب والاسم رباعي</th>
                <th className="py-3 px-3">النوع</th>
                <th className="py-3 px-3">المرحلة والصف</th>
                <th className="py-3 px-3">حلقة التحفيظ</th>
                <th className="py-3 px-3">لقاء الجمعة (التربوي)</th>
                <th className="py-3 px-3">حالة القيد</th>
                <th className="py-3 px-3">غياب الشهر</th>
                <th className="py-3 px-3">الاشتراك</th>
                <th className="py-3 px-3">حالة الدخول</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCCF]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-[#8C6D53]">
                    لا توجد سجلات مطابقة للبحث أو المرشحات المحددة.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const banInfo = checkStudentBan(student.id);
                  const absenceCount = getStudentAbsenceCountThisMonth(student.id);
                  const tahfeezGrp = groups.find(g => g.id === student.tahfeezGroupId);
                  const tarbawiGrp = groups.find(g => g.id === student.tarbawiGroupId);
                  
                  // التحقق من حالة الأنثى
                  const isFemale = checkIsFemale(student.gender);

                  return (
                    <tr key={student.id} className={`hover:bg-[#FDFBF9] transition ${student.status === 'dropped' ? 'bg-amber-50/20' : ''}`}>
                      
                      {/* Name & Sibling Indicator */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectStudent(student)}
                            className="font-bold text-[#4A2F18] hover:text-[#B9895B] hover:underline text-right cursor-pointer"
                          >
                            {student.fullName}
                          </button>
                          {student.isOrphan && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">
                              يتيم
                            </span>
                          )}
                          {student.familyId && (
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-semibold" title="مستفيد من خصم الإخوة">
                              شقيق
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#8C6D53] tabular-nums dir-ltr block text-right mt-0.5">
                          {student.guardianPhone}
                        </span>
                        {student.status === 'dropped' && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>منقطع: {student.droppedReason || 'بدون سبب مسجل'} {student.droppedDate ? `(بتاريخ ${student.droppedDate})` : ''}</span>
                          </div>
                        )}
                      </td>

                      {/* Gender Column */}
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isFemale 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {isFemale ? 'أنثى' : 'ذكر'}
                        </span>
                      </td>

                      {/* Stage & Grade */}
                      <td className="py-3 px-3">
                        <span className="text-[#4A2F18] font-medium">{student.grade}</span>
                        <span className="block text-[10px] text-[#8C6D53]">
                          {student.stage === 'primary' ? 'ابتدائي (50 ج)' :
                           student.stage === 'prep' ? 'إعدادي (65 ج)' : 'ثانوي (80 ج)'}
                        </span>
                      </td>

                      {/* Tahfeez Group */}
                      <td className="py-3 px-3">
                        <span className="text-[#4A2F18] font-medium">{tahfeezGrp?.name || '—'}</span>
                        <span className="block text-[10px] text-[#8C6D53]">
                          {teachers.find(t => t.id === tahfeezGrp?.teacherId)?.fullName}
                        </span>
                      </td>

                      {/* Tarbawi Group */}
                      <td className="py-3 px-3">
                        <span className="text-[#4A2F18] font-medium">{tarbawiGrp?.name || '—'}</span>
                        <span className="block text-[10px] text-[#8C6D53]">
                          {teachers.find(t => t.id === tarbawiGrp?.teacherId)?.fullName}
                        </span>
                      </td>

                      {/* Enrollment Status */}
                      <td className="py-3 px-3">
                        {student.status === 'active' ? (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200 inline-block">
                            منتظم (مقيد)
                          </span>
                        ) : student.status === 'dropped' ? (
                          <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-300 inline-block">
                            منقطع عن الدراسة
                          </span>
                        ) : student.status === 'suspended' ? (
                          <span className="text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded text-[11px] border border-purple-200 inline-block">
                            فصل مؤقت
                          </span>
                        ) : (
                          <span className="text-[#8C6D53] text-[11px]">مغادر</span>
                        )}
                      </td>

                      {/* Absence Counter */}
                      <td className="py-3 px-3">
                        <span className={`font-bold tabular-nums text-xs ${
                          absenceCount >= 8 ? 'text-red-700 font-black' :
                          absenceCount >= 6 ? 'text-amber-700 font-bold' :
                          absenceCount >= 4 ? 'text-amber-600' : 'text-[#4A2F18]'
                        }`}>
                          {absenceCount} من 16
                        </span>
                        {absenceCount >= 6 && (
                          <span className="block text-[10px] text-red-600 font-bold">
                            تجاوز الحد (إنذار)
                          </span>
                        )}
                      </td>

                      {/* Fee Mode */}
                      <td className="py-3 px-3">
                        {student.feeMode === 'exempt' ? (
                          <span className="text-emerald-700 font-bold text-[11px]">معفى (0 ج)</span>
                        ) : student.feeMode === 'discount' ? (
                          <span className="text-blue-700 font-bold text-[11px]">خصم {student.feeDiscountAmount} ج</span>
                        ) : (
                          <span className="text-[#4A2F18] text-[11px]">كامل</span>
                        )}
                      </td>

                      {/* Ban Status */}
                      <td className="py-3 px-3">
                        {banInfo.isBanned ? (
                          <div className="flex items-center gap-1.5 text-red-700 font-bold bg-red-50 px-2 py-1 rounded-md border border-red-200">
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-red-600" />
                            <span className="truncate max-w-[120px]" title={banInfo.details}>
                              ممنوع من الدخول
                            </span>
                          </div>
                        ) : (
                          <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            مسموح
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit Student Button */}
                          {(currentUser.role === 'admin' || currentUser.role === 'data_entry') && (
                            <button
                              onClick={() => handleOpenEdit(student)}
                              title="تعديل بيانات الطالب"
                              className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => onSelectStudent(student)}
                            title="عرض الملف الشامل"
                            className="p-1.5 rounded-md hover:bg-[#F6EEE4] text-[#4A2F18] transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onPrintAdmissionSlip(student)}
                            title="طباعة استمارة التقديم وشروط الالتحاق"
                            className="p-1.5 rounded-md hover:bg-[#F6EEE4] text-[#8C6D53] transition cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Drop or Reactivate Actions */}
                          {student.status === 'dropped' ? (
                            <button
                              onClick={() => {
                                reactivateStudent(student.id);
                                setActionSuccessNotice(`تمت إعادة قيد وتفعيل الطالب (${student.fullName}) بنجاح!`);
                                setTimeout(() => setActionSuccessNotice(null), 4000);
                              }}
                              title="إعادة قيد وتفعيل الطالب"
                              className="px-2 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>إعادة قيد</span>
                            </button>
                          ) : (
                            (currentUser.role === 'admin' || currentUser.role === 'data_entry') && (
                              <button
                                onClick={() => {
                                  setStudentToDrop(student);
                                  setDropReason('ظروف عائلية أو انشغال دراسي');
                                }}
                                title="تسجيل انقطاع الطالب (منقطع)"
                                className="p-1.5 rounded-md hover:bg-amber-100 text-amber-700 transition cursor-pointer"
                              >
                                <UserMinus className="w-4 h-4" />
                              </button>
                            )
                          )}

                          {/* Admin Permanent Delete */}
                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => setStudentToDeletePermanent(student)}
                              title="حذف نهائي من النظام (للمدير)"
                              className="p-1.5 rounded-md hover:bg-red-50 text-red-600 transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* Modal: Record Student Dropout */}
      {studentToDrop && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E8DCCF] shadow-xl p-5 space-y-4">
            <div className="flex items-center gap-3 text-amber-700">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <UserMinus className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#4A2F18]">تسجيل انقطاع الطالب عن الدراسة</h3>
                <p className="text-[11px] text-[#8C6D53]">الطالب: {studentToDrop.fullName}</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>ملاحظة هامة:</strong> لن يتم حذف الطالب نهائياً، بل سيتم حفظ سجله بالكامل مع إيقاف المطالبات والغياب اليومي، مع إمكانية <strong>إعادة قيده وتفعيله</strong> في أي وقت بضغطة زر.
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A2F18] mb-1">سبب انقطاع الطالب عن الحضور:</label>
              <input
                type="text"
                value={dropReason}
                onChange={(e) => setDropReason(e.target.value)}
                placeholder="مثال: ظروف أسرية، سفر، انشغال بالدراسة المدرسية..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] text-[#4A2F18] font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DCCF]">
              <button
                type="button"
                onClick={() => setStudentToDrop(null)}
                className="px-4 py-2 text-xs font-bold text-[#6D4C3D] hover:bg-[#F6EEE4] rounded-lg transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  setStudentDropped(studentToDrop.id, dropReason.trim() || 'انقطاع عن الدراسة');
                  setStudentToDrop(null);
                  setActionSuccessNotice(`تم تسجيل انقطاع الطالب (${studentToDrop.fullName}) بنجاح والاحتفاظ بملفه في قائمة المنقطعين.`);
                  setTimeout(() => setActionSuccessNotice(null), 5000);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <UserMinus className="w-4 h-4" />
                <span>تأكيد تسجيل الانقطاع</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Permanent Deletion */}
      {studentToDeletePermanent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl max-w-md w-full border border-red-200 shadow-xl p-5 space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-700" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#4A2F18]">تأكيد الحذف النهائي للطالب</h3>
                <p className="text-[11px] text-[#8C6D53]">الطالب: {studentToDeletePermanent.fullName}</p>
              </div>
            </div>

            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-900 leading-relaxed">
              <strong>تحذير لا رجعة فيه:</strong> الحذف النهائي يزيل سجل الطالب نهائياً من قاعدة البيانات. إذا كان الطالب قد غادر أو انقطع فقط، يُفضل اختيار <strong>(تسجيل انقطاع)</strong> بدلاً من الحذف للحفاظ على السجلات المالية والأكاديمية.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DCCF]">
              <button
                type="button"
                onClick={() => setStudentToDeletePermanent(null)}
                className="px-4 py-2 text-xs font-bold text-[#6D4C3D] hover:bg-[#F6EEE4] rounded-lg transition cursor-pointer"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteStudent(studentToDeletePermanent.id, true);
                  setStudentToDeletePermanent(null);
                  setActionSuccessNotice(`تم حذف سجل الطالب نهائياً من قاعدة البيانات.`);
                  setTimeout(() => setActionSuccessNotice(null), 4000);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف نهائي قطعي</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

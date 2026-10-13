import { 
  Branch, 
  Department, 
  Group, 
  Teacher, 
  Student, 
  Family, 
  StudentAttendance, 
  TeacherAttendance,
  DisciplineCase, 
  Due, 
  Payment, 
  StoreItem, 
  Sale, 
  PointsEntry, 
  Reward, 
  RewardGrant, 
  MessageTemplate, 
  MessageLog, 
  AuditLog, 
  SchoolSettings, 
  User,
  StudentNote
} from '../types';
import schoolLogo from '../assets/images/school_emblem_logo_1791592999393.jpg';

export const OFFICIAL_SCHOOL_LOGO = schoolLogo;

export const initialBranches: Branch[] = [
  { 
    id: 'b1', 
    name: 'الفرع الرئيسي — روضة السعيد', 
    address: 'ميدان الجمعية الشرعية، الزقازيق', 
    phone: '01012345671', 
    managerName: 'الشيخ أحمد البهي',
    city: 'الزقازيق',
    capacity: 180,
    establishedDate: '2020-09-01',
    notes: 'المقر المركزي لإدارة الحلقات والامتحانات',
    active: true 
  },
  { 
    id: 'b2', 
    name: 'فرع حي النور — منارة التوحيد', 
    address: 'شارع المصطفى، حي النور', 
    phone: '01012345672', 
    managerName: 'الشيخ حسام سراج',
    city: 'الزقازيق',
    capacity: 120,
    establishedDate: '2022-03-15',
    notes: 'مبنى ملحق بمسجد النور',
    active: true 
  },
  { 
    id: 'b3', 
    name: 'فرع الصفا والمروة', 
    address: 'بجوار المسجد الكبير، القنايات', 
    phone: '01012345673', 
    managerName: 'أ. عصام عبد الهادي',
    city: 'القنايات',
    capacity: 100,
    establishedDate: '2023-01-10',
    notes: 'فرع نموذجي مجهز بقاعات سمعية وبصرية',
    active: true 
  },
  { 
    id: 'b4', 
    name: 'فرع رواد الفرقان', 
    address: 'المجاورة 14، العاشر من رمضان', 
    phone: '01012345674', 
    managerName: 'الشيخ أسامة متولي',
    city: 'العاشر من رمضان',
    capacity: 150,
    establishedDate: '2024-05-01',
    notes: 'فرع يخدم المدينة الصناعية والأحياء السكنية',
    active: true 
  },
  { 
    id: 'b5', 
    name: 'فرع رياض الصالحين', 
    address: 'شارع الجمعية، بلبيس', 
    phone: '01012345675', 
    managerName: 'الشيخ عادل النجار',
    city: 'بلبيس',
    capacity: 90,
    establishedDate: '2025-02-20',
    notes: 'أحدث فروع المدرسة القرآنية',
    active: true 
  },
];

export const initialUsers: User[] = [
  { id: 'u1', username: 'admin', fullName: 'الشيخ سعيد عثمان (صاحب المنصة)', role: 'admin', branchIds: ['all'], phone: '01012345671', password: 'admin', active: true },
  { id: 'u2', username: 'attendance', fullName: 'مشرفة الغياب والحضور', role: 'attendance_supervisor', branchIds: ['all'], phone: '01012345672', password: '123', active: true },
  { id: 'u3', username: 'finance', fullName: 'مشرفة التحصيل المالي', role: 'finance', branchIds: ['all'], phone: '01012345673', password: '123', active: true },
  { id: 'u4', username: 'data_entry', fullName: 'مدخلة البيانات وشؤون الطلاب', role: 'data_entry', branchIds: ['all'], phone: '01012345674', password: '123', active: true },
];

export const initialDepartments: Department[] = [
  { id: 'tahfeez', code: 'THF', name: 'قسم التحفيظ القرآني', pointsPerSession: 1, active: true },
  { id: 'tarbawi', code: 'TRB', name: 'قسم لقاء الجمعة (التربوي)', pointsPerSession: 1, active: true },
];

export const initialTeachers: Teacher[] = [
  { id: 't1', fullName: 'الشيخ إبراهيم الدسوقي', phone: '01023456781', branchId: 'b1', departmentIds: ['tahfeez'], active: true },
  { id: 't2', fullName: 'الشيخ عبد الله السعيد', phone: '01023456782', branchId: 'b1', departmentIds: ['tarbawi'], active: true },
  { id: 't3', fullName: 'الشيخة منى الشافعي', phone: '01023456783', branchId: 'b1', departmentIds: ['tahfeez', 'tarbawi'], active: true },
  { id: 't4', fullName: 'الشيخ ياسر رضوان', phone: '01023456784', branchId: 'b2', departmentIds: ['tahfeez'], active: true },
  { id: 't5', fullName: 'الشيخ طارق العوضي', phone: '01023456785', branchId: 'b2', departmentIds: ['tarbawi'], active: true },
];

export const initialGroups: Group[] = [
  { id: 'g1', name: 'حلقة الإتقان (ابتدائي)', departmentId: 'tahfeez', branchId: 'b1', teacherId: 't1', days: ['السبت', 'الاثنين', 'الأربعاء'], startTime: '15:30', endTime: '17:30', capacity: 20, year: '2026-2027', active: true },
  { id: 'g2', name: 'حلقة الترتيل (إعدادي)', departmentId: 'tahfeez', branchId: 'b1', teacherId: 't1', days: ['السبت', 'الاثنين', 'الأربعاء'], startTime: '17:30', endTime: '19:30', capacity: 20, year: '2026-2027', active: true },
  { id: 'g3', name: 'حلقة الفرقان (فتيات)', departmentId: 'tahfeez', branchId: 'b1', teacherId: 't3', days: ['الأحد', 'الثلاثاء', 'الخميس'], startTime: '15:30', endTime: '17:30', capacity: 18, year: '2026-2027', active: true },
  { id: 'g5', name: 'لقاء الجمعة — رواد الإيمان (أشبال)', departmentId: 'tarbawi', branchId: 'b1', teacherId: 't2', days: ['الجمعة'], startTime: '08:30', endTime: '11:00', capacity: 30, year: '2026-2027', active: true },
  { id: 'g6', name: 'لقاء الجمعة — فرسان الهدى (فتيان)', departmentId: 'tarbawi', branchId: 'b1', teacherId: 't2', days: ['الجمعة'], startTime: '13:30', endTime: '15:30', capacity: 30, year: '2026-2027', active: true },
];

export const initialFamilies: Family[] = [];

export const initialStudents: Student[] = [];

export const initialDisciplineCases: DisciplineCase[] = [];

export const defaultFeePlans = [
  { stage: 'primary' as const, stageNameAr: 'المرحلة الابتدائية', monthlyAmount: 50, dueDay: 10, graceDays: 5 },
  { stage: 'prep' as const, stageNameAr: 'المرحلة الإعدادية', monthlyAmount: 65, dueDay: 10, graceDays: 5 },
  { stage: 'secondary_up' as const, stageNameAr: 'المرحلة الثانوية فما فوق', monthlyAmount: 80, dueDay: 10, graceDays: 5 },
];

export const initialSettings: SchoolSettings = {
  associationName: 'الجمعية الشرعية لتعاون العاملين بالكتاب والسنة المحمدية',
  schoolName: 'مدرسة السعيد القرآنية',
  logoUrl: OFFICIAL_SCHOOL_LOGO || '/school_logo.jpg',
  phone: '01012345678',
  email: 'info@alsaeed-quran.org',
  address: 'ميدان الجمعية الشرعية — المحافظة',
  feePlans: defaultFeePlans,
  siblingDiscountAmount: 10,
  absenceThresholds: {
    level1: 6,
    level2: 8,
    level3: 10,
  },
  absenceFineAmount: 50,
  suspensionMonths: 2,
  dueDay: 10,
  graceDays: 5,
  sendExcusedAbsentWhatsApp: false,
  termsText: `شروط الالتحاق بمدرسة السعيد القرآنية:
1. الالتزام بمنهج الجمعية الشرعية القائم على الكتاب والسنة المطهرة.
2. الالتزام بالحضور المنتظم في قسمي التحفيظ ولقاء الجمعة التربوي معاً.
3. لا يُقبل الغياب إلا لعذر قهري يقدم كتابة لمشرفة الغياب.
4. بلوغ 6 غيابات شهرياً يوجب استدعاء ولي الأمر والمنع من الدخول.
5. بلوغ 8 غيابات يوجب غرامة انضباط قدرها 50 جنيهاً مصرياً.
6. بلوغ 10 غيابات يوجب الفصل المؤقت لمدة شهرين.
7. سداد الاشتراك الشهري قبل يوم 10 من كل شهر ميلادي؛ التأخر يمنع الطالب من الدخول حتى السداد.
8. الالتزام بالزي الإسلامي اللائق والسمت الطيب داخل أروقة المدرسة.`
};

export const initialDues: Due[] = [];

export const initialPayments: Payment[] = [];

export const initialStoreItems: StoreItem[] = [
  { id: 'item1', branchId: 'b1', name: 'دفتر المتابعة والواجبات', type: 'notebook', unitPrice: 15, stock: 100, active: true },
  { id: 'item2', branchId: 'b1', name: 'دفتر التجويد والتطبيقات', type: 'notebook', unitPrice: 15, stock: 80, active: true },
  { id: 'item3', branchId: 'b1', name: 'كتاب منهج لقاء الجمعة (رياض الأخلاق)', type: 'book', unitPrice: 35, stock: 50, active: true },
  { id: 'mushaf4', branchId: 'b1', name: 'مصحف الحفظ الملون برواية حفص', type: 'mushaf', unitPrice: 75, stock: 30, active: true },
  { id: 'item5', branchId: 'b1', name: 'متن تحفة الأطفال والغلمان في التجويد', type: 'book', unitPrice: 20, stock: 60, active: true },
];

export const initialSales: Sale[] = [];

export const initialRewards: Reward[] = [
  { id: 'rw1', title: 'هدية تحفيزية تشجيعية (أدوات مدرسية فاخرة)', threshold: 20, description: 'حقيبة أقلام ومسطرة ودفتر مزخرف تشجيعاً للمواظبة', active: true },
  { id: 'rw2', title: 'مصحف التجويد المذهب وجائزة تفوق', threshold: 40, description: 'مصحف شريف ملون بالتجويد مع شهادة تقدير من الجمعية', active: true },
  { id: 'rw3', title: 'درع التميز القرآني الكبرى', threshold: 60, description: 'درع فخري باسم الطالب مع مكافأة عينية خاصة', active: true },
];

export const initialRewardGrants: RewardGrant[] = [];

export const initialStudentAttendance: StudentAttendance[] = [];

export const initialPointsLedger: PointsEntry[] = [];

export const initialTeacherAttendance: TeacherAttendance[] = [];

export const initialStudentNotes: StudentNote[] = [];

export const initialMessageTemplates: MessageTemplate[] = [
  {
    id: 'tpl_absent',
    type: 'absent',
    name: 'تنبيه غياب يومي',
    template: 'السلام عليكم ورحمة الله وبركاته، ولي أمر الطالب {اسم_الطالب} الكريم، نحيطكم علماً بتغيب نجلكم اليوم {التاريخ} عن حلقة {المجموعة} في {القسم} بمدرسة {اسم_المدرسة}. نرجو المتابعة وحثه على المواظبة وفق شروط الالتحاق.'
  },
  {
    id: 'tpl_late',
    type: 'late',
    name: 'تنبيه تأخر سداد الاشتراك',
    template: 'السلام عليكم ورحمة الله، ولي أمر الطالب {اسم_الطالب} المحترم، نود تذكيركم بوجوب سداد الاشتراك الشهري بقيمة {المبلغ} ج عن شهر {الشهر} قبل انتهاء فترة السماح، تفادياً لتطبيق لوائح تعليق الحضور بمدرسة {اسم_المدرسة}.'
  },
  {
    id: 'tpl_summon_l1',
    type: 'summon_l1',
    name: 'استدعاء ولي أمر — مستوى 1 (6 غيابات)',
    template: 'هام وعاجل: ولي أمر الطالب {اسم_الطالب} المحترم، نلفت عنايتكم لتسجيل الطالب (6 غيابات) هذا الشهر، وبناء على لائحة الانضباط تم تعليق دخوله للحلقات لحين حضوركم الكريم لمقر مدرسة {اسم_المدرسة}.'
  },
  {
    id: 'tpl_summon_l2',
    type: 'summon_l2',
    name: 'استدعاء ولي أمر وغرامة — مستوى 2 (8 غيابات)',
    template: 'إنذار ثانٍ: ولي أمر الطالب {اسم_الطالب}، بلغ غياب نجلكم (8 غيابات)، وترتب على ذلك فرض غرامة انضباط 50 ج وتعليق الدخول لحين الحضور وسداد الغرامة وفق لائحة {اسم_المدرسة}.'
  },
  {
    id: 'tpl_suspension',
    type: 'suspension',
    name: 'إشعار فصل مؤقت — مستوى 3 (10 غيابات)',
    template: 'قرار إداري: نود إحاطتكم بصدور قرار الفصل المؤقت للطالب {اسم_الطالب} لمدة شهرين لتجاوزه 10 حصص غياب وفق شروط الالتحاق بـ {اسم_المدرسة}.'
  }
];

export const initialMessageLogs: MessageLog[] = [];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'al1',
    userId: 'u1',
    userName: 'الشيخ سعيد عثمان',
    action: 'تهيئة المنصة',
    details: 'تهيئة نظام مدرسة السعيد القرآنية وبدء العمل بقاعدة بيانات Supabase السحابية الحقيقية',
    timestamp: new Date().toISOString()
  }
];

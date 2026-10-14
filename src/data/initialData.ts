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

// 1. الفروع الأساسية (مفرغة إلا من الفرع الرئيسي)
export const initialBranches: Branch[] = [
  { 
    id: 'b1', 
    name: 'الفرع الرئيسي — مدرسة السعيد', 
    address: 'المقر الرئيسي', 
    phone: '', 
    managerName: 'م/ أحمد نادي',
    city: '',
    capacity: 200,
    establishedDate: new Date().toISOString().split('T')[0],
    notes: 'المقر الرئيسي لإدارة الحلقات والمنصة',
    active: true 
  }
];

// 2. حسابات المستخدمين (حسابك كمدير رئيسي فقط)
export const initialUsers: User[] = [
  { 
    id: 'u1', 
    username: 'admin', 
    fullName: 'م/ أحمد نادي', 
    role: 'admin', 
    branchIds: ['all'], 
    phone: '', 
    password: 'admin', 
    active: true 
  }
];

// 3. الأقسام (التحفيظ واللقاء التربوي فقط)
export const initialDepartments: Department[] = [
  { id: 'tahfeez', code: 'THF', name: 'قسم التحفيظ القرآني', pointsPerSession: 1, active: true },
  { id: 'tarbawi', code: 'TRB', name: 'قسم لقاء الجمعة (التربوي)', pointsPerSession: 1, active: true }
];

// 4. المعلمون (مفرغة للبيانات الحقيقية)
export const initialTeachers: Teacher[] = [];

// 5. المجموعات والحلقات (مفرغة للبيانات الحقيقية)
export const initialGroups: Group[] = [];

// 6. الأسر والطلاب (مفرغة)
export const initialFamilies: Family[] = [];
export const initialStudents: Student[] = [];

// 7. حالات الانضباط والرسوم (مفرغة)
export const initialDisciplineCases: DisciplineCase[] = [];

export const defaultFeePlans = [
  { stage: 'primary' as const, stageNameAr: 'المرحلة الابتدائية', monthlyAmount: 50, dueDay: 10, graceDays: 5 },
  { stage: 'prep' as const, stageNameAr: 'المرحلة الإعدادية', monthlyAmount: 65, dueDay: 10, graceDays: 5 },
  { stage: 'secondary_up' as const, stageNameAr: 'المرحلة الثانوية فما فوق', monthlyAmount: 80, dueDay: 10, graceDays: 5 },
];

// 8. إعدادات المنصة المحدثة باسمك
export const initialSettings: SchoolSettings = {
  associationName: 'مدرسة السعيد للقرآن الكريم',
  schoolName: 'منصة السعيد',
  logoUrl: OFFICIAL_SCHOOL_LOGO || '/school_logo.jpg',
  phone: '',
  email: '',
  address: 'المقر الرئيسي',
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
  termsText: `شروط الالتحاق بمدرسة السعيد للقرآن الكريم:
1. الالتزام بمنهج المدرسة القائم على الكتاب والسنة المطهرة.
2. الالتزام بالحضور المنتظم في الحلقات واللقاءات التربوية.
3. لا يُقبل الغياب إلا لعذر قهري يقدم كتابة للمشرف.
4. الالتزام بالسداد الدوري والسمت الطيب داخل أروقة المدرسة.`
};

export const initialDues: Due[] = [];
export const initialPayments: Payment[] = [];

// 9. عناوين المتجر (يمكنك تفريغها إذا أردت بوضع [] )
export const initialStoreItems: StoreItem[] = [
  { id: 'item1', branchId: 'b1', name: 'دفتر المتابعة والواجبات', type: 'notebook', unitPrice: 15, stock: 100, active: true },
  { id: 'mushaf1', branchId: 'b1', name: 'مصحف الحفظ الملون', type: 'mushaf', unitPrice: 75, stock: 50, active: true },
];

export const initialSales: Sale[] = [];

// 10. الجوائز والنقاط
export const initialRewards: Reward[] = [
  { id: 'rw1', title: 'هدية تحفيزية تشجيعية', threshold: 20, description: 'أدوات مدرسية تشجيعاً للمواظبة', active: true },
  { id: 'rw2', title: 'مصحف التجويد وشهادة تقدير', threshold: 40, description: 'شهادة تقدير مع جائزة عينية', active: true },
];

export const initialRewardGrants: RewardGrant[] = [];
export const initialStudentAttendance: StudentAttendance[] = [];
export const initialPointsLedger: PointsEntry[] = [];
export const initialTeacherAttendance: TeacherAttendance[] = [];
export const initialStudentNotes: StudentNote[] = [];

// 11. قوالب رسائل الواتساب العامة
export const initialMessageTemplates: MessageTemplate[] = [
  {
    id: 'tpl_absent',
    type: 'absent',
    name: 'تنبيه غياب يومي',
    template: 'السلام عليكم ورحمة الله وبركاته، ولي أمر الطالب {اسم_الطالب} الكريم، نحيطكم علماً بتغيب نجلكم اليوم {التاريخ} عن حلقة {المجموعة} بمدرسة {اسم_المدرسة}.'
  },
  {
    id: 'tpl_late',
    type: 'late',
    name: 'تنبيه تأخر سداد الاشتراك',
    template: 'السلام عليكم ورحمة الله، ولي أمر الطالب {اسم_الطالب} المحترم، نود تذكيركم بوجوب سداد الاشتراك الشهري بقيمة {المبلغ} ج عن شهر {الشهر}.'
  }
];

export const initialMessageLogs: MessageLog[] = [];

// 12. سجل الأحداث الأولي باسمك
export const initialAuditLogs: AuditLog[] = [
  {
    id: 'al1',
    userId: 'u1',
    userName: 'م/ أحمد نادي',
    action: 'تهيئة المنصة',
    details: 'تهيئة نظام منصة السعيد وتدشين العمل بقاعدة البيانات الحقيقية',
    timestamp: new Date().toISOString()
  }
];

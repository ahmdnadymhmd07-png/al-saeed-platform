export type UserRole = 
  | 'admin'                  // المدير والأعضاء
  | 'finance'                // مشرفة التحصيل المالي
  | 'data_entry'             // مدخلة البيانات
  | 'attendance_supervisor'  // مشرفة الغياب
  | 'board';                 // عضو إدارة

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  roleCustomTitle?: string;
  branchIds: string[]; // ['all'] or specific IDs like ['b1', 'b2']
  allowedModules?: string[]; // ['dashboard', 'students', 'student_attendance', 'teacher_attendance', 'finance', 'points', 'discipline', 'whatsapp', 'reports', 'settings', 'branches']
  phone?: string;
  password?: string;
  active: boolean;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  managerName?: string;
  city?: string;
  capacity?: number;
  establishedDate?: string;
  notes?: string;
  active: boolean;
}

export interface Department {
  id: string; // 'tahfeez' | 'tarbawi' | custom
  code: string;
  name: string;
  pointsPerSession: number;
  active: boolean;
}

export interface Teacher {
  id: string;
  fullName: string;
  phone: string;
  branchId: string;
  departmentIds: string[];
  active: boolean;
  notes?: string;
}

export interface Group {
  id: string;
  name: string;
  departmentId: string;
  branchId: string;
  teacherId: string;
  days: string[]; // e.g. ['السبت', 'الاثنين', 'الأربعاء'] or ['الجمعة']
  startTime: string; // '15:00'
  endTime: string;   // '17:30'
  capacity?: number;
  year: string;
  active: boolean;
}

export type EducationalStage = 'primary' | 'prep' | 'secondary_up';

export type StudentStatus = 'active' | 'dropped' | 'suspended' | 'left';

export type FeeMode = 'normal' | 'discount' | 'exempt';

export type AttendanceStatus = 'present' | 'absent' | 'excused';

export interface Student {
  id: string;
  branchId: string;
  fullName: string; // 4-part name
  gender?: 'male' | 'female';
  grade: string;    // الصف الثالث الابتدائي، إلخ
  stage: EducationalStage;
  guardianPhone: string; // formatted +201...
  isOrphan: boolean;
  feeMode: FeeMode;
  feeDiscountAmount: number;
  feeReason?: string;
  familyId?: string; // used for sibling discount
  joinDate: string;
  notes?: string;
  status: StudentStatus;
  droppedReason?: string;
  droppedDate?: string;
  agreementAccepted: boolean;
  agreementDate: string;
  // Enrolled groups for the two core departments:
  tahfeezGroupId: string;
  tarbawiGroupId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Family {
  id: string;
  familyName: string;
  guardianPhone: string;
  note?: string;
}

export interface StudentAttendance {
  id: string;
  branchId: string;
  studentId: string;
  departmentId: string;
  groupId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  excuseReason?: string;
  enteredBy: string;
  createdAt: string;
}

export type TeacherAttendanceSource = 'register' | 'qr' | 'fingerprint';

export interface TeacherAttendance {
  id: string;
  branchId: string;
  teacherId: string;
  date: string;
  status: 'present' | 'absent' | 'excused';
  checkIn?: string;  // HH:MM
  checkOut?: string; // HH:MM
  lateMinutes: number;
  earlyLeaveMinutes: number;
  workedMinutes: number;
  excuseReason?: string;
  source: TeacherAttendanceSource;
  enteredBy: string;
  createdAt: string;
}

export type DisciplineStatus = 'open' | 'guardian_attended' | 'closed' | 'suspended' | 'needs_review';

export interface DisciplineCase {
  id: string;
  branchId: string;
  studentId: string;
  month: string; // YYYY-MM
  level: 1 | 2 | 3;
  status: DisciplineStatus;
  absenceCount: number;
  guardianAttendedAt?: string;
  guardianName?: string;
  fineDueId?: string;
  suspendedFrom?: string;
  suspendedTo?: string;
  note?: string;
  closedBy?: string;
  exceptionalUnbanReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type NoteType = 'appearance' | 'behavior' | 'guardian_contact';

export interface StudentNote {
  id: string;
  studentId: string;
  type: NoteType;
  text: string;
  date: string;
  userId: string;
  userName: string;
}

export interface FeePlan {
  stage: EducationalStage;
  stageNameAr: string;
  monthlyAmount: number;
  dueDay: number;
  graceDays: number;
}

export type DueKind = 'subscription' | 'fine';

export interface Due {
  id: string;
  branchId: string;
  studentId: string;
  month: string; // YYYY-MM
  kind: DueKind;
  grossAmount: number;
  orphanDiscount: number;
  siblingDiscount: number;
  amount: number; // net amount to pay
  paidAmount: number;
  status: 'paid' | 'partial' | 'unpaid';
  disciplineCaseId?: string;
  dueDate: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  branchId: string;
  dueId: string;
  studentId: string;
  amount: number;
  date: string;
  method: 'cash' | 'vodafone_cash' | 'bank_transfer' | 'fawry';
  receiptNo: string;
  userId: string;
  userName: string;
  notes?: string;
}

export interface StoreItem {
  id: string;
  branchId: string;
  name: string;
  type: 'book' | 'notebook' | 'mushaf' | 'other';
  unitPrice: number;
  stock: number;
  description?: string;
  active: boolean;
}

export interface Sale {
  id: string;
  branchId: string;
  itemId: string;
  itemName: string;
  studentId?: string;
  studentName?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  date: string;
  receiptNo: string;
  userId: string;
}

export interface PointsEntry {
  id: string;
  studentId: string;
  departmentId?: string;
  points: number;
  reason: 'attendance' | 'bonus' | 'redeem';
  sourceAttendanceId?: string;
  note?: string;
  date: string;
}

export interface Reward {
  id: string;
  title: string;
  threshold: number;
  description: string;
  active: boolean;
}

export interface RewardGrant {
  id: string;
  studentId: string;
  rewardId: string;
  rewardTitle: string;
  pointsCost: number;
  earnedAt: string;
  delivered: boolean;
  deliveredAt?: string;
  deliveredBy?: string;
}

export interface MessageTemplate {
  id: string;
  type: 'absent' | 'late' | 'summon_l1' | 'summon_l2' | 'suspension';
  name: string;
  template: string;
}

export interface MessageLog {
  id: string;
  studentId: string;
  studentName: string;
  phone: string;
  type: string;
  text: string;
  sentAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface SchoolSettings {
  associationName: string;
  schoolName: string;
  logoUrl: string;
  phone: string;
  email: string;
  address: string;
  feePlans: FeePlan[];
  siblingDiscountAmount: number;
  absenceThresholds: {
    level1: number; // 6
    level2: number; // 8
    level3: number; // 10
  };
  absenceFineAmount: number; // 50
  suspensionMonths: number;  // 2
  dueDay: number;            // 10
  graceDays: number;         // 5
  sendExcusedAbsentWhatsApp: boolean;
  termsText: string;
  reportHeaderTitle?: string;
  reportSubtitle?: string;
  reportShowLogo?: boolean;
  reportFooterNotes?: string;
  reportSupervisorTitle?: string;
  reportFinanceTitle?: string;
  reportDirectorTitle?: string;
  reportStampText?: string;
  reportGateNotes?: string;
}

export interface StudentBanInfo {
  isBanned: boolean;
  reasons: string[];
  type?: 'discipline_l1' | 'discipline_l2' | 'discipline_l3' | 'unpaid_due';
  details?: string;
}

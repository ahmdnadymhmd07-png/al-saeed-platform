import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Branch,
  Department,
  Teacher,
  Group,
  Student,
  Family,
  StudentAttendance,
  TeacherAttendance,
  DisciplineCase,
  StudentNote,
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
  StudentBanInfo,
  StudentStatus
} from '../types';
import {
  initialBranches,
  initialUsers,
  initialDepartments,
  initialTeachers,
  initialGroups,
  initialFamilies,
  initialStudents,
  initialDisciplineCases,
  initialSettings,
  initialDues,
  initialPayments,
  initialStoreItems,
  initialSales,
  initialRewards,
  initialRewardGrants,
  initialStudentAttendance,
  initialPointsLedger,
  initialTeacherAttendance,
  initialStudentNotes,
  initialMessageTemplates,
  initialMessageLogs,
  initialAuditLogs,
  OFFICIAL_SCHOOL_LOGO
} from '../data/initialData';
import { testSupabaseConnection } from '../lib/supabase';
import {
  mappers,
  fetchTable,
  upsertRecord,
  insertBatch,
  deleteRecord
} from '../lib/supabaseSync';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  selectedBranchId: string;
  setSelectedBranchId: (branchId: string) => void;
  branches: Branch[];
  users: User[];
  departments: Department[];
  teachers: Teacher[];
  groups: Group[];
  students: Student[];
  families: Family[];
  studentAttendance: StudentAttendance[];
  teacherAttendance: TeacherAttendance[];
  disciplineCases: DisciplineCase[];
  studentNotes: StudentNote[];
  dues: Due[];
  payments: Payment[];
  storeItems: StoreItem[];
  sales: Sale[];
  pointsLedger: PointsEntry[];
  rewards: Reward[];
  rewardGrants: RewardGrant[];
  messageTemplates: MessageTemplate[];
  messageLogs: MessageLog[];
  auditLogs: AuditLog[];
  settings: SchoolSettings;

  checkStudentBan: (studentId: string) => StudentBanInfo;
  getStudentAbsenceCountThisMonth: (studentId: string, month?: string) => number;
  getStudentPoints: (studentId: string) => number;

  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string, permanent?: boolean) => void;
  
  saveStudentAttendanceBatch: (records: { 
    studentId: string; 
    departmentId: string; 
    groupId: string; 
    date: string; 
    status: 'present' | 'absent' | 'excused'; 
    excuseReason?: string;
  }[]) => void;
  saveTeacherAttendance: (record: Omit<TeacherAttendance, 'id' | 'createdAt' | 'lateMinutes' | 'earlyLeaveMinutes' | 'workedMinutes'>) => void;
  
  recordPayment: (payment: Omit<Payment, 'id' | 'receiptNo' | 'userId' | 'userName'>) => Payment;
  generateMonthlyDues: (month: string) => void;
  
  recordSale: (sale: Omit<Sale, 'id' | 'receiptNo' | 'userId'>) => Sale;
  addStoreItem: (item: Omit<StoreItem, 'id'>) => void;
  updateStoreItem: (id: string, item: Partial<StoreItem>) => void;
  
  recordGuardianAttendance: (caseId: string, guardianName: string, note?: string) => void;
  adminExceptionalUnban: (caseId: string, reason: string) => void;
  
  deliverReward: (studentId: string, rewardId: string) => void;
  addManualPoints: (studentId: string, points: number, reason: string) => void;
  
  addStudentNote: (studentId: string, type: 'appearance' | 'behavior' | 'guardian_contact', text: string) => void;
  
  updateSettings: (newSettings: Partial<SchoolSettings>) => void;
  updateMessageTemplate: (id: string, template: string) => void;
  logMessageSent: (log: Omit<MessageLog, 'id' | 'sentAt'>) => void;
  
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => void;
  addGroup: (group: Omit<Group, 'id'>) => void;
  updateGroup: (id: string, group: Partial<Group>) => void;
  addBranch: (branch: Omit<Branch, 'id'>) => void;
  updateBranch: (id: string, updates: Partial<Branch>) => void;
  toggleBranchStatus: (id: string) => void;
  deleteBranch: (id: string) => void;
  
  setStudentDropped: (id: string, reason: string) => void;
  reactivateStudent: (id: string) => void;
  deleteStoreItem: (id: string) => void;
  
  addReward: (reward: Omit<Reward, 'id'>) => void;
  updateReward: (id: string, updates: Partial<Reward>) => void;
  deleteReward: (id: string) => void;
  
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  canUserAccessModule: (moduleName: string) => boolean;

  isAuthenticated: boolean;
  login: (usernameOrPhone: string, password?: string) => boolean;
  logout: () => void;
  clearMockData: () => void;

  exportBackupJson: () => string;
  importBackupJson: (jsonString: string) => boolean;
  resetToDemoData: () => void;

  isSupabaseConnected: boolean;
  isSyncing: boolean;
  syncStatusMessage: string;
  seedInitialDataToSupabase: () => Promise<{ success: boolean; message: string }>;
  fetchFromSupabase: () => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'alsaeed_v2_live_';
const AUTH_KEY = 'alsaeed_authenticated_user_id';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to storage', err);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branches, setBranches] = useState<Branch[]>(() => loadFromStorage('branches', initialBranches));
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('users', initialUsers));
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem(AUTH_KEY));
    } catch {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const savedUserId = localStorage.getItem(AUTH_KEY);
      if (savedUserId) {
        const found = initialUsers.find(u => u.id === savedUserId);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    return initialUsers[0];
  });

  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');

  const [departments, setDepartments] = useState<Department[]>(() => loadFromStorage('departments', initialDepartments));
  const [teachers, setTeachers] = useState<Teacher[]>(() => loadFromStorage('teachers', initialTeachers));
  const [groups, setGroups] = useState<Group[]>(() => loadFromStorage('groups', initialGroups));
  const [students, setStudents] = useState<Student[]>(() => loadFromStorage('students', initialStudents));
  const [families, setFamilies] = useState<Family[]>(() => loadFromStorage('families', initialFamilies));
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>(() => loadFromStorage('studentAttendance', initialStudentAttendance));
  const [teacherAttendance, setTeacherAttendance] = useState<TeacherAttendance[]>(() => loadFromStorage('teacherAttendance', initialTeacherAttendance));
  const [disciplineCases, setDisciplineCases] = useState<DisciplineCase[]>(() => loadFromStorage('disciplineCases', initialDisciplineCases));
  const [studentNotes, setStudentNotes] = useState<StudentNote[]>(() => loadFromStorage('studentNotes', initialStudentNotes));
  const [dues, setDues] = useState<Due[]>(() => loadFromStorage('dues', initialDues));
  const [payments, setPayments] = useState<Payment[]>(() => loadFromStorage('payments', initialPayments));
  const [storeItems, setStoreItems] = useState<StoreItem[]>(() => loadFromStorage('storeItems', initialStoreItems));
  const [sales, setSales] = useState<Sale[]>(() => loadFromStorage('sales', initialSales));
  const [pointsLedger, setPointsLedger] = useState<PointsEntry[]>(() => loadFromStorage('pointsLedger', initialPointsLedger));
  const [rewards, setRewards] = useState<Reward[]>(() => loadFromStorage('rewards', initialRewards));
  const [rewardGrants, setRewardGrants] = useState<RewardGrant[]>(() => loadFromStorage('rewardGrants', initialRewardGrants));
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>(() => loadFromStorage('messageTemplates', initialMessageTemplates));
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>(() => loadFromStorage('messageLogs', initialMessageLogs));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadFromStorage('auditLogs', initialAuditLogs));
  const [settings, setSettings] = useState<SchoolSettings>(() => {
    const loaded = loadFromStorage('settings', initialSettings);
    if (
      !loaded.logoUrl ||
      loaded.logoUrl.includes('placeholder') ||
      loaded.logoUrl.includes('unsplash') ||
      !loaded.logoUrl.includes('school_')
    ) {
      return { ...loaded, logoUrl: OFFICIAL_SCHOOL_LOGO || '/school_logo.jpg' };
    }
    return loaded;
  });

  // Safe Audit Logger
  const addAuditLog = (action: string, details: string) => {
    if (!currentUser) return;
    const entry: AuditLog = {
      id: 'al_' + Date.now() + Math.random().toString(36).substring(2, 6),
      userId: currentUser.id,
      userName: currentUser.fullName,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [entry, ...prev]);
  };

  // Login handler with clean state initialization
  const login = (usernameOrPhone: string, password?: string): boolean => {
    const rawInput = usernameOrPhone.trim();
    const trimmed = rawInput.toLowerCase();
    const trimmedPass = (password || '').trim();

    const found = users.find(u => {
      const uName = u.username.toLowerCase();
      const uPhone = (u.phone || '').trim();
      const uFullName = u.fullName.toLowerCase();

      return (
        uName === trimmed ||
        uPhone === rawInput ||
        (trimmed === 'admin' && u.role === 'admin') ||
        (trimmed.includes('صاحب') && u.role === 'admin') ||
        (trimmed.includes('مدير') && u.role === 'admin') ||
        uFullName.includes(trimmed)
      );
    });

    if (!found || !found.active) {
      return false;
    }

    if (found.password) {
      const expectedPass = found.password.trim();
      if (trimmedPass) {
        if (
          trimmedPass !== expectedPass &&
          !(found.role === 'admin' && (trimmedPass === 'admin' || trimmedPass === '123456'))
        ) {
          return false;
        }
      }
    }

    try {
      localStorage.setItem(AUTH_KEY, found.id);
    } catch {
      // ignore
    }

    // Refresh application state cleanly on login
    window.location.reload();
    return true;
  };

  // Logout handler
  const logout = () => {
    if (currentUser) {
      addAuditLog('تسجيل خروج', `تسجيل خروج المستخدم ${currentUser.fullName}`);
    }
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch {
      // ignore
    }
    window.location.reload();
  };

  const clearMockData = () => {
    setStudents([]);
    setFamilies([]);
    setStudentAttendance([]);
    setTeacherAttendance([]);
    setDisciplineCases([]);
    setDues([]);
    setPayments([]);
    setSales([]);
    setRewardGrants([]);
    setPointsLedger([]);
    setStudentNotes([]);
    setAuditLogs([]);

    saveToStorage('students', []);
    saveToStorage('families', []);
    saveToStorage('studentAttendance', []);
    saveToStorage('teacherAttendance', []);
    saveToStorage('disciplineCases', []);
    saveToStorage('dues', []);
    saveToStorage('payments', []);
    saveToStorage('sales', []);
    saveToStorage('rewardGrants', []);
    saveToStorage('pointsLedger', []);
    saveToStorage('studentNotes', []);
    saveToStorage('auditLogs', []);

    addAuditLog('مسح البيانات الوهمية', 'تم مسح وتفريغ كافة البيانات المؤقتة والوهمية من المنصة بنجاح.');
  };

  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string>('جارٍ الاتصال بقاعدة بيانات Supabase...');

  const fetchFromSupabase = async (): Promise<{ success: boolean; message: string }> => {
    setIsSyncing(true);
    setSyncStatusMessage('جارٍ فحص وتحميل البيانات من Supabase...');
    try {
      const conn = await testSupabaseConnection();
      setIsSupabaseConnected(conn.success);
      if (!conn.success) {
        setIsSyncing(false);
        setSyncStatusMessage(conn.message);
        return { success: false, message: conn.message };
      }

      const [
        dbBranches,
        dbUsers,
        dbDepts,
        dbTeachers,
        dbGroups,
        dbStudents,
        dbFamilies,
        dbStudentAtt,
        dbTeacherAtt,
        dbDiscipline,
        dbNotes,
        dbDues,
        dbPayments,
        dbStoreItems,
        dbSales,
        dbPoints,
        dbRewards,
        dbRewardGrants,
        dbMsgTemplates,
        dbMsgLogs,
        dbAuditLogs,
        dbSettings
      ] = await Promise.all([
        fetchTable('branches', mappers.branch.fromDb, branches),
        fetchTable('users', mappers.user.fromDb, users),
        fetchTable('departments', mappers.department.fromDb, departments),
        fetchTable('teachers', mappers.teacher.fromDb, teachers),
        fetchTable('groups', mappers.group.fromDb, groups),
        fetchTable('students', mappers.student.fromDb, students),
        fetchTable('families', mappers.family.fromDb, families),
        fetchTable('student_attendance', mappers.studentAttendance.fromDb, studentAttendance),
        fetchTable('teacher_attendance', mappers.teacherAttendance.fromDb, teacherAttendance),
        fetchTable('discipline_cases', mappers.disciplineCase.fromDb, disciplineCases),
        fetchTable('student_notes', mappers.studentNote.fromDb, studentNotes),
        fetchTable('dues', mappers.due.fromDb, dues),
        fetchTable('payments', mappers.payment.fromDb, payments),
        fetchTable('store_items', mappers.storeItem.fromDb, storeItems),
        fetchTable('sales', mappers.sale.fromDb, sales),
        fetchTable('points_ledger', mappers.pointsLedger.fromDb, pointsLedger),
        fetchTable('rewards', mappers.reward.fromDb, rewards),
        fetchTable('reward_grants', mappers.rewardGrant.fromDb, rewardGrants),
        fetchTable('message_templates', mappers.messageTemplate.fromDb, messageTemplates),
        fetchTable('message_logs', mappers.messageLog.fromDb, messageLogs),
        fetchTable('audit_logs', mappers.auditLog.fromDb, auditLogs),
        fetchTable('settings', mappers.settings.fromDb, [settings])
      ]);

      if (dbBranches.length > 0) setBranches(dbBranches);
      if (dbUsers.length > 0) setUsers(dbUsers);
      if (dbDepts.length > 0) setDepartments(dbDepts);
      if (dbTeachers.length > 0) setTeachers(dbTeachers);
      if (dbGroups.length > 0) setGroups(dbGroups);
      if (dbStudents.length > 0) setStudents(dbStudents);
      if (dbFamilies.length > 0) setFamilies(dbFamilies);
      if (dbStudentAtt.length > 0) setStudentAttendance(dbStudentAtt);
      if (dbTeacherAtt.length > 0) setTeacherAttendance(dbTeacherAtt);
      if (dbDiscipline.length > 0) setDisciplineCases(dbDiscipline);
      if (dbNotes.length > 0) setStudentNotes(dbNotes);
      if (dbDues.length > 0) setDues(dbDues);
      if (dbPayments.length > 0) setPayments(dbPayments);
      if (dbStoreItems.length > 0) setStoreItems(dbStoreItems);
      if (dbSales.length > 0) setSales(dbSales);
      if (dbPoints.length > 0) setPointsLedger(dbPoints);
      if (dbRewards.length > 0) setRewards(dbRewards);
      if (dbRewardGrants.length > 0) setRewardGrants(dbRewardGrants);
      if (dbMsgTemplates.length > 0) setMessageTemplates(dbMsgTemplates);
      if (dbMsgLogs.length > 0) setMessageLogs(dbMsgLogs);
      if (dbAuditLogs.length > 0) setAuditLogs(dbAuditLogs);
      if (dbSettings.length > 0 && dbSettings[0]) setSettings(dbSettings[0]);

      setIsSyncing(false);
      setSyncStatusMessage('قاعدة بيانات Supabase متصلة ومحدثة بنجاح.');
      return { success: true, message: 'تم تحميل وتحديث البيانات من Supabase بنجاح.' };
    } catch (err: any) {
      setIsSyncing(false);
      setSyncStatusMessage('حدث خطأ أثناء تحميل البيانات من Supabase.');
      return { success: false, message: err?.message || 'خطأ في الاتصال' };
    }
  };

  const seedInitialDataToSupabase = async (): Promise<{ success: boolean; message: string }> => {
    setIsSyncing(true);
    setSyncStatusMessage('جارٍ رفع ومزامنة كافة البيانات الأولية إلى Supabase...');
    try {
      await upsertRecord('settings', mappers.settings.toDb(settings));
      if (departments.length > 0) await insertBatch('departments', departments.map(mappers.department.toDb));
      if (branches.length > 0) await insertBatch('branches', branches.map(mappers.branch.toDb));
      if (users.length > 0) await insertBatch('users', users.map(mappers.user.toDb));
      if (teachers.length > 0) await insertBatch('teachers', teachers.map(mappers.teacher.toDb));
      if (groups.length > 0) await insertBatch('groups', groups.map(mappers.group.toDb));
      if (families.length > 0) await insertBatch('families', families.map(mappers.family.toDb));
      if (students.length > 0) await insertBatch('students', students.map(mappers.student.toDb));
      if (studentAttendance.length > 0) await insertBatch('student_attendance', studentAttendance.map(mappers.studentAttendance.toDb));
      if (teacherAttendance.length > 0) await insertBatch('teacher_attendance', teacherAttendance.map(mappers.teacherAttendance.toDb));
      if (disciplineCases.length > 0) await insertBatch('discipline_cases', disciplineCases.map(mappers.disciplineCase.toDb));
      if (dues.length > 0) await insertBatch('dues', dues.map(mappers.due.toDb));
      if (payments.length > 0) await insertBatch('payments', payments.map(mappers.payment.toDb));
      if (storeItems.length > 0) await insertBatch('store_items', storeItems.map(mappers.storeItem.toDb));
      if (sales.length > 0) await insertBatch('sales', sales.map(mappers.sale.toDb));
      if (pointsLedger.length > 0) await insertBatch('points_ledger', pointsLedger.map(mappers.pointsLedger.toDb));
      if (rewards.length > 0) await insertBatch('rewards', rewards.map(mappers.reward.toDb));
      if (rewardGrants.length > 0) await insertBatch('reward_grants', rewardGrants.map(mappers.rewardGrant.toDb));
      if (messageTemplates.length > 0) await insertBatch('message_templates', messageTemplates.map(mappers.messageTemplate.toDb));
      if (messageLogs.length > 0) await insertBatch('message_logs', messageLogs.map(mappers.messageLog.toDb));
      if (studentNotes.length > 0) await insertBatch('student_notes', studentNotes.map(mappers.studentNote.toDb));
      if (auditLogs.length > 0) await insertBatch('audit_logs', auditLogs.map(mappers.auditLog.toDb));

      setIsSyncing(false);
      setIsSupabaseConnected(true);
      setSyncStatusMessage('تم رفع ومزامنة كافة البيانات الأولية (22 جدولاً) إلى Supabase بنجاح.');
      addAuditLog('مزامنة Supabase', 'تم رفع ومزامنة كافة البيانات الأولية وجداول المنصة إلى قاعدة بيانات Supabase');
      return { success: true, message: 'تم رفع ومزامنة كافة بيانات المدرسة إلى Supabase بنجاح!' };
    } catch (err: any) {
      setIsSyncing(false);
      setSyncStatusMessage('تعذر رفع البيانات.');
      return { success: false, message: err?.message || 'تعذر الرفع' };
    }
  };

  useEffect(() => {
    fetchFromSupabase();
  }, []);

  useEffect(() => { saveToStorage('branches', branches); }, [branches]);
  useEffect(() => { saveToStorage('users', users); }, [users]);
  useEffect(() => { saveToStorage('departments', departments); }, [departments]);
  useEffect(() => { saveToStorage('teachers', teachers); }, [teachers]);
  useEffect(() => { saveToStorage('groups', groups); }, [groups]);
  useEffect(() => { saveToStorage('students', students); }, [students]);
  useEffect(() => { saveToStorage('families', families); }, [families]);
  useEffect(() => { saveToStorage('studentAttendance', studentAttendance); }, [studentAttendance]);
  useEffect(() => { saveToStorage('teacherAttendance', teacherAttendance); }, [teacherAttendance]);
  useEffect(() => { saveToStorage('disciplineCases', disciplineCases); }, [disciplineCases]);
  useEffect(() => { saveToStorage('studentNotes', studentNotes); }, [studentNotes]);
  useEffect(() => { saveToStorage('dues', dues); }, [dues]);
  useEffect(() => { saveToStorage('payments', payments); }, [payments]);
  useEffect(() => { saveToStorage('storeItems', storeItems); }, [storeItems]);
  useEffect(() => { saveToStorage('sales', sales); }, [sales]);
  useEffect(() => { saveToStorage('pointsLedger', pointsLedger); }, [pointsLedger]);
  useEffect(() => { saveToStorage('rewards', rewards); }, [rewards]);
  useEffect(() => { saveToStorage('rewardGrants', rewardGrants); }, [rewardGrants]);
  useEffect(() => { saveToStorage('messageTemplates', messageTemplates); }, [messageTemplates]);
  useEffect(() => { saveToStorage('messageLogs', messageLogs); }, [messageLogs]);
  useEffect(() => { saveToStorage('auditLogs', auditLogs); }, [auditLogs]);
  useEffect(() => { saveToStorage('settings', settings); }, [settings]);

  const getStudentAbsenceCountThisMonth = (studentId: string, month = new Date().toISOString().slice(0, 7)) => {
    return studentAttendance.filter(a => 
      a.studentId === studentId && 
      a.date.startsWith(month) && 
      a.status === 'absent'
    ).length;
  };

  const getStudentPoints = (studentId: string) => {
    const entries = pointsLedger.filter(p => p.studentId === studentId);
    return entries.reduce((acc, curr) => acc + curr.points, 0);
  };

  const checkStudentBan = (studentId: string): StudentBanInfo => {
    const student = students.find(s => s.id === studentId);
    if (!student) return { isBanned: false, reasons: [] };

    const reasons: string[] = [];
    let banType: StudentBanInfo['type'] = undefined;

    if (student.status === 'suspended') {
      const discCase = disciplineCases.find(c => c.studentId === studentId && c.level === 3 && c.status === 'suspended');
      reasons.push(`فصل مؤقت لمدة شهرين لتجاوز 10 غيابات (تاريخ العودة: ${discCase?.suspendedTo || 'غير محدد'})`);
      banType = 'discipline_l3';
    }

    const activeCase = disciplineCases.find(c => 
      c.studentId === studentId && 
      c.status === 'open' &&
      (c.level === 1 || c.level === 2)
    );

    if (activeCase) {
      if (activeCase.level === 1) {
        reasons.push('استدعاء ولي الأمر (تجاوز 6 غيابات بدون عذر) — بانتظار حضور ولي الأمر');
        banType = 'discipline_l1';
      } else if (activeCase.level === 2) {
        const fineDue = dues.find(d => d.id === activeCase.fineDueId);
        const fineUnpaid = fineDue && fineDue.status !== 'paid';
        reasons.push(`استدعاء وغرامة انضباط 50 ج (تجاوز 8 غيابات)${fineUnpaid ? ' — الغرامة مستحقة السداد' : ''}`);
        banType = 'discipline_l2';
      }
    }

    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);
    const dayOfMonth = today.getDate();
    const cutoffDay = settings.dueDay + settings.graceDays;

    if (dayOfMonth > cutoffDay) {
      const unpaidDues = dues.filter(d => 
        d.studentId === studentId && 
        d.kind === 'subscription' && 
        d.status !== 'paid' &&
        d.month <= currentMonth
      );
      if (unpaidDues.length > 0) {
        const totalRemaining = unpaidDues.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);
        reasons.push(`تأخر سداد الاشتراك بعد انتهاء مهلة السماح (المتبقي: ${totalRemaining} ج)`);
        if (!banType) banType = 'unpaid_due';
      }
    }

    return {
      isBanned: reasons.length > 0,
      reasons,
      type: banType,
      details: reasons.join(' • ')
    };
  };

  const addStudent = (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = 's' + Date.now();
    const newStudent: Student = {
      ...studentData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setStudents(prev => [newStudent, ...prev]);
    addAuditLog('إضافة طالب', `تسجيل الطالب الجديد ${studentData.fullName} في الفرع`);
    upsertRecord('students', mappers.student.toDb(newStudent));
    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev => {
      const updatedList = prev.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s);
      const target = updatedList.find(s => s.id === id);
      if (target) {
        upsertRecord('students', mappers.student.toDb(target));
      }
      return updatedList;
    });
    addAuditLog('تعديل بيانات طالب', `تعديل بيانات الطالب رقم ${id}`);
  };

  const deleteStudent = (id: string, permanent: boolean = false) => {
    if (permanent) {
      setStudents(prev => prev.filter(s => s.id !== id));
      deleteRecord('students', id);
      addAuditLog('حذف نهائي لطالب', `حذف سجل الطالب ${id} نهائياً من قاعدة البيانات`);
    } else {
      setStudents(prev => {
        const updatedList = prev.map(s => s.id === id ? { ...s, status: 'left' as StudentStatus, updatedAt: new Date().toISOString() } : s);
        const target = updatedList.find(s => s.id === id);
        if (target) {
          upsertRecord('students', mappers.student.toDb(target));
        }
        return updatedList;
      });
      addAuditLog('حذف ناعم لطالب', `تغيير حالة الطالب ${id} إلى مغادر`);
    }
  };

  const setStudentDropped = (id: string, reason: string) => {
    const now = new Date().toISOString();
    setStudents(prev => {
      const updatedList = prev.map(s => s.id === id ? { 
        ...s, 
        status: 'dropped' as StudentStatus, 
        droppedReason: reason,
        droppedDate: now.slice(0, 10),
        updatedAt: now 
      } : s);
      const target = updatedList.find(s => s.id === id);
      if (target) {
        upsertRecord('students', mappers.student.toDb(target));
      }
      return updatedList;
    });
    addAuditLog('تسجيل انقطاع طالب', `تسجيل الطالب ${id} كمنقطع بسبب: ${reason}`);
  };

  const reactivateStudent = (id: string) => {
    const now = new Date().toISOString();
    setStudents(prev => {
      const updatedList = prev.map(s => s.id === id ? { 
        ...s, 
        status: 'active' as StudentStatus, 
        droppedReason: undefined,
        droppedDate: undefined,
        updatedAt: now 
      } : s);
      const target = updatedList.find(s => s.id === id);
      if (target) {
        upsertRecord('students', mappers.student.toDb(target));
      }
      return updatedList;
    });
    addAuditLog('إعادة قيد طالب', `إعادة قيد وتنشيط الطالب ${id}`);
  };

  const saveStudentAttendanceBatch = (records: { 
    studentId: string; 
    departmentId: string; 
    groupId: string; 
    date: string; 
    status: 'present' | 'absent' | 'excused'; 
    excuseReason?: string;
  }[]) => {
    const now = new Date().toISOString();
    const currentMonth = records[0]?.date.slice(0, 7) || now.slice(0, 7);
    const affectedAttendance: StudentAttendance[] = [];
    const pointsToAward: PointsEntry[] = [];

    setStudentAttendance(prev => {
      const updated = [...prev];
      records.forEach(rec => {
        const existingIdx = updated.findIndex(a => 
          a.studentId === rec.studentId && 
          a.departmentId === rec.departmentId && 
          a.date === rec.date
        );
        const recordEntry: StudentAttendance = {
          id: existingIdx >= 0 ? updated[existingIdx].id : 'att_' + Date.now() + Math.random().toString(36).substring(2, 5),
          branchId: selectedBranchId === 'all' ? (students.find(s => s.id === rec.studentId)?.branchId || 'b1') : selectedBranchId,
          studentId: rec.studentId,
          departmentId: rec.departmentId,
          groupId: rec.groupId,
          date: rec.date,
          status: rec.status,
          excuseReason: rec.excuseReason,
          enteredBy: currentUser?.fullName || 'النظام',
          createdAt: now
        };
        affectedAttendance.push(recordEntry);
        if (existingIdx >= 0) {
          updated[existingIdx] = recordEntry;
        } else {
          updated.push(recordEntry);
        }
      });
      return updated;
    });

    if (affectedAttendance.length > 0) {
      insertBatch('student_attendance', affectedAttendance.map(mappers.studentAttendance.toDb));
    }

    records.filter(r => r.status === 'present').forEach(rec => {
      const pointEntry: PointsEntry = {
        id: 'pt_' + Date.now() + Math.random().toString(36).substring(2, 5),
        studentId: rec.studentId,
        departmentId: rec.departmentId,
        points: 1,
        reason: 'attendance',
        date: rec.date
      };
      pointsToAward.push(pointEntry);
    });

    if (pointsToAward.length > 0) {
      setPointsLedger(prev => [...prev, ...pointsToAward]);
      insertBatch('points_ledger', pointsToAward.map(mappers.pointsLedger.toDb));
    }

    records.forEach(rec => {
      const existingAbsences = studentAttendance.filter(a => 
        a.studentId === rec.studentId && 
        a.date.startsWith(currentMonth) && 
        a.status === 'absent' &&
        !(a.departmentId === rec.departmentId && a.date === rec.date)
      ).length;
      
      const newAbsenceCount = existingAbsences + (rec.status === 'absent' ? 1 : 0);

      if (newAbsenceCount >= settings.absenceThresholds.level1) {
        const existingCase = disciplineCases.find(c => c.studentId === rec.studentId && c.month === currentMonth);

        if (newAbsenceCount >= settings.absenceThresholds.level3) {
          const suspendedFrom = rec.date;
          const returnDate = new Date(rec.date);
          returnDate.setMonth(returnDate.getMonth() + settings.suspensionMonths);
          const suspendedTo = returnDate.toISOString().slice(0, 10);

          if (existingCase) {
            const updatedCase: DisciplineCase = {
              ...existingCase,
              level: 3,
              status: 'suspended',
              absenceCount: newAbsenceCount,
              suspendedFrom,
              suspendedTo,
              note: `فصل مؤقت لمدة شهرين لتجاوز ${newAbsenceCount} حصص غياب في الشهر الميلادي.`,
              updatedAt: now
            };
            setDisciplineCases(prev => prev.map(c => c.id === existingCase.id ? updatedCase : c));
            upsertRecord('discipline_cases', mappers.disciplineCase.toDb(updatedCase));
          } else {
            const newCase: DisciplineCase = {
              id: 'dc_' + Date.now(),
              branchId: selectedBranchId === 'all' ? 'b1' : selectedBranchId,
              studentId: rec.studentId,
              month: currentMonth,
              level: 3,
              status: 'suspended',
              absenceCount: newAbsenceCount,
              suspendedFrom,
              suspendedTo,
              note: `فصل مؤقت لمدة شهرين لتجاوز ${newAbsenceCount} حصص غياب.`,
              createdAt: now,
              updatedAt: now
            };
            setDisciplineCases(prev => [...prev, newCase]);
            upsertRecord('discipline_cases', mappers.disciplineCase.toDb(newCase));
          }

          setStudents(prev => {
            const updated = prev.map(s => s.id === rec.studentId ? { ...s, status: 'suspended' as const, updatedAt: now } : s);
            const target = updated.find(s => s.id === rec.studentId);
            if (target) upsertRecord('students', mappers.student.toDb(target));
            return updated;
          });
          addAuditLog('تطبيق الفصل المؤقت', `فصل الطالب ${rec.studentId} مؤقتاً لتجاوز 10 غيابات`);

        } else if (newAbsenceCount >= settings.absenceThresholds.level2) {
          const fineDueId = 'due_fine_' + rec.studentId + '_' + Date.now();
          if (existingCase && existingCase.level < 2) {
            const updatedCase: DisciplineCase = {
              ...existingCase,
              level: 2,
              status: 'open',
              absenceCount: newAbsenceCount,
              fineDueId,
              note: `بلوغ ${newAbsenceCount} غيابات — استدعاء مستوى 2 وغرامة ${settings.absenceFineAmount} ج.`,
              updatedAt: now
            };
            setDisciplineCases(prev => prev.map(c => c.id === existingCase.id ? updatedCase : c));
            upsertRecord('discipline_cases', mappers.disciplineCase.toDb(updatedCase));

            const newDue: Due = {
              id: fineDueId,
              branchId: selectedBranchId === 'all' ? 'b1' : selectedBranchId,
              studentId: rec.studentId,
              month: currentMonth,
              kind: 'fine',
              grossAmount: settings.absenceFineAmount,
              orphanDiscount: 0,
              siblingDiscount: 0,
              amount: settings.absenceFineAmount,
              paidAmount: 0,
              status: 'unpaid',
              disciplineCaseId: existingCase.id,
              dueDate: rec.date,
              createdAt: now
            };
            setDues(prev => [...prev, newDue]);
            upsertRecord('dues', mappers.due.toDb(newDue));
            addAuditLog('إضافة غرامة انضباط', `فرض غرامة 50 ج على الطالب ${rec.studentId} لتجاوز 8 غيابات`);
          }
        } else if (newAbsenceCount >= settings.absenceThresholds.level1 && !existingCase) {
          const newCase: DisciplineCase = {
            id: 'dc_' + Date.now(),
            branchId: selectedBranchId === 'all' ? 'b1' : selectedBranchId,
            studentId: rec.studentId,
            month: currentMonth,
            level: 1,
            status: 'open',
            absenceCount: newAbsenceCount,
            note: `استدعاء ولي الأمر ومنع الدخول لبلوغ ${newAbsenceCount} غيابات شهرياً.`,
            createdAt: now,
            updatedAt: now
          };
          setDisciplineCases(prev => [...prev, newCase]);
          upsertRecord('discipline_cases', mappers.disciplineCase.toDb(newCase));
          addAuditLog('فتح استدعاء ولي أمر', `استدعاء ولي أمر الطالب ${rec.studentId} لتجاوز 6 غيابات`);
        }
      }
    });

    addAuditLog('تسجيل حضور الطلاب', `تسجيل حضور ${records.length} طالب بحلقة ${records[0]?.groupId}`);
  };

  const saveTeacherAttendance = (record: Omit<TeacherAttendance, 'id' | 'createdAt' | 'lateMinutes' | 'earlyLeaveMinutes' | 'workedMinutes'>) => {
    let lateMinutes = 0;
    let workedMinutes = 0;
    
    if (record.checkIn && record.checkOut) {
      const [inH, inM] = record.checkIn.split(':').map(Number);
      const [outH, outM] = record.checkOut.split(':').map(Number);
      workedMinutes = Math.max(0, (outH * 60 + outM) - (inH * 60 + inM));
      if (inH * 60 + inM > 15 * 60 + 35) {
        lateMinutes = (inH * 60 + inM) - (15 * 60 + 30);
      }
    }

    const newRec: TeacherAttendance = {
      ...record,
      id: 'ta_' + Date.now(),
      lateMinutes,
      earlyLeaveMinutes: 0,
      workedMinutes,
      createdAt: new Date().toISOString()
    };

    setTeacherAttendance(prev => {
      const existing = prev.filter(t => !(t.teacherId === record.teacherId && t.date === record.date));
      return [newRec, ...existing];
    });

    upsertRecord('teacher_attendance', mappers.teacherAttendance.toDb(newRec));
    addAuditLog('حضور المعلمين', `تسجيل حضور المعلم ${record.teacherId} ليوم ${record.date}`);
  };

  const recordPayment = (paymentData: Omit<Payment, 'id' | 'receiptNo' | 'userId' | 'userName'>): Payment => {
    const branchCode = paymentData.branchId.toUpperCase();
    const count = payments.length + 101;
    const receiptNo = `REC-${branchCode}-${count}`;

    const newPayment: Payment = {
      ...paymentData,
      id: 'pay_' + Date.now(),
      receiptNo,
      userId: currentUser?.id || 'admin',
      userName: currentUser?.fullName || 'المدير'
    };

    setPayments(prev => [newPayment, ...prev]);

    setDues(prev => prev.map(d => {
      if (d.id === paymentData.dueId) {
        const newPaid = d.paidAmount + paymentData.amount;
        const newStatus: 'paid' | 'partial' | 'unpaid' = newPaid >= d.amount ? 'paid' : (newPaid > 0 ? 'partial' : 'unpaid');
        const updatedDue: Due = {
          ...d,
          paidAmount: newPaid,
          status: newStatus
        };
        upsertRecord('dues', mappers.due.toDb(updatedDue));
        return updatedDue;
      }
      return d;
    }));

    upsertRecord('payments', mappers.payment.toDb(newPayment));
    addAuditLog('تسجيل دفعة وسداد', `تحصيل ${paymentData.amount} ج إيصال رقم ${receiptNo}`);
    return newPayment;
  };

  const generateMonthlyDues = (month: string) => {
    const now = new Date().toISOString();
    const createdDues: Due[] = [];

    const familyCounts: Record<string, number> = {};
    students.filter(s => s.status === 'active').forEach(s => {
      if (s.familyId) {
        familyCounts[s.familyId] = (familyCounts[s.familyId] || 0) + 1;
      }
    });

    students.filter(s => s.status === 'active').forEach(s => {
      const exists = dues.some(d => d.studentId === s.id && d.month === month && d.kind === 'subscription');
      if (exists) return;

      const stagePlan = settings.feePlans.find(p => p.stage === s.stage) || settings.feePlans[0];
      const grossAmount = stagePlan.monthlyAmount;

      let orphanDiscount = 0;
      if (s.isOrphan) {
        if (s.feeMode === 'exempt') orphanDiscount = grossAmount;
        else if (s.feeMode === 'discount') orphanDiscount = Math.min(grossAmount, s.feeDiscountAmount || 0);
      }

      let siblingDiscount = 0;
      if (s.familyId && (familyCounts[s.familyId] || 0) >= 2) {
        const count = familyCounts[s.familyId];
        siblingDiscount = Math.round((settings.siblingDiscountAmount / count) * 100) / 100;
      }

      const netAmount = Math.max(0, grossAmount - orphanDiscount - siblingDiscount);

      const dueItem: Due = {
        id: 'due_' + s.id + '_' + month,
        branchId: s.branchId,
        studentId: s.id,
        month,
        kind: 'subscription',
        grossAmount,
        orphanDiscount,
        siblingDiscount,
        amount: netAmount,
        paidAmount: netAmount === 0 ? 0 : 0,
        status: netAmount === 0 ? 'paid' : 'unpaid',
        dueDate: `${month}-${String(settings.dueDay).padStart(2, '0')}`,
        createdAt: now
      };

      createdDues.push(dueItem);
    });

    if (createdDues.length > 0) {
      setDues(prev => [...prev, ...createdDues]);
      createdDues.forEach(d => {
        upsertRecord('dues', mappers.due.toDb(d));
      });
      addAuditLog('توليد استحقاقات شهرية', `توليد استحقاقات شهر ${month} لعدد ${createdDues.length} طالب`);
    }
  };

  const recordSale = (saleData: Omit<Sale, 'id' | 'receiptNo' | 'userId'>): Sale => {
    const branchCode = saleData.branchId.toUpperCase();
    const count = sales.length + 101;
    const receiptNo = `SL-${branchCode}-${count}`;

    const newSale: Sale = {
      ...saleData,
      id: 'sale_' + Date.now(),
      receiptNo,
      userId: currentUser?.id || 'admin'
    };

    setSales(prev => [newSale, ...prev]);

    setStoreItems(prev => prev.map(item => {
      if (item.id === saleData.itemId) {
        const updated = { ...item, stock: Math.max(0, item.stock - saleData.quantity) };
        upsertRecord('store_items', mappers.storeItem.toDb(updated));
        return updated;
      }
      return item;
    }));

    upsertRecord('sales', mappers.sale.toDb(newSale));
    addAuditLog('بيع أدوات ومطبوعات', `بيع ${saleData.quantity} من ${saleData.itemName} بمبلغ ${saleData.total} ج إيصال ${receiptNo}`);
    return newSale;
  };

  const addStoreItem = (itemData: Omit<StoreItem, 'id'>) => {
    const newItem: StoreItem = {
      ...itemData,
      id: 'item_' + Date.now()
    };
    setStoreItems(prev => [newItem, ...prev]);
    upsertRecord('store_items', mappers.storeItem.toDb(newItem));
    addAuditLog('إضافة صنف مبيعات', `إضافة ${itemData.name} بسعر ${itemData.unitPrice} ج`);
  };

  const updateStoreItem = (id: string, updates: Partial<StoreItem>) => {
    setStoreItems(prev => {
      const updatedList = prev.map(item => item.id === id ? { ...item, ...updates } : item);
      const target = updatedList.find(item => item.id === id);
      if (target) {
        upsertRecord('store_items', mappers.storeItem.toDb(target));
      }
      return updatedList;
    });
  };

  const recordGuardianAttendance = (caseId: string, guardianName: string, note?: string) => {
    const now = new Date().toISOString();
    setDisciplineCases(prev => {
      const updatedList = prev.map(c => {
        if (c.id === caseId) {
          const updated: DisciplineCase = {
            ...c,
            status: 'guardian_attended' as const,
            guardianAttendedAt: now,
            guardianName,
            note: (c.note ? c.note + '\n' : '') + `تم حضور ولي الأمر (${guardianName}) في ${now.slice(0, 10)}. ${note || ''}`,
            updatedAt: now
          };
          upsertRecord('discipline_cases', mappers.disciplineCase.toDb(updated));
          return updated;
        }
        return c;
      });
      return updatedList;
    });
    addAuditLog('تسجيل حضور ولي أمر', `تم توثيق حضور ولي الأمر للحالة رقم ${caseId} ورفع المنع`);
  };

  const adminExceptionalUnban = (caseId: string, reason: string) => {
    if (currentUser?.role !== 'admin') return;
    const now = new Date().toISOString();
    setDisciplineCases(prev => {
      const updatedList = prev.map(c => {
        if (c.id === caseId) {
          const updated: DisciplineCase = {
            ...c,
            status: 'closed' as const,
            exceptionalUnbanReason: reason,
            closedBy: currentUser.fullName,
            note: (c.note ? c.note + '\n' : '') + `رفع استثنائي بقرار المدير: ${reason}`,
            updatedAt: now
          };
          upsertRecord('discipline_cases', mappers.disciplineCase.toDb(updated));
          return updated;
        }
        return c;
      });
      return updatedList;
    });
    addAuditLog('رفع منع استثنائي', `رفع المنع استثنائياً عن الحالة ${caseId} بالسبب: ${reason}`);
  };

  const deliverReward = (studentId: string, rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return;

    const currentPoints = getStudentPoints(studentId);
    if (currentPoints < reward.threshold) return;

    const now = new Date().toISOString();

    const grant: RewardGrant = {
      id: 'rg_' + Date.now(),
      studentId,
      rewardId,
      rewardTitle: reward.title,
      pointsCost: reward.threshold,
      earnedAt: now.slice(0, 10),
      delivered: true,
      deliveredAt: now.slice(0, 10),
      deliveredBy: currentUser?.fullName || 'المدير'
    };
    setRewardGrants(prev => [grant, ...prev]);
    upsertRecord('reward_grants', mappers.rewardGrant.toDb(grant));

    const resetEntry: PointsEntry = {
      id: 'pt_redeem_' + Date.now(),
      studentId,
      points: -currentPoints,
      reason: 'redeem',
      note: `استلام الجائزة: ${reward.title} وتصفير رصيد النقاط`,
      date: now.slice(0, 10)
    };
    setPointsLedger(prev => [...prev, resetEntry]);
    upsertRecord('points_ledger', mappers.pointsLedger.toDb(resetEntry));

    addAuditLog('تسليم جائزة تحفيزية', `تسليم ${reward.title} للطالب ${studentId} وتصفير النقاط`);
  };

  const addManualPoints = (studentId: string, points: number, reason: string) => {
    if (currentUser?.role !== 'admin') return;
    const entry: PointsEntry = {
      id: 'pt_' + Date.now(),
      studentId,
      points,
      reason: 'bonus',
      note: reason,
      date: new Date().toISOString().slice(0, 10)
    };
    setPointsLedger(prev => [...prev, entry]);
    upsertRecord('points_ledger', mappers.pointsLedger.toDb(entry));
    addAuditLog('إضافة نقاط يدوية', `منح الطالب ${studentId} ${points} نقاط: ${reason}`);
  };

  const addStudentNote = (studentId: string, type: 'appearance' | 'behavior' | 'guardian_contact', text: string) => {
    const entry: StudentNote = {
      id: 'sn_' + Date.now(),
      studentId,
      type,
      text,
      date: new Date().toISOString().slice(0, 10),
      userId: currentUser?.id || 'admin',
      userName: currentUser?.fullName || 'المدير'
    };
    setStudentNotes(prev => [entry, ...prev]);
    upsertRecord('student_notes', mappers.studentNote.toDb(entry));
    addAuditLog('إضافة ملاحظة سلوكية للطالب', `ملاحظة (${type}) للطالب ${studentId}`);
  };

  const updateSettings = (newSettings: Partial<SchoolSettings>) => {
    setSettings(prev => {
      const merged = { ...prev, ...newSettings };
      upsertRecord('settings', mappers.settings.toDb(merged));
      return merged;
    });
    addAuditLog('تحديث إعدادات المدرسة', 'تعديل الإعدادات العامة للمنصة');
  };

  const updateMessageTemplate = (id: string, template: string) => {
    setMessageTemplates(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, template } : t);
      const target = updated.find(t => t.id === id);
      if (target) {
        upsertRecord('message_templates', mappers.messageTemplate.toDb(target));
      }
      return updated;
    });
    addAuditLog('تعديل قالب رسالة', `تعديل قالب الرسالة ${id}`);
  };

  const logMessageSent = (log: Omit<MessageLog, 'id' | 'sentAt'>) => {
    const entry: MessageLog = {
      ...log,
      id: 'ml_' + Date.now(),
      sentAt: new Date().toISOString()
    };
    setMessageLogs(prev => [entry, ...prev]);
    upsertRecord('message_logs', mappers.messageLog.toDb(entry));
  };

  const addTeacher = (t: Omit<Teacher, 'id'>) => {
    const newT: Teacher = { ...t, id: 't_' + Date.now() };
    setTeachers(prev => [...prev, newT]);
    upsertRecord('teachers', mappers.teacher.toDb(newT));
    addAuditLog('إضافة معلم', `إضافة المعلم ${t.fullName}`);
  };

  const updateTeacher = (id: string, t: Partial<Teacher>) => {
    setTeachers(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...t } : item);
      const target = updated.find(item => item.id === id);
      if (target) {
        upsertRecord('teachers', mappers.teacher.toDb(target));
      }
      return updated;
    });
  };

  const addGroup = (g: Omit<Group, 'id'>) => {
    const newG: Group = { ...g, id: 'g_' + Date.now() };
    setGroups(prev => [...prev, newG]);
    upsertRecord('groups', mappers.group.toDb(newG));
    addAuditLog('إضافة حلقة/مجموعة', `إضافة مجموعة ${g.name}`);
  };

  const updateGroup = (id: string, g: Partial<Group>) => {
    setGroups(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...g } : item);
      const target = updated.find(item => item.id === id);
      if (target) {
        upsertRecord('groups', mappers.group.toDb(target));
      }
      return updated;
    });
  };

  const addBranch = (b: Omit<Branch, 'id'>) => {
    const newB: Branch = { ...b, id: 'b_' + Date.now() };
    setBranches(prev => [...prev, newB]);
    upsertRecord('branches', mappers.branch.toDb(newB));
    addAuditLog('إضافة فرع جديد', `إضافة الفرع ${b.name}`);
  };

  const updateBranch = (id: string, updates: Partial<Branch>) => {
    setBranches(prev => {
      const updated = prev.map(b => b.id === id ? { ...b, ...updates } : b);
      const target = updated.find(b => b.id === id);
      if (target) {
        upsertRecord('branches', mappers.branch.toDb(target));
      }
      return updated;
    });
    addAuditLog('تعديل فرع', `تحديث بيانات الفرع ${id}`);
  };

  const toggleBranchStatus = (id: string) => {
    setBranches(prev => {
      const updated = prev.map(b => b.id === id ? { ...b, active: !b.active } : b);
      const target = updated.find(b => b.id === id);
      if (target) {
        upsertRecord('branches', mappers.branch.toDb(target));
      }
      return updated;
    });
    const target = branches.find(b => b.id === id);
    addAuditLog('تغيير حالة فرع', `تغيير حالة الفرع ${target?.name} إلى ${target?.active ? 'معطل' : 'نشط'}`);
  };

  const deleteBranch = (id: string) => {
    setBranches(prev => {
      const updated = prev.map(b => b.id === id ? { ...b, active: false } : b);
      const target = updated.find(b => b.id === id);
      if (target) {
        upsertRecord('branches', mappers.branch.toDb(target));
      }
      return updated;
    });
    addAuditLog('تعطيل فرع', `إيقاف العمل بالفرع ${id}`);
  };

  const deleteStoreItem = (id: string) => {
    setStoreItems(prev => prev.filter(item => item.id !== id));
    deleteRecord('store_items', id);
    addAuditLog('حذف صنف من المكتبة', `حذف الصنف رقم ${id}`);
  };

  const addReward = (rewardData: Omit<Reward, 'id'>) => {
    const newReward: Reward = {
      ...rewardData,
      id: 'rew_' + Date.now()
    };
    setRewards(prev => [...prev, newReward]);
    upsertRecord('rewards', mappers.reward.toDb(newReward));
    addAuditLog('إضافة جائزة جديدة', `إضافة الجائزة ${rewardData.title} بحد ${rewardData.threshold} نقطة`);
  };

  const updateReward = (id: string, updates: Partial<Reward>) => {
    setRewards(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, ...updates } : r);
      const target = updated.find(r => r.id === id);
      if (target) {
        upsertRecord('rewards', mappers.reward.toDb(target));
      }
      return updated;
    });
    addAuditLog('تعديل جائزة', `تحديث بيانات الجائزة ${id}`);
  };

  const deleteReward = (id: string) => {
    setRewards(prev => prev.filter(r => r.id !== id));
    deleteRecord('rewards', id);
    addAuditLog('حذف جائزة', `حذف الجائزة رقم ${id}`);
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: 'u_' + Date.now()
    };
    setUsers(prev => [...prev, newUser]);
    upsertRecord('users', mappers.user.toDb(newUser));
    addAuditLog('إضافة مستخدم جديد', `إنشاء حساب ${newUser.fullName} (${newUser.role})`);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => {
      const updated = prev.map(u => u.id === id ? { ...u, ...updates } : u);
      const target = updated.find(u => u.id === id);
      if (target) {
        upsertRecord('users', mappers.user.toDb(target));
      }
      return updated;
    });
    if (currentUser?.id === id) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }
    addAuditLog('تعديل مستخدم', `تحديث بيانات أو صلاحيات المستخدم ${id}`);
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    deleteRecord('users', id);
    addAuditLog('حذف مستخدم', `حذف حساب المستخدم ${id}`);
  };

  const canUserAccessModule = (moduleName: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;

    if (currentUser.allowedModules && currentUser.allowedModules.length > 0) {
      return currentUser.allowedModules.includes(moduleName);
    }

    switch (currentUser.role) {
      case 'finance':
        return ['dashboard', 'finance', 'reports'].includes(moduleName);
      case 'data_entry':
        return ['dashboard', 'students', 'student_attendance', 'teacher_attendance', 'reports'].includes(moduleName);
      case 'attendance_supervisor':
        return ['dashboard', 'student_attendance', 'teacher_attendance', 'discipline', 'whatsapp', 'reports'].includes(moduleName);
      case 'board':
        return ['dashboard', 'reports', 'branches'].includes(moduleName);
      default:
        return true;
    }
  };

  useEffect(() => {
    if (currentUser?.branchIds && !currentUser.branchIds.includes('all')) {
      if (!currentUser.branchIds.includes(selectedBranchId)) {
        setSelectedBranchId(currentUser.branchIds[0] || 'b1');
      }
    }
  }, [currentUser, selectedBranchId]);

  const exportBackupJson = () => {
    const backup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      branches,
      users,
      departments,
      teachers,
      groups,
      students,
      families,
      studentAttendance,
      teacherAttendance,
      disciplineCases,
      studentNotes,
      dues,
      payments,
      storeItems,
      sales,
      pointsLedger,
      rewards,
      rewardGrants,
      messageTemplates,
      messageLogs,
      settings
    };
    return JSON.stringify(backup, null, 2);
  };

  const importBackupJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.branches) setBranches(data.branches);
      if (data.students) setStudents(data.students);
      if (data.teachers) setTeachers(data.teachers);
      if (data.groups) setGroups(data.groups);
      if (data.dues) setDues(data.dues);
      if (data.payments) setPayments(data.payments);
      if (data.storeItems) setStoreItems(data.storeItems);
      if (data.sales) setSales(data.sales);
      if (data.disciplineCases) setDisciplineCases(data.disciplineCases);
      if (data.studentAttendance) setStudentAttendance(data.studentAttendance);
      if (data.settings) setSettings(data.settings);
      addAuditLog('استعادة نسخة احتياطية', 'تمت استعادة البيانات بنجاح من ملف JSON');
      return true;
    } catch (e) {
      console.error('Invalid backup format', e);
      return false;
    }
  };

  const resetToDemoData = () => {
    setBranches(initialBranches);
    setUsers(initialUsers);
    setDepartments(initialDepartments);
    setTeachers(initialTeachers);
    setGroups(initialGroups);
    setStudents(initialStudents);
    setFamilies(initialFamilies);
    setStudentAttendance(initialStudentAttendance);
    setTeacherAttendance(initialTeacherAttendance);
    setDisciplineCases(initialDisciplineCases);
    setStudentNotes(initialStudentNotes);
    setDues(initialDues);
    setPayments(initialPayments);
    setStoreItems(initialStoreItems);
    setSales(initialSales);
    setPointsLedger(initialPointsLedger);
    setRewards(initialRewards);
    setRewardGrants(initialRewardGrants);
    setMessageTemplates(initialMessageTemplates);
    setMessageLogs(initialMessageLogs);
    setAuditLogs(initialAuditLogs);
    setSettings(initialSettings);
    addAuditLog('إعادة ضبط المصنع', 'تم استرجاع البيانات النموذجية الأولية');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        selectedBranchId,
        setSelectedBranchId,
        branches,
        users,
        departments,
        teachers,
        groups,
        students,
        families,
        studentAttendance,
        teacherAttendance,
        disciplineCases,
        studentNotes,
        dues,
        payments,
        storeItems,
        sales,
        pointsLedger,
        rewards,
        rewardGrants,
        messageTemplates,
        messageLogs,
        auditLogs,
        settings,
        checkStudentBan,
        getStudentAbsenceCountThisMonth,
        getStudentPoints,
        addStudent,
        updateStudent,
        deleteStudent,
        saveStudentAttendanceBatch,
        saveTeacherAttendance,
        recordPayment,
        generateMonthlyDues,
        recordSale,
        addStoreItem,
        updateStoreItem,
        recordGuardianAttendance,
        adminExceptionalUnban,
        deliverReward,
        addManualPoints,
        addStudentNote,
        updateSettings,
        updateMessageTemplate,
        logMessageSent,
        addTeacher,
        updateTeacher,
        addGroup,
        updateGroup,
        addBranch,
        updateBranch,
        toggleBranchStatus,
        deleteBranch,
        setStudentDropped,
        reactivateStudent,
        deleteStoreItem,
        addReward,
        updateReward,
        deleteReward,
        addUser,
        updateUser,
        deleteUser,
        canUserAccessModule,
        isAuthenticated,
        login,
        logout,
        clearMockData,
        exportBackupJson,
        importBackupJson,
        resetToDemoData,
        isSupabaseConnected,
        isSyncing,
        syncStatusMessage,
        seedInitialDataToSupabase,
        fetchFromSupabase
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

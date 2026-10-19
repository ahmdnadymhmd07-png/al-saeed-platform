import { supabase } from './supabase';
import {
  Branch,
  User,
  Department,
  Teacher,
  Group,
  Family,
  Student,
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
  SchoolSettings
} from '../types';
import { OFFICIAL_SCHOOL_LOGO } from '../data/initialData';

// =========================================================================
// Mappers: App Types <-> Supabase Database Records
// =========================================================================

export const mappers = {
  branch: {
    toDb: (b: Branch) => ({
      id: b.id,
      name: b.name,
      address: b.address || '',
      phone: b.phone || '',
      manager_name: b.managerName || null,
      city: b.city || null,
      capacity: b.capacity || 100,
      established_date: b.establishedDate || null,
      notes: b.notes || null,
      active: b.active
    }),
    fromDb: (r: any): Branch => ({
      id: r.id,
      name: r.name,
      address: r.address || '',
      phone: r.phone || '',
      managerName: r.manager_name || undefined,
      city: r.city || undefined,
      capacity: r.capacity || 100,
      establishedDate: r.established_date || undefined,
      notes: r.notes || undefined,
      active: Boolean(r.active)
    })
  },

  user: {
    toDb: (u: User) => ({
      id: u.id,
      username: u.username,
      full_name: u.fullName,
      role: u.role,
      role_custom_title: u.roleCustomTitle || null,
      branch_ids: u.branchIds,
      allowed_modules: u.allowedModules || null,
      phone: u.phone || null,
      password: u.password || '123456',
      active: u.active
    }),
    fromDb: (r: any): User => ({
      id: r.id,
      username: r.username,
      fullName: r.full_name,
      role: r.role,
      roleCustomTitle: r.role_custom_title || undefined,
      branchIds: Array.isArray(r.branch_ids) ? r.branch_ids : ['all'],
      allowedModules: Array.isArray(r.allowed_modules) ? r.allowed_modules : undefined,
      phone: r.phone || undefined,
      password: r.password || undefined,
      active: Boolean(r.active)
    })
  },

  department: {
    toDb: (d: Department) => ({
      id: d.id,
      code: d.code,
      name: d.name,
      points_per_session: d.pointsPerSession,
      active: d.active
    }),
    fromDb: (r: any): Department => ({
      id: r.id,
      code: r.code,
      name: r.name,
      pointsPerSession: r.points_per_session || 1,
      active: Boolean(r.active)
    })
  },

  teacher: {
    toDb: (t: Teacher) => ({
      id: t.id,
      full_name: t.fullName,
      phone: t.phone || '',
      branch_id: t.branchId,
      department_ids: t.departmentIds,
      active: t.active,
      notes: t.notes || null
    }),
    fromDb: (r: any): Teacher => ({
      id: r.id,
      fullName: r.full_name,
      phone: r.phone || '',
      branchId: r.branch_id,
      departmentIds: Array.isArray(r.department_ids) ? r.department_ids : ['tahfeez'],
      active: Boolean(r.active),
      notes: r.notes || undefined
    })
  },

  group: {
    toDb: (g: Group) => ({
      id: g.id,
      name: g.name,
      department_id: g.departmentId,
      branch_id: g.branchId,
      teacher_id: g.teacherId,
      days: g.days,
      start_time: g.startTime,
      end_time: g.endTime,
      capacity: g.capacity || 20,
      year: g.year,
      active: g.active
    }),
    fromDb: (r: any): Group => ({
      id: r.id,
      name: r.name,
      departmentId: r.department_id,
      branchId: r.branch_id,
      teacherId: r.teacher_id,
      days: Array.isArray(r.days) ? r.days : [],
      startTime: r.start_time,
      endTime: r.end_time,
      capacity: r.capacity || 20,
      year: r.year,
      active: Boolean(r.active)
    })
  },

  family: {
    toDb: (f: Family) => ({
      id: f.id,
      family_name: f.familyName,
      guardian_phone: f.guardianPhone,
      note: f.note || null
    }),
    fromDb: (r: any): Family => ({
      id: r.id,
      familyName: r.family_name || 'عائلة',
      guardianPhone: r.guardian_phone || '',
      note: r.note || undefined
    })
  },

  student: {
    toDb: (s: Student) => ({
      id: s.id,
      branch_id: s.branchId,
      full_name: s.fullName,
      gender: s.gender || 'male',
      grade: s.grade,
      stage: s.stage,
      guardian_phone: s.guardianPhone,
      is_orphan: s.isOrphan,
      fee_mode: s.feeMode,
      fee_discount_amount: s.feeDiscountAmount,
      fee_reason: s.feeReason || null,
      family_id: s.familyId || null,
      join_date: s.joinDate,
      status: s.status,
      dropped_reason: s.droppedReason || null,
      dropped_date: s.droppedDate || null,
      agreement_accepted: s.agreementAccepted,
      agreement_date: s.agreementDate,
      tahfeez_group_id: s.tahfeezGroupId,
      tarbawi_group_id: s.tarbawiGroupId,
      notes: s.notes || null
    }),
    fromDb: (r: any): Student => {
      // 🧠 تنظيف القيمة القادمة من Supabase من أي علامات تنصيص زائدة مثل "'male'"
      const rawGender = String(r.gender || '').replace(/['"]/g, '').trim().toLowerCase();
      
      let cleanGender: 'male' | 'female' = 'male';
      if (rawGender === 'female' || rawGender === 'أنثى' || rawGender === 'أنثي') {
        cleanGender = 'female';
      } else if (rawGender === 'male' || rawGender === 'ذكر') {
        cleanGender = 'male';
      } else {
        // فحص الاسم في حالة كانت القيمة فارغة في قاعدة البيانات
        const cleanName = String(r.full_name || r.fullName || '').trim().replace(/[\u064B-\u0652]/g, '');
        const firstName = cleanName.split(/\s+/)[0] || '';
        const femaleNames = new Set([
          'أمل', 'مودة', 'مي', 'ندى', 'منى', 'رضوى', 'هبة', 'شهد', 'جنى', 'ملك', 'نور',
          'مريم', 'فاطمة', 'عائشة', 'خديجة', 'زينب', 'رقية', 'أم كلثوم', 'أسماء', 'هاجر',
          'سارة', 'شيماء', 'إيمان', 'آية', 'آيات', 'ملاك', 'روان', 'ريناد', 'فريدة', 'منة',
          'بسملة', 'تسنيم', 'رحمة', 'حبيبة', 'سلمى', 'سمية', 'جويرية', 'ياسمين', 'إسراء'
        ]);

        if (femaleNames.has(firstName) || (firstName.endsWith('ة') && !['حمزة', 'طلحة', 'عبيدة'].includes(firstName))) {
          cleanGender = 'female';
        }
      }

      return {
        id: r.id,
        branchId: r.branch_id || 'b1',
        fullName: r.full_name || '',
        gender: cleanGender,
        grade: r.grade || 'الصف الأول الابتدائي',
        stage: r.stage || 'primary',
        guardianPhone: r.guardian_phone || '',
        isOrphan: Boolean(r.is_orphan),
        feeMode: r.fee_mode || 'normal',
        feeDiscountAmount: Number(r.fee_discount_amount) || 0,
        feeReason: r.fee_reason || undefined,
        familyId: r.family_id || undefined,
        joinDate: r.join_date || '',
        status: r.status || 'active',
        droppedReason: r.dropped_reason || undefined,
        droppedDate: r.dropped_date || undefined,
        agreementAccepted: Boolean(r.agreement_accepted),
        agreementDate: r.agreement_date || '',
        tahfeezGroupId: r.tahfeez_group_id || 'g1',
        tarbawiGroupId: r.tarbawi_group_id || 'g5',
        notes: r.notes || undefined,
        createdAt: r.created_at || new Date().toISOString(),
        updatedAt: r.updated_at || new Date().toISOString()
      };
    }
  },

  studentAttendance: {
    toDb: (a: StudentAttendance) => ({
      id: a.id,
      branch_id: a.branchId,
      student_id: a.studentId,
      department_id: a.departmentId,
      group_id: a.groupId,
      date: a.date,
      status: a.status,
      excuse_reason: a.excuseReason || null,
      entered_by: a.enteredBy || null
    }),
    fromDb: (r: any): StudentAttendance => ({
      id: r.id,
      branchId: r.branch_id || 'b1',
      studentId: r.student_id,
      departmentId: r.department_id,
      groupId: r.group_id,
      date: sDate(r.date),
      status: r.status,
      excuseReason: r.excuse_reason || undefined,
      enteredBy: r.entered_by || 'مشرفة الغياب',
      createdAt: r.created_at || new Date().toISOString()
    })
  },

  teacherAttendance: {
    toDb: (a: TeacherAttendance) => ({
      id: a.id,
      branch_id: a.branchId,
      teacher_id: a.teacherId,
      date: a.date,
      status: a.status,
      check_in: a.checkIn || null,
      check_out: a.checkOut || null,
      late_minutes: a.lateMinutes || 0,
      early_leave_minutes: a.earlyLeaveMinutes || 0,
      worked_minutes: a.workedMinutes || 0,
      excuse_reason: a.excuseReason || null,
      source: a.source || 'register',
      entered_by: a.enteredBy || null
    }),
    fromDb: (r: any): TeacherAttendance => ({
      id: r.id,
      branchId: r.branch_id || 'b1',
      teacherId: r.teacher_id,
      date: sDate(r.date),
      status: r.status || 'present',
      checkIn: r.check_in || undefined,
      checkOut: r.check_out || undefined,
      lateMinutes: r.late_minutes || 0,
      earlyLeaveMinutes: r.early_leave_minutes || 0,
      workedMinutes: r.worked_minutes || 0,
      excuseReason: r.excuse_reason || undefined,
      source: r.source || 'register',
      enteredBy: r.entered_by || 'مشرفة الغياب',
      createdAt: r.created_at || new Date().toISOString()
    })
  },

  disciplineCase: {
    toDb: (c: DisciplineCase) => ({
      id: c.id,
      branch_id: c.branchId,
      student_id: c.studentId,
      month: c.month,
      level: c.level,
      status: c.status,
      absence_count: c.absenceCount,
      guardian_attended_at: c.guardianAttendedAt || null,
      guardian_name: c.guardianName || null,
      fine_due_id: c.fineDueId || null,
      suspended_from: c.suspendedFrom || null,
      suspended_to: c.suspendedTo || null,
      note: c.note || null,
      closed_by: c.closedBy || null,
      exceptional_unban_reason: c.exceptionalUnbanReason || null
    }),
    fromDb: (r: any): DisciplineCase => ({
      id: r.id,
      branchId: r.branch_id || 'b1',
      studentId: r.student_id,
      month: r.month,
      level: (r.level || 1) as 1 | 2 | 3,
      status: r.status || 'open',
      absenceCount: r.absence_count || 0,
      guardianAttendedAt: r.guardian_attended_at || undefined,
      guardianName: r.guardian_name || undefined,
      fineDueId: r.fine_due_id || undefined,
      suspendedFrom: r.suspended_from || undefined,
      suspendedTo: r.suspended_to || undefined,
      note: r.note || undefined,
      closedBy: r.closed_by || undefined,
      exceptionalUnbanReason: r.exceptional_unban_reason || undefined,
      createdAt: r.created_at || new Date().toISOString(),
      updatedAt: r.updated_at || new Date().toISOString()
    })
  },

  studentNote: {
    toDb: (n: StudentNote) => ({
      id: n.id,
      student_id: n.studentId,
      type: n.type,
      text: n.text,
      date: n.date,
      user_id: n.userId || null,
      user_name: n.userName || null
    }),
    fromDb: (r: any): StudentNote => ({
      id: r.id,
      studentId: r.student_id,
      type: r.type || 'behavior',
      text: r.text,
      date: sDate(r.date),
      userId: r.user_id || 'u1',
      userName: r.user_name || 'إدارة المدرسة'
    })
  },

  due: {
    toDb: (d: Due) => ({
      id: d.id,
      branch_id: d.branchId,
      student_id: d.studentId,
      month: d.month,
      kind: d.kind,
      gross_amount: d.grossAmount,
      orphan_discount: d.orphanDiscount,
      sibling_discount: d.siblingDiscount,
      amount: d.amount,
      paid_amount: d.paidAmount,
      status: d.status,
      discipline_case_id: d.disciplineCaseId || null,
      due_date: d.dueDate
    }),
    fromDb: (r: any): Due => ({
      id: r.id,
      branchId: r.branch_id || 'b1',
      studentId: r.student_id,
      month: r.month,
      kind: r.kind || 'subscription',
      grossAmount: Number(r.gross_amount) || 0,
      orphanDiscount: Number(r.orphan_discount) || 0,
      siblingDiscount: Number(r.sibling_discount) || 0,
      amount: Number(r.amount) || 0,
      paidAmount: Number(r.paid_amount) || 0,
      status: r.status || 'unpaid',
      disciplineCaseId: r.discipline_case_id || undefined,
      dueDate: r.due_date || '',
      createdAt: r.created_at || new Date().toISOString()
    })
  },

  payment: {
    toDb: (p: Payment) => ({
      id: p.id,
      branch_id: p.branchId,
      due_id: p.dueId,
      student_id: p.studentId,
      amount: p.amount,
      date: p.date,
      method: p.method,
      receipt_no: p.receiptNo,
      user_id: p.userId,
      user_name: p.userName,
      notes: p.notes || null
    }),
    fromDb: (r: any): Payment => ({
      id: r.id,
      branchId: r.branch_id || 'b1',
      dueId: r.due_id,
      studentId: r.student_id,
      amount: Number(r.amount) || 0,
      date: sDate(r.date),
      method: r.method || 'cash',
      receiptNo: r.receipt_no,
      userId: r.user_id || 'u3',
      userName: r.user_name || 'أ. محمود بدوي إبراهيم',
      notes: r.notes || undefined
    })
  },

  storeItem: {
    toDb: (s: StoreItem) => ({
      id: s.id,
      branch_id: s.branchId,
      name: s.name,
      type: s.type,
      unit_price: s.unitPrice,
      stock: s.stock,
      description: s.description || null,
      active: s.active
    }),
    fromDb: (r: any): StoreItem => ({
      id: r.id,
      branchId: r.branch_id || 'b1',
      name: r.name,
      type: r.type || 'book',
      unitPrice: Number(r.unit_price) || 0,
      stock: Number(r.stock) || 0,
      description: r.description || undefined,
      active: Boolean(r.active)
    })
  },

  sale: {
    toDb: (s: Sale) => ({
      id: s.id,
      branch_id: s.branchId,
      item_id: s.itemId,
      item_name: s.itemName,
      student_id: s.studentId || null,
      student_name: s.studentName || null,
      quantity: s.quantity,
      unit_price: s.unitPrice,
      total: s.total,
      date: s.date,
      receipt_no: s.receiptNo,
      user_id: s.userId
    }),
    fromDb: (r: any): Sale => ({
      id: r.id,
      branchId: r.branch_id || 'b1',
      itemId: r.item_id || '',
      itemName: r.item_name || 'صنف',
      studentId: r.student_id || undefined,
      studentName: r.student_name || undefined,
      quantity: Number(r.quantity) || 1,
      unitPrice: Number(r.unit_price) || 0,
      total: Number(r.total) || 0,
      date: sDate(r.date),
      receiptNo: r.receipt_no,
      userId: r.user_id || 'u3'
    })
  },

  pointsLedger: {
    toDb: (p: PointsEntry) => ({
      id: p.id,
      student_id: p.studentId,
      department_id: p.departmentId || null,
      points: p.points,
      reason: p.reason,
      source_attendance_id: p.sourceAttendanceId || null,
      note: p.note || null,
      date: p.date
    }),
    fromDb: (r: any): PointsEntry => ({
      id: r.id,
      studentId: r.student_id,
      departmentId: r.department_id || undefined,
      points: Number(r.points) || 0,
      reason: r.reason || 'attendance',
      sourceAttendanceId: r.source_attendance_id || undefined,
      note: r.note || undefined,
      date: sDate(r.date)
    })
  },

  reward: {
    toDb: (rw: Reward) => ({
      id: rw.id,
      title: rw.title,
      threshold: rw.threshold,
      description: rw.description || '',
      active: rw.active
    }),
    fromDb: (r: any): Reward => ({
      id: r.id,
      title: r.title,
      threshold: Number(r.threshold) || 20,
      description: r.description || '',
      active: Boolean(r.active)
    })
  },

  rewardGrant: {
    toDb: (g: RewardGrant) => ({
      id: g.id,
      student_id: g.studentId,
      reward_id: g.rewardId || null,
      reward_title: g.rewardTitle,
      points_cost: g.pointsCost,
      earned_at: g.earnedAt,
      delivered: g.delivered,
      delivered_at: g.deliveredAt || null,
      delivered_by: g.deliveredBy || null
    }),
    fromDb: (r: any): RewardGrant => ({
      id: r.id,
      studentId: r.student_id,
      rewardId: r.reward_id || undefined,
      rewardTitle: r.reward_title || 'جائزة',
      pointsCost: Number(r.points_cost) || 0,
      earnedAt: sDate(r.earned_at),
      delivered: Boolean(r.delivered),
      deliveredAt: r.delivered_at || undefined,
      deliveredBy: r.delivered_by || undefined
    })
  },

  messageTemplate: {
    toDb: (m: MessageTemplate) => ({
      id: m.id,
      type: m.type,
      name: m.name,
      template: m.template
    }),
    fromDb: (r: any): MessageTemplate => ({
      id: r.id,
      type: r.type,
      name: r.name,
      template: r.template
    })
  },

  messageLog: {
    toDb: (m: MessageLog) => ({
      id: m.id,
      student_id: m.studentId || null,
      student_name: m.studentName || null,
      phone: m.phone,
      type: m.type,
      text: m.text,
      sent_at: m.sentAt
    }),
    fromDb: (r: any): MessageLog => ({
      id: r.id,
      studentId: r.student_id || '',
      studentName: r.student_name || '',
      phone: r.phone,
      type: r.type || 'absent',
      text: r.text,
      sentAt: r.sent_at || new Date().toISOString()
    })
  },

  auditLog: {
    toDb: (a: AuditLog) => ({
      id: a.id,
      user_id: a.userId,
      user_name: a.userName,
      action: a.action,
      details: a.details,
      timestamp: a.timestamp
    }),
    fromDb: (r: any): AuditLog => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      action: r.action,
      details: r.details,
      timestamp: r.timestamp || new Date().toISOString()
    })
  },

  settings: {
    toDb: (s: SchoolSettings) => ({
      id: 'main_settings',
      school_name: s.schoolName,
      association_name: s.associationName,
      logo_url: s.logoUrl,
      phone: s.phone,
      email: s.email,
      address: s.address,
      fee_plans: s.feePlans,
      sibling_discount_amount: s.siblingDiscountAmount,
      absence_thresholds: s.absenceThresholds,
      absence_fine_amount: s.absenceFineAmount,
      suspension_months: s.suspensionMonths,
      due_day: s.dueDay,
      grace_days: s.graceDays,
      send_excused_absent_whats_app: s.sendExcusedAbsentWhatsApp,
      terms_text: s.termsText,
      report_header_title: s.reportHeaderTitle || null,
      report_subtitle: s.reportSubtitle || null,
      report_show_logo: s.reportShowLogo ?? true,
      report_footer_notes: s.reportFooterNotes || null,
      report_supervisor_title: s.reportSupervisorTitle || null,
      report_finance_title: s.reportFinanceTitle || null,
      report_director_title: s.reportDirectorTitle || null,
      report_stamp_text: s.reportStampText || null,
      report_gate_notes: s.reportGateNotes || null
    }),
    fromDb: (r: any): SchoolSettings => ({
      schoolName: r.school_name || 'مدرسة السعيد القرآنية',
      associationName: r.association_name || 'الجمعية الشرعية لتعاون العاملين بالكتاب والسنة المحمدية',
      logoUrl: r.logo_url || OFFICIAL_SCHOOL_LOGO || '/school_logo.jpg',
      phone: r.phone || '',
      email: r.email || '',
      address: r.address || '',
      feePlans: Array.isArray(r.fee_plans) ? r.fee_plans : [],
      siblingDiscountAmount: Number(r.sibling_discount_amount) || 10,
      absenceThresholds: r.absence_thresholds || { level1: 6, level2: 8, level3: 10 },
      absenceFineAmount: Number(r.absence_fine_amount) || 50,
      suspensionMonths: Number(r.suspension_months) || 2,
      dueDay: Number(r.due_day) || 10,
      graceDays: Number(r.grace_days) || 5,
      sendExcusedAbsentWhatsApp: Boolean(r.send_excused_absent_whats_app),
      termsText: r.terms_text || '',
      reportHeaderTitle: r.report_header_title || undefined,
      reportSubtitle: r.report_subtitle || undefined,
      reportShowLogo: r.report_show_logo ?? true,
      reportFooterNotes: r.report_footer_notes || undefined,
      reportSupervisorTitle: r.report_supervisor_title || undefined,
      reportFinanceTitle: r.report_finance_title || undefined,
      reportDirectorTitle: r.report_director_title || undefined,
      reportStampText: r.report_stamp_text || undefined,
      reportGateNotes: r.report_gate_notes || undefined
    })
  }
};

function sDate(d: any): string {
  if (!d) return new Date().toISOString().slice(0, 10);
  return String(d).slice(0, 10);
}

/**
 * Fetch all records from a Supabase table with mapping
 */
export async function fetchTable<T>(
  tableName: string,
  fromDb: (r: any) => T,
  fallback: T[]
): Promise<T[]> {
  try {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) {
      console.warn(`[Supabase] Note on table "${tableName}": ${error.message}. Using fallback data.`);
      return fallback;
    }
    if (data && data.length > 0) {
      return data.map(fromDb);
    }
    return fallback;
  } catch (err) {
    console.error(`[Supabase] Exception fetching "${tableName}":`, err);
    return fallback;
  }
}

/**
 * Upsert single record to Supabase
 */
export async function upsertRecord(tableName: string, record: any): Promise<boolean> {
  try {
    const { error } = await supabase.from(tableName).upsert(record);
    if (error) {
      console.warn(`[Supabase] Upsert warning on "${tableName}":`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[Supabase] Upsert exception on "${tableName}":`, err);
    return false;
  }
}

/**
 * Insert or Upsert batch records to Supabase
 */
export async function insertBatch(tableName: string, records: any[]): Promise<boolean> {
  if (!records || records.length === 0) return true;
  try {
    const { error } = await supabase.from(tableName).upsert(records);
    if (error) {
      console.warn(`[Supabase] Batch upsert warning on "${tableName}":`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[Supabase] Batch upsert exception on "${tableName}":`, err);
    return false;
  }
}

/**
 * Delete record from Supabase
 */
export async function deleteRecord(tableName: string, id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) {
      console.warn(`[Supabase] Delete warning on "${tableName}":`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[Supabase] Delete exception on "${tableName}":`, err);
    return false;
  }
}

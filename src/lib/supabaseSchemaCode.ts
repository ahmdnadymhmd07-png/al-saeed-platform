// =========================================================================
// منصة السعيد — نظام إدارة المدارس القرآنية
// استعلامات SQL Schema الشاملة لإنشاء كافة جداول منصة السعيد في Supabase
// =========================================================================

export const SUPABASE_SQL_SCHEMA = `-- =========================================================================
-- منصة السعيد — نظام إدارة المدارس القرآنية
-- ملف مخطط قاعدة البيانات الشامل (Supabase SQL Schema)
-- متوافق 100% مع نموذج بيانات وتطبيق منصة السعيد
-- قم بنسخ هذا الملف بالكامل وتشغيله داخل Supabase -> SQL Editor -> New Query -> Run
-- =========================================================================

-- تفعيل الامتدادات الضرورية (Extensions)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. جدول الفروع (Branches)
CREATE TABLE IF NOT EXISTS public.branches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    manager_name TEXT,
    city TEXT,
    capacity INTEGER DEFAULT 100,
    established_date TEXT,
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول المستخدمين والصلاحيات (Users)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'data_entry',
    role_custom_title TEXT,
    branch_ids JSONB DEFAULT '["all"]'::jsonb,
    allowed_modules JSONB,
    phone TEXT,
    password TEXT DEFAULT '123456',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول الأقسام التعليمية (Departments)
CREATE TABLE IF NOT EXISTS public.departments (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    points_per_session INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول المعلمين والمحفظين (Teachers)
CREATE TABLE IF NOT EXISTS public.teachers (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    department_ids JSONB DEFAULT '["tahfeez"]'::jsonb,
    active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. جدول الحلقات والمجموعات (Groups)
CREATE TABLE IF NOT EXISTS public.groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
    teacher_id TEXT REFERENCES public.teachers(id) ON DELETE SET NULL,
    days JSONB DEFAULT '[]'::jsonb,
    start_time TEXT,
    end_time TEXT,
    capacity INTEGER DEFAULT 20,
    year TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. جدول الأسر والعائلات (Families)
CREATE TABLE IF NOT EXISTS public.families (
    id TEXT PRIMARY KEY,
    family_name TEXT NOT NULL,
    guardian_phone TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. جدول الطلاب (Students)
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    grade TEXT,
    stage TEXT DEFAULT 'primary',
    guardian_phone TEXT NOT NULL,
    is_orphan BOOLEAN DEFAULT FALSE,
    fee_mode TEXT DEFAULT 'normal',
    fee_discount_amount NUMERIC DEFAULT 0,
    fee_reason TEXT,
    family_id TEXT REFERENCES public.families(id) ON DELETE SET NULL,
    join_date TEXT,
    status TEXT DEFAULT 'active',
    dropped_reason TEXT,
    dropped_date TEXT,
    agreement_accepted BOOLEAN DEFAULT TRUE,
    agreement_date TEXT,
    tahfeez_group_id TEXT,
    tarbawi_group_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. جدول حضور الطلاب (Student Attendance)
CREATE TABLE IF NOT EXISTS public.student_attendance (
    id TEXT PRIMARY KEY,
    branch_id TEXT,
    student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
    department_id TEXT,
    group_id TEXT,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    excuse_reason TEXT,
    entered_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. جدول حضور وانصراف المعلمين (Teacher Attendance)
CREATE TABLE IF NOT EXISTS public.teacher_attendance (
    id TEXT PRIMARY KEY,
    branch_id TEXT,
    teacher_id TEXT REFERENCES public.teachers(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    status TEXT DEFAULT 'present',
    check_in TEXT,
    check_out TEXT,
    late_minutes INTEGER DEFAULT 0,
    early_leave_minutes INTEGER DEFAULT 0,
    worked_minutes INTEGER DEFAULT 0,
    excuse_reason TEXT,
    source TEXT DEFAULT 'register',
    entered_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. جدول شؤون الانضباط والغياب التراكمي (Discipline Cases)
CREATE TABLE IF NOT EXISTS public.discipline_cases (
    id TEXT PRIMARY KEY,
    branch_id TEXT,
    student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    status TEXT DEFAULT 'open',
    absence_count INTEGER DEFAULT 0,
    guardian_attended_at TEXT,
    guardian_name TEXT,
    fine_due_id TEXT,
    suspended_from TEXT,
    suspended_to TEXT,
    note TEXT,
    closed_by TEXT,
    exceptional_unban_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. جدول ملاحظات الطلاب (Student Notes)
CREATE TABLE IF NOT EXISTS public.student_notes (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    text TEXT NOT NULL,
    date TEXT NOT NULL,
    user_id TEXT,
    user_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. جدول المستحقات والرسوم الشهرية (Dues)
CREATE TABLE IF NOT EXISTS public.dues (
    id TEXT PRIMARY KEY,
    branch_id TEXT,
    student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    kind TEXT DEFAULT 'subscription',
    gross_amount NUMERIC DEFAULT 0,
    orphan_discount NUMERIC DEFAULT 0,
    sibling_discount NUMERIC DEFAULT 0,
    amount NUMERIC DEFAULT 0,
    paid_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'unpaid',
    discipline_case_id TEXT,
    due_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. جدول المدفوعات والإيصالات (Payments)
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    branch_id TEXT,
    due_id TEXT,
    student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    date TEXT NOT NULL,
    method TEXT DEFAULT 'cash',
    receipt_no TEXT UNIQUE NOT NULL,
    user_id TEXT,
    user_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. جدول متجر الكتب والمصاحف (Store Items)
CREATE TABLE IF NOT EXISTS public.store_items (
    id TEXT PRIMARY KEY,
    branch_id TEXT,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'book',
    unit_price NUMERIC NOT NULL,
    stock INTEGER DEFAULT 0,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. جدول المبيعات (Sales)
CREATE TABLE IF NOT EXISTS public.sales (
    id TEXT PRIMARY KEY,
    branch_id TEXT,
    item_id TEXT,
    item_name TEXT NOT NULL,
    student_id TEXT,
    student_name TEXT,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    date TEXT NOT NULL,
    receipt_no TEXT UNIQUE NOT NULL,
    user_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. جدول دفتر النقاط وسجل التكريم (Points Ledger)
CREATE TABLE IF NOT EXISTS public.points_ledger (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
    department_id TEXT,
    points INTEGER NOT NULL,
    reason TEXT NOT NULL,
    source_attendance_id TEXT,
    note TEXT,
    date TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. جدول الجوائز وسلم التكريم (Rewards)
CREATE TABLE IF NOT EXISTS public.rewards (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    threshold INTEGER NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. جدول تسليم الجوائز (Reward Grants)
CREATE TABLE IF NOT EXISTS public.reward_grants (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
    reward_id TEXT,
    reward_title TEXT NOT NULL,
    points_cost INTEGER NOT NULL,
    earned_at TEXT NOT NULL,
    delivered BOOLEAN DEFAULT FALSE,
    delivered_at TEXT,
    delivered_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. جدول قوالب الرسائل (Message Templates)
CREATE TABLE IF NOT EXISTS public.message_templates (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    template TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. جدول سجل رسائل واتساب (Message Logs)
CREATE TABLE IF NOT EXISTS public.message_logs (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    student_name TEXT,
    phone TEXT NOT NULL,
    type TEXT,
    text TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. جدول سجل العمليات والرقابة (Audit Logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_name TEXT,
    action TEXT NOT NULL,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 22. جدول إعدادات وسياسات المدرسة (Settings)
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'main_settings',
    school_name TEXT NOT NULL,
    association_name TEXT NOT NULL,
    logo_url TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    fee_plans JSONB DEFAULT '[]'::jsonb,
    sibling_discount_amount NUMERIC DEFAULT 10,
    absence_thresholds JSONB DEFAULT '{"level1": 6, "level2": 8, "level3": 10}'::jsonb,
    absence_fine_amount NUMERIC DEFAULT 50,
    suspension_months INTEGER DEFAULT 2,
    due_day INTEGER DEFAULT 10,
    grace_days INTEGER DEFAULT 5,
    send_excused_absent_whats_app BOOLEAN DEFAULT FALSE,
    terms_text TEXT,
    report_header_title TEXT,
    report_subtitle TEXT,
    report_show_logo BOOLEAN DEFAULT TRUE,
    report_footer_notes TEXT,
    report_supervisor_title TEXT,
    report_finance_title TEXT,
    report_director_title TEXT,
    report_stamp_text TEXT,
    report_gate_notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- إتاحة صلاحيات القراءة والكتابة والتحديث (RLS Policies)
-- =========================================================================

-- تفعيل RLS على كافة الجداول
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discipline_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول الشامل (Full Access for Anonymous / Authenticated Clients)
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Allow all access" ON public.%I', tbl);
        EXECUTE format('CREATE POLICY "Allow all access" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl);
    END LOOP;
END $$;

COMMENT ON TABLE public.students IS 'جداول منصة السعيد — متوافقة بالكامل مع قاعدة بيانات Supabase الحقيقية';
`;

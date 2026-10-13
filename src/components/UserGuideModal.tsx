import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Search, 
  Printer, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  Building2, 
  Users, 
  CalendarCheck, 
  Clock, 
  CreditCard, 
  Award, 
  AlertTriangle, 
  MessageSquare, 
  FileText, 
  Settings, 
  ChevronDown, 
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GuideSection {
  id: string;
  title: string;
  icon: React.FC<{ className?: string }>;
  content: {
    summary: string;
    points: { label: string; text: string }[];
    tip?: string;
  };
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  const { settings } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionId, setActiveSectionId] = useState<string>('intro');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    intro: true,
    auth: true,
    dashboard: true,
    branches: true,
    students: true,
    attendance: true,
    teacher_attendance: true,
    finance: true,
    points: true,
    discipline: true,
    whatsapp: true,
    reports: true,
    settings: true,
    handover: true
  });

  if (!isOpen) return null;

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const sections: GuideSection[] = [
    {
      id: 'intro',
      title: '1. مقدمة عن المنصة ورؤيتها المؤسسية',
      icon: Sparkles,
      content: {
        summary: 'نظام رقمي سحابي متكامل ومصمم خصيصاً للمدارس القرآنية والمجمعات التعليمية والفروع المتعددة لإحكام إدارة الحلقات، التحصيل المالي، وانضباط الطلاب.',
        points: [
          { label: 'الهدف الأساسي', text: 'حوسبة كافة العمليات الورقية في المدارس القرآنية وربط الحضور بالانضباط والتحصيل المالي والجوائز التكريمية في شاشة واحدة.' },
          { label: 'المرونة والخصوصية', text: 'تعمل المنصة محلياً وسحابياً مع إمكانية تصدير نسخة احتياطية كاملة بملف واحد في أي وقت لحفظ أمان وسرية البيانات.' },
          { label: 'اللائحة الصارمة والتربية', text: 'الدمج بين الجانب التربوي القرآني (لقاء الجمعة) وجانب الإتقان التجويدي مع بنك نقاط وجوائز لتحفيز الأشبال.' }
        ],
        tip: 'يمكن استخدام المنصة دون اتصال دائم بالإنترنت بفضل نظام التخزين المحلي الآمن المدمج.'
      }
    },
    {
      id: 'auth',
      title: '2. بوابة تسجيل الدخول واستعادة كلمة المرور',
      icon: Lock,
      content: {
        summary: 'بوابة أمنية موحدة تتيح للموظفين الدخول لحساباتهم المصرحة، مع منظومة مرنة لاستعادة كلمة المرور عند نسيانها.',
        points: [
          { label: 'الدخول بالاسم أو الهاتف', text: 'يدخل الموظف اسم المستخدم أو رقم هاتفه المسجل مع كلمة المرور لتسجيل الدخول الفوري.' },
          { label: 'كود اعتماد الإدارة (Master PIN)', text: 'يتيح لمدير المدرسة فك قفل أي حساب وتعيين كلمة مرور جديدة له فوراً بحضور الموظف عبر كود إدارة المدرسة (الكود الافتراضي: 123456).' },
          { label: 'رمز التحقق المؤقت (OTP)', text: 'توليد كود تحقق من 6 أرقام لهاتف الموظف المسجل للتأكد من هويته ثم السماح له بتعيين كلمة مروره الجديدة.' },
          { label: 'برقية واتساب الرسمية', text: 'زر يفتح محادثة واتساب منسقة ببيانات الحساب لطلب التعيين من مدير المدرسة بضغطة زر.' }
        ],
        tip: 'يستطيع مدير المدرسة تغيير صلاحيات أي مستخدم أو تعديل كلمة مروره في أي وقت من تبويب الإعدادات.'
      }
    },
    {
      id: 'dashboard',
      title: '3. لوحة التحكم والمؤشرات الإحصائية العامة',
      icon: Building2,
      content: {
        summary: 'شاشة الرؤية المركزية الشاملة لكافة الفروع والإحصاءات الحيوية لحظة بلحظة.',
        points: [
          { label: 'تصفية الفروع والفترات', text: 'إمكانية عرض إحصاءات كل الفروع معاً أو اختيار فرع محدد، وتحديد الفترة (أسبوع، شهر، فصل دراسي، عام كامل).' },
          { label: 'إجمالي التدفق النقدي', text: 'يمثل مجموع النقدية الفعلية الداخلة للخزينة = (اشتراكات الطلاب المحصلة + مبيعات متجر الكتب والمصاحف).' },
          { label: 'إعفاءات أيتام وخصم إخوة', text: 'يوضح حجم التكافل الاجتماعي والتخفيضات المالية الممنوحة دعماً للأسر والأيتام خلال الفترة.' },
          { label: 'كشف بوابة اليوم', text: 'زر أحمر بارز يوضح عدد الطلاب الممنوعين من الدخول اليوم مع إمكانية طباعة كشف البوابة لمسؤول الأمن فوراً.' }
        ],
        tip: 'الرسوم البيانية التفاعلية تمكنك من معرفة نسبة إشغال السعة المرخصة لكل فرع بمجرد تمرير الفأرة.'
      }
    },
    {
      id: 'branches',
      title: '4. إدارة الفروع ومقارنة الأداء والسعة',
      icon: Building2,
      content: {
        summary: 'متابعة الفروع المتعددة، عناوينها، طاقتها الاستيعابية، ومقارنة نسب التحصيل والإشغال.',
        points: [
          { label: 'بطاقات الفروع', text: 'عرض السعة المرخصة، عدد الطلاب المقيدين، ونسبة الإشغال بشريط ملون يوضح مدى امتلاء الفرع.' },
          { label: 'إضافة فرع جديد', text: 'تسجيل اسم الفرع، الهاتف، العنوان، المدينة، واسم مدير الفرع المسؤول.' },
          { label: 'جدول المقارنة المركزي', text: 'مقارنة إحصائية مباشرة بين كافة الفروع من حيث عدد المقيدين، المعلمين، الحلقات، ومعدلات السداد.' }
        ]
      }
    },
    {
      id: 'students',
      title: '5. شؤون الطلاب واستمارة القيد والتسجيل',
      icon: Users,
      content: {
        summary: 'تسجيل الطلاب الجدد بدقة، والتحقق من الأسماء الرباعية، وتطبيق خصومات الإخوة والأيتام آلياً.',
        points: [
          { label: 'الاسم رباعي إلزامي', text: 'النظام يتحقق برمجياً من كتابة أربعة مقاطع للاسم على الأقل لضمان سلامة السجلات الرسمية.' },
          { label: 'ربط الإخوة تلقائياً', text: 'يفحص النظام آلياً وجود إخوة مقيدين لنفس ولي الأمر ويمنح خصم الإخوة المعتمد باللائحة تلقائياً.' },
          { label: 'إعفاءات الأيتام', text: 'تحديد ما إذا كان الطالب يتيماً لمنحه إعفاء كاملاً بنسبة 100% أو جزئياً بنسبة 50% من الاشتراك.' },
          { label: 'الملف الفردي للطالب', text: 'استعراض سجل حضور وغياب الطالب، حركاته المالية، رصيد نقاطه، وملاحظات السلوك والمظهر.' }
        ],
        tip: 'يمكن طباعة استمارة التحاق وتعهد ولي أمر رسمية لأي طالب بضغطة زر لتوقيعها وحفظها بالملف الورقي.'
      }
    },
    {
      id: 'attendance',
      title: '6. تحضير الطلاب اليومي وكشف الحلقة الورقي',
      icon: CalendarCheck,
      content: {
        summary: 'واجهة سريعة لمشرفي الحلقات لرصد الحضور والغياب مع الربط التلقائي بنظام الانضباط والجوائز.',
        points: [
          { label: 'التحضير السريع (الكل حاضر)', text: 'تحضير جميع طلاب الحلقة بنقرة زر واحدة مع إمكانية تعديل الغائبين فقط لتوفير الوقت.' },
          { label: 'تسجيل الأعذار المقبولة', text: 'إمكانية تحديد الطالب كـ (معذور) وكتابة سبب العذر للاحتفاظ به ومنع احتسابه كغياب مؤذٍ في اللائحة.' },
          { label: 'طباعة كشف الحلقة الورقي', text: 'زر مخصص يفتح نافذة معاينة وطباعة الكشف الورقي للحلقة بتنسيق A4 لتعليقه في القاعة وتوقيع المحفظ.' },
          { label: 'الربط التلقائي', text: 'كل حصة حضور تمنح الطالب نقطة تشجيعية، وكل غياب بدون عذر يرفع عداد الغياب التراكمي للطالب.' }
        ]
      }
    },
    {
      id: 'teacher_attendance',
      title: '7. دفتر حضور وانصراف المعلمين والمحفظين',
      icon: Clock,
      content: {
        summary: 'تفريغ دفتر حضور المحفظين والمعلمين واحتساب ساعات العمل ودقائق التأخير ومعدلات الالتزام.',
        points: [
          { label: 'مصادر الرصد المعتمدة', text: 'تفريغ يدوي من الدفتر الورقي، أو مسح الرمز السريع (QR Code)، أو جهاز البصمة.' },
          { label: 'احتساب الساعات والتأخير', text: 'تسجيل وقت الحضور والانصراف، وعدد الحصص المنفذة، واحتساب دقائق التأخير آلياً.' },
          { label: 'حفظ السجل اليومي', text: 'حفظ سجل يومي موثق باسم الموظف الذي قام بالإدخال لضمان الدقة والشفافية.' }
        ]
      }
    },
    {
      id: 'finance',
      title: '8. التحصيل المالي ومبيعات متجر الكتب',
      icon: CreditCard,
      content: {
        summary: 'إدارة مالية دقيقة لاشتراكات الطلاب ومبيعات المصاحف والكتب مع إصدار إيصالات رسمية.',
        points: [
          { label: 'توليد استحقاقات الشهر للنشطين', text: 'زر رئيسي ينشئ بضغطة واحدة مطالبات الاشتراك لكافة الطلاب المقيدين مع تطبيق خصومات الإخوة والأيتام آلياً.' },
          { label: 'تسجيل السداد وإيصال رسمي', text: 'تسجيل الدفع (نقدي أو تحويل) مع إصدار إيصال تحصيل رسمي مرقم ومختوم تلقائياً.' },
          { label: 'متجر الكتب والمستلزمات', text: 'إدارة مخزون المصاحف وكتب التجويد، مع تسجيل حركات البيع للطلاب وخصم المخزون فورياً.' }
        ],
        tip: 'التأخر في سداد الاشتراك بعد يوم 10 من الشهر يضيف الطالب تلقائياً إلى قائمة الممنوعين من الدخول بالبوابة لحين السداد.'
      }
    },
    {
      id: 'points',
      title: '9. بنك النقاط التحفيزية ومنظومة الجوائز',
      icon: Award,
      content: {
        summary: 'نظام مكافآت تنافسي يشجع الطلاب على الحضور المنتظم وحفظ القرآن الكريم.',
        points: [
          { label: 'اكتساب النقاط', text: 'يكتسب الطالب نقطة عن كل حصة تحفيظ ونقطة عن لقاء الجمعة، مع إمكانية منح نقاط تشجيعية يدوية من المحفظ.' },
          { label: 'سلم الجوائز', text: 'تعريف جوائز بمستويات نقاط محددة (مصحف، حقيبة، ساعة، درع تكريم، رحلة).' },
          { label: 'تسليم الجائزة وتصفير النقاط', text: 'عند استحقاق الطالب للجائزة وتسليمها له، يقوم النظام بتصفير رصيد نقاطه آلياً وتوثيق العملية في سجل التكريم لمنع تكرار الصرف.' }
        ]
      }
    },
    {
      id: 'discipline',
      title: '10. شؤون الانضباط ومتابعة الغياب التراكمي',
      icon: AlertTriangle,
      content: {
        summary: 'تطبيق لائحة المدرسة الصارمة لمتابعة الغياب المتكرر ومنع المقصرين من البوابة لحين معالجة الأمر.',
        points: [
          { label: 'المستوى الأول (6 غيابات)', text: 'صدور استدعاء رسمي لولي الأمر مع منع الطالب من دخول المدرسة حتى حضور ولي الأمر وتوقيع التعهد.' },
          { label: 'المستوى الثاني (8 غيابات)', text: 'تطبيق غرامة انضباط قدرها 50 جنيهاً مصرياً تسدد لخزينة المدرسة لرفع المنع.' },
          { label: 'المستوى الثالث (10 غيابات)', text: 'صدور قرار فصل مؤقت للطالب لمدة شهرين مع إيقاف ظهوره بكشوف التحضير.' },
          { label: 'تسجيل حضور ولي الأمر', text: 'نموذج إلكتروني ميسر لتسجيل حضور ولي الأمر وتوثيق حضوره لرفع المنع فوراً.' }
        ],
        tip: 'كشف الممنوعين من الدخول يُطبع يومياً لحارس البوابة لضمان عدم دخول أي طالب مخالف قبل مراجعة الإدارة.'
      }
    },
    {
      id: 'whatsapp',
      title: '11. إشعارات ورسائل أولياء الأمور عبر واتساب',
      icon: MessageSquare,
      content: {
        summary: 'تواصل فوري مع أولياء الأمور عبر واتساب دون الحاجة لتسجيل الأرقام في الهاتف.',
        points: [
          { label: 'إشعارات الغياب الفوري', text: 'توليد روابط wa.me جاهزة بنصوص مخصصة لكل طالب غائب لإرسالها لولي الأمر بنقرة واحدة.' },
          { label: 'تذكيرات السداد واللقاءات', text: 'إرسال تنبيهات موعد سداد الاشتراك الشهري، ومواعيد لقاء الجمعة التربوي.' },
          { label: 'تخصيص القوالب', text: 'إمكانية تعديل صيغ ونصوص الرسائل من تبويب الإعدادات لتناسب لهجة وسياسة المدرسة.' }
        ]
      }
    },
    {
      id: 'reports',
      title: '12. التقارير الإدارية والطباعة والتعديل المباشر',
      icon: FileText,
      content: {
        summary: 'مركز الطباعة الموحد لكافة مستندات المدرسة ووثائقها الميدانية والمالية بتنسيق A4 فائق الدقة.',
        points: [
          { label: 'خطاب استدعاء ولي الأمر', text: 'خطاب رسمي مخصص باسم الطالب وحلقته، مزود بكعب استلام يوقع عليه ولي الأمر للإدارة.' },
          { label: 'كشف حضور الحلقة الورقي', text: 'كشف مخصص للتعليق بالقاعة يشمل أسماء الطلاب وخانات رصد يومية وتوقيع المحفظ.' },
          { label: 'كشوف الإدارة والمالية', text: 'كشف قيد الطلاب، كشف التحصيل والمتأخرات، كشف الممنوعين للبوابة، وتقرير مقارنة الفروع.' },
          { label: 'خاصية التعديل المباشر', text: 'ميزة تتيح النقر على أي فقرة أو جدول أو عنوان في المستند وتعديل نصه مباشرة على الشاشة قبل طباعته.' }
        ]
      }
    },
    {
      id: 'settings',
      title: '13. إعدادات النظام، اللائحة، والنسخ الاحتياطي',
      icon: Settings,
      content: {
        summary: 'لوحة التحكم الإدارية الكبرى لضبط هوية المدرسة واللائحة وإدارة الصلاحيات وحفظ البيانات.',
        points: [
          { label: 'إدارة المستخدمين والصلاحيات', text: 'إضافة حسابات جديدة، تعيين كلمات المرور، الفروع المسموح بها، والأقسام المصرح لكل موظف بدخولها.' },
          { label: 'سياسات وهوية المدرسة', text: 'تعديل اسم المدرسة، الشعار، الهاتف، خطط الرسوم، حدود الغياب، وغرامة الانضباط.' },
          { label: 'النسخ الاحتياطي الشامل', text: 'تصدير ملف JSON يحتوي على كافة بيانات المدرسة بضغطة زر واحدة لحفظه بأمان على قرص خارجي، أو استرجاع نسخة سابقة في ثوانٍ.' }
        ],
        tip: 'يُنصح مدير المدرسة بتحميل نسخة احتياطية من النظام أسبوعياً أو نهاية كل شهر لضمان أعلى درجات الأمان.'
      }
    },
    {
      id: 'handover',
      title: '14. دليل تسليم المنصة للعملاء والمدارس الجديدة',
      icon: CheckCircle2,
      content: {
        summary: 'دليل خطوات ميسر لمهندس المنصة ومسؤول التسليم لتهيئة النظام لمدرسة قرآنية جديدة.',
        points: [
          { label: 'الخطوة 1: ضبط الهوية', text: 'تعديل اسم المدرسة وشعارها وبيانات التواصل من تبويب «الإعدادات».' },
          { label: 'الخطوة 2: لائحة الرسوم والانضباط', text: 'إدخال قيم الاشتراكات المعتمدة وحدود الغياب وغرامة الانضباط وشروط القبول.' },
          { label: 'الخطوة 3: تأسيس الفروع والحلقات', text: 'إضافة فروع المدرسة، المعلمين، الحلقات، وتوزيع مواعيدها.' },
          { label: 'الخطوة 4: تسليم حسابات الموظفين', text: 'إنشاء حساب لكل موظف وفق مسمى عمله وتسليمه اسم المستخدم وكلمة المرور.' },
          { label: 'الخطوة 5: تثبيت التطبيق للعميل', text: 'تثبيت المنصة كتطبيق ويب (PWA) على أجهزة الكمبيوتر وهواتف الإدارة لتعمل بضغطة واحدة من سطح المكتب.' }
        ]
      }
    }
  ];

  const filteredSections = sections.filter(sec => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return sec.title.toLowerCase().includes(q) ||
           sec.content.summary.toLowerCase().includes(q) ||
           sec.content.points.some(p => p.label.toLowerCase().includes(q) || p.text.toLowerCase().includes(q));
  });

  const handlePrintGuide = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    // Generate text blob for download
    let text = `# دليل الاستخدام الشامل لمنصة السعيد لإدارة المدارس القرآنية\n\n`;
    sections.forEach(s => {
      text += `## ${s.title}\n${s.content.summary}\n\n`;
      s.content.points.forEach(p => {
        text += `- **${p.label}**: ${p.text}\n`;
      });
      if (s.content.tip) text += `\n> *تنبيه:* ${s.content.tip}\n`;
      text += `\n---\n\n`;
    });

    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `دليل_استخدام_منصة_السعيد_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] w-full max-w-5xl rounded-2xl border border-[#E8DCCF] shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="no-print bg-gradient-to-l from-[#361E10] via-[#4A2F18] to-[#5C3A1E] p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-xl text-[#D4AF37]">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  الدليل التفصيلي الشامل لمنصة السعيد
                </h2>
                <span className="text-[10px] bg-[#D4AF37] text-[#361E10] px-2 py-0.5 rounded-full font-black">
                  الإصدار 1.0 • 1448 هـ / 2027 م
                </span>
              </div>
              <p className="text-xs text-[#D8C3AE] mt-0.5">
                مرجع توثيقي كامل يشرح كل شاشة وموديول وكيفية التشغيل والتسليم للعملاء
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="تحميل الدليل كملف نصي Markdown"
            >
              <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">تحميل ملف الدليل</span>
            </button>

            <button
              onClick={handlePrintGuide}
              className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#C29D2C] text-[#361E10] rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="طباعة الدليل كاملاً A4"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الدليل</span>
            </button>

            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition cursor-pointer"
              title="إغلاق"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search Bar & Quick Navigation Banner */}
        <div className="no-print bg-[#FBF8F5] p-3.5 border-b border-[#E8DCCF] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في أقسام الدليل (مثال: كلمة المرور، الاستحقاقات، البوابة)..."
              className="w-full pl-8 pr-3 py-2 bg-white border border-[#E8DCCF] rounded-xl text-xs font-bold text-[#4A2F18] focus:border-[#B9895B]"
            />
            <Search className="w-4 h-4 text-[#8C6D53] absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="text-[11px] text-[#8C6D53] flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <span>عدد الفصول المشروحة: <strong className="text-[#4A2F18] font-bold">{sections.length} فصلاً</strong></span>
            <span className="text-gray-300">•</span>
            <span className="text-emerald-700 font-bold">جميع الحقوق محفوظة © 1448 هـ / 2027 م</span>
          </div>
        </div>

        {/* Body Content (Printable Layout) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Printable Watermark Title (Visible during print only) */}
          <div className="print-only pb-4 border-b-2 border-black text-center mb-6">
            <h1 className="text-xl font-black text-black">منصة السعيد — نظام إدارة المدارس القرآنية</h1>
            <h2 className="text-sm font-bold text-gray-700 mt-1">الدليل التفصيلي الشامل لكافة شاشات وموديولات المنصة</h2>
            <p className="text-xs text-gray-600 mt-1">الإصدار 1.0 • 1448 هـ / 2027 م • جميع الحقوق محفوظة</p>
          </div>

          {filteredSections.map(sec => {
            const Icon = sec.icon;
            const isExpanded = expandedSections[sec.id] !== false;

            return (
              <div 
                key={sec.id}
                id={sec.id}
                className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] overflow-hidden shadow-2xs transition-all"
              >
                {/* Section Header */}
                <div 
                  onClick={() => toggleSection(sec.id)}
                  className="p-4 bg-[#FBF8F5] hover:bg-[#F6EEE4] transition cursor-pointer flex items-center justify-between border-b border-[#E8DCCF]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#4A2F18] text-[#D4AF37] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#4A2F18]">
                        {sec.title}
                      </h3>
                      <p className="text-[11px] text-[#8C6D53] line-clamp-1">
                        {sec.content.summary}
                      </p>
                    </div>
                  </div>

                  <div className="no-print flex items-center gap-2 text-[#8C6D53]">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Section Content */}
                {isExpanded && (
                  <div className="p-5 space-y-3.5 bg-white">
                    <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DCCF]/60 text-[#4A2F18] font-medium leading-relaxed">
                      {sec.content.summary}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {sec.content.points.map((pt, idx) => (
                        <div 
                          key={idx}
                          className="p-3 rounded-xl border border-[#E8DCCF] bg-[#FFFFFF] hover:border-[#B9895B]/40 transition space-y-1"
                        >
                          <strong className="text-xs text-[#4A2F18] flex items-center gap-1.5 font-extrabold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B9895B]" />
                            <span>{pt.label}:</span>
                          </strong>
                          <p className="text-[11px] text-[#6D4C3D] leading-relaxed pr-3">
                            {pt.text}
                          </p>
                        </div>
                      ))}
                    </div>

                    {sec.content.tip && (
                      <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                        <span className="font-bold text-amber-800 shrink-0">💡 ملحوظة هامة:</span>
                        <span>{sec.content.tip}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filteredSections.length === 0 && (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 text-gray-500">
              لا توجد فصول تطابق كلمة البحث "{searchQuery}". جرب البحث بكلمة أخرى مثل «غياب»، «رسوم»، «بوابة».
            </div>
          )}

          {/* Footer inside modal */}
          <div className="pt-4 border-t border-[#E8DCCF] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#8C6D53]">
            <span>منصة السعيد — نظام إدارة المدارس القرآنية والفروع والمجمعات التعليمية</span>
            <span className="font-bold text-[#4A2F18]">الإصدار 1.0 • 1448 هـ / 2027 م • جميع الحقوق محفوظة</span>
          </div>

        </div>

      </div>
    </div>
  );
};

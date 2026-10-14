import React, { useEffect } from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  CalendarCheck, 
  Clock, 
  CreditCard, 
  Award, 
  AlertTriangle, 
  MessageSquare, 
  FileText, 
  Settings,
  Building2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type NavTab = 
  | 'dashboard'
  | 'branches'
  | 'students'
  | 'student_attendance'
  | 'teacher_attendance'
  | 'finance'
  | 'book_sales'
  | 'points'
  | 'discipline'
  | 'whatsapp'
  | 'reports'
  | 'settings';

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, canUserAccessModule } = useApp();

  const allNavItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'لوحة التحكم والإحصائيات', icon: LayoutDashboard },
    { id: 'branches', label: 'إدارة الفروع والمقارنة', icon: Building2 },
    { id: 'students', label: 'الطلاب والتقديم', icon: GraduationCap },
    { id: 'student_attendance', label: 'تحضير الطلاب', icon: CalendarCheck },
    { id: 'teacher_attendance', label: 'حضور المعلمين', icon: Clock },
    { id: 'finance', label: 'التحصيل المالي ومبيعات الكتب', icon: CreditCard },
    { id: 'points', label: 'النقاط والجوائز', icon: Award },
    { id: 'discipline', label: 'شؤون الانضباط والمنع', icon: AlertTriangle },
    { id: 'whatsapp', label: 'رسائل واتساب', icon: MessageSquare },
    { id: 'reports', label: 'التقارير والطباعة', icon: FileText },
    { id: 'settings', label: 'الإعدادات وسياسات المدرسة', icon: Settings },
  ];

  // Filter items by current user permissions
  const visibleNavItems = allNavItems.filter(item => canUserAccessModule(item.id));

  // Auto-redirect if active tab is not accessible
  useEffect(() => {
    if (activeTab === 'book_sales') {
      setActiveTab('finance');
    } else if (!canUserAccessModule(activeTab) && visibleNavItems.length > 0) {
      setActiveTab(visibleNavItems[0].id);
    }
  }, [currentUser, activeTab, visibleNavItems, canUserAccessModule, setActiveTab]);

  return (
    <nav className="w-full bg-[#FFFFFF] border-b border-[#E8DCCF] overflow-x-auto py-2 px-2 sm:px-4 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-start gap-1 sm:gap-2 flex-nowrap w-max min-w-full">
        {visibleNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-gradient-to-l from-[#361E10] to-[#4A2F18] text-[#FFFFFF] shadow-sm ring-1 ring-[#D4AF37]/60'
                  : 'text-[#6D4C3D] hover:bg-[#F6EEE4] hover:text-[#4A2F18]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-[#8C6D53]'}`} />
              <span>{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { DashboardView } from './views/DashboardView';
import { BranchesView } from './views/BranchesView';
import { StudentsView } from './views/StudentsView';
import { StudentAttendanceView } from './views/StudentAttendanceView';
import { TeacherAttendanceView } from './views/TeacherAttendanceView';
import { FinanceView } from './views/FinanceView';
import { PointsView } from './views/PointsView';
import { DisciplineView } from './views/DisciplineView';
import { WhatsAppView } from './views/WhatsAppView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { StudentModal } from './components/StudentModal';
import { PrintModal } from './components/PrintModal';
import { UserGuideModal } from './components/UserGuideModal';
import { LoginScreen } from './components/LoginScreen';
import { Student, Payment } from './types';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // إذا لم يكن المستخدم مسجلاً للدخول، يتم إظهار شاشة الدخول المخصصة
  if (!isAuthenticated || !currentUser) {
    return <LoginScreen />;
  }

  // إعدادات نافذة الطباعة
  const [printConfig, setPrintConfig] = useState<{
    isOpen: boolean;
    type: 'admission' | 'receipt' | 'gatekeeper' | null;
    student?: Student | null;
    payment?: Payment | null;
  }>({
    isOpen: false,
    type: null
  });

  const handleOpenGateReport = () => {
    setPrintConfig({
      isOpen: true,
      type: 'gatekeeper'
    });
  };

  const handlePrintAdmissionSlip = (student: Student) => {
    setPrintConfig({
      isOpen: true,
      type: 'admission',
      student
    });
  };

  const handlePrintReceipt = (payment: Payment) => {
    setPrintConfig({
      isOpen: true,
      type: 'receipt',
      payment
    });
  };

  return (
    <div className="min-h-screen bg-[#FBF8F5] flex flex-col text-[#2C1810]">
      {/* Header */}
      <Header 
        onOpenGateReport={handleOpenGateReport} 
        onNavigate={(tab) => setActiveTab(tab)}
      />

      {/* Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView 
            onNavigate={(tab) => setActiveTab(tab)} 
            onOpenGateReport={handleOpenGateReport} 
          />
        )}

        {activeTab === 'branches' && (
          <BranchesView 
            onNavigateToStats={() => setActiveTab('dashboard')} 
          />
        )}

        {activeTab === 'students' && (
          <StudentsView 
            onSelectStudent={(s) => setSelectedStudent(s)} 
            onPrintAdmissionSlip={handlePrintAdmissionSlip} 
          />
        )}

        {activeTab === 'student_attendance' && (
          <StudentAttendanceView 
            onNavigateToWhatsApp={() => setActiveTab('whatsapp')} 
          />
        )}

        {activeTab === 'teacher_attendance' && (
          <TeacherAttendanceView />
        )}

        {activeTab === 'finance' && (
          <FinanceView 
            onPrintReceipt={handlePrintReceipt} 
          />
        )}

        {activeTab === 'book_sales' && (
          <FinanceView 
            initialSubTab="books"
            onPrintReceipt={handlePrintReceipt} 
          />
        )}

        {activeTab === 'points' && (
          <PointsView />
        )}

        {activeTab === 'discipline' && (
          <DisciplineView 
            onOpenWhatsApp={(studentId, level) => setActiveTab('whatsapp')} 
          />
        )}

        {activeTab === 'whatsapp' && (
          <WhatsAppView />
        )}

        {activeTab === 'reports' && (
          <ReportsView 
            onOpenGateReport={handleOpenGateReport} 
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-[#FFFFFF] border-t border-[#E8DCCF] py-4 text-xs text-[#8C6D53]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-center sm:text-right">
            <span className="font-bold text-[#4A2F18]">منصة السعيد — نظام إدارة المدارس القرآنية</span>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <span>جميع الحقوق محفوظة © 1448 هـ / 2027 م</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#F6EEE4] hover:bg-[#EADDCF] text-[#4A2F18] font-bold rounded-lg transition cursor-pointer text-[11px]"
              title="عرض الدليل التفصيلي الشامل لمنصة السعيد"
            >
              <span>📖 الدليل التفصيلي للمنصة</span>
            </button>
            <span className="tabular-nums font-bold bg-[#FAF6F0] px-3 py-1 rounded-full border border-[#E8DCCF] text-[#4A2F18]">
              الإصدار 1.0 • 1448 هـ / 2027 م
            </span>
          </div>
        </div>
      </footer>

      {/* Student Details Full Modal */}
      {selectedStudent && (
        <StudentModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onPrintAdmissionSlip={handlePrintAdmissionSlip}
        />
      )}

      {/* Print Document Modal */}
      {printConfig.isOpen && (
        <PrintModal
          type={printConfig.type}
          student={printConfig.student}
          payment={printConfig.payment}
          onClose={() => setPrintConfig({ isOpen: false, type: null })}
        />
      )}

      {/* Comprehensive Platform User Guide Modal */}
      {isGuideModalOpen && (
        <UserGuideModal
          isOpen={isGuideModalOpen}
          onClose={() => setIsGuideModalOpen(false)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// Authentication Portal for Schools & Creator
import { SchoolAuthPortal } from './components/auth/SchoolAuthPortal';
import { CreatorLoginPage } from './components/auth/CreatorLoginPage';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { StudentsView } from './components/students/StudentsView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { GradesView } from './components/academics/GradesView';
import { BulletinsView } from './components/academics/BulletinsView';
import { TimetablesView } from './components/academics/TimetablesView';
import { PaymentsView } from './components/finances/PaymentsView';
import { UnpaidView } from './components/finances/UnpaidView';
import { FinancesView } from './components/finances/FinancesView';
import { ClassesView } from './components/classes/ClassesView';
import { TeachersView } from './components/teachers/TeachersView';
import { ParentsView } from './components/parents/ParentsView';
import { SmsCenterView } from './components/sms/SmsCenterView';
import { SmsHistoryView } from './components/sms/SmsHistoryView';
import { SmsTemplatesView } from './components/sms/SmsTemplatesView';
import { SmsSettingsView } from './components/sms/SmsSettingsView';
import { SettingsView } from './components/settings/SettingsView';
import { SuperAdminView } from './components/admin/SuperAdminView';
import { SchoolSupportView } from './components/support/SchoolSupportView';

// Modals
import { StudentDetailModal } from './components/students/StudentDetailModal';
import { StudentFormModal } from './components/students/StudentFormModal';
import { ExcelImportModal } from './components/students/ExcelImportModal';
import { PaymentModal } from './components/finances/PaymentModal';
import { ReceiptModal } from './components/finances/ReceiptModal';
import { SendSmsModal } from './components/sms/SendSmsModal';
import { BulkUnpaidSmsModal } from './components/sms/BulkUnpaidSmsModal';
import { BulkGradesSmsModal } from './components/sms/BulkGradesSmsModal';
import { BulkAnnouncementSmsModal } from './components/sms/BulkAnnouncementSmsModal';
import { BulletinPrintModal } from './components/academics/BulletinPrintModal';
import { SchoolEditModal } from './components/settings/SchoolEditModal';
import { NewSchoolModal } from './components/admin/NewSchoolModal';
import { BulkEnrollStudentsModal } from './components/students/BulkEnrollStudentsModal';

const MainContent: React.FC = () => {
  const { currentView, activeModal, modalData, closeModal, toast, isAuthenticated } = useApp();
  
  const isCreatorUrl = () => {
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return hash === '#creator' || hash === '#admin' || search.includes('creator') || search.includes('admin');
  };

  const [showCreatorPortal, setShowCreatorPortal] = React.useState(isCreatorUrl);

  // Listen to URL hash or query changes and keyboard shortcut (Ctrl+Shift+A) for discrete Creator access
  React.useEffect(() => {
    const handleHashChange = () => {
      setShowCreatorPortal(isCreatorUrl());
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret key combination: Ctrl+Shift+A or Alt+A to toggle creator portal
      if ((e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) || (e.altKey && (e.key === 'a' || e.key === 'A'))) {
        e.preventDefault();
        setShowCreatorPortal(prev => !prev);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // If user is not logged in, show either the School Portal or the dedicated Creator Login
  if (!isAuthenticated) {
    if (showCreatorPortal) {
      return (
        <CreatorLoginPage
          onBackToSchoolPortal={() => {
            setShowCreatorPortal(false);
            if (window.location.hash) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }}
        />
      );
    }
    return <SchoolAuthPortal />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'students':
      case 'enrollment':
        return <StudentsView />;
      case 'attendance':
        return <AttendanceView />;
      case 'grades':
        return <GradesView />;
      case 'bulletins':
        return <BulletinsView />;
      case 'timetables':
      case 'timetable':
        return <TimetablesView />;
      case 'payments':
        return <PaymentsView />;
      case 'unpaid':
        return <UnpaidView />;
      case 'finances':
        return <FinancesView />;
      case 'sms':
        return <SmsCenterView />;
      case 'sms_history':
        return <SmsHistoryView />;
      case 'sms_templates':
        return <SmsTemplatesView />;
      case 'sms_settings':
        return <SmsSettingsView />;
      case 'classes':
        return <ClassesView />;
      case 'teachers':
        return <TeachersView />;
      case 'parents':
        return <ParentsView />;
      case 'support':
        return <SchoolSupportView />;
      case 'settings':
        return <SettingsView />;
      case 'super_admin':
      case 'superadmin':
        return <SuperAdminView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header onOpenMobileMenu={() => {}} />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {renderView()}
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-sm border text-xs font-bold flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-800'
              : toast.type === 'error'
              ? 'bg-red-600 text-white border-red-700'
              : toast.type === 'warning'
              ? 'bg-amber-500 text-white border-amber-600'
              : 'bg-blue-600 text-white border-blue-700'
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* Dynamic Modals */}
      {activeModal === 'student_detail' && modalData && (
        <StudentDetailModal student={modalData} onClose={closeModal} />
      )}
      {(activeModal === 'add_student' || activeModal === 'enroll_student') && (
        <StudentFormModal onClose={closeModal} />
      )}
      {activeModal === 'import_excel' && (
        <ExcelImportModal onClose={closeModal} />
      )}
      {activeModal === 'record_payment' && (
        <PaymentModal initialData={modalData} onClose={closeModal} />
      )}
      {activeModal === 'receipt' && modalData && (
        <ReceiptModal payment={modalData} onClose={closeModal} />
      )}
      {(activeModal === 'send_sms' || activeModal === 'send_sms_single' || activeModal === 'send_sms_class') && (
        <SendSmsModal initialData={modalData} onClose={closeModal} />
      )}
      {activeModal === 'bulk_sms_unpaid' && (
        <BulkUnpaidSmsModal
          initialClassId={modalData?.classId}
          onClose={closeModal}
        />
      )}
      {(activeModal === 'bulk_sms_grades' || activeModal === 'bulk_sms_bulletins') && (
        <BulkGradesSmsModal
          initialClassId={modalData?.classId}
          initialTerm={modalData?.term}
          onClose={closeModal}
        />
      )}
      {(activeModal === 'bulk_sms_announcement' || activeModal === 'bulk_announcement') && (
        <BulkAnnouncementSmsModal
          initialTargetType={modalData?.targetType}
          initialClassId={modalData?.classId}
          onClose={closeModal}
        />
      )}
      {activeModal === 'bulletin_view' && modalData && (
        <BulletinPrintModal
          student={modalData.student}
          avg={modalData.avg}
          rank={modalData.rank}
          mention={modalData.mention}
          term={modalData.term}
          onClose={closeModal}
        />
      )}
      {activeModal === 'edit_school' && (
        <SchoolEditModal onClose={closeModal} />
      )}
      {activeModal === 'new_school' && (
        <NewSchoolModal onClose={closeModal} />
      )}
      {(activeModal === 'bulk_enroll_students' || activeModal === 'bulk_enroll') && (
        <BulkEnrollStudentsModal onClose={closeModal} />
      )}
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;

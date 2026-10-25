import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  School, User, UserRole, Student, Parent, ClassRoom, Subject,
  AttendanceRecord, GradeEntry, PaymentTransaction, SmsMessage,
  SmsTemplate, AuditLog, SubscriptionPlan, TimetableSlot, SupportMessage
} from '../types';
import {
  INITIAL_SCHOOL, OTHER_SCHOOLS, INITIAL_USERS, INITIAL_CLASSES,
  INITIAL_SUBJECTS, INITIAL_PARENTS, INITIAL_STUDENTS, INITIAL_PAYMENTS,
  INITIAL_SMS_MESSAGES, INITIAL_SMS_TEMPLATES, INITIAL_SUBSCRIPTION_PLANS,
  INITIAL_AUDIT_LOGS, INITIAL_TIMETABLE
} from '../data/mockDatabase';
import { generateStudentsForClasses } from '../data/ivorianStudentGenerator';
import { detectCarrier } from '../utils/formatters';
import { signOutStaff, hasActiveSession } from '../lib/auth';
import { supabaseConfigured } from '../lib/supabase';

interface AppContextType {
  school: School;
  schools: School[];
  currentUser: User;
  users: User[];
  currentRole: UserRole;
  academicYear: string;
  currentView: string;
  activeNavGroup?: string;
  isAuthenticated: boolean;
  isCreatorSession: boolean;
  
  // Data
  students: Student[];
  parents: Parent[];
  classes: ClassRoom[];
  subjects: Subject[];
  attendances: AttendanceRecord[];
  grades: GradeEntry[];
  payments: PaymentTransaction[];
  smsMessages: SmsMessage[];
  smsTemplates: SmsTemplate[];
  supportMessages: SupportMessage[];
  auditLogs: AuditLog[];
  plans: SubscriptionPlan[];
  timetable: TimetableSlot[];

  // Navigation & Modals
  setCurrentView: (view: string) => void;
  setCurrentRole: (role: UserRole) => void;
  setCurrentSchool: (schoolId: string) => void;
  setAcademicYear: (year: string) => void;
  
  // Auth actions
  loginAsSchool: (schoolId: string) => void;
  loginAsCreator: () => void;
  establishStaffSession: (role: UserRole, school: School | null) => void;
  logoutSchool: () => void;
  registerSchool: (newSchool: School) => void;
  
  // Modal states
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  activeModal: string | null;
  modalData: any;
  openModal: (modalName: string, data?: any) => void;
  closeModal: () => void;

  // Actions
  addStudent: (student: Omit<Student, 'id' | 'matricule' | 'unjustifiedAbsencesCount' | 'paidTuition' | 'unpaidTuition'> & { initialPayment?: number; paymentMethod?: any }) => Student;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  populateStudentsForAllClasses: (countPerClass?: number, replaceExisting?: boolean, targetClassIds?: string[]) => void;
  enrollStudentsForClass: (classId: string, count?: number) => void;

  addParent: (parent: Omit<Parent, 'id' | 'childrenIds' | 'totalDebt'>) => Parent;
  updateParent: (id: string, data: Partial<Parent>) => void;

  recordPayment: (payment: Omit<PaymentTransaction, 'id' | 'receiptNumber' | 'date' | 'time' | 'recordedByUserId' | 'recordedByUserName' | 'status' | 'remainingStudentBalance' | 'smsSent'>, sendSms: boolean) => PaymentTransaction;
  
  saveAttendanceBatch: (records: Omit<AttendanceRecord, 'id' | 'smsSent' | 'recordedByTeacher'>[], autoSendSms: boolean) => void;
  
  saveGrade: (grade: Omit<GradeEntry, 'id'>) => void;
  saveGradeBatch: (entries: Omit<GradeEntry, 'id'>[]) => void;
  recalculateStudentAverages: (classId?: string) => void;

  // Timetable
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => TimetableSlot;
  updateTimetableSlot: (id: string, data: Partial<TimetableSlot>) => void;
  deleteTimetableSlot: (id: string) => void;
  generateDefaultScheduleForClass: (classId: string) => void;

  sendSms: (phone: string, recipientName: string, message: string, triggerType: SmsMessage['triggerType'], studentName?: string, className?: string) => Promise<SmsMessage>;
  sendBulkSms: (
    targets: {
      phone: string;
      name: string;
      studentName?: string;
      className?: string;
      customMessage?: string;
      average?: string | number;
      rank?: string | number;
      classSize?: string | number;
      term?: string;
      mention?: string;
      unpaidAmount?: string | number;
      paidAmount?: string | number;
      totalAmount?: string | number;
      deadline?: string;
    }[],
    messageTemplate: string,
    triggerType: SmsMessage['triggerType']
  ) => Promise<number>;

  updateSmsTemplate: (id: string, content: string) => void;
  updateSchool: (data: Partial<School>) => void;
  updateSchoolInfo: (data: Partial<School>) => void;
  switchSchool: (schoolId: string) => void;
  grantSmsToSchool: (schoolId: string, amountFcfa: number) => void;
  deleteSchool: (schoolId: string) => void;
  sendSupportMessage: (data: Omit<SupportMessage, 'id' | 'timestamp' | 'readBySchool' | 'readByCreator' | 'status'>) => void;
  addAuditLog: (action: string, entityType: AuditLog['entityType'], details: string, entityId?: string) => void;
  
  // Notifications toast
  toast: { message: string; type: 'success' | 'info' | 'error' | 'warning' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Filter out any previous demo schools so the platform starts completely clean
  const [schools, setSchools] = useState<School[]>(() => {
    try {
      const saved = localStorage.getItem('educi_schools');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(s => s && s.id && !s.id.includes('demo') && !s.id.includes('le_reperes') && !s.id.includes('notre_dame') && s.id !== 'sch_default');
      }
      return [];
    } catch {
      return [];
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('educi_auth_active') === 'true';
  });

  // Une session locale ne suffit pas : on vérifie qu'une vraie session Supabase existe encore
  useEffect(() => {
    if (!supabaseConfigured) return;
    hasActiveSession().then((active) => {
      if (!active) {
        setIsAuthenticated(false);
        setIsCreatorSession(false);
        localStorage.removeItem('educi_auth_active');
        localStorage.removeItem('educi_is_creator');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isCreatorSession, setIsCreatorSession] = useState<boolean>(() => {
    return localStorage.getItem('educi_is_creator') === 'true';
  });

  const [school, setSchool] = useState<School>(() => {
    try {
      const saved = localStorage.getItem('educi_current_school');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && !parsed.id.includes('demo') && parsed.id !== 'sch_default' && parsed.id !== 'sch_le_reperes') {
          return parsed;
        }
      }
    } catch {}
    return {
      id: '',
      name: 'Mon Établissement',
      shortCode: 'ETAB',
      motto: 'Discipline - Travail - Réussite',
      type: 'COLLEGE_LYCEE',
      drena: 'DRENA Abidjan 1',
      city: 'Abidjan',
      district: '',
      address: '',
      phone: '+225 ',
      email: '',
      directorName: '',
      currentAcademicYear: '2025 - 2026',
      smsSenderId: 'SCOLACI',
      smsBalance: 0,
      smsProvider: 'ORANGE_CI',
      smsAutoSendAbsence: true,
      smsAutoSendPayment: true,
      smsAutoSendEnrollment: true,
      smsAutoSendReportCard: true,
      smsAutoSendUnpaidReminder: true,
      subscriptionPlan: 'PRO',
      subscriptionStatus: 'ACTIF',
      maxStudents: 2000,
    };
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('educi_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => users[0]);
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return isCreatorSession ? 'SUPER_ADMIN' : 'DIRECTEUR';
  });
  const [academicYear, setAcademicYear] = useState<string>('2025 - 2026');
  const [currentView, setCurrentView] = useState<string>(() => {
    return isCreatorSession ? 'super_admin' : 'dashboard';
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('educi_students');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    const initialCls = localStorage.getItem('educi_classes')
      ? JSON.parse(localStorage.getItem('educi_classes')!)
      : INITIAL_CLASSES;
    const cohort = generateStudentsForClasses(initialCls, 8, 'Mon Établissement');
    return cohort.students;
  });

  const [parents, setParents] = useState<Parent[]>(() => {
    const saved = localStorage.getItem('educi_parents');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    const initialCls = localStorage.getItem('educi_classes')
      ? JSON.parse(localStorage.getItem('educi_classes')!)
      : INITIAL_CLASSES;
    const cohort = generateStudentsForClasses(initialCls, 8, 'Mon Établissement');
    return cohort.parents;
  });

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const saved = localStorage.getItem('educi_classes');
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [subjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  
  const [payments, setPayments] = useState<PaymentTransaction[]>(() => {
    const saved = localStorage.getItem('educi_payments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    const initialCls = localStorage.getItem('educi_classes')
      ? JSON.parse(localStorage.getItem('educi_classes')!)
      : INITIAL_CLASSES;
    const cohort = generateStudentsForClasses(initialCls, 8, 'Mon Établissement');
    return cohort.payments;
  });

  const [smsMessages, setSmsMessages] = useState<SmsMessage[]>(() => {
    const saved = localStorage.getItem('educi_sms');
    return saved ? JSON.parse(saved) : [];
  });

  const [smsTemplates, setSmsTemplates] = useState<SmsTemplate[]>(() => {
    const saved = localStorage.getItem('educi_sms_templates');
    return saved ? JSON.parse(saved) : INITIAL_SMS_TEMPLATES;
  });

  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>(() => {
    const saved = localStorage.getItem('educi_support_messages');
    return saved ? JSON.parse(saved) : [
      {
        id: 'sup_welcome_01',
        schoolId: 'sch_default',
        schoolName: 'Assistance Centrale',
        senderRole: 'CREATEUR',
        senderName: 'Support technique',
        message: 'Bienvenue sur la plateforme. Pour commencer, renseignez les informations de votre établissement dans les paramètres.',
        subject: 'Bienvenue sur la plateforme',
        category: 'ASSISTANCE_TECHNIQUE',
        timestamp: 'Aujourd\'hui',
        readBySchool: true,
        readByCreator: true,
        status: 'RESOLU',
      }
    ];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('educi_audit_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [plans] = useState<SubscriptionPlan[]>(INITIAL_SUBSCRIPTION_PLANS);
  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem('educi_timetable');
    return saved ? JSON.parse(saved) : [];
  });

  // UI state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' | 'warning' } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('educi_schools', JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    localStorage.setItem('educi_support_messages', JSON.stringify(supportMessages));
  }, [supportMessages]);

  useEffect(() => {
    localStorage.setItem('educi_auth_active', String(isAuthenticated));
    localStorage.setItem('educi_is_creator', String(isCreatorSession));
  }, [isAuthenticated, isCreatorSession]);

  useEffect(() => {
    localStorage.setItem('educi_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('educi_parents', JSON.stringify(parents));
  }, [parents]);

  useEffect(() => {
    localStorage.setItem('educi_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('educi_sms', JSON.stringify(smsMessages));
  }, [smsMessages]);

  useEffect(() => {
    localStorage.setItem('educi_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('educi_current_school', JSON.stringify(school));
  }, [school]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' | 'warning' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const openModal = (modalName: string, data: any = null) => {
    setActiveModal(modalName);
    setModalData(data);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  const addAuditLog = (action: string, entityType: AuditLog['entityType'], details: string, entityId?: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentRole,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: '160.155.19.42 (Abidjan CI)',
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Helper to generate default standard Ivorian classes
  const createDefaultClassesForType = (type: School['type']): ClassRoom[] => {
    const collegeClasses: ClassRoom[] = [
      { id: `cls_6e1_${Date.now()}`, name: '6e 1', level: 'COLLEGE', capacity: 55, studentCount: 0, roomNumber: 'Salle 01', academicYear: '2025 - 2026', tuitionFee: 150000 },
      { id: `cls_6e2_${Date.now()}`, name: '6e 2', level: 'COLLEGE', capacity: 55, studentCount: 0, roomNumber: 'Salle 02', academicYear: '2025 - 2026', tuitionFee: 150000 },
      { id: `cls_5e1_${Date.now()}`, name: '5e 1', level: 'COLLEGE', capacity: 55, studentCount: 0, roomNumber: 'Salle 03', academicYear: '2025 - 2026', tuitionFee: 160000 },
      { id: `cls_5e2_${Date.now()}`, name: '5e 2', level: 'COLLEGE', capacity: 55, studentCount: 0, roomNumber: 'Salle 04', academicYear: '2025 - 2026', tuitionFee: 160000 },
      { id: `cls_4e1_${Date.now()}`, name: '4e 1', level: 'COLLEGE', capacity: 50, studentCount: 0, roomNumber: 'Salle 05', academicYear: '2025 - 2026', tuitionFee: 170000 },
      { id: `cls_4e2_${Date.now()}`, name: '4e 2', level: 'COLLEGE', capacity: 50, studentCount: 0, roomNumber: 'Salle 06', academicYear: '2025 - 2026', tuitionFee: 170000 },
      { id: `cls_3e1_${Date.now()}`, name: '3e 1', level: 'COLLEGE', capacity: 50, studentCount: 0, roomNumber: 'Salle 07', academicYear: '2025 - 2026', tuitionFee: 180000 },
      { id: `cls_3e2_${Date.now()}`, name: '3e 2', level: 'COLLEGE', capacity: 50, studentCount: 0, roomNumber: 'Salle 08', academicYear: '2025 - 2026', tuitionFee: 180000 },
    ];

    const lyceeClasses: ClassRoom[] = [
      { id: `cls_2ndeA_${Date.now()}`, name: '2nde A', level: 'LYCEE', series: 'A', capacity: 50, studentCount: 0, roomNumber: 'Salle 10', academicYear: '2025 - 2026', tuitionFee: 190000 },
      { id: `cls_2ndeC_${Date.now()}`, name: '2nde C', level: 'LYCEE', series: 'C', capacity: 45, studentCount: 0, roomNumber: 'Salle 11', academicYear: '2025 - 2026', tuitionFee: 195000 },
      { id: `cls_1ereA_${Date.now()}`, name: '1ère A', level: 'LYCEE', series: 'A', capacity: 50, studentCount: 0, roomNumber: 'Salle 12', academicYear: '2025 - 2026', tuitionFee: 200000 },
      { id: `cls_1ereD_${Date.now()}`, name: '1ère D', level: 'LYCEE', series: 'D', capacity: 45, studentCount: 0, roomNumber: 'Salle 13', academicYear: '2025 - 2026', tuitionFee: 205000 },
      { id: `cls_TleA_${Date.now()}`, name: 'Terminale A', level: 'LYCEE', series: 'A', capacity: 50, studentCount: 0, roomNumber: 'Salle 14', academicYear: '2025 - 2026', tuitionFee: 210000 },
      { id: `cls_TleD_${Date.now()}`, name: 'Terminale D', level: 'LYCEE', series: 'D', capacity: 45, studentCount: 0, roomNumber: 'Salle 15', academicYear: '2025 - 2026', tuitionFee: 220000 },
    ];

    if (type === 'COLLEGE') return collegeClasses;
    if (type === 'LYCEE') return lyceeClasses;
    return [...collegeClasses, ...lyceeClasses];
  };

  const loginAsSchool = (schoolId: string) => {
    const found = schools.find(s => s.id === schoolId);
    if (found) {
      setSchool(found);
      setIsAuthenticated(true);
      setIsCreatorSession(false);
      setCurrentRole('DIRECTEUR');
      setCurrentView('dashboard');
      showToast(`Bienvenue sur l'espace de gestion de : ${found.name}`, 'success');
      addAuditLog('CONNEXION_ETABLISSEMENT', 'SETTING', `Connexion à l'espace ${found.name}`);
    }
  };

  const loginAsCreator = () => {
    setIsAuthenticated(true);
    setIsCreatorSession(true);
    setCurrentRole('SUPER_ADMIN');
    setCurrentView('super_admin');
    showToast('Bienvenue dans la console Super Admin / Créateur de la plateforme !', 'success');
  };

  const establishStaffSession = (role: UserRole, staffSchool: School | null) => {
    if (role === 'SUPER_ADMIN' || !staffSchool) {
      loginAsCreator();
      return;
    }
    setSchool(staffSchool);
    setIsAuthenticated(true);
    setIsCreatorSession(false);
    setCurrentRole(role);
    setCurrentView('dashboard');
    showToast(`Bienvenue sur l'espace de gestion de : ${staffSchool.name}`, 'success');
    addAuditLog('CONNEXION_ETABLISSEMENT', 'SETTING', `Connexion à l'espace ${staffSchool.name}`);
  };

  const logoutSchool = () => {
    setIsAuthenticated(false);
    setIsCreatorSession(false);
    localStorage.removeItem('educi_auth_active');
    localStorage.removeItem('educi_is_creator');
    void signOutStaff();
    showToast('Session fermée.', 'info');
  };

  const registerSchool = (newSchool: School) => {
    const defaultClasses = createDefaultClassesForType(newSchool.type);
    const cohort = generateStudentsForClasses(defaultClasses, 8, newSchool.name);
    
    const classesWithCount = defaultClasses.map(c => ({
      ...c,
      studentCount: 8,
    }));

    setClasses(classesWithCount);
    setStudents(cohort.students);
    setParents(cohort.parents);
    setPayments(cohort.payments);
    setSchools(prev => [newSchool, ...prev]);
    setSchool(newSchool);
    setIsAuthenticated(true);
    setIsCreatorSession(false);
    setCurrentRole('DIRECTEUR');
    setCurrentView('dashboard');
    
    // Automatically send a welcome message from the creator
    const welcomeMsg: SupportMessage = {
      id: `sup_init_${Date.now()}`,
      schoolId: newSchool.id,
      schoolName: newSchool.name,
      senderRole: 'CREATEUR',
      senderName: 'Support technique',
      message: `Félicitations pour l'inscription de l'établissement ${newSchool.name} (${newSchool.city}) ! Vos ${classesWithCount.length} classes ont été créées et ${cohort.students.length} élèves y ont été inscrits avec leurs fiches parents, scolarités et moyennes de départ. Un crédit initial de ${newSchool.smsBalance.toLocaleString('fr-FR')} FCFA est alloué à votre compte. N'hésitez pas à utiliser cette messagerie pour toute assistance technique.`,
      subject: 'Bienvenue sur la plateforme',
      category: 'ASSISTANCE_TECHNIQUE',
      timestamp: 'À l\'instant',
      readBySchool: false,
      readByCreator: true,
      status: 'OUVERT',
    };
    setSupportMessages(prev => [welcomeMsg, ...prev]);

    showToast(`Établissement "${newSchool.name}" créé avec succès ! ${cohort.students.length} élèves inscrits dans toutes les classes.`, 'success');
    addAuditLog('CREATION_ETABLISSEMENT', 'SETTING', `Création du nouvel établissement : ${newSchool.name} (${newSchool.city}) et inscription de ${cohort.students.length} élèves`);
  };

  const sendSupportMessage = (data: Omit<SupportMessage, 'id' | 'timestamp' | 'readBySchool' | 'readByCreator' | 'status'>) => {
    const newMsg: SupportMessage = {
      ...data,
      id: `sup_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      readBySchool: data.senderRole === 'DIRECTEUR',
      readByCreator: data.senderRole === 'CREATEUR',
      status: 'OUVERT',
    };
    setSupportMessages(prev => [newMsg, ...prev]);
  };

  const grantSmsToSchool = (schoolId: string, amountFcfa: number) => {
    setSchools(prev => prev.map(s => {
      if (s.id === schoolId) {
        return { ...s, smsBalance: (s.smsBalance || 0) + amountFcfa };
      }
      return s;
    }));
    if (school.id === schoolId) {
      setSchool(prev => ({ ...prev, smsBalance: (prev.smsBalance || 0) + amountFcfa }));
    }
  };

  const deleteSchool = (schoolId: string) => {
    setSchools(prev => prev.filter(s => s.id !== schoolId));
    setSupportMessages(prev => prev.filter(m => m.schoolId !== schoolId));
    showToast('Établissement supprimé avec succès.', 'info');
  };

  const setCurrentSchool = (schoolId: string) => {
    const found = schools.find(s => s.id === schoolId);
    if (found) {
      setSchool(found);
      showToast(`Espace commuté : ${found.name}`, 'success');
      addAuditLog('CHANGEMENT_ETABLISSEMENT', 'SETTING', `Basculé vers l'école ${found.name}`);
    }
  };

  const switchSchool = (schoolId: string) => {
    setCurrentSchool(schoolId);
  };


  const updateSchool = (data: Partial<School>) => {
    // Only Director and Super Admin are permitted to change school parameters and identity
    if (currentRole !== 'DIRECTEUR' && currentRole !== 'SUPER_ADMIN') {
      showToast('Action refusée : Seul le Chef d\'Établissement / Directeur peut modifier le nom et les coordonnées de l\'école.', 'error');
      return;
    }

    const updated = { ...school, ...data };
    setSchool(updated);
    setSchools(prev => prev.map(s => s.id === school.id ? updated : s));
    showToast(`Établissement mis à jour : "${updated.name}"`, 'success');
    addAuditLog('MISE_A_JOUR_ETABLISSEMENT', 'SETTING', `Modification du nom/coordonnées de l'école : ${updated.name}`);
  };

  const updateSchoolInfo = (data: Partial<School>) => {
    updateSchool(data);
  };

  // Add Student
  const addStudent = (studentData: Omit<Student, 'id' | 'matricule' | 'unjustifiedAbsencesCount' | 'paidTuition' | 'unpaidTuition'> & { initialPayment?: number; paymentMethod?: any }) => {
    const newId = `stu_${Date.now()}`;
    const matricule = `CI-2026-${String(students.length + 101).padStart(5, '0')}`;
    const initialPay = studentData.initialPayment || 0;
    const unpaid = Math.max(0, studentData.totalTuition - initialPay);

    const newStudent: Student = {
      ...studentData,
      id: newId,
      matricule,
      unjustifiedAbsencesCount: 0,
      paidTuition: initialPay,
      unpaidTuition: unpaid,
      generalAverage: 0,
      rank: students.length + 1,
    };

    setStudents(prev => [newStudent, ...prev]);

    // Check parent exists or create/link
    let targetParent = parents.find(p => p.id === studentData.parentId || p.phone === studentData.parentPhone);
    if (targetParent) {
      setParents(prev => prev.map(p => p.id === targetParent!.id ? {
        ...p,
        childrenIds: [...p.childrenIds, newId],
        totalDebt: p.totalDebt + unpaid
      } : p));
    } else {
      const newParent: Parent = {
        id: `par_${Date.now()}`,
        firstName: studentData.parentName.split(' ')[0] || 'Parent',
        lastName: studentData.parentName.split(' ').slice(1).join(' ') || studentData.lastName,
        phone: studentData.parentPhone,
        address: studentData.address,
        relation: (studentData.parentRelation as any) || 'PERE',
        childrenIds: [newId],
        preferredChannel: 'SMS',
        totalDebt: unpaid,
      };
      setParents(prev => [newParent, ...prev]);
    }

    // Record initial payment if provided
    if (initialPay > 0) {
      recordPayment({
        studentId: newId,
        studentName: `${studentData.firstName} ${studentData.lastName}`,
        matricule,
        classId: studentData.classId,
        className: studentData.className,
        parentName: studentData.parentName,
        parentPhone: studentData.parentPhone,
        amount: initialPay,
        feeCategory: 'Inscription & 1ère Tranche',
        paymentMethod: studentData.paymentMethod || 'ESPECES',
        remarks: 'Paiement initial lors de l\'inscription',
      }, school.smsAutoSendPayment);
    }

    // Auto SMS for Enrollment
    if (school.smsAutoSendEnrollment) {
      sendSms(
        studentData.parentPhone,
        studentData.parentName,
        `ÉCOLE LA RÉUSSITE: L'inscription de votre enfant ${studentData.firstName} ${studentData.lastName} en classe de ${studentData.className} a bien été enregistrée. Matricule: ${matricule}. Bienvenue!`,
        'ENROLLMENT' as any,
        `${studentData.firstName} ${studentData.lastName}`,
        studentData.className
      );
    }

    addAuditLog('NOUVELLE_INSCRIPTION', 'STUDENT', `Inscription de ${newStudent.firstName} ${newStudent.lastName} en ${newStudent.className}`, newId);
    showToast(`Élève ${newStudent.firstName} ${newStudent.lastName} inscrit avec succès !`, 'success');
    return newStudent;
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    showToast('Fiche élève mise à jour', 'success');
    addAuditLog('MODIFICATION_ELEVE', 'STUDENT', `Mise à jour élève ID ${id}`, id);
  };

  const deleteStudent = (id: string) => {
    const student = students.find(s => s.id === id);
    if (!student) return;
    setStudents(prev => prev.filter(s => s.id !== id));
    showToast(`Élève ${student.firstName} ${student.lastName} supprimé`, 'info');
    addAuditLog('SUPPRESSION_ELEVE', 'STUDENT', `Suppression de ${student.firstName} ${student.lastName}`, id);
  };

  const populateStudentsForAllClasses = (
    countPerClass: number = 8,
    replaceExisting: boolean = false,
    targetClassIds?: string[]
  ) => {
    let targetClasses = classes;
    if (targetClasses.length === 0) {
      targetClasses = createDefaultClassesForType(school.type || 'COLLEGE_LYCEE');
      setClasses(targetClasses);
    }

    if (targetClassIds && targetClassIds.length > 0) {
      targetClasses = targetClasses.filter(c => targetClassIds.includes(c.id));
    }

    const cohort = generateStudentsForClasses(targetClasses, countPerClass, school.name);

    if (replaceExisting) {
      if (targetClassIds && targetClassIds.length > 0) {
        setStudents(prev => [...cohort.students, ...prev.filter(s => !targetClassIds.includes(s.classId))]);
        const newParentIds = new Set(cohort.parents.map(p => p.id));
        setParents(prev => [...cohort.parents, ...prev.filter(p => !newParentIds.has(p.id))]);
        setPayments(prev => [...cohort.payments, ...prev.filter(p => !targetClassIds.includes(p.classId))]);
      } else {
        setStudents(cohort.students);
        setParents(cohort.parents);
        setPayments(cohort.payments);
      }
    } else {
      setStudents(prev => [...cohort.students, ...prev]);
      setParents(prev => [...cohort.parents, ...prev]);
      setPayments(prev => [...cohort.payments, ...prev]);
    }

    // Update classes student counts
    setClasses(prev => prev.map(c => {
      if (targetClasses.some(tc => tc.id === c.id)) {
        const existingInClass = replaceExisting ? 0 : students.filter(s => s.classId === c.id).length;
        return {
          ...c,
          studentCount: existingInClass + countPerClass
        };
      }
      return c;
    }));

    showToast(`${cohort.students.length} élèves inscrits avec succès dans ${targetClasses.length} classe(s) !`, 'success');
    addAuditLog('INSCRIPTION_MASSE_CLASSES', 'STUDENT', `Inscription automatique de ${cohort.students.length} élèves (${school.name})`);
  };

  const enrollStudentsForClass = (classId: string, count: number = 8) => {
    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass) return;

    const cohort = generateStudentsForClasses([targetClass], count, school.name);
    setStudents(prev => [...cohort.students, ...prev]);
    setParents(prev => [...cohort.parents, ...prev]);
    setPayments(prev => [...cohort.payments, ...prev]);

    setClasses(prev => prev.map(c => c.id === classId ? {
      ...c,
      studentCount: (c.studentCount || 0) + count
    } : c));

    showToast(`${count} élèves inscrits avec succès en ${targetClass.name} !`, 'success');
    addAuditLog('INSCRIPTION_CLASSE', 'STUDENT', `Inscription de ${count} élèves en ${targetClass.name}`);
  };

  const addParent = (parentData: Omit<Parent, 'id' | 'childrenIds' | 'totalDebt'>) => {
    const newParent: Parent = {
      ...parentData,
      id: `par_${Date.now()}`,
      childrenIds: [],
      totalDebt: 0,
    };
    setParents(prev => [newParent, ...prev]);
    showToast(`Parent ${newParent.firstName} ${newParent.lastName} ajouté`, 'success');
    return newParent;
  };

  const updateParent = (id: string, data: Partial<Parent>) => {
    setParents(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    showToast('Fiche parent mise à jour', 'success');
  };

  // Record Payment
  const recordPayment = (
    paymentData: Omit<PaymentTransaction, 'id' | 'receiptNumber' | 'date' | 'time' | 'recordedByUserId' | 'recordedByUserName' | 'status' | 'remainingStudentBalance' | 'smsSent'>,
    sendSmsReceipt: boolean = true
  ) => {
    const receiptNumber = `REC-2026-${String(payments.length + 892).padStart(5, '0')}`;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Compute remaining student balance
    const student = students.find(s => s.id === paymentData.studentId);
    let remaining = 0;
    if (student) {
      const newPaid = student.paidTuition + paymentData.amount;
      remaining = Math.max(0, student.totalTuition - newPaid);

      setStudents(prev => prev.map(s => s.id === student.id ? {
        ...s,
        paidTuition: newPaid,
        unpaidTuition: remaining
      } : s));

      // Update parent debt
      setParents(prev => prev.map(p => p.id === student.parentId ? {
        ...p,
        totalDebt: Math.max(0, p.totalDebt - paymentData.amount)
      } : p));
    }

    const newPayment: PaymentTransaction = {
      ...paymentData,
      id: `pay_${Date.now()}`,
      receiptNumber,
      date: dateStr,
      time: timeStr,
      recordedByUserId: currentUser.id,
      recordedByUserName: currentUser.name,
      status: 'VALIDE',
      smsSent: false,
      remainingStudentBalance: remaining,
    };

    setPayments(prev => [newPayment, ...prev]);

    // Send SMS receipt if enabled
    if (sendSmsReceipt) {
      const smsText = `ÉCOLE LA RÉUSSITE: Votre paiement de ${paymentData.amount.toLocaleString('fr-FR')} FCFA pour ${paymentData.studentName} (${paymentData.className}) a bien été enregistré. Reste à payer: ${remaining.toLocaleString('fr-FR')} FCFA. Reçu N°: ${receiptNumber}. Merci!`;
      sendSms(
        paymentData.parentPhone,
        paymentData.parentName,
        smsText,
        'PAIEMENT',
        paymentData.studentName,
        paymentData.className
      );
      newPayment.smsSent = true;
    }

    addAuditLog('ENREGISTREMENT_PAIEMENT', 'PAYMENT', `Paiement de ${paymentData.amount} FCFA pour ${paymentData.studentName} (${receiptNumber})`, receiptNumber);
    showToast(`Paiement de ${paymentData.amount.toLocaleString('fr-FR')} FCFA enregistré avec succès ! Reçu: ${receiptNumber}`, 'success');
    return newPayment;
  };

  // Roll call batch save
  const saveAttendanceBatch = (records: Omit<AttendanceRecord, 'id' | 'smsSent' | 'recordedByTeacher'>[], autoSendSms: boolean) => {
    const newRecords: AttendanceRecord[] = records.map(r => ({
      ...r,
      id: `att_${Date.now()}_${r.studentId}`,
      smsSent: false,
      recordedByTeacher: currentUser.name,
    }));

    setAttendances(prev => [...newRecords, ...prev]);

    // If absent or late and SMS enabled, dispatch SMS
    let absentCount = 0;
    records.forEach(rec => {
      if (rec.status === 'ABSENT' || rec.status === 'RETARD') {
        absentCount++;
        const targetStudent = students.find(s => s.id === rec.studentId);
        if (targetStudent) {
          if (rec.status === 'ABSENT') {
            setStudents(prev => prev.map(s => s.id === rec.studentId ? {
              ...s,
              unjustifiedAbsencesCount: s.unjustifiedAbsencesCount + 1
            } : s));
          }

          if (autoSendSms && school.smsAutoSendAbsence) {
            const isLate = rec.status === 'RETARD';
            const msg = isLate
              ? `ÉCOLE LA RÉUSSITE: Bonjour, votre enfant ${targetStudent.firstName} ${targetStudent.lastName} (${targetStudent.className}) est arrivé en retard aujourd'hui ${rec.date} à ${rec.arrivalTime || '08h15'}.`
              : `ÉCOLE LA RÉUSSITE: Bonjour, votre enfant ${targetStudent.firstName} ${targetStudent.lastName} (${targetStudent.className}) a été signalé absent ce ${rec.date}. Merci de contacter l'administration au ${school.phone}.`;

            sendSms(
              targetStudent.parentPhone,
              targetStudent.parentName,
              msg,
              isLate ? 'RETARD' : 'ABSENCE',
              `${targetStudent.firstName} ${targetStudent.lastName}`,
              targetStudent.className
            );
          }
        }
      }
    });

    addAuditLog('VALIDATION_APPEL', 'ATTENDANCE', `Appel validé : ${records.length} élèves appelés, ${absentCount} absences/retards`);
    showToast(`Appel enregistré ! ${absentCount > 0 ? `${absentCount} alertes SMS déclenchées.` : 'Tous les élèves sont présents.'}`, 'success');
  };

  const saveGrade = (gradeData: Omit<GradeEntry, 'id'>) => {
    const newGrade: GradeEntry = {
      ...gradeData,
      id: `grd_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };
    setGrades(prev => [newGrade, ...prev]);
    showToast(`Note de ${gradeData.score}/${gradeData.maxScore} enregistrée`, 'success');
    addAuditLog('SAISIE_NOTE', 'GRADE', `Note attribuée à ${gradeData.studentName} en ${gradeData.subjectName}`);
  };

  const saveGradeBatch = (entries: Omit<GradeEntry, 'id'>[]) => {
    const newGrades: GradeEntry[] = entries.map((e, idx) => ({
      ...e,
      id: `grd_${Date.now()}_${idx}`,
    }));

    setGrades(prev => [...newGrades, ...prev]);
    addAuditLog('SAISIE_NOTES_GROUPEE', 'GRADE', `${entries.length} notes enregistrées pour la classe`);
    showToast(`${entries.length} notes enregistrées et moyennes actualisées avec succès !`, 'success');
  };

  const recalculateStudentAverages = (classId?: string) => {
    setStudents(prev => {
      return prev.map(s => {
        if (classId && s.classId !== classId) return s;
        // Compute realistic average if students have grades
        const studentGrades = grades.filter(g => g.studentId === s.id);
        let newAvg = s.generalAverage || 14.5;
        if (studentGrades.length > 0) {
          const totalPoints = studentGrades.reduce((sum, g) => sum + (g.score * (g.coefficient || 1)), 0);
          const totalCoef = studentGrades.reduce((sum, g) => sum + (g.coefficient || 1), 0);
          newAvg = totalCoef > 0 ? Number((totalPoints / totalCoef).toFixed(2)) : newAvg;
        }
        return {
          ...s,
          generalAverage: newAvg,
        };
      });
    });

    showToast('Moyennes générales et rangs de classe recalculés avec succès !', 'success');
    addAuditLog('RECALCUL_MOYENNES', 'GRADE', `Recalcul global des moyennes et classements pour ${classId || 'toutes les classes'}`);
  };

  // Timetable CRUD
  const addTimetableSlot = (slotData: Omit<TimetableSlot, 'id'>): TimetableSlot => {
    const newSlot: TimetableSlot = {
      ...slotData,
      id: `tt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };
    setTimetable(prev => [...prev, newSlot]);
    showToast(`Cours de ${slotData.subjectName} (${slotData.dayOfWeek} ${slotData.startTime}-${slotData.endTime}) ajouté !`, 'success');
    addAuditLog('AJOUT_CRENEAU_HORAIRE', 'SETTING', `Ajout cours ${slotData.subjectName} pour ${slotData.className}`);
    return newSlot;
  };

  const updateTimetableSlot = (id: string, data: Partial<TimetableSlot>) => {
    setTimetable(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    showToast('Créneau horaire mis à jour', 'success');
    addAuditLog('MODIFICATION_CRENEAU', 'SETTING', `Mise à jour créneau emploi du temps ID ${id}`);
  };

  const deleteTimetableSlot = (id: string) => {
    setTimetable(prev => prev.filter(s => s.id !== id));
    showToast('Créneau horaire supprimé', 'info');
    addAuditLog('SUPPRESSION_CRENEAU', 'SETTING', `Suppression créneau emploi du temps ID ${id}`);
  };

  const generateDefaultScheduleForClass = (classId: string) => {
    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass) return;

    const isLycee = targetClass.level === 'LYCEE';
    const slots: Omit<TimetableSlot, 'id'>[] = [
      { classId, className: targetClass.name, subjectId: 'sub_maths', subjectName: 'Mathématiques', teacherId: 'usr_prof_04', teacherName: 'M. Touré Amadou', dayOfWeek: 'LUNDI', startTime: '07:30', endTime: '09:30', room: targetClass.roomNumber || 'Salle 101' },
      { classId, className: targetClass.name, subjectId: 'sub_francais', subjectName: 'Français', teacherId: 'usr_prof_05', teacherName: 'Mme Diallo Fatoumata', dayOfWeek: 'LUNDI', startTime: '09:45', endTime: '11:45', room: targetClass.roomNumber || 'Salle 101' },
      { classId, className: targetClass.name, subjectId: 'sub_anglais', subjectName: 'Anglais', teacherId: 'usr_prof_05', teacherName: 'M. Coulibaly Sekou', dayOfWeek: 'LUNDI', startTime: '13:30', endTime: '15:30', room: targetClass.roomNumber || 'Salle 101' },
      { classId, className: targetClass.name, subjectId: 'sub_pc', subjectName: 'Physique-Chimie', teacherId: 'usr_prof_04', teacherName: 'M. Touré Amadou', dayOfWeek: 'MARDI', startTime: '07:30', endTime: '09:30', room: 'Labo Sciences' },
      { classId, className: targetClass.name, subjectId: 'sub_svt', subjectName: 'SVT', teacherId: 'usr_prof_04', teacherName: 'Dr. Konan Bertin', dayOfWeek: 'MARDI', startTime: '09:45', endTime: '11:45', room: 'Labo SVT' },
      { classId, className: targetClass.name, subjectId: 'sub_hg', subjectName: 'Histoire-Géographie', teacherId: 'usr_prof_05', teacherName: 'Mme Gbagbo Sylvie', dayOfWeek: 'MARDI', startTime: '13:30', endTime: '15:30', room: targetClass.roomNumber || 'Salle 101' },
      { classId, className: targetClass.name, subjectId: 'sub_maths', subjectName: 'Mathématiques', teacherId: 'usr_prof_04', teacherName: 'M. Touré Amadou', dayOfWeek: 'MERCREDI', startTime: '07:30', endTime: '09:30', room: targetClass.roomNumber || 'Salle 101' },
      { classId, className: targetClass.name, subjectId: isLycee ? 'sub_philo' : 'sub_edhc', subjectName: isLycee ? 'Philosophie' : 'EDHC', teacherId: 'usr_prof_05', teacherName: isLycee ? 'M. Yao Kouamé' : 'Mme Diallo Fatoumata', dayOfWeek: 'MERCREDI', startTime: '09:45', endTime: '11:45', room: targetClass.roomNumber || 'Salle 101' },
      { classId, className: targetClass.name, subjectId: 'sub_francais', subjectName: 'Français', teacherId: 'usr_prof_05', teacherName: 'Mme Diallo Fatoumata', dayOfWeek: 'JEUDI', startTime: '07:30', endTime: '09:30', room: targetClass.roomNumber || 'Salle 101' },
      { classId, className: targetClass.name, subjectId: 'sub_pc', subjectName: 'Physique-Chimie', teacherId: 'usr_prof_04', teacherName: 'M. Touré Amadou', dayOfWeek: 'JEUDI', startTime: '09:45', endTime: '11:45', room: 'Labo Sciences' },
      { classId, className: targetClass.name, subjectId: 'sub_info', subjectName: 'Informatique & Numérique', teacherId: 'usr_prof_04', teacherName: 'M. N\'Dri Pascal', dayOfWeek: 'JEUDI', startTime: '13:30', endTime: '15:30', room: 'Salle Multimédia' },
      { classId, className: targetClass.name, subjectId: 'sub_eps', subjectName: 'Éducation Physique (EPS)', teacherId: 'usr_prof_04', teacherName: 'M. N\'Dri Pascal', dayOfWeek: 'VENDREDI', startTime: '07:30', endTime: '09:30', room: 'Terrain de Sport' },
      { classId, className: targetClass.name, subjectId: 'sub_svt', subjectName: 'SVT', teacherId: 'usr_prof_04', teacherName: 'Dr. Konan Bertin', dayOfWeek: 'VENDREDI', startTime: '09:45', endTime: '11:45', room: 'Labo SVT' },
    ];

    // Remove existing slots for this class and replace with generated template
    const otherSlots = timetable.filter(s => s.classId !== classId);
    const newGenerated = slots.map((s, idx) => ({ ...s, id: `tt_gen_${Date.now()}_${idx}` }));
    setTimetable([...otherSlots, ...newGenerated]);
    showToast(`Emploi du temps officiel généré pour ${targetClass.name} (13 créneaux standards)`, 'success');
    addAuditLog('GENERATION_EMPLOI_DU_TEMPS', 'SETTING', `Génération automatique emploi du temps pour ${targetClass.name}`);
  };

  // SMS Dispatcher Engine
  const sendSms = async (
    phone: string,
    recipientName: string,
    message: string,
    triggerType: SmsMessage['triggerType'],
    studentName?: string,
    className?: string
  ): Promise<SmsMessage> => {
    const carrier = detectCarrier(phone);
    const cost = 20; // 20 FCFA per SMS segment
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);

    const newSms: SmsMessage = {
      id: `sms_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      recipientPhone: phone,
      recipientName,
      studentName,
      className,
      message,
      carrier,
      status: 'EN_ATTENTE',
      costFcfa: cost,
      segments: Math.ceil(message.length / 160) || 1,
      sentAt: dateStr,
      triggerType,
    };

    // Deduct balance
    setSchool(prev => ({
      ...prev,
      smsBalance: Math.max(0, prev.smsBalance - cost)
    }));

    setSmsMessages(prev => [newSms, ...prev]);

    // Live carrier simulation latency (instant or ~600ms delivery confirmation)
    setTimeout(() => {
      setSmsMessages(prev => prev.map(m => m.id === newSms.id ? {
        ...m,
        status: 'LIVRE',
        deliveredAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      } : m));
    }, 800);

    return newSms;
  };

  const sendBulkSms = async (
    targets: {
      phone: string;
      name: string;
      studentName?: string;
      className?: string;
      customMessage?: string;
      average?: string | number;
      rank?: string | number;
      classSize?: string | number;
      term?: string;
      mention?: string;
      unpaidAmount?: string | number;
      paidAmount?: string | number;
      totalAmount?: string | number;
      deadline?: string;
    }[],
    messageTemplate: string,
    triggerType: SmsMessage['triggerType']
  ): Promise<number> => {
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);

    let totalCost = 0;

    const generated: SmsMessage[] = targets.map((t, idx) => {
      let personalizedMsg = t.customMessage;

      if (!personalizedMsg) {
        personalizedMsg = messageTemplate
          .replace(/\[NOM\]/g, t.studentName || t.name)
          .replace(/\[PRENOM\]/g, t.studentName ? t.studentName.split(' ')[0] : t.name)
          .replace(/\[PARENT\]/g, t.name)
          .replace(/\[CLASSE\]/g, t.className || '')
          .replace(/\[SOLDE\]/g, t.unpaidAmount !== undefined ? String(t.unpaidAmount) : '')
          .replace(/\[PAYE\]/g, t.paidAmount !== undefined ? String(t.paidAmount) : '')
          .replace(/\[TOTAL\]/g, t.totalAmount !== undefined ? String(t.totalAmount) : '')
          .replace(/\[DATE_LIMITE\]/g, t.deadline || '30 du mois')
          .replace(/\[MOYENNE\]/g, t.average !== undefined ? String(t.average) : '')
          .replace(/\[RANG\]/g, t.rank !== undefined ? String(t.rank) : '')
          .replace(/\[EFFECTIF\]/g, t.classSize !== undefined ? String(t.classSize) : '')
          .replace(/\[TRIMESTRE\]/g, t.term || '')
          .replace(/\[MENTION\]/g, t.mention || '')
          .replace(/\[ECOLE\]/g, school.name.toUpperCase())
          .replace(/\[TELEPHONE_ECOLE\]/g, school.phone)
          .replace(/\[DATE\]/g, dateStr.substring(0, 10))
          .replace(/\[HEURE\]/g, dateStr.substring(11, 16));
      }

      const segments = Math.ceil(personalizedMsg.length / 160) || 1;
      const costForSms = 20 * segments;
      totalCost += costForSms;

      return {
        id: `sms_bulk_${Date.now()}_${idx}`,
        recipientPhone: t.phone,
        recipientName: t.name,
        studentName: t.studentName,
        className: t.className,
        message: personalizedMsg,
        carrier: detectCarrier(t.phone),
        status: 'EN_ATTENTE',
        costFcfa: costForSms,
        segments,
        sentAt: dateStr,
        triggerType,
      };
    });

    setSchool(prev => ({
      ...prev,
      smsBalance: Math.max(0, prev.smsBalance - totalCost)
    }));

    setSmsMessages(prev => [...generated, ...prev]);

    // Simulate carrier delivery
    setTimeout(() => {
      setSmsMessages(prev => prev.map(m => {
        if (generated.some(g => g.id === m.id)) {
          return {
            ...m,
            status: 'LIVRE',
            deliveredAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
          };
        }
        return m;
      }));
    }, 1200);

    addAuditLog('CAMPAGNE_SMS_ENVOYEE', 'SMS', `Envoi de ${targets.length} SMS (${totalCost} FCFA) - Type: ${triggerType}`);
    showToast(`Campagne groupée : ${targets.length} SMS envoyés avec succès !`, 'success');
    return targets.length;
  };

  const updateSmsTemplate = (id: string, content: string) => {
    setSmsTemplates(prev => prev.map(t => t.id === id ? { ...t, content } : t));
    showToast('Modèle SMS enregistré !', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        school,
        schools,
        currentUser,
        users,
        currentRole,
        academicYear,
        currentView,
        isAuthenticated,
        isCreatorSession,
        students,
        parents,
        classes,
        subjects,
        attendances,
        grades,
        payments,
        smsMessages,
        smsTemplates,
        supportMessages,
        auditLogs,
        plans,
        timetable,
        setCurrentView,
        setCurrentRole,
        setCurrentSchool,
        setAcademicYear,
        loginAsSchool,
        loginAsCreator,
        establishStaffSession,
        logoutSchool,
        isSearchOpen,
        setIsSearchOpen,
        activeModal,
        modalData,
        openModal,
        closeModal,
        addStudent,
        updateStudent,
        deleteStudent,
        populateStudentsForAllClasses,
        enrollStudentsForClass,
        addParent,
        updateParent,
        recordPayment,
        saveAttendanceBatch,
        saveGrade,
        saveGradeBatch,
        recalculateStudentAverages,
        addTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,
        generateDefaultScheduleForClass,
        sendSms,
        sendBulkSms,
        updateSmsTemplate,
        updateSchool,
        updateSchoolInfo,
        switchSchool,
        registerSchool,
        grantSmsToSchool,
        deleteSchool,
        sendSupportMessage,
        addAuditLog,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

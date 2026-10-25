export type UserRole = 'SUPER_ADMIN' | 'DIRECTEUR' | 'ADMIN' | 'COMPTABLE' | 'ENSEIGNANT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId: string;
  phone: string;
  avatar?: string;
  title?: string;
  active: boolean;
  assignedClassIds?: string[];
  subjectIds?: string[];
}

export interface School {
  id: string;
  name: string;
  shortCode: string;
  motto: string;
  type: 'COLLEGE' | 'LYCEE' | 'COLLEGE_LYCEE' | 'COLLEGE_TECHNIQUE' | 'TECHNIQUE' | 'PROFESSIONNEL' | 'UNIVERSITE' | 'CENTRE_FORMATION';
  drena?: string; // Direction Régionale de l'Éducation Nationale et de l'Alphabétisation (ex: DRENA Abidjan 1)
  iep?: string;   // Inspection de l'Enseignement
  statut?: 'PUBLIC' | 'PRIVE' | 'PRIVE_CONFESSIONNEL' | 'PRIVE_LAIC' | 'COMMUNAUTAIRE' | 'ASSOCIATIF';
  city: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  directorName: string;
  currentAcademicYear: string;
  logoUrl?: string;
  stampUrl?: string;
  smsSenderId: string;
  smsBalance: number; // in FCFA
  smsProvider: 'ORANGE_CI' | 'MTN_CI' | 'MOOV_CI' | 'INFOBIP' | 'TWILIO' | 'SIMULATOR';
  smsAutoSendAbsence: boolean;
  smsAutoSendPayment: boolean;
  smsAutoSendEnrollment: boolean;
  smsAutoSendReportCard: boolean;
  smsAutoSendUnpaidReminder: boolean;
  subscriptionPlan: 'STARTER' | 'PRO' | 'BUSINESS' | 'GROUPE';
  subscriptionStatus: 'ACTIF' | 'ESSAI' | 'EXPIRE';
  maxStudents: number;
}

export interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  secondaryPhone?: string;
  email?: string;
  address: string;
  profession?: string;
  relation: 'PERE' | 'MERE' | 'TUTEUR_LEGAL' | 'AUTRE';
  childrenIds: string[];
  preferredChannel: 'SMS' | 'APPEL';
  notes?: string;
  totalDebt: number;
}

export interface Student {
  id: string;
  matricule: string; // e.g. "CI-2026-0048"
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  dateOfBirth: string;
  placeOfBirth: string;
  photoUrl?: string;
  classId: string;
  className: string;
  level: string; // "3e", "Terminal D", etc.
  academicYear: string;
  status: 'INSCRIT' | 'REINSCRIT' | 'TRANSFERE' | 'SUSPENDU' | 'ABANDON';
  parentId: string;
  parentName: string;
  parentPhone: string;
  parentRelation: string;
  address: string;
  enrollmentDate: string;
  // Financials
  totalTuition: number; // Total du for the year in FCFA
  paidTuition: number;  // Paid so far in FCFA
  unpaidTuition: number; // Left in FCFA
  // Academic summary
  generalAverage?: number; // over 20
  rank?: number;
  unjustifiedAbsencesCount: number;
}

export interface ClassRoom {
  id: string;
  name: string; // e.g. "6e A", "3e A", "2nde C", "Terminale D"
  level: 'COLLEGE' | 'LYCEE';
  series?: string; // "A", "C", "D"
  capacity: number;
  studentCount: number;
  mainTeacherId?: string;
  mainTeacherName?: string;
  roomNumber?: string;
  academicYear: string;
  tuitionFee: number; // standard tuition in FCFA
}

export interface Subject {
  id: string;
  name: string; // e.g. "Mathématiques", "Français", "Physique-Chimie"
  code: string;
  coefficient: number;
  level: string;
  category: 'LITTERAIRE' | 'SCIENTIFIQUE' | 'LANGUE' | 'AUTRE';
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  date: string; // YYYY-MM-DD
  period: 'MATIN' | 'APRES_MIDI';
  status: 'PRESENT' | 'ABSENT' | 'RETARD' | 'JUSTIFIE';
  arrivalTime?: string;
  reason?: string;
  smsSent: boolean;
  smsTimestamp?: string;
  recordedByTeacher: string;
}

export interface GradeEntry {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  subjectId: string;
  subjectName: string;
  term: 'TRIMESTRE_1' | 'TRIMESTRE_2' | 'TRIMESTRE_3';
  evaluationType: 'INTERRO' | 'DEVOIR_1' | 'DEVOIR_2' | 'COMPO';
  score: number; // out of 20
  maxScore: number;
  coefficient: number;
  date: string;
  teacherId: string;
  appreciation?: string;
}

export interface SubjectReportSummary {
  subjectId: string;
  subjectName: string;
  coefficient: number;
  interroAvg: number;
  devoir1: number;
  devoir2: number;
  compo: number;
  finalSubjectAvg: number;
  weightedScore: number; // avg * coeff
  classAvg: number;
  minAvg: number;
  maxAvg: number;
  rank: number;
  teacherName: string;
  appreciation: string;
}

export interface OfficialReportCard {
  id: string;
  studentId: string;
  studentName: string;
  matricule: string;
  classId: string;
  className: string;
  term: 'TRIMESTRE_1' | 'TRIMESTRE_2' | 'TRIMESTRE_3';
  academicYear: string;
  subjects: SubjectReportSummary[];
  totalWeightedScores: number;
  totalCoefficients: number;
  overallAverage: number;
  rank: number;
  totalStudents: number;
  classAverage: number;
  highestAverage: number;
  lowestAverage: number;
  totalAbsencesHours: number;
  unjustifiedAbsencesHours: number;
  conductRating: 'TRES_BONNE' | 'BONNE' | 'PASSABLE' | 'BLAME';
  councilDecision: 'TABLEAU_HONNEUR' | 'ENCOURAGEMENTS' | 'AVERTISSEMENT' | 'BLAME' | 'PASSAGE' | 'REDOUBLEMENT' | 'FELICITATIONS';
  directorAppreciation: string;
  generatedDate: string;
}

export type PaymentMethod = 'ESPECES' | 'ORANGE_MONEY' | 'MTN_MOMO' | 'MOOV_MONEY' | 'WAVE' | 'CARTE_BANCAIRE' | 'CHEQUE' | 'VIREMENT';

export interface FeeCategory {
  id: string;
  name: string;
  code: string;
  defaultAmount: number;
  isMandatory: boolean;
  description?: string;
}

export interface PaymentTransaction {
  id: string;
  receiptNumber: string; // "REC-2026-00142"
  studentId: string;
  studentName: string;
  matricule: string;
  classId: string;
  className: string;
  parentName: string;
  parentPhone: string;
  amount: number; // in FCFA
  feeCategory: string; // "Scolarité", "Cantine", "Uniforme", etc.
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  operatorTransactionId?: string;
  date: string;
  time: string;
  recordedByUserId: string;
  recordedByUserName: string;
  status: 'VALIDE' | 'ANNULE' | 'REMBOURSE';
  smsSent: boolean;
  smsMessageId?: string;
  remainingStudentBalance: number;
  remarks?: string;
}

export interface SmsMessage {
  id: string;
  recipientPhone: string;
  recipientName: string;
  studentName?: string;
  className?: string;
  message: string;
  carrier: 'ORANGE_CI' | 'MTN_CI' | 'MOOV_CI' | 'AUTRE';
  status: 'LIVRE' | 'ENVOYE' | 'EN_ATTENTE' | 'ECHOUE';
  costFcfa: number; // ~20 FCFA per SMS unit
  segments: number;
  sentAt: string;
  deliveredAt?: string;
  failureReason?: string;
  triggerType: 'MANUEL' | 'ABSENCE' | 'RETARD' | 'PAIEMENT' | 'IMPAYE_RELANCE' | 'BULLETIN' | 'ANNONCE' | 'URGENCE';
  campaignId?: string;
}

export interface SmsTemplate {
  id: string;
  title: string;
  category: 'ABSENCE' | 'RETARD' | 'PAIEMENT' | 'IMPAYE' | 'REUNION' | 'BULLETIN' | 'URGENCE' | 'GENERALE';
  content: string;
  variables: string[]; // e.g. ["[NOM]", "[CLASSE]", "[DATE]", "[MONTANT]", "[SOLDE]"]
  isSystem: boolean;
}

export interface TimetableSlot {
  id: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  dayOfWeek: 'LUNDI' | 'MARDI' | 'MERCREDI' | 'JEUDI' | 'VENDREDI' | 'SAMEDI';
  startTime: string; // "08:00"
  endTime: string;   // "10:00"
  room: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'STUDENT' | 'PAYMENT' | 'ATTENDANCE' | 'GRADE' | 'SMS' | 'ENROLLMENT' | 'SETTING';
  entityId?: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export interface SubscriptionPlan {
  id: string;
  name: 'STARTER' | 'PRO' | 'BUSINESS' | 'GROUPE';
  displayName: string;
  description: string;
  maxStudents: number;
  maxUsers: number;
  includedSmsMonthly: number;
  storageGb: number;
  priceMonthlyFcfa: number;
  priceAnnualFcfa: number;
  features: string[];
  popular?: boolean;
}

export interface SupportMessage {
  id: string;
  schoolId: string;
  schoolName: string;
  senderRole: 'CREATEUR' | 'DIRECTEUR' | 'ECOLE';
  senderName: string;
  message: string;
  subject?: string;
  category: 'ASSISTANCE_TECHNIQUE' | 'RECHARGE_SMS' | 'FORMATION' | 'FACTURATION' | 'SUGGESTION' | 'AUTRE';
  timestamp: string;
  readBySchool: boolean;
  readByCreator: boolean;
  status: 'OUVERT' | 'EN_COURS' | 'RESOLU';
}

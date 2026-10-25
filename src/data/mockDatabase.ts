import {
  School, User, Student, Parent, ClassRoom, Subject,
  AttendanceRecord, GradeEntry, PaymentTransaction, SmsMessage,
  SmsTemplate, TimetableSlot, AuditLog, SubscriptionPlan
} from '../types';

export const DEFAULT_EMPTY_SCHOOL: School = {
  id: '',
  name: '',
  shortCode: '',
  motto: 'Discipline - Travail - Réussite',
  type: 'COLLEGE_LYCEE',
  drena: 'DRENA Abidjan 1',
  city: 'Abidjan',
  district: '',
  address: '',
  phone: '',
  email: '',
  directorName: '',
  currentAcademicYear: '2025 - 2026',
  smsSenderId: '',
  smsBalance: 50000,
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

export const INITIAL_SCHOOL: School = DEFAULT_EMPTY_SCHOOL;

export const OTHER_SCHOOLS: School[] = [];

export const INITIAL_USERS: User[] = [];

export const INITIAL_CLASSES: ClassRoom[] = [];

export const INITIAL_PARENTS: Parent[] = [];

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_PAYMENTS: PaymentTransaction[] = [];

export const INITIAL_SMS_MESSAGES: SmsMessage[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_TIMETABLE: TimetableSlot[] = [];

// Canonical Ivorian DRENAs (Directions Régionales de l'Éducation Nationale et de l'Alphabétisation)
export const DRENA_LIST_CI: string[] = [
  'DRENA Abidjan 1 (Plateau, Cocody, Adjamé, Bingerville)',
  'DRENA Abidjan 2 (Treichville, Marcory, Koumassi, Port-Bouët)',
  'DRENA Abidjan 3 (Attécoubé, Yopougon, Songon)',
  'DRENA Abidjan 4 (Abobo, Anyama)',
  'DRENA Yamoussoukro (District Autonome)',
  'DRENA Bouaké 1',
  'DRENA Bouaké 2',
  'DRENA San-Pedro',
  'DRENA Korhogo (Poro)',
  'DRENA Daloa (Haut-Sassandra)',
  'DRENA Man (Tonkpi)',
  'DRENA Gagnoa (Gôh)',
  'DRENA Soubré (Nawa)',
  'DRENA Divo (Lôh-Djiboua)',
  'DRENA Abengourou (Indénié-Djuablin)',
  'DRENA Bondoukou (Gontougo)',
  'DRENA Agboville (Agnéby-Tiassa)',
  'DRENA Grand-Bassam (Sud-Comoé)',
  'DRENA Dabou (Grands-Ponts)',
  'DRENA Ferkessédougou (Tchologo)',
  'DRENA Séguéla (Worodougou)',
  'DRENA Odienné (Kabadougou)',
  'DRENA Daoukro (Iffou)',
  'DRENA Boundiali (Bagoué)',
  'DRENA Guiglo (Cavally)',
  'DRENA Katiola (Hambol)',
  'DRENA Minignan (Folon)',
  'DRENA Touba (Bafing)',
  'DRENA Sassandra (Gbôklê)',
  'DRENA Bouna (Bounkani)'
];

// Canonical Ivorian Cities and Communes
export const IVORIAN_CITIES: string[] = [
  'Abidjan - Cocody',
  'Abidjan - Yopougon',
  'Abidjan - Abobo',
  'Abidjan - Koumassi',
  'Abidjan - Marcory',
  'Abidjan - Port-Bouët',
  'Abidjan - Treichville',
  'Abidjan - Plateau',
  'Abidjan - Adjamé',
  'Abidjan - Attécoubé',
  'Abidjan - Bingerville',
  'Abidjan - Songon',
  'Abidjan - Anyama',
  'Yamoussoukro',
  'Bouaké',
  'San-Pedro',
  'Korhogo',
  'Daloa',
  'Man',
  'Gagnoa',
  'Soubré',
  'Divo',
  'Abengourou',
  'Bondoukou',
  'Agboville',
  'Grand-Bassam',
  'Dabou',
  'Ferkessédougou',
  'Séguéla',
  'Odienné',
  'Daoukro',
  'Boundiali',
  'Guiglo',
  'Katiola',
  'Duékoué',
  'Sassandra',
  'Touba',
  'Bouna',
  'Tiassalé',
  'Bonoua',
  'Adzopé'
];

// Matières et coefficients de référence
export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub_francais', name: 'Français (Orthographe, Grammaire & Expression)', code: 'FRAN', coefficient: 4, level: 'COLLEGE_LYCEE', category: 'LITTERAIRE' },
  { id: 'sub_maths', name: 'Mathématiques', code: 'MATH', coefficient: 4, level: 'COLLEGE_LYCEE', category: 'SCIENTIFIQUE' },
  { id: 'sub_pc', name: 'Physique-Chimie', code: 'PC', coefficient: 3, level: 'COLLEGE_LYCEE', category: 'SCIENTIFIQUE' },
  { id: 'sub_svt', name: 'Sciences de la Vie et de la Terre (SVT)', code: 'SVT', coefficient: 3, level: 'COLLEGE_LYCEE', category: 'SCIENTIFIQUE' },
  { id: 'sub_anglais', name: 'Anglais (LV1)', code: 'ANG', coefficient: 3, level: 'COLLEGE_LYCEE', category: 'LANGUE' },
  { id: 'sub_hg', name: 'Histoire-Géographie', code: 'HG', coefficient: 2, level: 'COLLEGE_LYCEE', category: 'LITTERAIRE' },
  { id: 'sub_philo', name: 'Philosophie', code: 'PHILO', coefficient: 4, level: 'LYCEE', category: 'LITTERAIRE' },
  { id: 'sub_allemand', name: 'Allemand (LV2)', code: 'ALL', coefficient: 2, level: 'COLLEGE_LYCEE', category: 'LANGUE' },
  { id: 'sub_espagnol', name: 'Espagnol (LV2)', code: 'ESP', coefficient: 2, level: 'COLLEGE_LYCEE', category: 'LANGUE' },
  { id: 'sub_edhc', name: 'EDHC (Éducation aux Droits de l\'Homme et à la Citoyenneté)', code: 'EDHC', coefficient: 1, level: 'COLLEGE', category: 'AUTRE' },
  { id: 'sub_eps', name: 'Éducation Physique & Sportive (EPS)', code: 'EPS', coefficient: 1, level: 'TOUS', category: 'AUTRE' },
  { id: 'sub_arts', name: 'Arts Plastiques / Éducation Musicale', code: 'ARTS', coefficient: 1, level: 'COLLEGE', category: 'AUTRE' },
  { id: 'sub_info', name: 'Informatique & Technologies (TIC)', code: 'INFO', coefficient: 1, level: 'TOUS', category: 'SCIENTIFIQUE' },
];

export const INITIAL_SMS_TEMPLATES: SmsTemplate[] = [
  {
    id: 'tpl_absence',
    title: 'Alerte Absence Non Justifiée',
    category: 'ABSENCE',
    content: '[ECOLE]: Bonjour, nous vous signalons l\'absence de votre enfant [NOM] en classe de [CLASSE] ce jour le [DATE]. Merci de contacter la vie scolaire au [TELEPHONE_ECOLE].',
    variables: ['[ECOLE]', '[NOM]', '[CLASSE]', '[DATE]', '[TELEPHONE_ECOLE]'],
    isSystem: true,
  },
  {
    id: 'tpl_retard',
    title: 'Notification de Retard en Cours',
    category: 'RETARD',
    content: '[ECOLE]: Information: votre enfant [NOM] ([CLASSE]) est arrivé en retard en cours ce [DATE] à [HEURE]. Prière veiller à la ponctualité.',
    variables: ['[ECOLE]', '[NOM]', '[CLASSE]', '[DATE]', '[HEURE]'],
    isSystem: true,
  },
  {
    id: 'tpl_paiement',
    title: 'Reçu de Versement Scolarité',
    category: 'PAIEMENT',
    content: '[ECOLE]: Reçu N° [RECU] validé. Paiement de [MONTANT] FCFA reçu pour la scolarité de [NOM] ([CLASSE]). Solde restant: [SOLDE] FCFA. Merci de votre confiance.',
    variables: ['[ECOLE]', '[RECU]', '[MONTANT]', '[NOM]', '[CLASSE]', '[SOLDE]'],
    isSystem: true,
  },
  {
    id: 'tpl_impaye',
    title: 'Rappel Échéance de Scolarité / Tranche',
    category: 'IMPAYE',
    content: '[ECOLE]: Rappel: la [TRANCHE] de scolarité pour [NOM] ([CLASSE]) d\'un montant de [MONTANT] FCFA est échue. Merci de régulariser à la caisse avant le [DATE_LIMITE].',
    variables: ['[ECOLE]', '[TRANCHE]', '[NOM]', '[CLASSE]', '[MONTANT]', '[DATE_LIMITE]'],
    isSystem: true,
  },
  {
    id: 'tpl_reunion',
    title: 'Convocation Réunion Parents - Enseignants',
    category: 'REUNION',
    content: '[ECOLE]: Chers parents d\'élèves, vous êtes conviés à l\'Assemblée Générale le [DATE] à [HEURE] au sein de l\'établissement. Présence vivement souhaitée.',
    variables: ['[ECOLE]', '[DATE]', '[HEURE]'],
    isSystem: true,
  },
  {
    id: 'tpl_bulletin',
    title: 'Disponibilité des bulletins de notes',
    category: 'BULLETIN',
    content: '[ECOLE]: Les bulletins du [TRIMESTRE] pour [NOM] ([CLASSE]) sont disponibles. Moyenne: [MOYENNE]/20 - Rang: [RANG]. Venez retirer le document au secrétariat.',
    variables: ['[ECOLE]', '[TRIMESTRE]', '[NOM]', '[CLASSE]', '[MOYENNE]', '[RANG]'],
    isSystem: true,
  },
  {
    id: 'tpl_urgence',
    title: 'Alerte Urgente / Communiqué de la Direction',
    category: 'URGENCE',
    content: 'URGENT - [ECOLE]: Chers parents, [MESSAGE_URGENT]. Contact Direction: [TELEPHONE_ECOLE].',
    variables: ['[ECOLE]', '[MESSAGE_URGENT]', '[TELEPHONE_ECOLE]'],
    isSystem: true,
  }
];

export const INITIAL_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_starter',
    name: 'STARTER',
    displayName: 'Formule Starter Collège',
    description: 'Conçu spécialement pour les collèges de proximité de 6ème à 3ème.',
    maxStudents: 500,
    maxUsers: 8,
    includedSmsMonthly: 2000,
    storageGb: 10,
    priceMonthlyFcfa: 45000,
    priceAnnualFcfa: 450000,
    features: [
      'Jusqu\'à 500 élèves (Collège de 6e à 3e)',
      'Comptes Directeur, Éducateur, Comptable, Enseignants',
      'Envoi automatique de SMS (absences, reçus de scolarité)',
      'Édition des bulletins trimestriels',
      'Encaissements par tranches & Reçus imprimables',
      'Support technique dédié'
    ],
  },
  {
    id: 'plan_pro',
    name: 'PRO',
    displayName: 'Formule Groupe Collège & Lycée',
    description: 'Idéal pour établissements secondaires complets (6ème à Terminale Séries A, C, D).',
    maxStudents: 2000,
    maxUsers: 30,
    includedSmsMonthly: 8000,
    storageGb: 50,
    priceMonthlyFcfa: 95000,
    priceAnnualFcfa: 950000,
    popular: true,
    features: [
      'Jusqu\'à 2 000 élèves (Collège & Lycée complet)',
      'Gestion par séries (2nde A/C, 1ère A/C/D, Tle A/C/D)',
      'Expéditeur SMS personnalisé (Sender ID validé)',
      'Rappels automatiques des impayés par SMS en 1 clic',
      'Emploi du temps & gestion des salles de cours',
      'Exportation et statistiques de réussite',
      'Assistance Développeur prioritaire 24/7'
    ],
  },
  {
    id: 'plan_business',
    name: 'BUSINESS',
    displayName: 'Formule Grand Lycée d\'Excellence',
    description: 'Pour grands lycées d\'excellence, lycées techniques et complexes scolaires.',
    maxStudents: 5000,
    maxUsers: 100,
    includedSmsMonthly: 25000,
    storageGb: 200,
    priceMonthlyFcfa: 190000,
    priceAnnualFcfa: 1900000,
    features: [
      'Jusqu\'à 5 000 élèves',
      'Multi-utilisateurs illimité',
      '25 000 SMS mensuels avec routage haute priorité',
      'Support Enseignement Général & Technique',
      'Sauvegardes quotidiennes sécurisées',
      'Tableau de bord financier analytique pour les fondateurs',
      'Accompagnement et formation sur site'
    ],
  },
  {
    id: 'plan_groupe',
    name: 'GROUPE',
    displayName: 'Formule Réseau Multi-Établissements',
    description: 'Pour promoteurs et congrégations gérant plusieurs collèges et lycées en Côte d\'Ivoire.',
    maxStudents: 20000,
    maxUsers: 500,
    includedSmsMonthly: 100000,
    storageGb: 1000,
    priceMonthlyFcfa: 450000,
    priceAnnualFcfa: 4500000,
    features: [
      'Nombre illimité d\'écoles rattachées',
      'Console consolidée pour le conseil d\'administration',
      'Envoi de SMS aux parents',
      'Chef de projet dédié & SLA garanti'
    ],
  }
];

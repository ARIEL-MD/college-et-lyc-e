import { Student, Parent, ClassRoom, PaymentTransaction, GradeEntry } from '../types';

export const IVORIAN_LAST_NAMES = [
  'KOUASSI', 'KONAN', 'FOFANA', 'TOURE', 'BAMBA', 'OUATTARA',
  'BAKAYOKO', 'COULIBALY', 'YAO', 'N\'GUESSAN', 'TRAORE', 'CISSE',
  'DIALLO', 'SORO', 'DIOMANDE', 'KOFFI', 'GBAGBO', 'DJE', 'KRA',
  'KONE', 'SANOGO', 'MEITE', 'BOHOUSSOU', 'ASSALE', 'N\'DRI',
  'GNEPA', 'LOUKOU', 'ZOUZOUA', 'KOUAME', 'KOUADIO', 'TIEHI',
  'DOUMBIA', 'KIPRE', 'GNAGNE', 'ADOU', 'BLE', 'GNAHORE',
  'KAMAGATE', 'BAMBARA', 'DOSSO', 'SYLLA', 'KABA', 'SANGARE'
];

export const IVORIAN_BOY_NAMES = [
  'Ariel', 'Ange', 'Emmanuel', 'Mohamed', 'Ibrahim', 'Seydou',
  'Sekou', 'Jean-Marc', 'Christian', 'Patrick', 'Junior', 'Ousmane',
  'Aboubacar', 'Wilfried', 'Stéphane', 'Marc-Aurèle', 'David',
  'Samuel', 'Ismaël', 'Yannick', 'Franck', 'Cédric', 'Arnaud',
  'Rodrigue', 'Kader', 'Losseni', 'Brice', 'Fabrice', 'Ulrich'
];

export const IVORIAN_GIRL_NAMES = [
  'Awa', 'Fatoumata', 'Mariam', 'Salimata', 'Aminata', 'Marcelle',
  'Grâce', 'Mireille', 'Esther', 'Divine', 'Christelle', 'Priscille',
  'Yasmine', 'Sandrine', 'Affoué', 'Akissi', 'Amenan', 'Adjoua',
  'Khadidiatou', 'Fatou', 'Syntyche', 'Inès', 'Ruth', 'Danielle',
  'Victoire', 'Benedicte', 'Emmanuelle', 'Kady', 'Nafissatou'
];

export const IVORIAN_BIRTH_PLACES = [
  'Abidjan - Cocody', 'Abidjan - Yopougon', 'Abidjan - Abobo',
  'Abidjan - Treichville', 'Abidjan - Port-Bouët', 'Abidjan - Marcory',
  'Abidjan - Koumassi', 'Bouaké', 'Yamoussoukro', 'Korhogo',
  'Daloa', 'San-Pedro', 'Man', 'Gagnoa', 'Divo', 'Agboville',
  'Grand-Bassam', 'Dabou', 'Abengourou', 'Bondoukou', 'Ferké'
];

export const PARENT_TITLES = ['M.', 'Mme', 'Dr.', 'Ing.', 'Prof.', 'Me'];

export const generateIvorianPhone = (): string => {
  const prefixes = ['07', '05', '01'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const part1 = String(Math.floor(10 + Math.random() * 90));
  const part2 = String(Math.floor(10 + Math.random() * 90));
  const part3 = String(Math.floor(10 + Math.random() * 90));
  const part4 = String(Math.floor(10 + Math.random() * 90));
  return `+225 ${prefix} ${part1} ${part2} ${part3} ${part4}`;
};

export const generateMatricule = (index: number): string => {
  const letters = 'ABCDEFGHJKLMNPQRSTVWXYZ';
  const letter = letters[index % letters.length];
  const num = String(10000 + (index * 37) % 89999);
  return `CI-2026-${num}${letter}`;
};

export interface GeneratedCohort {
  students: Student[];
  parents: Parent[];
  payments: PaymentTransaction[];
}

export function generateStudentsForClasses(
  classes: ClassRoom[],
  studentsPerClass: number = 8,
  schoolName: string = 'Plateforme scolaire'
): GeneratedCohort {
  const generatedStudents: Student[] = [];
  const generatedParents: Parent[] = [];
  const generatedPayments: PaymentTransaction[] = [];

  let globalIndex = 1;

  classes.forEach((cls) => {
    // Determine age range based on level
    let baseAge = 11;
    if (cls.name.startsWith('6e')) baseAge = 11;
    else if (cls.name.startsWith('5e')) baseAge = 12;
    else if (cls.name.startsWith('4e')) baseAge = 13;
    else if (cls.name.startsWith('3e')) baseAge = 14;
    else if (cls.name.startsWith('2nde')) baseAge = 15;
    else if (cls.name.startsWith('1ère')) baseAge = 16;
    else if (cls.name.startsWith('Tle') || cls.name.startsWith('Terminale')) baseAge = 17;

    const classTuition = cls.tuitionFee || (cls.level === 'LYCEE' ? 200000 : 160000);

    for (let i = 0; i < studentsPerClass; i++) {
      globalIndex++;
      const isBoy = Math.random() > 0.5;
      const lastName = IVORIAN_LAST_NAMES[Math.floor(Math.random() * IVORIAN_LAST_NAMES.length)];
      const firstName = isBoy
        ? IVORIAN_BOY_NAMES[Math.floor(Math.random() * IVORIAN_BOY_NAMES.length)]
        : IVORIAN_GIRL_NAMES[Math.floor(Math.random() * IVORIAN_GIRL_NAMES.length)];

      const studentId = `stu_ci_${cls.id}_${i + 1}_${Date.now()}`;
      const parentId = `par_ci_${cls.id}_${i + 1}_${Date.now()}`;
      const matricule = generateMatricule(globalIndex);

      const birthYear = 2026 - (baseAge + (Math.random() > 0.8 ? 1 : 0));
      const birthMonth = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');
      const birthDay = String(Math.floor(1 + Math.random() * 28)).padStart(2, '0');
      const dob = `${birthYear}-${birthMonth}-${birthDay}`;
      const pob = IVORIAN_BIRTH_PLACES[Math.floor(Math.random() * IVORIAN_BIRTH_PLACES.length)];

      const isFather = Math.random() > 0.35;
      const parentRelation = isFather ? 'PERE' : (Math.random() > 0.5 ? 'MERE' : 'TUTEUR');
      const parentTitle = isFather ? 'M.' : 'Mme';
      const parentFirstName = isFather
        ? IVORIAN_BOY_NAMES[Math.floor(Math.random() * IVORIAN_BOY_NAMES.length)]
        : IVORIAN_GIRL_NAMES[Math.floor(Math.random() * IVORIAN_GIRL_NAMES.length)];
      const parentLastName = isFather ? lastName : IVORIAN_LAST_NAMES[Math.floor(Math.random() * IVORIAN_LAST_NAMES.length)];
      const parentFullName = `${parentTitle} ${parentLastName} ${parentFirstName}`;
      const parentPhone = generateIvorianPhone();

      // Payment scenario distribution
      // 40% full paid, 35% partially paid, 25% only registration paid
      const payScenario = Math.random();
      let paidTuition = classTuition;
      if (payScenario < 0.40) {
        paidTuition = classTuition; // Fully paid
      } else if (payScenario < 0.75) {
        paidTuition = Math.round(classTuition * 0.6); // 1st & 2nd installment paid
      } else {
        paidTuition = Math.round(classTuition * 0.3); // Only inscription paid
      }
      const unpaidTuition = Math.max(0, classTuition - paidTuition);

      // Realistic general average for student (8.5 to 18.5)
      const baseAvg = 10 + Math.random() * 6.5;
      const generalAverage = Number(Math.min(19.5, Math.max(7.5, baseAvg)).toFixed(2));

      // Student object
      const student: Student = {
        id: studentId,
        matricule,
        firstName,
        lastName,
        gender: isBoy ? 'M' : 'F',
        dateOfBirth: dob,
        placeOfBirth: pob,
        classId: cls.id,
        className: cls.name,
        level: cls.name,
        academicYear: cls.academicYear,
        parentId,
        parentName: parentFullName,
        parentPhone,
        parentRelation: parentRelation as any,
        address: `${pob.split(' - ')[1] || pob}, Quartier Résidentiel`,
        photoUrl: '',
        enrollmentDate: '2025-09-08',
        status: 'INSCRIT',
        unjustifiedAbsencesCount: Math.random() > 0.7 ? Math.floor(Math.random() * 4) : 0,
        paidTuition,
        unpaidTuition,
        totalTuition: classTuition,
        generalAverage,
        rank: i + 1,
      };

      // Parent object
      const parent: Parent = {
        id: parentId,
        firstName: parentFirstName,
        lastName: parentLastName,
        phone: parentPhone,
        email: `${parentFirstName.toLowerCase()}.${parentLastName.toLowerCase()}@gmail.com`,
        address: student.address,
        relation: parentRelation as any,
        childrenIds: [studentId],
        preferredChannel: 'SMS',
        totalDebt: unpaidTuition,
      };

      // Initial Payment transaction if paid > 0
      if (paidTuition > 0) {
        const payment: PaymentTransaction = {
          id: `pay_ci_${studentId}_01`,
          receiptNumber: `REC-2026-${String(8000 + globalIndex).padStart(5, '0')}`,
          studentId,
          studentName: `${lastName} ${firstName}`,
          matricule,
          classId: cls.id,
          className: cls.name,
          parentName: parentFullName,
          parentPhone,
          amount: paidTuition,
          feeCategory: paidTuition === classTuition ? 'Scolarité Intégrale' : 'Inscription & 1ère Tranche',
          paymentMethod: Math.random() > 0.4 ? 'ORANGE_MONEY' : (Math.random() > 0.5 ? 'WAVE' : 'ESPECES'),
          date: '2025-09-12',
          time: '10:30',
          recordedByUserId: 'usr_dir_01',
          recordedByUserName: 'Direction / Caisse',
          status: 'VALIDE',
          smsSent: true,
          remainingStudentBalance: unpaidTuition,
          remarks: 'Encaissement validé à la rentrée',
        };
        generatedPayments.push(payment);
      }

      generatedStudents.push(student);
      generatedParents.push(parent);
    }
  });

  return {
    students: generatedStudents,
    parents: generatedParents,
    payments: generatedPayments,
  };
}

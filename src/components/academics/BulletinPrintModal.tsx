import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X, Printer, Download, Award, CheckCircle2,
  Calendar, Check, ChevronRight, School as SchoolIcon,
  Star, FileText, Send
} from 'lucide-react';
import { Student } from '../../types';

interface BulletinPrintModalProps {
  student: Student;
  avg?: number;
  rank?: number;
  mention?: string;
  term?: 'TRIMESTRE_1' | 'TRIMESTRE_2' | 'TRIMESTRE_3';
  onClose: () => void;
}

interface DisciplineRow {
  name: string;
  category: 'LETTRES' | 'SCIENCES' | 'AUTRES';
  isNotClassed?: boolean;
  t1: { moy: number; coef: number; moyCoef: number; rank: number };
  t2: { moy: number; coef: number; moyCoef: number; rank: number };
  t3: { moy: number; coef: number; moyCoef: number; rank: number };
  annual: { moy: number; rank: number };
  teacher: string;
  appreciation: string;
}

export const BulletinPrintModal: React.FC<BulletinPrintModalProps> = ({
  student,
  avg = 11.02,
  rank = 17,
  mention = "Tableau d'Honneur",
  term: initialTerm = 'TRIMESTRE_3',
  onClose
}) => {
  const { school, academicYear, showToast, sendBulkSms } = useApp();

  const [activeTerm, setActiveTerm] = useState<'TRIMESTRE_1' | 'TRIMESTRE_2' | 'TRIMESTRE_3'>(
    initialTerm || 'TRIMESTRE_3'
  );

  const handlePrint = () => {
    window.print();
  };

  const handleSendSms = () => {
    const termLabel = activeTerm === 'TRIMESTRE_1' ? '1er Trimestre' : activeTerm === 'TRIMESTRE_2' ? '2è Trimestre' : '3è Trimestre (Fin d\'Année)';
    const text = `${school.name}: Le bulletin du ${termLabel} de ${student.firstName} ${student.lastName} (${student.className}) est disponible. Moyenne: ${activeTerm === 'TRIMESTRE_1' ? '10.92' : activeTerm === 'TRIMESTRE_2' ? '11.35' : '11.02'}/20 - Rang: ${rank}e/${student.className.includes('46') ? '46' : '46'}. Retrait du livret au secrétariat. Tél: ${school.phone}`;
    
    sendBulkSms(
      [{
        phone: student.parentPhone,
        name: student.parentName,
        studentName: `${student.firstName} ${student.lastName}`,
        className: student.className
      }],
      text,
      'BULLETIN'
    );
  };

  // Base deterministic data mapped to the student
  const isMale = student.gender !== 'F';
  const birthPlace = student.placeOfBirth || 'BOUAKE';
  const birthDate = student.dateOfBirth || '31/12/2000';
  const nationality = 'IVOIRIENNE';
  const effectiveClass = 46;

  // Disciplines list modeled exactly after the official Ivorian Secondary Curriculum (Premier & Second Cycles)
  const disciplinesData: DisciplineRow[] = [
    // --- 1. POLE LETTRES ---
    {
      name: 'Français',
      category: 'LETTRES',
      t1: { moy: 11.50, coef: 3, moyCoef: 34.50, rank: 18 },
      t2: { moy: 11.00, coef: 3, moyCoef: 33.00, rank: 20 },
      t3: { moy: 10.00, coef: 3, moyCoef: 30.00, rank: 28 },
      annual: { moy: 10.83, rank: 17 },
      teacher: 'TANGUY Rodrigue',
      appreciation: 'Passable'
    },
    {
      name: 'Philosophie',
      category: 'LETTRES',
      t1: { moy: 11.00, coef: 2, moyCoef: 22.00, rank: 19 },
      t2: { moy: 10.40, coef: 2, moyCoef: 20.80, rank: 22 },
      t3: { moy: 9.80, coef: 2, moyCoef: 19.60, rank: 36 },
      annual: { moy: 10.40, rank: 23 },
      teacher: 'KONE BAKARY',
      appreciation: 'Insuffisant'
    },
    {
      name: 'Anglais',
      category: 'LETTRES',
      t1: { moy: 11.35, coef: 2, moyCoef: 22.70, rank: 15 },
      t2: { moy: 11.48, coef: 2, moyCoef: 22.96, rank: 14 },
      t3: { moy: 11.50, coef: 2, moyCoef: 23.00, rank: 16 },
      annual: { moy: 11.44, rank: 15 },
      teacher: 'AMIEN Maixane',
      appreciation: 'Moyen'
    },
    {
      name: 'Histoire Géographie',
      category: 'LETTRES',
      t1: { moy: 11.10, coef: 2, moyCoef: 22.20, rank: 18 },
      t2: { moy: 10.95, coef: 2, moyCoef: 21.90, rank: 20 },
      t3: { moy: 10.85, coef: 2, moyCoef: 21.70, rank: 21 },
      annual: { moy: 10.97, rank: 19 },
      teacher: 'KOUASSI Constant',
      appreciation: 'Passable'
    },
    {
      name: 'Espagnol / Allemand',
      category: 'LETTRES',
      isNotClassed: true,
      t1: { moy: 0, coef: 0, moyCoef: 0, rank: 0 },
      t2: { moy: 0, coef: 0, moyCoef: 0, rank: 0 },
      t3: { moy: 0, coef: 0, moyCoef: 0, rank: 0 },
      annual: { moy: 0, rank: 0 },
      teacher: '',
      appreciation: ''
    },

    // --- 2. POLE SCIENCES ---
    {
      name: 'Mathématique',
      category: 'SCIENCES',
      t1: { moy: 10.20, coef: 4, moyCoef: 40.80, rank: 24 },
      t2: { moy: 10.20, coef: 4, moyCoef: 40.80, rank: 23 },
      t3: { moy: 11.55, coef: 4, moyCoef: 46.20, rank: 13 },
      annual: { moy: 10.65, rank: 21 },
      teacher: "N'GUESSAN Frejuste",
      appreciation: 'Moyen'
    },
    {
      name: 'Physiques-Chimie',
      category: 'SCIENCES',
      t1: { moy: 12.00, coef: 4, moyCoef: 48.00, rank: 14 },
      t2: { moy: 11.85, coef: 4, moyCoef: 47.40, rank: 15 },
      t3: { moy: 10.50, coef: 4, moyCoef: 42.00, rank: 17 },
      annual: { moy: 11.45, rank: 15 },
      teacher: 'KOUAME Akian',
      appreciation: 'Passable'
    },
    {
      name: 'Sc. de la Vie et de la Terre',
      category: 'SCIENCES',
      t1: { moy: 11.15, coef: 4, moyCoef: 44.60, rank: 14 },
      t2: { moy: 11.30, coef: 4, moyCoef: 45.20, rank: 13 },
      t3: { moy: 11.43, coef: 4, moyCoef: 45.72, rank: 12 },
      annual: { moy: 11.29, rank: 13 },
      teacher: 'SAMON NAKANABO',
      appreciation: 'Moyen'
    },

    // --- 3. AUTRES DISCIPLINES ---
    {
      name: 'Arts Plastiques / Musique',
      category: 'AUTRES',
      isNotClassed: true,
      t1: { moy: 0, coef: 0, moyCoef: 0, rank: 0 },
      t2: { moy: 0, coef: 0, moyCoef: 0, rank: 0 },
      t3: { moy: 0, coef: 0, moyCoef: 0, rank: 0 },
      annual: { moy: 0, rank: 0 },
      teacher: '',
      appreciation: ''
    },
    {
      name: 'Informatique',
      category: 'AUTRES',
      isNotClassed: true,
      t1: { moy: 0, coef: 0, moyCoef: 0, rank: 0 },
      t2: { moy: 0, coef: 0, moyCoef: 0, rank: 0 },
      t3: { moy: 0, coef: 0, moyCoef: 0, rank: 0 },
      annual: { moy: 0, rank: 0 },
      teacher: '',
      appreciation: ''
    },
    {
      name: 'Education Phys. Et Sportive',
      category: 'AUTRES',
      t1: { moy: 12.00, coef: 1, moyCoef: 12.00, rank: 11 },
      t2: { moy: 11.50, coef: 1, moyCoef: 11.50, rank: 13 },
      t3: { moy: 11.25, coef: 1, moyCoef: 11.25, rank: 20 },
      annual: { moy: 11.58, rank: 12 },
      teacher: "N'CHO Roland",
      appreciation: 'Moyen'
    },
    {
      name: 'EDHC',
      category: 'AUTRES',
      isNotClassed: true,
      t1: { moy: 0, coef: 0, moyCoef: 0, rank: 0 },
      t2: { moy: 0, coef: 0, moyCoef: 0, rank: 0 },
      t3: { moy: 0, coef: 0, moyCoef: 0, rank: 0 },
      annual: { moy: 0, rank: 0 },
      teacher: '',
      appreciation: ''
    },
    {
      name: 'Autre discipline 1',
      category: 'AUTRES',
      isNotClassed: true,
      t1: { moy: 0, coef: 0, moyCoef: 0, rank: 0 },
      t2: { moy: 0, coef: 0, moyCoef: 0, rank: 0 },
      t3: { moy: 0, coef: 0, moyCoef: 0, rank: 0 },
      annual: { moy: 0, rank: 0 },
      teacher: '',
      appreciation: ''
    },
    {
      name: 'Autre discipline 2',
      category: 'AUTRES',
      isNotClassed: true,
      t1: { moy: 0, coef: 0, moyCoef: 0, rank: 0 },
      t2: { moy: 0, coef: 0, moyCoef: 0, rank: 0 },
      t3: { moy: 0, coef: 0, moyCoef: 0, rank: 0 },
      annual: { moy: 0, rank: 0 },
      teacher: '',
      appreciation: ''
    },
    {
      name: 'Conduite',
      category: 'AUTRES',
      t1: { moy: 15.00, coef: 1, moyCoef: 15.00, rank: 8 },
      t2: { moy: 14.20, coef: 1, moyCoef: 14.20, rank: 10 },
      t3: { moy: 14.00, coef: 1, moyCoef: 14.00, rank: 12 },
      annual: { moy: 14.40, rank: 10 },
      teacher: 'TOUO Pierre',
      appreciation: 'Bonne'
    }
  ];

  // Helper to format numbers like in French / Ivorian bulletins (e.g. 10,00)
  const formatGrade = (num: number, digits: number = 2) => {
    return num.toFixed(digits).replace('.', ',');
  };

  // Calculations per section depending on activeTerm
  const getActiveDisciplineData = (row: DisciplineRow) => {
    if (activeTerm === 'TRIMESTRE_1') return row.t1;
    if (activeTerm === 'TRIMESTRE_2') return row.t2;
    return row.t3;
  };

  // Lettres stats
  const lettresRows = disciplinesData.filter(d => d.category === 'LETTRES' && !d.isNotClassed);
  const lettresTotalPoints = lettresRows.reduce((sum, r) => sum + getActiveDisciplineData(r).moyCoef, 0);
  const lettresTotalCoef = lettresRows.reduce((sum, r) => sum + getActiveDisciplineData(r).coef, 0);
  const bilanLettres = lettresTotalCoef > 0 ? lettresTotalPoints / lettresTotalCoef : 0;

  // Sciences stats
  const sciencesRows = disciplinesData.filter(d => d.category === 'SCIENCES' && !d.isNotClassed);
  const sciencesTotalPoints = sciencesRows.reduce((sum, r) => sum + getActiveDisciplineData(r).moyCoef, 0);
  const sciencesTotalCoef = sciencesRows.reduce((sum, r) => sum + getActiveDisciplineData(r).coef, 0);
  const bilanSciences = sciencesTotalCoef > 0 ? sciencesTotalPoints / sciencesTotalCoef : 0;

  // Total général
  const allClassed = disciplinesData.filter(d => !d.isNotClassed);
  const totalCoef = allClassed.reduce((sum, r) => sum + getActiveDisciplineData(r).coef, 0);
  const totalPoints = allClassed.reduce((sum, r) => sum + getActiveDisciplineData(r).moyCoef, 0);
  const currentTermAvg = totalCoef > 0 ? totalPoints / totalCoef : avg;

  // Term specific figures
  const t1Avg = 10.92;
  const t2Avg = 11.35;
  const t3Avg = 11.02;
  const annualAvg = 11.16;
  const annualRank = 19;

  const currentTermRank = activeTerm === 'TRIMESTRE_1' ? 17 : activeTerm === 'TRIMESTRE_2' ? 15 : 17;
  const classAvg = activeTerm === 'TRIMESTRE_1' ? '09,75' : activeTerm === 'TRIMESTRE_2' ? '09,90' : '09,82';
  const classMin = activeTerm === 'TRIMESTRE_1' ? '08,10' : activeTerm === 'TRIMESTRE_2' ? '08,20' : '08,35';
  const classMax = activeTerm === 'TRIMESTRE_1' ? '15,20' : activeTerm === 'TRIMESTRE_2' ? '15,10' : '14,85';

  const termTitle = activeTerm === 'TRIMESTRE_1' ? '1er Trimestre' : activeTerm === 'TRIMESTRE_2' ? '2è Trimestre' : '3è Trimestre';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-sm border border-slate-300 overflow-hidden flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* TOP CONTROL BAR (Screen only, completely hidden on print) */}
        <div className="print:hidden bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              BUL
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Bulletin Officiel :</span>
                <span className="text-amber-700 uppercase">{student.lastName} {student.firstName}</span>
                <span className="text-slate-400 font-mono">({student.matricule || '11 045 120 Z'})</span>
              </div>
              <p className="text-[11px] text-slate-400">Classe : {student.className || '2nd C1'} • Année : {school.currentAcademicYear || '2025 - 2026'}</p>
            </div>
          </div>

          {/* Term Switcher Tabs */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTerm('TRIMESTRE_1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTerm === 'TRIMESTRE_1'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1er Trimestre
            </button>
            <button
              onClick={() => setActiveTerm('TRIMESTRE_2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTerm === 'TRIMESTRE_2'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2è Trimestre
            </button>
            <button
              onClick={() => setActiveTerm('TRIMESTRE_3')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTerm === 'TRIMESTRE_3'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3è Trimestre (Fin d'Année)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendSms}
              className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              title="Notifier les notes par SMS au parent"
            >
              <Send className="w-3.5 h-3.5 text-blue-700" />
              <span>SMS Parent</span>
            </button>

            <button
              onClick={handlePrint}
              className="py-1.5 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer (A4)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bulletin imprimable */}
        <div
          id="printable-official-bulletin"
          className="p-6 sm:p-8 bg-white text-black overflow-y-auto text-[11px] leading-tight select-text print:p-0 print:m-0 print:overflow-visible font-sans"
        >
          {/* ================= 1. EN-TETE OFFICIEL ================= */}
          <div className="border border-black grid grid-cols-12 text-center text-[9px] font-bold">
            
            {/* Left Header */}
            <div className="col-span-4 p-2 border-r border-black flex flex-col justify-center text-left space-y-0.5">
              <div className="leading-tight">Ministère de l'Education Nationale, de l'Enseignement Technique et de la formation Professionnelle</div>
              <div className="uppercase font-semibold pt-1">{school.drena || "DIRECTION REGIONALE D'ABIDJAN 3"}</div>
            </div>

            {/* Center Header: Title */}
            <div className="col-span-4 p-2 border-r border-black flex flex-col justify-center items-center bg-slate-50/50">
              <div className="text-sm sm:text-base font-semibold uppercase tracking-tight">
                BULLETIN TRIMESTRIEL DE NOTES
              </div>
              <div className="text-xs sm:text-sm font-semibold mt-0.5 text-black">
                {termTitle}
              </div>
            </div>

            {/* Right Header */}
            <div className="col-span-4 p-2 flex flex-col justify-center text-center space-y-0.5">
              <div className="uppercase font-semibold text-[10px]">RÉPUBLIQUE DE CÔTE D'IVOIRE</div>
              <div className="text-[8px] font-medium italic">Union — Discipline — Travail</div>
              <div className="font-semibold pt-1 text-[10px]">
                Année Scolaire : {school.currentAcademicYear || academicYear || '2025 - 2026'}
              </div>
            </div>
          </div>

          {/* ================= 2. BANDEAU ÉTABLISSEMENT ================= */}
          <div className="border-x border-b border-black grid grid-cols-12 text-[10px] items-center">
            
            {/* School logo & name info */}
            <div className="col-span-8 p-2 flex items-center gap-3">
              {/* Seal / Logo */}
              <div className="w-12 h-12 rounded-full border border-black/60 flex flex-col items-center justify-center text-center p-1 shrink-0 bg-slate-50">
                <SchoolIcon className="w-5 h-5 text-slate-800" />
                <span className="text-[6px] font-bold uppercase leading-none mt-0.5">Plateforme scolaire</span>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Etablissement :</span>
                  <strong className="font-semibold uppercase text-xs tracking-tight">
                    {school.name || "COLLEGE AIME CESAIRE"}
                  </strong>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 text-[9px]">
                  <div>
                    <span className="text-slate-600">Adresse postale : </span>
                    <strong className="font-semibold">{school.address || "01 BP 266 Abj 01"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-600">Téléphone : </span>
                    <strong className="font-semibold">{school.phone || "23 01 22 75 / 41 61 20 60"}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* School Code, Statut & Email */}
            <div className="col-span-4 p-2 border-l border-black text-[9px] space-y-0.5">
              <div>
                <span className="text-slate-600">Code : </span>
                <strong className="font-semibold">{school.shortCode || "000212"}</strong>
              </div>
              <div>
                <span className="text-slate-600">Statut : </span>
                <strong className="font-bold">
                  {school.statut === 'PUBLIC' ? 'Public' : school.statut === 'PRIVE_CONFESSIONNEL' ? 'Privé Confessionnel' : 'Privé'}
                </strong>
              </div>
              <div className="truncate">
                <span className="text-slate-600">E-mail : </span>
                <strong className="font-medium">{school.email || `direction@${school.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.ci`}</strong>
              </div>
            </div>
          </div>

          {/* ================= 3. IDENTITÉ & FICHE ÉLÈVE ================= */}
          <div className="border-x border-b border-black p-3 grid grid-cols-12 gap-2 text-[10px]">
            
            {/* Nom & Matricule */}
            <div className="col-span-5 space-y-1">
              <div className="text-sm font-semibold uppercase tracking-wide text-black">
                {student.lastName} {student.firstName}
              </div>
              <div className="text-xs font-semibold tracking-wider text-black">
                Matricule : <span className="font-mono">{student.matricule || "11 045 120 Z"}</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] pt-0.5">
                <div>Classe : <strong className="font-semibold text-black">{student.className || "2nd C1"}</strong></div>
                <div>Effectif : <strong className="font-semibold">{effectiveClass}</strong></div>
              </div>
            </div>

            {/* Infos Naissance & Nationalité */}
            <div className="col-span-4 space-y-0.5 text-[9.5px]">
              <div>Sexe : <strong className="font-semibold">{isMale ? 'M' : 'F'}</strong></div>
              <div>Né(e) le <strong className="font-bold">{birthDate}</strong></div>
              <div>Lieu de naissance : <strong className="font-bold uppercase">{birthPlace}</strong></div>
              <div>Nationalité : <strong className="font-bold uppercase">{nationality}</strong></div>
            </div>

            {/* Statuts & Régimes */}
            <div className="col-span-3 space-y-0.5 text-[9.5px] text-right sm:text-left">
              <div>Redoublant : <strong className="font-bold">Non</strong></div>
              <div>Régime : <strong className="font-bold">Externe</strong></div>
              <div>Interne : <strong className="font-bold">Non</strong></div>
              <div>Affecté(e) : <strong className="font-bold">Oui</strong></div>
            </div>
          </div>

          {/* ================= 4. TABLEAU DES DISCIPLINES ================= */}
          <div className="border-x border-b border-black">
            <table className="w-full text-left border-collapse text-[9.5px]">
              <thead>
                <tr className="border-b border-black text-center font-bold uppercase text-[8.5px] bg-slate-50">
                  <th className="p-1 border-r border-black w-44 text-left pl-2">DISCIPLINES</th>
                  
                  {/* TRIMESTRE COURANT */}
                  <th colSpan={4} className="p-1 border-r border-black">
                    {activeTerm === 'TRIMESTRE_1' ? '1ER TRIMESTRE' : activeTerm === 'TRIMESTRE_2' ? '2È TRIMESTRE' : '3È TRIMESTRE'}
                  </th>

                  {/* COLONNE COMPARAISON :
                      - Pour T1 : pas de rappel (ou N/A)
                      - Pour T2 : RAPPEL T1
                      - Pour T3 : ANNUEL (comme dans la photo !)
                  */}
                  {activeTerm === 'TRIMESTRE_2' && (
                    <th colSpan={2} className="p-1 border-r border-black bg-slate-100/50">RAPPEL T1</th>
                  )}
                  {activeTerm === 'TRIMESTRE_3' && (
                    <th colSpan={2} className="p-1 border-r border-black bg-slate-100/50">ANNUEL</th>
                  )}

                  {/* PROFESSEURS */}
                  <th colSpan={2} className="p-1">PROFESSEURS</th>
                </tr>

                {/* Sub-header row */}
                <tr className="border-b border-black text-center font-bold text-[8px] bg-slate-50">
                  <th className="p-1 border-r border-black text-left pl-2"></th>
                  
                  {/* Current Term Sub-cols */}
                  <th className="p-1 border-r border-black w-14">MOY./20</th>
                  <th className="p-1 border-r border-black w-10">COEF</th>
                  <th className="p-1 border-r border-black w-14">MOY COEF</th>
                  <th className="p-1 border-r border-black w-10">RANG</th>

                  {/* Comparison Sub-cols */}
                  {(activeTerm === 'TRIMESTRE_2' || activeTerm === 'TRIMESTRE_3') && (
                    <>
                      <th className="p-1 border-r border-black w-14 bg-slate-100/50">MOY</th>
                      <th className="p-1 border-r border-black w-10 bg-slate-100/50">RANG</th>
                    </>
                  )}

                  {/* Teachers sub-cols */}
                  <th className="p-1 border-r border-black w-36 text-left pl-2">NOM ET PRENOMS</th>
                  <th className="p-1 text-left pl-2">APPRECIATION, SIGNATURE</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-black/80">
                {disciplinesData.map((d, index) => {
                  const currentData = getActiveDisciplineData(d);

                  return (
                    <React.Fragment key={d.name}>
                      <tr className="hover:bg-slate-50/50">
                        {/* Discipline Name */}
                        <td className="p-1 pl-2 border-r border-black font-semibold">
                          {d.name}
                        </td>

                        {d.isNotClassed ? (
                          <>
                            <td className="p-1 border-r border-black text-center text-slate-400"></td>
                            <td className="p-1 border-r border-black text-center text-slate-400"></td>
                            <td className="p-1 border-r border-black text-center text-slate-400"></td>
                            <td className="p-1 border-r border-black text-center font-bold text-slate-500">NC</td>
                            
                            {(activeTerm === 'TRIMESTRE_2' || activeTerm === 'TRIMESTRE_3') && (
                              <>
                                <td className="p-1 border-r border-black text-center bg-slate-100/30 text-slate-400"></td>
                                <td className="p-1 border-r border-black text-center font-bold text-slate-500 bg-slate-100/30">NC</td>
                              </>
                            )}

                            <td className="p-1 border-r border-black pl-2"></td>
                            <td className="p-1 pl-2"></td>
                          </>
                        ) : (
                          <>
                            <td className="p-1 border-r border-black text-center font-semibold">
                              {formatGrade(currentData.moy)}
                            </td>
                            <td className="p-1 border-r border-black text-center font-bold">
                              {currentData.coef}
                            </td>
                            <td className="p-1 border-r border-black text-center font-semibold">
                              {formatGrade(currentData.moyCoef)}
                            </td>
                            <td className="p-1 border-r border-black text-center font-bold">
                              {currentData.rank ? `${currentData.rank}e` : ''}
                            </td>

                            {/* Comparison columns */}
                            {activeTerm === 'TRIMESTRE_2' && (
                              <>
                                <td className="p-1 border-r border-black text-center font-semibold bg-slate-100/30">
                                  {formatGrade(d.t1.moy)}
                                </td>
                                <td className="p-1 border-r border-black text-center font-bold bg-slate-100/30">
                                  {d.t1.rank}e
                                </td>
                              </>
                            )}

                            {activeTerm === 'TRIMESTRE_3' && (
                              <>
                                <td className="p-1 border-r border-black text-center font-semibold bg-slate-100/30">
                                  {formatGrade(d.annual.moy)}
                                </td>
                                <td className="p-1 border-r border-black text-center font-bold bg-slate-100/30">
                                  {d.annual.rank}e
                                </td>
                              </>
                            )}

                            <td className="p-1 border-r border-black pl-2 text-[9px] uppercase font-bold truncate">
                              {d.teacher}
                            </td>
                            <td className="p-1 pl-2 text-[9px] italic font-medium">
                              {d.appreciation}
                            </td>
                          </>
                        )}
                      </tr>

                      {/* BILAN LETTRES ROW */}
                      {d.name === 'Espagnol / Allemand' && (
                        <tr className="bg-slate-100/60 font-semibold border-y border-black">
                          <td className="p-1 pl-2 border-r border-black uppercase text-[9px] tracking-wider">
                            BILAN LETTRES
                          </td>
                          <td className="p-1 border-r border-black text-center font-semibold">
                            {formatGrade(bilanLettres)}
                          </td>
                          <td className="p-1 border-r border-black text-center"></td>
                          <td className="p-1 border-r border-black text-center"></td>
                          <td className="p-1 border-r border-black text-center"></td>
                          {(activeTerm === 'TRIMESTRE_2' || activeTerm === 'TRIMESTRE_3') && (
                            <>
                              <td className="p-1 border-r border-black text-center bg-slate-100/60"></td>
                              <td className="p-1 border-r border-black text-center bg-slate-100/60"></td>
                            </>
                          )}
                          <td className="p-1 border-r border-black"></td>
                          <td className="p-1"></td>
                        </tr>
                      )}

                      {/* BILAN SCIENCES ROW */}
                      {d.name === 'Sc. de la Vie et de la Terre' && (
                        <tr className="bg-slate-100/60 font-semibold border-y border-black">
                          <td className="p-1 pl-2 border-r border-black uppercase text-[9px] tracking-wider">
                            BILAN SCIENCES
                          </td>
                          <td className="p-1 border-r border-black text-center font-semibold">
                            {formatGrade(bilanSciences)}
                          </td>
                          <td className="p-1 border-r border-black text-center"></td>
                          <td className="p-1 border-r border-black text-center"></td>
                          <td className="p-1 border-r border-black text-center"></td>
                          {(activeTerm === 'TRIMESTRE_2' || activeTerm === 'TRIMESTRE_3') && (
                            <>
                              <td className="p-1 border-r border-black text-center bg-slate-100/60"></td>
                              <td className="p-1 border-r border-black text-center bg-slate-100/60"></td>
                            </>
                          )}
                          <td className="p-1 border-r border-black"></td>
                          <td className="p-1"></td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* TOTAL ROW */}
                <tr className="border-t-2 border-black font-semibold bg-slate-50 text-[10px]">
                  <td className="p-1 text-right pr-3 border-r border-black"></td>
                  <td className="p-1 border-r border-black"></td>
                  <td className="p-1 border-r border-black text-center font-semibold">{totalCoef}</td>
                  <td className="p-1 border-r border-black text-center font-semibold">{formatGrade(totalPoints)}</td>
                  <td className="p-1 border-r border-black"></td>
                  {(activeTerm === 'TRIMESTRE_2' || activeTerm === 'TRIMESTRE_3') && (
                    <>
                      <td className="p-1 border-r border-black bg-slate-100/50"></td>
                      <td className="p-1 border-r border-black bg-slate-100/50"></td>
                    </>
                  )}
                  <td className="p-1 border-r border-black"></td>
                  <td className="p-1"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ================= 5. BILAN DU TRIMESTRE ================= */}
          <div className="text-center font-semibold uppercase text-xs tracking-wider py-1 mt-1">
            BILAN DU {termTitle.toUpperCase()}
          </div>

          <div className="border border-black grid grid-cols-12 text-[9.5px]">
            
            {/* Assiduité */}
            <div className="col-span-3 border-r border-black p-2 flex flex-col justify-between">
              <div className="text-center font-bold uppercase text-[9px] mb-1">Assiduité</div>
              <div className="space-y-1">
                <div>Total d'heures d'absence : <strong className="font-semibold">00</strong></div>
                <div className="grid grid-cols-2 gap-1 text-[8.5px]">
                  <div>justifiées : <strong>00</strong></div>
                  <div>Non justifiées : <strong>00</strong></div>
                </div>
              </div>
            </div>

            {/* Moyenne Trimestrielle & Rang (Center Big Box) */}
            <div className="col-span-4 border-r border-black p-2 text-center flex flex-col justify-center items-center bg-slate-50/40">
              <div className="font-bold underline text-[9.5px]">Moyenne Trimestrielle</div>
              <div className="text-lg sm:text-xl font-semibold mt-0.5 tracking-tight">
                {activeTerm === 'TRIMESTRE_1' ? formatGrade(t1Avg) : activeTerm === 'TRIMESTRE_2' ? formatGrade(t2Avg) : formatGrade(t3Avg)} <span className="text-sm font-bold">/20</span>
              </div>
              <div className="text-[10px] font-semibold mt-0.5">
                Rang : <span className="underline">{currentTermRank}e</span> sur <span className="font-bold">{effectiveClass}</span>
              </div>
            </div>

            {/* Résultats de la classe */}
            <div className="col-span-5 p-2 space-y-1 text-[9px]">
              <div className="text-center font-bold uppercase text-[9px]">Résultats de la classe</div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1">
                <div>Moyenne générale de la classe : <strong className="font-semibold">{classAvg}</strong></div>
                <div>Moyenne mini : <strong className="font-semibold">{classMin}</strong></div>
                <div></div>
                <div>Moyenne maxi : <strong className="font-semibold">{classMax}</strong></div>
              </div>
            </div>
          </div>

          {/* Mentions du Conseil & Appréciations */}
          <div className="border-x border-b border-black grid grid-cols-12 text-[9px]">
            
            {/* Mentions Box */}
            <div className="col-span-6 border-r border-black p-2 space-y-1">
              <div className="text-center font-bold underline mb-1">Mentions du Conseil de Classe</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="font-bold uppercase text-[8px] text-slate-700">DISTINCTIONS</div>
                  <div className="space-y-0.5 mt-0.5">
                    <label className="flex items-center gap-1.5 cursor-default">
                      <input type="checkbox" readOnly checked={currentTermAvg >= 14} className="rounded-none" />
                      <span>Tableau d'Honneur + Félicitations</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-default">
                      <input type="checkbox" readOnly checked={currentTermAvg >= 12 && currentTermAvg < 14} className="rounded-none" />
                      <span>Tableau d'Honneur</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-default">
                      <input type="checkbox" readOnly checked={currentTermAvg >= 10 && currentTermAvg < 12} className="rounded-none" />
                      <span>Encouragements</span>
                    </label>
                  </div>
                </div>

                <div>
                  <div className="font-bold uppercase text-[8px] text-slate-700">SANCTIONS</div>
                  <div className="space-y-0.5 mt-0.5">
                    <label className="flex items-center gap-1.5 cursor-default">
                      <input type="checkbox" readOnly checked={currentTermAvg < 8.5} className="rounded-none" />
                      <span>Blâme Travail</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-default">
                      <input type="checkbox" readOnly checked={false} className="rounded-none" />
                      <span>Blâme conduite</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-default">
                      <input type="checkbox" readOnly checked={currentTermAvg < 10 && currentTermAvg >= 8.5} className="rounded-none" />
                      <span>Avertissement Travail</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Appréciations du Conseil de classe */}
            <div className="col-span-6 p-2 flex flex-col justify-between">
              <div className="text-center font-bold underline mb-1">Appréciations du Conseil de classe</div>
              <div className="text-[10px] italic font-medium p-1 leading-snug text-slate-900">
                {currentTermAvg >= 14
                  ? "Très bon trimestre. Travail rigoureux, félicitations du conseil."
                  : currentTermAvg >= 11
                  ? "Ensemble satisfaisant. Élève sérieux, poursuivre dans cette voie."
                  : currentTermAvg >= 10
                  ? "Trimestre passable. Des efforts constants sont nécessaires pour consolider les acquis."
                  : "Résultats insuffisants. Intensifier le travail personnel et la concentration."}
              </div>
              <div className="text-[8px] text-right italic text-slate-500">Le Conseil des Professeurs</div>
            </div>
          </div>

          {/* ================= 6. BILAN DE FIN D'ANNÉE / BILAN RÉCAPITULATIF ================= */}
          {/* Si 3è Trimestre : Affiche le Bilan de fin d'année exactement comme sur la photo ! */}
          {activeTerm === 'TRIMESTRE_3' && (
            <>
              <div className="text-center font-semibold uppercase text-xs tracking-wider py-1 mt-1">
                BILAN DE FIN D'ANNEE
              </div>

              <div className="border border-black grid grid-cols-12 text-[9.5px]">
                
                {/* 1. RECAPITULATIF DES 3 TRIMESTRES */}
                <div className="col-span-4 border-r border-black p-2 space-y-1">
                  <div className="text-center font-bold underline mb-1 uppercase text-[9px]">RECAPITULATIF</div>
                  <div className="space-y-0.5 text-[9px]">
                    <div className="flex justify-between">
                      <span>Moyenne du 1er Trimestre</span>
                      <strong className="font-semibold">{formatGrade(t1Avg)} <span className="font-normal text-[8px]">/20</span></strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Moyenne du 2è Trimestre</span>
                      <strong className="font-semibold">22,70 <span className="font-normal text-[8px]">/40</span></strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Moyenne du 3è Trimestre</span>
                      <strong className="font-semibold">22,16 <span className="font-normal text-[8px]">/40</span></strong>
                    </div>
                  </div>

                  {/* MOYENNE GENERALE ANNUELLE ENCADRÉE */}
                  <div className="border-t border-black pt-1 mt-1 flex justify-between items-center">
                    <span className="font-semibold text-[9px] uppercase">MOYENNE GENERALE ANNUELLE</span>
                    <strong className="font-semibold text-xs border border-black px-1.5 py-0.5 bg-slate-100">
                      {formatGrade(annualAvg)} <span className="text-[8px]">/20</span>
                    </strong>
                  </div>

                  <div className="flex justify-between items-center text-[9px] pt-0.5">
                    <span className="font-semibold uppercase">RANG ANNUEL</span>
                    <strong className="font-semibold">{annualRank}e <span className="font-normal">sur</span> {effectiveClass}</strong>
                  </div>
                </div>

                {/* 2. DÉCISION DE FIN D'ANNÉE */}
                <div className="col-span-4 border-r border-black p-2 flex flex-col justify-between">
                  <div>
                    <div className="text-center font-bold underline mb-1">Décision de fin d'année</div>
                    <div className="text-center py-2 font-semibold text-[10px] text-black">
                      {annualAvg >= 10
                        ? "Passe en classe supérieure (1ère C)"
                        : annualAvg >= 8.5
                        ? "Autorisé(e) à redoubler"
                        : "Exclu(e) pour insuffisance de travail"}
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <div className="text-[8.5px] font-bold underline">Nom/Signature du professeur principal</div>
                    <div className="font-bold text-[9px] uppercase mt-4">TOUO PIERRE</div>
                  </div>
                </div>

                {/* 3. SIGNATURE & CACHET CHEF D'ETABLISSEMENT */}
                <div className="col-span-4 p-2 flex flex-col justify-between text-center">
                  <div className="text-[8.5px] font-bold underline">
                    Nom/Signature et Cachet du Chef d'Etablissement
                  </div>

                  <div className="text-[9px] italic mt-1">
                    Fait à {school.city ? school.city.toUpperCase() : "ABIDJAN"}, le 14 juin 2026
                  </div>

                  <div className="font-semibold uppercase text-[9px] mt-1">
                    LE DIRECTEUR DES ETUDES
                  </div>

                  <div className="font-semibold uppercase text-[10px] tracking-wide mt-4">
                    {school.directorName ? school.directorName.toUpperCase() : "M. OUATTARA ALI"}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Si 1er Trimestre : Bilan et Signatures adaptées */}
          {activeTerm === 'TRIMESTRE_1' && (
            <div className="border-x border-b border-black grid grid-cols-12 text-[9.5px]">
              <div className="col-span-4 border-r border-black p-2 space-y-1">
                <div className="text-center font-bold underline mb-1 uppercase text-[9px]">RECAPITULATIF T1</div>
                <div className="flex justify-between text-[9px]">
                  <span>Moyenne 1er Trimestre :</span>
                  <strong className="font-semibold">{formatGrade(t1Avg)} /20</strong>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span>Rang :</span>
                  <strong className="font-semibold">{currentTermRank}e sur {effectiveClass}</strong>
                </div>
                <div className="text-[8px] text-slate-500 italic pt-1">
                  Premier bulletin trimestriel de l'année scolaire.
                </div>
              </div>

              <div className="col-span-4 border-r border-black p-2 flex flex-col justify-between text-center">
                <div className="text-[8.5px] font-bold underline">Nom/Signature du professeur principal</div>
                <div className="text-[9px] italic text-slate-600">Visa & Observations</div>
                <div className="font-bold text-[9px] uppercase mt-3">TOUO PIERRE</div>
              </div>

              <div className="col-span-4 p-2 flex flex-col justify-between text-center">
                <div className="text-[8.5px] font-bold underline">Nom/Signature et Cachet du Chef d'Etablissement</div>
                <div className="text-[9px] italic">Fait à {school.city ? school.city.toUpperCase() : "ABIDJAN"}, le 15 décembre 2025</div>
                <div className="font-semibold uppercase text-[9px]">LE DIRECTEUR DES ETUDES</div>
                <div className="font-semibold uppercase text-[10px] mt-2">
                  {school.directorName ? school.directorName.toUpperCase() : "M. OUATTARA ALI"}
                </div>
              </div>
            </div>
          )}

          {/* Si 2è Trimestre : Bilan et Signatures adaptées */}
          {activeTerm === 'TRIMESTRE_2' && (
            <div className="border-x border-b border-black grid grid-cols-12 text-[9.5px]">
              <div className="col-span-4 border-r border-black p-2 space-y-1">
                <div className="text-center font-bold underline mb-1 uppercase text-[9px]">RECAPITULATIF SEMESTRE</div>
                <div className="flex justify-between text-[9px]">
                  <span>Moyenne 1er Trimestre :</span>
                  <strong className="font-semibold">{formatGrade(t1Avg)} /20</strong>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span>Moyenne 2è Trimestre :</span>
                  <strong className="font-semibold">{formatGrade(t2Avg)} /20</strong>
                </div>
                <div className="flex justify-between text-[9px] border-t border-black pt-0.5">
                  <span className="font-bold">Progression :</span>
                  <strong className="font-semibold text-green-700">+ 0,43 pt</strong>
                </div>
              </div>

              <div className="col-span-4 border-r border-black p-2 flex flex-col justify-between text-center">
                <div className="text-[8.5px] font-bold underline">Nom/Signature du professeur principal</div>
                <div className="text-[9px] italic text-slate-600">Visa & Observations</div>
                <div className="font-bold text-[9px] uppercase mt-3">TOUO PIERRE</div>
              </div>

              <div className="col-span-4 p-2 flex flex-col justify-between text-center">
                <div className="text-[8.5px] font-bold underline">Nom/Signature et Cachet du Chef d'Etablissement</div>
                <div className="text-[9px] italic">Fait à {school.city ? school.city.toUpperCase() : "ABIDJAN"}, le 28 mars 2026</div>
                <div className="font-semibold uppercase text-[9px]">LE DIRECTEUR DES ETUDES</div>
                <div className="font-semibold uppercase text-[10px] mt-2">
                  {school.directorName ? school.directorName.toUpperCase() : "M. OUATTARA ALI"}
                </div>
              </div>
            </div>
          )}

          {/* ================= 7. Pied de page ================= */}
          <div className="text-[8px] font-mono text-black text-left pt-1.5">
            *{student.lastName} {student.firstName}* - *{student.matricule || '11045120Z'}* - {student.className || '2nd C1'} - {termTitle} {school.currentAcademicYear || '2025-2026'}
          </div>
        </div>

      </div>
    </div>
  );
};

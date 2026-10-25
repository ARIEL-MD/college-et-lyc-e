import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileEdit, Award, CheckCircle2, Save, Send,
  Star, FileText, ArrowUpDown, HelpCircle,
  BookOpen, Calculator, Info, ChevronDown, ChevronUp,
  RefreshCw, Check, ArrowRight
} from 'lucide-react';
import { Student } from '../../types';

export const GradesView: React.FC = () => {
  const {
    classes,
    students,
    subjects,
    openModal,
    showToast,
    saveGradeBatch,
    recalculateStudentAverages,
    setCurrentView,
    academicYear
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'cls_3a');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || 'sub_maths');
  const [term, setTerm] = useState<'TRIMESTRE_1' | 'TRIMESTRE_2' | 'TRIMESTRE_3'>('TRIMESTRE_1');
  const [evaluationType, setEvaluationType] = useState<'DEVOIR' | 'INTERRO' | 'COMPO'>('DEVOIR');
  const [showGuide, setShowGuide] = useState<boolean>(true);

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter(s => s.classId === selectedClassId);
  const selectedSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

  // Matrix of grades per student: Interro, Devoir 1, Devoir 2, Compo, and Appreciation
  const [gradesMatrix, setGradesMatrix] = useState<Record<string, {
    interro?: number;
    devoir1?: number;
    devoir2?: number;
    compo?: number;
    appreciation?: string;
  }>>({
    'std_01': { interro: 16.5, devoir1: 17.0, devoir2: 16.0, compo: 17.5, appreciation: 'Excellent travail, très rigoureux' },
    'std_02': { interro: 14.0, devoir1: 15.0, devoir2: 13.5, compo: 14.5, appreciation: 'Bon trimestre, bonne participation' },
    'std_03': { interro: 11.0, devoir1: 12.0, devoir2: 10.5, compo: 12.5, appreciation: 'Passable, des efforts à intensifier' },
    'std_04': { interro: 9.0, devoir1: 8.5, devoir2: 9.5, compo: 10.0, appreciation: 'Insuffisant, manque de rigueur' },
    'std_05': { interro: 18.0, devoir1: 17.5, devoir2: 18.5, compo: 19.0, appreciation: 'Félicitations, travail remarquable' },
    'std_06': { interro: 13.5, devoir1: 14.0, devoir2: 13.0, compo: 13.5, appreciation: 'Travail régulier et satisfaisant' },
  });

  // Calculate subject average for a student: ( (Interro + D1 + D2)/3 + Compo ) / 2
  const computeStudentSubjectAvg = (studentId: string): number | null => {
    const row = gradesMatrix[studentId];
    if (!row) return null;

    const classWork: number[] = [];
    if (row.interro !== undefined) classWork.push(row.interro);
    if (row.devoir1 !== undefined) classWork.push(row.devoir1);
    if (row.devoir2 !== undefined) classWork.push(row.devoir2);

    const classWorkAvg = classWork.length > 0 ? classWork.reduce((a, b) => a + b, 0) / classWork.length : null;
    const compo = row.compo;

    if (classWorkAvg !== null && compo !== undefined) {
      // Formule : (moyenne de classe + composition) / 2
      return Number(((classWorkAvg + compo) / 2).toFixed(2));
    } else if (classWorkAvg !== null) {
      return Number(classWorkAvg.toFixed(2));
    } else if (compo !== undefined) {
      return Number(compo.toFixed(2));
    }

    return null;
  };

  const handleCellChange = (studentId: string, field: 'interro' | 'devoir1' | 'devoir2' | 'compo', val: string) => {
    const num = parseFloat(val);
    setGradesMatrix(prev => {
      const studentRow = prev[studentId] || {};
      if (!isNaN(num) && num >= 0 && num <= 20) {
        return {
          ...prev,
          [studentId]: {
            ...studentRow,
            [field]: num,
          }
        };
      } else if (val === '') {
        const updatedRow = { ...studentRow };
        delete updatedRow[field];
        return {
          ...prev,
          [studentId]: updatedRow,
        };
      }
      return prev;
    });
  };

  const handleAppreciationChange = (studentId: string, appreciation: string) => {
    setGradesMatrix(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        appreciation,
      }
    }));
  };

  // Populate sample grades
  const handlePopulateSampleGrades = () => {
    const newMatrix: typeof gradesMatrix = {};
    classStudents.forEach((s, idx) => {
      const base = 16 - (idx % 6) * 1.5;
      newMatrix[s.id] = {
        interro: Math.min(20, Math.max(7, Number((base + Math.sin(idx) * 2).toFixed(1)))),
        devoir1: Math.min(20, Math.max(6, Number((base + 0.5).toFixed(1)))),
        devoir2: Math.min(20, Math.max(8, Number((base - 0.5).toFixed(1)))),
        compo: Math.min(20, Math.max(7, Number((base + 1).toFixed(1)))),
        appreciation: base >= 15 ? 'Très bien' : base >= 12 ? 'Assez bien' : base >= 10 ? 'Passable' : 'Doit progresser',
      };
    });
    setGradesMatrix(newMatrix);
    showToast('Exemples de notes générés pour tous les élèves de la classe', 'info');
  };

  // Save all entered grades and recalculate bulletin averages
  const handleSaveAllAndRecalculate = () => {
    const entriesToSave: any[] = [];
    classStudents.forEach(s => {
      const row = gradesMatrix[s.id];
      if (!row) return;

      const finalAvg = computeStudentSubjectAvg(s.id);
      if (finalAvg !== null) {
        entriesToSave.push({
          studentId: s.id,
          studentName: `${s.firstName} ${s.lastName}`,
          classId: selectedClassId,
          className: selectedClass.name,
          subjectId: selectedSubjectId,
          subjectName: selectedSubject.name,
          coefficient: selectedSubject.coefficient,
          score: finalAvg,
          maxScore: 20,
          term,
          evaluationType,
          date: new Date().toISOString().split('T')[0],
          recordedByTeacher: 'M. TOURE',
        });
      }
    });

    saveGradeBatch(entriesToSave);
    recalculateStudentAverages(selectedClassId);
  };

  // Calculate class average
  const averagesList = classStudents
    .map(s => computeStudentSubjectAvg(s.id))
    .filter((a): a is number => a !== null);

  const classSubjectAvg = averagesList.length > 0
    ? (averagesList.reduce((sum, a) => sum + a, 0) / averagesList.length).toFixed(2)
    : '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Saisie des Notes & Évaluations</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Barème (0 à 20)
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Saisie des interrogations, devoirs surveillés et compositions avec calcul automatique des moyennes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => openModal('bulk_sms_grades', { classId: selectedClassId, term })}
            className="py-2 px-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Diffuser les moyennes par SMS</span>
          </button>

          <button
            onClick={() => setCurrentView('bulletins')}
            className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Voir les Bulletins de la Classe</span>
          </button>
        </div>
      </div>

      {/* Guide Banner: Comment remplir les notes et générer les bulletins */}
      <div className="bg-blue-700 text-white rounded-lg p-6 shadow-md border border-blue-800 relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-blue-500/20 text-blue-700">
                <HelpCircle className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-200">
                Guide : Comment remplir les notes et éditer les bulletins scolaires ?
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Le calcul de la moyenne par matière suit la formule ci-dessous. Vérifiez qu'elle correspond aux règles de votre établissement :
            </p>
          </div>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Afficher/Masquer le guide"
          >
            {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showGuide && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 mt-5 pt-4 border-t border-white/10 text-xs">
            <div className="bg-white p-3.5 rounded-2xl border border-white/10">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-semibold flex items-center justify-center text-xs mb-2">
                1
              </div>
              <p className="font-bold text-white mb-1">Sélectionner Classe & Matière</p>
              <p className="text-[11px] text-slate-300">
                Choisissez la classe (de la 6e à la Terminale), la discipline et le trimestre concerné.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-white/10">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-semibold flex items-center justify-center text-xs mb-2">
                2
              </div>
              <p className="font-bold text-white mb-1">Saisie des Évaluations</p>
              <p className="text-[11px] text-slate-300">
                Remplissez les notes d'Interrogation, Devoir Surveillé 1 & 2 et Composition sur 20.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-white/10">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-semibold flex items-center justify-center text-xs mb-2">
                3
              </div>
              <p className="font-bold text-white mb-1">Calcul automatique</p>
              <p className="text-[11px] text-slate-300">
                La moyenne de classe et la moyenne trimestrielle se calculent en direct avec coefficients.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-white/10">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-semibold flex items-center justify-center text-xs mb-2">
                4
              </div>
              <p className="font-bold text-white mb-1">Bulletins & SMS Parents</p>
              <p className="text-[11px] text-slate-300">
                Enregistrez pour générer le bulletin officiel et envoyer la notification SMS aux parents sans application !
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Selectors Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Classe</label>
            <select
              aria-label="Sélectionner la classe pour les notes"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-blue-700 focus:outline-none cursor-pointer"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.level === 'LYCEE' ? 'Lycée' : 'Collège'})
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Matière / Discipline</label>
            <select
              aria-label="Sélectionner la matière pour les notes"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} (Coef. {s.coefficient})
                </option>
              ))}
            </select>
          </div>

          {/* Term */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Trimestre</label>
            <select
              aria-label="Sélectionner le trimestre"
              value={term}
              onChange={(e) => setTerm(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="TRIMESTRE_1">1er Trimestre</option>
              <option value="TRIMESTRE_2">2e Trimestre</option>
              <option value="TRIMESTRE_3">3e Trimestre</option>
            </select>
          </div>
        </div>

        {/* Action button & Class stat */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePopulateSampleGrades}
            className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Remplir avec des exemples de notes pour tester"
          >
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>Exemples de notes</span>
          </button>

          <div className="text-right pl-3 border-l border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Moyenne Classe</span>
            <span className="text-lg font-semibold text-blue-700">{classSubjectAvg}/20</span>
          </div>
        </div>
      </div>

      {/* Complete Multi-Evaluation Grading Table */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Grille d'évaluation : {selectedSubject.name} (Coef. {selectedSubject.coefficient}) — {selectedClass.name}
            </h3>
            <p className="text-[11px] text-slate-500">
              Formule utilisée : moyenne matière = [((Interro + Devoir1 + Devoir2) / N) + Composition] / 2
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              {classStudents.length} élèves inscrits
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4 w-12">N°</th>
                <th className="py-3 px-4">Élève & Matricule</th>
                <th className="py-3 px-3 text-center">Interro /20</th>
                <th className="py-3 px-3 text-center">Devoir 1 /20</th>
                <th className="py-3 px-3 text-center">Devoir 2 /20</th>
                <th className="py-3 px-3 text-center bg-blue-50/50 text-blue-900">Compo /20</th>
                <th className="py-3 px-3 text-center bg-blue-100/70 text-blue-950 font-semibold">Moyenne Matière</th>
                <th className="py-3 px-4">Appréciation Enseignant</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((s, idx) => {
                const row = gradesMatrix[s.id] || {};
                const calculatedAvg = computeStudentSubjectAvg(s.id);

                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Index */}
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {idx + 1}
                    </td>

                    {/* Student */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{s.lastName} {s.firstName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{s.matricule} • Parent: {s.parentPhone}</div>
                    </td>

                    {/* Interro */}
                    <td className="py-3 px-2 text-center">
                      <input
                        type="number"
                        step={0.25}
                        min={0}
                        max={20}
                        value={row.interro !== undefined ? row.interro : ''}
                        onChange={(e) => handleCellChange(s.id, 'interro', e.target.value)}
                        placeholder="—"
                        className="w-14 text-center bg-slate-50 border border-slate-200 rounded-lg py-1 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>

                    {/* Devoir 1 */}
                    <td className="py-3 px-2 text-center">
                      <input
                        type="number"
                        step={0.25}
                        min={0}
                        max={20}
                        value={row.devoir1 !== undefined ? row.devoir1 : ''}
                        onChange={(e) => handleCellChange(s.id, 'devoir1', e.target.value)}
                        placeholder="—"
                        className="w-14 text-center bg-slate-50 border border-slate-200 rounded-lg py-1 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>

                    {/* Devoir 2 */}
                    <td className="py-3 px-2 text-center">
                      <input
                        type="number"
                        step={0.25}
                        min={0}
                        max={20}
                        value={row.devoir2 !== undefined ? row.devoir2 : ''}
                        onChange={(e) => handleCellChange(s.id, 'devoir2', e.target.value)}
                        placeholder="—"
                        className="w-14 text-center bg-slate-50 border border-slate-200 rounded-lg py-1 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>

                    {/* Compo */}
                    <td className="py-3 px-2 text-center bg-blue-50/30">
                      <input
                        type="number"
                        step={0.25}
                        min={0}
                        max={20}
                        value={row.compo !== undefined ? row.compo : ''}
                        onChange={(e) => handleCellChange(s.id, 'compo', e.target.value)}
                        placeholder="—"
                        className="w-14 text-center bg-white border border-blue-300 rounded-lg py-1 text-xs font-semibold text-blue-900 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs"
                      />
                    </td>

                    {/* Computed Subject Average */}
                    <td className="py-3 px-3 text-center bg-blue-50/50">
                      {calculatedAvg !== null ? (
                        <span className={`inline-block font-semibold text-xs px-2 py-0.5 rounded-md ${
                          calculatedAvg >= 14
                            ? 'bg-green-100 text-green-800'
                            : calculatedAvg >= 10
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {calculatedAvg.toFixed(2)}/20
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">—</span>
                      )}
                    </td>

                    {/* Appreciation */}
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={row.appreciation || ''}
                        onChange={(e) => handleAppreciationChange(s.id, e.target.value)}
                        placeholder="ex: Bon travail, assidu..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs italic text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>

                    {/* View Single Bulletin */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openModal('bulletin_view', { student: s, avg: calculatedAvg || 14.5, rank: idx + 1 })}
                        className="py-1 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Bulletin</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer actions bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Les notes enregistrées alimentent directement les <strong>Bulletins Trimestriels</strong> et permettent l'envoi des résumés par SMS.
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSaveAllAndRecalculate}
              className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Enregistrer & Recalculer les Bulletins</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X, Send, Award, Smartphone, CheckCircle2,
  Users, RefreshCw, Check, Star, AlertCircle,
  FileText, Search, ChevronRight, MessageSquare, Info
} from 'lucide-react';
import { formatFCFA, detectCarrier, calculateSmsSegments } from '../../utils/formatters';

interface BulkGradesSmsModalProps {
  initialClassId?: string;
  initialTerm?: 'TRIMESTRE_1' | 'TRIMESTRE_2' | 'TRIMESTRE_3';
  onClose: () => void;
}

export const BulkGradesSmsModal: React.FC<BulkGradesSmsModalProps> = ({
  initialClassId,
  initialTerm = 'TRIMESTRE_1',
  onClose
}) => {
  const { classes, students, school, sendBulkSms, showToast } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || classes[0]?.id || 'cls_3a'
  );
  const [selectedTerm, setSelectedTerm] = useState<'TRIMESTRE_1' | 'TRIMESTRE_2' | 'TRIMESTRE_3'>(
    initialTerm
  );

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];

  // Fetch and calculate ranked students for this class
  const classStudents = useMemo(() => {
    const list = students.filter(s => s.classId === selectedClassId);
    
    // Sort by general average descending
    return [...list].sort((a, b) => (b.generalAverage || 10) - (a.generalAverage || 10));
  }, [students, selectedClassId]);

  // Selected students IDs for checkboxes
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(() =>
    classStudents.map(s => s.id)
  );

  // When class changes, reselect all students in that class
  const handleClassChange = (newClassId: string) => {
    setSelectedClassId(newClassId);
    const newStudents = students.filter(s => s.classId === newClassId);
    setSelectedStudentIds(newStudents.map(s => s.id));
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [activePreviewStudentId, setActivePreviewStudentId] = useState<string>(
    classStudents[0]?.id || ''
  );

  // Template selector and custom message template
  const [templateType, setTemplateType] = useState<'STANDARD' | 'FELICITATION' | 'COURT'>('STANDARD');

  const templates = {
    STANDARD: `[ECOLE]: Bulletin [TRIMESTRE] de [NOM] ([CLASSE]). Moyenne: [MOYENNE]/20 - Rang: [RANG] sur [EFFECTIF] ([MENTION]). Retrait des livrets au secrétariat. Tél: [TELEPHONE_ECOLE]`,
    FELICITATION: `[ECOLE]: Résultats officiels [TRIMESTRE] pour [NOM] ([CLASSE]). Moyenne: [MOYENNE]/20 (Rang: [RANG]/[EFFECTIF] - [MENTION]). Bravo pour le travail. Direction: [TELEPHONE_ECOLE]`,
    COURT: `[ECOLE]: [NOM] ([CLASSE]) - [TRIMESTRE]: Moyenne [MOYENNE]/20, Rang [RANG]/[EFFECTIF]. Info: [TELEPHONE_ECOLE]`
  };

  const [messageTemplate, setMessageTemplate] = useState<string>(templates.STANDARD);

  const handleSelectTemplate = (type: 'STANDARD' | 'FELICITATION' | 'COURT') => {
    setTemplateType(type);
    setMessageTemplate(templates[type]);
  };

  const getMention = (avg: number) => {
    if (avg >= 16) return 'Très Bien';
    if (avg >= 14) return "Tableau d'Honneur";
    if (avg >= 12) return 'Encouragements';
    if (avg >= 10) return 'Passable';
    if (avg >= 8.5) return 'Avertissement Travail';
    return 'Blâme Travail';
  };

  const getTermLabel = (term: string) => {
    if (term === 'TRIMESTRE_1') return '1er Trimestre';
    if (term === 'TRIMESTRE_2') return '2è Trimestre';
    return '3è Trimestre (Fin d\'Année)';
  };

  // Helper to render message for a given student
  const renderStudentMessage = (student: typeof classStudents[0], rankIndex: number) => {
    const avg = student.generalAverage ? student.generalAverage.toFixed(2).replace('.', ',') : '11,02';
    const rankStr = rankIndex === 0 ? '1er' : `${rankIndex + 1}e`;
    const mention = getMention(student.generalAverage || 11.02);
    const termLabel = getTermLabel(selectedTerm);

    return messageTemplate
      .replace(/\[ECOLE\]/g, school.name.toUpperCase())
      .replace(/\[TRIMESTRE\]/g, termLabel)
      .replace(/\[NOM\]/g, `${student.lastName} ${student.firstName}`)
      .replace(/\[PRENOM\]/g, student.firstName)
      .replace(/\[PARENT\]/g, student.parentName)
      .replace(/\[CLASSE\]/g, student.className)
      .replace(/\[MOYENNE\]/g, avg)
      .replace(/\[RANG\]/g, rankStr)
      .replace(/\[EFFECTIF\]/g, classStudents.length.toString())
      .replace(/\[MENTION\]/g, mention)
      .replace(/\[TELEPHONE_ECOLE\]/g, school.phone);
  };

  // Filtered student list
  const filteredStudents = classStudents.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.parentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedTargets = classStudents.filter(s => selectedStudentIds.includes(s.id));
  const segmentInfo = calculateSmsSegments(messageTemplate);
  const estimatedCost = selectedTargets.length * 20 * (segmentInfo.segments || 1);

  const [isSending, setIsSending] = useState(false);

  const handleToggleSelectAll = () => {
    if (selectedStudentIds.length === classStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(classStudents.map(s => s.id));
    }
  };

  const handleToggleStudent = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const handleSendBatch = async () => {
    if (selectedTargets.length === 0) {
      showToast('Veuillez sélectionner au moins un élève destinataire', 'warning');
      return;
    }
    if (school.smsBalance < estimatedCost) {
      showToast('Solde SMS insuffisant. Veuillez recharger votre solde établissement.', 'error');
      return;
    }

    setIsSending(true);

    // Build individualized targets with precise student marks
    const targets = selectedTargets.map(s => {
      const rankIdx = classStudents.findIndex(cs => cs.id === s.id);
      const avg = s.generalAverage ? s.generalAverage.toFixed(2).replace('.', ',') : '11,02';
      const rankStr = rankIdx === 0 ? '1er' : `${rankIdx + 1}e`;
      const mention = getMention(s.generalAverage || 11.02);
      const personalized = renderStudentMessage(s, rankIdx);

      return {
        phone: s.parentPhone,
        name: s.parentName,
        studentName: `${s.firstName} ${s.lastName}`,
        className: s.className,
        customMessage: personalized,
        average: avg,
        rank: rankStr,
        classSize: classStudents.length,
        term: getTermLabel(selectedTerm),
        mention
      };
    });

    await sendBulkSms(targets, messageTemplate, 'BULLETIN');
    setIsSending(false);
    onClose();
  };

  const currentPreviewStudent = classStudents.find(s => s.id === activePreviewStudentId) || classStudents[0];
  const currentPreviewRankIdx = classStudents.findIndex(s => s.id === currentPreviewStudent?.id);
  const previewText = currentPreviewStudent
    ? renderStudentMessage(currentPreviewStudent, currentPreviewRankIdx >= 0 ? currentPreviewRankIdx : 0)
    : '';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-3 sm:p-5 overflow-y-auto duration-150 font-sans">
      <div className="bg-white rounded-lg max-w-5xl w-full shadow-sm border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* TOP HEADER */}
        <div className="bg-blue-700 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-700 shadow-inner">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold tracking-tight">
                  Diffusion Groupée des Moyennes aux Parents
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-700 border border-green-500/30">
                  Envoi 1-Clic
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Chaque parent reçoit automatiquement la moyenne, le rang et la mention de son propre enfant par SMS direct.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MAIN BODY CONTENT */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          {/* STEP 1: CLASS & TRIMESTRE SELECTORS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px] tracking-wider">
                1. Classe Cible
              </label>
              <select
                aria-label="Sélectionner la classe"
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({students.filter(s => s.classId === c.id).length} élèves)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px] tracking-wider">
                2. Période / Trimestre
              </label>
              <select
                aria-label="Sélectionner le trimestre"
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="TRIMESTRE_1">1er Trimestre</option>
                <option value="TRIMESTRE_2">2è Trimestre</option>
                <option value="TRIMESTRE_3">3è Trimestre (Fin d'Année)</option>
              </select>
            </div>

            {/* Live Class Stats Overview */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-around text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">Effectif</span>
                <span className="text-sm font-semibold text-slate-900">{classStudents.length} élèves</span>
              </div>
              <div className="w-px h-6 bg-slate-200"></div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">Moy. Classe</span>
                <span className="text-sm font-semibold text-blue-600">
                  {classStudents.length > 0
                    ? (classStudents.reduce((s, c) => s + (c.generalAverage || 10), 0) / classStudents.length).toFixed(2)
                    : '0.00'}/20
                </span>
              </div>
              <div className="w-px h-6 bg-slate-200"></div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">1er Rang</span>
                <span className="text-sm font-semibold text-green-600">
                  {classStudents[0]?.generalAverage?.toFixed(2) || '15.42'}/20
                </span>
              </div>
            </div>
          </div>

          {/* STEP 2: TEMPLATE CHOOSER & MESSAGE EDITOR */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-slate-800 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <span>3. Modèle du SMS avec Balises Dynamiques Personnalisées</span>
                <Star className="w-3.5 h-3.5 text-amber-500" />
              </label>

              {/* Template quick switchers */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectTemplate('STANDARD')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                    templateType === 'STANDARD'
                      ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Standard Officiel
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTemplate('FELICITATION')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                    templateType === 'FELICITATION'
                      ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Avec Félicitations
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTemplate('COURT')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                    templateType === 'COURT'
                      ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Court (1 SMS éco)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Message Editor Left */}
              <div className="lg:col-span-7 space-y-2">
                <textarea
                  rows={4}
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed text-slate-900 shadow-inner"
                  placeholder="Modèle du SMS..."
                />

                {/* Dynamic Variables helper badges */}
                <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1.5">
                  <div className="text-[10px] font-bold text-blue-900 flex items-center justify-between">
                    <span>Balises dynamiques auto-remplacées pour chaque élève :</span>
                    <span className="text-slate-500 font-normal">Cliquez pour insérer</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { tag: '[NOM]', desc: 'Nom complet élève' },
                      { tag: '[MOYENNE]', desc: 'Moyenne /20' },
                      { tag: '[RANG]', desc: 'Rang (ex: 1er, 2e)' },
                      { tag: '[EFFECTIF]', desc: 'Effectif total' },
                      { tag: '[MENTION]', desc: 'Tableau d\'Honneur...' },
                      { tag: '[CLASSE]', desc: 'Nom classe' },
                      { tag: '[TRIMESTRE]', desc: 'Période' },
                      { tag: '[PARENT]', desc: 'Nom du parent' },
                      { tag: '[ECOLE]', desc: 'Nom établissement' },
                      { tag: '[TELEPHONE_ECOLE]', desc: 'Téléphone école' }
                    ].map(item => (
                      <button
                        key={item.tag}
                        type="button"
                        onClick={() => setMessageTemplate(prev => prev + ' ' + item.tag)}
                        className="px-2 py-0.5 rounded-md bg-white hover:bg-blue-100 text-blue-800 font-mono font-bold text-[10px] border border-blue-200 shadow-2xs transition-colors cursor-pointer"
                        title={item.desc}
                      >
                        {item.tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Preview Right: Smartphone Simulation */}
              <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-4 text-white flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2 mb-2.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-200">
                      <Smartphone className="w-3.5 h-3.5 text-blue-700" />
                      <span>Aperçu Réel du SMS Reçu par le Parent</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-700 font-mono">
                      {school.smsSenderId || 'SCOLACI'}
                    </span>
                  </div>

                  {currentPreviewStudent && (
                    <div className="text-[11px] text-slate-300 mb-2">
                      Destinataire : <strong className="text-white">{currentPreviewStudent.parentName}</strong> ({currentPreviewStudent.parentPhone})
                    </div>
                  )}

                  {/* SMS Bubble */}
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tl-sm p-3.5 text-xs font-normal leading-relaxed shadow-sm">
                    {previewText}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{previewText.length} caractères</span>
                  <span className="font-bold text-green-700">
                    {calculateSmsSegments(previewText).segments} SMS / parent (20 FCFA)
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* STEP 3: INDIVIDUAL STUDENTS LIST & SELECTION */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <label className="text-slate-800 font-bold uppercase text-[10px] tracking-wider">
                  4. Liste des Élèves de la Classe ({selectedTargets.length} / {classStudents.length} sélectionnés)
                </label>
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-blue-600 hover:text-blue-800 font-bold text-[11px] underline cursor-pointer"
                >
                  {selectedStudentIds.length === classStudents.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                </button>
              </div>

              {/* Search Filter */}
              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher un élève ou parent..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Students Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase sticky top-0 z-10">
                  <tr>
                    <th className="p-2.5 text-center w-10">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.length === classStudents.length && classStudents.length > 0}
                        onChange={handleToggleSelectAll}
                        className="rounded cursor-pointer"
                      />
                    </th>
                    <th className="p-2.5 w-14 text-center">Rang</th>
                    <th className="p-2.5">Élève & Matricule</th>
                    <th className="p-2.5 text-center">Moyenne /20</th>
                    <th className="p-2.5">Mention / Distinction</th>
                    <th className="p-2.5">Parent Destinataire</th>
                    <th className="p-2.5 text-right pr-4">Action Aperçu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredStudents.map((s, idx) => {
                    const isSelected = selectedStudentIds.includes(s.id);
                    const avg = s.generalAverage || 11.02;
                    const rankIdx = classStudents.findIndex(cs => cs.id === s.id);
                    const rankStr = rankIdx === 0 ? '1er' : `${rankIdx + 1}e`;
                    const mention = getMention(avg);
                    const carrier = detectCarrier(s.parentPhone);
                    const isCurrentPreview = activePreviewStudentId === s.id;

                    return (
                      <tr
                        key={s.id}
                        onClick={() => setActivePreviewStudentId(s.id)}
                        className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${
                          isCurrentPreview ? 'bg-blue-50/80 font-bold' : ''
                        } ${!isSelected ? 'opacity-50' : ''}`}
                      >
                        <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleStudent(s.id)}
                            className="rounded cursor-pointer"
                          />
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                            rankIdx === 0
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : rankIdx < 3
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {rankStr}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900">{s.lastName} {s.firstName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{s.matricule}</div>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`font-semibold text-xs ${
                            avg >= 14 ? 'text-green-700' : avg >= 10 ? 'text-blue-700' : 'text-red-600'
                          }`}>
                            {avg.toFixed(2).replace('.', ',')}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className="text-[11px] font-semibold text-slate-700">{mention}</span>
                        </td>
                        <td className="p-2.5">
                          <div className="font-semibold text-slate-900">{s.parentName}</div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                            <span>{s.parentPhone}</span>
                            <span className={`text-[9px] px-1 rounded font-bold ${
                              carrier === 'ORANGE_CI' ? 'bg-amber-100 text-amber-700' :
                              carrier === 'MTN_CI' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {carrier.replace('_CI', '')}
                            </span>
                          </div>
                        </td>
                        <td className="p-2.5 text-right pr-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePreviewStudentId(s.id);
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                              isCurrentPreview
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            Aperçu
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* SUMMARY BANNER & 1-CLICK SEND BUTTON */}
          <div className="p-4 rounded-2xl bg-blue-700 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span>Campagne de diffusion :</span>
                <span className="text-blue-700 font-semibold">{selectedTargets.length} parents ciblés</span>
                <span>•</span>
                <span>Classe : <strong className="text-slate-900">{selectedClass?.name}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-600">
                <span>Coût total estimé : <strong className="text-slate-900 font-semibold">{formatFCFA(estimatedCost)}</strong></span>
                <span>•</span>
                <span>Solde SMS disponible : <strong className="text-green-700 font-bold">{formatFCFA(school.smsBalance)}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 transition-colors cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleSendBatch}
                disabled={isSending || selectedTargets.length === 0}
                className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Envoi en cours ({selectedTargets.length} SMS)...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Envoyer les {selectedTargets.length} moyennes en 1 Clic</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

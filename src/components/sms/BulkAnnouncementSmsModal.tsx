import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X, Send, Megaphone, Smartphone, CheckCircle2,
  Users, RefreshCw, FileText, AlertCircle,
  Building, Check, Filter, Search, Calendar,
  Clock, ShieldAlert
} from 'lucide-react';
import { formatFCFA, detectCarrier, calculateSmsSegments } from '../../utils/formatters';

interface BulkAnnouncementSmsModalProps {
  initialTargetType?: 'ALL' | 'CLASS' | 'CYCLE' | 'UNPAID';
  initialClassId?: string;
  onClose: () => void;
}

export const BulkAnnouncementSmsModal: React.FC<BulkAnnouncementSmsModalProps> = ({
  initialTargetType = 'ALL',
  initialClassId,
  onClose
}) => {
  const { classes, students, school, sendBulkSms, showToast } = useApp();

  // Target audience selection
  const [targetType, setTargetType] = useState<'ALL' | 'CLASS' | 'COLLEGE' | 'LYCEE' | 'UNPAID'>(
    initialTargetType === 'CLASS' ? 'CLASS' : 'ALL'
  );
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || classes[0]?.id || 'cls_3a'
  );

  // Ready-to-use Announcement Presets for Ivorian Schools
  const ANNOUNCEMENT_PRESETS = [
    {
      id: 'reunion_ag',
      label: 'Assemblée Générale des Parents',
      category: 'REUNION',
      text: `[ECOLE]: Chers parents, vous êtes conviés à l'Assemblée Générale de rentrée ce samedi à 09h00 au sein de l'établissement. Présence vivement souhaitée. Direction: [TELEPHONE_ECOLE]`
    },
    {
      id: 'fermeture_cours',
      label: 'Fermeture Exceptionnelle / Férié',
      category: 'INFO',
      text: `[ECOLE]: Information importante: les cours seront exceptionnellement suspendus ce vendredi à compter de 12h00 pour conseil d'enseignement. Reprise lundi à 07h30. Merci.`
    },
    {
      id: 'examens_blancs',
      label: 'Organisation Examens Blancs',
      category: 'EXAMEN',
      text: `[ECOLE]: Chers parents, les épreuves de l'Examen Blanc Régional débutent ce mardi. Merci de veiller à la ponctualité de [NOM] ([CLASSE]) avec sa pièce d'identité.`
    },
    {
      id: 'retrait_bulletins',
      label: 'Retrait Physique des Bulletins',
      category: 'BULLETIN',
      text: `[ECOLE]: Les bulletins trimestriels de [NOM] ([CLASSE]) sont prêts. Retrait au secrétariat du lundi au vendredi de 08h à 15h. Administration: [TELEPHONE_ECOLE]`
    },
    {
      id: 'rappel_scolarite',
      label: 'Échéance de Scolarité / Tranche',
      category: 'FINANCE',
      text: `[ECOLE]: Chers parents, la date limite de règlement de la scolarité pour [NOM] ([CLASSE]) est fixée au 30 de ce mois. Caisse ouverte 08h-16h. Tél: [TELEPHONE_ECOLE]`
    },
    {
      id: 'urgence_direction',
      label: 'Communiqué Urgent Direction',
      category: 'URGENCE',
      text: `URGENT - [ECOLE]: Chers parents, en raison des intempéries annoncées, les cours sont suspendus pour l'après-midi. Merci de récupérer vos enfants en toute sécurité.`
    }
  ];

  const [selectedPresetId, setSelectedPresetId] = useState<string>('reunion_ag');
  const [message, setMessage] = useState<string>(ANNOUNCEMENT_PRESETS[0].text);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Compute targets based on selection
  const targetedStudents = useMemo(() => {
    switch (targetType) {
      case 'ALL':
        return students;
      case 'CLASS':
        return students.filter(s => s.classId === selectedClassId);
      case 'COLLEGE': {
        const collegeClassIds = classes.filter(c => c.level === 'COLLEGE').map(c => c.id);
        return students.filter(s => collegeClassIds.includes(s.classId));
      }
      case 'LYCEE': {
        const lyceeClassIds = classes.filter(c => c.level === 'LYCEE').map(c => c.id);
        return students.filter(s => lyceeClassIds.includes(s.classId));
      }
      case 'UNPAID':
        return students.filter(s => s.unpaidTuition > 0);
      default:
        return students;
    }
  }, [targetType, selectedClassId, students, classes]);

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(() =>
    targetedStudents.map(s => s.id)
  );

  // Update selected IDs when target type changes
  const handleTargetTypeChange = (type: 'ALL' | 'CLASS' | 'COLLEGE' | 'LYCEE' | 'UNPAID') => {
    setTargetType(type);
    let newTargets = students;
    if (type === 'CLASS') {
      newTargets = students.filter(s => s.classId === selectedClassId);
    } else if (type === 'COLLEGE') {
      const ids = classes.filter(c => c.level === 'COLLEGE').map(c => c.id);
      newTargets = students.filter(s => ids.includes(s.classId));
    } else if (type === 'LYCEE') {
      const ids = classes.filter(c => c.level === 'LYCEE').map(c => c.id);
      newTargets = students.filter(s => ids.includes(s.classId));
    } else if (type === 'UNPAID') {
      newTargets = students.filter(s => s.unpaidTuition > 0);
    }
    setSelectedStudentIds(newTargets.map(s => s.id));
  };

  const handleClassChange = (cId: string) => {
    setSelectedClassId(cId);
    const newTargets = students.filter(s => s.classId === cId);
    setSelectedStudentIds(newTargets.map(s => s.id));
  };

  const handleApplyPreset = (preset: typeof ANNOUNCEMENT_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setMessage(preset.text);
  };

  const selectedTargets = targetedStudents.filter(s => selectedStudentIds.includes(s.id));
  const segmentInfo = calculateSmsSegments(message);
  const estimatedCost = selectedTargets.length * 20 * (segmentInfo.segments || 1);

  // Render preview for first target
  const previewStudent = selectedTargets[0] || targetedStudents[0] || students[0];
  const renderedPreview = previewStudent
    ? message
        .replace(/\[ECOLE\]/g, school.name.toUpperCase())
        .replace(/\[PARENT\]/g, previewStudent.parentName)
        .replace(/\[NOM\]/g, `${previewStudent.lastName} ${previewStudent.firstName}`)
        .replace(/\[CLASSE\]/g, previewStudent.className)
        .replace(/\[TELEPHONE_ECOLE\]/g, school.phone)
    : message;

  const handleToggleSelectAll = () => {
    if (selectedStudentIds.length === targetedStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(targetedStudents.map(s => s.id));
    }
  };

  const handleToggleStudent = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const handleSendAnnouncement = async () => {
    if (!message.trim()) {
      showToast('Veuillez saisir le texte de votre annonce', 'error');
      return;
    }
    if (selectedTargets.length === 0) {
      showToast('Aucun parent sélectionné pour cet envoi', 'warning');
      return;
    }
    if (school.smsBalance < estimatedCost) {
      showToast('Solde SMS insuffisant. Veuillez recharger votre compte établissement.', 'error');
      return;
    }

    setIsSending(true);

    const targets = selectedTargets.map(s => ({
      phone: s.parentPhone,
      name: s.parentName,
      studentName: `${s.firstName} ${s.lastName}`,
      className: s.className
    }));

    await sendBulkSms(targets, message, 'ANNONCE');
    setIsSending(false);
    onClose();
  };

  const filteredList = targetedStudents.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-3 sm:p-5 overflow-y-auto duration-150 font-sans">
      <div className="bg-white rounded-lg max-w-5xl w-full shadow-sm border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* HEADER */}
        <div className="bg-blue-700 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-700 shadow-inner">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold tracking-tight">
                  Envoi Groupé d'Annonces & Notifications SMS
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  Diffusion Massive Directe
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Diffusez vos circulaires, convocations et informations scolaires instantanément à l'ensemble des parents d'élèves.
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

        {/* BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          {/* STEP 1: AUDIENCE SELECTOR */}
          <div className="space-y-2">
            <label className="text-slate-800 font-bold uppercase text-[10px] tracking-wider flex items-center gap-2">
              <span>1. Choisir le groupe de destinataires</span>
              <span className="text-blue-600 font-semibold">({targetedStudents.length} familles disponibles)</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => handleTargetTypeChange('ALL')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  targetType === 'ALL'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Toute l'École ({students.length})
              </button>

              <button
                type="button"
                onClick={() => handleTargetTypeChange('CLASS')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  targetType === 'CLASS'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Par Classe Unique
              </button>

              <button
                type="button"
                onClick={() => handleTargetTypeChange('COLLEGE')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  targetType === 'COLLEGE'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Cycle Collège (6e-3e)
              </button>

              <button
                type="button"
                onClick={() => handleTargetTypeChange('LYCEE')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  targetType === 'LYCEE'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Cycle Lycée (2nde-Tle)
              </button>

              <button
                type="button"
                onClick={() => handleTargetTypeChange('UNPAID')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  targetType === 'UNPAID'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                }`}
              >
                Parents en Impayés ({students.filter(s => s.unpaidTuition > 0).length})
              </button>
            </div>

            {/* If CLASS is selected, show dropdown */}
            {targetType === 'CLASS' && (
              <div className="pt-1">
                <select
                  aria-label="Sélectionner la classe cible"
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
            )}
          </div>

          {/* STEP 2: ANNOUNCEMENT PRESET BUTTONS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-800 font-bold uppercase text-[10px] tracking-wider">
                2. Modèles d'annonces officielles prêtes à l'emploi
              </label>
              <span className="text-[11px] text-blue-600 font-semibold">1 clic pour charger</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {ANNOUNCEMENT_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-2.5 rounded-xl text-left border transition-all flex items-start gap-2 cursor-pointer ${
                    selectedPresetId === preset.id
                      ? 'bg-blue-50 text-blue-900 border-blue-400 ring-2 ring-blue-500/20'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0"></div>
                  <div>
                    <div className="font-bold text-xs">{preset.label}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{preset.text}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3: COMPOSER & SMARTPHONE PREVIEW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left: Message Editor */}
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-800 font-bold uppercase text-[10px] tracking-wider">
                  3. Texte du message SMS
                </label>
                <div className="text-xs text-slate-500">
                  <span className="font-bold text-slate-800">{segmentInfo.chars}</span> car. |{' '}
                  <span className="font-bold text-blue-600">{segmentInfo.segments} SMS</span> ({segmentInfo.remainingInSegment} restants dans segment)
                </div>
              </div>

              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed text-slate-900 shadow-inner"
                placeholder="Rédigez votre annonce scolaire ici..."
              />

              {/* Tag inserters */}
              <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-600 mr-1">Balises :</span>
                {[
                  { tag: '[ECOLE]', label: 'École' },
                  { tag: '[PARENT]', label: 'Nom Parent' },
                  { tag: '[NOM]', label: 'Nom Élève' },
                  { tag: '[CLASSE]', label: 'Classe' },
                  { tag: '[TELEPHONE_ECOLE]', label: 'Tél École' },
                  { tag: '[DATE]', label: 'Date' },
                  { tag: '[HEURE]', label: 'Heure' }
                ].map(b => (
                  <button
                    key={b.tag}
                    type="button"
                    onClick={() => setMessage(prev => prev + ' ' + b.tag)}
                    className="px-2 py-0.5 rounded-md bg-white hover:bg-blue-50 text-blue-800 font-mono font-bold text-[10px] border border-slate-300 shadow-2xs cursor-pointer"
                  >
                    {b.tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Smartphone Realistic Preview */}
            <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-4 text-white flex flex-col justify-between shadow-md">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2 mb-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-200">
                    <Smartphone className="w-3.5 h-3.5 text-blue-700" />
                    <span>Aperçu Mobile Parent</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-700 font-mono">
                    {school.smsSenderId || 'SCOLACI'}
                  </span>
                </div>

                {previewStudent && (
                  <div className="text-[11px] text-slate-300 mb-2">
                    Exemple pour : <strong className="text-white">{previewStudent.parentName}</strong> ({previewStudent.parentPhone})
                  </div>
                )}

                <div className="bg-blue-600 text-white rounded-2xl rounded-tl-sm p-3.5 text-xs font-normal leading-relaxed shadow-sm">
                  {renderedPreview}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span>{renderedPreview.length} caractères</span>
                <span className="font-bold text-green-700">
                  {calculateSmsSegments(renderedPreview).segments} SMS / parent (20 FCFA)
                </span>
              </div>
            </div>

          </div>

          {/* STEP 4: RECIPIENTS OVERVIEW */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <label className="text-slate-800 font-bold uppercase text-[10px] tracking-wider">
                  4. Destinataires ciblés ({selectedTargets.length} / {targetedStudents.length})
                </label>
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-blue-600 hover:text-blue-800 font-bold text-[11px] underline cursor-pointer"
                >
                  {selectedStudentIds.length === targetedStudents.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                </button>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrer un parent ou élève..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs max-h-40 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase sticky top-0 z-10">
                  <tr>
                    <th className="p-2 text-center w-10">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.length === targetedStudents.length && targetedStudents.length > 0}
                        onChange={handleToggleSelectAll}
                        className="rounded cursor-pointer"
                      />
                    </th>
                    <th className="p-2">Parent Destinataire</th>
                    <th className="p-2">Élève & Classe</th>
                    <th className="p-2">Téléphone (+225)</th>
                    <th className="p-2 text-center">Opérateur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredList.slice(0, 100).map((s) => {
                    const isSelected = selectedStudentIds.includes(s.id);
                    const carrier = detectCarrier(s.parentPhone);

                    return (
                      <tr
                        key={s.id}
                        onClick={() => handleToggleStudent(s.id)}
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                          !isSelected ? 'opacity-40' : ''
                        }`}
                      >
                        <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleStudent(s.id)}
                            className="rounded cursor-pointer"
                          />
                        </td>
                        <td className="p-2 font-bold text-slate-900">{s.parentName}</td>
                        <td className="p-2 text-slate-600">
                          {s.firstName} {s.lastName} <span className="text-[10px] font-bold text-blue-700">({s.className})</span>
                        </td>
                        <td className="p-2 font-mono text-slate-800">{s.parentPhone}</td>
                        <td className="p-2 text-center">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                            carrier === 'ORANGE_CI' ? 'bg-amber-100 text-amber-700' :
                            carrier === 'MTN_CI' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {carrier.replace('_CI', '')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* BOTTOM DISPATCH BAR */}
          <div className="p-4 rounded-2xl bg-blue-700 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span>Diffusion massive :</span>
                <span className="text-blue-700 font-semibold">{selectedTargets.length} SMS à expédier</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-600">
                <span>Coût total estimé : <strong className="text-slate-900 font-semibold">{formatFCFA(estimatedCost)}</strong></span>
                <span>•</span>
                <span>Solde établissement : <strong className="text-green-700 font-bold">{formatFCFA(school.smsBalance)}</strong></span>
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
                onClick={handleSendAnnouncement}
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
                    <span>Lancer la diffusion ({selectedTargets.length} SMS)</span>
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

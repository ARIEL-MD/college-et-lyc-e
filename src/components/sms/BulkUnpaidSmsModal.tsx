import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X, Send, ShieldAlert, Smartphone, CheckCircle2,
  Users, RefreshCw, FileText, AlertCircle,
  Building, Check, Filter, Search, Calendar,
  Clock, CreditCard, DollarSign
} from 'lucide-react';
import { formatFCFA, detectCarrier, calculateSmsSegments } from '../../utils/formatters';

interface BulkUnpaidSmsModalProps {
  initialClassId?: string;
  onClose: () => void;
}

export const BulkUnpaidSmsModal: React.FC<BulkUnpaidSmsModalProps> = ({
  initialClassId,
  onClose
}) => {
  const { classes, students, school, sendBulkSms, showToast } = useApp();

  // Filters
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId || 'ALL');
  const [minDebtFilter, setMinDebtFilter] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [deadlineText, setDeadlineText] = useState('30 de ce mois');

  // Compute all unpaid students based on filters
  const debtorStudents = useMemo(() => {
    return students
      .filter(s => s.unpaidTuition > 0)
      .filter(s => (selectedClassId === 'ALL' ? true : s.classId === selectedClassId))
      .filter(s => s.unpaidTuition >= minDebtFilter)
      .sort((a, b) => b.unpaidTuition - a.unpaidTuition);
  }, [students, selectedClassId, minDebtFilter]);

  // Selected student IDs
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(() =>
    debtorStudents.map(s => s.id)
  );

  // Sync selected IDs when filters change
  const handleFilterChange = (classId: string, minDebt: number) => {
    setSelectedClassId(classId);
    setMinDebtFilter(minDebt);
    const newFiltered = students
      .filter(s => s.unpaidTuition > 0)
      .filter(s => (classId === 'ALL' ? true : s.classId === classId))
      .filter(s => s.unpaidTuition >= minDebt);
    setSelectedStudentIds(newFiltered.map(s => s.id));
  };

  // Active student for preview
  const [activePreviewStudentId, setActivePreviewStudentId] = useState<string>(
    debtorStudents[0]?.id || ''
  );

  // Presets for Unpaid School Fees Reminders
  const UNPAID_PRESETS = [
    {
      id: 'amiable',
      label: '1ère Relance Courtoise / Rappel',
      badge: 'Courtois',
      text: `[ECOLE]: Bonjour M./Mme [PARENT], nous vous informons que le solde de scolarité de [NOM] ([CLASSE]) présente un reliquat de [SOLDE]. Merci de bien vouloir régulariser avant le [DATE_LIMITE]. Caisse ouverte de 08h à 16h. Tél: [TELEPHONE_ECOLE]`
    },
    {
      id: 'ferme',
      label: '2ème Relance Ferme (Échéance Proche)',
      badge: 'Ferme',
      text: `[ECOLE]: RAPPEL SCOLARITÉ - Le solde débiteur pour [NOM] ([CLASSE]) s'élève à [SOLDE]. Échéance imminente. Merci de solder ce montant au plus tard le [DATE_LIMITE] pour éviter toute interruption de cours. Caisse: [TELEPHONE_ECOLE]`
    },
    {
      id: 'urgent',
      label: 'Dernier Avis avant Suspension',
      badge: 'Urgent',
      text: `URGENT - [ECOLE]: DERNIER AVIS DE RELANCE. Un montant impayé de [SOLDE] reste dû sur la scolarité de [NOM] ([CLASSE]). Régularisation immédiate exigée à la comptabilité avant le [DATE_LIMITE]. Direction: [TELEPHONE_ECOLE]`
    },
    {
      id: 'court',
      label: 'Format Court Économique (1 SMS)',
      badge: 'Économique',
      text: `[ECOLE]: [NOM] ([CLASSE]) - Reste scolarité [SOLDE] à solder avant le [DATE_LIMITE]. Caisse ouverte. Infos: [TELEPHONE_ECOLE]`
    }
  ];

  const [selectedPresetId, setSelectedPresetId] = useState<string>('amiable');
  const [messageTemplate, setMessageTemplate] = useState<string>(UNPAID_PRESETS[0].text);

  const handleApplyPreset = (preset: typeof UNPAID_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setMessageTemplate(preset.text);
  };

  // Helper to render message for a given student
  const renderStudentMessage = (student: typeof debtorStudents[0]) => {
    return messageTemplate
      .replace(/\[ECOLE\]/g, school.name.toUpperCase())
      .replace(/\[PARENT\]/g, student.parentName)
      .replace(/\[NOM\]/g, `${student.lastName} ${student.firstName}`)
      .replace(/\[PRENOM\]/g, student.firstName)
      .replace(/\[CLASSE\]/g, student.className)
      .replace(/\[SOLDE\]/g, formatFCFA(student.unpaidTuition))
      .replace(/\[PAYE\]/g, formatFCFA(student.paidTuition))
      .replace(/\[TOTAL\]/g, formatFCFA(student.totalTuition))
      .replace(/\[DATE_LIMITE\]/g, deadlineText)
      .replace(/\[TELEPHONE_ECOLE\]/g, school.phone);
  };

  const selectedTargets = debtorStudents.filter(s => selectedStudentIds.includes(s.id));
  const totalAmountToRecover = selectedTargets.reduce((sum, s) => sum + s.unpaidTuition, 0);

  const segmentInfo = calculateSmsSegments(messageTemplate);
  const estimatedCost = selectedTargets.length * 20 * (segmentInfo.segments || 1);

  const [isSending, setIsSending] = useState(false);

  const handleToggleSelectAll = () => {
    if (selectedStudentIds.length === debtorStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(debtorStudents.map(s => s.id));
    }
  };

  const handleToggleStudent = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const handleSendBatch = async () => {
    if (selectedTargets.length === 0) {
      showToast('Veuillez sélectionner au moins une famille débitrice', 'warning');
      return;
    }
    if (school.smsBalance < estimatedCost) {
      showToast('Solde SMS insuffisant pour lancer cette campagne de relance', 'error');
      return;
    }

    setIsSending(true);

    const targets = selectedTargets.map(s => {
      const personalized = renderStudentMessage(s);
      return {
        phone: s.parentPhone,
        name: s.parentName,
        studentName: `${s.firstName} ${s.lastName}`,
        className: s.className,
        customMessage: personalized,
        unpaidAmount: formatFCFA(s.unpaidTuition),
        paidAmount: formatFCFA(s.paidTuition),
        totalAmount: formatFCFA(s.totalTuition),
        deadline: deadlineText
      };
    });

    await sendBulkSms(targets, messageTemplate, 'IMPAYE');
    setIsSending(false);
    onClose();
  };

  const filteredStudents = debtorStudents.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.parentPhone.includes(searchTerm)
  );

  const currentPreviewStudent = debtorStudents.find(s => s.id === activePreviewStudentId) || debtorStudents[0];
  const previewText = currentPreviewStudent ? renderStudentMessage(currentPreviewStudent) : '';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-3 sm:p-5 overflow-y-auto duration-150 font-sans">
      <div className="bg-white rounded-lg max-w-5xl w-full shadow-sm border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* TOP HEADER */}
        <div className="bg-blue-700 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-red-500/20 border border-red-400/30 flex items-center justify-center text-red-700 shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold tracking-tight">
                  Relance Groupée des Impayés de Scolarité par SMS
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/30 text-red-200 border border-red-400/30">
                  Recouvrement 1-Clic
                </span>
              </div>
              <p className="text-xs text-red-200/90 mt-0.5">
                Chaque parent débiteur reçoit par SMS son solde exact restant dû avec vos coordonnées de caisse.
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

        {/* MAIN BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          {/* STEP 1: SUMMARY & FILTER BAR */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-red-50/60 p-4 rounded-2xl border border-red-200/80">
            {/* Filter by class */}
            <div>
              <label className="block text-red-900 font-bold mb-1 uppercase text-[10px] tracking-wider">
                1. Filtrer par Classe
              </label>
              <select
                aria-label="Filtrer les impayés par classe"
                value={selectedClassId}
                onChange={(e) => handleFilterChange(e.target.value, minDebtFilter)}
                className="w-full bg-white border border-red-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Toutes les classes ({students.filter(s => s.unpaidTuition > 0).length} débiteurs)</option>
                {classes.map(c => {
                  const count = students.filter(s => s.classId === c.id && s.unpaidTuition > 0).length;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} ({count} débiteurs)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Filter by minimum debt */}
            <div>
              <label className="block text-red-900 font-bold mb-1 uppercase text-[10px] tracking-wider">
                2. Seuil Minimum Débiteur
              </label>
              <select
                aria-label="Seuil minimum d'impayé"
                value={minDebtFilter}
                onChange={(e) => handleFilterChange(selectedClassId, Number(e.target.value))}
                className="w-full bg-white border border-red-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-none cursor-pointer"
              >
                <option value={0}>Tous les montants d'impayés (&gt; 0 FCFA)</option>
                <option value={25000}>Impayé &ge; 25 000 FCFA</option>
                <option value={50000}>Impayé &ge; 50 000 FCFA</option>
                <option value={100000}>Impayé &ge; 100 000 FCFA</option>
              </select>
            </div>

            {/* Date limite input */}
            <div>
              <label className="block text-red-900 font-bold mb-1 uppercase text-[10px] tracking-wider">
                3. Date Limite de Paiement
              </label>
              <input
                type="text"
                value={deadlineText}
                onChange={(e) => setDeadlineText(e.target.value)}
                placeholder="Ex: 30 de ce mois, vendredi 12h..."
                className="w-full bg-white border border-red-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Total Debt & Target Summary */}
            <div className="bg-white p-2.5 rounded-xl border border-red-200 flex items-center justify-around text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Créances Ciblées</span>
                <span className="text-xs sm:text-sm font-semibold text-red-600">
                  {formatFCFA(totalAmountToRecover)}
                </span>
              </div>
              <div className="w-px h-6 bg-slate-200"></div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Familles</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-900">
                  {selectedTargets.length} parents
                </span>
              </div>
            </div>
          </div>

          {/* STEP 2: PRESET BUTTONS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-800 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <span>4. Choisir un Modèle de Relance Officiel</span>
                <FileText className="w-3.5 h-3.5 text-amber-500" />
              </label>
              <span className="text-[11px] text-red-700 font-bold">1 clic pour charger</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {UNPAID_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                    selectedPresetId === preset.id
                      ? 'bg-red-50 text-red-950 border-red-400 ring-2 ring-red-500/20 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">{preset.badge}</span>
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  </div>
                  <div className="text-[10px] text-slate-600 line-clamp-2">{preset.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3: MESSAGE COMPOSER & SMARTPHONE PREVIEW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left: Message Editor */}
            <div className="lg:col-span-7 space-y-2">
              <textarea
                rows={4}
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs font-medium focus:ring-2 focus:ring-red-500 focus:outline-none leading-relaxed text-slate-900 shadow-inner"
                placeholder="Modèle du SMS de relance..."
              />

              {/* Dynamic Variables helper */}
              <div className="p-2.5 bg-red-50/60 rounded-xl border border-red-100 space-y-1.5">
                <div className="text-[10px] font-bold text-red-900 flex items-center justify-between">
                  <span>Balises dynamiques auto-remplacées pour chaque parent :</span>
                  <span className="text-slate-500 font-normal">Cliquez pour insérer</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {[
                    { tag: '[SOLDE]', desc: 'Reste impayé (ex: 75 000 FCFA)' },
                    { tag: '[NOM]', desc: 'Nom complet élève' },
                    { tag: '[PARENT]', desc: 'Nom du parent' },
                    { tag: '[CLASSE]', desc: 'Classe de l\'élève' },
                    { tag: '[DATE_LIMITE]', desc: 'Date limite fixée' },
                    { tag: '[PAYE]', desc: 'Montant déjà payé' },
                    { tag: '[TOTAL]', desc: 'Total scolarité' },
                    { tag: '[ECOLE]', desc: 'Nom établissement' },
                    { tag: '[TELEPHONE_ECOLE]', desc: 'Contact comptabilité' }
                  ].map(item => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => setMessageTemplate(prev => prev + ' ' + item.tag)}
                      className="px-2 py-0.5 rounded-md bg-white hover:bg-red-100 text-red-800 font-mono font-bold text-[10px] border border-red-200 shadow-2xs transition-colors cursor-pointer"
                      title={item.desc}
                    >
                      {item.tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Smartphone Simulation */}
            <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-4 text-white flex flex-col justify-between shadow-md">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2 mb-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-200">
                    <Smartphone className="w-3.5 h-3.5 text-red-700" />
                    <span>Aperçu Réel Reçu par le Parent</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-700 font-mono">
                    {school.smsSenderId || 'SCOLACI'}
                  </span>
                </div>

                {currentPreviewStudent && (
                  <div className="text-[11px] text-slate-300 mb-2">
                    Destinataire : <strong className="text-white">{currentPreviewStudent.parentName}</strong> ({currentPreviewStudent.parentPhone})
                  </div>
                )}

                <div className="bg-red-600 text-white rounded-2xl rounded-tl-sm p-3.5 text-xs font-normal leading-relaxed shadow-sm">
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

          {/* STEP 4: DEBTOR STUDENTS TABLE */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <label className="text-slate-800 font-bold uppercase text-[10px] tracking-wider">
                  5. Liste des Familles Débitrices ({selectedTargets.length} / {debtorStudents.length} sélectionnées)
                </label>
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-red-600 hover:text-red-800 font-bold text-[11px] underline cursor-pointer"
                >
                  {selectedStudentIds.length === debtorStudents.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                </button>
              </div>

              {/* Search Filter */}
              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher élève, parent, tél..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
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
                        checked={selectedStudentIds.length === debtorStudents.length && debtorStudents.length > 0}
                        onChange={handleToggleSelectAll}
                        className="rounded cursor-pointer"
                      />
                    </th>
                    <th className="p-2.5">Élève Débiteur</th>
                    <th className="p-2.5">Classe</th>
                    <th className="p-2.5">Parent & Téléphone</th>
                    <th className="p-2.5 text-right">Total Scolarité</th>
                    <th className="p-2.5 text-right">Déjà Réglé</th>
                    <th className="p-2.5 text-right">Reste Impayé</th>
                    <th className="p-2.5 text-right pr-4">Action Aperçu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredStudents.map((s) => {
                    const isSelected = selectedStudentIds.includes(s.id);
                    const carrier = detectCarrier(s.parentPhone);
                    const isCurrentPreview = activePreviewStudentId === s.id;

                    return (
                      <tr
                        key={s.id}
                        onClick={() => setActivePreviewStudentId(s.id)}
                        className={`hover:bg-red-50/50 transition-colors cursor-pointer ${
                          isCurrentPreview ? 'bg-red-50 font-bold' : ''
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
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900">{s.lastName} {s.firstName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{s.matricule}</div>
                        </td>
                        <td className="p-2.5">
                          <span className="font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px]">
                            {s.className}
                          </span>
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
                        <td className="p-2.5 text-right text-slate-500">
                          {formatFCFA(s.totalTuition)}
                        </td>
                        <td className="p-2.5 text-right text-green-600 font-medium">
                          {formatFCFA(s.paidTuition)}
                        </td>
                        <td className="p-2.5 text-right text-red-600 font-semibold text-xs">
                          {formatFCFA(s.unpaidTuition)}
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
                                ? 'bg-red-600 text-white'
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
          <div className="p-4 rounded-2xl bg-blue-700 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span>Campagne de relance :</span>
                <span className="text-red-700 font-semibold">{selectedTargets.length} familles ciblées</span>
                <span>•</span>
                <span>Montant à recouvrer : <strong className="text-red-900 font-semibold">{formatFCFA(totalAmountToRecover)}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-600">
                <span>Coût total de la campagne : <strong className="text-slate-900 font-semibold">{formatFCFA(estimatedCost)}</strong></span>
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
                className="py-2.5 px-6 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Diffusion en cours ({selectedTargets.length} SMS)...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Relancer les {selectedTargets.length} familles en 1 Clic</span>
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

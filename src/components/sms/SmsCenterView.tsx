import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Send, MessageSquare, Users, ShieldAlert, FileText,
  CheckCircle2, Clock, Smartphone, RefreshCw, Zap,
  Layers, AlertTriangle, Search
} from 'lucide-react';
import { formatFCFA, calculateSmsSegments, detectCarrier } from '../../utils/formatters';

export const SmsCenterView: React.FC = () => {
  const {
    school,
    classes,
    students,
    parents,
    smsMessages,
    smsTemplates,
    sendBulkSms,
    openModal,
    showToast
  } = useApp();

  // Composer state
  const [recipientType, setRecipientType] = useState<'ALL' | 'CLASS' | 'UNPAID' | 'ABSENT' | 'CUSTOM'>('CLASS');
  const [selectedClassId, setSelectedClassId] = useState<string>('cls_3a');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl_impaye');
  const [customMessage, setCustomMessage] = useState<string>(
    'ÉCOLE LA RÉUSSITE: Chers parents, nous vous informons que les cours du vendredi 28 août se termineront exceptionnellement à 12h00 pour conseil pédagogique. Merci.'
  );
  const [isSending, setIsSending] = useState(false);

  // Stats calculation
  const totalSent = smsMessages.length;
  const deliveredCount = smsMessages.filter(m => m.status === 'LIVRE').length;
  const pendingCount = smsMessages.filter(m => m.status === 'EN_ATTENTE' || m.status === 'ENVOYE').length;
  const failedCount = smsMessages.filter(m => m.status === 'ECHOUE').length;
  const totalSpentFcfa = smsMessages.reduce((sum, m) => sum + m.costFcfa, 0);

  // Compute targets count based on selection
  const getTargetRecipients = () => {
    if (recipientType === 'ALL') {
      return students.map(s => ({
        phone: s.parentPhone,
        name: s.parentName,
        studentName: `${s.firstName} ${s.lastName}`,
        className: s.className
      }));
    }
    if (recipientType === 'CLASS') {
      return students.filter(s => s.classId === selectedClassId).map(s => ({
        phone: s.parentPhone,
        name: s.parentName,
        studentName: `${s.firstName} ${s.lastName}`,
        className: s.className
      }));
    }
    if (recipientType === 'UNPAID') {
      return students.filter(s => s.unpaidTuition > 0).map(s => ({
        phone: s.parentPhone,
        name: s.parentName,
        studentName: `${s.firstName} ${s.lastName}`,
        className: s.className
      }));
    }
    if (recipientType === 'ABSENT') {
      return students.filter(s => s.unjustifiedAbsencesCount > 0).map(s => ({
        phone: s.parentPhone,
        name: s.parentName,
        studentName: `${s.firstName} ${s.lastName}`,
        className: s.className
      }));
    }
    return students.slice(0, 5).map(s => ({
      phone: s.parentPhone,
      name: s.parentName,
      studentName: `${s.firstName} ${s.lastName}`,
      className: s.className
    }));
  };

  const targetList = getTargetRecipients();
  const segmentInfo = calculateSmsSegments(customMessage);
  const estimatedCost = targetList.length * 20 * (segmentInfo.segments || 1);

  const handleApplyTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const found = smsTemplates.find(t => t.id === tplId);
    if (found) {
      setCustomMessage(found.content);
    }
  };

  const handleSendCampaign = async () => {
    if (!customMessage.trim()) {
      showToast('Veuillez saisir le contenu du SMS', 'error');
      return;
    }
    if (targetList.length === 0) {
      showToast('Aucun destinataire sélectionné pour cet envoi', 'warning');
      return;
    }
    if (school.smsBalance < estimatedCost) {
      showToast('Solde SMS insuffisant. Veuillez recharger votre compte.', 'error');
      return;
    }

    setIsSending(true);
    await sendBulkSms(targetList, customMessage, 'ANNONCE');
    setIsSending(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Value Proposition & Carrier Status Header */}
      <div className="bg-blue-700 rounded-lg p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-700 text-xs font-bold border border-blue-400/30 mb-3">
              <Smartphone className="w-3.5 h-3.5" />
              <span>TECHNOLOGIE ZÉRO-APPLICATION PARENT</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Centre de Messagerie SMS Directe
            </h2>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              Les parents reçoivent instantanément toutes les alertes (absences, reçus de paiement, impayés, bulletins) sur leur téléphone classique, sans connexion Internet ni application mobile requise.
            </p>
          </div>

          {/* SMS Balance & Operator pills */}
          <div className="bg-white rounded-2xl p-4 border border-white/15 shrink-0 flex flex-col justify-between min-w-[240px]">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Crédit SMS disponible</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-700 font-bold">
                Indicatif
              </span>
            </div>
            <div className="text-2xl font-semibold text-white">
              {formatFCFA(school.smsBalance)}
            </div>
            <div className="text-xs text-blue-200 mt-0.5">
              ~ {Math.floor(school.smsBalance / 20).toLocaleString('fr-FR')} SMS utilisables
            </div>

            {/* Carrier routing indicators */}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-amber-700 font-bold">● Orange CI</span>
              <span className="flex items-center gap-1 text-amber-700 font-bold">● MTN CI</span>
              <span className="flex items-center gap-1 text-blue-700 font-bold">● Moov CI</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 SMS Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total SMS envoyés</div>
          <div className="text-2xl font-semibold text-slate-900 mt-1">{totalSent.toLocaleString('fr-FR')}</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">Établissement & Direct</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">SMS Livrés</div>
          <div className="text-2xl font-semibold text-green-600 mt-1">{deliveredCount.toLocaleString('fr-FR')}</div>
          <div className="text-[11px] text-green-600 font-semibold mt-1">
            {totalSent > 0 ? `${Math.round((deliveredCount / totalSent) * 100)}% de délivrabilité` : '100%'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">SMS en attente / en file</div>
          <div className="text-2xl font-semibold text-amber-600 mt-1">{pendingCount}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">Queue asynchrone</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Coût global consommé</div>
          <div className="text-xl font-semibold text-slate-900 mt-1">{formatFCFA(totalSpentFcfa)}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">20 FCFA / unité</div>
        </div>
      </div>

      {/* 3 Quick Direct Bulk Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Bulk Grades */}
        <div className="bg-blue-700 text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-[10px] font-bold">
              <FileText className="w-3 h-3 text-amber-700" />
              <span>INDIVIDUALISÉ 1-CLIC</span>
            </div>
            <h4 className="text-base font-semibold text-white">Moyennes de Classe par SMS</h4>
            <p className="text-xs text-slate-200 leading-relaxed">
              Envoyez automatiquement à chaque parent la moyenne, le rang et la mention de son enfant pour toute une classe sans saisie manuelle unitaire.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 relative z-10">
            <button
              onClick={() => openModal('bulk_sms_grades')}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-blue-50 text-blue-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 text-blue-700" />
              <span>Diffuser les Moyennes de Classe</span>
            </button>
          </div>
        </div>

        {/* Card 2: Bulk Announcements */}
        <div className="bg-blue-700 text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/30 text-green-200 text-[10px] font-bold">
              <Zap className="w-3 h-3" />
              <span>DIFFUSION MASSIVE</span>
            </div>
            <h4 className="text-base font-semibold text-white">Envoi Groupé d'Annonces</h4>
            <p className="text-xs text-slate-200 leading-relaxed">
              Communiquez instantanément avec toute l'école, une classe ou un cycle pour vos réunions, congés, alertes et circulaires.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 relative z-10">
            <button
              onClick={() => openModal('bulk_sms_announcement')}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Lancer une Annonce Groupée</span>
            </button>
          </div>
        </div>

        {/* Card 3: Unpaid reminders */}
        <div className="bg-blue-700 text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/30 text-red-200 text-[10px] font-bold">
              <AlertTriangle className="w-3 h-3 text-red-700" />
              <span>RECOUVREMENT DIRECT</span>
            </div>
            <h4 className="text-base font-semibold text-white">Relance Automatique Impayés</h4>
            <p className="text-xs text-slate-200 leading-relaxed">
              Relancez en 1 clic l'ensemble des parents ayant un solde de scolarité débiteur avec le montant exact dû.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 relative z-10">
            <button
              onClick={() => openModal('bulk_sms_unpaid')}
              className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Relancer les Familles Débitrices</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Campaign Builder + Phone Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Composer (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Composer une annonce SMS</h3>
              <p className="text-xs text-slate-500">Diffusion ciblée aux parents d'élèves</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              Expéditeur : {school.smsSenderId}
            </span>
          </div>

          {/* 1. Destinataires */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Sélectionner les destinataires
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setRecipientType('CLASS')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                  recipientType === 'CLASS'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Une classe
              </button>
              <button
                type="button"
                onClick={() => setRecipientType('ALL')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                  recipientType === 'ALL'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Tous les parents
              </button>
              <button
                type="button"
                onClick={() => setRecipientType('UNPAID')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                  recipientType === 'UNPAID'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Parents en impayés
              </button>
              <button
                type="button"
                onClick={() => setRecipientType('ABSENT')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                  recipientType === 'ABSENT'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Élèves absents
              </button>
            </div>

            {/* Class picker if CLASS */}
            {recipientType === 'CLASS' && (
              <div className="pt-2">
                <select
                  aria-label="Choisir la classe cible"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({students.filter(s => s.classId === c.id).length} élèves / parents)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 2. Modèles rapides */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Charger un modèle prédéfini
              </label>
              <span className="text-[11px] text-blue-600 font-medium">Modèles officiels CI</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {smsTemplates.map(tpl => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl.id)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                    selectedTemplateId === tpl.id
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tpl.title}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Message Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                3. Texte du message
              </label>
              <div className="text-xs text-slate-500">
                <span className="font-bold text-slate-800">{segmentInfo.chars}</span> car. |{' '}
                <span className="font-bold text-blue-600">{segmentInfo.segments} SMS</span> ({segmentInfo.remainingInSegment} restants dans segment)
              </div>
            </div>

            <textarea
              aria-label="Contenu du SMS à envoyer"
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Saisissez votre message..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />

            {/* Variable pills helper */}
            <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-500 pt-1">
              <span>Balises automatiques :</span>
              {['[NOM]', '[CLASSE]', '[DATE]', '[MONTANT]', '[SOLDE]', '[HEURE]'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setCustomMessage(prev => prev + ' ' + tag)}
                  className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Target Summary & Send CTA */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-800">
                Destinataires ciblés : <span className="text-blue-600">{targetList.length} parents</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Coût estimé total : <span className="font-extrabold text-slate-900">{formatFCFA(estimatedCost)}</span>
              </div>
            </div>

            <button
              id="btn-send-sms-campaign"
              onClick={handleSendCampaign}
              disabled={isSending}
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Envoi en cours ({targetList.length} SMS)...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Envoyer les {targetList.length} SMS</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Realistic Phone Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="text-center mb-3">
            <span className="text-xs font-bold text-slate-700">Aperçu Réel sur Téléphone Parent</span>
            <p className="text-[11px] text-slate-400">Rendu standard SMS (GSM 7-bit)</p>
          </div>

          {/* Mobile Mockup */}
          <div className="w-[280px] bg-slate-900 rounded-[38px] p-4 shadow-sm border-4 border-slate-700 relative">
            {/* Speaker hole */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-3"></div>

            {/* Screen */}
            <div className="bg-slate-100 rounded-2xl p-3 h-[420px] flex flex-col justify-between overflow-hidden text-slate-800">
              {/* Phone Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-[10px] text-slate-500 font-bold">
                <span>Orange CI</span>
                <span>10:24</span>
                <span>Réseau</span>
              </div>

              {/* Message Header */}
              <div className="text-center my-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs mx-auto mb-1">
                  CI
                </div>
                <div className="font-bold text-xs text-slate-900">{school.smsSenderId}</div>
                <div className="text-[9px] text-slate-400">Message SMS Officiel</div>
              </div>

              {/* Message Bubble */}
              <div className="flex-1 overflow-y-auto space-y-2 my-2 pr-1">
                <div className="bg-white rounded-2xl rounded-tl-xs p-3 shadow-xs border border-slate-200/80 text-[11px] text-slate-800 leading-relaxed">
                  {customMessage
                    .replace(/\[NOM\]/g, 'KOUASSI Jean-Marc')
                    .replace(/\[PARENT\]/g, 'M. KOUASSI')
                    .replace(/\[CLASSE\]/g, '3e A')
                    .replace(/\[DATE\]/g, '25/08/2026')
                    .replace(/\[MONTANT\]/g, '150 000')
                    .replace(/\[SOLDE\]/g, '210 000')
                    .replace(/\[HEURE\]/g, '08h15')
                    .replace(/\[NUM_RECU\]/g, 'REC-2026-00891')
                    .replace(/\[TELEPHONE_ECOLE\]/g, school.phone)
                  }
                  <div className="text-[9px] text-slate-400 text-right mt-1.5">
                    Aujourd'hui 10:24 • Reçu par SMS
                  </div>
                </div>
              </div>

              {/* Keypad indicator / zero app required notice */}
              <div className="bg-green-50 rounded-xl p-2 border border-green-200/60 text-[10px] text-green-800 font-medium text-center">
                Aucune application à installer pour les parents
              </div>
            </div>

            {/* Home button */}
            <div className="w-8 h-8 rounded-full border-2 border-slate-600 mx-auto mt-3"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

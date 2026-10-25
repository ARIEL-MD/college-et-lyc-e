import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare, Send, HelpCircle, Shield,
  Star, CheckCircle2, Clock, Smartphone,
  Phone, Mail, AlertTriangle, RefreshCw, FileText
} from 'lucide-react';
import { SupportMessage } from '../../types';

export const SchoolSupportView: React.FC = () => {
  const { school, supportMessages, sendSupportMessage, showToast } = useApp();

  const [messageText, setMessageText] = useState('');
  const [subjectText, setSubjectText] = useState('');
  const [category, setCategory] = useState<SupportMessage['category']>('ASSISTANCE_TECHNIQUE');
  const [isSending, setIsSending] = useState(false);

  // Filter messages related to this specific school
  const mySchoolMessages = supportMessages.filter(m => m.schoolId === school.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) {
      showToast('Veuillez saisir votre message ou question', 'warning');
      return;
    }

    setIsSending(true);
    sendSupportMessage({
      schoolId: school.id,
      schoolName: school.name,
      senderRole: 'DIRECTEUR',
      senderName: school.directorName || 'Direction de l\'établissement',
      message: messageText.trim(),
      subject: subjectText.trim() || 'Demande d\'assistance',
      category: category,
    });

    setMessageText('');
    setSubjectText('');
    setIsSending(false);
    showToast('Votre message a été transmis directement au développeur / créateur de la plateforme !', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-blue-700 rounded-lg p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-700 border border-blue-400/30 text-xs font-bold mb-3">
            <Shield className="w-3.5 h-3.5" />
            <span>Assistance technique</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Assistance & Support Développeur
          </h1>

          <p className="text-xs sm:text-sm text-blue-200 mt-2 leading-relaxed">
            Un besoin particulier, une question sur vos bulletins, une demande de recharge de solde SMS (Wave / Orange Money) ou une personnalisation ? Échangez directement avec le créateur de votre plateforme.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Send New Request */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Envoyer un message au Créateur</h2>
                <p className="text-[11px] text-slate-500">Réponse rapide dans votre espace</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Type de demande
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="ASSISTANCE_TECHNIQUE">Assistance Technique / Question d'utilisation</option>
                  <option value="RECHARGE_SMS">Recharge de Crédits SMS (Orange / MTN / Moov)</option>
                  <option value="FORMATION">Demande de Formation pour les Enseignants / Secrétaires</option>
                  <option value="FACTURATION">Facturation & Abonnement de l'Établissement</option>
                  <option value="SUGGESTION">Suggestion de Nouvelle Fonctionnalité</option>
                  <option value="AUTRE">Autre Demande</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Objet de votre message
                </label>
                <input
                  type="text"
                  placeholder="ex: Comment imprimer les bulletins du 1er Trimestre..."
                  value={subjectText}
                  onChange={(e) => setSubjectText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Votre Message détaillé <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Décrivez votre besoin ou votre question au développeur..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmettre au Support Créateur</span>
              </button>
            </form>
          </div>

          {/* Direct Contact Card */}
          <div className="bg-slate-900 rounded-lg p-6 text-white space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Lignes d'Assistance Directe
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-green-700 shrink-0" />
                <div>
                  <div className="font-bold text-white">Support Téléphonique & WhatsApp</div>
                  <div className="text-slate-400 font-mono">+225 07 00 00 00 00 / +225 05 00 00 00 00</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-700 shrink-0" />
                <div>
                  <div className="font-bold text-white">Email Technique</div>
                  <div className="text-slate-400">support@votre-domaine.ci</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: History of Messages & Responses */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Historique des Échanges & Réponses</h2>
                <p className="text-[11px] text-slate-500">
                  {mySchoolMessages.length} message(s) échangé(s) avec l'équipe de développement
                </p>
              </div>
            </div>
          </div>

          {mySchoolMessages.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="text-xs font-bold text-slate-700">Aucun message pour l'instant</div>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Vos demandes d'assistance, questions ou demandes de recharges SMS apparaîtront ici avec les réponses du créateur.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
              {mySchoolMessages.map((msg) => {
                const isFromCreator = msg.senderRole === 'CREATEUR';
                return (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isFromCreator
                        ? 'bg-blue-50/70 border-blue-200/80 text-blue-950'
                        : 'bg-slate-50 border-slate-200/80 text-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          isFromCreator
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}>
                          {isFromCreator ? 'Réponse du Développeur' : 'Votre Demande'}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600">
                          {msg.senderName}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>

                    {msg.subject && (
                      <div className="text-xs font-semibold text-slate-900 mb-1">
                        {msg.subject}
                      </div>
                    )}

                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

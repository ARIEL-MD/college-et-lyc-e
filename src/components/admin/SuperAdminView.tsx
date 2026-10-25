import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield, Building2, Users, Smartphone, Plus,
  CheckCircle2, Search, ArrowUpRight, Lock, Key,
  RefreshCw, FileText, Award, MessageSquare, Send,
  Trash2, CreditCard, Phone, Mail, MapPin, AlertCircle,
  HelpCircle, ChevronRight, LogOut, Check
} from 'lucide-react';
import { formatFCFA } from '../../utils/formatters';
import { SupportMessage } from '../../types';

export const SuperAdminView: React.FC = () => {
  const {
    school,
    schools,
    supportMessages,
    sendSupportMessage,
    grantSmsToSchool,
    deleteSchool,
    switchSchool,
    openModal,
    logoutSchool,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'SCHOOLS' | 'SUPPORT_CHAT' | 'ANNOUNCEMENTS'>('SCHOOLS');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchoolForChat, setSelectedSchoolForChat] = useState<string>(schools[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementSubject, setAnnouncementSubject] = useState('');

  // Sms top-up modal / quick action
  const [topUpSchoolId, setTopUpSchoolId] = useState<string | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<number>(50000);

  const filteredSchools = schools.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.shortCode && s.shortCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.directorName && s.directorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group support messages by school
  const currentSchoolMessages = supportMessages.filter(m => m.schoolId === selectedSchoolForChat);
  const selectedSchoolObj = schools.find(s => s.id === selectedSchoolForChat);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedSchoolObj) {
      showToast('Veuillez saisir votre réponse', 'warning');
      return;
    }

    sendSupportMessage({
      schoolId: selectedSchoolObj.id,
      schoolName: selectedSchoolObj.name,
      senderRole: 'CREATEUR',
      senderName: 'Support technique',
      message: replyText.trim(),
      subject: 'Réponse à votre demande d\'assistance',
      category: 'ASSISTANCE_TECHNIQUE',
    });

    setReplyText('');
    showToast(`Réponse envoyée à la direction de ${selectedSchoolObj.name}`, 'success');
  };

  const handleBroadcastAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) {
      showToast('Veuillez saisir le texte du communiqué', 'warning');
      return;
    }

    schools.forEach(s => {
      sendSupportMessage({
        schoolId: s.id,
        schoolName: s.name,
        senderRole: 'CREATEUR',
        senderName: 'Direction de la Plateforme',
        message: announcementText.trim(),
        subject: announcementSubject.trim() || 'Communiqué Général Plateforme',
        category: 'SUGGESTION',
      });
    });

    setAnnouncementText('');
    setAnnouncementSubject('');
    showToast(`Communiqué diffusé avec succès à l'ensemble des ${schools.length} écoles !`, 'success');
  };

  const handleApplyTopUp = (schoolId: string) => {
    grantSmsToSchool(schoolId, topUpAmount);
    setTopUpSchoolId(null);
    showToast(`Crédit SMS de ${formatFCFA(topUpAmount)} alloué avec succès !`, 'success');
  };

  const handleDeleteSchoolConfirm = (sId: string, sName: string) => {
    if (window.confirm(`Confirmez-vous la suppression de l'établissement "${sName}" ? Cette action effacera ses données.`)) {
      deleteSchool(sId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner for Super Admin */}
      <div className="bg-blue-700 rounded-lg p-6 sm:p-8 text-white shadow-sm relative overflow-hidden border border-blue-800/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-700 border border-blue-400/30 text-xs font-bold mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Espace Fondateur / Propriétaire de la Plateforme</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Console d'Administration & Supervision Nationale
            </h1>
            <p className="text-xs sm:text-sm text-blue-200 mt-1">
              Gérez les collèges et lycées abonnés, rechargez leurs SMS et assistez les directeurs en direct.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openModal('new_school')}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Inscrire un Établissement</span>
            </button>

            <button
              onClick={logoutSchool}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Revenir au portail d'accueil"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Quitter</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Global Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Établissements Enregistrés</div>
          <div className="text-2xl font-semibold text-slate-900 mt-1">{schools.length} École(s)</div>
          <div className="text-[11px] text-green-600 font-semibold mt-0.5">Côte d'Ivoire (Abidjan & Intérieur)</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Demandes d'Assistance Directe</div>
          <div className="text-2xl font-semibold text-blue-600 mt-1">{supportMessages.length} Messages</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-0.5">Assistance & Recharges SMS</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Solde SMS Total Alloué</div>
          <div className="text-2xl font-semibold text-green-600 mt-1">
            {formatFCFA(schools.reduce((acc, s) => acc + (s.smsBalance || 0), 0))}
          </div>
          <div className="text-[11px] text-green-600 font-semibold mt-0.5">Réseaux Orange, MTN, Moov CI</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Revenus des abonnements</div>
          <div className="text-2xl font-semibold text-blue-600 mt-1">
            {formatFCFA(schools.length * 50000)} / mois
          </div>
          <div className="text-[11px] text-blue-600 font-semibold mt-0.5">Formules Starter & Pro Lycée</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('SCHOOLS')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'SCHOOLS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Liste des Établissements ({schools.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SUPPORT_CHAT')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'SUPPORT_CHAT'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Assistance & Messagerie Écoles ({supportMessages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ANNOUNCEMENTS')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'ANNOUNCEMENTS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Communiqué Général à Toutes les Écoles</span>
        </button>
      </div>

      {/* TAB 1: SCHOOLS MANAGEMENT LIST */}
      {activeTab === 'SCHOOLS' && (
        <div className="bg-white rounded-lg border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par nom d'école, ville, code ou directeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => openModal('new_school')}
              className="py-2 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle École</span>
            </button>
          </div>

          {schools.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-700">Aucun établissement client pour le moment</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Lorsque des directeurs ou fondateurs créeront leur compte sur la page d'accueil, ils s'afficheront ici automatiquement.
              </p>
              <button
                onClick={() => openModal('new_school')}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
              >
                Créer un premier établissement
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                    <th className="py-3 px-4">Établissement & Localisation</th>
                    <th className="py-3 px-4">Code établissement</th>
                    <th className="py-3 px-4">Directeur / Contact</th>
                    <th className="py-3 px-4 text-right">Solde SMS</th>
                    <th className="py-3 px-4 text-center">Forfait</th>
                    <th className="py-3 px-4 text-center">Statut</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredSchools.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{s.district ? `${s.district}, ` : ''}{s.city}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-blue-700">
                        {s.shortCode || 'ETAB'}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{s.directorName || 'Non spécifié'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{s.phone}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        {formatFCFA(s.smsBalance || 0)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-blue-100 text-blue-800">
                          {s.subscriptionPlan || 'PRO'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{s.subscriptionStatus || 'Actif'}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setTopUpSchoolId(s.id)}
                            title="Recharger le solde SMS"
                            className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedSchoolForChat(s.id);
                              setActiveTab('SUPPORT_CHAT');
                            }}
                            title="Assistance & Message"
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => switchSchool(s.id)}
                            title="Inspecter l'espace école"
                            className="py-1 px-2.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Inspecter
                          </button>

                          <button
                            onClick={() => handleDeleteSchoolConfirm(s.id, s.name)}
                            title="Supprimer l'établissement"
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SUPPORT & DIRECT MESSAGING WITH SCHOOLS */}
      {activeTab === 'SUPPORT_CHAT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-lg border border-slate-200/80 p-6 shadow-xs">
          {/* Left: School Selector */}
          <div className="lg:col-span-4 border-r border-slate-100 pr-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sélectionner un Établissement
            </h3>

            {schools.length === 0 ? (
              <p className="text-xs text-slate-400">Aucun établissement inscrit.</p>
            ) : (
              <div className="space-y-1.5 max-h-[450px] overflow-y-auto custom-scrollbar">
                {schools.map((s) => {
                  const isSelected = s.id === selectedSchoolForChat;
                  const msgsCount = supportMessages.filter(m => m.schoolId === s.id).length;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSchoolForChat(s.id)}
                      className={`w-full p-3 rounded-2xl text-left transition-all flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{s.name}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                          {s.directorName} • {s.city}
                        </div>
                      </div>
                      {msgsCount > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isSelected ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {msgsCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Messages Thread & Reply Form */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
            {selectedSchoolObj ? (
              <>
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Échanges avec : {selectedSchoolObj.name}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Directeur : {selectedSchoolObj.directorName} ({selectedSchoolObj.phone})
                    </p>
                  </div>

                  <button
                    onClick={() => setTopUpSchoolId(selectedSchoolObj.id)}
                    className="py-1.5 px-3 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Recharger SMS</span>
                  </button>
                </div>

                {/* Messages List */}
                <div className="flex-1 space-y-3 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
                  {currentSchoolMessages.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                      <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
                      <div>Aucun message pour cet établissement. Envoyez-lui une instruction ou un message de bienvenue ci-dessous.</div>
                    </div>
                  ) : (
                    currentSchoolMessages.map((msg) => {
                      const isCreator = msg.senderRole === 'CREATEUR';
                      return (
                        <div
                          key={msg.id}
                          className={`p-3.5 rounded-2xl border ${
                            isCreator
                              ? 'bg-blue-50/80 border-blue-200 text-blue-950 ml-6'
                              : 'bg-slate-50 border-slate-200 text-slate-900 mr-6'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 text-[10px] mb-1">
                            <span className="font-bold text-slate-600">{msg.senderName}</span>
                            <span className="text-slate-400 font-mono">{msg.timestamp}</span>
                          </div>
                          {msg.subject && (
                            <div className="text-xs font-semibold mb-1">{msg.subject}</div>
                          )}
                          <p className="text-xs whitespace-pre-line leading-relaxed">{msg.message}</p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder={`Écrire une réponse directe au directeur de ${selectedSchoolObj.name}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="py-20 text-center text-xs text-slate-400">
                Sélectionnez un établissement à gauche pour voir les messages et lui répondre.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BROADCAST ANNOUNCEMENT */}
      {activeTab === 'ANNOUNCEMENTS' && (
        <div className="bg-white rounded-lg border border-slate-200/80 p-6 shadow-xs max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Communiqué Général aux Établissements</h2>
              <p className="text-xs text-slate-500">
                Ce message sera envoyé directement dans l'espace d'assistance de toutes les écoles ({schools.length} écoles).
              </p>
            </div>
          </div>

          <form onSubmit={handleBroadcastAnnouncement} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Objet du communiqué
              </label>
              <input
                type="text"
                required
                placeholder="ex: Mise à jour disponible / Maintenance planifiée"
                value={announcementSubject}
                onChange={(e) => setAnnouncementSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Message à diffuser
              </label>
              <textarea
                required
                rows={5}
                placeholder="Rédigez votre communiqué officiel ici..."
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Diffuser à l'ensemble des {schools.length} écoles</span>
            </button>
          </form>
        </div>
      )}

      {/* QUICK MODAL: RECHARGE SMS */}
      {topUpSchoolId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Recharger le Solde SMS</h3>
                <p className="text-xs text-slate-500">
                  {schools.find(s => s.id === topUpSchoolId)?.name}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Montant de la recharge SMS (en FCFA)
              </label>
              <select
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-green-700 focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value={20000}>20 000 FCFA (~1 000 SMS)</option>
                <option value={50000}>50 000 FCFA (~2 500 SMS)</option>
                <option value={100000}>100 000 FCFA (~5 000 SMS)</option>
                <option value={200000}>200 000 FCFA (~10 000 SMS)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTopUpSchoolId(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleApplyTopUp(topUpSchoolId)}
                className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Valider la Recharge</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

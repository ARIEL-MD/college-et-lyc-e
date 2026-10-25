import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { signInStaff } from '../../lib/auth';
import {
  Building2, Plus, CheckCircle2, Lock,
  FileText, School as SchoolIcon, Smartphone,
  Phone, Mail, MapPin, Check, GraduationCap,
  ShieldCheck, ArrowRight, Layers, KeyRound
} from 'lucide-react';
import { School } from '../../types';
import { DRENA_LIST_CI, IVORIAN_CITIES } from '../../data/mockDatabase';

interface SchoolAuthPortalProps {
  onOpenCreatorPortal?: () => void;
}

export const SchoolAuthPortal: React.FC<SchoolAuthPortalProps> = () => {
  const { schools, registerSchool, establishStaffSession, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'REGISTER' | 'LOGIN'>('REGISTER');

  // Registration Form State for Ivorian Schools
  const [regForm, setRegForm] = useState({
    name: '',
    shortCode: '',
    motto: 'Discipline - Travail - Réussite',
    type: 'COLLEGE_LYCEE' as School['type'],
    drena: 'DRENA Abidjan 1 (Plateau, Cocody, Adjamé, Bingerville)',
    iep: '',
    statut: 'PRIVE_LAIC' as School['statut'],
    city: 'Abidjan - Cocody',
    district: 'Angré 8e Tranche',
    address: '',
    phone: '+225 ',
    email: '',
    directorName: '',
    smsSenderId: '',
    subscriptionPlan: 'PRO' as 'STARTER' | 'PRO' | 'BUSINESS' | 'GROUPE',
    initialSmsBalance: 50000,
  });

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name.trim()) {
      showToast('Veuillez renseigner le nom complet de votre établissement', 'warning');
      return;
    }
    if (!regForm.directorName.trim()) {
      showToast('Veuillez indiquer le nom du Directeur ou Fondateur', 'warning');
      return;
    }

    // Generate unique school code if left empty
    const cityCode = regForm.city.split(' ')[0].substring(0, 3).toUpperCase();
    const code = regForm.shortCode.trim() || `CI-${cityCode}-${Math.floor(100 + Math.random() * 900)}`;

    const senderId = regForm.smsSenderId.trim()
      ? regForm.smsSenderId.trim().toUpperCase().substring(0, 11)
      : regForm.name.trim().replace(/[^a-zA-Z0-9]/g, '').substring(0, 11).toUpperCase();

    const newSchool: School = {
      id: `sch_${Date.now()}`,
      name: regForm.name.trim(),
      shortCode: code,
      motto: regForm.motto.trim() || 'Discipline - Travail - Réussite',
      type: regForm.type,
      drena: regForm.drena,
      iep: regForm.iep.trim() || undefined,
      statut: regForm.statut,
      city: regForm.city.trim(),
      district: regForm.district.trim() || regForm.city.trim(),
      address: regForm.address.trim() || `Commune de ${regForm.city.trim()}`,
      phone: regForm.phone.trim() || '+225 27 00 00 00 00',
      email: regForm.email.trim() || `direction@${regForm.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.ci`,
      directorName: regForm.directorName.trim(),
      currentAcademicYear: '2025 - 2026',
      smsSenderId: senderId,
      smsBalance: regForm.initialSmsBalance,
      smsProvider: 'ORANGE_CI',
      smsAutoSendAbsence: true,
      smsAutoSendPayment: true,
      smsAutoSendEnrollment: true,
      smsAutoSendReportCard: true,
      smsAutoSendUnpaidReminder: true,
      subscriptionPlan: regForm.subscriptionPlan,
      subscriptionStatus: 'ACTIF',
      maxStudents: regForm.subscriptionPlan === 'STARTER' ? 800 : regForm.subscriptionPlan === 'PRO' ? 2000 : 5000,
    };

    registerSchool(newSchool);
  };

  const handleSchoolLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginIdentifier.trim() || !loginPassword) {
      setLoginError('Veuillez saisir votre adresse e-mail et votre mot de passe.');
      return;
    }

    setLoginLoading(true);
    try {
      const session = await signInStaff(loginIdentifier, loginPassword);
      establishStaffSession(session.role, session.school);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Connexion impossible.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between relative overflow-hidden font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Ambient background glows */}

      {/* Top Header */}
      <header className="relative z-10 border-b border-slate-200/80 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-sm">
            <SchoolIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 tracking-tight">Plateforme scolaire</span>
            </div>
            <p className="text-[11px] text-slate-500">Gestion scolaire pour collèges et lycées</p>
          </div>
        </div>

        {/* Quick Tabs Switcher in header */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => { setActiveTab('REGISTER'); setLoginError(null); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'REGISTER'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Inscription Établissement
          </button>
          <button
            onClick={() => { setActiveTab('LOGIN'); setLoginError(null); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'LOGIN'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Connexion Établissement
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Educational Overview Côte d'Ivoire */}
          <div className="lg:col-span-5 space-y-6 pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-700 text-xs font-bold">
              <FileText className="w-3.5 h-3.5" />
              <span>Gestion scolaire pour collèges et lycées</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight leading-tight">
              Gestion de votre établissement.
            </h1>

            <p className="text-sm text-slate-700 leading-relaxed">
              Espace de gestion de votre établissement : scolarité, notes, bulletins et paiements. Créez votre espace ou connectez-vous pour gérer les paiements et notifier instantanément les parents par SMS.
            </p>

            <div className="space-y-3.5 pt-1">
              <div className="flex items-start gap-3 text-xs text-slate-700">
                <div className="w-6 h-6 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-700 shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold">Tous Niveaux & Cycles d'Enseignement</strong>
                  <span>Collèges, Lycées, Établissements techniques, professionnels, Universités et Centres de formation.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-slate-700">
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-700 shrink-0 mt-0.5">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold">Reçus de paiement et SMS aux parents</strong>
                  <span>Notification instantanée des absences, retards et reçus officiels avec solde restant.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-slate-700">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold">Bulletins et relevés de notes</strong>
                  <span>Calcul automatique des moyennes pondérées par coefficient et rangs par classe.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-slate-700">
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-700 shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold">Espace Privé & Données Étanche</strong>
                  <span>Chaque école dispose de son environnement isolé et confidentiel avec accès Directeur.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Registration / Login Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
            
            {/* Tab Selector */}
            <div className="flex items-center p-1 bg-white rounded-2xl border border-slate-200 mb-6">
              <button
                type="button"
                onClick={() => { setActiveTab('REGISTER'); setLoginError(null); }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'REGISTER'
                    ? 'bg-blue-700 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Inscrire mon Établissement</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('LOGIN'); setLoginError(null); }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'LOGIN'
                    ? 'bg-blue-700 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Connexion Établissement</span>
              </button>
            </div>

            {/* TAB 1: REGISTRATION FORM */}
            {activeTab === 'REGISTER' && (
              <form onSubmit={handleRegister} className="space-y-4">
                
                {/* 1. Identification Établissement */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-3 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>1. Identification de l'Établissement (Côte d'Ivoire)</span>
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nom officiel de l'Établissement <span className="text-red-700">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ex: Collège Moderne d'Angré, Lycée Privé d'Excellence..."
                        value={regForm.name}
                        onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Type & Cycle d'Enseignement <span className="text-red-700">*</span>
                        </label>
                        <select
                          value={regForm.type}
                          onChange={(e) => setRegForm({ ...regForm, type: e.target.value as any })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="COLLEGE">Collège</option>
                          <option value="LYCEE">Lycée</option>
                          <option value="COLLEGE_LYCEE">Collège - Lycée (Groupe scolaire)</option>
                          <option value="COLLEGE_TECHNIQUE">Collège-Établissement technique</option>
                          <option value="TECHNIQUE">Établissement technique</option>
                          <option value="PROFESSIONNEL">Établissement professionnel</option>
                          <option value="UNIVERSITE">Université / Grande école</option>
                          <option value="CENTRE_FORMATION">Centre de formation</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Statut Juridique
                        </label>
                        <select
                          value={regForm.statut}
                          onChange={(e) => setRegForm({ ...regForm, statut: e.target.value as any })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="PUBLIC">Établissement public</option>
                          <option value="PRIVE">Établissement privé</option>
                          <option value="PRIVE_CONFESSIONNEL">Établissement privé confessionnel</option>
                          <option value="PRIVE_LAIC">Établissement privé laïc</option>
                          <option value="COMMUNAUTAIRE">Établissement communautaire</option>
                          <option value="ASSOCIATIF">Établissement associatif</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          DRENA de rattachement
                        </label>
                        <select
                          value={regForm.drena}
                          onChange={(e) => setRegForm({ ...regForm, drena: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          {DRENA_LIST_CI.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Ville / Commune <span className="text-red-700">*</span>
                        </label>
                        <select
                          value={regForm.city}
                          onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          {IVORIAN_CITIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Direction & Contact */}
                <div className="pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-3 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>2. Direction & Paramètres SMS</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nom du Directeur / Fondateur <span className="text-red-700">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ex: M. KOUASSI Jean-Luc"
                        value={regForm.directorName}
                        onChange={(e) => setRegForm({ ...regForm, directorName: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Téléphone Mobile Principal (+225) <span className="text-red-700">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="+225 07 00 00 00 00"
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nom d'expéditeur SMS (Sender ID, max 11 car.)
                      </label>
                      <input
                        type="text"
                        maxLength={11}
                        placeholder="ex : ETABLISSEMENT"
                        value={regForm.smsSenderId}
                        onChange={(e) => setRegForm({ ...regForm, smsSenderId: e.target.value.toUpperCase() })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-700 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Formule d'Abonnement
                      </label>
                      <select
                        value={regForm.subscriptionPlan}
                        onChange={(e) => setRegForm({ ...regForm, subscriptionPlan: e.target.value as any })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="STARTER">Formule Starter Collège (45 000 FCFA/mois)</option>
                        <option value="PRO">Formule Établissement Pro (95 000 FCFA/mois)</option>
                        <option value="BUSINESS">Formule Grand Lycée d'Excellence (190 000 FCFA/mois)</option>
                        <option value="GROUPE">Formule Réseau Multi-Écoles (450 000 FCFA/mois)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer mon Établissement & Ouvrir l'Espace</span>
                </button>
              </form>
            )}

            {/* TAB 2: SCHOOL LOGIN FORM (Strictly isolated login) */}
            {activeTab === 'LOGIN' && (
              <form onSubmit={handleSchoolLogin} className="space-y-4 py-2">
                <div className="text-center pb-2">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto mb-3">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Connexion à votre Établissement</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Accédez directement à la console de gestion de votre collège ou lycée.
                  </p>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-700 text-xs flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Adresse e-mail <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="username"
                    placeholder="ex: direction@college.ci"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer mt-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Se connecter à mon Établissement</span>
                </button>

                <div className="text-center pt-2">
                  <p className="text-[11px] text-slate-500">
                    Vous n'avez pas encore inscrit votre établissement ?{' '}
                    <button
                      type="button"
                      onClick={() => { setActiveTab('REGISTER'); setLoginError(null); }}
                      className="text-blue-700 hover:text-blue-700 font-bold underline cursor-pointer"
                    >
                      Créer un compte école
                    </button>
                  </p>
                </div>
              </form>
            )}

          </div>
        </div>
      </main>

      {/* Clean Footer - Strictly educational, no platform admin links */}
      <footer className="relative z-10 border-t border-slate-200/80 bg-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div>
          Plateforme de gestion scolaire
        </div>
        <div className="text-[11px] text-slate-600">
          Accès sécurisé à votre espace d'établissement
        </div>
      </footer>
    </div>
  );
};

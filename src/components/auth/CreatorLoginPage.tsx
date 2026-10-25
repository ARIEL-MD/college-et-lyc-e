import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { signInStaff, signOutStaff } from '../../lib/auth';
import {
  Shield, Key, Lock, ArrowLeft, Building2, CheckCircle2,
  Cpu, Server, Radio, Database, FileText, MessageSquare
} from 'lucide-react';

interface CreatorLoginPageProps {
  onBackToSchoolPortal: () => void;
}

export const CreatorLoginPage: React.FC<CreatorLoginPageProps> = ({ onBackToSchoolPortal }) => {
  const { establishStaffSession, schools, supportMessages, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const session = await signInStaff(email, password);
      if (session.role !== 'SUPER_ADMIN') {
        await signOutStaff();
        throw new Error("Ce compte n'a pas accès à la console d'administration.");
      }
      establishStaffSession(session.role, null);
      showToast('Authentification réussie. Bienvenue dans la console d\'administration.', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connexion impossible.';
      setErrorMsg(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const pendingSupportCount = supportMessages.filter(
    m => m.senderRole === 'DIRECTEUR' && !m.readByCreator
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting */}

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-blue-900/30 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-sm border border-blue-500/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 tracking-tight">Console d'administration</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-700 border border-blue-500/40">
                PROPRIÉTAIRE / CRÉATEUR
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Gestion scolaire pour collèges et lycées</p>
          </div>
        </div>

        <button
          onClick={onBackToSchoolPortal}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-white text-slate-700 hover:text-slate-900 text-xs font-bold transition-all flex items-center gap-2 border border-slate-200 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Portail Public Établissements</span>
        </button>
      </header>

      {/* Center Form */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          
          <div className="bg-white border border-blue-800/40 rounded-lg p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Header Icon */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mx-auto shadow-inner">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                Authentification Fondateur
              </h1>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Accès réservé exclusivement à l'administrateur propriétaire de la plateforme.
              </p>
            </div>

            {/* Formulaire de connexion fondateur */}
            <form onSubmit={handleCreatorSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-blue-700 text-center mb-2">
                  E-mail du fondateur
                </label>
                <input
                  type="email"
                  autoFocus
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                  className="w-full bg-white border-2 border-blue-500/40 focus:border-blue-400 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all mb-3"
                />
                <label className="block text-xs font-bold text-blue-700 text-center mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                  className="w-full bg-white border-2 border-blue-500/40 focus:border-blue-400 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                />

                {errorMsg && (
                  <p className="text-xs font-semibold text-red-700 text-center mt-2">
                    {errorMsg}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim() || !password}
                className="w-full py-3 px-6 rounded-2xl bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {loading ? (
                  <span>Connexion en cours...</span>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Déverrouiller la Console Super Admin</span>
                  </>
                )}
              </button>
            </form>

            {/* Live stats summary preview */}
            <div className="pt-4 border-t border-slate-200/80 space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
                Statut
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                  <div className="text-xs text-slate-500">Écoles Inscrites</div>
                  <div className="text-base font-semibold text-slate-900">{schools.length}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                  <div className="text-xs text-slate-500">Demandes Support</div>
                  <div className="text-base font-semibold text-blue-700">{pendingSupportCount}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  Passerelle SMS : non connectée
                </span>
              </div>
            </div>

          </div>

          <div className="text-center mt-4">
            <button
              onClick={onBackToSchoolPortal}
              className="text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
            >
              ← Retourner à la page d'inscription des directeurs
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-blue-900/20 bg-white px-6 py-4 text-center text-xs text-slate-500">
        Console privée d'Administration • Tous droits réservés
      </footer>
    </div>
  );
};

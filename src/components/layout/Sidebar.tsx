import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard, Users, UserCheck, BookOpen, GraduationCap,
  UserPlus, FileEdit, FileText, Calendar, Wallet,
  CreditCard, AlertTriangle, BarChart3, MessageSquare,
  MessageCircle, History, ShieldCheck, Settings,
  FolderArchive, ChevronRight, School as SchoolIcon,
  Star, Send, HelpCircle, LogOut, Shield,
  Building2, LifeBuoy
} from 'lucide-react';
import { formatFCFA } from '../../utils/formatters';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const {
    currentView,
    setCurrentView,
    school,
    schools,
    isCreatorSession,
    students,
    supportMessages,
    logoutSchool
  } = useApp();

  const handleNav = (view: string) => {
    setCurrentView(view);
    if (onCloseMobile) onCloseMobile();
  };

  const navItemClass = (viewKey: string) => {
    const isActive = currentView === viewKey;
    return `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group cursor-pointer ${
      isActive
        ? 'bg-blue-600 text-white font-bold shadow-md'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;
  };

  // Unread messages for this school
  const unreadSupport = supportMessages.filter(
    m => m.schoolId === school.id && m.senderRole === 'CREATEUR' && !m.readBySchool
  ).length;

  return (
    <aside
      id="main-sidebar"
      className={`fixed lg:static top-0 left-0 z-40 h-screen w-72 bg-[#0B1527] text-slate-100 flex flex-col justify-between border-r border-slate-800 transition-transform duration-200 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Top School Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 shadow-inner ${
            isCreatorSession
              ? 'bg-blue-600/30 border border-blue-500/40 text-blue-400'
              : 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
          }`}>
            {isCreatorSession ? (
              <Shield className="w-5 h-5" />
            ) : (
              <SchoolIcon className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold tracking-tight text-white uppercase truncate">
              {isCreatorSession ? 'Administration' : school.name}
            </h1>
            <p className="text-[11px] text-slate-400 truncate">
              {isCreatorSession ? 'Console Fondateur CI' : `${school.city || 'Côte d\'Ivoire'}`}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Menu Scrollable */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 custom-scrollbar">
        
        {/* IF CREATOR SESSION: SPECIAL ADMIN MENU */}
        {isCreatorSession ? (
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1.5">
              Supervision
            </p>
            <button
              onClick={() => handleNav('super_admin')}
              className={navItemClass('super_admin')}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>Établissements & Assistance</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-900 text-blue-200">
                {schools.length}
              </span>
            </button>
          </div>
        ) : (
          /* STANDARD SCHOOL MENU */
          <>
            {/* DASHBOARD */}
            <div>
              <button
                id="nav-dashboard"
                onClick={() => handleNav('dashboard')}
                className={navItemClass('dashboard')}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Tableau de bord</span>
                </div>
              </button>
            </div>

            {/* GESTION SCOLAIRE */}
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Gestion Scolaire
              </p>
              <div className="space-y-0.5">
                <button
                  id="nav-students"
                  onClick={() => handleNav('students')}
                  className={navItemClass('students')}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4" />
                    <span>Élèves</span>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {students.length}
                  </span>
                </button>

                <button
                  id="nav-parents"
                  onClick={() => handleNav('parents')}
                  className={navItemClass('parents')}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-green-400" />
                    <span>Parents</span>
                  </div>
                  <span className="text-[10px] font-medium text-green-400 bg-green-950/60 px-1.5 py-0.5 rounded border border-green-800/40">
                    Direct SMS
                  </span>
                </button>

                <button
                  id="nav-classes"
                  onClick={() => handleNav('classes')}
                  className={navItemClass('classes')}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4" />
                    <span>Classes</span>
                  </div>
                </button>

                <button
                  id="nav-teachers"
                  onClick={() => handleNav('teachers')}
                  className={navItemClass('teachers')}
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-4 h-4" />
                    <span>Enseignants</span>
                  </div>
                </button>
              </div>
            </div>

            {/* VIE SCOLAIRE & NOTES */}
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Vie Scolaire & Notes
              </p>
              <div className="space-y-0.5">
                <button
                  id="nav-attendance"
                  onClick={() => handleNav('attendance')}
                  className={navItemClass('attendance')}
                >
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-4 h-4" />
                    <span>Absences & Retards</span>
                  </div>
                </button>

                <button
                  id="nav-grades"
                  onClick={() => handleNav('grades')}
                  className={navItemClass('grades')}
                >
                  <div className="flex items-center gap-3">
                    <FileEdit className="w-4 h-4" />
                    <span>Saisie des Notes</span>
                  </div>
                </button>

                <button
                  id="nav-bulletins"
                  onClick={() => handleNav('bulletins')}
                  className={navItemClass('bulletins')}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Bulletins</span>
                  </div>
                </button>

                <button
                  id="nav-timetable"
                  onClick={() => handleNav('timetable')}
                  className={navItemClass('timetable')}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4" />
                    <span>Emplois du temps</span>
                  </div>
                </button>
              </div>
            </div>

            {/* COMPTABILITÉ */}
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Finances & Scolarité
              </p>
              <div className="space-y-0.5">
                <button
                  id="nav-payments"
                  onClick={() => handleNav('payments')}
                  className={navItemClass('payments')}
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="w-4 h-4" />
                    <span>Encaissements</span>
                  </div>
                </button>

                <button
                  id="nav-unpaid"
                  onClick={() => handleNav('unpaid')}
                  className={navItemClass('unpaid')}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Impayés & Relances</span>
                  </div>
                </button>

                <button
                  id="nav-finances"
                  onClick={() => handleNav('finances')}
                  className={navItemClass('finances')}
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-4 h-4" />
                    <span>Rapports Financiers</span>
                  </div>
                </button>
              </div>
            </div>

            {/* SMS CENTER */}
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                SMS aux parents
              </p>
              <div className="space-y-0.5">
                <button
                  id="nav-sms"
                  onClick={() => handleNav('sms')}
                  className={navItemClass('sms')}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4" />
                    <span>Envoi SMS & Diffusion</span>
                  </div>
                </button>

                <button
                  id="nav-sms-templates"
                  onClick={() => handleNav('sms_templates')}
                  className={navItemClass('sms_templates')}
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-4 h-4" />
                    <span>Modèles SMS</span>
                  </div>
                </button>

                <button
                  id="nav-sms-history"
                  onClick={() => handleNav('sms_history')}
                  className={navItemClass('sms_history')}
                >
                  <div className="flex items-center gap-3">
                    <History className="w-4 h-4" />
                    <span>Historique SMS</span>
                  </div>
                </button>
              </div>
            </div>

            {/* ASSISTANCE & SUPPORT DIRECT DU DÉVELOPPEUR */}
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1.5">
                Support Développeur
              </p>
              <div className="space-y-0.5">
                <button
                  id="nav-support"
                  onClick={() => handleNav('support')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    currentView === 'support'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-blue-300 hover:bg-blue-950/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LifeBuoy className="w-4 h-4 text-blue-400" />
                    <span>Assistance Développeur</span>
                  </div>
                  {unreadSupport > 0 && (
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                  )}
                </button>

                <button
                  id="nav-settings"
                  onClick={() => handleNav('settings')}
                  className={navItemClass('settings')}
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-4 h-4" />
                    <span>Paramètres École</span>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Section: SMS balance + Logout Button */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800/80 space-y-2.5">
        {!isCreatorSession && (
          <div className="bg-slate-800/70 rounded-2xl p-3 border border-slate-700/50">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-bold text-slate-200">Solde SMS CI</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-green-950 text-green-300 font-bold border border-green-700/40">
                Actif
              </span>
            </div>
            
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-xs font-semibold text-white tracking-tight">
                  {formatFCFA(school.smsBalance || 0)}
                </div>
                <div className="text-[10px] text-slate-400">
                  ~ {Math.floor((school.smsBalance || 0) / 20).toLocaleString('fr-FR')} SMS
                </div>
              </div>
              <button
                id="btn-recharge-sms-sidebar"
                onClick={() => handleNav('sms')}
                className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-xs cursor-pointer"
              >
                Recharger
              </button>
            </div>
          </div>
        )}

        {/* LOGOUT BUTTON */}
        <button
          onClick={logoutSchool}
          className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-red-950/40 hover:text-red-400 text-slate-400 text-xs font-bold flex items-center justify-center gap-2 border border-slate-800 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Déconnexion / Changer d'espace</span>
        </button>
      </div>
    </aside>
  );
};

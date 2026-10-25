import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search, Bell, MessageSquare, Menu, ChevronDown,
  FileText, CheckCircle2, AlertCircle, Shield,
  CreditCard, UserCheck, GraduationCap, X, Building2, Plus,
  LifeBuoy, LogOut
} from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    school,
    schools,
    isCreatorSession,
    switchSchool,
    currentUser,
    currentRole,
    setCurrentRole,
    setCurrentView,
    academicYear,
    setAcademicYear,
    setIsSearchOpen,
    openModal,
    logoutSchool,
    smsMessages
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const roles: { role: UserRole; label: string; icon: any; color: string }[] = [
    { role: 'DIRECTEUR', label: 'Directeur Général', icon: Shield, color: 'text-blue-600' },
    { role: 'ADMIN', label: 'Éducateur / Secrétaire', icon: UserCheck, color: 'text-blue-600' },
    { role: 'COMPTABLE', label: 'Comptabilité & Caisse', icon: CreditCard, color: 'text-green-600' },
    { role: 'ENSEIGNANT', label: 'Professeur / Enseignant', icon: GraduationCap, color: 'text-amber-600' },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left Search and Mobile menu */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          id="btn-toggle-sidebar-mobile"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div
          id="top-global-search-bar"
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100/90 text-slate-500 border border-slate-200/80 rounded-xl px-3.5 py-2 text-sm cursor-pointer transition-colors shadow-2xs"
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate text-slate-400 text-xs sm:text-sm">
            {isCreatorSession
              ? 'Rechercher une école, un directeur, une ville...'
              : 'Rechercher un élève, parent, classe, reçu...'}
          </span>
          <kbd className="hidden sm:inline-block ml-auto text-[10px] font-semibold bg-white text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 lg:gap-3.5 ml-4">
        
        {/* IF CREATOR SESSION: MULTI-SCHOOL SUPERVISION BUTTON */}
        {isCreatorSession ? (
          <div className="relative">
            <button
              id="btn-switch-school-header"
              onClick={() => setSchoolDropdownOpen(!schoolDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold border border-blue-200 transition-colors shadow-2xs cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-[180px]">
                {schools.length} École(s) gérée(s)
              </span>
              <ChevronDown className="w-3 h-3 text-blue-500" />
            </button>

            {schoolDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-sm border border-slate-100 p-2.5 z-50 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between mb-1">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                      Établissements Clients
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {schools.length} Écoles CI
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSchoolDropdownOpen(false);
                      openModal('new_school');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Inscrire</span>
                  </button>
                </div>

                <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                  {schools.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        switchSchool(s.id);
                        setSchoolDropdownOpen(false);
                      }}
                      className="w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs truncate font-bold text-slate-900">{s.name}</div>
                        <div className="text-[10px] text-slate-500">{s.city} • {s.directorName}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* STANDARD ISOLATED SCHOOL BADGE (NO SWITCHING TO OTHER SCHOOLS) */
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/80 border border-blue-100 text-blue-900 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate max-w-[170px] lg:max-w-[220px]">{school.name}</span>
            <span className="text-[10px] text-blue-600 font-mono bg-white px-1.5 py-0.2 rounded border border-blue-200">
              {school.shortCode || 'ETAB'}
            </span>
          </div>
        )}

        {/* Quick Help / Support button for School */}
        {!isCreatorSession && (
          <button
            onClick={() => setCurrentView('support')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
            title="Contacter le créateur / Développeur"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Assistance</span>
          </button>
        )}

        {/* Quick Send SMS button */}
        {!isCreatorSession && (
          <button
            id="btn-quick-sms-header"
            onClick={() => openModal('send_sms')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Envoi SMS</span>
          </button>
        )}

        {/* Academic Year Selector */}
        <div className="hidden xl:flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700">
          <span className="text-slate-400 text-[11px]">Année :</span>
          <select
            aria-label="Sélectionner l'année scolaire"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="2025 - 2026">2025 - 2026</option>
            <option value="2024 - 2025">2024 - 2025</option>
          </select>
        </div>

        {/* Role Switcher (for school staff test) */}
        {!isCreatorSession && (
          <div className="relative">
            <button
              id="btn-user-role-dropdown"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                {currentRole.charAt(0)}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-slate-800">
                  {currentRole === 'DIRECTEUR' ? 'Directeur' : currentRole === 'COMPTABLE' ? 'Comptable' : currentRole === 'ADMIN' ? 'Éducateur' : 'Enseignant'}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-sm border border-slate-100 p-2 z-50 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Rôle dans l'école
                  </p>
                </div>

                <div className="space-y-1">
                  {roles.map((r) => {
                    const Icon = r.icon;
                    const isSelected = currentRole === r.role;
                    return (
                      <button
                        key={r.role}
                        onClick={() => {
                          setCurrentRole(r.role);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${r.color}`} />
                        <span className="flex-1 text-xs">{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* LOGOUT BUTTON */}
        <button
          onClick={logoutSchool}
          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          title="Quitter la session"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

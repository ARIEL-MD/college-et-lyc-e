import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  School, ShieldCheck, Key, CreditCard, Building,
  Smartphone, UserCheck, CheckCircle2, Save, Bell,
  Shield, AlertCircle, FileText, Edit3
} from 'lucide-react';
import { formatFCFA } from '../../utils/formatters';

export const SettingsView: React.FC = () => {
  const { school, updateSchool, currentRole, setCurrentRole, showToast, openModal } = useApp();

  const isDirectorOrAdmin = currentRole === 'DIRECTEUR' || currentRole === 'SUPER_ADMIN';

  const [name, setName] = useState(school.name);
  const [motto, setMotto] = useState(school.motto || 'Discipline - Rigueur - Succès');
  const [code, setCode] = useState(school.code);
  const [address, setAddress] = useState(school.address);
  const [city, setCity] = useState(school.city || 'Abidjan');
  const [phone, setPhone] = useState(school.phone);
  const [email, setEmail] = useState(school.email);
  const [directorName, setDirectorName] = useState(school.directorName || 'M. KOUASSI Jean-Luc');
  const [academicYear, setAcademicYear] = useState('2025 - 2026');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirectorOrAdmin) {
      showToast('Action refusée : Seul le Directeur Général a l\'autorisation de modifier l\'identité de l\'établissement.', 'error');
      return;
    }

    updateSchool({
      name: name.trim(),
      motto: motto.trim(),
      code: code.trim(),
      address: address.trim(),
      city: city.trim(),
      phone: phone.trim(),
      email: email.trim(),
      directorName: directorName.trim(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Paramètres de l'Établissement & Abonnement SaaS</span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              isDirectorOrAdmin
                ? 'bg-blue-100 text-blue-800 border-blue-200'
                : 'bg-amber-100 text-amber-800 border-amber-200'
            }`}>
              {isDirectorOrAdmin ? 'Accès Directeur Autorisé' : `Mode Consultation (${currentRole})`}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Nom, coordonnées et informations de l'établissement
          </p>
        </div>

        {isDirectorOrAdmin && (
          <button
            onClick={() => openModal('edit_school')}
            className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Modifier Rapide du Nom</span>
          </button>
        )}
      </div>

      {/* Role Alert Banner if not Director */}
      {!isDirectorOrAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-start sm:items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold block sm:inline">Restriction de sécurité : </span>
              <span className="text-amber-800">
                Seul le <strong>Directeur Général / Chef d'Établissement</strong> peut modifier et enregistrer le nom de l'école.
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setCurrentRole('DIRECTEUR');
              showToast('Rôle commuté sur : Directeur Général', 'success');
            }}
            className="py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 self-start sm:self-auto shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Basculer en mode Directeur</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form left (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-lg p-6 border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                <span>Identité Officielle de l'Établissement (Collège & Lycée)</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {isDirectorOrAdmin ? 'Édition permise' : 'Lecture seule'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">
                  Nom Officiel de l'Établissement <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!isDirectorOrAdmin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Collège Moderne d'Angré, Lycée Privé d'Excellence..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60 disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Ce nom figure sur les bulletins, les reçus de scolarité et les SMS envoyés aux parents.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Devise / Slogan</label>
                <input
                  type="text"
                  disabled={!isDirectorOrAdmin}
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Code établissement / DRENA</label>
                <input
                  type="text"
                  disabled={!isDirectorOrAdmin}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Chef d'Établissement / Proviseur</label>
                <input
                  type="text"
                  disabled={!isDirectorOrAdmin}
                  value={directorName}
                  onChange={(e) => setDirectorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Téléphone Principal (Secrétariat & SMS)</label>
                <input
                  type="text"
                  disabled={!isDirectorOrAdmin}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Adresse Email Officielle</label>
                <input
                  type="email"
                  disabled={!isDirectorOrAdmin}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Ville / Commune</label>
                <input
                  type="text"
                  disabled={!isDirectorOrAdmin}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60 disabled:bg-slate-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">Adresse géographique complète</label>
                <input
                  type="text"
                  disabled={!isDirectorOrAdmin}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Année Scolaire Active</label>
                <select
                  disabled={!isDirectorOrAdmin}
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-blue-700 focus:outline-none disabled:opacity-60"
                >
                  <option value="2025 - 2026">2025 - 2026 (En cours)</option>
                  <option value="2026 - 2027">2026 - 2027 (Préparation)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              {isDirectorOrAdmin ? (
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les Paramètres</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => showToast('Vous devez être connecté en tant que Directeur pour modifier ces paramètres.', 'warning')}
                  className="py-2.5 px-6 rounded-xl bg-slate-200 text-slate-500 font-bold text-xs cursor-not-allowed"
                >
                  Modification verrouillée
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Subscription right (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-lg p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">Abonnement SaaS</h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                PLAN PRO
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs mb-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Statut :</span>
                <span className="font-bold text-green-600">Actif (Renouvellement 2027)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Forfait :</span>
                <span className="font-bold text-slate-900">Illimité Élèves (6e à Tle)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Passerelle SMS :</span>
                <span className="font-bold text-blue-600">Opérateurs CI Intégrés</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2 text-xs">
              <div className="font-bold text-blue-900">Solde SMS Actuel</div>
              <div className="text-xl font-semibold text-blue-700">{formatFCFA(school.smsBalance)}</div>
              <p className="text-[10px] text-slate-500">
                Rechargeable instantanément via Wave, Orange Money ou MTN MoMo.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={() => showToast("Recharge indisponible : le paiement en ligne n'est pas encore connecté.", 'info')}
              className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-xs transition-colors text-center"
            >
              Recharger du Crédit SMS (+ 50 000 FCFA)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


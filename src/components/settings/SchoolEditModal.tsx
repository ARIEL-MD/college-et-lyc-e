import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X, School as SchoolIcon, Shield, CheckCircle2,
  Building, Phone, Mail, MapPin, FileText, AlertCircle
} from 'lucide-react';
import { DRENA_LIST_CI, IVORIAN_CITIES } from '../../data/mockDatabase';
import { School } from '../../types';

interface SchoolEditModalProps {
  onClose: () => void;
}

export const SchoolEditModal: React.FC<SchoolEditModalProps> = ({ onClose }) => {
  const { school, updateSchool, currentRole, showToast } = useApp();

  const isDirectorOrAdmin = currentRole === 'DIRECTEUR' || currentRole === 'SUPER_ADMIN';

  const [name, setName] = useState(school.name || '');
  const [motto, setMotto] = useState(school.motto || 'Discipline - Travail - Réussite');
  const [shortCode, setShortCode] = useState(school.shortCode || '');
  const [type, setType] = useState<School['type']>(school.type || 'COLLEGE_LYCEE');
  const [statut, setStatut] = useState<School['statut']>(school.statut || 'PRIVE_LAIC');
  const [drena, setDrena] = useState(school.drena || DRENA_LIST_CI[0]);
  const [phone, setPhone] = useState(school.phone || '+225 ');
  const [email, setEmail] = useState(school.email || '');
  const [address, setAddress] = useState(school.address || '');
  const [city, setCity] = useState(school.city || 'Abidjan - Cocody');
  const [directorName, setDirectorName] = useState(school.directorName || '');
  const [smsSenderId, setSmsSenderId] = useState(school.smsSenderId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirectorOrAdmin) {
      showToast('Seul le Directeur Général a le droit de modifier les informations de l\'établissement.', 'error');
      return;
    }

    if (!name.trim()) {
      showToast('Le nom de l\'établissement ne peut pas être vide.', 'warning');
      return;
    }

    updateSchool({
      name: name.trim(),
      motto: motto.trim(),
      shortCode: shortCode.trim(),
      type,
      statut,
      drena,
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      directorName: directorName.trim(),
      smsSenderId: smsSenderId.trim().toUpperCase().substring(0, 11),
    });

    showToast('Informations de l\'établissement mises à jour !', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto duration-150">
      <div className="bg-white rounded-lg max-w-xl w-full shadow-sm border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0B1527] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <SchoolIcon className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">Configuration de l'Établissement</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 border border-blue-400/30 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-blue-700" />
                  Directeur
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Informations de l'établissement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs custom-scrollbar">
          {!isDirectorOrAdmin && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Accès restreint au Directeur Général</p>
                <p className="text-[11px] text-amber-700">
                  Vous êtes actuellement connecté en tant que <strong>{currentRole}</strong>. Seul le Directeur (ou Super Admin) peut enregistrer les modifications du nom d'établissement.
                </p>
              </div>
            </div>
          )}

          {/* School Name */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Nom Officiel de l'Établissement <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={!isDirectorOrAdmin}
              placeholder="ex: Collège Moderne d'Angré, Lycée Privé d'Excellence..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Type & Cycle d'Enseignement</label>
              <select
                disabled={!isDirectorOrAdmin}
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
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
              <label className="block text-slate-700 font-bold mb-1">Statut Juridique</label>
              <select
                disabled={!isDirectorOrAdmin}
                value={statut}
                onChange={(e) => setStatut(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
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
              <label className="block text-slate-700 font-bold mb-1">DRENA</label>
              <select
                disabled={!isDirectorOrAdmin}
                value={drena}
                onChange={(e) => setDrena(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              >
                {DRENA_LIST_CI.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Ville / Commune (CI)</label>
              <select
                disabled={!isDirectorOrAdmin}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              >
                {IVORIAN_CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Code Établissement</label>
              <input
                type="text"
                disabled={!isDirectorOrAdmin}
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Email Officiel</label>
              <input
                type="email"
                disabled={!isDirectorOrAdmin}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Directeur / Chef d'Établissement</label>
              <input
                type="text"
                disabled={!isDirectorOrAdmin}
                value={directorName}
                onChange={(e) => setDirectorName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Téléphone Principal (+225)</label>
              <input
                type="text"
                disabled={!isDirectorOrAdmin}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Expéditeur SMS (Sender ID)</label>
              <input
                type="text"
                maxLength={11}
                disabled={!isDirectorOrAdmin}
                value={smsSenderId}
                onChange={(e) => setSmsSenderId(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-600 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Devise de l'Établissement</label>
              <input
                type="text"
                disabled={!isDirectorOrAdmin}
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Fermer
            </button>
            {isDirectorOrAdmin && (
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Enregistrer les modifications</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2, Plus, CheckCircle2, Shield,
  CreditCard, Smartphone, MapPin, Phone,
  Mail, School as SchoolIcon, X, FileText,
  Award, Globe, AlertCircle
} from 'lucide-react';
import { School } from '../../types';
import { DRENA_LIST_CI, IVORIAN_CITIES } from '../../data/mockDatabase';

interface NewSchoolModalProps {
  onClose: () => void;
}

export const NewSchoolModal: React.FC<NewSchoolModalProps> = ({ onClose }) => {
  const { registerSchool, showToast } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    shortCode: '',
    motto: 'Discipline - Travail - Réussite',
    type: 'COLLEGE_LYCEE' as School['type'],
    drena: 'DRENA Abidjan 1 (Plateau, Cocody, Adjamé, Bingerville)',
    iep: '',
    statut: 'PRIVE_LAIC' as 'PRIVE_LAIC' | 'PRIVE_CONFESSIONNEL' | 'PUBLIC',
    city: 'Abidjan - Cocody',
    district: '',
    address: '',
    phone: '+225 27 ',
    email: '',
    directorName: '',
    directorPhone: '+225 07 ',
    directorEmail: '',
    subscriptionPlan: 'PRO' as 'STARTER' | 'PRO' | 'BUSINESS' | 'GROUPE',
    initialSmsBalance: 50000,
    smsProvider: 'ORANGE_CI' as const,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Veuillez renseigner le nom officiel de l\'établissement', 'warning');
      return;
    }

    setIsSubmitting(true);
    
    // Generate code if empty
    const cityCode = formData.city.split(' ')[0].substring(0, 3).toUpperCase();
    const code = formData.shortCode.trim() || `CI-${cityCode}-${Math.floor(100 + Math.random() * 900)}`;

    const newSchool: School = {
      id: `sch_${Date.now()}`,
      name: formData.name.trim(),
      shortCode: code,
      motto: formData.motto.trim() || 'Discipline - Travail - Réussite',
      type: formData.type,
      drena: formData.drena,
      iep: formData.iep.trim() || undefined,
      statut: formData.statut,
      city: formData.city.trim(),
      district: formData.district.trim() || formData.city.trim(),
      address: formData.address.trim() || `Commune de ${formData.city.trim()}`,
      phone: formData.phone.trim(),
      email: formData.email.trim() || `contact@${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.ci`,
      directorName: formData.directorName.trim() || 'M. le Chef d\'Établissement',
      currentAcademicYear: '2025 - 2026',
      smsSenderId: formData.name.trim().replace(/[^a-zA-Z0-9]/g, '').substring(0, 11).toUpperCase(),
      smsBalance: formData.initialSmsBalance,
      smsProvider: formData.smsProvider,
      smsAutoSendAbsence: true,
      smsAutoSendPayment: true,
      smsAutoSendEnrollment: true,
      smsAutoSendReportCard: true,
      smsAutoSendUnpaidReminder: true,
      subscriptionPlan: formData.subscriptionPlan,
      subscriptionStatus: 'ACTIF',
      maxStudents: formData.subscriptionPlan === 'STARTER' ? 800 : formData.subscriptionPlan === 'PRO' ? 2000 : 5000,
    };

    registerSchool(newSchool);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-sm border border-slate-100 w-full max-w-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-blue-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-700">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                Nouvel établissement
              </span>
              <h2 className="text-lg font-semibold text-white">Inscrire un établissement</h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nom Officiel de l'Établissement <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="ex: Collège Moderne d'Angré, Lycée Privé d'Excellence..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Type & Cycle d'Enseignement
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
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
                DRENA
              </label>
              <select
                value={formData.drena}
                onChange={(e) => setFormData({ ...formData, drena: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {DRENA_LIST_CI.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ville / Commune (CI)
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {IVORIAN_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Statut Juridique
              </label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
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
                Directeur / Fondateur
              </label>
              <input
                type="text"
                placeholder="ex: M. KOUASSI Jean-Luc"
                value={formData.directorName}
                onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Téléphone (+225)
              </label>
              <input
                type="text"
                placeholder="+225 07 00 00 00 00"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Formule d'Abonnement
              </label>
              <select
                value={formData.subscriptionPlan}
                onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="STARTER">Starter Collège (45 000 FCFA/mois)</option>
                <option value="PRO">Pro Collège & Lycée (95 000 FCFA/mois)</option>
                <option value="BUSINESS">Grand Lycée (190 000 FCFA/mois)</option>
                <option value="GROUPE">Réseau Multi-Écoles (450 000 FCFA/mois)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Solde SMS Initial Alloué
              </label>
              <input
                type="number"
                step="5000"
                value={formData.initialSmsBalance}
                onChange={(e) => setFormData({ ...formData, initialSmsBalance: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-green-600 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Créer l'Établissement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

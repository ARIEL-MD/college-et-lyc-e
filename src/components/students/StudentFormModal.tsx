import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X, UserPlus, Phone, UserCheck, Wallet, CheckCircle2,
  FileText, CreditCard
} from 'lucide-react';
import { formatFCFA } from '../../utils/formatters';
import { PaymentMethod } from '../../types';

interface StudentFormModalProps {
  onClose: () => void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({ onClose }) => {
  const { classes, addStudent, showToast } = useApp();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [dateOfBirth, setDateOfBirth] = useState('2012-05-15');
  const [placeOfBirth, setPlaceOfBirth] = useState('Abidjan');
  const [classId, setClassId] = useState(classes[0]?.id || 'cls_3a');

  // Parent fields
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('+225 07 ');
  const [parentRelation, setParentRelation] = useState('Père');
  const [address, setAddress] = useState('Abidjan Cocody');

  // Financial fields
  const [initialPayment, setInitialPayment] = useState<number>(50000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ESPECES');

  const selectedClass = classes.find(c => c.id === classId);
  const tuitionFee = selectedClass?.tuitionFee || 350000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      showToast('Veuillez saisir le nom et prénom de l\'élève', 'error');
      return;
    }
    if (!parentPhone || parentPhone.length < 8) {
      showToast('Veuillez saisir un numéro de téléphone valide pour les SMS', 'error');
      return;
    }

    addStudent({
      firstName,
      lastName: lastName.toUpperCase(),
      gender,
      dateOfBirth,
      placeOfBirth,
      classId,
      className: selectedClass?.name || '3e A',
      level: selectedClass?.level || 'COLLEGE',
      academicYear: '2025 - 2026',
      status: 'INSCRIT',
      parentId: `par_${Date.now()}`,
      parentName: parentName || `Parent de ${lastName}`,
      parentPhone,
      parentRelation,
      address,
      enrollmentDate: new Date().toISOString().split('T')[0],
      totalTuition: tuitionFee,
      initialPayment,
      paymentMethod,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto duration-150">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-sm border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-blue-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Inscription d'un Nouvel Élève</h3>
              <p className="text-xs text-blue-100">Fiche d'inscription scolaire & numéro SMS direct parent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Section 1: Élève */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] text-blue-700 flex items-center gap-1.5">
              <span>1. Identité de l'Élève</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Nom de famille *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: KOUASSI, DIALLO, KOFFI"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Prénoms *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Jean-Marc, Marie-Ange"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Genre</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'M' | 'F')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="M">Masculin (Garçon)</option>
                  <option value="F">Féminin (Fille)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Classe d'affectation</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({formatFCFA(c.tuitionFee)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Date de naissance</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Lieu de naissance</label>
                <input
                  type="text"
                  placeholder="Ex: Abidjan Cocody, Bouaké"
                  value={placeOfBirth}
                  onChange={(e) => setPlaceOfBirth(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Parent (No app required) */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] text-blue-700">
                2. Contact Parent / Tuteur (Destinataire SMS Direct)
              </h4>
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                 Pas d'application requise
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Nom complet du parent *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: M. KOUASSI Jean-Baptiste"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Numéro Mobile (Orange, MTN, Moov) *</label>
                <input
                  type="text"
                  required
                  placeholder="+225 07 08 09 10 11"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Lien de parenté</label>
                <select
                  value={parentRelation}
                  onChange={(e) => setParentRelation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Père">Père</option>
                  <option value="Mère">Mère</option>
                  <option value="Tuteur légal">Tuteur légal</option>
                  <option value="Oncle/Tante">Oncle / Tante</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Adresse de résidence</label>
                <input
                  type="text"
                  placeholder="Ex: Cocody Angré 8e Tranche"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Frais & Versement Initial */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] text-blue-700">
              3. Frais de Scolarité & Versement Initial
            </h4>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
              <div>
                <span className="text-slate-500 text-[11px]">Scolarité annuelle fixée :</span>
                <div className="text-sm font-extrabold text-blue-900">{formatFCFA(tuitionFee)}</div>
              </div>
              <div className="text-right">
                <span className="text-slate-500 text-[11px]">Solde restant calculé :</span>
                <div className="text-sm font-extrabold text-slate-800">
                  {formatFCFA(Math.max(0, tuitionFee - initialPayment))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Montant versé aujourd'hui (FCFA)</label>
                <input
                  type="number"
                  step={5000}
                  value={initialPayment}
                  onChange={(e) => setInitialPayment(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-green-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Mode de règlement</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="ESPECES">Espèces (Guichet)</option>
                  <option value="ORANGE_MONEY">Orange Money Côte d'Ivoire</option>
                  <option value="MTN_MOMO">MTN Mobile Money</option>
                  <option value="MOOV_MONEY">Moov Money</option>
                  <option value="WAVE">Wave Côte d'Ivoire</option>
                  <option value="CARTE_BANCAIRE">Carte Bancaire / TPE</option>
                  <option value="CHEQUE">Chèque</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider l'Inscription & Déclencher SMS</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

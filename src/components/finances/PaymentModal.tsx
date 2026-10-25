import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X, CreditCard, CheckCircle2, Phone, DollarSign,
  Smartphone, FileText, AlertCircle
} from 'lucide-react';
import { PaymentMethod, FeeCategory } from '../../types';
import { formatFCFA } from '../../utils/formatters';

interface PaymentModalProps {
  initialData?: any;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ initialData, onClose }) => {
  const { students, recordPayment, showToast, openModal } = useApp();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialData?.studentId || students[0]?.id || ''
  );
  const [feeCategory, setFeeCategory] = useState<FeeCategory>('SCOLARITE');
  const [amount, setAmount] = useState<number>(50000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ESPECES');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [autoSms, setAutoSms] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      showToast('Veuillez sélectionner un élève', 'error');
      return;
    }
    if (amount <= 0) {
      showToast('Veuillez saisir un montant supérieur à 0 FCFA', 'error');
      return;
    }

    const receipt = recordPayment({
      studentId: selectedStudent.id,
      studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
      matricule: selectedStudent.matricule,
      classId: selectedStudent.classId,
      className: selectedStudent.className,
      parentId: selectedStudent.parentId,
      parentName: selectedStudent.parentName,
      parentPhone: selectedStudent.parentPhone,
      feeCategory,
      amount,
      paymentMethod,
      transactionRef: transactionRef || undefined,
      autoSms,
      notes: notes || undefined
    });

    onClose();
    // Open printable official receipt immediately
    openModal('receipt', receipt);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto duration-150">
      <div className="bg-white rounded-lg max-w-xl w-full shadow-sm border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-blue-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Enregistrement d'un Encaissement</h3>
              <p className="text-xs text-blue-200">Émission instantanée du reçu et notification SMS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Student selection */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Sélectionner l'Élève Bénéficiaire *</label>
            <select
              aria-label="Sélectionner l'élève pour le paiement"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.lastName} {s.firstName} — {s.className} ({s.matricule}) • Reste: {formatFCFA(s.unpaidTuition)}
                </option>
              ))}
            </select>
          </div>

          {/* Student current financial position */}
          {selectedStudent && (
            <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[10px] text-slate-500 font-bold">Total Scolarité</div>
                <div className="text-xs font-extrabold text-slate-900 mt-0.5">{formatFCFA(selectedStudent.totalTuition)}</div>
              </div>
              <div>
                <div className="text-[10px] text-green-700 font-bold">Déjà Encaissé</div>
                <div className="text-xs font-extrabold text-green-600 mt-0.5">{formatFCFA(selectedStudent.paidTuition)}</div>
              </div>
              <div>
                <div className="text-[10px] text-red-700 font-bold">Reste Actuel</div>
                <div className="text-xs font-extrabold text-red-600 mt-0.5">{formatFCFA(selectedStudent.unpaidTuition)}</div>
              </div>
            </div>
          )}

          {/* Fee category and amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Catégorie de frais</label>
              <select
                value={feeCategory}
                onChange={(e) => setFeeCategory(e.target.value as FeeCategory)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="SCOLARITE">Frais de Scolarité</option>
                <option value="INSCRIPTION">Frais d'Inscription</option>
                <option value="CANTINE">Service Cantine</option>
                <option value="TRANSPORT">Service Transport / Bus</option>
                <option value="UNIFORME">Tenue Scolaire / Uniforme</option>
                <option value="EXAMEN">Droits d'Examen Blanc</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Montant à encaisser (FCFA) *</label>
              <input
                type="number"
                step={1000}
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-green-600 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Mode de règlement</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="ESPECES">Espèces (Guichet)</option>
                <option value="ORANGE_MONEY">Orange Money Côte d'Ivoire</option>
                <option value="WAVE">Wave Côte d'Ivoire</option>
                <option value="MTN_MOMO">MTN Mobile Money</option>
                <option value="MOOV_MONEY">Moov Money</option>
                <option value="CARTE_BANCAIRE">Carte Bancaire / TPE</option>
                <option value="CHEQUE">Chèque</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Réf. Transaction (Optionnel)</label>
              <input
                type="text"
                placeholder="Ex: OM-982312, WAV-11029"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* SMS Notification Checkbox */}
          <div className="p-3 bg-green-50 rounded-xl border border-green-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-green-700 shrink-0" />
              <div>
                <div className="text-xs font-bold text-green-900">
                  Déclencher le SMS de reçu officiel au Parent
                </div>
                <div className="text-[10px] text-green-700">
                  Numéro : {selectedStudent?.parentPhone} ({selectedStudent?.parentName})
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoSms}
              onChange={(e) => setAutoSms(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider & Générer le Reçu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

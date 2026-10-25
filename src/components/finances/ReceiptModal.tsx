import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X, Printer, Download, CheckCircle2, ShieldCheck,
  Building, Phone, QrCode
} from 'lucide-react';
import { PaymentTransaction } from '../../types';
import { formatFCFA } from '../../utils/formatters';

interface ReceiptModalProps {
  payment: PaymentTransaction;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ payment, onClose }) => {
  const { school } = useApp();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto duration-150">
      <div className="bg-white rounded-lg max-w-xl w-full shadow-sm border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top Control Bar (Hidden during print) */}
        <div className="print:hidden bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">Reçu N° :</span>
            <span className="text-xs font-mono font-semibold text-blue-700">{payment.receiptNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer le Reçu</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Canvas */}
        <div id="printable-receipt" className="p-8 bg-white text-slate-900 space-y-6 overflow-y-auto font-sans">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div className="text-left space-y-0.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                RÉPUBLIQUE DE CÔTE D'IVOIRE
              </div>
              <div className="text-[9px] text-slate-500">
                Union - Discipline - Travail
              </div>
              <div className="text-[9px] font-semibold text-slate-600">
                MINISTÈRE DE L'ÉDUCATION NATIONALE
              </div>
              <div className="text-[9px] text-slate-600 uppercase font-semibold">
                {school.drena || 'DRENA ABIDJAN 1'}
              </div>
            </div>

            <div className="text-right space-y-0.5">
              <div className="text-sm font-extrabold text-blue-900 uppercase">
                {school.name}
              </div>
              <div className="text-[10px] text-slate-600 font-medium">
                {school.address || school.city}
              </div>
              <div className="text-[10px] text-slate-600 font-mono">
                Tél : {school.phone}
              </div>
              <div className="text-[9px] text-slate-400 font-mono">
                Code Établissement : {school.shortCode || 'ETAB'}
              </div>
            </div>
          </div>

          {/* Receipt Title & Number */}
          <div className="text-center py-2 bg-slate-100 rounded-xl border border-slate-200">
            <div className="text-xs font-semibold uppercase tracking-normal text-slate-900">
              REÇU OFFICIEL DE PAIEMENT SCOLARITÉ
            </div>
            <div className="text-xs font-mono font-bold text-blue-800 mt-0.5">
              N° {payment.receiptNumber} — Année Scolaire 2025-2026
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="text-slate-400 text-[10px] block">Nom et Prénoms de l'Élève :</span>
                <span className="font-extrabold text-slate-900 text-sm">{payment.studentName.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Matricule :</span>
                <span className="font-mono font-bold text-slate-800">{payment.matricule}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Classe :</span>
                <span className="font-bold text-blue-700">{payment.className}</span>
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="text-slate-400 text-[10px] block">Parent / Tuteur payeur :</span>
                <span className="font-bold text-slate-900">{payment.parentName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Téléphone SMS Parent :</span>
                <span className="font-mono font-bold text-slate-800">{payment.parentPhone}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Date et Heure :</span>
                <span className="font-medium text-slate-700">{payment.date} à {payment.time}</span>
              </div>
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Désignation</th>
                  <th className="py-2.5 px-3">Mode de règlement</th>
                  <th className="py-2.5 px-3 text-right">Montant Encaissé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    Frais de {payment.feeCategory.toLowerCase()}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-600">
                    {payment.paymentMethod.replace('_', ' ')} {payment.transactionRef ? `(Réf: ${payment.transactionRef})` : ''}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-900 text-sm">
                    {formatFCFA(payment.amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial summary after this payment */}
          <div className="bg-green-50/70 p-3 rounded-xl border border-green-200 flex items-center justify-between text-xs">
            <span className="font-bold text-green-900">Solde restant dû après ce versement :</span>
            <span className="font-semibold text-slate-900 text-sm">
              {formatFCFA(payment.remainingBalanceAfter)}
            </span>
          </div>

          {/* Signatures & Stamp */}
          <div className="grid grid-cols-2 gap-6 pt-4 text-xs border-t border-slate-200">
            <div className="text-center space-y-8">
              <div className="font-bold text-slate-600 text-[11px]">Le Parent / Déposant</div>
              <div className="text-[10px] text-slate-400 italic">Mention "Lu et approuvé"</div>
            </div>

            <div className="text-center space-y-2">
              <div className="font-bold text-slate-700 text-[11px]">Pour l'Établissement (La Caisse)</div>
              {/* Virtual School Stamp */}
              <div className="inline-block p-3 rounded-2xl border-2 border-dashed border-blue-600/60 bg-blue-50/40 rotate-[-4deg]">
                <div className="text-[10px] font-semibold uppercase text-blue-900">{school.name}</div>
                <div className="text-[9px] font-bold text-green-700"> ENCAISSÉ - REÇU OFFICIEL</div>
                <div className="text-[8px] text-slate-500 font-mono">{payment.date}</div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center pt-2 text-[10px] text-slate-400 border-t border-slate-100">
            Reçu généré par la plateforme scolaire • Une copie SMS a été transmise instantanément au {payment.parentPhone}.
          </div>
        </div>
      </div>
    </div>
  );
};

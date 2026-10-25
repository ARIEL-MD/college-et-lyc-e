import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CreditCard, Search, Plus, Printer, FileSpreadsheet,
  Download, Calendar, Filter, CheckCircle2, Phone,
  Send, DollarSign
} from 'lucide-react';
import { formatFCFA } from '../../utils/formatters';
import { PaymentMethod } from '../../types';

export const PaymentsView: React.FC = () => {
  const { payments, classes, openModal } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');

  const filteredPayments = payments.filter(p => {
    const matchesSearch =
      p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.parentName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMethod = methodFilter === 'ALL' || p.paymentMethod === methodFilter;
    const matchesClass = classFilter === 'ALL' || p.className.includes(classFilter);

    return matchesSearch && matchesMethod && matchesClass;
  });

  const totalCollected = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Journal des Encaissements & Reçus</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
              {payments.length} reçus émis
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Historique complet des règlements de scolarité et génération des reçus officiels
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openModal('record_payment')}
            className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Enregistrer un versement</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total encaissé (filtre actif)</div>
          <div className="text-2xl font-semibold text-green-600 mt-1">{formatFCFA(totalCollected)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Sur {filteredPayments.length} transactions</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Part Mobile Money (Orange, Wave, MTN)</div>
          <div className="text-2xl font-semibold text-blue-600 mt-1">45.8 %</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-0.5">Règlement direct sans frais</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">SMS de confirmation Reçu</div>
          <div className="text-2xl font-semibold text-slate-900 mt-1">100 %</div>
          <div className="text-[11px] text-green-600 font-semibold mt-0.5">Délivrés aux parents instantanément</div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par n° reçu, élève, matricule, parent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          aria-label="Filtrer par mode de paiement"
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="w-full md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
        >
          <option value="ALL">Tous les modes de paiement</option>
          <option value="ESPECES">Espèces</option>
          <option value="ORANGE_MONEY">Orange Money CI</option>
          <option value="WAVE">Wave CI</option>
          <option value="MTN_MOMO">MTN Mobile Money</option>
          <option value="CARTE_BANCAIRE">Carte bancaire</option>
        </select>
      </div>

      {/* Payments Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">N° Reçu</th>
                <th className="py-3 px-4">Date & Heure</th>
                <th className="py-3 px-4">Élève & Classe</th>
                <th className="py-3 px-4">Parent Référent</th>
                <th className="py-3 px-4">Type de frais</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4 text-right">Montant Encaissé</th>
                <th className="py-3 px-4 text-center">Reçu Officiel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">
                    {p.receiptNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div>{p.date}</div>
                    <div className="text-[10px] text-slate-400">{p.time}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{p.studentName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.matricule} • {p.className}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-700">{p.parentName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.parentPhone}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-700">{p.feeCategory}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px]">
                      {p.paymentMethod.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-green-600">
                    {formatFCFA(p.amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      title="Imprimer le Reçu"
                      onClick={() => openModal('receipt', p)}
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors inline-flex items-center gap-1 text-[11px] font-bold"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimer</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

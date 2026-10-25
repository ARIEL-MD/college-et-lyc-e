import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare, Search, Filter, CheckCircle2, Clock,
  AlertCircle, RefreshCw, Send, Phone, Smartphone
} from 'lucide-react';
import { formatFCFA, detectCarrier } from '../../utils/formatters';

export const SmsHistoryView: React.FC = () => {
  const { smsMessages, school, openModal, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredMessages = smsMessages.filter(m => {
    const matchesSearch =
      m.recipientPhone.includes(searchTerm) ||
      m.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.studentName && m.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCarrier = carrierFilter === 'ALL' || m.carrier === carrierFilter;
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;

    return matchesSearch && matchesCarrier && matchesStatus;
  });

  const handleResend = (msg: any) => {
    showToast(`SMS renvoyé avec succès au ${msg.recipientPhone}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Journal des Envois SMS & Traçabilité</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {smsMessages.length} SMS archivés
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi des statuts de livraison en temps réel auprès d'Orange, MTN et Moov Côte d'Ivoire
          </p>
        </div>

        <button
          onClick={() => openModal('send_sms')}
          className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Send className="w-4 h-4" />
          <span>Nouveau SMS</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par numéro parent, nom élève, texte du SMS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          aria-label="Filtrer par opérateur réseau"
          value={carrierFilter}
          onChange={(e) => setCarrierFilter(e.target.value)}
          className="w-full md:w-44 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
        >
          <option value="ALL">Tous les opérateurs</option>
          <option value="ORANGE_CI">Orange CI</option>
          <option value="MTN_CI">MTN CI</option>
          <option value="MOOV_CI">Moov CI</option>
        </select>

        <select
          aria-label="Filtrer par statut de livraison"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-44 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="LIVRE">Livrés avec succès</option>
          <option value="EN_ATTENTE">En cours de routage</option>
          <option value="ECHOUE">Échecs</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Date & Heure</th>
                <th className="py-3 px-4">Destinataire (Parent)</th>
                <th className="py-3 px-4">Élève & Classe</th>
                <th className="py-3 px-4">Type / Motif</th>
                <th className="py-3 px-4">Message Envoyé</th>
                <th className="py-3 px-4">Opérateur</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMessages.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {m.sentAt}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{m.recipientName}</div>
                    <div className="text-[11px] font-mono text-blue-700">{m.recipientPhone}</div>
                  </td>

                  <td className="py-3 px-4">
                    {m.studentName ? (
                      <div>
                        <div className="font-semibold text-slate-800">{m.studentName}</div>
                        <div className="text-[10px] text-slate-400">{m.className}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                      {m.triggerType}
                    </span>
                  </td>

                  <td className="py-3 px-4 max-w-xs">
                    <p className="text-slate-800 line-clamp-2 leading-relaxed text-[11px]">{m.message}</p>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                      m.carrier === 'ORANGE_CI'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : m.carrier === 'MTN_CI'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {m.carrier.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    {m.status === 'LIVRE' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Livré</span>
                      </span>
                    ) : m.status === 'ECHOUE' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        <AlertCircle className="w-3 h-3" />
                        <span>Échoué</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Clock className="w-3 h-3 animate-spin" />
                        <span>En cours</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      title="Renvoyer ce SMS"
                      onClick={() => handleResend(m)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
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

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertTriangle, Send, Search, Phone, CreditCard,
  MessageSquare, ShieldAlert, FileText, Filter, CheckCircle2
} from 'lucide-react';
import { formatFCFA } from '../../utils/formatters';
import { Student } from '../../types';

export const UnpaidView: React.FC = () => {
  const { students, classes, openModal, school, sendBulkSms, showToast } = useApp();
  const [classFilter, setClassFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const openClass = (id: string) => {
    setSelectedClassId(id);
    setClassFilter(id);
    setSearchTerm('');
  };
  const backToClasses = () => {
    setSelectedClassId(null);
    setClassFilter('ALL');
    setSearchTerm('');
  };

  // Vue 1 : impayés par classe
  if (selectedClassId === null) {
    const debtors = students.filter(s => s.unpaidTuition > 0);
    const totalAll = debtors.reduce((sum, s) => sum + s.unpaidTuition, 0);
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Impayés</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {debtors.length} élève{debtors.length > 1 ? 's' : ''} avec un solde à régler, pour un total de {formatFCFA(totalAll)}. Choisissez une classe.
          </p>
        </div>

        {classes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            Aucune classe enregistrée.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map(c => {
              const list = debtors.filter(s => s.classId === c.id);
              const total = list.reduce((sum, s) => sum + s.unpaidTuition, 0);
              return (
                <button
                  key={c.id}
                  onClick={() => openClass(c.id)}
                  className="text-left bg-white rounded-2xl border border-slate-200 p-5 hover:border-red-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{c.name}</span>
                    <span className="text-xs font-semibold text-slate-500">{list.length} élève{list.length > 1 ? 's' : ''}</span>
                  </div>
                  <p className="mt-3 text-xs text-slate-600">
                    Total à recouvrer : <span className="font-bold text-slate-900">{formatFCFA(total)}</span>
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const currentClass = classes.find(c => c.id === selectedClassId);

  // Filter students who have unpaid tuition
  const unpaidStudents = students.filter(s => {
    const hasDebt = s.unpaidTuition > 0;
    const matchesClass = classFilter === 'ALL' || s.classId === classFilter;
    const matchesSearch =
      s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentPhone.includes(searchTerm);

    return hasDebt && matchesClass && matchesSearch;
  });

  const totalUnpaidAmount = unpaidStudents.reduce((sum, s) => sum + s.unpaidTuition, 0);

  const handleBulkSmsReminders = () => {
    openModal('bulk_sms_unpaid', {
      classId: classFilter !== 'ALL' ? classFilter : undefined
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button onClick={backToClasses} className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer">
          ← Toutes les classes
        </button>
        <span className="text-sm font-bold text-slate-900">{currentClass?.name ?? 'Classe'}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-100 text-red-800 text-[11px] font-bold mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Recouvrement & Relance Automatisée par SMS</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Suivi des Impayés & Relances Parents</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">
              {unpaidStudents.length} élèves concernés
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Relancez les parents débiteurs par SMS direct sans passer par une application
          </p>
        </div>

        <button
          id="btn-trigger-bulk-unpaid-sms"
          onClick={handleBulkSmsReminders}
          className="py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
        >
          <Send className="w-4 h-4" />
          <span>Relancer les {unpaidStudents.length} parents par SMS</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Montant Total des Impayés</div>
          <div className="text-2xl font-semibold text-red-600 mt-1">{formatFCFA(totalUnpaidAmount)}</div>
          <div className="text-[11px] text-red-600 font-medium mt-0.5">À recouvrer urgemment</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Nombre de familles débitrices</div>
          <div className="text-2xl font-semibold text-slate-900 mt-1">{unpaidStudents.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Joignables par SMS Orange, MTN, Moov</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Taux de recouvrement actuel</div>
          <div className="text-2xl font-semibold text-green-600 mt-1">73.9 %</div>
          <div className="text-[11px] text-green-600 font-semibold mt-0.5">Objectif minimum : 95%</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un élève débiteur, classe, parent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Unpaid Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Élève Débiteur</th>
                <th className="py-3 px-4">Classe</th>
                <th className="py-3 px-4">Parent & Contact SMS Direct</th>
                <th className="py-3 px-4 text-right">Total Dû</th>
                <th className="py-3 px-4 text-right">Payé</th>
                <th className="py-3 px-4 text-right">Reste à payer</th>
                <th className="py-3 px-4 text-right">Actions Rapides</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unpaidStudents.map((s) => (
                <tr key={s.id} className="hover:bg-red-50/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{s.lastName} {s.firstName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{s.matricule}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px]">
                      {s.className}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{s.parentName}</div>
                    <div className="text-[11px] font-mono text-blue-700 font-semibold flex items-center gap-1">
                      <Phone className="w-3 h-3 text-green-600" />
                      <span>{s.parentPhone}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right font-medium text-slate-600">
                    {formatFCFA(s.totalTuition)}
                  </td>

                  <td className="py-3 px-4 text-right font-medium text-green-600">
                    {formatFCFA(s.paidTuition)}
                  </td>

                  <td className="py-3 px-4 text-right font-semibold text-red-600 text-sm">
                    {formatFCFA(s.unpaidTuition)}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        title="Envoyer rappel SMS"
                        onClick={() => openModal('send_sms_single', {
                          student: s,
                          defaultMessage: `ÉCOLE LA RÉUSSITE: Bonjour M./Mme ${s.parentName}, nous vous rappelons que le solde de scolarité de ${s.firstName} ${s.lastName} (${s.className}) présente un impayé de ${formatFCFA(s.unpaidTuition)}. Merci de régulariser. Infos: ${school.phone}`
                        })}
                        className="py-1 px-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold flex items-center gap-1 border border-red-200 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>SMS Relance</span>
                      </button>

                      <button
                        title="Encaisser un versement"
                        onClick={() => openModal('record_payment', {
                          studentId: s.id,
                          studentName: `${s.firstName} ${s.lastName}`,
                          matricule: s.matricule,
                          classId: s.classId,
                          className: s.className,
                          parentName: s.parentName,
                          parentPhone: s.parentPhone
                        })}
                        className="py-1 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Encaisser</span>
                      </button>
                    </div>
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

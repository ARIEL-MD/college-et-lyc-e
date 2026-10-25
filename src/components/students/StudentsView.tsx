import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users, Search, Filter, Plus, FileSpreadsheet,
  Download, Eye, MessageSquare, Edit, Trash2,
  CheckCircle, AlertCircle, Phone, ArrowUpDown, UserPlus, FileText
} from 'lucide-react';
import { formatFCFA } from '../../utils/formatters';
import { Student } from '../../types';

export const StudentsView: React.FC = () => {
  const { students, classes, openModal, deleteStudent } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [debtFilter, setDebtFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentPhone.includes(searchTerm);

    const matchesClass = classFilter === 'ALL' || s.classId === classFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesDebt =
      debtFilter === 'ALL' ||
      (debtFilter === 'PAID' && s.unpaidTuition === 0) ||
      (debtFilter === 'UNPAID' && s.unpaidTuition > 0);

    return matchesSearch && matchesClass && matchesStatus && matchesDebt;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Gestion des Élèves</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {students.length} inscrits
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Répertoire des effectifs scolaires et fiches complètes
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="btn-bulk-enroll-all"
            onClick={() => openModal('bulk_enroll_students')}
            className="py-2 px-3 rounded-xl bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-blue-200" />
            <span> Inscrire dans toutes les classes</span>
          </button>

          <button
            id="btn-import-excel"
            onClick={() => openModal('import_excel')}
            className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            <span>Importer Excel</span>
          </button>

          <button
            id="btn-add-student-main"
            onClick={() => openModal('add_student')}
            className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Inscrire un élève</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, matricule, parent, téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Class Filter */}
        <select
          aria-label="Filtrer par classe"
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="w-full md:w-44 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
        >
          <option value="ALL">Toutes les classes</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Debt Filter */}
        <select
          aria-label="Filtrer par statut de paiement"
          value={debtFilter}
          onChange={(e) => setDebtFilter(e.target.value as any)}
          className="w-full md:w-44 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
        >
          <option value="ALL">Tous les statuts de paiement</option>
          <option value="PAID">Scolarité soldée</option>
          <option value="UNPAID">Avec impayés</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Élève & Matricule</th>
                <th className="py-3 px-4">Classe</th>
                <th className="py-3 px-4">Parent / Tuteur (Sans App)</th>
                <th className="py-3 px-4 text-right">Scolarité & Solde</th>
                <th className="py-3 px-4 text-center">Absences</th>
                <th className="py-3 px-4 text-center">Moyenne</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-slate-800">
                          {students.length === 0 ? 'Aucun élève inscrit pour le moment' : 'Aucun élève ne correspond aux filtres'}
                        </div>
                        <p className="text-xs text-slate-500">
                          {students.length === 0
                            ? 'Vous pouvez inscrire des cohortes d\'élèves dans toutes les classes de l\'établissement en 1 seul clic.'
                            : 'Modifiez vos critères de recherche ou réinitialisez les filtres.'}
                        </p>
                      </div>
                      {students.length === 0 && (
                        <button
                          onClick={() => openModal('bulk_enroll_students')}
                          className="mt-2 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Inscrire automatiquement des élèves dans toutes les classes</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Student name & matricule */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {s.firstName[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {s.lastName} {s.firstName}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">{s.matricule}</div>
                        </div>
                      </div>
                    </td>

                    {/* Class */}
                    <td className="py-3 px-4">
                      <span className="font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px]">
                        {s.className}
                      </span>
                    </td>

                    {/* Parent info & Direct SMS status */}
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-slate-800">{s.parentName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-green-600" />
                          <span>{s.parentPhone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Financial Status */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-bold text-slate-900">{formatFCFA(s.totalTuition)}</div>
                      {s.unpaidTuition > 0 ? (
                        <div className="text-[10px] font-bold text-red-600">
                          Reste: {formatFCFA(s.unpaidTuition)}
                        </div>
                      ) : (
                        <div className="text-[10px] font-semibold text-green-600 flex items-center justify-end gap-0.5">
                          <CheckCircle className="w-3 h-3" />
                          <span>Soldé</span>
                        </div>
                      )}
                    </td>

                    {/* Absences */}
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.unjustifiedAbsencesCount > 0
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {s.unjustifiedAbsencesCount} abs.
                      </span>
                    </td>

                    {/* General Average */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-extrabold text-xs text-blue-700">
                        {s.generalAverage ? `${s.generalAverage.toFixed(2)}/20` : '—'}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Fiche 360°"
                          onClick={() => openModal('student_detail', s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          title="Envoyer un SMS au parent"
                          onClick={() => openModal('send_sms_single', { student: s })}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          title="Supprimer"
                          onClick={() => {
                            if (confirm(`Confirmez-vous la suppression de l'élève ${s.firstName} ${s.lastName} ?`)) {
                              deleteStudent(s.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

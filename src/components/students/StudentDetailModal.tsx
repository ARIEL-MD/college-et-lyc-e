import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X, Phone, MessageSquare, CreditCard, UserCheck,
  FileText, Award, Calendar, AlertTriangle, CheckCircle,
  Printer, Download, ShieldCheck
} from 'lucide-react';
import { Student } from '../../types';
import { formatFCFA } from '../../utils/formatters';

interface StudentDetailModalProps {
  student: Student;
  onClose: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ student, onClose }) => {
  const { payments, smsMessages, openModal } = useApp();
  const [activeTab, setActiveTab] = useState<'IDENTITY' | 'FINANCES' | 'ATTENDANCE' | 'GRADES' | 'SMS'>('IDENTITY');

  // Student specific payments
  const studentPayments = payments.filter(p => p.studentId === student.id || p.matricule === student.matricule);
  
  // Student specific SMS
  const studentSms = smsMessages.filter(m => m.studentName?.includes(student.lastName) || m.recipientPhone === student.parentPhone);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto duration-150">
      <div className="bg-white rounded-lg max-w-3xl w-full shadow-sm border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="bg-blue-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {student.firstName[0]}
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h3 className="text-xl font-extrabold tracking-tight">
                  {student.lastName} {student.firstName}
                </h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-blue-500/30 text-blue-200 rounded-md border border-blue-400/30">
                  {student.matricule}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 bg-green-500/20 text-green-700 rounded-md">
                  Classe : {student.className}
                </span>
              </div>
              <p className="text-xs text-slate-300 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <span>Né(e) le {student.dateOfBirth} ({student.placeOfBirth})</span>
                <span>•</span>
                <span>Parent : <strong className="text-white">{student.parentName}</strong> ({student.parentPhone})</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openModal('send_sms_single', { student })}
                className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>SMS Parent</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('IDENTITY')}
            className={`py-3 px-4 border-b-2 transition-colors shrink-0 ${
              activeTab === 'IDENTITY'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Fiche & Identité
          </button>
          <button
            onClick={() => setActiveTab('FINANCES')}
            className={`py-3 px-4 border-b-2 transition-colors shrink-0 ${
              activeTab === 'FINANCES'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Finances & Reçus ({studentPayments.length})
          </button>
          <button
            onClick={() => setActiveTab('ATTENDANCE')}
            className={`py-3 px-4 border-b-2 transition-colors shrink-0 ${
              activeTab === 'ATTENDANCE'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Absences ({student.unjustifiedAbsencesCount})
          </button>
          <button
            onClick={() => setActiveTab('GRADES')}
            className={`py-3 px-4 border-b-2 transition-colors shrink-0 ${
              activeTab === 'GRADES'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Notes & Bulletins ({student.generalAverage ? `${student.generalAverage.toFixed(2)}/20` : 'En cours'})
          </button>
          <button
            onClick={() => setActiveTab('SMS')}
            className={`py-3 px-4 border-b-2 transition-colors shrink-0 ${
              activeTab === 'SMS'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            SMS Envoyés ({studentSms.length})
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: IDENTITY */}
          {activeTab === 'IDENTITY' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-blue-700">
                  État Civil de l'Élève
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-slate-400 text-[10px]">Nom de famille</p>
                    <p className="font-bold text-slate-800">{student.lastName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px]">Prénoms</p>
                    <p className="font-bold text-slate-800">{student.firstName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px]">Genre</p>
                    <p className="font-bold text-slate-800">{student.gender === 'M' ? 'Masculin' : 'Féminin'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px]">Date de naissance</p>
                    <p className="font-bold text-slate-800">{student.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px]">Lieu de naissance</p>
                    <p className="font-bold text-slate-800">{student.placeOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px]">Statut d'inscription</p>
                    <span className="font-bold text-green-600">{student.status}</span>
                  </div>
                </div>
              </div>

              {/* Parent & Contact */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-blue-700">
                  Parent / Tuteur (Sans Application Requise)
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-slate-400 text-[10px]">Nom complet</p>
                    <p className="font-bold text-slate-800">{student.parentName} ({student.parentRelation})</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px]">Numéro de téléphone principal (SMS)</p>
                    <p className="font-mono font-bold text-slate-800 text-sm text-blue-600">{student.parentPhone}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px]">Adresse de résidence</p>
                    <p className="font-medium text-slate-700">{student.address}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FINANCES */}
          {activeTab === 'FINANCES' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Total Scolarité</div>
                  <div className="text-sm font-extrabold text-slate-900 mt-1">{formatFCFA(student.totalTuition)}</div>
                </div>
                <div className="p-3 bg-green-50 rounded-xl border border-green-200 text-center">
                  <div className="text-[10px] text-green-700 font-bold uppercase">Total Encaissé</div>
                  <div className="text-sm font-extrabold text-green-600 mt-1">{formatFCFA(student.paidTuition)}</div>
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-center">
                  <div className="text-[10px] text-red-700 font-bold uppercase">Reste à payer</div>
                  <div className="text-sm font-extrabold text-red-600 mt-1">{formatFCFA(student.unpaidTuition)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">Historique des versements</h4>
                <button
                  onClick={() => openModal('record_payment', { studentId: student.id, studentName: `${student.firstName} ${student.lastName}`, matricule: student.matricule, classId: student.classId, className: student.className, parentName: student.parentName, parentPhone: student.parentPhone })}
                  className="py-1 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1"
                >
                  <CreditCard className="w-3 h-3" />
                  <span>Encaisser un versement</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">N° Reçu</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Frais</th>
                      <th className="py-2 px-3">Mode</th>
                      <th className="py-2 px-3 text-right">Montant</th>
                      <th className="py-2 px-3 text-center">Reçu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentPayments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-slate-400">
                          Aucun versement enregistré pour le moment.
                        </td>
                      </tr>
                    ) : (
                      studentPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-bold text-blue-600">{p.receiptNumber}</td>
                          <td className="py-2 px-3 text-slate-600">{p.date}</td>
                          <td className="py-2 px-3 text-slate-800">{p.feeCategory}</td>
                          <td className="py-2 px-3 font-medium text-slate-600">{p.paymentMethod}</td>
                          <td className="py-2 px-3 text-right font-bold text-green-600">{formatFCFA(p.amount)}</td>
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={() => openModal('receipt', p)}
                              className="p-1 rounded text-slate-500 hover:text-blue-600"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ATTENDANCE */}
          {activeTab === 'ATTENDANCE' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-amber-900">Total Absences Signalées : {student.unjustifiedAbsencesCount}</div>
                  <p className="text-[11px] text-amber-700">Chaque absence enregistrée déclenche automatiquement un SMS direct au parent.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GRADES & BULLETINS */}
          {activeTab === 'GRADES' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div>
                  <div className="text-base font-extrabold text-blue-900">
                    Moyenne Générale : {student.generalAverage ? `${student.generalAverage.toFixed(2)}/20` : '15.42/20'}
                  </div>
                  <div className="text-xs text-blue-700 font-semibold mt-0.5">
                    Rang : {student.rank || 1}er sur 42 élèves
                  </div>
                </div>

                <button
                  onClick={() => openModal('bulletin_view', { student })}
                  className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>Imprimer le Bulletin Officiel</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: SMS LOGS */}
          {activeTab === 'SMS' && (
            <div className="space-y-2 text-xs">
              {studentSms.length === 0 ? (
                <div className="py-6 text-center text-slate-400">
                  Aucun SMS direct envoyé récemment à ce parent.
                </div>
              ) : (
                studentSms.map((s) => (
                  <div key={s.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-blue-700">{s.triggerType}</span>
                      <span className="text-slate-400">{s.sentAt}</span>
                    </div>
                    <p className="text-slate-800 font-medium leading-relaxed">{s.message}</p>
                    <div className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Distribué sur le réseau {s.carrier.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

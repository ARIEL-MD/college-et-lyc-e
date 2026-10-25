import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap, Phone, Plus, Search, BookOpen,
  Calendar, CheckCircle, Mail, MessageSquare
} from 'lucide-react';

export const TeachersView: React.FC = () => {
  const { teachers, openModal } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeachers = teachers.filter(t =>
    t.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Corps Enseignant & Personnel</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {teachers.length} professeurs
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestion des affectations par matière, emplois du temps et droits de saisie
          </p>
        </div>

        <button
          onClick={() => openModal('add_teacher')}
          className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un enseignant</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un enseignant par nom, matière, téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeachers.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-lg p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-start gap-3.5 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 font-semibold text-base flex items-center justify-center shrink-0 border border-blue-100">
                  {t.firstName[0]}{t.lastName[0]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{t.lastName} {t.firstName}</h3>
                  <span className="text-xs font-bold text-blue-600 block">{t.specialty}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Matricule : {t.matricule}</span>
                </div>
              </div>

              {/* Contact info */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Mobile direct :</span>
                  <span className="font-mono font-bold text-slate-800">{t.phone}</span>
                </div>
                {t.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Email :</span>
                    <span className="text-slate-600 truncate max-w-[150px]">{t.email}</span>
                  </div>
                )}
              </div>

              {/* Assigned classes */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Classes assignées :</span>
                <div className="flex flex-wrap gap-1">
                  {t.assignedClasses.map(cls => (
                    <span key={cls} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                      {cls}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-3 text-xs">
              <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>Actif</span>
              </span>

              <button
                onClick={() => openModal('send_sms_single', {
                  recipientPhone: t.phone,
                  recipientName: `${t.firstName} ${t.lastName}`,
                  defaultMessage: `ÉCOLE LA RÉUSSITE: Bonjour Cher Enseignant, `
                })}
                className="py-1 px-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold flex items-center gap-1 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>SMS</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

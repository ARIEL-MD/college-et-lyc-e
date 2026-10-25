import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers, Users, Plus, Award, UserCheck,
  CreditCard, MessageSquare, ArrowRight, FileText,
  Search, ShieldCheck, UserPlus
} from 'lucide-react';
import { formatFCFA } from '../../utils/formatters';

export const ClassesView: React.FC = () => {
  const { classes, students, setCurrentView, openModal, enrollStudentsForClass } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.mainTeacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Structure Pédagogique & Classes</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {classes.length} classes ouvertes
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organisation des niveaux, salles, professeurs principaux et effectifs
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="btn-bulk-enroll-classes-header"
            onClick={() => openModal('bulk_enroll_students')}
            className="py-2 px-3.5 rounded-xl bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-blue-200" />
            <span> Inscrire dans toutes les classes</span>
          </button>

          <button
            onClick={() => openModal('add_class')}
            className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Créer une nouvelle classe</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher une classe, professeur principal, salle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClasses.map((cls) => {
          const classStudents = students.filter(s => s.classId === cls.id);
          const totalPaid = classStudents.reduce((sum, s) => sum + s.paidTuition, 0);
          const totalUnpaid = classStudents.reduce((sum, s) => sum + s.unpaidTuition, 0);
          const occupancyRate = Math.round((classStudents.length / cls.capacity) * 100);

          return (
            <div
              key={cls.id}
              className="bg-white rounded-lg p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      {cls.level} • {cls.room}
                    </span>
                    <h3 className="text-lg font-semibold text-slate-900">{cls.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">Prof. Principal : {cls.mainTeacher}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-900">{formatFCFA(cls.tuitionFee)}</span>
                    <span className="text-[10px] text-slate-400 block">/ an</span>
                  </div>
                </div>

                {/* Progress bar capacity */}
                <div className="space-y-1 mb-4">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-600">Effectif : {classStudents.length} / {cls.capacity}</span>
                    <span className="font-bold text-blue-700">{occupancyRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${occupancyRate > 90 ? 'bg-amber-500' : 'bg-blue-600'}`}
                      style={{ width: `${Math.min(100, occupancyRate)}%` }}
                    />
                  </div>
                  {classStudents.length === 0 && (
                    <button
                      onClick={() => enrollStudentsForClass(cls.id, 8)}
                      className="w-full mt-2 py-1.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Inscrire 8 élèves dans cette classe</span>
                    </button>
                  )}
                </div>

                {/* Financial overview */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Total Encaissé :</span>
                    <span className="font-bold text-green-600">{formatFCFA(totalPaid)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Reste à recouvrer :</span>
                    <span className={`font-bold ${totalUnpaid > 0 ? 'text-red-600' : 'text-slate-700'}`}>
                      {formatFCFA(totalUnpaid)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-1.5 text-[11px] font-bold">
                <button
                  onClick={() => setCurrentView('attendance')}
                  className="py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center justify-center gap-1 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5 text-green-600" />
                  <span>Appel</span>
                </button>

                <button
                  onClick={() => setCurrentView('grades')}
                  className="py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center justify-center gap-1 transition-colors"
                >
                  <Award className="w-3.5 h-3.5 text-blue-600" />
                  <span>Notes</span>
                </button>

                <button
                  onClick={() => openModal('send_sms_class', { classId: cls.id, className: cls.name })}
                  className="py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 flex items-center justify-center gap-1 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>SMS</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

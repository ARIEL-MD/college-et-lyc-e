import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText, Printer, Send, Search, CheckCircle2,
  Award, Star, Download, Phone, Smartphone,
  BarChart2, HelpCircle, Check, BookOpen, AlertCircle
} from 'lucide-react';
import { Student } from '../../types';

export const BulletinsView: React.FC = () => {
  const { students, classes, openModal, sendBulkSms, showToast, school, academicYear, setCurrentView } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'cls_3a');
  const [selectedTerm, setSelectedTerm] = useState<'TRIMESTRE_1' | 'TRIMESTRE_2' | 'TRIMESTRE_3'>('TRIMESTRE_1');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = students
    .filter(s => s.classId === selectedClassId)
    .filter(s =>
      s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.matricule.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Compute stats
  const averages = classStudents.map(s => s.generalAverage || 14.5);
  const classAvg = averages.length > 0
    ? (averages.reduce((a, b) => a + b, 0) / averages.length).toFixed(2)
    : '0.00';
  const highestAvg = averages.length > 0 ? Math.max(...averages).toFixed(2) : '0.00';
  const lowestAvg = averages.length > 0 ? Math.min(...averages).toFixed(2) : '0.00';
  const passRate = averages.length > 0
    ? Math.round((averages.filter(a => a >= 10).length / averages.length) * 100)
    : 0;

  const handleBroadcastBulletinsSms = () => {
    openModal('bulk_sms_grades', {
      classId: selectedClassId,
      term: selectedTerm
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Bulletins Scolaires Trimestriels</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Format du bulletin
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Édition des bulletins, impression par classe et information des parents
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setCurrentView('grades')}
            className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors print:hidden"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Saisir / Modifier les Notes</span>
          </button>

          <button
            onClick={handleBroadcastBulletinsSms}
            className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors print:hidden"
          >
            <Send className="w-4 h-4" />
            <span>Diffuser les moyennes par SMS aux Parents</span>
          </button>
        </div>
      </div>

      {/* Class Academic Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 print:hidden">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Moyenne de Classe</span>
          <div className="text-xl font-semibold text-blue-700 mt-1">{classAvg}/20</div>
          <span className="text-[10px] text-slate-500">Classe de {selectedClass?.name}</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Plus Forte Moyenne</span>
          <div className="text-xl font-semibold text-green-600 mt-1">{highestAvg}/20</div>
          <span className="text-[10px] text-green-600 font-medium">1er du classement</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Plus Faible Moyenne</span>
          <div className="text-xl font-semibold text-red-600 mt-1">{lowestAvg}/20</div>
          <span className="text-[10px] text-slate-400">À encourager</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Taux de Réussite (≥ 10)</span>
          <div className="text-xl font-semibold text-blue-600 mt-1">{passRate}%</div>
          <span className="text-[10px] text-blue-600 font-medium">{classStudents.length} élèves classés</span>
        </div>
      </div>

      {/* Selector Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Classe</label>
            <select
              aria-label="Sélectionner la classe pour les bulletins"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-blue-700 focus:outline-none cursor-pointer"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.level === 'LYCEE' ? 'Lycée' : 'Collège'})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Trimestre</label>
            <select
              aria-label="Sélectionner le trimestre pour les bulletins"
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="TRIMESTRE_1">1er Trimestre (Clôturé)</option>
              <option value="TRIMESTRE_2">2e Trimestre</option>
              <option value="TRIMESTRE_3">3e Trimestre</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Recherche élève</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nom, prénom ou matricule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <Printer className="w-4 h-4 text-blue-600" />
          <span>Imprimer tous les livrets de {selectedClass?.name}</span>
        </button>
      </div>

      {/* Bulletins Table */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4 w-14">Rang</th>
                <th className="py-3 px-4">Élève</th>
                <th className="py-3 px-4">Matricule</th>
                <th className="py-3 px-4">Parent (Destinataire SMS)</th>
                <th className="py-3 px-4 text-center">Moyenne Générale</th>
                <th className="py-3 px-4">Mention du Conseil</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents
                .sort((a, b) => (b.generalAverage || 14) - (a.generalAverage || 14))
                .map((s, idx) => {
                  const avg = s.generalAverage || (15.5 - idx * 0.4);
                  let mention = 'Félicitations du Conseil';
                  let mentionColor = 'text-green-700 bg-green-50 border-green-200';
                  if (avg < 14 && avg >= 12) {
                    mention = 'Tableau d\'Honneur';
                    mentionColor = 'text-blue-700 bg-blue-50 border-blue-200';
                  } else if (avg < 12 && avg >= 10) {
                    mention = 'Encouragements';
                    mentionColor = 'text-amber-700 bg-amber-50 border-amber-200';
                  } else if (avg < 10) {
                    mention = 'Avertissement Travail';
                    mentionColor = 'text-red-700 bg-red-50 border-red-200';
                  }

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className={`w-7 h-7 rounded-full font-semibold flex items-center justify-center text-xs shadow-2xs ${
                          idx === 0
                            ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-300'
                            : idx === 1
                            ? 'bg-slate-200 text-slate-800'
                            : idx === 2
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{s.lastName} {s.firstName}</div>
                        <div className="text-[10px] text-slate-400 font-medium">Né(e) le {s.birthDate || '12/04/2010'}</div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                        {s.matricule}
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-700 font-medium">{s.parentName}</div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Smartphone className="w-2.5 h-2.5 text-blue-500" />
                          <span>{s.parentPhone}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`text-base font-semibold px-2.5 py-1 rounded-lg ${
                          avg >= 14
                            ? 'text-green-700 bg-green-50'
                            : avg >= 10
                            ? 'text-blue-700 bg-blue-50'
                            : 'text-red-700 bg-red-50'
                        }`}>
                          {avg.toFixed(2)}/20
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${mentionColor}`}>
                          {mention}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal('bulletin_view', { student: s, avg, rank: idx + 1, mention, term: selectedTerm })}
                            className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Voir le Bulletin Officiel</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

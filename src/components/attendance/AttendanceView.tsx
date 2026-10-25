import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserCheck, Users, Clock, AlertCircle, CheckCircle2,
  Send, FileText, Calendar, Smartphone, ShieldCheck
} from 'lucide-react';
import { AttendanceRecord } from '../../types';

export const AttendanceView: React.FC = () => {
  const { classes, students, school, saveAttendanceBatch, showToast } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'cls_3a');
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-25');
  const [period, setPeriod] = useState<'MATIN' | 'APRES_MIDI'>('MATIN');
  const [autoSendSms, setAutoSendSms] = useState<boolean>(true);

  // Filter students for the selected class
  const classStudents = students.filter(s => s.classId === selectedClassId);

  // Local attendance state mapping: studentId -> status
  const [statusMap, setStatusMap] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'RETARD' | 'JUSTIFIE'>>(() => {
    const initial: Record<string, 'PRESENT' | 'ABSENT' | 'RETARD' | 'JUSTIFIE'> = {};
    classStudents.forEach(s => {
      initial[s.id] = 'PRESENT';
    });
    return initial;
  });

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'RETARD' | 'JUSTIFIE') => {
    setStatusMap(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const markAllPresent = () => {
    const updated: Record<string, 'PRESENT' | 'ABSENT' | 'RETARD' | 'JUSTIFIE'> = {};
    classStudents.forEach(s => {
      updated[s.id] = 'PRESENT';
    });
    setStatusMap(updated);
    showToast('Tous les élèves ont été marqués Présents', 'info');
  };

  const handleSaveAttendance = () => {
    const selectedClass = classes.find(c => c.id === selectedClassId);
    const records: Omit<AttendanceRecord, 'id' | 'smsSent' | 'recordedByTeacher'>[] = classStudents.map(s => ({
      studentId: s.id,
      studentName: `${s.firstName} ${s.lastName}`,
      classId: selectedClassId,
      className: selectedClass?.name || '3e A',
      date: selectedDate,
      period,
      status: statusMap[s.id] || 'PRESENT',
      arrivalTime: statusMap[s.id] === 'RETARD' ? '08h20' : undefined,
    }));

    saveAttendanceBatch(records, autoSendSms);
  };

  // Count stats
  const presentCount = classStudents.filter(s => (statusMap[s.id] || 'PRESENT') === 'PRESENT').length;
  const absentCount = classStudents.filter(s => statusMap[s.id] === 'ABSENT').length;
  const lateCount = classStudents.filter(s => statusMap[s.id] === 'RETARD').length;
  const justifiedCount = classStudents.filter(s => statusMap[s.id] === 'JUSTIFIE').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Faire l'Appel & Gestion des Présences</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
              Session Quotidienne
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Validation rapide sur mobile/tablette et notification SMS instantanée aux parents
          </p>
        </div>

        <button
          type="button"
          onClick={markAllPresent}
          className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
        >
           Marquer tout le monde Présent
        </button>
      </div>

      {/* Control Bar: Class, Date, Period, SMS Auto toggle */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Select */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Classe</label>
            <select
              aria-label="Classe pour l'appel"
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                const updated: Record<string, 'PRESENT' | 'ABSENT' | 'RETARD' | 'JUSTIFIE'> = {};
                students.filter(s => s.classId === e.target.value).forEach(s => {
                  updated[s.id] = 'PRESENT';
                });
                setStatusMap(updated);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-blue-700 focus:outline-none"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({students.filter(s => s.classId === c.id).length} élèves)</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
            />
          </div>

          {/* Period */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Créneau</label>
            <select
              aria-label="Créneau horaire"
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="MATIN">Matinée (08h00 - 12h00)</option>
              <option value="APRES_MIDI">Après-midi (14h00 - 18h00)</option>
            </select>
          </div>
        </div>

        {/* SMS Auto-send toggle */}
        <div className="flex items-center gap-3 bg-blue-50/80 px-3.5 py-2 rounded-xl border border-blue-200/70">
          <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="text-left">
            <div className="text-xs font-bold text-blue-900">SMS automatique aux parents</div>
            <div className="text-[10px] text-blue-700">Envoie un SMS immédiat si absent ou en retard</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-2">
            <input
              type="checkbox"
              checked={autoSendSms}
              onChange={(e) => setAutoSendSms(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Summary counters */}
      <div className="grid grid-cols-4 gap-3 text-center">
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Présents</div>
          <div className="text-xl font-bold text-green-600 mt-0.5">{presentCount}</div>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Absents</div>
          <div className="text-xl font-bold text-red-600 mt-0.5">{absentCount}</div>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Retards</div>
          <div className="text-xl font-bold text-amber-600 mt-0.5">{lateCount}</div>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Justifiés</div>
          <div className="text-xl font-bold text-blue-600 mt-0.5">{justifiedCount}</div>
        </div>
      </div>

      {/* Roll Call Matrix (Table / Mobile cards) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Élève</th>
                <th className="py-3 px-4">Parent Référent (SMS)</th>
                <th className="py-3 px-4 text-center">Statut de Présence</th>
                <th className="py-3 px-4 text-right">Alerte SMS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((s, idx) => {
                const currentStatus = statusMap[s.id] || 'PRESENT';

                return (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-mono text-[11px] w-5">{idx + 1}.</span>
                        <div>
                          <div className="font-bold text-slate-900">{s.lastName} {s.firstName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{s.matricule}</div>
                        </div>
                      </div>
                    </td>

                    {/* Parent SMS info */}
                    <td className="py-3 px-4">
                      <div className="text-slate-700 font-medium">{s.parentName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{s.parentPhone}</div>
                    </td>

                    {/* Status Pill Buttons */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.id, 'PRESENT')}
                          className={`py-1.5 px-3 rounded-xl font-bold text-xs transition-all ${
                            currentStatus === 'PRESENT'
                              ? 'bg-green-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Présent
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.id, 'ABSENT')}
                          className={`py-1.5 px-3 rounded-xl font-bold text-xs transition-all ${
                            currentStatus === 'ABSENT'
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Absent
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.id, 'RETARD')}
                          className={`py-1.5 px-3 rounded-xl font-bold text-xs transition-all ${
                            currentStatus === 'RETARD'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Retard
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.id, 'JUSTIFIE')}
                          className={`py-1.5 px-3 rounded-xl font-bold text-xs transition-all ${
                            currentStatus === 'JUSTIFIE'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Justifié
                        </button>
                      </div>
                    </td>

                    {/* SMS Preview Trigger */}
                    <td className="py-3 px-4 text-right">
                      {currentStatus === 'ABSENT' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          <Send className="w-3 h-3" />
                          <span>SMS d'absence prêt</span>
                        </span>
                      ) : currentStatus === 'RETARD' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Send className="w-3 h-3" />
                          <span>SMS retard prêt</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Aucun SMS requis</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Save Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            <strong>{absentCount} absents</strong> et <strong>{lateCount} retards</strong> détectés pour cette session.
          </div>

          <button
            id="btn-save-attendance-submit"
            onClick={handleSaveAttendance}
            className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Valider l'Appel & {autoSendSms ? 'Diffuser les SMS' : 'Enregistrer'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

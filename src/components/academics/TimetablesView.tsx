import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar, Clock, Plus, Trash2, Edit3, Printer,
  BookOpen, GraduationCap, MapPin, FileText, CheckCircle2,
  AlertCircle, X, ChevronRight, Download, Filter, Eye
} from 'lucide-react';
import { TimetableSlot } from '../../types';

export const TimetablesView: React.FC = () => {
  const {
    classes,
    subjects,
    users,
    timetable,
    addTimetableSlot,
    deleteTimetableSlot,
    generateDefaultScheduleForClass,
    school,
    academicYear,
    showToast
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'cls_3a');
  const [activeTab, setActiveTab] = useState<'GRID' | 'ALL_CLASSES'>('GRID');
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterTeacherId, setFilterTeacherId] = useState<string>('ALL');

  // Modal form state
  const [dayOfWeek, setDayOfWeek] = useState<'LUNDI' | 'MARDI' | 'MERCREDI' | 'JEUDI' | 'VENDREDI' | 'SAMEDI'>('LUNDI');
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('09:30');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || 'sub_maths');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('usr_prof_04');
  const [room, setRoom] = useState('Salle 301');

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const teachers = users.filter(u => u.role === 'ENSEIGNANT' || u.role === 'DIRECTEUR');

  const days: ('LUNDI' | 'MARDI' | 'MERCREDI' | 'JEUDI' | 'VENDREDI' | 'SAMEDI')[] = [
    'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'
  ];

  const timeBlocks = [
    { label: '07h30 - 09h30', start: '07:30', end: '09:30' },
    { label: '09h45 - 11h45', start: '09:45', end: '11:45' },
    { label: '12h00 - 13h30', start: '12:00', end: '13:30', isBreak: true },
    { label: '13h30 - 15h30', start: '13:30', end: '15:30' },
    { label: '15h45 - 17h45', start: '15:45', end: '17:45' },
  ];

  // Filter slots for current class or current teacher
  const classSlots = timetable.filter(slot => {
    if (filterTeacherId !== 'ALL' && slot.teacherId !== filterTeacherId) return false;
    return slot.classId === selectedClassId;
  });

  const getSubjectColor = (subjectName: string) => {
    const s = subjectName.toLowerCase();
    if (s.includes('math')) return 'bg-blue-50 border-blue-200 text-blue-900 ring-blue-500/20';
    if (s.includes('fran')) return 'bg-blue-50 border-blue-200 text-blue-900 ring-blue-500/20';
    if (s.includes('phys') || s.includes('pc')) return 'bg-amber-50 border-amber-200 text-amber-900 ring-amber-500/20';
    if (s.includes('svt') || s.includes('bio')) return 'bg-green-50 border-green-200 text-green-900 ring-green-500/20';
    if (s.includes('anglais')) return 'bg-blue-50 border-blue-200 text-blue-900 ring-blue-500/20';
    if (s.includes('hist') || s.includes('géo') || s.includes('hg')) return 'bg-amber-50 border-amber-200 text-amber-900 ring-amber-500/20';
    if (s.includes('eps') || s.includes('sport')) return 'bg-red-50 border-red-200 text-red-900 ring-red-500/20';
    if (s.includes('philo')) return 'bg-blue-50 border-blue-200 text-blue-900 ring-blue-500/20';
    if (s.includes('info')) return 'bg-green-50 border-green-200 text-green-900 ring-green-500/20';
    return 'bg-slate-50 border-slate-200 text-slate-900 ring-slate-400/20';
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    const sub = subjects.find(s => s.id === selectedSubjectId);
    const teacher = users.find(u => u.id === selectedTeacherId);

    addTimetableSlot({
      classId: selectedClass.id,
      className: selectedClass.name,
      subjectId: selectedSubjectId,
      subjectName: sub?.name || 'Matière',
      teacherId: selectedTeacherId,
      teacherName: teacher?.name || 'Professeur',
      dayOfWeek,
      startTime,
      endTime,
      room: room.trim() || selectedClass.roomNumber || 'Salle de classe',
    });

    setShowAddModal(false);
  };

  const handleGenerateTemplate = () => {
    if (!selectedClass) return;
    generateDefaultScheduleForClass(selectedClass.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Emplois du Temps des Classes</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Année {academicYear}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Planification hebdomadaire des cours, salles et professeurs de la 6e à la Terminale
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => window.print()}
            className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors print:hidden"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>Imprimer l'Emploi du Temps</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors print:hidden"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un Créneau</span>
          </button>
        </div>
      </div>

      {/* Selector Controls Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Select */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Classe</label>
            <select
              aria-label="Sélectionner la classe pour l'emploi du temps"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-blue-700 focus:outline-none cursor-pointer"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.level === 'LYCEE' ? 'Lycée' : 'Collège'} • {c.studentCount} élèves)
                </option>
              ))}
            </select>
          </div>

          {/* Teacher Filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Filtrer par Professeur</label>
            <select
              aria-label="Filtrer par enseignant"
              value={filterTeacherId}
              onChange={(e) => setFilterTeacherId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tous les professeurs</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action button: Autofill standard schedule */}
        <div className="flex items-center gap-2">
          {classSlots.length === 0 ? (
            <button
              onClick={handleGenerateTemplate}
              className="py-1.5 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Générer un emploi du temps type</span>
            </button>
          ) : (
            <button
              onClick={handleGenerateTemplate}
              className="py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200 transition-colors"
              title="Réinitialiser avec la grille horaire type"
            >
              <span>Réinitialiser la grille type</span>
            </button>
          )}

          <div className="text-right pl-3 border-l border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Volume Horaire</span>
            <span className="text-xs font-extrabold text-blue-700">
              {classSlots.length * 2} heures / semaine
            </span>
          </div>
        </div>
      </div>

      {/* Official Timetable Display Grid */}
      <div id="printable-timetable" className="bg-white rounded-lg p-6 border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Printable Header (Visible only on print or top) */}
        <div className="border-b border-slate-200 pb-4 mb-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-700 flex items-center justify-center font-semibold text-sm">
                {selectedClass?.name.substring(0, 2) || '3e'}
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 uppercase">
                  Emploi du Temps — Classe de {selectedClass?.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {school.name} • Prof. Principal : {selectedClass?.mainTeacherName || 'M. TOURE'} • Salle habituelle : {selectedClass?.roomNumber || 'Salle 301'}
                </p>
              </div>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-mono text-slate-500 font-bold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              Année Scolaire {academicYear}
            </span>
          </div>
        </div>

        {/* Days Column View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {days.map((day) => {
            const daySlots = classSlots.filter(s => s.dayOfWeek === day);
            const isWednesday = day === 'MERCREDI';
            const isSaturday = day === 'SAMEDI';

            return (
              <div
                key={day}
                className="bg-slate-50/70 rounded-2xl border border-slate-200/70 p-3 flex flex-col justify-between min-h-[480px]"
              >
                <div>
                  {/* Day Header */}
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                      {day}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white text-slate-500 border border-slate-200">
                      {daySlots.length} cours
                    </span>
                  </div>

                  {/* Day Slots List */}
                  <div className="space-y-2.5">
                    {daySlots.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-[11px] text-slate-400 italic">
                        {isSaturday ? 'Pas de cours le samedi' : isWednesday ? 'Après-midi libre' : 'Aucun cours configuré'}
                      </div>
                    ) : (
                      daySlots
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((slot) => {
                          const colorClasses = getSubjectColor(slot.subjectName);

                          return (
                            <div
                              key={slot.id}
                              className={`p-3 rounded-xl border transition-all relative group shadow-2xs ${colorClasses}`}
                            >
                              {/* Time range */}
                              <div className="flex items-center justify-between text-[10px] font-bold mb-1 opacity-80">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {slot.startTime} - {slot.endTime}
                                </span>

                                {/* Delete button on hover */}
                                <button
                                  onClick={() => deleteTimetableSlot(slot.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition-opacity print:hidden"
                                  title="Supprimer ce créneau"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Subject */}
                              <h4 className="text-xs font-semibold tracking-tight leading-tight mb-1">
                                {slot.subjectName}
                              </h4>

                              {/* Teacher and Room */}
                              <div className="space-y-0.5 text-[10px] opacity-90">
                                <div className="flex items-center gap-1 font-medium truncate">
                                  <GraduationCap className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{slot.teacherName}</span>
                                </div>
                                <div className="flex items-center gap-1 font-mono text-[9px] truncate">
                                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate">{slot.room}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

                {/* Quick Add Button at the bottom of the day */}
                <button
                  onClick={() => {
                    setDayOfWeek(day);
                    setShowAddModal(true);
                  }}
                  className="mt-3 w-full py-1.5 rounded-xl border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-[11px] font-semibold text-slate-500 hover:text-blue-700 flex items-center justify-center gap-1 transition-colors print:hidden"
                >
                  <Plus className="w-3 h-3" />
                  <span>Ajouter créneau</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Timetable Legend & Stamp for Print */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-bold uppercase text-slate-400">Légende :</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Sciences & Maths
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Lettres & Langues
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Histoire-Géo & EDHC
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> EPS / Sport
            </span>
          </div>

          <div className="text-[10px] font-medium text-slate-400 text-right">
            Horaires d'ouverture : 07h30 - 17h45 • Pause méridienne : 12h00 - 13h30
          </div>
        </div>
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto duration-150">
          <div className="bg-white rounded-lg max-w-md w-full shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#0B1527] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Nouveau Créneau Horaire</h3>
                  <p className="text-[11px] text-slate-400">Classe : {selectedClass?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddSlot} className="p-5 space-y-4 text-xs">
              {/* Day of Week */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Jour de la Semaine</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {days.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Heure de Début</label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="07:30">07:30</option>
                    <option value="08:00">08:00</option>
                    <option value="09:45">09:45</option>
                    <option value="10:00">10:00</option>
                    <option value="10:15">10:15</option>
                    <option value="13:30">13:30</option>
                    <option value="14:00">14:00</option>
                    <option value="15:45">15:45</option>
                    <option value="16:00">16:00</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Heure de Fin</label>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="09:30">09:30</option>
                    <option value="10:00">10:00</option>
                    <option value="11:45">11:45</option>
                    <option value="12:00">12:00</option>
                    <option value="12:15">12:15</option>
                    <option value="15:30">15:30</option>
                    <option value="16:00">16:00</option>
                    <option value="17:45">17:45</option>
                    <option value="18:00">18:00</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Matière / Discipline</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Coef. {s.coefficient})</option>
                  ))}
                </select>
              </div>

              {/* Teacher */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Enseignant Responsable</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.title || 'Professeur'})</option>
                  ))}
                </select>
              </div>

              {/* Room */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Salle de Classe / Laboratoire</label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="ex: Bâtiment B - Salle 301, Labo SVT..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer le créneau</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X, UserPlus, Users, FileText, CheckCircle2,
  Building, GraduationCap, ArrowRight, RefreshCw,
  Check, Filter, ShieldCheck, DollarSign
} from 'lucide-react';
import { formatFCFA } from '../../utils/formatters';

interface BulkEnrollStudentsModalProps {
  onClose: () => void;
}

export const BulkEnrollStudentsModal: React.FC<BulkEnrollStudentsModalProps> = ({ onClose }) => {
  const { classes, school, populateStudentsForAllClasses, showToast } = useApp();

  const [studentsPerClass, setStudentsPerClass] = useState<number>(8);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(() => classes.map(c => c.id));
  const [replaceExisting, setReplaceExisting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const totalSelectedClasses = selectedClassIds.length;
  const totalEstimatedStudents = totalSelectedClasses * studentsPerClass;

  const handleToggleSelectAll = () => {
    if (selectedClassIds.length === classes.length) {
      setSelectedClassIds([]);
    } else {
      setSelectedClassIds(classes.map(c => c.id));
    }
  };

  const handleToggleClass = (id: string) => {
    setSelectedClassIds(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleConfirmEnrollment = () => {
    if (selectedClassIds.length === 0) {
      showToast('Veuillez sélectionner au moins une classe pour l\'inscription', 'warning');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      populateStudentsForAllClasses(studentsPerClass, replaceExisting, selectedClassIds);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-3 sm:p-5 overflow-y-auto duration-150 font-sans">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-blue-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-700 shadow-inner">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold tracking-tight">
                  Inscription Automatique des Élèves
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/30 text-green-200 border border-green-400/30">
                  Toutes les Classes
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Inscrivez automatiquement des cohortes d'élèves ivoiriens complets (matricules, parents, frais, notes) dans vos classes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 text-xs text-slate-700">
          
          {/* Step 1: Count per class */}
          <div className="space-y-2">
            <label className="text-slate-800 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <span>1. Nombre d'élèves à inscrire par classe</span>
              <FileText className="w-3.5 h-3.5 text-amber-500" />
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[5, 8, 12, 20].map(count => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setStudentsPerClass(count)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    studentsPerClass === count
                      ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-lg font-semibold text-slate-900">{count}</span>
                  <span className="text-[10px] text-slate-500">élèves / classe</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Classes selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-800 font-bold uppercase text-[10px] tracking-wider">
                2. Classes ciblées ({selectedClassIds.length} / {classes.length})
              </label>
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="text-blue-600 hover:text-blue-800 font-bold text-[11px] underline cursor-pointer"
              >
                {selectedClassIds.length === classes.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
              {classes.map(c => {
                const isSelected = selectedClassIds.includes(c.id);
                return (
                  <label
                    key={c.id}
                    onClick={() => handleToggleClass(c.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white border-blue-300 text-blue-900 font-bold shadow-2xs'
                        : 'bg-slate-100/60 border-slate-200 text-slate-500 opacity-60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded cursor-pointer"
                    />
                    <div className="truncate">
                      <div className="text-xs">{c.name}</div>
                      <div className="text-[9px] text-slate-400 font-normal">{c.level}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Generated Data Highlights */}
          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 space-y-2">
            <div className="font-bold text-blue-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Ce qui sera automatiquement généré pour chaque élève :</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-blue-800">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                <span>Matricule (ex : CI-2026-...)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                <span>Fiche parent & numéros Orange / MTN / Moov</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                <span>Frais de scolarité & reçus de versement</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                <span>Moyennes générales & rangs pour les bulletins</span>
              </li>
            </ul>
          </div>

          {/* Summary bar */}
          <div className="p-4 rounded-2xl bg-blue-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-slate-300">Total à inscrire :</div>
              <div className="text-xl font-semibold text-white">
                {totalEstimatedStudents} élèves inscrits
              </div>
              <div className="text-[10px] text-green-700 mt-0.5">
                Dans {totalSelectedClasses} classes • Établissement : {school.name}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmEnrollment}
                disabled={isSubmitting || totalEstimatedStudents === 0}
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Inscription en cours...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Inscrire les {totalEstimatedStudents} élèves en 1 Clic</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

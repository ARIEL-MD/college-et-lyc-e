import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X, FileSpreadsheet, Upload, Download, CheckCircle2,
  AlertCircle, FileText
} from 'lucide-react';

interface ExcelImportModalProps {
  onClose: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ onClose }) => {
  const { showToast } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const handleSimulateImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setImportedCount(28);
      showToast('28 élèves importés avec succès depuis le fichier Excel !', 'success');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto duration-150">
      <div className="bg-white rounded-lg max-w-lg w-full shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Importation d'Élèves par Fichier Excel (.xlsx / .csv)</h3>
              <p className="text-xs text-green-200">Import en masse avec numéros SMS des parents</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Instructions */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="font-bold text-slate-800 flex items-center justify-between">
              <span>Modèle de fichier Excel recommandé :</span>
              <button
                type="button"
                onClick={() => showToast('Téléchargement du modèle Excel_Eleves_CI.xlsx...', 'info')}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger le canevas</span>
              </button>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Le fichier doit contenir les colonnes : <code>Nom</code>, <code>Prénoms</code>, <code>Matricule</code>, <code>Classe</code>, <code>Nom_Parent</code>, <code>Telephone_SMS_Parent</code> (+225 obligatoire).
            </p>
          </div>

          {/* Upload Dropzone */}
          <div
            onClick={handleSimulateImport}
            className="border-2 border-dashed border-slate-300 hover:border-green-500 rounded-lg p-8 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-green-50/20 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <div className="font-bold text-slate-800 text-sm">
              Glissez votre fichier Excel ici ou cliquez pour parcourir
            </div>
            <p className="text-slate-400 text-[11px] mt-1">
              Prend en charge .XLSX, .XLS, .CSV (Jusqu'à 5 000 élèves par lot)
            </p>
          </div>

          {importedCount && (
            <div className="p-3 bg-green-50 rounded-xl border border-green-200 text-green-900 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>{importedCount} élèves et fiches parents importés avec succès !</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

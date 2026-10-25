import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings, Smartphone, Zap, ShieldCheck, CheckCircle2,
  Server, Key, RefreshCw, Send, AlertTriangle, FileText
} from 'lucide-react';
import { formatFCFA } from '../../utils/formatters';

export const SmsSettingsView: React.FC = () => {
  const { school, updateSchoolInfo, showToast } = useApp();

  const [senderId, setSenderId] = useState(school.smsSenderId);
  const [provider, setProvider] = useState<'ORANGE_CI' | 'MTN_CI' | 'INFOBIP' | 'CUSTOM'>('ORANGE_CI');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('••••••••••••••••••••');

  // Automation toggles
  const [autoAbsence, setAutoAbsence] = useState(true);
  const [autoLate, setAutoLate] = useState(true);
  const [autoReceipt, setAutoReceipt] = useState(true);
  const [autoEnrollment, setAutoEnrollment] = useState(true);
  const [autoBulletin, setAutoBulletin] = useState(true);
  const [autoUnpaidSchedule, setAutoUnpaidSchedule] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolInfo({
      smsSenderId: senderId
    });
    showToast('Paramètres SMS enregistrés.', 'success');
  };

  const handleTestGateway = () => {
    showToast("Test indisponible : la passerelle SMS n'est pas encore connectée.", 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Passerelle SMS & Déclencheurs Automatiques</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
              Non connectée
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configuration des envois automatisés et des connecteurs opérateurs Orange, MTN et Moov
          </p>
        </div>

        <button
          type="button"
          onClick={handleTestGateway}
          className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Tester la connectivité Passerelle</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Automations */}
        <div className="bg-white rounded-lg p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Déclencheurs Automatiques d'Événements</h3>
            <p className="text-xs text-slate-500">
              Ces événements envoient instantanément un SMS au parent sans aucune intervention manuelle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Auto 1 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Alerte Absence en temps réel</div>
                <p className="text-[11px] text-slate-500">Dès que l'enseignant valide l'appel de classe</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={autoAbsence} onChange={(e) => setAutoAbsence(e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Auto 2 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Reçu de Paiement Électronique</div>
                <p className="text-[11px] text-slate-500">Dès l'enregistrement d'un versement à la caisse</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={autoReceipt} onChange={(e) => setAutoReceipt(e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Auto 3 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Confirmation d'Inscription</div>
                <p className="text-[11px] text-slate-500">Avec matricule et numéro de dossier</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={autoEnrollment} onChange={(e) => setAutoEnrollment(e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Auto 4 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Relance Programmée des Impayés</div>
                <p className="text-[11px] text-slate-500">Chaque 1er et 15 du mois aux parents débiteurs</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={autoUnpaidSchedule} onChange={(e) => setAutoUnpaidSchedule(e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: Gateway Telecom API */}
        <div className="bg-white rounded-lg p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Configuration Passerelle Télécom & Sender ID</h3>
            <p className="text-xs text-slate-500">
              L'expéditeur alphanumérique qui apparaît sur l'écran du parent (11 caractères max)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nom d'Expéditeur SMS (Sender ID)</label>
              <input
                type="text"
                maxLength={11}
                value={senderId}
                onChange={(e) => setSenderId(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold uppercase text-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Déclaré auprès de l'ARTCI (Ex: REUSSITE)</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Passerelle Opérateur Principal</label>
              <select
                aria-label="Passerelle opérateur principal"
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="ORANGE_CI">Orange Côte d'Ivoire SMS API (Direct Route)</option>
                <option value="MTN_CI">MTN Business CI SMS Gateway</option>
                <option value="INFOBIP">Infobip Côte d'Ivoire</option>
                <option value="CUSTOM">Passerelle SMPP Dédiée</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Clé API (Client ID)</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Secret API (Client Secret)</label>
              <input
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              Enregistrer la Configuration Passerelle
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

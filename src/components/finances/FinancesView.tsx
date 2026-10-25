import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wallet, CreditCard, ArrowUpRight, ArrowDownRight,
  Download, Printer, Plus, FileSpreadsheet, PieChart as PieIcon,
  TrendingUp, CheckCircle, ShieldAlert, FileText
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { formatFCFA } from '../../utils/formatters';

export const FinancesView: React.FC = () => {
  const { school, payments, students, openModal } = useApp();

  const [periodFilter, setPeriodFilter] = useState<'ANNEE' | 'MOIS' | 'TRIMESTRE'>('MOIS');

  // Monthly collection comparison data
  const monthlyData = [
    { month: 'Sept', encaisse: 12500000, objectif: 15000000 },
    { month: 'Oct', encaisse: 9200000, objectif: 10000000 },
    { month: 'Nov', encaisse: 8100000, objectif: 9000000 },
    { month: 'Déc', encaisse: 6500000, objectif: 7000000 },
    { month: 'Janv', encaisse: 11000000, objectif: 12000000 },
    { month: 'Févr', encaisse: 7800000, objectif: 8000000 },
    { month: 'Mars', encaisse: 6900000, objectif: 7500000 },
    { month: 'Avril', encaisse: 5400000, objectif: 6000000 },
    { month: 'Mai', encaisse: 4200000, objectif: 5000000 },
    { month: 'Août', encaisse: 8450000, objectif: 9000000 },
  ];

  // Channels distribution
  const channelData = [
    { name: 'Espèces (Caisse)', value: 4500000, color: '#3B82F6' },
    { name: 'Wave CI', value: 2150000, color: '#06B6D4' },
    { name: 'Orange Money', value: 1200000, color: '#F97316' },
    { name: 'MTN MoMo', value: 600000, color: '#EAB308' },
  ];

  const totalCollectedAllTime = payments.reduce((sum, p) => sum + p.amount, 0) + 70000000;
  const totalUnpaidGlobal = students.reduce((sum, s) => sum + s.unpaidTuition, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Rapport & Analyse Financière</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
              Exercice 2025-2026
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi des recettes, ventilation des encaissements par opérateur et plan de trésorerie
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>Imprimer Bilan</span>
          </button>
          <button
            onClick={() => openModal('record_payment')}
            className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel Encaissement</span>
          </button>
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Recettes Totales Cumulées</div>
          <div className="text-2xl font-semibold text-slate-900 mt-1">{formatFCFA(totalCollectedAllTime)}</div>
          <div className="text-[11px] text-green-600 font-semibold mt-0.5 flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+ 14.8% vs année N-1</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Encaissements du mois en cours</div>
          <div className="text-2xl font-semibold text-green-600 mt-1">8 450 000 FCFA</div>
          <div className="text-[11px] text-slate-500 mt-0.5">93.8% de l'objectif mensuel</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Créances & Impayés Actuels</div>
            <div className="text-2xl font-semibold text-red-600 mt-1">{formatFCFA(totalUnpaidGlobal)}</div>
            <div className="text-[11px] text-red-600 font-semibold mt-0.5">{students.filter(s => s.unpaidTuition > 0).length} familles en impayé</div>
          </div>
          <button
            onClick={() => openModal('bulk_sms_unpaid')}
            className="mt-3 py-1.5 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold flex items-center justify-center gap-1.5 border border-red-200 transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Lancer la Relance SMS Groupée</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Solde Caisse & Comptes Mobile</div>
          <div className="text-2xl font-semibold text-blue-600 mt-1">6 120 000 FCFA</div>
          <div className="text-[11px] text-blue-600 font-medium mt-0.5">Trésorerie disponible</div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Trend Bar Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Évolution mensuelle des encaissements</h3>
              <p className="text-xs text-slate-500">Comparatif Réalisé vs Prévisionnel</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  tickFormatter={(val) => `${val / 1000000}M`}
                />
                <Tooltip
                  formatter={(value: any) => [`${formatFCFA(Number(value))}`, 'FCFA']}
                  contentStyle={{ backgroundColor: '#0B1527', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="encaisse" name="Encaissé" fill="#2563EB" radius={[6, 6, 0, 0]} />
                <Bar dataKey="objectif" name="Prévisionnel" fill="#E2E8F0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channels Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Modes de règlement</h3>
            <p className="text-xs text-slate-500">Part du Mobile Money vs Espèces</p>
          </div>

          <div className="h-44 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  innerRadius={36}
                  outerRadius={58}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {channelData.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{formatFCFA(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

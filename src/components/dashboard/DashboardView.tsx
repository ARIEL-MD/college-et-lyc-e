import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users, CheckCircle, Wallet, AlertTriangle, MessageSquare,
  ChevronRight, ArrowUpRight, Plus, UserPlus, CreditCard,
  UserCheck, FileEdit, FileText, Send, BarChart3, AlertCircle,
  Clock, ShieldAlert, Star
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { formatFCFA } from '../../utils/formatters';

export const DashboardView: React.FC = () => {
  const {
    school,
    students,
    payments,
    currentRole,
    setCurrentView,
    openModal,
    smsMessages
  } = useApp();

  const [timeFilter, setTimeFilter] = useState<'Ce mois' | 'Cette semaine' | 'Cette année'>('Ce mois');

  const totalStudents = students.length;
  const totalEncaissé = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalUnpaid = students.reduce((sum, s) => sum + (s.unpaidTuition || 0), 0);
  const totalSms = smsMessages.length;

  // Revenue chart data
  const revenueTrendData = [
    { day: '01', amount: Math.round(totalEncaissé * 0.1) },
    { day: '04', amount: Math.round(totalEncaissé * 0.2) },
    { day: '08', amount: Math.round(totalEncaissé * 0.35) },
    { day: '12', amount: Math.round(totalEncaissé * 0.5) },
    { day: '16', amount: Math.round(totalEncaissé * 0.65) },
    { day: '20', amount: Math.round(totalEncaissé * 0.8) },
    { day: '24', amount: Math.round(totalEncaissé * 0.9) },
    { day: '28', amount: totalEncaissé },
  ];

  // Revenue distribution
  const revenueDistribution = [
    { name: 'Scolarité', value: Math.round(totalEncaissé * 0.75) || 1, percentage: '75%', color: '#3B82F6' },
    { name: 'Inscription', value: Math.round(totalEncaissé * 0.15) || 1, percentage: '15%', color: '#10B981' },
    { name: 'Cantine', value: Math.round(totalEncaissé * 0.07) || 1, percentage: '7%', color: '#F59E0B' },
    { name: 'Autres frais', value: Math.round(totalEncaissé * 0.03) || 1, percentage: '3%', color: '#8B5CF6' },
  ];

  // Unpaid by class data
  const unpaidByClass = [
    { class: 'Terminale D', count: 28, amount: 850000, classId: 'cls_tled' },
    { class: '3e A', count: 24, amount: 420000, classId: 'cls_3a' },
    { class: '1ère C', count: 18, amount: 310000, classId: 'cls_1c' },
    { class: '2nde A', count: 15, amount: 250000, classId: 'cls_2a' },
    { class: '6e B', count: 12, amount: 180000, classId: 'cls_6b' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Greeting & Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Bonjour, {currentRole === 'DIRECTEUR' ? 'Directeur' : currentRole === 'COMPTABLE' ? 'Mme la Comptable' : currentRole === 'ADMIN' ? 'M. l\'Administrateur' : currentRole === 'ENSEIGNANT' ? 'Cher Professeur' : 'Super Admin'}</span>
            <span></span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Mardi 25 août 2026 — <span className="text-blue-700 font-semibold">{school.name}</span>
          </p>
        </div>

        {/* SMS Core value reminder banner */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-xs text-blue-900">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          <span className="font-bold">Système SMS Parents Actif</span>
          <span className="text-slate-400">|</span>
          <span className="text-blue-700 font-medium">Aucune application requise pour les parents</span>
        </div>
      </div>

      {/* 5 Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* CARD 1: Élèves */}
        <div
          id="stat-card-students"
          onClick={() => setCurrentView('students')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3.5 mb-2.5">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{totalStudents}</div>
              <div className="text-xs font-medium text-slate-500">Élèves inscrits</div>
            </div>
          </div>
          <div className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
            <span>{school.shortCode}</span>
          </div>
        </div>

        {/* CARD 2: Présents */}
        <div
          id="stat-card-attendance"
          onClick={() => setCurrentView('attendance')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3.5 mb-2.5">
            <div className="w-11 h-11 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{totalStudents > 0 ? totalStudents : 0}</div>
              <div className="text-xs font-medium text-slate-500">Pointage présence</div>
            </div>
          </div>
          <div className="text-[11px] font-semibold text-green-600">
            Assiduité & Vie scolaire
          </div>
        </div>

        {/* CARD 3: Encaissé */}
        <div
          id="stat-card-revenue"
          onClick={() => setCurrentView('payments')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3.5 mb-2.5">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 tracking-tight">{formatFCFA(totalEncaissé)}</div>
              <div className="text-xs font-medium text-slate-500">Total encaissé</div>
            </div>
          </div>
          <div className="text-[11px] font-semibold text-blue-600 flex items-center gap-0.5">
            <span>Versements & Reçus</span>
          </div>
        </div>

        {/* CARD 4: À recouvrer */}
        <div
          id="stat-card-unpaid"
          onClick={() => setCurrentView('unpaid')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3.5 mb-2.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 tracking-tight">{formatFCFA(totalUnpaid)}</div>
              <div className="text-xs font-medium text-slate-500">FCFA à recouvrer</div>
            </div>
          </div>
          <div className="text-[11px] font-semibold text-amber-600">
            Relances SMS disponibles
          </div>
        </div>

        {/* CARD 5: SMS */}
        <div
          id="stat-card-sms"
          onClick={() => setCurrentView('sms')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3.5 mb-2.5">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{totalSms}</div>
              <div className="text-xs font-medium text-slate-500">SMS envoyés</div>
            </div>
          </div>
          <div className="text-[11px] font-medium text-slate-500">
            <span className="text-green-600 font-semibold">{totalSms} livrés</span>
          </div>
        </div>
      </div>

      {/* Mid Row: Charts & Important Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Évolution des recettes (Area chart) - 5 cols */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Évolution des recettes</h3>
              <p className="text-xs text-slate-500">Total cumulé encaissé sur la période</p>
            </div>
            <select
              aria-label="Filtrer la période d'évolution des recettes"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-medium text-slate-700 focus:outline-none"
            >
              <option value="Ce mois">Ce mois</option>
              <option value="Cette semaine">Cette semaine</option>
              <option value="Cette année">Cette année</option>
            </select>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  tickFormatter={(val) => `${val / 1000000}M`}
                />
                <Tooltip
                  formatter={(value: any) => [`${formatFCFA(Number(value))}`, 'Recettes']}
                  labelFormatter={(label) => `Jour ${label} août 2026`}
                  contentStyle={{ backgroundColor: '#0B1527', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#60A5FA' }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#2563EB"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="font-medium">Total au 25 août :</span>
            <span className="font-extrabold text-blue-600 text-sm">8 450 000 FCFA</span>
          </div>
        </div>

        {/* Répartition des recettes (Donut chart) - 4 cols */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-base font-bold text-slate-900">Répartition des recettes</h3>
            <p className="text-xs text-slate-500">Par catégorie de frais scolaires</p>
          </div>

          <div className="flex items-center justify-center gap-4 my-2">
            <div className="w-36 h-36 shrink-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueDistribution}
                    innerRadius={44}
                    outerRadius={66}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {revenueDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] text-slate-400 font-medium">Total</span>
                <span className="text-xs font-bold text-slate-800">8.45 M</span>
              </div>
            </div>

            <div className="space-y-2 text-xs flex-1">
              {revenueDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-slate-700">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">{formatFCFA(item.value)}</span>
                    <span className="text-[10px] text-slate-400 ml-1">({item.percentage})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              onClick={() => setCurrentView('finances')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Voir le rapport financier complet →
            </button>
          </div>
        </div>

        {/* Alertes importantes - 3 cols */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-900">Alertes importantes</h3>
            <button
              onClick={() => setCurrentView('unpaid')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Voir tout
            </button>
          </div>

          <div className="space-y-2.5">
            {/* Alert 1 */}
            <div
              onClick={() => setCurrentView('unpaid')}
              className="p-3 rounded-xl bg-red-50/60 border border-red-100 hover:bg-red-50 transition-colors cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                    Impayés élevés
                  </h4>
                  <p className="text-[11px] text-slate-500">145 élèves ont des impayés</p>
                  <p className="text-xs font-extrabold text-red-600 mt-0.5">2 180 000 FCFA à recouvrer</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" />
            </div>

            {/* Alert 2 */}
            <div
              onClick={() => setCurrentView('attendance')}
              className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 hover:bg-amber-50 transition-colors cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    Absences aujourd'hui
                  </h4>
                  <p className="text-[11px] text-slate-500">68 élèves absents</p>
                  <p className="text-[11px] font-semibold text-amber-700 mt-0.5">12 non justifiées</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>

            {/* Alert 3 */}
            <div
              onClick={() => setCurrentView('documents')}
              className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 hover:bg-blue-50 transition-colors cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Documents à traiter
                  </h4>
                  <p className="text-[11px] text-slate-500">23 demandes en attente</p>
                  <p className="text-[11px] text-slate-500">(Bulletins, attestations...)</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Derniers paiements, Impayés par classe, Actions rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Derniers paiements (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Derniers paiements</h3>
            <button
              onClick={() => setCurrentView('payments')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Voir tout
            </button>
          </div>

          <div className="space-y-3">
            {payments.slice(0, 5).map((pay) => (
              <div
                key={pay.id}
                onClick={() => openModal('receipt', pay)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                    {pay.studentName.split(' ')[0][0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {pay.studentName.toUpperCase()}
                    </h4>
                    <p className="text-[11px] text-slate-500">{pay.className}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-green-600">
                    {formatFCFA(pay.amount)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {pay.paymentMethod === 'ORANGE_MONEY' ? 'Orange Money' : pay.paymentMethod === 'WAVE' ? 'Wave' : pay.paymentMethod === 'CARTE_BANCAIRE' ? 'Carte bancaire' : 'Espèces'} • {pay.time || 'Aujourd\'hui'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              id="btn-add-payment-dash"
              onClick={() => openModal('record_payment')}
              className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>Enregistrer un encaissement</span>
            </button>
          </div>
        </div>

        {/* Impayés par classe (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-900">Impayés par classe</h3>
            <button
              onClick={() => setCurrentView('unpaid')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Voir tout
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 font-semibold text-[11px]">
                  <th className="pb-2">Classe</th>
                  <th className="pb-2 text-center">Élèves concernés</th>
                  <th className="pb-2 text-right">Montant dû</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unpaidByClass.map((row) => (
                  <tr key={row.class} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 font-bold text-slate-800">{row.class}</td>
                    <td className="py-2.5 text-center text-slate-600 font-medium">{row.count}</td>
                    <td className="py-2.5 text-right font-bold text-red-600">{formatFCFA(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <button
              id="btn-view-all-unpaid"
              onClick={() => setCurrentView('unpaid')}
              className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs text-center transition-colors shadow-xs"
            >
              Voir tous les impayés
            </button>
            <button
              id="btn-send-unpaid-sms-dash"
              onClick={() => openModal('bulk_sms_unpaid')}
              className="flex-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center gap-1.5 border border-blue-200 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-blue-600" />
              <span>Envoyer rappel SMS</span>
            </button>
          </div>
        </div>

        {/* Actions rapides (3 cols) - 8 tiles */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="mb-3">
            <h3 className="text-base font-bold text-slate-900">Actions rapides</h3>
            <p className="text-xs text-slate-500">Raccourcis de gestion</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              id="action-add-student"
              onClick={() => openModal('add_student')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/70 hover:border-blue-200 text-left transition-all group"
            >
              <UserPlus className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-800 leading-tight">Ajouter un élève</p>
            </button>

            <button
              id="action-bulk-enroll"
              onClick={() => openModal('bulk_enroll_students')}
              className="p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/80 text-left transition-all group"
            >
              <Star className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-blue-900 leading-tight"> Inscrire dans toutes les classes</p>
            </button>

            <button
              id="action-enrollment"
              onClick={() => setCurrentView('enrollment')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-green-50/80 border border-slate-200/70 hover:border-green-200 text-left transition-all group"
            >
              <UserCheck className="w-5 h-5 text-green-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-800 leading-tight">Nouvelle inscription</p>
            </button>

            <button
              id="action-payment"
              onClick={() => openModal('record_payment')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/70 hover:border-blue-200 text-left transition-all group"
            >
              <CreditCard className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-800 leading-tight">Enregistrer paiement</p>
            </button>

            <button
              id="action-attendance"
              onClick={() => setCurrentView('attendance')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/80 border border-slate-200/70 hover:border-amber-200 text-left transition-all group"
            >
              <Users className="w-5 h-5 text-amber-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-800 leading-tight">Faire l'appel</p>
            </button>

            <button
              id="action-grades"
              onClick={() => setCurrentView('grades')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/70 hover:border-blue-200 text-left transition-all group"
            >
              <FileEdit className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-800 leading-tight">Saisir des notes</p>
            </button>

            <button
              id="action-bulletin"
              onClick={() => setCurrentView('bulletins')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-green-50/80 border border-slate-200/70 hover:border-green-200 text-left transition-all group"
            >
              <FileText className="w-5 h-5 text-green-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-800 leading-tight">Générer bulletin</p>
            </button>

            <button
              id="action-send-sms"
              onClick={() => openModal('send_sms')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-red-50/80 border border-slate-200/70 hover:border-red-200 text-left transition-all group"
            >
              <Send className="w-5 h-5 text-red-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-800 leading-tight">Envoyer un SMS</p>
            </button>

            <button
              id="action-finance"
              onClick={() => setCurrentView('finances')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/70 hover:border-blue-200 text-left transition-all group"
            >
              <BarChart3 className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-800 leading-tight">Rapport financier</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

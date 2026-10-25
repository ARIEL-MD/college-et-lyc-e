import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users, Phone, MessageSquare, Plus, Search,
  CheckCircle, AlertTriangle, Smartphone, ExternalLink,
  DollarSign
} from 'lucide-react';
import { formatFCFA, detectCarrier } from '../../utils/formatters';

export const ParentsView: React.FC = () => {
  const { parents, students, openModal } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParents = parents.filter(p =>
    p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm) ||
    p.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Zero-App concept banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-green-100 text-green-800 text-[11px] font-bold mb-1">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Parents connectés via SMS Direct — Sans Téléchargement d'App</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Répertoire des Parents & Tuteurs ({parents.length})
          </h2>
          <p className="text-xs text-slate-500">
            Un parent peut être rattaché à plusieurs élèves dans différentes classes.
          </p>
        </div>

        <button
          onClick={() => openModal('send_sms')}
          className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Envoyer une annonce SMS groupée</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom de parent, numéro de téléphone Orange/MTN/Moov, quartier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Parents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredParents.map((parent) => {
          // Find all children for this parent
          const children = students.filter(s => s.parentId === parent.id || parent.childrenIds.includes(s.id));
          const totalChildrenDebt = children.reduce((sum, c) => sum + c.unpaidTuition, 0);
          const carrier = detectCarrier(parent.phone);

          return (
            <div
              key={parent.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* Parent Name & Carrier */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {parent.lastName} {parent.firstName}
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {parent.relation === 'PERE' ? 'Père' : parent.relation === 'MERE' ? 'Mère' : 'Tuteur légal'} • {parent.profession || 'Parent d\'élève'}
                    </span>
                  </div>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                    carrier === 'ORANGE_CI'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : carrier === 'MTN_CI'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {carrier.replace('_', ' ')}
                  </span>
                </div>

                {/* Contact Phone (Primary SMS ID) */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">Numéro SMS Principal :</span>
                    <span className="font-mono font-bold text-blue-700">{parent.phone}</span>
                  </div>
                  {parent.secondaryPhone && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[10px] text-slate-400 font-medium">Secondaire :</span>
                      <span className="font-mono text-slate-600">{parent.secondaryPhone}</span>
                    </div>
                  )}
                  <div className="text-[10px] text-slate-500 truncate mt-1">
                     {parent.address}
                  </div>
                </div>

                {/* Children linked */}
                <div className="space-y-1.5 mb-3">
                  <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Enfants scolarisés ({children.length}) :
                  </div>
                  <div className="space-y-1">
                    {children.map(child => (
                      <div
                        key={child.id}
                        onClick={() => openModal('student_detail', child)}
                        className="flex items-center justify-between p-1.5 rounded-lg bg-blue-50/50 hover:bg-blue-50 border border-blue-100/60 text-xs cursor-pointer transition-colors"
                      >
                        <span className="font-semibold text-slate-800">
                          {child.firstName} {child.lastName}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-white rounded text-blue-700 border border-blue-200">
                          {child.className}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Financial summary & SMS button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Solde restant cumulé :</div>
                  <div className={`text-xs font-semibold ${totalChildrenDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {totalChildrenDebt > 0 ? formatFCFA(totalChildrenDebt) : 'À jour (0 FCFA)'}
                  </div>
                </div>

                <button
                  onClick={() => openModal('send_sms_single', {
                    recipientPhone: parent.phone,
                    recipientName: `${parent.firstName} ${parent.lastName}`,
                    studentName: children[0] ? `${children[0].firstName} ${children[0].lastName}` : '',
                    className: children[0]?.className || ''
                  })}
                  className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
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

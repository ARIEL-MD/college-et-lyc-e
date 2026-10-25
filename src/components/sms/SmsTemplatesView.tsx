import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText, Plus, Edit2, Trash2, CheckCircle2,
  Star, Save, MessageSquare, Smartphone
} from 'lucide-react';
import { SmsTemplate } from '../../types';

export const SmsTemplatesView: React.FC = () => {
  const { smsTemplates, showToast } = useApp();

  const [templates, setTemplates] = useState<SmsTemplate[]>(smsTemplates);
  const [editingTemplate, setEditingTemplate] = useState<SmsTemplate | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? editingTemplate : t));
    setEditingTemplate(null);
    showToast('Modèle SMS mis à jour avec succès', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Modèles de Messages SMS Officiels</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {templates.length} modèles
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Personnalisation des textes types envoyés directement sur les téléphones des parents
          </p>
        </div>
      </div>

      {/* Variables explanation banner */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-blue-600 shrink-0" />
          <span className="font-bold text-blue-900">Variables dynamiques disponibles :</span>
        </div>
        <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
          {['[NOM]', '[CLASSE]', '[DATE]', '[MONTANT]', '[SOLDE]', '[HEURE]', '[NUM_RECU]', '[TELEPHONE_ECOLE]'].map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded bg-white text-blue-800 border border-blue-200 font-bold">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white rounded-lg p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {tpl.triggerType}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {tpl.content.length} car. (~ {Math.ceil(tpl.content.length / 160)} SMS)
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-2">{tpl.title}</h3>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-800 leading-relaxed font-sans font-medium">
                {tpl.content}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setEditingTemplate(tpl)}
                className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Modifier</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Template Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Modifier le modèle : {editingTemplate.title}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Titre</label>
                <input
                  type="text"
                  value={editingTemplate.title}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Texte du modèle</label>
                <textarea
                  rows={4}
                  value={editingTemplate.content}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

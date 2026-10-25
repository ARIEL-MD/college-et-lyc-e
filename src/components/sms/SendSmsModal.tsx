import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X, Send, Smartphone, FileText, CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { calculateSmsSegments, formatFCFA, detectCarrier } from '../../utils/formatters';

interface SendSmsModalProps {
  initialData?: any;
  onClose: () => void;
}

export const SendSmsModal: React.FC<SendSmsModalProps> = ({ initialData, onClose }) => {
  const { school, sendSms, showToast } = useApp();

  const student = initialData?.student;
  const [recipientPhone, setRecipientPhone] = useState(
    initialData?.recipientPhone || student?.parentPhone || '+225 07 '
  );
  const [recipientName, setRecipientName] = useState(
    initialData?.recipientName || student?.parentName || 'Parent d\'élève'
  );
  const [message, setMessage] = useState(
    initialData?.defaultMessage ||
    `ÉCOLE LA RÉUSSITE: Bonjour, `
  );
  const [isSending, setIsSending] = useState(false);

  const segmentInfo = calculateSmsSegments(message);
  const carrier = detectCarrier(recipientPhone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast('Veuillez saisir un message', 'error');
      return;
    }
    if (recipientPhone.length < 8) {
      showToast('Numéro de téléphone incomplet', 'error');
      return;
    }

    setIsSending(true);
    await sendSms({
      recipientPhone,
      recipientName,
      studentName: student ? `${student.firstName} ${student.lastName}` : undefined,
      className: student?.className,
      message,
      triggerType: 'MANUEL',
      carrier
    });
    setIsSending(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto duration-150">
      <div className="bg-white rounded-lg max-w-lg w-full shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Envoi de SMS Direct au Parent</h3>
              <p className="text-xs text-blue-200">Routage direct sans application requise</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Destinataire (Nom du parent)</label>
            <input
              type="text"
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-700 font-bold">Numéro de Téléphone (+225)</label>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                carrier === 'ORANGE_CI' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                carrier === 'MTN_CI' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {carrier.replace('_', ' ')}
              </span>
            </div>
            <input
              type="text"
              required
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-700 font-bold">Contenu du message SMS</label>
              <span className="text-[10px] text-slate-400">
                {segmentInfo.chars} car. | {segmentInfo.segments} SMS ({segmentInfo.remainingInSegment} restants)
              </span>
            </div>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-slate-500 text-[11px]">Coût d'expédition :</span>
            <span className="font-extrabold text-slate-900">{formatFCFA(20 * (segmentInfo.segments || 1))}</span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 shadow-md"
            >
              {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Envoyer le SMS</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

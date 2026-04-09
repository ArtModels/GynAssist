import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Plus, Clock, ChevronRight } from 'lucide-react';
import { getConversations } from '../services/clients';
import './ConversationHistory.css';

const formatDate = (isoStr) => {
  if (!isoStr) return '–';
  try {
    const d = isoStr.toDate ? isoStr.toDate() : new Date(isoStr._seconds ? isoStr._seconds * 1000 : isoStr);
    return d.toLocaleDateString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return '–'; }
};

const getPreview = (conv) => {
  const msgs = conv.messages || [];
  const lastAi = [...msgs].reverse().find(m => m.role === 'ai');
  return lastAi?.content?.slice(0, 60) + (lastAi?.content?.length > 60 ? '…' : '') || 'Sin mensajes';
};

export default function ConversationHistory({ client, activeConversationId, onSelect, onNew }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    if (!client) return;
    setLoading(true);
    getConversations(client.client_id)
      .then(setConversations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [client]);

  useEffect(() => { reload(); }, [reload]);

  // Refresh when a conversation changes (new messages added)
  useEffect(() => {
    if (activeConversationId) reload();
  }, [activeConversationId, reload]);

  return (
    <div className="ch-panel">
      <div className="ch-header">
        <div className="ch-title">
          <Clock size={13} />
          Historial
        </div>
        <button className="ch-new" onClick={onNew} title="Nueva consulta">
          <Plus size={14} />
        </button>
      </div>

      <div className="ch-list">
        {loading && (
          <div className="ch-loading">
            {[0,1,2].map(i => (
              <div key={i} className="ch-skeleton" />
            ))}
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="ch-empty">
            <MessageSquare size={20} strokeWidth={1} />
            <span>Sin consultas previas</span>
          </div>
        )}

        {!loading && conversations.map((conv, i) => {
          const isActive = conv.id === activeConversationId;
          const count = conv.messages?.length || 0;
          return (
            <button
              key={conv.id}
              className={`ch-item ${isActive ? 'ch-item--active' : ''}`}
              onClick={() => onSelect(conv.id)}
            >
              <div className="ch-item-left">
                <div className="ch-item-index">{i + 1}</div>
              </div>
              <div className="ch-item-body">
                <div className="ch-item-date">{formatDate(conv.updated_at)}</div>
                <div className="ch-item-preview">{getPreview(conv)}</div>
                <div className="ch-item-count">{count} mensaje{count !== 1 ? 's' : ''}</div>
              </div>
              {isActive && <ChevronRight size={12} className="ch-item-arrow" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

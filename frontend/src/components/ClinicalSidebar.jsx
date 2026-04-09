import { Activity, User, Baby, Calendar, FileText, ChevronLeft, AlertTriangle } from 'lucide-react';
import ConversationHistory from './ConversationHistory';
import './ClinicalSidebar.css';

const PATIENT_COLORS = ['#00c9a7', '#4a9eff', '#b48eff'];

export default function ClinicalSidebar({ client, clientIndex, onBack, activeConversationId, onSelectConversation, onNewConversation }) {
  const color = PATIENT_COLORS[clientIndex % PATIENT_COLORS.length];
  const ant = client?.antecedentes_go || {};

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button className="sidebar-back" onClick={onBack}>
          <ChevronLeft size={16} />
          <span>Pacientes</span>
        </button>
        <div className="sidebar-logo">
          <Activity size={16} strokeWidth={1.5} style={{ color: 'var(--accent-teal)' }} />
          GynAssist
        </div>
      </div>

      <div className="sidebar-avatar-wrap">
        <div className="sidebar-avatar" style={{ borderColor: color }}>
          <span style={{ color }}>
            {client?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="sidebar-status">
          <span className="sidebar-status-dot" />
          Consulta activa
        </div>
      </div>

      <div className="sidebar-name">{client?.name}</div>
      <div className="sidebar-meta">
        <User size={12} /> {client?.edad} años · {client?.ocupacion}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">
          <Baby size={13} style={{ color }} />
          Antecedentes G-O
        </div>
        <div className="sidebar-go-grid">
          {[
            { label: 'Gestas', val: ant.gestas },
            { label: 'Partos', val: ant.partos },
            { label: 'Cesáreas', val: ant.cesareas },
            { label: 'Abortos', val: ant.abortos },
            { label: 'Hijos Vivos', val: ant.hijos_vivos },
          ].map(({ label, val }) => (
            <div key={label} className="sidebar-go-item">
              <span className="sidebar-go-val" style={{ color }}>{val ?? '–'}</span>
              <span className="sidebar-go-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">
          <Calendar size={13} style={{ color }} />
          Fecha Última Menstruación
        </div>
        <div className="sidebar-detail">{client?.fum || '–'}</div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">
          <FileText size={13} style={{ color }} />
          Motivo de Consulta
        </div>
        <div className="sidebar-detail sidebar-motivo">{client?.motivo_consulta}</div>
      </div>

      {client?.notas_relevantes && (
        <div className="sidebar-section">
          <div className="sidebar-section-title">
            <AlertTriangle size={13} style={{ color: 'var(--warning)' }} />
            Notas Clínicas
          </div>
          <div className="sidebar-detail sidebar-notes">{client.notas_relevantes}</div>
        </div>
      )}

      {/* Conversation History at the bottom */}
      <ConversationHistory
        client={client}
        activeConversationId={activeConversationId}
        onSelect={onSelectConversation}
        onNew={onNewConversation}
      />
    </aside>
  );
}

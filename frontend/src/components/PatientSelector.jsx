import { useState, useMemo, useRef } from 'react';
import { User, Activity, Baby, Calendar, FileText, Plus, Trash2, AlertTriangle, Search, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { deleteClient } from '../services/clients';
import AddPatientModal from './AddPatientModal';
import './PatientSelector.css';

const PATIENT_COLORS = ['#00c9a7', '#4a9eff', '#b48eff'];
const INITIALS = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

function ConfirmDeleteDialog({ patient, onCancel, onConfirm, loading }) {
  return (
    <div className="ps-confirm-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="ps-confirm-box">
        <div className="ps-confirm-icon"><AlertTriangle size={22} /></div>
        <p className="ps-confirm-title">¿Eliminar paciente?</p>
        <p className="ps-confirm-msg">
          Esta acción eliminará a <strong>{patient?.name}</strong> y no se puede deshacer.
        </p>
        <div className="ps-confirm-actions">
          <button className="ps-confirm-cancel" onClick={onCancel}>Cancelar</button>
          <button className="ps-confirm-delete" onClick={onConfirm} disabled={loading}>
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PatientSelector({ user, clients, loading, onSelect, onClientsChange }) {
  const [showModal, setShowModal] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const filtered = useMemo(() =>
    clients.filter(c =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.motivo_consulta?.toLowerCase().includes(search.toLowerCase()) ||
      c.ocupacion?.toLowerCase().includes(search.toLowerCase())
    ),
    [clients, search]
  );

  const handleCreated = (newClient) => {
    setShowModal(false);
    onClientsChange([...clients, newClient]);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteClient(toDelete.client_id);
      onClientsChange(clients.filter(c => c.client_id !== toDelete.client_id));
      setToDelete(null);
    } catch (e) {
      console.error('Error al eliminar:', e);
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    signOut(auth).catch(console.error);
  };

  if (loading) {
    return (
      <div className="ps-container">
        <div className="ps-header">
          <div className="ps-top-bar">
            <div className="ps-logo"><Activity size={22} strokeWidth={1.5} />GynAssist</div>
            <div className="ps-user-info">
              <span className="ps-doctor-name">{user?.displayName || 'Autenticado'}</span>
              <button className="ps-logout-btn" onClick={handleLogout} title="Cerrar sesión">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="ps-grid-wrap">
          <div className="ps-grid">
            {[0, 1, 2].map(i => (
              <div key={i} className="ps-card ps-card--skeleton">
                <div className="ps-skeleton-avatar" />
                <div className="ps-skeleton-line" style={{ width: '60%' }} />
                <div className="ps-skeleton-line" style={{ width: '40%' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="ps-container">
        <div className="ps-header">
          <div className="ps-top-bar">
            <div className="ps-logo"><Activity size={22} strokeWidth={1.5} />GynAssist</div>
            <div className="ps-user-info">
              <span className="ps-doctor-name">{user?.displayName || 'Autenticado'}</span>
              <button className="ps-logout-btn" onClick={handleLogout} title="Cerrar sesión">
                <LogOut size={16} />
              </button>
            </div>
          </div>
          <p className="ps-title">Selección de Paciente</p>
          <p className="ps-subtitle">Seleccione el perfil de la paciente para iniciar la consulta clínica asistida.</p>

          {/* Search bar */}
          <div className="ps-search-wrap">
            <Search size={15} className="ps-search-icon" />
            <input
              className="ps-search-input"
              type="text"
              placeholder="Buscar por nombre, motivo u ocupación..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="ps-search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>

        {filtered.length === 0 && !loading && (
          <p className="ps-empty">{search ? `Sin resultados para "${search}"` : 'No hay pacientes registradas.'}</p>
        )}

        <div className="ps-grid-wrap">
          {filtered.length > 0 && (
            <button className="ps-nav-arrow ps-nav-left" onClick={() => scroll('left')}>
              <ChevronLeft size={24} />
            </button>
          )}

          <div className="ps-grid" ref={scrollRef}>
            {filtered.map((client, i) => {
            const color = PATIENT_COLORS[i % PATIENT_COLORS.length];
            const ant = client.antecedentes_go || {};
            return (
              <div key={client.client_id} className="ps-card-wrap">
                <button
                  className="ps-card"
                  onClick={() => onSelect(client)}
                  style={{ '--accent': color }}
                >
                  <div className="ps-card-glow" />
                  <div className="ps-avatar" style={{ borderColor: color }}>
                    <span style={{ color }}>{INITIALS(client.name)}</span>
                  </div>
                  <div className="ps-card-body">
                    <h3 className="ps-name">{client.name}</h3>
                    <div className="ps-age"><User size={12} />{client.edad} años · {client.ocupacion}</div>
                    <div className="ps-divider" />
                    <div className="ps-stats">
                      <div className="ps-stat">
                        <Baby size={13} style={{ color }} />
                        <span>G{ant.gestas} P{ant.partos} C{ant.cesareas} A{ant.abortos}</span>
                      </div>
                      <div className="ps-stat">
                        <Calendar size={13} style={{ color }} />
                        <span>FUM: {client.fum}</span>
                      </div>
                    </div>
                    <div className="ps-motivo">
                      <FileText size={12} />
                      <span>{client.motivo_consulta}</span>
                    </div>
                  </div>
                  <div className="ps-card-cta" style={{ color }}>Iniciar consulta →</div>
                </button>

                {/* Delete button */}
                <button
                  className="ps-delete-btn"
                  onClick={(e) => { e.stopPropagation(); setToDelete(client); }}
                  title="Eliminar paciente"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
          </div>

          {filtered.length > 0 && (
            <button className="ps-nav-arrow ps-nav-right" onClick={() => scroll('right')}>
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      </div>

      {/* FAB – Agregar Paciente */}
      <button className="ps-fab" onClick={() => setShowModal(true)} title="Agregar paciente">
        <Plus size={22} strokeWidth={2} />
        <span>Agregar Paciente</span>
      </button>

      {showModal && (
        <AddPatientModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}

      {toDelete && (
        <ConfirmDeleteDialog
          patient={toDelete}
          onCancel={() => setToDelete(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </>
  );
}

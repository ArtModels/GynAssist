import { useState } from 'react';
import { X, User, Baby, FileText, ChevronRight, ChevronLeft, Plus, Check } from 'lucide-react';
import { createClient } from '../services/clients';
import './AddPatientModal.css';

const STEPS = [
  { id: 1, label: 'Datos Personales',    icon: User },
  { id: 2, label: 'Antecedentes G-O',   icon: Baby },
  { id: 3, label: 'Motivo de Consulta', icon: FileText },
];

const INITIAL = {
  name: '', edad: '', ocupacion: '',
  gestas: '0', partos: '0', cesareas: '0', abortos: '0', hijos_vivos: '0', fum: '',
  motivo_consulta: '', notas_relevantes: '',
};

function FieldGroup({ label, children, hint }) {
  return (
    <div className="apm-field">
      <label className="apm-label">{label}</label>
      {children}
      {hint && <span className="apm-hint">{hint}</span>}
    </div>
  );
}

export default function AddPatientModal({ onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const validateStep = () => {
    if (step === 1) {
      if (!form.name.trim()) return 'El nombre es obligatorio.';
      if (!form.edad || isNaN(form.edad) || +form.edad < 1) return 'Ingresa una edad válida.';
    }
    if (step === 2) {
      if (!form.fum.trim()) return 'La FUM es obligatoria.';
    }
    if (step === 3) {
      if (!form.motivo_consulta.trim()) return 'El motivo de consulta es obligatorio.';
    }
    return '';
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setSaving(true);
    setError('');
    try {
      const newClient = await createClient({
        name: form.name.trim(),
        edad: +form.edad,
        ocupacion: form.ocupacion.trim(),
        fum: form.fum.trim(),
        motivo_consulta: form.motivo_consulta.trim(),
        notas_relevantes: form.notas_relevantes.trim(),
        gestas: +form.gestas,
        partos: +form.partos,
        cesareas: +form.cesareas,
        abortos: +form.abortos,
        hijos_vivos: +form.hijos_vivos,
      });
      onCreated(newClient);
    } catch (e) {
      setError('Error al guardar la paciente. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="apm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="apm-modal">
        {/* Header */}
        <div className="apm-header">
          <div className="apm-header-info">
            <Plus size={16} style={{ color: 'var(--accent-teal)' }} />
            <span>Nueva Paciente</span>
          </div>
          <button className="apm-close" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Step indicator */}
        <div className="apm-steps">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="apm-step-wrap">
                <div className={`apm-step-dot ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
                  {done ? <Check size={12} /> : <Icon size={12} />}
                </div>
                <span className={`apm-step-label ${active ? 'active' : ''}`}>{s.label}</span>
                {i < STEPS.length - 1 && <div className={`apm-step-line ${done ? 'done' : ''}`} />}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="apm-body">
          {step === 1 && (
            <>
              <FieldGroup label="Nombre completo *">
                <input className="apm-input" placeholder="Ej. María López Hernández" value={form.name} onChange={set('name')} autoFocus />
              </FieldGroup>
              <div className="apm-row">
                <FieldGroup label="Edad *">
                  <input className="apm-input" type="number" min="1" max="120" placeholder="Ej. 28" value={form.edad} onChange={set('edad')} />
                </FieldGroup>
                <FieldGroup label="Ocupación">
                  <input className="apm-input" placeholder="Ej. Maestra" value={form.ocupacion} onChange={set('ocupacion')} />
                </FieldGroup>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="apm-section-note">
                Registra el historial obstétrico básico de la paciente. Estos datos guiarán al agente clínico.
              </p>
              <div className="apm-go-grid">
                {[
                  { key: 'gestas',      label: 'Gestas (G)',        hint: 'Total embarazos' },
                  { key: 'partos',      label: 'Partos (P)',        hint: 'Partos vaginales' },
                  { key: 'cesareas',    label: 'Cesáreas (C)',      hint: '' },
                  { key: 'abortos',     label: 'Abortos (A)',       hint: '' },
                  { key: 'hijos_vivos', label: 'Hijos Vivos (HV)', hint: '' },
                ].map(({ key, label, hint }) => (
                  <FieldGroup key={key} label={label} hint={hint}>
                    <input className="apm-input" type="number" min="0" value={form[key]} onChange={set(key)} />
                  </FieldGroup>
                ))}
              </div>
              <FieldGroup label="FUM – Fecha Última Menstruación *" hint="Formato sugerido: DD/MM/AAAA o 'Sin dato'">
                <input className="apm-input" placeholder="Ej. 15/02/2025" value={form.fum} onChange={set('fum')} />
              </FieldGroup>
            </>
          )}

          {step === 3 && (
            <>
              <FieldGroup label="Motivo de consulta *" hint="Describe el motivo principal de esta consulta.">
                <textarea className="apm-input apm-textarea" rows={3}
                  placeholder="Ej. Control prenatal, revisión de ciclo irregular, dolor pélvico..."
                  value={form.motivo_consulta} onChange={set('motivo_consulta')} autoFocus />
              </FieldGroup>
              <FieldGroup label="Notas clínicas relevantes" hint="Alergias, enfermedades crónicas, medicamentos actuales, etc.">
                <textarea className="apm-input apm-textarea" rows={3}
                  placeholder="Ej. Hipertensión controlada, alergia a penicilina..."
                  value={form.notas_relevantes} onChange={set('notas_relevantes')} />
              </FieldGroup>
            </>
          )}

          {error && <p className="apm-error">{error}</p>}
        </div>

        {/* Footer */}
        <div className="apm-footer">
          {step > 1 && (
            <button className="apm-btn apm-btn--ghost" onClick={() => { setError(''); setStep(s => s - 1); }}>
              <ChevronLeft size={14} /> Anterior
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < 3 ? (
            <button className="apm-btn apm-btn--primary" onClick={next}>
              Siguiente <ChevronRight size={14} />
            </button>
          ) : (
            <button className="apm-btn apm-btn--primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Guardando...' : <><Check size={14} /> Registrar Paciente</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

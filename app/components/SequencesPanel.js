'use client';
import { useState, useEffect } from 'react';
import { getSequences, saveSequences, getContacts } from '../lib/store';

export default function SequencesPanel({ showToast }) {
  const [sequences, setSequences] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [showAddContacts, setShowAddContacts] = useState(null);
  const [name, setName] = useState('');
  const [contactSelection, setContactSelection] = useState(new Set());

  const reload = () => { setSequences(getSequences()); setContacts(getContacts()); };
  useEffect(() => { reload(); }, []);

  const handleCreate = () => {
    if (!name) return;
    const seqs = getSequences();
    seqs.push({ id: crypto.randomUUID(), name, steps: [{ type: 'email', delayDays: 0, subject: '', body: '' }, { type: 'email', delayDays: 3, subject: '', body: '' }, { type: 'email', delayDays: 7, subject: '', body: '' }], contacts: [], status: 'draft', createdAt: new Date().toISOString() });
    saveSequences(seqs);
    setName(''); setShowCreate(false); showToast('Sequence created'); reload();
  };

  const handleDelete = (id) => { saveSequences(getSequences().filter(s => s.id !== id)); showToast('Sequence deleted'); reload(); };

  const handleToggleStatus = (seq) => {
    const action = seq.status === 'active' ? 'paused' : 'active';
    saveSequences(getSequences().map(s => s.id === seq.id ? { ...s, status: action } : s));
    showToast(`Sequence ${action}`); reload();
  };

  const handleUpdateSteps = (seq, steps) => {
    saveSequences(getSequences().map(s => s.id === seq.id ? { ...s, steps } : s));
    showToast('Steps updated'); setShowEdit(null); reload();
  };

  const handleAddContacts = (seqId) => {
    const selectedContacts = contacts.filter(c => contactSelection.has(c.id));
    saveSequences(getSequences().map(s => {
      if (s.id !== seqId) return s;
      const existing = new Set(s.contacts.map(c => c.email));
      const newC = selectedContacts.filter(c => !existing.has(c.email)).map(c => ({ ...c, currentStep: 0, status: 'active', enrolledAt: new Date().toISOString() }));
      return { ...s, contacts: [...s.contacts, ...newC] };
    }));
    showToast(`Added ${selectedContacts.length} contacts`); setContactSelection(new Set()); setShowAddContacts(null); reload();
  };

  return (
    <div>
      <div className="card-header"><div><h2 className="card-title">Email Sequences</h2><p className="card-subtitle">Create multi-step automated email campaigns</p></div><button className="btn btn-primary" onClick={() => setShowCreate(true)}>New Sequence</button></div>
      {sequences.length === 0 ? <div className="card"><div className="empty-state"><p>No sequences yet. Create one to start automated outreach.</p></div></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sequences.map(seq => (
            <div key={seq.id} className="card">
              <div className="card-header">
                <div><span className="card-title">{seq.name}</span><div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}><span className={`badge ${seq.status === 'active' ? 'badge-green' : seq.status === 'paused' ? 'badge-yellow' : 'badge-gray'}`}>{seq.status}</span><span className="badge badge-blue">{seq.steps?.length || 0} steps</span><span className="badge badge-gray">{seq.contacts?.length || 0} contacts</span></div></div>
                <div className="btn-group"><button className="btn btn-sm btn-secondary" onClick={() => handleToggleStatus(seq)}>{seq.status === 'active' ? 'Pause' : 'Activate'}</button><button className="btn btn-sm btn-secondary" onClick={() => setShowEdit(seq)}>Edit Steps</button><button className="btn btn-sm btn-secondary" onClick={() => setShowAddContacts(seq.id)}>Add Contacts</button><button className="btn btn-sm btn-danger" onClick={() => handleDelete(seq.id)}>Delete</button></div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{(seq.steps || []).map((step, i) => (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div className="step-number">{i + 1}</div><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{step.type === 'email' ? 'Email' : 'Task'} {step.delayDays > 0 ? `(+${step.delayDays}d)` : '(immediate)'}</span>{i < (seq.steps?.length || 0) - 1 && <span style={{ color: 'var(--text-dim)' }}>→</span>}</div>))}</div>
            </div>
          ))}
        </div>
      )}
      {showCreate && (<div className="modal-overlay" onClick={() => setShowCreate(false)}><div className="modal" onClick={e => e.stopPropagation()}><h3 className="modal-title">Create New Sequence</h3><div className="form-group"><label className="form-label">Sequence Name</label><input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Exhibition Follow-up" /></div><div className="btn-group"><button className="btn btn-primary" onClick={handleCreate}>Create</button><button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button></div></div></div>)}
      {showEdit && <StepEditor seq={showEdit} onSave={(steps) => handleUpdateSteps(showEdit, steps)} onClose={() => setShowEdit(null)} />}
      {showAddContacts && (<div className="modal-overlay" onClick={() => setShowAddContacts(null)}><div className="modal" onClick={e => e.stopPropagation()}><h3 className="modal-title">Add Contacts to Sequence</h3><div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>{contacts.map(c => (<label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', cursor: 'pointer' }}><input type="checkbox" checked={contactSelection.has(c.id)} onChange={() => { const n = new Set(contactSelection); n.has(c.id) ? n.delete(c.id) : n.add(c.id); setContactSelection(n); }} /><span style={{ fontSize: '13px' }}>{c.firstName} {c.lastName} ({c.email})</span></label>))}</div><div className="btn-group"><button className="btn btn-primary" onClick={() => handleAddContacts(showAddContacts)}>Add {contactSelection.size} Contacts</button><button className="btn btn-secondary" onClick={() => setShowAddContacts(null)}>Cancel</button></div></div></div>)}
    </div>
  );
}

function StepEditor({ seq, onSave, onClose }) {
  const [steps, setSteps] = useState(seq.steps || []);
  const updateStep = (i, field, value) => { const n = [...steps]; n[i] = { ...n[i], [field]: value }; setSteps(n); };
  const addStep = () => setSteps([...steps, { type: 'email', delayDays: steps.length * 3, subject: '', body: '' }]);
  const removeStep = (i) => setSteps(steps.filter((_, idx) => idx !== i));

  return (
    <div className="modal-overlay" onClick={onClose}><div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}><h3 className="modal-title">Edit Sequence Steps</h3>
      {steps.map((step, i) => (<div key={i} className="sequence-step"><div className="step-number">{i + 1}</div><div className="step-content"><div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}><select className="select" style={{ maxWidth: '120px' }} value={step.type} onChange={e => updateStep(i, 'type', e.target.value)}><option value="email">Email</option><option value="task">Manual Task</option></select><div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Wait</span><input className="input" type="number" style={{ width: '60px' }} value={step.delayDays} onChange={e => updateStep(i, 'delayDays', parseInt(e.target.value) || 0)} /><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>days</span></div><button className="btn btn-sm btn-danger" onClick={() => removeStep(i)} style={{ marginLeft: 'auto' }}>Remove</button></div>
        {step.type === 'email' && (<><input className="input" style={{ marginBottom: '6px' }} placeholder="Subject line" value={step.subject} onChange={e => updateStep(i, 'subject', e.target.value)} /><textarea className="textarea" style={{ minHeight: '60px' }} placeholder="Email body" value={step.body} onChange={e => updateStep(i, 'body', e.target.value)} /></>)}
        {step.type === 'task' && (<input className="input" placeholder="Task description" value={step.subject} onChange={e => updateStep(i, 'subject', e.target.value)} />)}
      </div></div>))}
      <button className="btn btn-sm btn-secondary" onClick={addStep} style={{ marginBottom: '16px' }}>+ Add Step</button>
      <div className="btn-group"><button className="btn btn-primary" onClick={() => onSave(steps)}>Save Steps</button><button className="btn btn-secondary" onClick={onClose}>Cancel</button></div>
    </div></div>
  );
}

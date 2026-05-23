import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Briefcase, ArrowRight } from 'lucide-react';
import api from '../services/api';

const statusColors = { 'Investigation': 'badge-info', 'Forensic Analysis': 'badge-purple', 'Prosecution Preparation': 'badge-pending', 'Trial': 'badge-compromised', 'Closed': 'badge-verified' };
const priorityColors = { 'Critical': 'badge-compromised', 'High': 'badge-pending', 'Medium': 'badge-info', 'Low': 'badge-verified' };

export default function Cases() {
    const [cases, setCases] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('All');
    const [form, setForm] = useState({ case_title: '', case_description: '', case_type: 'Criminal', priority: 'Medium' });
    const navigate = useNavigate();

    useEffect(() => { loadCases(); }, []);
    const loadCases = () => api.get('/cases').then(r => setCases(r.data)).catch(console.error);

    const createCase = async (e) => {
        e.preventDefault();
        await api.post('/cases', form);
        setShowModal(false);
        setForm({ case_title: '', case_description: '', case_type: 'Criminal', priority: 'Medium' });
        loadCases();
    };

    const filtered = filter === 'All' ? cases : cases.filter(c => c.status === filter);

    return (
        <div className="fade-in">
            <div className="page-header">
                <div><h1>Case Management</h1><p>Manage investigation cases and associated evidence</p></div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> New Case</button>
            </div>

            <div className="filters-bar">
                {['All', 'Investigation', 'Forensic Analysis', 'Prosecution Preparation', 'Trial', 'Closed'].map(f => (
                    <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
                ))}
            </div>

            <div className="grid-2">
                {filtered.map(c => (
                    <div className="card" key={c.case_id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/evidence?case_id=${c.case_id}`)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div>
                                <span style={{ fontSize: 11, color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>{c.case_id}</span>
                                <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{c.case_title}</h3>
                            </div>
                            <span className={`badge ${priorityColors[c.priority] || 'badge-info'}`}>{c.priority}</span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>{c.case_description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span className={`badge ${statusColors[c.status] || 'badge-info'}`}>{c.status}</span>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.case_type}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--accent-cyan)' }}>
                                {c.investigator_name || 'Unassigned'} <ArrowRight size={14} />
                            </div>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Created: {new Date(c.created_at).toLocaleDateString()}</div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Create New Case</h3>
                            <button className="icon-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={createCase}>
                            <div className="form-group">
                                <label className="form-label">Case Title</label>
                                <input className="form-input" value={form.case_title} onChange={e => setForm({ ...form, case_title: e.target.value })} required placeholder="Enter case title" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-textarea" value={form.case_description} onChange={e => setForm({ ...form, case_description: e.target.value })} placeholder="Case description" />
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Case Type</label>
                                    <select className="form-select" value={form.case_type} onChange={e => setForm({ ...form, case_type: e.target.value })}>
                                        {['Criminal', 'Cybercrime', 'Fraud', 'IP Theft', 'Harassment', 'Other'].map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Priority</label>
                                    <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                                        {['Critical', 'High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>Create Case</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

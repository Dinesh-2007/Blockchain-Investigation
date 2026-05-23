import { useState, useEffect } from 'react';
import { GitBranch, ArrowRight, Plus, Search } from 'lucide-react';
import api from '../services/api';

export default function CustodyTracking() {
    const [transfers, setTransfers] = useState([]);
    const [users, setUsers] = useState([]);
    const [evidenceList, setEvidenceList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ evidence_id: '', to_user_id: '', transfer_reason: '' });
    const [search, setSearch] = useState('');

    useEffect(() => {
        api.get('/custody/all').then(r => setTransfers(r.data)).catch(console.error);
        api.get('/users').then(r => setUsers(r.data)).catch(console.error);
        api.get('/evidence').then(r => setEvidenceList(r.data)).catch(console.error);
    }, []);

    const handleTransfer = async (e) => {
        e.preventDefault();
        await api.post('/custody/transfer', form);
        setShowModal(false);
        setForm({ evidence_id: '', to_user_id: '', transfer_reason: '' });
        api.get('/custody/all').then(r => setTransfers(r.data));
    };

    const filtered = transfers.filter(t =>
        !search || t.evidence_title?.toLowerCase().includes(search.toLowerCase()) ||
        t.from_name?.toLowerCase().includes(search.toLowerCase()) ||
        t.to_name?.toLowerCase().includes(search.toLowerCase())
    );

    // Group by evidence_id for timeline view
    const grouped = {};
    filtered.forEach(t => {
        if (!grouped[t.evidence_id]) grouped[t.evidence_id] = [];
        grouped[t.evidence_id].push(t);
    });

    return (
        <div className="fade-in">
            <div className="page-header">
                <div><h1>Chain of Custody</h1><p>Track evidence transfers and custody chain</p></div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> New Transfer</button>
            </div>

            <div className="filters-bar">
                <div className="search-bar" style={{ minWidth: 280 }}>
                    <Search size={16} style={{ color: 'var(--text-muted)' }} />
                    <input type="text" placeholder="Search transfers..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {Object.entries(grouped).map(([evidenceId, items]) => (
                <div className="card" key={evidenceId} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div>
                            <span className="mono" style={{ color: 'var(--accent-cyan)', fontSize: 13 }}>{evidenceId}</span>
                            <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{items[0]?.evidence_title}</h3>
                        </div>
                        <span className="badge badge-info">{items.length} transfers</span>
                    </div>
                    <div className="timeline">
                        {items.map((t, i) => (
                            <div className="timeline-item" key={i}>
                                <div className="timeline-time">{new Date(t.timestamp).toLocaleString()}</div>
                                <div className="timeline-action">
                                    <span style={{ color: 'var(--accent-emerald)' }}>{t.from_name}</span>
                                    <ArrowRight size={14} style={{ display: 'inline', margin: '0 8px', color: 'var(--text-muted)' }} />
                                    <span style={{ color: 'var(--accent-cyan)' }}>{t.to_name}</span>
                                </div>
                                <div className="timeline-detail">
                                    <span className="badge badge-purple" style={{ marginRight: 6 }}>{t.from_role}</span>
                                    <ArrowRight size={10} style={{ display: 'inline' }} />
                                    <span className="badge badge-cyan" style={{ marginLeft: 6 }}>{t.to_role}</span>
                                </div>
                                <div className="timeline-detail" style={{ marginTop: 4 }}>Reason: {t.transfer_reason}</div>
                                <div className="timeline-sig">Digital Signature: {t.digital_signature?.substring(0, 42)}...</div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {Object.keys(grouped).length === 0 && <div className="empty-state"><GitBranch size={48} /><h3>No Custody Transfers</h3><p>Transfers will appear here when evidence is moved between custodians</p></div>}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3>Initiate Custody Transfer</h3><button className="icon-btn" onClick={() => setShowModal(false)}>✕</button></div>
                        <form onSubmit={handleTransfer}>
                            <div className="form-group">
                                <label className="form-label">Evidence</label>
                                <select className="form-select" value={form.evidence_id} onChange={e => setForm({ ...form, evidence_id: e.target.value })} required>
                                    <option value="">Select evidence</option>
                                    {evidenceList.map(ev => <option key={ev.evidence_id} value={ev.evidence_id}>{ev.evidence_id} — {ev.evidence_title}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Transfer To</label>
                                <select className="form-select" value={form.to_user_id} onChange={e => setForm({ ...form, to_user_id: e.target.value })} required>
                                    <option value="">Select recipient</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Transfer Reason</label>
                                <textarea className="form-textarea" value={form.transfer_reason} onChange={e => setForm({ ...form, transfer_reason: e.target.value })} placeholder="Reason for custody transfer" required />
                            </div>
                            <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>Execute Transfer</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

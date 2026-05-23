import { useState, useEffect } from 'react';
import { ClipboardList, Search, Filter, AlertTriangle, ShieldCheck, Eye, Download, LogIn, UserCog, Archive, Trash2, GitBranch } from 'lucide-react';
import api from '../services/api';

const actionIcons = {
    'User Login': LogIn, 'Evidence Viewed': Eye, 'Evidence Downloaded': Download, 'Evidence Uploaded': ShieldCheck,
    'Evidence Verified': ShieldCheck, 'Custody Transfer': GitBranch, 'Evidence Archived': Archive,
    'Evidence Deleted': Trash2, 'Unauthorized Access Attempt': AlertTriangle, 'User Role Changed': UserCog, 'Case Created': ClipboardList
};

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => { api.get('/audit/logs').then(r => setLogs(r.data)).catch(console.error); }, []);

    const filtered = logs.filter(l => {
        if (statusFilter !== 'All' && l.status !== statusFilter) return false;
        if (search && !l.user_name?.toLowerCase().includes(search.toLowerCase()) && !l.action?.toLowerCase().includes(search.toLowerCase()) && !l.resource_id?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="fade-in">
            <div className="page-header"><div><h1>Audit Logs</h1><p>Complete activity tracking for legal compliance</p></div></div>
            <div className="filters-bar">
                <div className="search-bar" style={{ minWidth: 280 }}>
                    <Search size={16} style={{ color: 'var(--text-muted)' }} />
                    <input type="text" placeholder="Search by user, action, evidence..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {['All', 'Success', 'Failed'].map(s => (
                    <button key={s} className={`filter-chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>{s}</button>
                ))}
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr><th>User</th><th>Action</th><th>Resource</th><th>Resource ID</th><th>IP Address</th><th>Device</th><th>Status</th><th>Timestamp</th></tr>
                    </thead>
                    <tbody>
                        {filtered.map((l, i) => {
                            const Icon = actionIcons[l.action] || ClipboardList;
                            return (
                                <tr key={i}>
                                    <td><div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{l.user_name || l.user_id}</div></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Icon size={14} style={{ color: l.action.includes('Unauthorized') ? 'var(--accent-red)' : 'var(--accent-cyan)' }} />
                                            {l.action}
                                        </div>
                                    </td>
                                    <td><span className="badge badge-info">{l.resource_type}</span></td>
                                    <td><span className="mono">{l.resource_id || '—'}</span></td>
                                    <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{l.ip_address}</td>
                                    <td style={{ fontSize: 12 }}>{l.device}</td>
                                    <td><span className={`badge ${l.status === 'Success' ? 'badge-verified' : 'badge-compromised'}`}>{l.status}</span></td>
                                    <td style={{ fontSize: 12 }}>{new Date(l.timestamp).toLocaleString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filtered.length === 0 && <div className="empty-state"><ClipboardList size={48} /><h3>No Logs Found</h3></div>}
            </div>
        </div>
    );
}

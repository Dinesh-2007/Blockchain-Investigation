import { useState, useEffect } from 'react';
import { Blocks, ExternalLink, Search, Filter } from 'lucide-react';
import api from '../services/api';

export default function BlockchainRecords() {
    const [records, setRecords] = useState([]);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    useEffect(() => { api.get('/blockchain/records').then(r => setRecords(r.data)).catch(console.error); }, []);

    const eventTypes = ['All', ...new Set(records.map(r => r.event_type))];
    const filtered = records.filter(r => {
        if (filter !== 'All' && r.event_type !== filter) return false;
        if (search && !r.evidence_id?.toLowerCase().includes(search.toLowerCase()) && !r.transaction_id?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="fade-in">
            <div className="page-header">
                <div><h1>Blockchain Registry</h1><p>{records.length} immutable records on distributed ledger</p></div>
            </div>

            <div className="filters-bar">
                <div className="search-bar" style={{ minWidth: 280 }}>
                    <Search size={16} style={{ color: 'var(--text-muted)' }} />
                    <input type="text" placeholder="Search by evidence ID or TX..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {eventTypes.map(e => (
                    <button key={e} className={`filter-chip ${filter === e ? 'active' : ''}`} onClick={() => setFilter(e)}>{e}</button>
                ))}
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Evidence ID</th>
                            <th>Event</th>
                            <th>Hash</th>
                            <th>Transaction ID</th>
                            <th>Block #</th>
                            <th>Network</th>
                            <th>Gas Fee</th>
                            <th>Status</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((r, i) => (
                            <tr key={i}>
                                <td><span className="mono">{r.evidence_id}</span></td>
                                <td><span className={`badge ${r.event_type === 'Evidence Registration' ? 'badge-info' : r.event_type === 'Custody Transfer' ? 'badge-purple' : 'badge-verified'}`}>{r.event_type}</span></td>
                                <td><span className="mono" style={{ fontSize: 11 }}>{r.hash_value?.substring(0, 16)}...</span></td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span className="mono" style={{ fontSize: 11 }}>{r.transaction_id?.substring(0, 18)}...</span>
                                        <a href={r.verification_link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)' }}><ExternalLink size={12} /></a>
                                    </div>
                                </td>
                                <td style={{ fontWeight: 600 }}>{r.block_number?.toLocaleString()}</td>
                                <td><span className="badge badge-cyan">{r.network}</span></td>
                                <td style={{ fontSize: 12 }}>{r.gas_fee} ETH</td>
                                <td><span className="badge badge-verified">{r.confirmation_status}</span></td>
                                <td style={{ fontSize: 12 }}>{new Date(r.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && <div className="empty-state"><Blocks size={48} /><h3>No Records Found</h3></div>}
            </div>
        </div>
    );
}

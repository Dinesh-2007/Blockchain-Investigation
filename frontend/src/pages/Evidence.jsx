import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, Search, Filter, Upload, ShieldCheck, AlertTriangle, Clock, Video, Image, File, Mic, HardDrive, Globe, Bug, Mail } from 'lucide-react';
import api from '../services/api';

const categoryIcons = { 'Video': Video, 'Image': Image, 'Document': FileText, 'Audio': Mic, 'Disk Image': HardDrive, 'Network Logs': Globe, 'Malware Sample': Bug, 'Digital Communications': Mail };
const statusBadge = { 'Verified': 'badge-verified', 'Compromised': 'badge-compromised', 'Pending': 'badge-pending' };

function formatSize(bytes) {
    if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + ' GB';
    if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB';
    if (bytes >= 1e3) return (bytes / 1e3).toFixed(1) + ' KB';
    return bytes + ' B';
}

export default function Evidence() {
    const [evidence, setEvidence] = useState([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const params = {};
        const caseId = searchParams.get('case_id');
        if (caseId) params.case_id = caseId;
        api.get('/evidence', { params }).then(r => setEvidence(r.data)).catch(console.error);
    }, [searchParams]);

    const categories = ['All', ...new Set(evidence.map(e => e.evidence_category))];
    const filtered = evidence.filter(e => {
        if (categoryFilter !== 'All' && e.evidence_category !== categoryFilter) return false;
        if (search && !e.evidence_title.toLowerCase().includes(search.toLowerCase()) && !e.file_name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="fade-in">
            <div className="page-header">
                <div><h1>Evidence Registry</h1><p>{evidence.length} evidence records {searchParams.get('case_id') ? `for ${searchParams.get('case_id')}` : ''}</p></div>
                <button className="btn btn-primary" onClick={() => navigate('/evidence/upload')}><Upload size={16} /> Upload Evidence</button>
            </div>

            <div className="filters-bar">
                <div className="search-bar" style={{ minWidth: 280 }}>
                    <Search size={16} style={{ color: 'var(--text-muted)' }} />
                    <input type="text" placeholder="Search evidence..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {categories.map(c => (
                    <button key={c} className={`filter-chip ${categoryFilter === c ? 'active' : ''}`} onClick={() => setCategoryFilter(c)}>{c}</button>
                ))}
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Evidence ID</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Case</th>
                            <th>Size</th>
                            <th>Hash</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(e => {
                            const Icon = categoryIcons[e.evidence_category] || FileText;
                            return (
                                <tr key={e.evidence_id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/evidence/${e.evidence_id}`)}>
                                    <td><span className="mono">{e.evidence_id}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Icon size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.evidence_title}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.file_name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="badge badge-cyan">{e.evidence_category}</span></td>
                                    <td><span style={{ fontSize: 12 }}>{e.case_id}</span></td>
                                    <td>{formatSize(e.file_size)}</td>
                                    <td><span className="mono" style={{ fontSize: 11 }}>{e.file_hash?.substring(0, 16)}...</span></td>
                                    <td><span className={`badge ${statusBadge[e.verification_status] || 'badge-pending'}`}>
                                        {e.verification_status === 'Verified' && <ShieldCheck size={10} />}
                                        {e.verification_status === 'Compromised' && <AlertTriangle size={10} />}
                                        {e.verification_status}
                                    </span></td>
                                    <td style={{ fontSize: 12 }}>{new Date(e.upload_timestamp).toLocaleDateString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filtered.length === 0 && <div className="empty-state"><h3>No evidence found</h3><p>Try adjusting your search or filters</p></div>}
            </div>
        </div>
    );
}

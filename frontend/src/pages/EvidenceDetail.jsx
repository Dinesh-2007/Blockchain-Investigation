import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Blocks, GitBranch, ShieldCheck, AlertTriangle, Hash, Clock, User, MapPin, Cpu, ArrowLeft } from 'lucide-react';
import api from '../services/api';

function formatSize(bytes) {
    if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + ' GB';
    if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB';
    if (bytes >= 1e3) return (bytes / 1e3).toFixed(1) + ' KB';
    return bytes + ' B';
}

export default function EvidenceDetail() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => { api.get(`/evidence/${id}`).then(r => setData(r.data)).catch(console.error); }, [id]);

    if (!data) return <div className="empty-state"><p>Loading evidence details...</p></div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button className="icon-btn" onClick={() => navigate('/evidence')}><ArrowLeft size={16} /></button>
                    <div>
                        <h1>{data.evidence_title}</h1>
                        <p style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span className="mono" style={{ color: 'var(--accent-cyan)' }}>{data.evidence_id}</span>
                            <span className={`badge ${data.verification_status === 'Verified' ? 'badge-verified' : 'badge-compromised'}`}>
                                {data.verification_status === 'Verified' ? <ShieldCheck size={10} /> : <AlertTriangle size={10} />}
                                {data.verification_status}
                            </span>
                            <span className="badge badge-cyan">{data.evidence_category}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="detail-grid">
                <div>
                    {/* Evidence Metadata */}
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="detail-section">
                            <h3><FileText size={16} style={{ color: 'var(--accent-cyan)' }} /> Evidence Metadata</h3>
                            <div className="detail-row"><span className="label">Evidence ID</span><span className="value mono">{data.evidence_id}</span></div>
                            <div className="detail-row"><span className="label">Case ID</span><span className="value mono">{data.case_id}</span></div>
                            <div className="detail-row"><span className="label">Case</span><span className="value">{data.case_title}</span></div>
                            <div className="detail-row"><span className="label">File Name</span><span className="value">{data.file_name}</span></div>
                            <div className="detail-row"><span className="label">File Size</span><span className="value">{formatSize(data.file_size)}</span></div>
                            <div className="detail-row"><span className="label">File Type</span><span className="value">{data.file_type}</span></div>
                            <div className="detail-row"><span className="label">Category</span><span className="value">{data.evidence_category}</span></div>
                            <div className="detail-row"><span className="label">Uploaded By</span><span className="value">{data.uploader_name}</span></div>
                            <div className="detail-row"><span className="label">Upload Date</span><span className="value">{new Date(data.upload_timestamp).toLocaleString()}</span></div>
                        </div>
                    </div>

                    {/* Forensic Metadata */}
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="detail-section">
                            <h3><Cpu size={16} style={{ color: 'var(--accent-purple)' }} /> Forensic Metadata</h3>
                            <div className="detail-row"><span className="label">Collection Method</span><span className="value">{data.collection_method || 'N/A'}</span></div>
                            <div className="detail-row"><span className="label">Tool Used</span><span className="value">{data.tool_used || 'N/A'}</span></div>
                            <div className="detail-row"><span className="label">Investigator</span><span className="value">{data.investigator_name || 'N/A'}</span></div>
                            <div className="detail-row"><span className="label">Device Source</span><span className="value">{data.device_source || 'N/A'}</span></div>
                            <div className="detail-row"><span className="label">Location</span><span className="value">{data.location_collected || 'N/A'}</span></div>
                            <div className="detail-row"><span className="label">Acquisition Date</span><span className="value">{data.acquisition_date ? new Date(data.acquisition_date).toLocaleString() : 'N/A'}</span></div>
                        </div>
                    </div>

                    {/* Cryptographic Details */}
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="detail-section">
                            <h3><Hash size={16} style={{ color: 'var(--accent-emerald)' }} /> Cryptographic Details</h3>
                            <div className="detail-row"><span className="label">Hash Algorithm</span><span className="value">{data.hash_algorithm || 'SHA-256'}</span></div>
                            <div className="detail-row"><span className="label">File Hash (SHA-256)</span><span className="value mono" style={{ fontSize: 11 }}>{data.file_hash}</span></div>
                            <div className="detail-row"><span className="label">Integrity Score</span>
                                <span className="value" style={{ color: data.integrity_score === 100 ? 'var(--accent-emerald)' : 'var(--accent-red)' }}>
                                    {data.integrity_score}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Chain of Custody Timeline */}
                    {data.custody?.length > 0 && (
                        <div className="card">
                            <div className="detail-section">
                                <h3><GitBranch size={16} style={{ color: 'var(--accent-amber)' }} /> Chain of Custody</h3>
                                <div className="timeline">
                                    <div className="timeline-item">
                                        <div className="timeline-time">{new Date(data.upload_timestamp).toLocaleString()}</div>
                                        <div className="timeline-action">Evidence Uploaded</div>
                                        <div className="timeline-detail">Uploaded by {data.uploader_name}</div>
                                    </div>
                                    {data.custody.map((ct, i) => (
                                        <div className="timeline-item" key={i}>
                                            <div className="timeline-time">{new Date(ct.timestamp).toLocaleString()}</div>
                                            <div className="timeline-action">Custody Transferred</div>
                                            <div className="timeline-detail">{ct.from_name} ({ct.from_role}) → {ct.to_name} ({ct.to_role})</div>
                                            <div className="timeline-detail" style={{ marginTop: 2 }}>Reason: {ct.transfer_reason}</div>
                                            <div className="timeline-sig">Signature: {ct.digital_signature?.substring(0, 42)}...</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right sidebar */}
                <div>
                    {/* Blockchain Records */}
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="detail-section">
                            <h3><Blocks size={16} style={{ color: 'var(--accent-cyan)' }} /> Blockchain Records</h3>
                            {data.blockchain?.map((bc, i) => (
                                <div key={i} style={{ marginBottom: 16, padding: 12, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                                    <span className="badge badge-cyan" style={{ marginBottom: 8 }}>{bc.event_type}</span>
                                    <div className="detail-row"><span className="label">TX ID</span><span className="value mono" style={{ fontSize: 10 }}>{bc.transaction_id?.substring(0, 24)}...</span></div>
                                    <div className="detail-row"><span className="label">Block #</span><span className="value">{bc.block_number}</span></div>
                                    <div className="detail-row"><span className="label">Network</span><span className="value">{bc.network}</span></div>
                                    <div className="detail-row"><span className="label">Gas Fee</span><span className="value">{bc.gas_fee} ETH</span></div>
                                    <div className="detail-row"><span className="label">Status</span><span className="value badge badge-verified" style={{ padding: '2px 8px' }}>{bc.confirmation_status}</span></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Verification History */}
                    {data.verifications?.length > 0 && (
                        <div className="card">
                            <div className="detail-section">
                                <h3><ShieldCheck size={16} style={{ color: 'var(--accent-emerald)' }} /> Verification History</h3>
                                {data.verifications.map((v, i) => (
                                    <div key={i} style={{ padding: 10, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', marginBottom: 8 }}>
                                        <span className={`badge ${v.status === 'Verified' ? 'badge-verified' : 'badge-compromised'}`}>{v.status}</span>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{new Date(v.timestamp).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

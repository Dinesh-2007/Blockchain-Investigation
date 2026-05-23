import { useState, useRef } from 'react';
import { Upload, ShieldCheck, AlertTriangle, HelpCircle, Hash, FileText } from 'lucide-react';
import api from '../services/api';

export default function Verification() {
    const [file, setFile] = useState(null);
    const [evidenceId, setEvidenceId] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef();

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!file && !evidenceId) return;
        setVerifying(true);
        try {
            const formData = new FormData();
            if (file) formData.append('file', file);
            if (evidenceId) formData.append('evidence_id', evidenceId);
            const { data } = await api.post('/verification/verify', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setResult(data);
        } catch (err) {
            alert('Verification failed');
        }
        setVerifying(false);
    };

    const resultConfig = {
        'Verified': { icon: ShieldCheck, color: 'var(--accent-emerald)', bg: 'verified', emoji: '✅', text: 'Evidence Integrity Verified' },
        'Integrity Compromised': { icon: AlertTriangle, color: 'var(--accent-red)', bg: 'compromised', emoji: '🚨', text: 'Integrity Compromised — Evidence Tampered' },
        'Unknown Evidence': { icon: HelpCircle, color: 'var(--accent-amber)', bg: 'unknown', emoji: '⚠️', text: 'Evidence Not Found in Registry' }
    };

    return (
        <div className="fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>
            <div className="page-header" style={{ textAlign: 'center', display: 'block' }}>
                <h1>Evidence Verification</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Upload a file to verify its integrity against blockchain records</p>
            </div>

            {/* Workflow Diagram */}
            <div className="card" style={{ marginBottom: 24, textAlign: 'center', padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span className="badge badge-info"><Upload size={10} /> Upload File</span>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                    <span className="badge badge-cyan"><Hash size={10} /> Generate SHA-256</span>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                    <span className="badge badge-purple"><FileText size={10} /> Fetch Blockchain Hash</span>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                    <span className="badge badge-verified"><ShieldCheck size={10} /> Compare</span>
                </div>
            </div>

            <form onSubmit={handleVerify}>
                <div className="card" style={{ marginBottom: 20 }}>
                    <div className="form-group">
                        <label className="form-label">Evidence ID (Optional)</label>
                        <input className="form-input" value={evidenceId} onChange={e => setEvidenceId(e.target.value)} placeholder="e.g. EV-101 — Leave empty to search by hash" />
                    </div>

                    <div className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                        onDrop={e => { e.preventDefault(); setDragOver(false); setFile(e.dataTransfer.files[0]); }}
                        onClick={() => fileRef.current?.click()}>
                        <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
                        <Upload size={40} />
                        <p><strong>Drop evidence file here</strong> or click to browse</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>The file will be hashed and compared against the stored hash</p>
                        {file && <div className="file-info"><FileText size={14} style={{ display: 'inline' }} /> {file.name} ({(file.size / 1e6).toFixed(2)} MB)</div>}
                    </div>
                </div>

                <button className="btn btn-primary" type="submit" disabled={verifying || (!file && !evidenceId)} style={{ width: '100%', justifyContent: 'center', padding: '14px 20px' }}>
                    {verifying ? 'Verifying Integrity...' : <><ShieldCheck size={16} /> Verify Evidence Integrity</>}
                </button>
            </form>

            {result && (() => {
                const cfg = resultConfig[result.status] || resultConfig['Unknown Evidence'];
                return (
                    <div className={`verification-result ${cfg.bg}`}>
                        <div className="result-icon">{cfg.emoji}</div>
                        <h3 style={{ color: cfg.color }}>{cfg.text}</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
                            {result.evidence_id && <>Evidence: <strong>{result.evidence_id}</strong> — {result.evidence_title}</>}
                        </p>
                        <div className="hash-display">
                            <div style={{ marginBottom: 8 }}>
                                <span style={{ color: 'var(--text-muted)' }}>Recalculated Hash: </span>
                                <span style={{ color: result.status === 'Verified' ? 'var(--accent-emerald)' : 'var(--accent-red)' }}>{result.hash_generated || 'N/A'}</span>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <span style={{ color: 'var(--text-muted)' }}>Stored Hash: </span>
                                <span style={{ color: 'var(--accent-cyan)' }}>{result.hash_stored || 'N/A'}</span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)' }}>Match: </span>
                                <span style={{ color: result.status === 'Verified' ? 'var(--accent-emerald)' : 'var(--accent-red)', fontWeight: 700 }}>
                                    {result.status === 'Verified' ? '✓ MATCH' : '✗ MISMATCH'}
                                </span>
                            </div>
                        </div>
                        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                            Verified by: {result.verified_by} • {new Date(result.timestamp).toLocaleString()}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

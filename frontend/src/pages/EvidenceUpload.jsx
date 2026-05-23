import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Check, Blocks, Hash } from 'lucide-react';
import api from '../services/api';

export default function EvidenceUpload() {
    const [cases, setCases] = useState([]);
    const [file, setFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const fileRef = useRef();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        case_id: '', evidence_title: '', evidence_description: '', evidence_category: 'Document',
        device_source: '', location_collected: '', collection_method: '', tool_used: '', investigator_name: ''
    });

    useEffect(() => { api.get('/cases').then(r => setCases(r.data)).catch(console.error); }, []);

    const handleDrop = (e) => { e.preventDefault(); setDragOver(false); setFile(e.dataTransfer.files[0]); };
    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            if (file) formData.append('file', file);
            const { data } = await api.post('/evidence/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setResult(data);
        } catch (err) {
            alert(err.response?.data?.error || 'Upload failed');
        }
        setSubmitting(false);
    };

    if (result) {
        return (
            <div className="fade-in" style={{ maxWidth: 640, margin: '0 auto' }}>
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <Check size={32} style={{ color: 'var(--accent-emerald)' }} />
                    </div>
                    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Evidence Registered Successfully</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Evidence has been hashed and recorded on the blockchain</p>
                    <div style={{ textAlign: 'left', background: 'var(--bg-input)', padding: 20, borderRadius: 'var(--radius-sm)', marginBottom: 20 }}>
                        <div className="detail-row"><span className="label">Evidence ID</span><span className="value mono">{result.evidence?.evidence_id}</span></div>
                        <div className="detail-row"><span className="label">SHA-256 Hash</span><span className="value mono" style={{ fontSize: 11 }}>{result.evidence?.file_hash}</span></div>
                        <div className="detail-row"><span className="label">Blockchain TX</span><span className="value mono" style={{ fontSize: 11 }}>{result.blockchain?.transaction_id?.substring(0, 32)}...</span></div>
                        <div className="detail-row"><span className="label">Block #</span><span className="value">{result.blockchain?.block_number}</span></div>
                        <div className="detail-row"><span className="label">Network</span><span className="value">{result.blockchain?.network}</span></div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <button className="btn btn-primary" onClick={() => navigate(`/evidence/${result.evidence?.evidence_id}`)}>View Evidence</button>
                        <button className="btn btn-secondary" onClick={() => { setResult(null); setFile(null); setForm({ ...form, evidence_title: '', evidence_description: '' }); }}>Upload Another</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header"><div><h1>Upload Evidence</h1><p>Register new digital evidence with blockchain integrity verification</p></div></div>
            <form onSubmit={handleSubmit} style={{ maxWidth: 800 }}>
                <div className="grid-2" style={{ marginBottom: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Case ID *</label>
                        <select className="form-select" value={form.case_id} onChange={e => setForm({ ...form, case_id: e.target.value })} required>
                            <option value="">Select a case</option>
                            {cases.map(c => <option key={c.case_id} value={c.case_id}>{c.case_id} — {c.case_title}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Evidence Category</label>
                        <select className="form-select" value={form.evidence_category} onChange={e => setForm({ ...form, evidence_category: e.target.value })}>
                            {['Document', 'Video', 'Image', 'Audio', 'Disk Image', 'Network Logs', 'Malware Sample', 'Digital Communications'].map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Evidence Title *</label>
                    <input className="form-input" value={form.evidence_title} onChange={e => setForm({ ...form, evidence_title: e.target.value })} required placeholder="e.g. Server Access Logs — Jan 2024" />
                </div>
                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" value={form.evidence_description} onChange={e => setForm({ ...form, evidence_description: e.target.value })} placeholder="Describe the evidence and its relevance to the case" />
                </div>

                <div className="upload-zone" style={{ marginBottom: 20 }} className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => fileRef.current?.click()}>
                    <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} />
                    <Upload size={40} />
                    <p><strong>Drag & drop file</strong> or click to browse</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Supports all file types up to 500MB</p>
                    {file && <div className="file-info"><FileText size={14} style={{ display: 'inline' }} /> {file.name} ({(file.size / 1e6).toFixed(2)} MB)</div>}
                </div>

                <div className="card" style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={16} /> Forensic Metadata</h3>
                    <div className="grid-2">
                        <div className="form-group"><label className="form-label">Source Device</label><input className="form-input" value={form.device_source} onChange={e => setForm({ ...form, device_source: e.target.value })} placeholder="e.g. Dell Workstation" /></div>
                        <div className="form-group"><label className="form-label">Collection Location</label><input className="form-input" value={form.location_collected} onChange={e => setForm({ ...form, location_collected: e.target.value })} placeholder="e.g. Evidence Lab A" /></div>
                        <div className="form-group"><label className="form-label">Collection Method</label><input className="form-input" value={form.collection_method} onChange={e => setForm({ ...form, collection_method: e.target.value })} placeholder="e.g. Forensic Imaging" /></div>
                        <div className="form-group"><label className="form-label">Tool Used</label><input className="form-input" value={form.tool_used} onChange={e => setForm({ ...form, tool_used: e.target.value })} placeholder="e.g. EnCase Forensic" /></div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}><label className="form-label">Investigator Name</label><input className="form-input" value={form.investigator_name} onChange={e => setForm({ ...form, investigator_name: e.target.value })} placeholder="Name of the investigating officer" /></div>
                    </div>
                </div>

                <button className="btn btn-primary" type="submit" disabled={submitting} style={{ padding: '12px 32px' }}>
                    {submitting ? 'Processing...' : <><Hash size={16} /> Generate Hash & Register on Blockchain</>}
                </button>
            </form>
        </div>
    );
}

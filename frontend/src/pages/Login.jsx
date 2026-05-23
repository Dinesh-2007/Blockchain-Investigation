import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('john@police.gov');
    const [password, setPassword] = useState('password123');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    const demoUsers = [
        { email: 'john@police.gov', role: 'Law Enforcement' },
        { email: 'sarah@forensics.gov', role: 'Forensic Analyst' },
        { email: 'james@court.gov', role: 'Prosecutor' },
        { email: 'admin@system.gov', role: 'System Admin' },
    ];

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="logo-section">
                    <div className="logo-icon"><Shield size={28} /></div>
                    <h2>DEIS Platform</h2>
                    <p className="subtitle">Digital Evidence Integrity System</p>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && <div style={{ color: 'var(--accent-red)', fontSize: 13, marginBottom: 16, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>{error}</div>}
                    <div className="form-group">
                        <label className="form-label"><Mail size={14} style={{ display: 'inline', marginRight: 6 }} />Email</label>
                        <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label"><Lock size={14} style={{ display: 'inline', marginRight: 6 }} />Password</label>
                        <div style={{ position: 'relative' }}>
                            <input className="form-input" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '12px 20px' }}>
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Demo Accounts (password: password123)</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        {demoUsers.map(u => (
                            <button key={u.email} onClick={() => { setEmail(u.email); setPassword('password123'); }}
                                style={{ padding: '6px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: 11, color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left' }}>
                                <div style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{u.role}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{u.email}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

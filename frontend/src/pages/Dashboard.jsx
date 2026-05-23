import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, FileText, ShieldCheck, AlertTriangle, GitBranch, Users, Blocks, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } } } },
    scales: { x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(56,189,248,0.06)' } }, y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(56,189,248,0.06)' } } }
};

export default function Dashboard() {
    const [data, setData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/analytics/dashboard').then(r => setData(r.data)).catch(console.error);
    }, []);

    if (!data) return <div className="empty-state"><div className="pulse">Loading dashboard...</div></div>;

    const stats = [
        { icon: Briefcase, label: 'Total Cases', value: data.stats.totalCases, gradient: 'var(--gradient-primary)', change: '+2 this week', positive: true },
        { icon: FileText, label: 'Evidence Files', value: data.stats.totalEvidence, gradient: 'var(--gradient-emerald)', change: '+5 this week', positive: true },
        { icon: ShieldCheck, label: 'Verified', value: data.stats.verifiedEvidence, gradient: 'linear-gradient(135deg, #10b981, #059669)', change: '93% rate', positive: true },
        { icon: AlertTriangle, label: 'Integrity Violations', value: data.stats.compromisedEvidence, gradient: 'var(--gradient-amber)', change: '1 new alert', positive: false },
        { icon: GitBranch, label: 'Custody Transfers', value: data.stats.totalTransfers, gradient: 'var(--gradient-purple)', change: '+3 today', positive: true },
        { icon: Users, label: 'Active Users', value: data.stats.activeUsers, gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)', change: 'All active', positive: true },
        { icon: Blocks, label: 'Blockchain Records', value: data.stats.totalBlockchainRecords, gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', change: 'All confirmed', positive: true },
    ];

    const categoryData = {
        labels: data.evidenceByCategory.map(e => e.evidence_category),
        datasets: [{
            data: data.evidenceByCategory.map(e => e.count),
            backgroundColor: ['#22d3ee', '#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'],
            borderWidth: 0
        }]
    };

    const statusData = {
        labels: data.casesByStatus.map(c => c.status),
        datasets: [{
            label: 'Cases', data: data.casesByStatus.map(c => c.count),
            backgroundColor: 'rgba(34, 211, 238, 0.6)', borderColor: '#22d3ee', borderWidth: 1, borderRadius: 6
        }]
    };

    const verificationData = {
        labels: data.evidenceByStatus.map(s => s.verification_status),
        datasets: [{
            data: data.evidenceByStatus.map(s => s.count),
            backgroundColor: ['rgba(16,185,129,0.7)', 'rgba(239,68,68,0.7)', 'rgba(245,158,11,0.7)'],
            borderWidth: 0
        }]
    };

    const activityColors = { 'Evidence Uploaded': '#10b981', 'Evidence Viewed': '#3b82f6', 'User Login': '#a855f7', 'Custody Transfer': '#22d3ee', 'Evidence Verified': '#f59e0b', 'Evidence Archived': '#64748b', 'Unauthorized Access Attempt': '#ef4444' };

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Digital Evidence Integrity System — Overview</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/evidence/upload')}>
                    <FileText size={16} /> Upload Evidence
                </button>
            </div>

            <div className="stats-grid">
                {stats.map((s, i) => (
                    <div className="stat-card" key={i} style={{ '--card-accent': s.gradient }}>
                        <div className="stat-icon" style={{ background: s.gradient.replace('linear-gradient', 'linear-gradient').replace(/[^,]+,/, 'linear-gradient(135deg,').slice(0, -1) + ', 0.15)' || 'rgba(34,211,238,0.1)' }}>
                            <s.icon size={20} style={{ color: 'var(--accent-cyan)' }} />
                        </div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                        <div className={`stat-change ${s.positive ? 'positive' : 'negative'}`}>
                            {s.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {s.change}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid-3" style={{ marginBottom: 24 }}>
                <div className="card">
                    <div className="card-header"><span className="card-title">Evidence by Category</span></div>
                    <div className="chart-container" style={{ height: 240 }}>
                        <Doughnut data={categoryData} options={{ ...chartOptions, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12, font: { size: 10 } } } } }} />
                    </div>
                </div>
                <div className="card">
                    <div className="card-header"><span className="card-title">Cases by Status</span></div>
                    <div className="chart-container" style={{ height: 240 }}>
                        <Bar data={statusData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} />
                    </div>
                </div>
                <div className="card">
                    <div className="card-header"><span className="card-title">Verification Status</span></div>
                    <div className="chart-container" style={{ height: 240 }}>
                        <Doughnut data={verificationData} options={{ ...chartOptions, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12, font: { size: 10 } } } } }} />
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <span className="card-title">Recent Activity</span>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/audit')}>View All</button>
                </div>
                {data.recentActivity.map((a, i) => (
                    <div className="activity-item" key={i}>
                        <div className="activity-dot" style={{ background: activityColors[a.action] || '#64748b' }}></div>
                        <div className="activity-content">
                            <div className="action"><strong>{a.user_name}</strong> — {a.action} {a.resource_id && <span className="badge badge-info">{a.resource_id}</span>}</div>
                            <div className="meta">{a.ip_address} • {a.device} • {new Date(a.timestamp).toLocaleString()}</div>
                        </div>
                        <span className={`badge ${a.status === 'Success' ? 'badge-verified' : 'badge-compromised'}`}>{a.status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

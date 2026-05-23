import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, RadialLinearScale } from 'chart.js';
import { Doughnut, Bar, Line, PolarArea } from 'react-chartjs-2';
import { BarChart3 } from 'lucide-react';
import api from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, RadialLinearScale);

const colors = ['#22d3ee', '#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

export default function Analytics() {
    const [dashboard, setDashboard] = useState(null);
    const [custodyStats, setCustodyStats] = useState(null);

    useEffect(() => {
        api.get('/analytics/dashboard').then(r => setDashboard(r.data)).catch(console.error);
        api.get('/analytics/custody-stats').then(r => setCustodyStats(r.data)).catch(console.error);
    }, []);

    if (!dashboard) return <div className="empty-state"><p>Loading analytics...</p></div>;

    const categoryChart = {
        labels: dashboard.evidenceByCategory.map(e => e.evidence_category),
        datasets: [{
            data: dashboard.evidenceByCategory.map(e => e.count),
            backgroundColor: colors.map(c => c + 'cc'),
            borderWidth: 0
        }]
    };

    const statusChart = {
        labels: dashboard.evidenceByStatus.map(e => e.verification_status),
        datasets: [{
            data: dashboard.evidenceByStatus.map(e => e.count),
            backgroundColor: ['rgba(16,185,129,0.7)', 'rgba(239,68,68,0.7)', 'rgba(245,158,11,0.7)'],
            borderWidth: 0
        }]
    };

    const caseChart = {
        labels: dashboard.casesByStatus.map(c => c.status),
        datasets: [{
            label: 'Cases', data: dashboard.casesByStatus.map(c => c.count),
            backgroundColor: colors.slice(0, dashboard.casesByStatus.length).map(c => c + '99'),
            borderColor: colors.slice(0, dashboard.casesByStatus.length),
            borderWidth: 2, borderRadius: 8
        }]
    };

    const custodyChart = custodyStats ? {
        labels: custodyStats.byRole.map(r => r.to_role),
        datasets: [{
            label: 'Transfers', data: custodyStats.byRole.map(r => r.count),
            backgroundColor: colors.slice(0, custodyStats.byRole.length).map(c => c + '99'),
            borderColor: colors.slice(0, custodyStats.byRole.length),
            borderWidth: 1
        }]
    } : null;

    const opts = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } } } },
        scales: { x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(56,189,248,0.06)' } }, y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(56,189,248,0.06)' } } }
    };
    const dOpts = { ...opts, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 14, font: { size: 11 } } } } };

    return (
        <div className="fade-in">
            <div className="page-header"><div><h1>Analytics Dashboard</h1><p>System-wide insights and performance metrics</p></div></div>

            <div className="stats-grid" style={{ marginBottom: 24 }}>
                {[
                    { label: 'Total Cases', value: dashboard.stats.totalCases, color: '#22d3ee' },
                    { label: 'Evidence Files', value: dashboard.stats.totalEvidence, color: '#10b981' },
                    { label: 'Verified', value: dashboard.stats.verifiedEvidence, color: '#3b82f6' },
                    { label: 'Integrity Failures', value: dashboard.stats.compromisedEvidence, color: '#ef4444' },
                    { label: 'Transfers', value: dashboard.stats.totalTransfers, color: '#a855f7' },
                    { label: 'Blockchain Records', value: dashboard.stats.totalBlockchainRecords, color: '#f59e0b' },
                ].map((s, i) => (
                    <div className="stat-card" key={i} style={{ '--card-accent': s.color }}>
                        <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="card">
                    <div className="card-header"><span className="card-title">Evidence by Category</span></div>
                    <div className="chart-container"><Doughnut data={categoryChart} options={dOpts} /></div>
                </div>
                <div className="card">
                    <div className="card-header"><span className="card-title">Verification Results</span></div>
                    <div className="chart-container"><Doughnut data={statusChart} options={dOpts} /></div>
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="card">
                    <div className="card-header"><span className="card-title">Cases by Status</span></div>
                    <div className="chart-container"><Bar data={caseChart} options={{ ...opts, plugins: { legend: { display: false } } }} /></div>
                </div>
                {custodyChart && (
                    <div className="card">
                        <div className="card-header"><span className="card-title">Custody Transfers by Role</span></div>
                        <div className="chart-container"><Bar data={custodyChart} options={{ ...opts, indexAxis: 'y', plugins: { legend: { display: false } } }} /></div>
                    </div>
                )}
            </div>
        </div>
    );
}

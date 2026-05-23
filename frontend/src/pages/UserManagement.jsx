import { useState, useEffect } from 'react';
import { Users, Search, Shield, Edit2 } from 'lucide-react';
import api from '../services/api';

const roleColors = {
    'Law Enforcement Officer': 'badge-info', 'Forensic Analyst': 'badge-purple', 'Prosecutor': 'badge-pending',
    'Defense Attorney': 'badge-cyan', 'Court Clerk': 'badge-verified', 'System Admin': 'badge-compromised'
};

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [editUser, setEditUser] = useState(null);

    useEffect(() => { api.get('/users').then(r => setUsers(r.data)).catch(console.error); }, []);

    const updateUser = async (e) => {
        e.preventDefault();
        await api.put(`/users/${editUser.id}`, editUser);
        setEditUser(null);
        api.get('/users').then(r => setUsers(r.data));
    };

    const filtered = users.filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="fade-in">
            <div className="page-header"><div><h1>User Management</h1><p>Manage platform users and role assignments</p></div></div>

            <div className="filters-bar">
                <div className="search-bar" style={{ minWidth: 280 }}>
                    <Search size={16} style={{ color: 'var(--text-muted)' }} />
                    <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                    <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Organization</th><th>Department</th><th>Badge ID</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {filtered.map(u => (
                            <tr key={u.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: '#0a0e1a', flexShrink: 0 }}>
                                            {u.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</span>
                                    </div>
                                </td>
                                <td style={{ fontSize: 13 }}>{u.email}</td>
                                <td><span className={`badge ${roleColors[u.role] || 'badge-info'}`}>{u.role}</span></td>
                                <td style={{ fontSize: 13 }}>{u.organization}</td>
                                <td style={{ fontSize: 13 }}>{u.department}</td>
                                <td><span className="mono" style={{ fontSize: 12 }}>{u.badge_id || '—'}</span></td>
                                <td><span className={`badge ${u.status === 'active' ? 'badge-verified' : 'badge-compromised'}`}>{u.status}</span></td>
                                <td><button className="btn btn-secondary btn-sm" onClick={() => setEditUser({ ...u })}><Edit2 size={12} /> Edit</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editUser && (
                <div className="modal-overlay" onClick={() => setEditUser(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3>Edit User</h3><button className="icon-btn" onClick={() => setEditUser(null)}>✕</button></div>
                        <form onSubmit={updateUser}>
                            <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} /></div>
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select className="form-select" value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })}>
                                    {['Law Enforcement Officer', 'Forensic Analyst', 'Prosecutor', 'Defense Attorney', 'Court Clerk', 'System Admin'].map(r => <option key={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="grid-2">
                                <div className="form-group"><label className="form-label">Organization</label><input className="form-input" value={editUser.organization || ''} onChange={e => setEditUser({ ...editUser, organization: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Department</label><input className="form-input" value={editUser.department || ''} onChange={e => setEditUser({ ...editUser, department: e.target.value })} /></div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select className="form-select" value={editUser.status} onChange={e => setEditUser({ ...editUser, status: e.target.value })}>
                                    <option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option>
                                </select>
                            </div>
                            <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>Update User</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

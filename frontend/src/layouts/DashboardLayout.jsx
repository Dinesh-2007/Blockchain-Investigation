import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Briefcase, FileText, GitBranch, ShieldCheck, Blocks, ClipboardList, BarChart3, Users, Search, Bell, Settings, LogOut } from 'lucide-react';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', section: 'Overview' },
    { path: '/cases', icon: Briefcase, label: 'Cases', section: 'Management' },
    { path: '/evidence', icon: FileText, label: 'Evidence', section: 'Management' },
    { path: '/custody', icon: GitBranch, label: 'Custody Tracking', section: 'Management' },
    { path: '/verification', icon: ShieldCheck, label: 'Verification', section: 'Integrity' },
    { path: '/blockchain', icon: Blocks, label: 'Blockchain Registry', section: 'Integrity' },
    { path: '/audit', icon: ClipboardList, label: 'Audit Logs', section: 'Monitoring' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', section: 'Monitoring' },
    { path: '/users', icon: Users, label: 'User Management', section: 'Admin' },
];

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const currentPage = navItems.find(n => n.path === location.pathname);

    const sections = {};
    navItems.forEach(item => {
        if (!sections[item.section]) sections[item.section] = [];
        sections[item.section].push(item);
    });

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon">DE</div>
                    <div>
                        <h1>DEIS</h1>
                        <span>Evidence Integrity System</span>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    {Object.entries(sections).map(([section, items]) => (
                        <div className="nav-section" key={section}>
                            <div className="nav-section-title">{section}</div>
                            {items.map(item => (
                                <NavLink key={item.path} to={item.path} end={item.path === '/'}
                                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                    <item.icon /> {item.label}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="avatar">{user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                        <div className="user-info">
                            <div className="user-name">{user?.name}</div>
                            <div className="user-role">{user?.role}</div>
                        </div>
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 8, justifyContent: 'center' }} onClick={logout}>
                        <LogOut size={14} /> Sign Out
                    </button>
                </div>
            </aside>
            <div className="main-content">
                <header className="navbar">
                    <div className="navbar-left">
                        <h2>{currentPage?.label || 'Dashboard'}</h2>
                    </div>
                    <div className="navbar-right">
                        <div className="search-bar">
                            <Search size={16} style={{ color: 'var(--text-muted)' }} />
                            <input type="text" placeholder="Search evidence, cases..." />
                        </div>
                        <div className="icon-btn notification-dot"><Bell size={16} /></div>
                        <div className="icon-btn"><Settings size={16} /></div>
                    </div>
                </header>
                <div className="page-content fade-in">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

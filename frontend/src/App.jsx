import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import Evidence from './pages/Evidence';
import EvidenceUpload from './pages/EvidenceUpload';
import EvidenceDetail from './pages/EvidenceDetail';
import CustodyTracking from './pages/CustodyTracking';
import Verification from './pages/Verification';
import BlockchainRecords from './pages/BlockchainRecords';
import AuditLogs from './pages/AuditLogs';
import Analytics from './pages/Analytics';
import UserManagement from './pages/UserManagement';

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="cases" element={<Cases />} />
                <Route path="evidence" element={<Evidence />} />
                <Route path="evidence/upload" element={<EvidenceUpload />} />
                <Route path="evidence/:id" element={<EvidenceDetail />} />
                <Route path="custody" element={<CustodyTracking />} />
                <Route path="verification" element={<Verification />} />
                <Route path="blockchain" element={<BlockchainRecords />} />
                <Route path="audit" element={<AuditLogs />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="users" element={<UserManagement />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = 'evidence-integrity-secret-key-2024';

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

function roleMiddleware(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
}

function logAudit(db, userId, userName, action, resourceType, resourceId) {
    return db.audit_logs.insert({
        log_id: uuidv4(),
        user_id: userId,
        user_name: userName || '',
        action,
        resource_type: resourceType || '',
        resource_id: resourceId || '',
        ip_address: '192.168.1.1',
        device: 'Desktop - Chrome',
        status: 'Success',
        timestamp: new Date().toISOString()
    }).catch(() => { });
}

module.exports = { authMiddleware, roleMiddleware, logAudit, JWT_SECRET };

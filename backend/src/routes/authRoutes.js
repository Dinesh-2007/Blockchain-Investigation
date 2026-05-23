const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { JWT_SECRET, logAudit } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, organization, department, badge_id } = req.body;
        const existing = await db.users.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already registered' });

        const password_hash = bcrypt.hashSync(password, 10);
        const id = uuidv4();
        const digital_signature_key = '0x' + require('crypto').randomBytes(32).toString('hex');

        const user = await db.users.insert({
            id, name, email, password_hash,
            role: role || 'Law Enforcement Officer',
            organization: organization || '', department: department || '',
            badge_id: badge_id || '', digital_signature_key,
            status: 'active', created_at: new Date().toISOString()
        });

        const token = jwt.sign({ id, name, email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        const { password_hash: _, ...safeUser } = user;
        res.json({ token, user: safeUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db.users.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const valid = bcrypt.compareSync(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        await logAudit(db, user.id, user.name, 'User Login', 'Authentication', '');

        const { password_hash: _, ...safeUser } = user;
        res.json({ token, user: safeUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await db.users.findOne({ id: decoded.id });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const { password_hash: _, ...safeUser } = user;
        res.json(safeUser);
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;

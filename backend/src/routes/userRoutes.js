const express = require('express');
const db = require('../database');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const users = await db.users.find({}).sort({ created_at: -1 });
        res.json(users.map(({ password_hash, ...u }) => u));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const user = await db.users.findOne({ id: req.params.id });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const { password_hash, ...safeUser } = user;
        res.json(safeUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const updates = {};
        ['name', 'role', 'organization', 'department', 'status'].forEach(f => {
            if (req.body[f] !== undefined) updates[f] = req.body[f];
        });
        await db.users.update({ id: req.params.id }, { $set: updates });
        const user = await db.users.findOne({ id: req.params.id });
        const { password_hash, ...safeUser } = user;
        res.json(safeUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

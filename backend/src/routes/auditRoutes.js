const express = require('express');
const db = require('../database');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/logs', authMiddleware, async (req, res) => {
    try {
        const { user_id, action, resource_type, status } = req.query;
        const query = {};
        if (user_id) query.user_id = user_id;
        if (action) query.action = new RegExp(action, 'i');
        if (resource_type) query.resource_type = resource_type;
        if (status) query.status = status;

        const logs = await db.audit_logs.find(query).sort({ timestamp: -1 }).limit(500);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

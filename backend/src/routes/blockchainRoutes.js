const express = require('express');
const db = require('../database');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/records', authMiddleware, async (req, res) => {
    try {
        const records = await db.blockchain_records.find({}).sort({ timestamp: -1 }).limit(200);
        for (const r of records) {
            const ev = await db.evidence.findOne({ evidence_id: r.evidence_id });
            r.evidence_title = ev ? ev.evidence_title : '';
        }
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/record/:evidenceId', authMiddleware, async (req, res) => {
    try {
        const records = await db.blockchain_records.find({ evidence_id: req.params.evidenceId }).sort({ timestamp: -1 });
        for (const r of records) {
            const ev = await db.evidence.findOne({ evidence_id: r.evidence_id });
            r.evidence_title = ev ? ev.evidence_title : '';
        }
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authMiddleware, logAudit } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const cases = await db.cases.find({}).sort({ created_at: -1 });
        // Attach investigator names
        for (const c of cases) {
            if (c.investigating_officer_id) {
                const user = await db.users.findOne({ id: c.investigating_officer_id });
                c.investigator_name = user ? user.name : '';
            }
        }
        res.json(cases);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const caseData = await db.cases.findOne({ case_id: req.params.id });
        if (!caseData) return res.status(404).json({ error: 'Case not found' });

        if (caseData.investigating_officer_id) {
            const user = await db.users.findOne({ id: caseData.investigating_officer_id });
            caseData.investigator_name = user ? user.name : '';
        }
        const evidence = await db.evidence.find({ case_id: req.params.id }).sort({ upload_timestamp: -1 });
        res.json({ ...caseData, evidence });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { case_title, case_description, case_type, department, priority } = req.body;
        const case_id = 'CASE-' + Date.now().toString(36).toUpperCase();

        const newCase = await db.cases.insert({
            case_id, case_title, case_description: case_description || '',
            case_type: case_type || 'Criminal',
            investigating_officer_id: req.user.id,
            department: department || '', status: 'Investigation',
            priority: priority || 'Medium',
            created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        });

        await logAudit(db, req.user.id, req.user.name, 'Case Created', 'Case', case_id);
        res.json(newCase);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const updates = { updated_at: new Date().toISOString() };
        ['case_title', 'case_description', 'case_type', 'status', 'priority'].forEach(f => {
            if (req.body[f] !== undefined) updates[f] = req.body[f];
        });
        await db.cases.update({ case_id: req.params.id }, { $set: updates });
        const updated = await db.cases.findOne({ case_id: req.params.id });
        await logAudit(db, req.user.id, req.user.name, 'Case Updated', 'Case', req.params.id);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

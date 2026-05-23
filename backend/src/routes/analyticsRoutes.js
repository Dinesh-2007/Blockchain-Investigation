const express = require('express');
const db = require('../database');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const totalCases = await db.cases.count({});
        const totalEvidence = await db.evidence.count({});
        const verifiedEvidence = await db.evidence.count({ verification_status: 'Verified' });
        const compromisedEvidence = await db.evidence.count({ verification_status: 'Compromised' });
        const totalTransfers = await db.custody_transfers.count({});
        const activeUsers = await db.users.count({ status: 'active' });
        const totalBlockchainRecords = await db.blockchain_records.count({});

        const recentActivity = await db.audit_logs.find({}).sort({ timestamp: -1 }).limit(10);

        // Group by status/category manually
        const allCases = await db.cases.find({});
        const casesByStatus = {};
        allCases.forEach(c => { casesByStatus[c.status] = (casesByStatus[c.status] || 0) + 1; });

        const allEvidence = await db.evidence.find({});
        const evidenceByCategory = {};
        allEvidence.forEach(e => { evidenceByCategory[e.evidence_category] = (evidenceByCategory[e.evidence_category] || 0) + 1; });
        const evidenceByStatus = {};
        allEvidence.forEach(e => { evidenceByStatus[e.verification_status] = (evidenceByStatus[e.verification_status] || 0) + 1; });

        res.json({
            stats: { totalCases, totalEvidence, verifiedEvidence, compromisedEvidence, totalTransfers, activeUsers, totalBlockchainRecords },
            recentActivity,
            casesByStatus: Object.entries(casesByStatus).map(([status, count]) => ({ status, count })),
            evidenceByCategory: Object.entries(evidenceByCategory).map(([evidence_category, count]) => ({ evidence_category, count })),
            evidenceByStatus: Object.entries(evidenceByStatus).map(([verification_status, count]) => ({ verification_status, count }))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/evidence-trends', authMiddleware, async (req, res) => {
    try {
        const allEvidence = await db.evidence.find({});
        const byDate = {};
        allEvidence.forEach(e => {
            const date = e.upload_timestamp ? e.upload_timestamp.split('T')[0] : 'unknown';
            byDate[date] = (byDate[date] || 0) + 1;
        });
        const trends = Object.entries(byDate).map(([date, count]) => ({ date, count })).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);
        res.json(trends);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/custody-stats', authMiddleware, async (req, res) => {
    try {
        const all = await db.custody_transfers.find({});
        const byRole = {};
        all.forEach(t => { byRole[t.to_role] = (byRole[t.to_role] || 0) + 1; });
        const byStatus = {};
        all.forEach(t => { byStatus[t.status] = (byStatus[t.status] || 0) + 1; });
        res.json({
            byRole: Object.entries(byRole).map(([to_role, count]) => ({ to_role, count })),
            byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count }))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

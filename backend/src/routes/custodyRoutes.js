const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authMiddleware, logAudit } = require('../middleware/authMiddleware');
const { createBlockchainRecord } = require('../services/blockchainService');

const router = express.Router();

router.get('/history/:evidenceId', authMiddleware, async (req, res) => {
    try {
        const transfers = await db.custody_transfers.find({ evidence_id: req.params.evidenceId }).sort({ timestamp: 1 });
        for (const t of transfers) {
            const from = await db.users.findOne({ id: t.from_user_id });
            const to = await db.users.findOne({ id: t.to_user_id });
            t.from_name = from ? from.name : '';
            t.to_name = to ? to.name : '';
            t.from_user_role = from ? from.role : '';
            t.to_user_role = to ? to.role : '';
        }
        res.json(transfers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/all', authMiddleware, async (req, res) => {
    try {
        const transfers = await db.custody_transfers.find({}).sort({ timestamp: -1 }).limit(100);
        for (const t of transfers) {
            const from = await db.users.findOne({ id: t.from_user_id });
            const to = await db.users.findOne({ id: t.to_user_id });
            const ev = await db.evidence.findOne({ evidence_id: t.evidence_id });
            t.from_name = from ? from.name : '';
            t.to_name = to ? to.name : '';
            t.evidence_title = ev ? ev.evidence_title : '';
        }
        res.json(transfers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/transfer', authMiddleware, async (req, res) => {
    try {
        const { evidence_id, to_user_id, transfer_reason } = req.body;
        const evidence = await db.evidence.findOne({ evidence_id });
        if (!evidence) return res.status(404).json({ error: 'Evidence not found' });

        const toUser = await db.users.findOne({ id: to_user_id });
        if (!toUser) return res.status(404).json({ error: 'Receiver not found' });

        const fromUser = await db.users.findOne({ id: req.user.id });
        const transfer_id = uuidv4();
        const digital_signature = '0x' + require('crypto').randomBytes(32).toString('hex');

        const transfer = await db.custody_transfers.insert({
            transfer_id, evidence_id, from_user_id: req.user.id, to_user_id,
            from_role: fromUser ? fromUser.role : '', to_role: toUser.role,
            transfer_reason: transfer_reason || '', digital_signature, status: 'Completed',
            timestamp: new Date().toISOString()
        });

        await db.evidence.update({ evidence_id }, { $set: { current_custodian: to_user_id } });

        const bcRecord = createBlockchainRecord(evidence_id, evidence.file_hash, 'Custody Transfer');
        await db.blockchain_records.insert({ ...bcRecord, timestamp: new Date().toISOString() });
        await logAudit(db, req.user.id, req.user.name, 'Custody Transfer', 'Evidence', evidence_id);

        transfer.from_name = fromUser ? fromUser.name : '';
        transfer.to_name = toUser.name;
        res.json(transfer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

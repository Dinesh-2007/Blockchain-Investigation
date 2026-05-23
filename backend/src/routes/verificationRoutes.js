const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authMiddleware, logAudit } = require('../middleware/authMiddleware');
const { generateSHA256 } = require('../services/hashingService');
const { createBlockchainRecord } = require('../services/blockchainService');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } });
const router = express.Router();

router.post('/verify', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        const { evidence_id } = req.body;
        let evidence = null;
        if (evidence_id) evidence = await db.evidence.findOne({ evidence_id });

        let hash_generated = '';
        if (req.file) hash_generated = generateSHA256(req.file.buffer);

        let status = 'Unknown Evidence';
        let hash_stored = '';

        if (evidence) {
            hash_stored = evidence.file_hash;
            if (hash_generated && hash_generated === hash_stored) status = 'Verified';
            else if (hash_generated) status = 'Integrity Compromised';
        } else if (hash_generated) {
            const found = await db.evidence.findOne({ file_hash: hash_generated });
            if (found) { evidence = found; hash_stored = found.file_hash; status = 'Verified'; }
        }

        await db.verification_logs.insert({
            verification_id: uuidv4(), evidence_id: evidence ? evidence.evidence_id : 'UNKNOWN',
            hash_generated, hash_stored, status, verified_by: req.user.id,
            method: 'SHA-256 Comparison', timestamp: new Date().toISOString()
        });

        if (evidence && status === 'Verified') {
            await db.evidence.update({ evidence_id: evidence.evidence_id }, { $set: { verification_status: 'Verified' } });
            const bcRecord = createBlockchainRecord(evidence.evidence_id, hash_generated, 'Verification');
            await db.blockchain_records.insert({ ...bcRecord, timestamp: new Date().toISOString() });
        } else if (evidence && status === 'Integrity Compromised') {
            await db.evidence.update({ evidence_id: evidence.evidence_id }, { $set: { verification_status: 'Compromised', integrity_score: 0 } });
        }

        await logAudit(db, req.user.id, req.user.name, 'Evidence Verified', 'Verification', evidence ? evidence.evidence_id : 'UNKNOWN');

        res.json({
            verification_id: uuidv4(), evidence_id: evidence ? evidence.evidence_id : null,
            evidence_title: evidence ? evidence.evidence_title : null,
            hash_generated, hash_stored, status,
            verified_by: req.user.name, timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/logs', authMiddleware, async (req, res) => {
    try {
        const logs = await db.verification_logs.find({}).sort({ timestamp: -1 }).limit(100);
        for (const l of logs) {
            const u = await db.users.findOne({ id: l.verified_by });
            l.verifier_name = u ? u.name : '';
        }
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

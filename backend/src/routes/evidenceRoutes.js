const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authMiddleware, logAudit } = require('../middleware/authMiddleware');
const { generateSHA256 } = require('../services/hashingService');
const { createBlockchainRecord } = require('../services/blockchainService');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const { case_id, category, status, search } = req.query;
        const query = {};
        if (case_id) query.case_id = case_id;
        if (category) query.evidence_category = category;
        if (status) query.verification_status = status;

        let results = await db.evidence.find(query).sort({ upload_timestamp: -1 });

        if (search) {
            const s = search.toLowerCase();
            results = results.filter(e => e.evidence_title.toLowerCase().includes(s) || e.file_name.toLowerCase().includes(s));
        }

        // Attach names
        for (const e of results) {
            const uploader = await db.users.findOne({ id: e.uploaded_by });
            e.uploader_name = uploader ? uploader.name : '';
            const c = await db.cases.findOne({ case_id: e.case_id });
            e.case_title = c ? c.case_title : '';
        }
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const evidence = await db.evidence.findOne({ evidence_id: req.params.id });
        if (!evidence) return res.status(404).json({ error: 'Evidence not found' });

        const uploader = await db.users.findOne({ id: evidence.uploaded_by });
        evidence.uploader_name = uploader ? uploader.name : '';
        const c = await db.cases.findOne({ case_id: evidence.case_id });
        evidence.case_title = c ? c.case_title : '';

        const blockchain = await db.blockchain_records.find({ evidence_id: req.params.id }).sort({ timestamp: -1 });
        const custody = await db.custody_transfers.find({ evidence_id: req.params.id }).sort({ timestamp: 1 });
        for (const ct of custody) {
            const from = await db.users.findOne({ id: ct.from_user_id });
            const to = await db.users.findOne({ id: ct.to_user_id });
            ct.from_name = from ? from.name : '';
            ct.to_name = to ? to.name : '';
        }
        const verifications = await db.verification_logs.find({ evidence_id: req.params.id }).sort({ timestamp: -1 });

        await logAudit(db, req.user.id, req.user.name, 'Evidence Viewed', 'Evidence', req.params.id);
        res.json({ ...evidence, blockchain, custody, verifications });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        const { case_id, evidence_title, evidence_description, evidence_category, device_source, location_collected, collection_method, tool_used, investigator_name } = req.body;

        let file_hash, file_name, file_size, file_type, mime_type, file_path;
        if (req.file) {
            const fileBuffer = fs.readFileSync(req.file.path);
            file_hash = generateSHA256(fileBuffer);
            file_name = req.file.originalname;
            file_size = req.file.size;
            file_type = path.extname(req.file.originalname);
            mime_type = req.file.mimetype;
            file_path = req.file.path;
        } else {
            file_hash = generateSHA256(Buffer.from(evidence_title + Date.now()));
            file_name = 'no-file'; file_size = 0; file_type = ''; mime_type = ''; file_path = '';
        }

        const evidence_id = 'EV-' + Date.now().toString(36).toUpperCase();

        const newEvidence = await db.evidence.insert({
            evidence_id, case_id, file_name, evidence_title,
            evidence_description: evidence_description || '',
            evidence_category: evidence_category || 'Document',
            file_type, file_size, file_path, file_hash, hash_algorithm: 'SHA-256',
            mime_type, device_source: device_source || '', location_collected: location_collected || '',
            collection_method: collection_method || '', tool_used: tool_used || '',
            investigator_name: investigator_name || '', acquisition_date: new Date().toISOString(),
            uploaded_by: req.user.id, current_custodian: req.user.id,
            blockchain_tx_id: '', verification_status: 'Verified', integrity_score: 100,
            upload_timestamp: new Date().toISOString()
        });

        const bcRecord = createBlockchainRecord(evidence_id, file_hash);
        await db.blockchain_records.insert({ ...bcRecord, timestamp: new Date().toISOString() });
        await db.evidence.update({ evidence_id }, { $set: { blockchain_tx_id: bcRecord.transaction_id } });
        await logAudit(db, req.user.id, req.user.name, 'Evidence Uploaded', 'Evidence', evidence_id);

        res.json({ evidence: newEvidence, blockchain: bcRecord });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const evidence = await db.evidence.findOne({ evidence_id: req.params.id });
        if (!evidence) return res.status(404).json({ error: 'Evidence not found' });
        if (evidence.file_path && fs.existsSync(evidence.file_path)) fs.unlinkSync(evidence.file_path);
        await db.evidence.remove({ evidence_id: req.params.id });
        await logAudit(db, req.user.id, req.user.name, 'Evidence Deleted', 'Evidence', req.params.id);
        res.json({ message: 'Evidence deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

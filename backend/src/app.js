const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize database
require('./database');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cases', require('./routes/caseRoutes'));
app.use('/api/evidence', require('./routes/evidenceRoutes'));
app.use('/api/custody', require('./routes/custodyRoutes'));
app.use('/api/verification', require('./routes/verificationRoutes'));
app.use('/api/blockchain', require('./routes/blockchainRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Evidence Integrity Server running on port ${PORT}`);
});

module.exports = app;

const Datastore = require('nedb-promises');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = {
  users: Datastore.create({ filename: path.join(dataDir, 'users.db'), autoload: true }),
  cases: Datastore.create({ filename: path.join(dataDir, 'cases.db'), autoload: true }),
  evidence: Datastore.create({ filename: path.join(dataDir, 'evidence.db'), autoload: true }),
  custody_transfers: Datastore.create({ filename: path.join(dataDir, 'custody.db'), autoload: true }),
  blockchain_records: Datastore.create({ filename: path.join(dataDir, 'blockchain.db'), autoload: true }),
  verification_logs: Datastore.create({ filename: path.join(dataDir, 'verification.db'), autoload: true }),
  audit_logs: Datastore.create({ filename: path.join(dataDir, 'audit.db'), autoload: true }),
};

module.exports = db;

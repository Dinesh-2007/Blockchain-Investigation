const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const db = require('./database');

async function seed() {
    console.log('Seeding database...');

    // Clear
    await Promise.all([
        db.users.remove({}, { multi: true }),
        db.cases.remove({}, { multi: true }),
        db.evidence.remove({}, { multi: true }),
        db.custody_transfers.remove({}, { multi: true }),
        db.blockchain_records.remove({}, { multi: true }),
        db.verification_logs.remove({}, { multi: true }),
        db.audit_logs.remove({}, { multi: true }),
    ]);

    const passwordHash = bcrypt.hashSync('password123', 10);
    const users = [
        { id: 'usr-001', name: 'Officer John Mitchell', email: 'john@police.gov', role: 'Law Enforcement Officer', organization: 'Metro Police Dept', department: 'Cyber Crime Unit', badge_id: 'MPD-4521' },
        { id: 'usr-002', name: 'Dr. Sarah Chen', email: 'sarah@forensics.gov', role: 'Forensic Analyst', organization: 'National Forensic Lab', department: 'Digital Forensics', badge_id: 'NFL-1122' },
        { id: 'usr-003', name: 'James Rodriguez', email: 'james@court.gov', role: 'Prosecutor', organization: 'District Attorney', department: 'Prosecution Division', badge_id: '' },
        { id: 'usr-004', name: 'Emily Parker', email: 'emily@defense.law', role: 'Defense Attorney', organization: 'Parker & Associates', department: 'Criminal Defense', badge_id: '' },
        { id: 'usr-005', name: 'Michael Thompson', email: 'michael@court.gov', role: 'Court Clerk', organization: 'Superior Court', department: 'Records Division', badge_id: 'SC-0089' },
        { id: 'usr-006', name: 'Admin User', email: 'admin@system.gov', role: 'System Admin', organization: 'DEIS Platform', department: 'IT Security', badge_id: 'SYS-0001' },
    ];

    for (const u of users) {
        await db.users.insert({ ...u, password_hash: passwordHash, digital_signature_key: '0x' + crypto.randomBytes(32).toString('hex'), status: 'active', created_at: new Date().toISOString() });
    }
    console.log(`Created ${users.length} users`);

    const cases = [
        { case_id: 'CASE-2024-001', case_title: 'Corporate Data Breach Investigation', case_description: 'Investigation into unauthorized access of corporate database containing customer financial records', case_type: 'Cybercrime', status: 'Investigation', priority: 'High', investigating_officer_id: 'usr-001' },
        { case_id: 'CASE-2024-002', case_title: 'Digital Fraud Ring', case_description: 'Multi-state digital fraud operation involving cryptocurrency wallets and phishing campaigns', case_type: 'Fraud', status: 'Forensic Analysis', priority: 'Critical', investigating_officer_id: 'usr-001' },
        { case_id: 'CASE-2024-003', case_title: 'Intellectual Property Theft', case_description: 'Unauthorized exfiltration of proprietary source code and trade secrets', case_type: 'IP Theft', status: 'Prosecution Preparation', priority: 'High', investigating_officer_id: 'usr-002' },
        { case_id: 'CASE-2024-004', case_title: 'Online Harassment & Threats', case_description: 'Series of threatening digital communications across multiple platforms', case_type: 'Criminal', status: 'Trial', priority: 'Medium', investigating_officer_id: 'usr-001' },
        { case_id: 'CASE-2024-005', case_title: 'Ransomware Attack Analysis', case_description: 'Forensic analysis of ransomware attack on municipal infrastructure systems', case_type: 'Cybercrime', status: 'Investigation', priority: 'Critical', investigating_officer_id: 'usr-002' },
    ];

    for (const c of cases) {
        await db.cases.insert({ ...c, department: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    }
    console.log(`Created ${cases.length} cases`);

    const evidenceData = [
        { title: 'Server Access Logs', desc: 'Apache server access logs from compromised web server', category: 'Network Logs', case_id: 'CASE-2024-001', file: 'access_log_2024.txt', size: 2456789 },
        { title: 'CCTV Footage - Server Room', desc: 'Security camera footage showing unauthorized physical access', category: 'Video', case_id: 'CASE-2024-001', file: 'cctv_serverroom_jan15.mp4', size: 156000000 },
        { title: 'Database Export', desc: 'MySQL database dump from affected server', category: 'Disk Image', case_id: 'CASE-2024-001', file: 'db_dump_2024.sql', size: 89432100 },
        { title: 'Phishing Email Sample', desc: 'Original phishing email with malicious attachment', category: 'Digital Communications', case_id: 'CASE-2024-002', file: 'phish_sample_001.eml', size: 345600 },
        { title: 'Cryptocurrency Wallet Logs', desc: 'Transaction logs from suspected fraud wallet', category: 'Document', case_id: 'CASE-2024-002', file: 'wallet_transactions.csv', size: 123456 },
        { title: 'Malware Binary Sample', desc: 'Captured malware executable from infected workstation', category: 'Malware Sample', case_id: 'CASE-2024-002', file: 'malware_sample.exe', size: 4567890 },
        { title: 'Source Code Comparison Report', desc: 'Diff analysis of stolen vs original source code', category: 'Document', case_id: 'CASE-2024-003', file: 'code_comparison.pdf', size: 789012 },
        { title: 'Employee Email Archive', desc: 'Archived emails of suspect employee', category: 'Digital Communications', case_id: 'CASE-2024-003', file: 'email_archive.pst', size: 567890000 },
        { title: 'Git Repository Snapshot', desc: 'Complete repository snapshot before and after breach', category: 'Disk Image', case_id: 'CASE-2024-003', file: 'repo_snapshot.tar.gz', size: 234567890 },
        { title: 'Threatening Messages Screenshots', desc: 'Screenshots of threatening messages from social media', category: 'Image', case_id: 'CASE-2024-004', file: 'threat_screenshots.zip', size: 12345678 },
        { title: 'Voice Message Recording', desc: 'Threatening voicemail recording', category: 'Audio', case_id: 'CASE-2024-004', file: 'voicemail_threat.wav', size: 8901234 },
        { title: 'IP Trace Report', desc: 'Network trace pinpointing origin of messages', category: 'Document', case_id: 'CASE-2024-004', file: 'ip_trace_report.pdf', size: 234567 },
        { title: 'Ransomware Binary', desc: 'Captured ransomware executable for analysis', category: 'Malware Sample', case_id: 'CASE-2024-005', file: 'ransomware_v2.bin', size: 3456789 },
        { title: 'Encrypted Files Sample', desc: 'Sample of encrypted files from affected systems', category: 'Disk Image', case_id: 'CASE-2024-005', file: 'encrypted_samples.zip', size: 45678901 },
        { title: 'Ransom Note Screenshot', desc: 'Screenshot of ransom demand displayed on terminal', category: 'Image', case_id: 'CASE-2024-005', file: 'ransom_note.png', size: 567890 },
    ];

    for (let i = 0; i < evidenceData.length; i++) {
        const e = evidenceData[i];
        const evidence_id = `EV-${String(101 + i)}`;
        const file_hash = crypto.createHash('sha256').update(e.title + e.file + i).digest('hex');
        const tx_id = '0x' + crypto.randomBytes(32).toString('hex');
        const block_num = Math.floor(18000000 + Math.random() * 2000000);
        const contract_addr = '0x' + crypto.randomBytes(20).toString('hex');
        const network = ['Ethereum', 'Polygon'][i % 2];
        const vstatus = i === 9 ? 'Compromised' : 'Verified';
        const iscore = i === 9 ? 0 : 100;
        const ext = e.file.split('.').pop();

        await db.evidence.insert({
            evidence_id, case_id: e.case_id, file_name: e.file, evidence_title: e.title,
            evidence_description: e.desc, evidence_category: e.category, file_type: '.' + ext,
            file_size: e.size, file_path: '', file_hash, hash_algorithm: 'SHA-256', mime_type: '',
            device_source: 'Forensic Workstation', location_collected: 'Evidence Lab',
            collection_method: 'Forensic Imaging', tool_used: 'EnCase Forensic',
            investigator_name: i < 5 ? 'Officer John Mitchell' : 'Dr. Sarah Chen',
            acquisition_date: new Date().toISOString(), uploaded_by: i < 5 ? 'usr-001' : 'usr-002',
            current_custodian: 'usr-001', blockchain_tx_id: tx_id, verification_status: vstatus,
            integrity_score: iscore, upload_timestamp: new Date().toISOString()
        });

        await db.blockchain_records.insert({
            record_id: uuidv4(), evidence_id, hash_value: file_hash, transaction_id: tx_id,
            block_number: block_num, smart_contract_address: contract_addr, network,
            gas_fee: (Math.random() * 0.01 + 0.001).toFixed(6), confirmation_status: 'Confirmed',
            event_type: 'Evidence Registration', verification_link: `https://etherscan.io/tx/${tx_id}`,
            timestamp: new Date().toISOString()
        });
    }
    console.log(`Created ${evidenceData.length} evidence records`);

    const custodyData = [
        { evidence_id: 'EV-101', from: 'usr-001', to: 'usr-002', from_role: 'Law Enforcement Officer', to_role: 'Forensic Analyst', reason: 'Forensic analysis required' },
        { evidence_id: 'EV-101', from: 'usr-002', to: 'usr-003', from_role: 'Forensic Analyst', to_role: 'Prosecutor', reason: 'Analysis complete, forwarding to prosecution' },
        { evidence_id: 'EV-102', from: 'usr-001', to: 'usr-002', from_role: 'Law Enforcement Officer', to_role: 'Forensic Analyst', reason: 'Video enhancement and analysis' },
        { evidence_id: 'EV-104', from: 'usr-001', to: 'usr-002', from_role: 'Law Enforcement Officer', to_role: 'Forensic Analyst', reason: 'Malware analysis' },
        { evidence_id: 'EV-104', from: 'usr-002', to: 'usr-003', from_role: 'Forensic Analyst', to_role: 'Prosecutor', reason: 'Results ready for prosecution review' },
        { evidence_id: 'EV-104', from: 'usr-003', to: 'usr-005', from_role: 'Prosecutor', to_role: 'Court Clerk', reason: 'Submitted as court evidence' },
        { evidence_id: 'EV-107', from: 'usr-002', to: 'usr-003', from_role: 'Forensic Analyst', to_role: 'Prosecutor', reason: 'Code comparison report finalized' },
        { evidence_id: 'EV-110', from: 'usr-001', to: 'usr-003', from_role: 'Law Enforcement Officer', to_role: 'Prosecutor', reason: 'Evidence for trial presentation' },
        { evidence_id: 'EV-110', from: 'usr-003', to: 'usr-005', from_role: 'Prosecutor', to_role: 'Court Clerk', reason: 'Filed for court proceedings' },
    ];

    for (const ct of custodyData) {
        const sig = '0x' + crypto.randomBytes(32).toString('hex');
        await db.custody_transfers.insert({
            transfer_id: uuidv4(), evidence_id: ct.evidence_id, from_user_id: ct.from, to_user_id: ct.to,
            from_role: ct.from_role, to_role: ct.to_role, transfer_reason: ct.reason, digital_signature: sig,
            status: 'Completed', timestamp: new Date().toISOString()
        });
    }
    console.log(`Created ${custodyData.length} custody transfers`);

    const auditActions = [
        { user: 'usr-001', name: 'Officer John Mitchell', action: 'User Login', type: 'Authentication' },
        { user: 'usr-001', name: 'Officer John Mitchell', action: 'Evidence Uploaded', type: 'Evidence', id: 'EV-101' },
        { user: 'usr-002', name: 'Dr. Sarah Chen', action: 'User Login', type: 'Authentication' },
        { user: 'usr-002', name: 'Dr. Sarah Chen', action: 'Evidence Viewed', type: 'Evidence', id: 'EV-101' },
        { user: 'usr-002', name: 'Dr. Sarah Chen', action: 'Evidence Verified', type: 'Verification', id: 'EV-101' },
        { user: 'usr-001', name: 'Officer John Mitchell', action: 'Custody Transfer', type: 'Evidence', id: 'EV-101' },
        { user: 'usr-003', name: 'James Rodriguez', action: 'Evidence Viewed', type: 'Evidence', id: 'EV-101' },
        { user: 'usr-004', name: 'Emily Parker', action: 'Unauthorized Access Attempt', type: 'Security', id: 'EV-106' },
        { user: 'usr-002', name: 'Dr. Sarah Chen', action: 'Evidence Verified', type: 'Verification', id: 'EV-113' },
        { user: 'usr-005', name: 'Michael Thompson', action: 'Evidence Archived', type: 'Evidence', id: 'EV-104' },
    ];

    const ips = ['192.168.1.10', '192.168.1.22', '10.0.0.15', '172.16.0.8'];
    const devices = ['Desktop - Chrome', 'Laptop - Firefox', 'Workstation - Edge'];
    for (const a of auditActions) {
        await db.audit_logs.insert({
            log_id: uuidv4(), user_id: a.user, user_name: a.name, action: a.action,
            resource_type: a.type, resource_id: a.id || '',
            ip_address: ips[Math.floor(Math.random() * ips.length)],
            device: devices[Math.floor(Math.random() * devices.length)],
            status: a.action.includes('Unauthorized') ? 'Failed' : 'Success',
            timestamp: new Date().toISOString()
        });
    }
    console.log(`Created ${auditActions.length} audit logs`);

    console.log('\n=== Database seeded! ===');
    console.log('Login: john@police.gov / password123');
}

seed().catch(console.error);

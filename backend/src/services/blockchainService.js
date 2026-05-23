const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

function generateTransactionId() {
    return '0x' + crypto.randomBytes(32).toString('hex');
}

function generateBlockNumber() {
    return Math.floor(18000000 + Math.random() * 2000000);
}

function generateSmartContractAddress() {
    return '0x' + crypto.randomBytes(20).toString('hex');
}

function generateGasFee() {
    return (Math.random() * 0.01 + 0.001).toFixed(6);
}

function createBlockchainRecord(evidenceId, hash, eventType = 'Evidence Registration') {
    return {
        record_id: uuidv4(),
        evidence_id: evidenceId,
        hash_value: hash,
        transaction_id: generateTransactionId(),
        block_number: generateBlockNumber(),
        smart_contract_address: generateSmartContractAddress(),
        network: Math.random() > 0.5 ? 'Ethereum' : 'Polygon',
        gas_fee: generateGasFee(),
        confirmation_status: 'Confirmed',
        event_type: eventType,
        verification_link: `https://etherscan.io/tx/${generateTransactionId()}`
    };
}

module.exports = { createBlockchainRecord, generateTransactionId, generateBlockNumber, generateSmartContractAddress };

const crypto = require('crypto');

function generateSHA256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

function generateSHA256FromString(str) {
    return crypto.createHash('sha256').update(str).digest('hex');
}

function generateMD5(buffer) {
    return crypto.createHash('md5').update(buffer).digest('hex');
}

module.exports = { generateSHA256, generateSHA256FromString, generateMD5 };

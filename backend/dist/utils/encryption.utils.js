"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
const crypto_1 = __importDefault(require("crypto"));
const ALGORITHM = 'aes-256-cbc';
// Ensure USER_CONFIG_ENCRYPTION_KEY is set in your .env file (32 characters)
const ENCRYPTION_KEY = process.env.USER_CONFIG_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef'; // Default for safety, but MUST be overridden
const IV_LENGTH = 16; // For AES, this is always 16
if (process.env.NODE_ENV !== 'test' && ENCRYPTION_KEY === '0123456789abcdef0123456789abcdef') {
    console.warn('WARNING: USER_CONFIG_ENCRYPTION_KEY is not set or using default. Please set a strong, unique key in your environment variables.');
}
function encrypt(text) {
    if (!text)
        return '';
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}
function decrypt(text) {
    if (!text)
        return '';
    try {
        const textParts = text.split(':');
        if (textParts.length !== 2)
            throw new Error('Invalid encrypted text format');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto_1.default.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
    catch (error) {
        console.error('Decryption failed:', error);
        return ''; // Or handle error appropriately
    }
}

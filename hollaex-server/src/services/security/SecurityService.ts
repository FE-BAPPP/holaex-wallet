import crypto from 'crypto';

export class SecurityService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;

  /**
   * Encrypt mnemonic with AES-256-GCM
   */
  encryptMnemonic(mnemonic: string, encryptionKey: string): string {
    try {
      const key = Buffer.from(encryptionKey, 'hex');
      if (key.length !== this.keyLength) {
        throw new Error(`Invalid encryption key length. Expected ${this.keyLength} bytes, got ${key.length}`);
      }

      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);

      cipher.setAAD(Buffer.from('holaex-mnemonic')); // optional AAD

      let encrypted = cipher.update(mnemonic, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag();

      // iv + tag + encrypted
      return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
    } catch (error) {
      console.error('❌ Error encrypting mnemonic:', error);
      throw new Error('Failed to encrypt mnemonic');
    }
  }

  /**
   * Decrypt mnemonic with AES-256-GCM
   */
  decryptMnemonic(encryptedData: string, encryptionKey: string): string {
    try {
      const key = Buffer.from(encryptionKey, 'hex');
      if (key.length !== this.keyLength) {
        throw new Error(`Invalid encryption key length. Expected ${this.keyLength} bytes, got ${key.length}`);
      }

      const [ivHex, tagHex, encrypted] = encryptedData.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');

      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(tag);
      decipher.setAAD(Buffer.from('holaex-mnemonic'));

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('❌ Error decrypting mnemonic:', error);
      throw new Error('Failed to decrypt mnemonic');
    }
  }

  /**
   * Securely clear sensitive data from memory
   */
  clearMemory(obj: any): void {
    if (typeof obj === 'string') {
      // Overwrite string memory (best effort)
      for (let i = 0; i < obj.length; i++) {
        obj = obj.replace(obj[i], '0');
      }
    } else if (Buffer.isBuffer(obj)) {
      obj.fill(0);
    } else if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        this.clearMemory(obj[key]);
        delete obj[key];
      });
    }
  }

  
   /* Generate secure encryption key
   */
  generateEncryptionKey(): string {
    return crypto.randomBytes(this.keyLength).toString('hex');
  }

  
   /* Validate mnemonic phrase
   */
  validateMnemonic(mnemonic: string): boolean {
    return require('bip39').validateMnemonic(mnemonic);
  }

  
   /* Generate audit log for sensitive operations
   */
  auditLog(operation: string, userId?: string, details?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      operation,
      userId: userId || 'system',
      details: details || {},
      ip: 'internal', // In real app, get from request
      userAgent: 'system'
    };
    
    // TODO: Send to secure audit logging system
    console.log('[SECURITY AUDIT]', JSON.stringify(logEntry));
  }
}

export default new SecurityService();

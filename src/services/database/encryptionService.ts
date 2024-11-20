import { createCipheriv, createDecipheriv, randomBytes, scrypt, CipherGCM, DecipherGCM } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

interface EncryptionKey {
  key: Buffer;
  iv: Buffer;
}

interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  salt: string;
}

export class EncryptionService {
  private config: EncryptionConfig = {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    salt: 'your-salt-here'
  };

  // 生成加密密钥
  async generateKey(password: string): Promise<EncryptionKey> {
    const key = (await scryptAsync(password, this.config.salt, this.config.keyLength)) as Buffer;
    const iv = randomBytes(16);
    return { key, iv };
  }

  // 加密数据
  async encrypt(data: Buffer, key: EncryptionKey): Promise<Buffer> {
    try {
      const cipher = createCipheriv(
        this.config.algorithm,
        key.key,
        key.iv
      ) as CipherGCM;

      const encrypted = Buffer.concat([
        cipher.update(data),
        cipher.final()
      ]);

      const authTag = cipher.getAuthTag();

      return Buffer.concat([key.iv, encrypted, authTag]);
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 解密数据
  async decrypt(encryptedData: Buffer, key: Buffer): Promise<Buffer> {
    try {
      const iv = encryptedData.subarray(0, 16);
      const authTag = encryptedData.subarray(-16);
      const data = encryptedData.subarray(16, -16);

      const decipher = createDecipheriv(
        this.config.algorithm,
        key,
        iv
      ) as DecipherGCM;

      decipher.setAuthTag(authTag);

      return Buffer.concat([
        decipher.update(data),
        decipher.final()
      ]);
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 更新加密密钥
  async rotateKey(data: Buffer, oldKey: EncryptionKey, newPassword: string): Promise<Buffer> {
    const decrypted = await this.decrypt(data, oldKey.key);
    const newKey = await this.generateKey(newPassword);
    return this.encrypt(decrypted, newKey);
  }
} 
import CryptoJS from 'crypto-js';

// Secret key for encryption/decryption (in production, this would be more securely generated)
const ENCRYPTION_KEY = 'ai-interview-secret-key-2024';

export interface UserConfig {
  email: string; // User's email address
  password: string; // User's password (encrypted)
  provider: 'openai' | 'anthropic' | 'google';
  model: string;
  apiKey: string; // This will be encrypted
  apiUrl: string;
  setupComplete: boolean;
  createdAt: string;
}

/**
 * Encrypts sensitive configuration data
 */
export function encryptApiKey(apiKey: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(apiKey, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt API key');
  }
}

/**
 * Decrypts API key
 */
export function decryptApiKey(encryptedApiKey: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedApiKey, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      throw new Error('Failed to decrypt API key');
    }
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt API key');
  }
}

/**
 * Encrypts the entire configuration object
 */
export function encryptConfig(config: UserConfig): string {
  try {
    // Encrypt sensitive fields before stringifying
    const configToEncrypt = {
      ...config,
      password: encryptApiKey(config.password), // Reuse the encryption function for password
      apiKey: encryptApiKey(config.apiKey)
    };

    const configString = JSON.stringify(configToEncrypt);
    const encrypted = CryptoJS.AES.encrypt(configString, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Config encryption failed:', error);
    throw new Error('Failed to encrypt configuration');
  }
}

/**
 * Decrypts the configuration object
 */
export function decryptConfig(encryptedConfig: string): UserConfig {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedConfig, ENCRYPTION_KEY);
    const configString = bytes.toString(CryptoJS.enc.Utf8);

    if (!configString) {
      throw new Error('Failed to decrypt configuration');
    }

    const config = JSON.parse(configString) as UserConfig;

    // Decrypt sensitive fields
    config.password = decryptApiKey(config.password); // Reuse the decryption function for password
    config.apiKey = decryptApiKey(config.apiKey);

    return config;
  } catch (error) {
    console.error('Config decryption failed:', error);
    throw new Error('Failed to decrypt configuration');
  }
}

/**
 * Validates configuration integrity
 */
export function validateConfig(config: UserConfig): boolean {
  try {
    return (
      config &&
      typeof config === 'object' &&
      typeof config.email === 'string' &&
      config.email.length > 0 &&
      typeof config.password === 'string' &&
      config.password.length > 0 &&
      ['openai', 'anthropic', 'google'].includes(config.provider) &&
      typeof config.model === 'string' &&
      config.model.length > 0 &&
      typeof config.apiKey === 'string' &&
      config.apiKey.length > 0 &&
      typeof config.apiUrl === 'string' &&
      config.apiUrl.length > 0 &&
      typeof config.setupComplete === 'boolean' &&
      typeof config.createdAt === 'string'
    );
  } catch (error) {
    console.error('Config validation failed:', error);
    return false;
  }
}

/**
 * Generates a unique salt for additional security
 */
export function generateSalt(): string {
  return CryptoJS.lib.WordArray.random(16).toString();
}

/**
 * Encrypts data with a custom salt
 */
export function encryptWithSalt(data: string, salt: string): string {
  const key = CryptoJS.PBKDF2(ENCRYPTION_KEY, salt, {
    keySize: 256 / 32,
    iterations: 1000
  });
  return CryptoJS.AES.encrypt(data, key.toString()).toString();
}

/**
 * Decrypts data with a custom salt
 */
export function decryptWithSalt(encryptedData: string, salt: string): string {
  const key = CryptoJS.PBKDF2(ENCRYPTION_KEY, salt, {
    keySize: 256 / 32,
    iterations: 1000
  });
  const bytes = CryptoJS.AES.decrypt(encryptedData, key.toString());
  return bytes.toString(CryptoJS.enc.Utf8);
}
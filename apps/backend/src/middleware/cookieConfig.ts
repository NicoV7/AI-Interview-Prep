import { Request, Response, NextFunction } from 'express';
import CryptoJS from 'crypto-js';

// Same encryption key as frontend (in production, use environment variable)
const ENCRYPTION_KEY = 'ai-interview-secret-key-2024';
const COOKIE_NAME = 'ai-interview-config';

export interface UserConfig {
  email: string;
  password: string;
  provider: 'openai' | 'anthropic' | 'google';
  model: string;
  apiKey: string;
  apiUrl: string;
  setupComplete: boolean;
  createdAt: string;
}

// Extend Express Request interface to include our config
declare global {
  namespace Express {
    interface Request {
      userConfig?: UserConfig;
      hasValidConfig?: boolean;
    }
  }
}

/**
 * Decrypts API key from cookie data
 */
function decryptApiKey(encryptedApiKey: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedApiKey, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      throw new Error('Failed to decrypt API key');
    }
    return decrypted;
  } catch (error) {
    console.error('API key decryption failed:', error);
    throw new Error('Failed to decrypt API key');
  }
}

/**
 * Decrypts the entire configuration object from cookie
 */
function decryptConfig(encryptedConfig: string): UserConfig {
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
function validateConfig(config: UserConfig): boolean {
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
 * Checks if configuration is expired (older than 30 days)
 */
function isConfigExpired(config: UserConfig): boolean {
  try {
    const createdAt = new Date(config.createdAt);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    return diffInDays > 30;
  } catch (error) {
    console.error('Failed to check configuration expiration:', error);
    return true;
  }
}

/**
 * Middleware to extract and validate user configuration from cookies
 */
export function cookieConfigMiddleware(req: Request, _res: Response, next: NextFunction): void {
  try {
    // Get the encrypted configuration cookie
    const encryptedConfig = req.cookies[COOKIE_NAME];
    
    if (!encryptedConfig) {
      // No configuration cookie found
      req.hasValidConfig = false;
      req.userConfig = undefined;
      console.log('No configuration cookie found for request');
      return next();
    }

    // Decrypt and validate the configuration
    const config = decryptConfig(encryptedConfig);
    
    if (!validateConfig(config)) {
      console.error('Invalid configuration found in cookie');
      req.hasValidConfig = false;
      req.userConfig = undefined;
      return next();
    }

    if (isConfigExpired(config)) {
      console.log('Configuration cookie has expired');
      req.hasValidConfig = false;
      req.userConfig = undefined;
      return next();
    }

    // Configuration is valid
    req.hasValidConfig = true;
    req.userConfig = config;
    
    console.log(`Valid configuration found for provider: ${config.provider}, model: ${config.model}`);
    next();
  } catch (error) {
    console.error('Cookie configuration middleware error:', error);
    req.hasValidConfig = false;
    req.userConfig = undefined;
    next();
  }
}

/**
 * Middleware to require valid configuration
 */
export function requireConfigMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.hasValidConfig || !req.userConfig) {
    res.status(401).json({
      success: false,
      error: 'Configuration required',
      message: 'Please complete the setup wizard to configure your AI provider',
      redirectToSetup: true
    });
    return;
  }
  
  next();
}

/**
 * Get configuration summary for API responses (without sensitive data)
 */
export function getConfigSummary(config: UserConfig): {
  email: string;
  provider: string;
  model: string;
  apiUrl: string;
  setupComplete: boolean;
  createdAt: string;
} {
  return {
    email: config.email,
    provider: config.provider,
    model: config.model,
    apiUrl: config.apiUrl,
    setupComplete: config.setupComplete,
    createdAt: config.createdAt
  };
}

/**
 * Utility function to get provider-specific configuration
 */
export function getProviderConfig(config: UserConfig): {
  baseURL?: string;
  apiKey: string;
  model: string;
} {
  switch (config.provider) {
    case 'openai':
      return {
        baseURL: 'https://api.openai.com/v1',
        apiKey: config.apiKey,
        model: config.model
      };
    case 'anthropic':
      return {
        baseURL: 'https://api.anthropic.com/v1',
        apiKey: config.apiKey,
        model: config.model
      };
    case 'google':
      return {
        baseURL: 'https://generativelanguage.googleapis.com/v1beta',
        apiKey: config.apiKey,
        model: config.model
      };
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}
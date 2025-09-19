import Cookies from 'js-cookie';
import { UserConfig, encryptConfig, decryptConfig, validateConfig } from './encryption';

// Cookie configuration
const COOKIE_NAME = 'ai-interview-config';
const COOKIE_OPTIONS = {
  expires: 30, // 30 days
  secure: process.env.NODE_ENV === 'production', // Only secure in production
  sameSite: 'strict' as const,
  path: '/'
};

/**
 * Saves user configuration to encrypted cookie
 */
export function saveConfigToCookie(config: UserConfig): boolean {
  try {
    if (!validateConfig(config)) {
      throw new Error('Invalid configuration provided');
    }

    const encryptedConfig = encryptConfig(config);
    
    Cookies.set(COOKIE_NAME, encryptedConfig, COOKIE_OPTIONS);
    
    console.log('Configuration saved to cookie successfully');
    return true;
  } catch (error) {
    console.error('Failed to save configuration to cookie:', error);
    return false;
  }
}

/**
 * Loads user configuration from cookie
 */
export function loadConfigFromCookie(): UserConfig | null {
  try {
    const encryptedConfig = Cookies.get(COOKIE_NAME);
    
    if (!encryptedConfig) {
      console.log('No configuration cookie found');
      return null;
    }

    const config = decryptConfig(encryptedConfig);
    
    if (!validateConfig(config)) {
      console.error('Invalid configuration found in cookie');
      clearConfigCookie();
      return null;
    }

    console.log('Configuration loaded from cookie successfully');
    return config;
  } catch (error) {
    console.error('Failed to load configuration from cookie:', error);
    // Clear corrupted cookie
    clearConfigCookie();
    return null;
  }
}

/**
 * Checks if configuration exists and is valid
 */
export function hasValidConfig(): boolean {
  const config = loadConfigFromCookie();
  return config !== null && config.setupComplete;
}

/**
 * Updates specific configuration fields
 */
export function updateConfigInCookie(updates: Partial<UserConfig>): boolean {
  try {
    const currentConfig = loadConfigFromCookie();
    
    if (!currentConfig) {
      console.error('No existing configuration to update');
      return false;
    }

    const updatedConfig: UserConfig = {
      ...currentConfig,
      ...updates
    };

    return saveConfigToCookie(updatedConfig);
  } catch (error) {
    console.error('Failed to update configuration:', error);
    return false;
  }
}

/**
 * Clears the configuration cookie
 */
export function clearConfigCookie(): void {
  try {
    Cookies.remove(COOKIE_NAME, { path: '/' });
    console.log('Configuration cookie cleared');
  } catch (error) {
    console.error('Failed to clear configuration cookie:', error);
  }
}

/**
 * Gets configuration summary (without sensitive data)
 */
export function getConfigSummary(): {
  email: string;
  provider: string;
  model: string;
  apiUrl: string;
  setupComplete: boolean;
  createdAt: string;
} | null {
  try {
    const config = loadConfigFromCookie();

    if (!config) {
      return null;
    }

    return {
      email: config.email,
      provider: config.provider,
      model: config.model,
      apiUrl: config.apiUrl,
      setupComplete: config.setupComplete,
      createdAt: config.createdAt
    };
  } catch (error) {
    console.error('Failed to get configuration summary:', error);
    return null;
  }
}

/**
 * Validates if the current configuration is expired
 */
export function isConfigExpired(): boolean {
  try {
    const config = loadConfigFromCookie();
    
    if (!config) {
      return true;
    }

    const createdAt = new Date(config.createdAt);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    // Consider config expired after 30 days
    return diffInDays > 30;
  } catch (error) {
    console.error('Failed to check configuration expiration:', error);
    return true;
  }
}

/**
 * Creates a new configuration object
 */
export function createConfig(
  email: string,
  password: string,
  provider: UserConfig['provider'],
  model: string,
  apiKey: string,
  apiUrl: string
): UserConfig {
  return {
    email,
    password,
    provider,
    model,
    apiKey,
    apiUrl,
    setupComplete: true,
    createdAt: new Date().toISOString()
  };
}

/**
 * Exports configuration to downloadable format (without API key)
 */
export function exportConfigForDownload(): string | null {
  try {
    const config = loadConfigFromCookie();
    
    if (!config) {
      return null;
    }

    const exportData = {
      provider: config.provider,
      model: config.model,
      apiUrl: config.apiUrl,
      setupComplete: config.setupComplete,
      createdAt: config.createdAt,
      apiKey: '***REDACTED***' // Don't export the actual API key
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Failed to export configuration:', error);
    return null;
  }
}

/**
 * Cookie utility functions for debugging
 */
export const cookieUtils = {
  getAllCookies: () => Cookies.get(),
  getCookieValue: () => Cookies.get(COOKIE_NAME),
  cookieExists: () => !!Cookies.get(COOKIE_NAME),
  cookieOptions: COOKIE_OPTIONS
};
import { useState, useEffect, useCallback } from 'react';
import { 
  loadConfigFromCookie, 
  saveConfigToCookie, 
  clearConfigCookie, 
  hasValidConfig, 
  getConfigSummary,
  isConfigExpired,
  UserConfig 
} from '@/lib/cookieConfig';

interface ConfigurationState {
  isLoaded: boolean;
  isValid: boolean;
  isExpired: boolean;
  config: UserConfig | null;
  summary: any;
  error: string | null;
}

interface ConfigurationActions {
  refresh: () => Promise<void>;
  save: (config: UserConfig) => Promise<boolean>;
  clear: () => void;
  validate: () => Promise<boolean>;
}

export function useConfiguration(): [ConfigurationState, ConfigurationActions] {
  const [state, setState] = useState<ConfigurationState>({
    isLoaded: false,
    isValid: false,
    isExpired: false,
    config: null,
    summary: null,
    error: null
  });

  const loadConfiguration = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      const config = loadConfigFromCookie();
      const summary = getConfigSummary();
      const isValid = hasValidConfig();
      const isExpired = config ? isConfigExpired() : false;

      setState({
        isLoaded: true,
        isValid,
        isExpired,
        config,
        summary,
        error: null
      });
    } catch (error) {
      console.error('Failed to load configuration:', error);
      setState({
        isLoaded: true,
        isValid: false,
        isExpired: false,
        config: null,
        summary: null,
        error: error instanceof Error ? error.message : 'Failed to load configuration'
      });
    }
  }, []);

  const saveConfiguration = useCallback(async (config: UserConfig): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      const success = saveConfigToCookie(config);
      
      if (success) {
        // Reload configuration after successful save
        await loadConfiguration();
        return true;
      } else {
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to save configuration to cookies' 
        }));
        return false;
      }
    } catch (error) {
      console.error('Failed to save configuration:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to save configuration' 
      }));
      return false;
    }
  }, [loadConfiguration]);

  const clearConfiguration = useCallback(() => {
    try {
      clearConfigCookie();
      setState({
        isLoaded: true,
        isValid: false,
        isExpired: false,
        config: null,
        summary: null,
        error: null
      });
    } catch (error) {
      console.error('Failed to clear configuration:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to clear configuration' 
      }));
    }
  }, []);

  const validateConfiguration = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      // Check if configuration exists and is valid
      const isValid = hasValidConfig();
      
      if (!isValid) {
        setState(prev => ({ 
          ...prev, 
          error: 'Configuration is invalid or missing' 
        }));
        return false;
      }

      // Check if configuration is expired
      const isExpired = isConfigExpired();
      
      if (isExpired) {
        setState(prev => ({ 
          ...prev, 
          isExpired: true,
          error: 'Configuration has expired (older than 30 days)' 
        }));
        return false;
      }

      // Try to validate with backend if available
      try {
        const response = await fetch('/api/ai/validate-cookie', {
          credentials: 'include' // Include cookies
        });
        
        if (response.ok) {
          const data = await response.json();
          return data.valid === true;
        } else {
          console.warn('Backend validation failed, but local validation passed');
          return true; // Fall back to local validation
        }
      } catch (error) {
        console.warn('Backend validation unavailable:', error);
        return true; // Fall back to local validation
      }
    } catch (error) {
      console.error('Configuration validation failed:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Validation failed' 
      }));
      return false;
    }
  }, []);

  useEffect(() => {
    loadConfiguration();
  }, [loadConfiguration]);

  const actions: ConfigurationActions = {
    refresh: loadConfiguration,
    save: saveConfiguration,
    clear: clearConfiguration,
    validate: validateConfiguration
  };

  return [state, actions];
}

// Helper hook for simple configuration status
export function useConfigurationStatus() {
  const [{ isValid, isExpired, summary, error }] = useConfiguration();
  
  return {
    isConfigured: isValid && !isExpired,
    isExpired,
    provider: summary?.provider,
    model: summary?.model,
    error
  };
}

// Helper hook for configuration actions only
export function useConfigurationActions() {
  const [, actions] = useConfiguration();
  return actions;
}
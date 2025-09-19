'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, RefreshCw, Shield, Cookie } from 'lucide-react';
import { StepWithCompletionProps } from '../types';
import { getProviderById } from '@/lib/aiProviders';
import { UserConfig, createConfig } from '@/lib/cookieConfig';
import { saveConfigToCookie, getConfigSummary } from '@/lib/cookieConfig';

interface CookieCompletionStepProps extends StepWithCompletionProps {
  email: string;
  password: string;
  selectedProvider: string;
  selectedModel: string;
  apiKey: string;
  apiUrl: string;
}

export function CookieCompletionStep({
  email,
  password,
  selectedProvider,
  selectedModel,
  apiKey,
  apiUrl,
  onComplete,
  onPrev
}: CookieCompletionStepProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);
  const [, setConfigSummary] = useState<{
    email: string;
    provider: string;
    model: string;
    apiUrl: string;
    setupComplete: boolean;
    createdAt: string;
  } | null>(null);

  const provider = getProviderById(selectedProvider);

  useEffect(() => {
    // Auto-save configuration when component mounts
    handleSaveConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildUserConfig = (): UserConfig => {
    return createConfig(
      email,
      password,
      selectedProvider as UserConfig['provider'],
      selectedModel,
      apiKey,
      apiUrl
    );
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const config = buildUserConfig();
      const success = saveConfigToCookie(config);
      
      if (success) {
        setSaveResult({
          success: true,
          message: 'Configuration saved successfully to secure cookies'
        });
        
        // Get summary for display
        const summary = getConfigSummary();
        setConfigSummary(summary);
      } else {
        setSaveResult({
          success: false,
          message: 'Failed to save configuration to cookies'
        });
      }
    } catch (error) {
      setSaveResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetry = () => {
    setSaveResult(null);
    setConfigSummary(null);
    handleSaveConfig();
  };

  const config = buildUserConfig();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          saveResult?.success ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'
        }`}>
          {isSaving ? (
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          ) : saveResult?.success ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <Cookie className="w-8 h-8 text-blue-600" />
          )}
        </div>
        <h3 className="text-xl font-semibold text-card-foreground mb-2">
          {isSaving ? 'Saving Configuration...' : 
           saveResult?.success ? 'Setup Complete!' : 'Finalizing Setup'}
        </h3>
        <p className="text-muted-foreground">
          {isSaving ? 'Securely storing your configuration...' :
           saveResult?.success ? 'Your AI Interview Prep platform is ready to use!' :
           'Saving your configuration to secure cookies'}
        </p>
      </div>

      {/* Configuration Summary */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="font-medium text-card-foreground mb-3 flex items-center space-x-2">
          <span className="text-xl">{provider?.logo}</span>
          <span>Configuration Summary</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Provider:</span>
            <span className="ml-2 font-medium">{provider?.displayName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Model:</span>
            <span className="ml-2 font-medium">{selectedModel}</span>
          </div>
          <div>
            <span className="text-muted-foreground">API URL:</span>
            <span className="ml-2 font-medium">{config.apiUrl}</span>
          </div>
          <div>
            <span className="text-muted-foreground">API Key:</span>
            <span className="ml-2 font-medium">
              {config.apiKey ? '••••••••' : 'Not provided'}
            </span>
          </div>
        </div>
      </div>

      {/* Save Result */}
      {saveResult && (
        <div className={`border rounded-lg p-4 ${
          saveResult.success 
            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-start space-x-3">
            {saveResult.success ? (
              <Cookie className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={`font-medium ${
                saveResult.success ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
              }`}>
                {saveResult.success ? 'Configuration Saved!' : 'Save Failed'}
              </h4>
              <p className={`text-sm ${
                saveResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
              }`}>
                {saveResult.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security Information */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center space-x-2">
          <Shield className="w-4 h-4" />
          <span>Security & Privacy</span>
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Your API key is encrypted before storage</li>
          <li>• Configuration is stored in secure, httpOnly cookies</li>
          <li>• Data remains on your device only</li>
          <li>• Cookies expire automatically after 30 days</li>
          <li>• You can clear your data anytime in settings</li>
        </ul>
      </div>

      {/* Next Steps */}
      {saveResult?.success && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
            📋 Next Steps
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-amber-800 dark:text-amber-200">
            <li>Your configuration is now active</li>
            <li>Start practicing with AI-powered interviews</li>
            <li>Access your settings anytime to update configuration</li>
            <li>View your progress and personalized roadmaps</li>
          </ol>
        </div>
      )}

      {/* Retry Option */}
      {saveResult && !saveResult.success && (
        <div className="flex justify-center">
          <button
            onClick={handleRetry}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          Back
        </button>
        <button
          onClick={onComplete}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          {saveResult?.success ? 'Complete Setup' : 'Finish Anyway'}
        </button>
      </div>
    </div>
  );
}
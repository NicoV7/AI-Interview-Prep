'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, Settings, RefreshCw } from 'lucide-react';
import { checkAppConfiguration } from '@/lib/fileSystem';

interface ConfigurationStatusProps {
  onSetupClick: () => void;
  refreshTrigger?: number; // Can be used to trigger refresh from parent
}

export function ConfigurationStatus({ onSetupClick, refreshTrigger }: ConfigurationStatusProps) {
  const [configStatus, setConfigStatus] = useState<{
    isConfigured: boolean;
    missing: string[];
    hasAnyProvider: boolean;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConfiguration = async () => {
    setIsChecking(true);
    // Add a small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500));
    const status = checkAppConfiguration();
    setConfigStatus(status);
    setIsChecking(false);
  };

  useEffect(() => {
    checkConfiguration();
  }, [refreshTrigger]);

  if (!configStatus && !isChecking) {
    return null;
  }

  if (isChecking) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">Checking configuration...</span>
        </div>
      </div>
    );
  }

  const isConfigured = configStatus?.isConfigured ?? false;

  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isConfigured ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          )}
          <div>
            <h3 className="font-medium text-card-foreground">
              {isConfigured ? 'Configuration Complete' : 'Setup Required'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isConfigured 
                ? 'Your AI Interview Prep platform is configured and ready to use.'
                : `Missing configuration: ${configStatus?.missing.join(', ')}`
              }
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={checkConfiguration}
            disabled={isChecking}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            title="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={onSetupClick}
            className="flex items-center space-x-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
          >
            <Settings className="w-4 h-4" />
            <span>{isConfigured ? 'Reconfigure' : 'Setup Now'}</span>
          </button>
        </div>
      </div>

      {configStatus && !isConfigured && (
        <div className="mt-3 pt-3 border-t border-border">
          <h4 className="text-sm font-medium text-card-foreground mb-2">Required Steps:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Choose an AI provider (OpenAI, Claude, or Gemini)</li>
            <li>• Enter your API key for the selected provider</li>
            <li>• Configure your backend API URL</li>
            <li>• Create the .env configuration file</li>
          </ul>
        </div>
      )}
    </div>
  );
}
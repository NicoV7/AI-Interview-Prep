'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Settings, RefreshCw, Cookie } from 'lucide-react';
import { hasValidConfig, getConfigSummary } from '@/lib/cookieConfig';

interface ConfigurationStatusProps {
  onSetupClick: () => void;
  refreshTrigger?: number;
}

export function ConfigurationStatus({ onSetupClick, refreshTrigger }: ConfigurationStatusProps) {
  const [configStatus, setConfigStatus] = useState<{
    isConfigured: boolean;
    provider?: string;
    model?: string;
    createdAt?: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConfiguration = async () => {
    setIsChecking(true);
    // Add a small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const isConfigured = hasValidConfig();
    const summary = getConfigSummary();
    
    setConfigStatus({
      isConfigured,
      provider: summary?.provider,
      model: summary?.model,
      createdAt: summary?.createdAt
    });
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
              {isConfigured ? 'Configuration Active' : 'Setup Required'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isConfigured 
                ? `${configStatus?.provider} (${configStatus?.model}) - Stored in secure cookies`
                : 'Cookie-based configuration required to get started'
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
          <h4 className="text-sm font-medium text-card-foreground mb-2">Setup Benefits:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Secure, encrypted storage of API keys</li>
            <li>• No local file management required</li>
            <li>• Seamless AI provider integration</li>
            <li>• Auto-expiring configuration for security</li>
          </ul>
        </div>
      )}

      {configStatus && isConfigured && configStatus.createdAt && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Cookie className="w-3 h-3" />
              <span>Cookie-based</span>
            </div>
            <span>Created: {new Date(configStatus.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
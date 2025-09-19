'use client';

import { useState, useEffect } from 'react';
import { Settings, Shield, Trash2, Download, RefreshCw, Eye, EyeOff, Cookie } from 'lucide-react';
import { 
  loadConfigFromCookie, 
  clearConfigCookie, 
  getConfigSummary, 
  exportConfigForDownload,
  hasValidConfig 
} from '@/lib/cookieConfig';
import { getProviderById } from '@/lib/aiProviders';

interface ConfigurationPanelProps {
  onResetClick?: () => void;
  onUpdateClick?: () => void;
}

export function ConfigurationPanel({ onResetClick, onUpdateClick }: ConfigurationPanelProps) {
  const [configSummary, setConfigSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setIsLoading(true);
    try {
      const summary = getConfigSummary();
      setConfigSummary(summary);
    } catch (error) {
      console.error('Failed to load configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConfiguration = () => {
    if (confirm('Are you sure you want to clear your configuration? You will need to set up your AI provider again.')) {
      clearConfigCookie();
      setConfigSummary(null);
      if (onResetClick) {
        onResetClick();
      }
    }
  };

  const handleExportConfiguration = () => {
    const exportData = exportConfigForDownload();
    if (exportData) {
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai-interview-config.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const provider = configSummary ? getProviderById(configSummary.provider) : null;
  const isConfigured = hasValidConfig();

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-5 h-5 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading configuration...</span>
        </div>
      </div>
    );
  }

  if (!isConfigured || !configSummary) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center">
          <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            No Configuration Found
          </h3>
          <p className="text-muted-foreground mb-4">
            Set up your AI provider to get started with AI Interview Prep.
          </p>
          <button
            onClick={onUpdateClick}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Setup Configuration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-card-foreground flex items-center space-x-2">
          <Cookie className="w-5 h-5" />
          <span>Current Configuration</span>
        </h3>
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Configuration Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{provider?.logo}</span>
            <div>
              <p className="text-sm text-muted-foreground">Provider</p>
              <p className="font-medium text-card-foreground">{provider?.displayName}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Model</p>
            <p className="font-medium text-card-foreground">{configSummary.model}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">API URL</p>
            <p className="font-medium text-card-foreground">{configSummary.apiUrl}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Created</p>
            <p className="font-medium text-card-foreground">
              {new Date(configSummary.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Secure Storage
            </span>
          </div>
          <p className="text-xs text-blue-800 dark:text-blue-200">
            Your API key is encrypted and stored securely in cookies. Configuration expires in 30 days.
          </p>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            <button
              onClick={onUpdateClick}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm flex items-center space-x-1"
            >
              <Settings className="w-3 h-3" />
              <span>Update</span>
            </button>
            
            <button
              onClick={handleExportConfiguration}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1"
            >
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>
            
            <button
              onClick={loadConfiguration}
              className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={handleClearConfiguration}
              className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm flex items-center space-x-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
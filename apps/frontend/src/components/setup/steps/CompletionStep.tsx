'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Download, Copy, FolderOpen, AlertTriangle, RefreshCw, Terminal } from 'lucide-react';
import { StepWithCompletionProps } from '../types';
import { 
  createEnvFile, 
  SetupConfig, 
  FileWriteResult, 
  getBrowserCompatibility,
  validateEnvironmentLoaded
} from '@/lib/fileSystem';
import { getProviderById } from '@/lib/aiProviders';

interface CompletionStepProps extends StepWithCompletionProps {
  selectedProvider: string;
  selectedModel: string;
}

export function CompletionStep({ 
  envValues, 
  selectedProvider, 
  selectedModel, 
  onComplete, 
  onPrev 
}: CompletionStepProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<FileWriteResult | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const provider = getProviderById(selectedProvider);
  const compatibility = getBrowserCompatibility();

  useEffect(() => {
    // Auto-create file when component mounts
    handleCreateFile();
  }, []);

  const buildSetupConfig = (): SetupConfig => {
    const providerUpper = selectedProvider.toUpperCase();
    return {
      provider: selectedProvider,
      model: selectedModel,
      apiKey: envValues[`${providerUpper}_API_KEY`] || '',
      apiUrl: envValues['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001',
      supabaseUrl: envValues['SUPABASE_URL'] || '',
      supabaseAnonKey: envValues['SUPABASE_ANON_KEY'] || '',
    };
  };

  const handleCreateFile = async () => {
    setIsCreating(true);
    try {
      const config = buildSetupConfig();
      const fileResult = await createEnvFile(config);
      setResult(fileResult);
      
      if (fileResult.success) {
        // Show instructions for a few seconds, then auto-hide
        setShowInstructions(true);
        setTimeout(() => setShowInstructions(false), 10000);
      }
    } catch (error) {
      setResult({
        success: false,
        method: 'failed',
        message: 'An unexpected error occurred while creating the file',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    handleCreateFile();
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'direct':
        return <FolderOpen className="w-5 h-5 text-green-600" />;
      case 'download':
        return <Download className="w-5 h-5 text-blue-600" />;
      case 'clipboard':
        return <Copy className="w-5 h-5 text-orange-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
  };

  const getMethodDescription = (method: string) => {
    switch (method) {
      case 'direct':
        return 'File created directly in your project directory';
      case 'download':
        return 'File downloaded to your Downloads folder';
      case 'clipboard':
        return 'Content copied to clipboard for manual file creation';
      default:
        return 'File creation failed';
    }
  };

  const config = buildSetupConfig();
  const validation = validateEnvironmentLoaded(config);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          result?.success ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'
        }`}>
          {isCreating ? (
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          ) : result?.success ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <Terminal className="w-8 h-8 text-blue-600" />
          )}
        </div>
        <h3 className="text-xl font-semibold text-card-foreground mb-2">
          {isCreating ? 'Creating Configuration...' : 
           result?.success ? 'Setup Complete!' : 'Finalizing Setup'}
        </h3>
        <p className="text-muted-foreground">
          {isCreating ? 'Setting up your .env file...' :
           result?.success ? 'Your AI Interview Prep platform is ready to use!' :
           'Creating your environment configuration file'}
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

      {/* File Creation Result */}
      {result && (
        <div className={`border rounded-lg p-4 ${
          result.success 
            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-start space-x-3">
            {getMethodIcon(result.method)}
            <div className="flex-1">
              <h4 className={`font-medium ${
                result.success ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
              }`}>
                {result.success ? 'Success!' : 'File Creation Failed'}
              </h4>
              <p className={`text-sm ${
                result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
              }`}>
                {getMethodDescription(result.method)}
              </p>
              <p className={`text-sm mt-1 ${
                result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}>
                {result.message}
              </p>
              {result.error && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Error: {result.error}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Browser Compatibility Info */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Browser Compatibility
        </h4>
        <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
          {compatibility.recommendation}
        </p>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className={`flex items-center space-x-1 ${
            compatibility.fileSystemAccess ? 'text-green-600' : 'text-gray-500'
          }`}>
            <CheckCircle className="w-3 h-3" />
            <span>Direct File Access</span>
          </div>
          <div className={`flex items-center space-x-1 ${
            compatibility.download ? 'text-green-600' : 'text-gray-500'
          }`}>
            <CheckCircle className="w-3 h-3" />
            <span>File Download</span>
          </div>
          <div className={`flex items-center space-x-1 ${
            compatibility.clipboard ? 'text-green-600' : 'text-gray-500'
          }`}>
            <CheckCircle className="w-3 h-3" />
            <span>Clipboard Access</span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      {result?.success && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
            📋 Next Steps
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-amber-800 dark:text-amber-200">
            {validation.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Retry Option */}
      {result && !result.success && (
        <div className="flex justify-center">
          <button
            onClick={handleRetry}
            disabled={isCreating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isCreating ? 'animate-spin' : ''}`} />
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
          {result?.success ? 'Complete Setup' : 'Finish Anyway'}
        </button>
      </div>
    </div>
  );
}
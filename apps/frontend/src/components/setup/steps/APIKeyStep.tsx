'use client';

import { useState } from 'react';
import { Eye, EyeOff, ExternalLink, Key, AlertCircle, CheckCircle } from 'lucide-react';
import { StepProps } from '../types';
import { getProviderById, validateApiKey } from '@/lib/aiProviders';

interface APIKeyStepProps extends StepProps {
  selectedProvider: string;
  selectedModel: string;
  apiKey?: string;
  onApiKeyChange: (apiKey: string) => void;
}

export function APIKeyStep({
  selectedProvider,
  selectedModel,
  apiKey = '',
  onApiKeyChange,
  onNext,
  onPrev,
  onSkip
}: APIKeyStepProps) {
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  const provider = getProviderById(selectedProvider);
  
  if (!provider) {
    return (
      <div className="text-center">
        <p className="text-destructive">Provider not found. Please go back and select a provider.</p>
      </div>
    );
  }

  const handleInputChange = (value: string) => {
    onApiKeyChange(value);
  };

  const isValidKey = apiKey ? validateApiKey(selectedProvider, apiKey) : false;
  const canProceed = isValidKey || apiKey.trim() === '';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Key className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-card-foreground mb-2">
          {provider.displayName} API Key
        </h3>
        <p className="text-muted-foreground">
          Enter your API key to enable AI-powered features using {selectedModel}
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-3">
          <span className="text-2xl">{provider.logo}</span>
          <div>
            <h4 className="font-medium text-card-foreground">{provider.displayName}</h4>
            <p className="text-sm text-muted-foreground">Model: {selectedModel}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="api-key" className="block text-sm font-medium text-card-foreground mb-2">
            API Key
          </label>
          <div className="relative">
            <input
              id="api-key"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={provider.apiKeyFormat.example}
              className={`w-full px-3 py-2 pr-20 bg-background border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                apiKey && !isValidKey ? 'border-destructive' : 'border-border'
              }`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              {apiKey && (
                <div className="mr-1">
                  {isValidKey ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {apiKey && !isValidKey && (
            <div className="mt-2 flex items-center space-x-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Invalid API key format for {provider.displayName}</span>
            </div>
          )}
          {apiKey && isValidKey && (
            <div className="mt-2 flex items-center space-x-2 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Valid API key format</span>
            </div>
          )}
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            How to get your {provider.displayName} API key:
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>Visit {provider.displayName}&apos;s developer platform</li>
            <li>Sign up or log in to your account</li>
            <li>Navigate to the API keys section</li>
            <li>Create a new API key</li>
            <li>Copy and paste it here</li>
          </ol>
          <a
            href={provider.apiKeyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline mt-2 text-sm"
          >
            <span>Get your {provider.displayName} API key</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
            Expected Format
          </h4>
          <div className="text-sm text-green-800 dark:text-green-200">
            <p>Your {provider.displayName} API key should start with: <code className="bg-green-100 dark:bg-green-900 px-1 py-0.5 rounded">{provider.apiKeyFormat.prefix}</code></p>
            <p className="mt-1">Example: <code className="bg-green-100 dark:bg-green-900 px-1 py-0.5 rounded">{provider.apiKeyFormat.example}</code></p>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
            Security & Pricing
          </h4>
          <div className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
            <p>• Your API key is stored locally and never sent to our servers</p>
            <p>• {provider.pricing.freeCredits ? provider.pricing.freeCredits : 'Pay-per-use pricing applies'}</p>
            <p>• You can monitor usage on the {provider.displayName} dashboard</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <div className="flex space-x-2">
          <button
            onClick={onPrev}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Back
          </button>
          <button
            onClick={onSkip}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        </div>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-6 py-2 rounded-lg transition-colors ${
            canProceed
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { ExternalLink, Check, Zap, Brain, Diamond } from 'lucide-react';
import { StepProps } from '../types';
import { AI_PROVIDERS, AIProvider } from '@/lib/aiProviders';

interface ProviderSelectionStepProps extends StepProps {
  selectedProvider?: string;
  onProviderSelect: (providerId: string) => void;
}

export function ProviderSelectionStep({ 
  selectedProvider, 
  onProviderSelect, 
  onNext, 
  onPrev 
}: ProviderSelectionStepProps) {
  const [hoveredProvider, setHoveredProvider] = useState<string | null>(null);

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'openai':
        return <Brain className="w-8 h-8 text-primary" />;
      case 'anthropic':
        return <Zap className="w-8 h-8 text-primary" />;
      case 'google':
        return <Diamond className="w-8 h-8 text-primary" />;
      default:
        return <Brain className="w-8 h-8 text-primary" />;
    }
  };

  const handleProviderSelect = (provider: AIProvider) => {
    onProviderSelect(provider.id);
  };

  const canProceed = !!selectedProvider;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-card-foreground mb-2">
          Choose AI Provider
        </h3>
        <p className="text-muted-foreground">
          Select your preferred AI provider for interview preparation and roadmap generation
        </p>
      </div>

      <div className="grid gap-4">
        {AI_PROVIDERS.map((provider) => (
          <div
            key={provider.id}
            className={`relative p-6 border rounded-lg cursor-pointer transition-all duration-200 ${
              selectedProvider === provider.id
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : hoveredProvider === provider.id
                ? 'border-primary/50 bg-primary/5'
                : 'border-border hover:border-primary/30'
            }`}
            onClick={() => handleProviderSelect(provider)}
            onMouseEnter={() => setHoveredProvider(provider.id)}
            onMouseLeave={() => setHoveredProvider(null)}
          >
            {selectedProvider === provider.id && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>
            )}

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {getProviderIcon(provider.id)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="text-lg font-semibold text-card-foreground">
                    {provider.displayName}
                  </h4>
                  <span className="text-xl">{provider.logo}</span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {provider.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-background border border-border rounded p-2">
                    <div className="font-medium text-card-foreground mb-1">Pricing</div>
                    <div className="text-muted-foreground">{provider.pricing.tierDescription}</div>
                    {provider.pricing.freeCredits && (
                      <div className="text-green-600 dark:text-green-400 mt-1">
                        {provider.pricing.freeCredits}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-background border border-border rounded p-2">
                    <div className="font-medium text-card-foreground mb-1">Models Available</div>
                    <div className="text-muted-foreground">
                      {provider.models.length} models • Context up to{' '}
                      {Math.max(...provider.models.map(m => m.contextLimit)).toLocaleString()} tokens
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center space-x-4 text-xs text-muted-foreground">
                  <a
                    href={provider.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 hover:text-primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>Learn more</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={provider.apiKeyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 hover:text-primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>Get API key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Choosing the Right Provider
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• <strong>OpenAI:</strong> Industry standard, excellent for complex coding problems</li>
          <li>• <strong>Claude:</strong> Known for safety and detailed explanations</li>
          <li>• <strong>Gemini:</strong> Google&apos;s latest with massive context windows</li>
        </ul>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
          Cost Considerations
        </h4>
        <p className="text-sm text-amber-800 dark:text-amber-200">
          All providers offer free credits to get started. You can always switch providers later 
          by updating your environment variables.
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          Back
        </button>
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
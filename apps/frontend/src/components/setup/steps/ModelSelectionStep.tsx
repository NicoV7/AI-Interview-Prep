'use client';

import { useState } from 'react';
import { Check, Star, Zap, DollarSign, Database } from 'lucide-react';
import { StepProps } from '../types';
import { getProviderById, AIModel } from '@/lib/aiProviders';

interface ModelSelectionStepProps extends StepProps {
  selectedProvider: string;
  selectedModel?: string;
  onModelSelect: (modelId: string) => void;
}

export function ModelSelectionStep({
  selectedProvider,
  selectedModel,
  onModelSelect,
  onNext,
  onPrev
}: ModelSelectionStepProps) {
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);
  
  const provider = getProviderById(selectedProvider);
  
  if (!provider) {
    return (
      <div className="text-center">
        <p className="text-destructive">Provider not found. Please go back and select a provider.</p>
      </div>
    );
  }

  const handleModelSelect = (model: AIModel) => {
    onModelSelect(model.id);
  };

  const canProceed = !!selectedModel;

  const formatContextLimit = (limit: number) => {
    if (limit >= 1000000) {
      return `${(limit / 1000000).toFixed(1)}M tokens`;
    } else if (limit >= 1000) {
      return `${(limit / 1000).toFixed(0)}K tokens`;
    }
    return `${limit} tokens`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">{provider.logo}</span>
        </div>
        <h3 className="text-xl font-semibold text-card-foreground mb-2">
          Choose {provider.displayName} Model
        </h3>
        <p className="text-muted-foreground">
          Select the model that best fits your needs and budget
        </p>
      </div>

      <div className="space-y-4">
        {provider.models.map((model) => (
          <div
            key={model.id}
            className={`relative p-6 border rounded-lg cursor-pointer transition-all duration-200 ${
              selectedModel === model.id
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : hoveredModel === model.id
                ? 'border-primary/50 bg-primary/5'
                : 'border-border hover:border-primary/30'
            }`}
            onClick={() => handleModelSelect(model)}
            onMouseEnter={() => setHoveredModel(model.id)}
            onMouseLeave={() => setHoveredModel(null)}
          >
            {selectedModel === model.id && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>
            )}

            {model.recommended && (
              <div className="absolute top-3 left-3">
                <div className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                  <Star className="w-3 h-3" />
                  <span>Recommended</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-card-foreground flex items-center space-x-2">
                  <span>{model.name}</span>
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {model.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-background border border-border rounded p-3">
                  <div className="flex items-center space-x-2 text-primary mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium text-sm">Pricing</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <div>Input: {model.pricing.input}</div>
                    <div>Output: {model.pricing.output}</div>
                  </div>
                </div>

                <div className="bg-background border border-border rounded p-3">
                  <div className="flex items-center space-x-2 text-primary mb-1">
                    <Database className="w-4 h-4" />
                    <span className="font-medium text-sm">Context</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatContextLimit(model.contextLimit)}
                  </div>
                </div>

                <div className="bg-background border border-border rounded p-3">
                  <div className="flex items-center space-x-2 text-primary mb-1">
                    <Zap className="w-4 h-4" />
                    <span className="font-medium text-sm">Best For</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {model.capabilities.slice(0, 2).join(', ')}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-medium text-sm text-card-foreground">Capabilities:</h5>
                <div className="flex flex-wrap gap-2">
                  {model.capabilities.map((capability, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-md"
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
          💡 For Interview Preparation
        </h4>
        <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
          <p>• <strong>Recommended models</strong> are optimized for coding interviews</p>
          <p>• Higher context limits allow for analyzing longer code snippets</p>
          <p>• You can change models later by updating your environment variables</p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Model Comparison Tips
        </h4>
        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <p>• Start with recommended models for the best balance of performance and cost</p>
          <p>• Premium models excel at complex algorithmic problems</p>
          <p>• Faster models are great for quick code reviews and explanations</p>
        </div>
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
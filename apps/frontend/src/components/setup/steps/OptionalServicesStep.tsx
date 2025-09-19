'use client';

import { useState } from 'react';
import { Database, Eye, EyeOff, ExternalLink, AlertCircle } from 'lucide-react';
import { StepProps } from '../types';
import { STATIC_ENV_VARIABLES, validateEnvVariable } from '@/lib/envValidation';

export function OptionalServicesStep({ envValues, updateEnvValue, onNext, onPrev }: StepProps) {
  const [showKey, setShowKey] = useState(false);
  
  const supabaseUrlConfig = STATIC_ENV_VARIABLES.find(v => v.key === 'SUPABASE_URL')!;
  const supabaseKeyConfig = STATIC_ENV_VARIABLES.find(v => v.key === 'SUPABASE_ANON_KEY')!;
  
  const urlValue = envValues[supabaseUrlConfig.key] || '';
  const keyValue = envValues[supabaseKeyConfig.key] || '';
  
  const urlValidation = validateEnvVariable(supabaseUrlConfig, urlValue);
  const keyValidation = validateEnvVariable(supabaseKeyConfig, keyValue);

  const handleInputChange = (key: string, value: string) => {
    updateEnvValue(key, value);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Database className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-card-foreground mb-2">
          Optional Services
        </h3>
        <p className="text-muted-foreground">
          Configure additional services for enhanced features (can be skipped)
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Supabase Integration (Optional)
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Supabase will be used for future features like user authentication, progress tracking, 
            and sharing roadmaps. You can set this up later when these features are available.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="supabase-url" className="block text-sm font-medium text-card-foreground mb-2">
              Supabase Project URL
            </label>
            <input
              id="supabase-url"
              type="url"
              value={urlValue}
              onChange={(e) => handleInputChange(supabaseUrlConfig.key, e.target.value)}
              placeholder={supabaseUrlConfig.placeholder}
              className={`w-full px-3 py-2 bg-background border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                urlValidation.errors.length > 0 ? 'border-destructive' : 'border-border'
              }`}
            />
            {urlValidation.errors.length > 0 && (
              <div className="mt-2 flex items-center space-x-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{urlValidation.errors[0]}</span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="supabase-key" className="block text-sm font-medium text-card-foreground mb-2">
              Supabase Anonymous Key
            </label>
            <div className="relative">
              <input
                id="supabase-key"
                type={showKey ? 'text' : 'password'}
                value={keyValue}
                onChange={(e) => handleInputChange(supabaseKeyConfig.key, e.target.value)}
                placeholder={supabaseKeyConfig.placeholder}
                className={`w-full px-3 py-2 pr-10 bg-background border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  keyValidation.errors.length > 0 ? 'border-destructive' : 'border-border'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {keyValidation.errors.length > 0 && (
              <div className="mt-2 flex items-center space-x-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{keyValidation.errors[0]}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
            How to get Supabase credentials:
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-green-800 dark:text-green-200">
            <li>Create a free account at supabase.com</li>
            <li>Create a new project</li>
            <li>Go to Settings → API</li>
            <li>Copy the Project URL and anon/public key</li>
          </ol>
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-green-600 dark:text-green-400 hover:underline mt-2 text-sm"
          >
            <span>Visit Supabase</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
            Skip for Now
          </h4>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            You can always add these credentials later when we implement database features. 
            The app will work fine without them for now.
          </p>
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
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
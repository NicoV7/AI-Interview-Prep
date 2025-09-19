'use client';

import { Server, AlertCircle, RefreshCw } from 'lucide-react';
import { StepProps } from '../types';
import { STATIC_ENV_VARIABLES, validateEnvVariable } from '@/lib/envValidation';

export function APIUrlStep({ envValues, updateEnvValue, onNext, onPrev, onSkip }: StepProps) {
  const apiConfig = STATIC_ENV_VARIABLES.find(v => v.key === 'NEXT_PUBLIC_API_URL')!;
  const currentValue = envValues[apiConfig.key] || '';
  const validation = validateEnvVariable(apiConfig, currentValue);

  const handleInputChange = (value: string) => {
    updateEnvValue(apiConfig.key, value);
  };

  const useDefault = () => {
    handleInputChange(apiConfig.defaultValue || '');
  };

  const canProceed = validation.isValid;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Server className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-card-foreground mb-2">
          Backend API Configuration
        </h3>
        <p className="text-muted-foreground">
          Configure the connection to your backend API server
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="api-url" className="block text-sm font-medium text-card-foreground mb-2">
            API URL
          </label>
          <div className="relative">
            <input
              id="api-url"
              type="url"
              value={currentValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={apiConfig.placeholder}
              className={`w-full px-3 py-2 pr-10 bg-background border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                validation.errors.length > 0 ? 'border-destructive' : 'border-border'
              }`}
            />
            <button
              type="button"
              onClick={useDefault}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              title="Use default URL"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          {validation.errors.length > 0 && (
            <div className="mt-2 flex items-center space-x-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{validation.errors[0]}</span>
            </div>
          )}
        </div>

        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
            Default Configuration
          </h4>
          <p className="text-sm text-green-800 dark:text-green-200">
            For local development, the default URL <code className="bg-green-100 dark:bg-green-900 px-1 py-0.5 rounded">
            {apiConfig.defaultValue}</code> should work if you&apos;re running the backend server locally.
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Starting the Backend Server
          </h4>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p>To start your backend server:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open a new terminal</li>
              <li>Navigate to your project root</li>
              <li>Run: <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">npm run dev</code></li>
              <li>The backend should start on port 3001</li>
            </ol>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
            Production Deployment
          </h4>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            When deploying to production, update this URL to point to your hosted backend API.
          </p>
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
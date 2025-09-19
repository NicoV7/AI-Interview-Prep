'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { StepWithCompletionProps } from '../types';
import { getAllEnvVariables, checkCurrentEnvVariables } from '@/lib/envValidation';

interface VerificationStepProps extends StepWithCompletionProps {
  selectedProvider?: string;
}

export function VerificationStep({ selectedProvider, onPrev, onComplete }: VerificationStepProps) {
  const [envStatus, setEnvStatus] = useState<Record<string, boolean>>({});
  const [isChecking, setIsChecking] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  const checkEnvironment = () => {
    setIsChecking(true);
    
    setTimeout(() => {
      const status = checkCurrentEnvVariables(selectedProvider);
      setEnvStatus(status);
      setIsChecking(false);
      setHasChecked(true);
    }, 1000);
  };

  useEffect(() => {
    checkEnvironment();
  }, []);

  const allVariables = getAllEnvVariables(selectedProvider);
  const requiredVars = allVariables.filter(v => v.required);
  const optionalVars = allVariables.filter(v => !v.required);
  
  const requiredConfigured = requiredVars.filter(v => envStatus[v.key]).length;
  const totalRequired = requiredVars.length;
  const allRequiredConfigured = requiredConfigured === totalRequired;

  const getStatusIcon = (configured: boolean) => {
    if (isChecking) {
      return <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />;
    }
    return configured 
      ? <CheckCircle className="w-4 h-4 text-green-600" />
      : <XCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          allRequiredConfigured 
            ? 'bg-green-100 dark:bg-green-900' 
            : 'bg-amber-100 dark:bg-amber-900'
        }`}>
          {isChecking ? (
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          ) : allRequiredConfigured ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          )}
        </div>
        <h3 className="text-xl font-semibold text-card-foreground mb-2">
          {isChecking ? 'Checking Configuration...' : 
           allRequiredConfigured ? 'Setup Complete!' : 'Setup Verification'}
        </h3>
        <p className="text-muted-foreground">
          {isChecking ? 'Verifying your environment variables...' :
           allRequiredConfigured ? 'All required environment variables are configured.' :
           'Some required environment variables are missing.'}
        </p>
      </div>

      {hasChecked && (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-card-foreground mb-3">
              Required Configuration ({requiredConfigured}/{totalRequired})
            </h4>
            <div className="space-y-2">
              {requiredVars.map((variable) => (
                <div 
                  key={variable.key}
                  className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
                >
                  <div>
                    <div className="font-medium text-card-foreground">
                      {variable.label}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {variable.key}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(envStatus[variable.key])}
                    <span className={`text-sm ${
                      envStatus[variable.key] ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {envStatus[variable.key] ? 'Configured' : 'Missing'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-card-foreground mb-3">
              Optional Configuration
            </h4>
            <div className="space-y-2">
              {optionalVars.map((variable) => (
                <div 
                  key={variable.key}
                  className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
                >
                  <div>
                    <div className="font-medium text-card-foreground">
                      {variable.label}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {variable.key}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(envStatus[variable.key])}
                    <span className={`text-sm ${
                      envStatus[variable.key] ? 'text-green-600' : 'text-muted-foreground'
                    }`}>
                      {envStatus[variable.key] ? 'Configured' : 'Not set'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!allRequiredConfigured && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                Missing Configuration
              </h4>
              <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                Make sure you&apos;ve placed the .env file in your project root and restarted your development server.
              </p>
              <button
                onClick={checkEnvironment}
                className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-md text-sm hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Check Again</span>
              </button>
            </div>
          )}

          {allRequiredConfigured && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                Ready to Go!
              </h4>
              <p className="text-sm text-green-800 dark:text-green-200">
                Your AI Interview Prep platform is now configured and ready to use. 
                You can start generating personalized roadmaps and practice coding interviews.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          Back
        </button>
        <div className="flex space-x-2">
          <button
            onClick={checkEnvironment}
            disabled={isChecking}
            className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors flex items-center space-x-1 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Recheck</span>
          </button>
          <button
            onClick={onComplete}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            {allRequiredConfigured ? 'Get Started' : 'Continue Anyway'}
          </button>
        </div>
      </div>
    </div>
  );
}
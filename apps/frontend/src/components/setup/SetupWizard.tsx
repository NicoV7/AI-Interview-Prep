'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { WelcomeStep } from './steps/WelcomeStep';
import { LoginStep } from './steps/LoginStep';
import { ProviderSelectionStep } from './steps/ProviderSelectionStep';
import { ModelSelectionStep } from './steps/ModelSelectionStep';
import { APIKeyStep } from './steps/APIKeyStep';
import { CookieCompletionStep } from './steps/CookieCompletionStep';
import { getRecommendedModel } from '@/lib/aiProviders';

export interface SetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export type SetupStep = 'welcome' | 'login' | 'provider' | 'model' | 'api-key' | 'complete';

export interface SetupWizardState {
  currentStep: SetupStep;
  email: string;
  password: string;
  selectedProvider?: string;
  selectedModel?: string;
  apiKey: string;
  apiUrl: string;
  isValid: boolean;
  errors: string[];
  canSkip: boolean;
}

const STEP_ORDER: SetupStep[] = ['welcome', 'login', 'provider', 'model', 'api-key', 'complete'];

const STEP_TITLES: Record<SetupStep, string> = {
  welcome: 'Welcome',
  login: 'Login Information',
  provider: 'AI Provider',
  model: 'Model Selection',
  'api-key': 'API Key',
  complete: 'Complete Setup'
};

export function SetupWizard({ isOpen, onClose, onComplete }: SetupWizardProps) {
  const [state, setState] = useState<SetupWizardState>({
    currentStep: 'welcome',
    email: '',
    password: '',
    selectedProvider: undefined,
    selectedModel: undefined,
    apiKey: '',
    apiUrl: 'http://localhost:3003',
    isValid: false,
    errors: [],
    canSkip: true
  });

  useEffect(() => {
    if (isOpen) {
      setState(prev => ({
        ...prev,
        currentStep: 'welcome',
        email: '',
        password: '',
        selectedProvider: undefined,
        selectedModel: undefined,
        apiKey: '',
        apiUrl: 'http://localhost:3003'
      }));
    }
  }, [isOpen]);

  const currentStepIndex = STEP_ORDER.indexOf(state.currentStep);
  const progress = ((currentStepIndex + 1) / STEP_ORDER.length) * 100;

  const handleEmailChange = (email: string) => {
    setState(prev => ({ ...prev, email }));
  };

  const handlePasswordChange = (password: string) => {
    setState(prev => ({ ...prev, password }));
  };

  const handleProviderSelect = (providerId: string) => {
    const recommendedModel = getRecommendedModel(providerId);

    setState(prev => ({
      ...prev,
      selectedProvider: providerId,
      selectedModel: recommendedModel?.id
    }));
  };

  const handleModelSelect = (modelId: string) => {
    setState(prev => ({
      ...prev,
      selectedModel: modelId
    }));
  };

  const handleApiKeyChange = (apiKey: string) => {
    setState(prev => ({
      ...prev,
      apiKey
    }));
  };

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEP_ORDER.length) {
      setState(prev => ({
        ...prev,
        currentStep: STEP_ORDER[nextIndex]
      }));
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setState(prev => ({
        ...prev,
        currentStep: STEP_ORDER[prevIndex]
      }));
    }
  };

  const goToStep = (step: SetupStep) => {
    setState(prev => ({
      ...prev,
      currentStep: step
    }));
  };

  const skipSetup = () => {
    onClose();
    if (onComplete) onComplete();
  };

  const completeSetup = () => {
    onClose();
    if (onComplete) onComplete();
  };

  if (!isOpen) return null;

  const renderCurrentStep = () => {
    const commonProps = {
      envValues: {}, // Empty for compatibility
      updateEnvValue: () => {}, // Empty for compatibility
      onNext: nextStep,
      onPrev: prevStep,
      onSkip: skipSetup,
      isValid: state.isValid,
      errors: state.errors
    };

    switch (state.currentStep) {
      case 'welcome':
        return <WelcomeStep {...commonProps} />;
      case 'login':
        return (
          <LoginStep
            {...commonProps}
            email={state.email}
            password={state.password}
            onEmailChange={handleEmailChange}
            onPasswordChange={handlePasswordChange}
          />
        );
      case 'provider':
        return (
          <ProviderSelectionStep
            {...commonProps}
            selectedProvider={state.selectedProvider}
            onProviderSelect={handleProviderSelect}
          />
        );
      case 'model':
        return (
          <ModelSelectionStep
            {...commonProps}
            selectedProvider={state.selectedProvider!}
            selectedModel={state.selectedModel}
            onModelSelect={handleModelSelect}
          />
        );
      case 'api-key':
        return (
          <APIKeyStep
            {...commonProps}
            selectedProvider={state.selectedProvider!}
            selectedModel={state.selectedModel!}
            apiKey={state.apiKey}
            onApiKeyChange={handleApiKeyChange}
          />
        );
      case 'complete':
        return (
          <CookieCompletionStep
            {...commonProps}
            email={state.email}
            password={state.password}
            selectedProvider={state.selectedProvider!}
            selectedModel={state.selectedModel!}
            apiKey={state.apiKey}
            apiUrl={state.apiUrl}
            onComplete={completeSetup}
          />
        );
      default:
        return <WelcomeStep {...commonProps} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
        
        <div className="relative w-full max-w-2xl bg-card border border-border rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-card-foreground">
                Setup Wizard
              </h2>
              <p className="text-muted-foreground">
                Step {currentStepIndex + 1} of {STEP_ORDER.length}: {STEP_TITLES[state.currentStep]}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Close setup wizard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-1 bg-accent">
            <div 
              className="h-1 bg-primary rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-6">
            {renderCurrentStep()}
          </div>

          <div className="flex justify-between items-center p-6 border-t border-border bg-muted/50">
            <div className="flex space-x-2">
              {STEP_ORDER.map((step, index) => (
                <button
                  key={step}
                  onClick={() => goToStep(step)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index <= currentStepIndex
                      ? 'bg-primary'
                      : 'bg-border hover:bg-muted-foreground'
                  }`}
                  aria-label={`Go to ${STEP_TITLES[step]} step`}
                />
              ))}
            </div>
            
            <div className="text-sm text-muted-foreground">
              All configuration stays on your local machine
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
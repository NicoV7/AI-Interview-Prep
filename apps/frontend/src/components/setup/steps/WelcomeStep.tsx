'use client';

import { Shield, Lock, Server } from 'lucide-react';
import { StepProps } from '../types';

export function WelcomeStep({ onNext, onSkip }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold text-card-foreground mb-2">
          Welcome to AI Interview Prep
        </h3>
        <p className="text-muted-foreground">
          Let&apos;s configure your local environment to unlock all features
        </p>
      </div>

      <div className="grid gap-4">
        <div className="flex items-start space-x-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <Lock className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-card-foreground">
              Privacy First
            </h4>
            <p className="text-sm text-muted-foreground">
              All configuration stays on your local machine. No data is sent to our servers.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-4 bg-accent/50 rounded-lg border border-border">
          <Server className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div>
            <h4 className="font-medium text-card-foreground">
              Secure Cookie Storage
            </h4>
            <p className="text-sm text-muted-foreground">
              Configuration is encrypted and stored in secure cookies on your device. No file management needed.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-card-foreground">
          What you&apos;ll need:
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
            <span>Your login information (email and password)</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
            <span>Choose your AI provider (OpenAI, Claude, or Gemini)</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
            <span>Select the best model for your needs</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
            <span>API key from your chosen provider</span>
          </li>
        </ul>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onSkip}
          className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip for now
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Let&apos;s Start
        </button>
      </div>
    </div>
  );
}
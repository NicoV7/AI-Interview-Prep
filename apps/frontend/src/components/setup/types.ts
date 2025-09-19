export interface StepProps {
  envValues: Record<string, string>;
  updateEnvValue: (key: string, value: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  isValid: boolean;
  errors: string[];
}

export interface StepWithCompletionProps extends StepProps {
  onComplete: () => void;
}
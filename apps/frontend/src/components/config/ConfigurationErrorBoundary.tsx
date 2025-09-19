'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Settings } from 'lucide-react';

interface Props {
  children: ReactNode;
  onReset?: () => void;
  onSetup?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ConfigurationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Configuration Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-xl font-semibold text-card-foreground mb-2">
              Configuration Error
            </h1>
            
            <p className="text-muted-foreground mb-4">
              There was an error with your AI provider configuration. This might be due to:
            </p>
            
            <ul className="text-sm text-muted-foreground text-left mb-6 space-y-1">
              <li>• Corrupted cookie data</li>
              <li>• Expired configuration</li>
              <li>• Invalid API key</li>
              <li>• Network connectivity issues</li>
            </ul>
            
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              
              {this.props.onSetup && (
                <button
                  onClick={this.props.onSetup}
                  className="w-full px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors flex items-center justify-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Reconfigure</span>
                </button>
              )}
            </div>
            
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-sm font-medium text-muted-foreground cursor-pointer">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs bg-muted p-3 rounded text-muted-foreground overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component wrapper for easier use
interface ConfigurationErrorHandlerProps {
  children: ReactNode;
  error?: string | null;
  onReset?: () => void;
  onSetup?: () => void;
}

export function ConfigurationErrorHandler({ 
  children, 
  error, 
  onReset, 
  onSetup 
}: ConfigurationErrorHandlerProps) {
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-red-900 dark:text-red-100">
              Configuration Error
            </h4>
            <p className="text-sm text-red-800 dark:text-red-200 mt-1">
              {error}
            </p>
            <div className="flex space-x-2 mt-3">
              {onReset && (
                <button
                  onClick={onReset}
                  className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Reset
                </button>
              )}
              {onSetup && (
                <button
                  onClick={onSetup}
                  className="text-xs px-3 py-1 border border-red-300 text-red-700 dark:text-red-300 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                >
                  Reconfigure
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          {/* Header skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>

          {/* Stats cards skeleton */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg" />
                    <div className="h-4 bg-muted rounded w-20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-8 bg-muted rounded w-16" />
                  <div className="h-3 bg-muted rounded w-24" />
                </div>
              </div>
            ))}
          </div>

          {/* Charts skeleton */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="h-6 bg-muted rounded w-32 mb-4" />
              <div className="h-64 bg-muted rounded" />
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="h-6 bg-muted rounded w-32 mb-4" />
              <div className="h-64 bg-muted rounded" />
            </div>
          </div>

          {/* Large chart skeleton */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="h-6 bg-muted rounded w-40 mb-4" />
            <div className="h-80 bg-muted rounded" />
          </div>

          {/* Main content grid skeleton */}
          <div className="grid gap-8 grid-cols-1 xl:grid-cols-3">
            {/* Topics grid skeleton */}
            <div className="xl:col-span-2 space-y-6">
              <div className="h-6 bg-muted rounded w-32 mb-4" />
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-card border border-border rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="h-5 bg-muted rounded w-24" />
                        <div className="w-4 h-4 bg-muted rounded" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-muted rounded w-20" />
                          <div className="h-2 bg-muted rounded" />
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-muted rounded w-8" />
                        <div className="h-3 bg-muted rounded w-8" />
                        <div className="h-3 bg-muted rounded w-8" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar skeleton */}
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-6">
                  <div className="h-6 bg-muted rounded w-32 mb-4" />
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="p-3 bg-muted/50 rounded-lg">
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-full" />
                          <div className="h-3 bg-muted rounded w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProgressSkeletonProps {
  rows?: number;
  showChart?: boolean;
}

export function ProgressSkeleton({ rows = 3, showChart = false }: ProgressSkeletonProps) {
  return (
    <div className="space-y-4">
      {showChart && (
        <div className="h-64 bg-muted rounded-lg animate-pulse" />
      )}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-muted rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
            <div className="w-16 h-8 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-card-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground mb-4">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

interface ErrorBoundaryProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorBoundary({ error, onRetry, className = '' }: ErrorBoundaryProps) {
  return (
    <div className={`bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            Something went wrong
          </h3>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
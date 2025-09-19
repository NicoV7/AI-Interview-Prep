'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { CircularProgress } from './CircularProgress';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  progress?: {
    current: number;
    total: number;
    showCircular?: boolean;
  };
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    accent: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: 'text-emerald-600 dark:text-emerald-400',
    accent: 'text-emerald-600 dark:text-emerald-400'
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-600 dark:text-amber-400',
    accent: 'text-amber-600 dark:text-amber-400'
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400',
    accent: 'text-red-600 dark:text-red-400'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'text-purple-600 dark:text-purple-400',
    accent: 'text-purple-600 dark:text-purple-400'
  }
};

const sizeVariants = {
  sm: {
    padding: 'p-4',
    iconSize: 'w-5 h-5',
    titleSize: 'text-sm',
    valueSize: 'text-lg',
    subtitleSize: 'text-xs'
  },
  md: {
    padding: 'p-6',
    iconSize: 'w-6 h-6',
    titleSize: 'text-base',
    valueSize: 'text-2xl',
    subtitleSize: 'text-sm'
  },
  lg: {
    padding: 'p-8',
    iconSize: 'w-8 h-8',
    titleSize: 'text-lg',
    valueSize: 'text-3xl',
    subtitleSize: 'text-base'
  }
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  progress,
  color = 'blue',
  size = 'md',
  className = ''
}: StatsCardProps) {
  const colorClasses = colorVariants[color];
  const sizeClasses = sizeVariants[size];

  const progressPercentage = progress
    ? Math.min((progress.current / progress.total) * 100, 100)
    : 0;

  return (
    <div
      className={`
        bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow
        ${sizeClasses.padding} ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            {Icon && (
              <div className={`${colorClasses.bg} ${colorClasses.border} border rounded-lg p-2`}>
                <Icon className={`${sizeClasses.iconSize} ${colorClasses.icon}`} />
              </div>
            )}
            <h3 className={`${sizeClasses.titleSize} font-medium text-muted-foreground`}>
              {title}
            </h3>
          </div>

          {/* Main Value */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className={`${sizeClasses.valueSize} font-bold text-card-foreground`}>
              {value}
            </span>
            {trend && (
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}% {trend.period}
              </span>
            )}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className={`${sizeClasses.subtitleSize} text-muted-foreground`}>
              {subtitle}
            </p>
          )}

          {/* Progress Bar */}
          {progress && !progress.showCircular && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">Progress</span>
                <span className="text-xs font-medium text-card-foreground">
                  {progress.current}/{progress.total}
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${colorClasses.accent} bg-current transition-all duration-300 ease-in-out rounded-full`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Circular Progress */}
        {progress && progress.showCircular && (
          <CircularProgress
            value={progressPercentage}
            size={size === 'sm' ? 60 : size === 'md' ? 80 : 100}
            strokeWidth={size === 'sm' ? 4 : 6}
            showText={false}
            color={colorClasses.accent.includes('blue') ? '#3b82f6' :
                   colorClasses.accent.includes('emerald') ? '#10b981' :
                   colorClasses.accent.includes('amber') ? '#f59e0b' :
                   colorClasses.accent.includes('red') ? '#ef4444' : '#8b5cf6'}
          />
        )}
      </div>
    </div>
  );
}

interface MetricGridProps {
  metrics: Array<Omit<StatsCardProps, 'className'>>;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function MetricGrid({ metrics, columns = 4, className = '' }: MetricGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid gap-6 ${gridCols[columns]} ${className}`}>
      {metrics.map((metric, index) => (
        <StatsCard key={index} {...metric} />
      ))}
    </div>
  );
}
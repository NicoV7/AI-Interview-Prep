'use client';

import React from 'react';
import { Progress } from '@radix-ui/react-progress';

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  text?: string;
  color?: string;
  backgroundColor?: string;
  className?: string;
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  showText = true,
  text,
  color = '#3b82f6',
  backgroundColor = '#e5e7eb',
  className = ''
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const getColorByValue = (val: number) => {
    if (val >= 80) return '#10b981'; // emerald-500 - excellent
    if (val >= 60) return '#3b82f6'; // blue-500 - good
    if (val >= 40) return '#f59e0b'; // amber-500 - okay
    return '#ef4444'; // red-500 - needs work
  };

  const progressColor = color === '#3b82f6' ? getColorByValue(value) : color;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
          className="opacity-20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300 ease-in-out"
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-card-foreground">
            {Math.round(value)}%
          </span>
          {text && (
            <span className="text-xs text-muted-foreground text-center px-2">
              {text}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface LinearProgressProps {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  showText?: boolean;
  className?: string;
}

export function LinearProgress({
  value,
  max = 100,
  size = 'md',
  color,
  showText = true,
  className = ''
}: LinearProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const getColorByValue = (val: number) => {
    if (val >= 80) return 'bg-emerald-500';
    if (val >= 60) return 'bg-blue-500';
    if (val >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const progressColor = color || getColorByValue(percentage);

  return (
    <div className={`w-full space-y-2 ${className}`}>
      {showText && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Progress
          </span>
          <span className="text-sm font-medium text-card-foreground">
            {value}/{max} ({Math.round(percentage)}%)
          </span>
        </div>
      )}
      <div className={`w-full ${sizeClasses[size]} bg-muted rounded-full overflow-hidden`}>
        <div
          className={`h-full ${progressColor} transition-all duration-300 ease-in-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface SkillLevelIndicatorProps {
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  progress: number;
  className?: string;
}

export function SkillLevelIndicator({
  level,
  progress,
  className = ''
}: SkillLevelIndicatorProps) {
  const levelConfig = {
    beginner: {
      color: '#ef4444',
      label: 'Beginner',
      emoji: '🌱'
    },
    intermediate: {
      color: '#f59e0b',
      label: 'Intermediate',
      emoji: '🌿'
    },
    advanced: {
      color: '#3b82f6',
      label: 'Advanced',
      emoji: '🌳'
    },
    expert: {
      color: '#10b981',
      label: 'Expert',
      emoji: '🏆'
    }
  };

  const config = levelConfig[level];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <CircularProgress
        value={progress}
        size={60}
        strokeWidth={6}
        color={config.color}
        showText={false}
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.emoji}</span>
          <span className="font-medium text-card-foreground">{config.label}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {Math.round(progress)}% complete
        </span>
      </div>
    </div>
  );
}
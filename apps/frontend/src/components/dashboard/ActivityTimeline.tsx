'use client';

import React from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Trophy, Target } from 'lucide-react';
import { RecentActivity, UserSubmission } from '@/types/progress';

interface ActivityTimelineProps {
  activities: RecentActivity[];
  maxItems?: number;
  showDetails?: boolean;
  className?: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  }
}

function getSubmissionIcon(status: UserSubmission['status']) {
  switch (status) {
    case 'Accepted':
      return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    case 'Wrong Answer':
    case 'Time Limit Exceeded':
    case 'Memory Limit Exceeded':
    case 'Runtime Error':
    case 'Compile Error':
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-amber-500" />;
  }
}

interface ActivityItemProps {
  activity: RecentActivity;
  showDetails: boolean;
}

function ActivityItem({ activity, showDetails }: ActivityItemProps) {
  const hasSubmissions = activity.submissions.length > 0;
  const acceptedCount = activity.submissions.filter(s => s.status === 'Accepted').length;
  const totalSubmissions = activity.submissions.length;

  return (
    <div className="relative">
      {/* Timeline dot */}
      <div className="absolute left-0 top-2 w-3 h-3 bg-primary rounded-full border-2 border-background shadow-sm" />

      {/* Content */}
      <div className="ml-6 pb-6">
        <div className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-card-foreground">
                {formatDate(activity.date)}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                <span>{activity.problemsSolved} solved</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{Math.round(activity.timeSpent / 60)}h {activity.timeSpent % 60}m</span>
              </div>
            </div>
          </div>

          {/* Topics practiced */}
          {activity.topics.length > 0 && (
            <div className="mb-3">
              <span className="text-sm text-muted-foreground">Topics: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {activity.topics.map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {activity.achievements && activity.achievements.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {activity.achievements.map((achievement, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-md dark:bg-amber-900 dark:text-amber-200"
                  >
                    🏆 {achievement}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Submissions summary */}
          {hasSubmissions && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-card-foreground">
                  Submissions ({totalSubmissions})
                </span>
                <span className="text-sm text-muted-foreground">
                  {acceptedCount}/{totalSubmissions} accepted
                </span>
              </div>

              {showDetails && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {activity.submissions.map((submission) => (
                    <div
                      key={submission.submissionId}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                    >
                      <div className="flex items-center gap-2">
                        {getSubmissionIcon(submission.status)}
                        <span className="font-mono text-xs">
                          Problem {submission.problemId}
                        </span>
                        <span className="text-muted-foreground">
                          in {submission.language}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{submission.runtime}ms</span>
                        <span>{submission.memory.toFixed(1)}MB</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ActivityTimeline({
  activities,
  maxItems = 10,
  showDetails = true,
  className = ''
}: ActivityTimelineProps) {
  const displayActivities = activities.slice(0, maxItems);

  if (activities.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-card-foreground mb-2">
          No Recent Activity
        </h3>
        <p className="text-muted-foreground">
          Start solving problems to see your activity here.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground">
          Recent Activity
        </h3>
        <span className="text-sm text-muted-foreground">
          Last {displayActivities.length} days
        </span>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-border" />

        {/* Activities */}
        <div className="space-y-0">
          {displayActivities.map((activity) => (
            <ActivityItem
              key={activity.date}
              activity={activity}
              showDetails={showDetails}
            />
          ))}
        </div>
      </div>

      {activities.length > maxItems && (
        <div className="text-center pt-4">
          <button className="text-sm text-primary hover:text-primary/80 transition-colors">
            View More Activity
          </button>
        </div>
      )}
    </div>
  );
}

interface StreakCalendarProps {
  streakDates: string[];
  className?: string;
}

export function StreakCalendar({ streakDates, className = '' }: StreakCalendarProps) {
  const today = new Date();
  const daysToShow = 30;
  const days: Array<{ date: Date; hasSolved: boolean; isToday: boolean }> = [];

  // Generate last 30 days
  for (let i = daysToShow - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    days.push({
      date,
      hasSolved: streakDates.includes(dateString),
      isToday: i === 0
    });
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-sm font-medium text-card-foreground">
        30 Day Streak Calendar
      </h4>

      <div className="grid grid-cols-10 gap-1">
        {days.map((day, index) => (
          <div
            key={index}
            className={`
              w-6 h-6 rounded-sm border text-xs flex items-center justify-center
              ${day.hasSolved
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'bg-muted border-border text-muted-foreground'
              }
              ${day.isToday ? 'ring-2 ring-primary ring-offset-1' : ''}
            `}
            title={day.date.toLocaleDateString()}
          >
            {day.date.getDate()}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-muted border border-border rounded-sm" />
          <div className="w-3 h-3 bg-emerald-200 border border-emerald-200 rounded-sm" />
          <div className="w-3 h-3 bg-emerald-400 border border-emerald-400 rounded-sm" />
          <div className="w-3 h-3 bg-emerald-500 border border-emerald-500 rounded-sm" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import {
  Target,
  Trophy,
  Calendar,
  TrendingUp,
  BookOpen,
  Clock,
  Star,
  Activity,
  Users,
  Zap
} from 'lucide-react';
import { ProgressResponse, ChartDataPoint } from '@/types/progress';
import { progressApi } from '@/lib/progressApi';
import { loadConfigFromCookie } from '@/lib/cookieConfig';
import { StatsCard, MetricGrid } from '@/components/dashboard/StatsCard';
import { ProgressChart } from '@/components/dashboard/ProgressChart';
import { TopicGrid } from '@/components/dashboard/TopicGrid';
import { ActivityTimeline, StreakCalendar } from '@/components/dashboard/ActivityTimeline';

export default function DashboardPage() {
  const [progressData, setProgressData] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProgressData() {
      try {
        setLoading(true);
        setError(null);

        // Get user email from cookie config
        const config = loadConfigFromCookie();
        if (!config?.email) {
          throw new Error('User not authenticated. Please complete setup first.');
        }

        const data = await progressApi.getUserProgress(config.email);
        setProgressData(data);
      } catch (err) {
        console.error('Failed to fetch progress data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchProgressData();
  }, []);

  if (loading) {
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
                <div key={i} className="h-32 bg-muted rounded-lg" />
              ))}
            </div>

            {/* Charts skeleton */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <div className="h-80 bg-muted rounded-lg" />
              <div className="h-80 bg-muted rounded-lg" />
            </div>

            {/* Topics skeleton */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
            <Activity className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-card-foreground">
            Unable to Load Dashboard
          </h2>
          <p className="text-muted-foreground max-w-md">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!progressData) {
    return null;
  }

  const { overallStats, topicProgress, recentActivity, streakInfo, weakestTopics, nextRecommendations } = progressData;

  // Prepare chart data
  const difficultyChartData: ChartDataPoint[] = [
    {
      name: 'Easy',
      value: overallStats.difficultyStats.easy.solved,
      color: '#10b981',
      percentage: overallStats.difficultyStats.easy.percentage
    },
    {
      name: 'Medium',
      value: overallStats.difficultyStats.medium.solved,
      color: '#f59e0b',
      percentage: overallStats.difficultyStats.medium.percentage
    },
    {
      name: 'Hard',
      value: overallStats.difficultyStats.hard.solved,
      color: '#ef4444',
      percentage: overallStats.difficultyStats.hard.percentage
    }
  ];

  const topTopicsData: ChartDataPoint[] = topicProgress
    .slice(0, 8)
    .map(topic => ({
      name: topic.topicName,
      value: topic.solvedProblems,
      percentage: topic.progressPercentage
    }));

  const activityData: ChartDataPoint[] = recentActivity
    .slice(0, 7)
    .reverse()
    .map(activity => ({
      name: new Date(activity.date).toLocaleDateString('en-US', { weekday: 'short' }),
      value: activity.problemsSolved
    }));

  const statsMetrics = [
    {
      title: 'Problems Solved',
      value: overallStats.totalSolved.toLocaleString(),
      subtitle: `${Math.round(overallStats.progressPercentage * 100)}% of ${overallStats.totalProblems.toLocaleString()}`,
      icon: Target,
      color: 'blue' as const,
      progress: {
        current: overallStats.totalSolved,
        total: overallStats.totalProblems,
        showCircular: true
      }
    },
    {
      title: 'Current Streak',
      value: streakInfo.currentStreak,
      subtitle: `Max streak: ${streakInfo.maxStreak} days`,
      icon: Zap,
      color: 'green' as const,
      trend: {
        value: streakInfo.currentStreak > 5 ? 12 : -5,
        isPositive: streakInfo.currentStreak > 5,
        period: 'this week'
      }
    },
    {
      title: 'Contest Rating',
      value: overallStats.contestRating.toLocaleString(),
      subtitle: `Rank #${overallStats.ranking.toLocaleString()}`,
      icon: Trophy,
      color: 'amber' as const,
      trend: {
        value: 8,
        isPositive: true,
        period: 'this month'
      }
    },
    {
      title: 'Study Time',
      value: `${Math.round(overallStats.avgSolveTime)}m`,
      subtitle: 'Average solve time',
      icon: Clock,
      color: 'purple' as const,
      trend: {
        value: 15,
        isPositive: false,
        period: 'improvement'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-card-foreground">
            Progress Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your coding journey and improve your interview skills
          </p>
        </div>

        {/* Key Metrics */}
        <MetricGrid metrics={statsMetrics} columns={4} />

        {/* Charts Section */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <div className="bg-card border border-border rounded-lg p-6">
            <ProgressChart
              type="pie"
              data={difficultyChartData}
              title="Problems by Difficulty"
              height={300}
            />
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <ProgressChart
              type="area"
              data={activityData}
              title="7-Day Activity"
              height={300}
            />
          </div>
        </div>

        {/* Progress by Topic Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <ProgressChart
            type="bar"
            data={topTopicsData}
            title="Top 8 Topics Progress"
            height={400}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 grid-cols-1 xl:grid-cols-3">
          {/* Topics Grid - Takes 2 columns */}
          <div className="xl:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-card-foreground mb-4">
                Topics Progress
              </h2>
              <TopicGrid
                topics={topicProgress}
                onTopicClick={(topic) => {
                  console.log('Topic clicked:', topic.topicName);
                  // TODO: Navigate to topic detail page
                }}
                variant="default"
                columns={2}
                sortBy="progress"
              />
            </div>
          </div>

          {/* Sidebar - Takes 1 column */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-card border border-border rounded-lg p-6">
              <ActivityTimeline
                activities={recentActivity}
                maxItems={5}
                showDetails={false}
              />
            </div>

            {/* Streak Calendar */}
            <div className="bg-card border border-border rounded-lg p-6">
              <StreakCalendar streakDates={streakInfo.streakDates} />
            </div>

            {/* Weakest Topics */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                Areas to Improve
              </h3>
              <div className="space-y-3">
                {weakestTopics.slice(0, 3).map((topic) => (
                  <div
                    key={topic.topicName}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-card-foreground">
                        {topic.topicName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round(topic.progressPercentage * 100)}% progress
                      </div>
                    </div>
                    <button className="text-primary hover:text-primary/80 text-sm font-medium">
                      Practice
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                Recommended Problems
              </h3>
              <div className="space-y-3">
                {nextRecommendations.slice(0, 3).map((rec, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-card-foreground text-sm">
                          {rec.problem.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {rec.reason}
                        </div>
                        <div className="flex gap-1 mt-2">
                          {rec.topics.slice(0, 2).map((topic) => (
                            <span
                              key={topic}
                              className="px-2 py-1 text-xs bg-primary/10 text-primary rounded"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          rec.problem.difficulty === 'Easy'
                            ? 'bg-emerald-100 text-emerald-700'
                            : rec.problem.difficulty === 'Medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {rec.problem.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
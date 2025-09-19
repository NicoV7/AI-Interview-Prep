'use client';

import React from 'react';
import { ChevronRight, Clock, Trophy, Target } from 'lucide-react';
import { TopicProgress } from '@/types/progress';
import { CircularProgress, SkillLevelIndicator } from './CircularProgress';

interface TopicCardProps {
  topic: TopicProgress;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'detailed';
}

function getSkillLevel(percentage: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  if (percentage >= 90) return 'expert';
  if (percentage >= 70) return 'advanced';
  if (percentage >= 40) return 'intermediate';
  return 'beginner';
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return 'Yesterday';

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
  return `${Math.floor(diffInDays / 30)}mo ago`;
}

export function TopicCard({ topic, onClick, variant = 'default' }: TopicCardProps) {
  const percentage = Math.round(topic.progressPercentage * 100);
  const skillLevel = getSkillLevel(percentage);
  const lastPracticed = formatTimeAgo(topic.lastPracticed);

  if (variant === 'compact') {
    return (
      <div
        className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group"
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CircularProgress
              value={percentage}
              size={40}
              strokeWidth={4}
              showText={false}
            />
            <div>
              <h3 className="font-medium text-card-foreground group-hover:text-primary transition-colors">
                {topic.topicName}
              </h3>
              <p className="text-xs text-muted-foreground">
                {topic.solvedProblems}/{topic.totalProblems} solved
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div
        className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer group"
        onClick={onClick}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                {topic.topicName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {topic.solvedProblems} of {topic.totalProblems} problems solved
              </p>
            </div>
            <CircularProgress
              value={percentage}
              size={80}
              strokeWidth={6}
              text="Complete"
            />
          </div>

          {/* Skill Level */}
          <SkillLevelIndicator level={skillLevel} progress={percentage} />

          {/* Difficulty Breakdown */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm font-medium text-emerald-600">Easy</div>
              <div className="text-xs text-muted-foreground">
                {topic.easyCount.solved}/{topic.easyCount.total}
              </div>
              <div className="w-full h-1 bg-muted rounded mt-1">
                <div
                  className="h-full bg-emerald-500 rounded"
                  style={{
                    width: `${topic.easyCount.total > 0 ? (topic.easyCount.solved / topic.easyCount.total) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-amber-600">Medium</div>
              <div className="text-xs text-muted-foreground">
                {topic.mediumCount.solved}/{topic.mediumCount.total}
              </div>
              <div className="w-full h-1 bg-muted rounded mt-1">
                <div
                  className="h-full bg-amber-500 rounded"
                  style={{
                    width: `${topic.mediumCount.total > 0 ? (topic.mediumCount.solved / topic.mediumCount.total) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-red-600">Hard</div>
              <div className="text-xs text-muted-foreground">
                {topic.hardCount.solved}/{topic.hardCount.total}
              </div>
              <div className="w-full h-1 bg-muted rounded mt-1">
                <div
                  className="h-full bg-red-500 rounded"
                  style={{
                    width: `${topic.hardCount.total > 0 ? (topic.hardCount.solved / topic.hardCount.total) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Last: {lastPracticed}</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span>{Math.round(topic.averageAcceptanceRate * 100)}% avg rate</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              <span>{Math.round(topic.timeSpent / 60)}h spent</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-card-foreground group-hover:text-primary transition-colors">
            {topic.topicName}
          </h3>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <CircularProgress
            value={percentage}
            size={60}
            strokeWidth={5}
            showText={false}
          />
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-card-foreground">
                {percentage}% Complete
              </span>
              <span className="text-xs text-muted-foreground">
                {topic.solvedProblems}/{topic.totalProblems}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Difficulty breakdown */}
        <div className="flex justify-between text-xs">
          <span className="text-emerald-600">
            E: {topic.easyCount.solved}/{topic.easyCount.total}
          </span>
          <span className="text-amber-600">
            M: {topic.mediumCount.solved}/{topic.mediumCount.total}
          </span>
          <span className="text-red-600">
            H: {topic.hardCount.solved}/{topic.hardCount.total}
          </span>
        </div>

        {/* Last practiced */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Last practiced: {lastPracticed}</span>
          <span className="capitalize">{skillLevel}</span>
        </div>
      </div>
    </div>
  );
}

interface TopicGridProps {
  topics: TopicProgress[];
  onTopicClick?: (topic: TopicProgress) => void;
  variant?: 'default' | 'compact' | 'detailed';
  columns?: 2 | 3 | 4;
  sortBy?: 'name' | 'progress' | 'lastPracticed' | 'problemCount';
  filterBy?: 'all' | 'inProgress' | 'completed' | 'notStarted';
  showSearch?: boolean;
  className?: string;
}

export function TopicGrid({
  topics,
  onTopicClick,
  variant = 'default',
  columns = 3,
  sortBy = 'progress',
  filterBy = 'all',
  showSearch = true,
  className = ''
}: TopicGridProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [localSortBy, setLocalSortBy] = React.useState(sortBy);
  const [localFilterBy, setLocalFilterBy] = React.useState(filterBy);

  // Filter topics
  const filteredTopics = React.useMemo(() => {
    let filtered = topics.filter(topic =>
      topic.topicName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply filter
    switch (localFilterBy) {
      case 'completed':
        filtered = filtered.filter(topic => topic.progressPercentage >= 0.9);
        break;
      case 'inProgress':
        filtered = filtered.filter(topic => topic.progressPercentage > 0 && topic.progressPercentage < 0.9);
        break;
      case 'notStarted':
        filtered = filtered.filter(topic => topic.progressPercentage === 0);
        break;
    }

    // Apply sorting
    switch (localSortBy) {
      case 'name':
        filtered.sort((a, b) => a.topicName.localeCompare(b.topicName));
        break;
      case 'progress':
        filtered.sort((a, b) => b.progressPercentage - a.progressPercentage);
        break;
      case 'lastPracticed':
        filtered.sort((a, b) => new Date(b.lastPracticed).getTime() - new Date(a.lastPracticed).getTime());
        break;
      case 'problemCount':
        filtered.sort((a, b) => b.totalProblems - a.totalProblems);
        break;
    }

    return filtered;
  }, [topics, searchTerm, localSortBy, localFilterBy]);

  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      {showSearch && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={localFilterBy}
              onChange={(e) => setLocalFilterBy(e.target.value as any)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Topics</option>
              <option value="completed">Completed</option>
              <option value="inProgress">In Progress</option>
              <option value="notStarted">Not Started</option>
            </select>
            <select
              value={localSortBy}
              onChange={(e) => setLocalSortBy(e.target.value as any)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="progress">Sort by Progress</option>
              <option value="name">Sort by Name</option>
              <option value="lastPracticed">Sort by Last Practiced</option>
              <option value="problemCount">Sort by Problem Count</option>
            </select>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className={`grid gap-4 ${gridCols[columns]}`}>
        {filteredTopics.map((topic) => (
          <TopicCard
            key={topic.topicName}
            topic={topic}
            variant={variant}
            onClick={() => onTopicClick?.(topic)}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredTopics.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchTerm ? `No topics found matching "${searchTerm}"` : 'No topics available'}
          </div>
        </div>
      )}
    </div>
  );
}
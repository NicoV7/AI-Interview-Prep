import {
  LeetCodeProblem,
  UserSubmission,
  TopicProgress,
  CompanyProgress,
  OverallStats,
  RecentActivity,
  WeakestTopic,
  ProblemRecommendation,
  ProgressResponse,
  IProgressService,
  ProblemFilters,
  StreakInfo,
  DifficultyStats
} from '../types/leetcode';

export class MockLeetCodeService implements IProgressService {
  private problems: LeetCodeProblem[] = [];
  private userSubmissions: Map<string, UserSubmission[]> = new Map();
  private readonly topics = [
    'Array', 'Two Pointers', 'String', 'Linked List',
    'Stack', 'Queue', 'Binary Tree', 'Binary Search Tree',
    'Hash Table', 'Heap', 'Graph', 'Dynamic Programming',
    'Backtracking', 'Greedy', 'Trie', 'Union Find',
    'Binary Search', 'Sliding Window', 'Recursion', 'Sort'
  ];

  private readonly companies = [
    'Google', 'Amazon', 'Microsoft', 'Apple', 'Facebook',
    'Netflix', 'Uber', 'Airbnb', 'LinkedIn', 'Twitter',
    'Tesla', 'Spotify', 'Dropbox', 'Salesforce', 'Adobe'
  ];

  private readonly languages = [
    'Python', 'JavaScript', 'Java', 'C++', 'C',
    'Go', 'Rust', 'TypeScript', 'Swift', 'Kotlin'
  ];

  constructor() {
    this.generateMockProblems();
  }

  private generateMockProblems(): void {
    const problemTemplates = [
      // Array problems
      { title: 'Two Sum', difficulty: 'Easy' as const, topics: ['Array', 'Hash Table'], acRate: 0.52 },
      { title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy' as const, topics: ['Array', 'Dynamic Programming'], acRate: 0.54 },
      { title: 'Maximum Subarray', difficulty: 'Medium' as const, topics: ['Array', 'Dynamic Programming'], acRate: 0.50 },
      { title: 'Product of Array Except Self', difficulty: 'Medium' as const, topics: ['Array'], acRate: 0.64 },
      { title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium' as const, topics: ['Array', 'Binary Search'], acRate: 0.46 },

      // String problems
      { title: 'Valid Anagram', difficulty: 'Easy' as const, topics: ['String', 'Hash Table'], acRate: 0.63 },
      { title: 'Group Anagrams', difficulty: 'Medium' as const, topics: ['String', 'Hash Table'], acRate: 0.67 },
      { title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium' as const, topics: ['String', 'Sliding Window'], acRate: 0.35 },
      { title: 'Valid Parentheses', difficulty: 'Easy' as const, topics: ['String', 'Stack'], acRate: 0.40 },

      // Linked List problems
      { title: 'Reverse Linked List', difficulty: 'Easy' as const, topics: ['Linked List'], acRate: 0.73 },
      { title: 'Merge Two Sorted Lists', difficulty: 'Easy' as const, topics: ['Linked List', 'Recursion'], acRate: 0.62 },
      { title: 'Remove Nth Node From End of List', difficulty: 'Medium' as const, topics: ['Linked List', 'Two Pointers'], acRate: 0.39 },
      { title: 'Linked List Cycle', difficulty: 'Easy' as const, topics: ['Linked List', 'Two Pointers'], acRate: 0.48 },

      // Tree problems
      { title: 'Maximum Depth of Binary Tree', difficulty: 'Easy' as const, topics: ['Binary Tree', 'Recursion'], acRate: 0.74 },
      { title: 'Same Tree', difficulty: 'Easy' as const, topics: ['Binary Tree', 'Recursion'], acRate: 0.57 },
      { title: 'Invert Binary Tree', difficulty: 'Easy' as const, topics: ['Binary Tree', 'Recursion'], acRate: 0.76 },
      { title: 'Binary Tree Level Order Traversal', difficulty: 'Medium' as const, topics: ['Binary Tree', 'Queue'], acRate: 0.64 },
      { title: 'Validate Binary Search Tree', difficulty: 'Medium' as const, topics: ['Binary Search Tree', 'Recursion'], acRate: 0.31 },

      // Dynamic Programming
      { title: 'Climbing Stairs', difficulty: 'Easy' as const, topics: ['Dynamic Programming'], acRate: 0.52 },
      { title: 'House Robber', difficulty: 'Medium' as const, topics: ['Dynamic Programming'], acRate: 0.48 },
      { title: 'Coin Change', difficulty: 'Medium' as const, topics: ['Dynamic Programming'], acRate: 0.41 },
      { title: 'Longest Increasing Subsequence', difficulty: 'Medium' as const, topics: ['Dynamic Programming', 'Binary Search'], acRate: 0.54 },
      { title: 'Edit Distance', difficulty: 'Hard' as const, topics: ['Dynamic Programming'], acRate: 0.53 },

      // Graph problems
      { title: 'Number of Islands', difficulty: 'Medium' as const, topics: ['Graph'], acRate: 0.57 },
      { title: 'Clone Graph', difficulty: 'Medium' as const, topics: ['Graph'], acRate: 0.51 },
      { title: 'Course Schedule', difficulty: 'Medium' as const, topics: ['Graph', 'Backtracking'], acRate: 0.45 },
      { title: 'Word Ladder', difficulty: 'Hard' as const, topics: ['Graph', 'String'], acRate: 0.37 },
    ];

    // Generate base problems from templates
    problemTemplates.forEach((template, index) => {
      this.problems.push({
        id: index + 1,
        title: template.title,
        slug: template.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        difficulty: template.difficulty,
        topics: template.topics,
        companies: this.getRandomCompanies(),
        isPaid: Math.random() < 0.3,
        acRate: template.acRate,
        leetcodeUrl: `https://leetcode.com/problems/${template.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}/`,
        hints: this.generateHints(),
        similar: []
      });
    });

    // Generate additional problems to reach 1000+
    for (let i = problemTemplates.length; i < 1200; i++) {
      this.problems.push(this.generateRandomProblem(i + 1));
    }

    // Add similar problems references
    this.linkSimilarProblems();
  }

  private generateRandomProblem(id: number): LeetCodeProblem {
    const difficulties: ('Easy' | 'Medium' | 'Hard')[] = ['Easy', 'Medium', 'Hard'];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const numTopics = Math.floor(Math.random() * 3) + 1;
    const selectedTopics = this.getRandomItems(this.topics, numTopics);

    const title = this.generateProblemTitle(selectedTopics[0], id);

    return {
      id,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      difficulty,
      topics: selectedTopics,
      companies: this.getRandomCompanies(),
      isPaid: Math.random() < 0.3,
      acRate: this.generateAcceptanceRate(difficulty),
      leetcodeUrl: `https://leetcode.com/problems/${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}/`,
      hints: this.generateHints(),
      similar: []
    };
  }

  private generateProblemTitle(mainTopic: string, id: number): string {
    const titlePatterns: Record<string, string[]> = {
      'Array': [
        'Rotate Array', 'Remove Duplicates', 'Merge Sorted Arrays', 'Search in Rotated Array',
        'Find Peak Element', 'Missing Number', 'Majority Element', 'Contains Duplicate'
      ],
      'String': [
        'Reverse String', 'First Unique Character', 'Valid Palindrome', 'String to Integer',
        'Implement strStr', 'Longest Common Prefix', 'Count and Say', 'Zigzag Conversion'
      ],
      'Dynamic Programming': [
        'Unique Paths', 'Minimum Path Sum', 'Triangle', 'Word Break', 'Decode Ways',
        'Perfect Squares', 'Partition Equal Subset Sum', 'Target Sum'
      ],
      'Graph': [
        'Find Path', 'Shortest Path', 'Minimum Spanning Tree', 'Detect Cycle',
        'Topological Sort', 'Connected Components', 'Graph Coloring', 'Network Flow'
      ]
    };

    const patterns = titlePatterns[mainTopic] || ['Problem', 'Challenge', 'Task', 'Question'];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    return `${pattern} ${id}`;
  }

  private generateAcceptanceRate(difficulty: 'Easy' | 'Medium' | 'Hard'): number {
    const baseRates = { Easy: 0.6, Medium: 0.45, Hard: 0.35 };
    const base = baseRates[difficulty];
    return Math.round((base + (Math.random() - 0.5) * 0.3) * 100) / 100;
  }

  private getRandomCompanies(): string[] {
    const count = Math.floor(Math.random() * 8) + 2;
    return this.getRandomItems(this.companies, count);
  }

  private getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  }

  private generateHints(): string[] {
    const hintTemplates = [
      'Try using a hash map to store intermediate results.',
      'Consider the two-pointer technique.',
      'Think about the edge cases.',
      'Can you solve this recursively?',
      'What if you sort the input first?',
      'Consider using dynamic programming.',
      'Try to find a pattern in the examples.',
      'Can you optimize the space complexity?'
    ];

    const count = Math.floor(Math.random() * 3) + 1;
    return this.getRandomItems(hintTemplates, count);
  }

  private linkSimilarProblems(): void {
    this.problems.forEach(problem => {
      const similar = this.problems
        .filter(p =>
          p.id !== problem.id &&
          p.topics.some(topic => problem.topics.includes(topic))
        )
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(p => p.id);

      problem.similar = similar;
    });
  }

  private generateUserSubmissions(userId: string, problemCount: number): UserSubmission[] {
    const submissions: UserSubmission[] = [];
    const solvedProblems = new Set<number>();

    // Generate submissions for solved problems
    for (let i = 0; i < problemCount; i++) {
      let problemId: number;
      do {
        problemId = Math.floor(Math.random() * this.problems.length) + 1;
      } while (solvedProblems.has(problemId));

      solvedProblems.add(problemId);

      // Generate 1-3 submissions per problem (including failed attempts)
      const numSubmissions = Math.floor(Math.random() * 3) + 1;
      const problem = this.problems.find(p => p.id === problemId);

      for (let j = 0; j < numSubmissions; j++) {
        const isLastSubmission = j === numSubmissions - 1;
        const submission: UserSubmission = {
          problemId,
          status: isLastSubmission ? 'Accepted' : this.getRandomFailureStatus(),
          runtime: this.generateRuntime(problem?.difficulty || 'Medium'),
          memory: this.generateMemory(),
          submissionTime: this.generateSubmissionTime(),
          language: this.getRandomItems(this.languages, 1)[0],
          submissionId: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          runtimePercentile: Math.random(),
          memoryPercentile: Math.random()
        };

        submissions.push(submission);
      }
    }

    // Sort by submission time
    submissions.sort((a, b) => new Date(b.submissionTime).getTime() - new Date(a.submissionTime).getTime());

    this.userSubmissions.set(userId, submissions);
    return submissions;
  }

  private getRandomFailureStatus(): UserSubmission['status'] {
    const statuses: UserSubmission['status'][] = [
      'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error'
    ];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private generateRuntime(difficulty: string): number {
    const baseRuntimes = { Easy: 50, Medium: 100, Hard: 200 };
    const base = baseRuntimes[difficulty as keyof typeof baseRuntimes] || 100;
    return Math.floor(base + Math.random() * base);
  }

  private generateMemory(): number {
    return Math.floor(Math.random() * 20) + 10; // 10-30 MB
  }

  private generateSubmissionTime(): string {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 90); // Last 90 days
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return date.toISOString();
  }

  async getUserProgress(userId: string): Promise<ProgressResponse> {
    // Generate user submissions if not exists
    if (!this.userSubmissions.has(userId)) {
      const solvedCount = Math.floor(Math.random() * 200) + 50; // 50-250 problems solved
      this.generateUserSubmissions(userId, solvedCount);
    }

    const submissions = this.userSubmissions.get(userId) || [];
    const solvedProblemIds = new Set(
      submissions.filter(s => s.status === 'Accepted').map(s => s.problemId)
    );

    const overallStats = this.calculateOverallStats(submissions, solvedProblemIds);
    const topicProgress = this.calculateTopicProgress(submissions, solvedProblemIds);
    const companyProgress = this.calculateCompanyProgress(submissions, solvedProblemIds);
    const recentActivity = this.calculateRecentActivity(submissions);
    const streakInfo = this.calculateStreakInfo(submissions);
    const weakestTopics = this.identifyWeakestTopics(topicProgress);
    const strongestTopics = this.identifyStrongestTopics(topicProgress);
    const recommendations = await this.getRecommendations(userId, 5);

    return {
      userId,
      lastUpdated: new Date().toISOString(),
      overallStats,
      topicProgress,
      companyProgress,
      recentActivity,
      weakestTopics,
      strongestTopics,
      nextRecommendations: recommendations,
      streakInfo,
      goals: {
        dailyTarget: 2,
        weeklyTarget: 10,
        targetTopics: ['Dynamic Programming', 'Graph'],
        targetCompanies: ['Google', 'Amazon']
      }
    };
  }

  private calculateOverallStats(submissions: UserSubmission[], solvedProblemIds: Set<number>): OverallStats {
    const totalSolved = solvedProblemIds.size;
    const totalProblems = this.problems.length;

    const difficultyStats = this.calculateDifficultyStats(solvedProblemIds);
    const acceptedSubmissions = submissions.filter(s => s.status === 'Accepted');
    const accuracy = submissions.length > 0 ? acceptedSubmissions.length / submissions.length : 0;
    const avgRuntime = acceptedSubmissions.length > 0
      ? acceptedSubmissions.reduce((sum, s) => sum + s.runtime, 0) / acceptedSubmissions.length
      : 0;

    return {
      totalSolved,
      totalProblems,
      progressPercentage: totalSolved / totalProblems,
      currentStreak: Math.floor(Math.random() * 15) + 1,
      maxStreak: Math.floor(Math.random() * 30) + 10,
      ranking: Math.floor(Math.random() * 100000) + 1000,
      contestRating: Math.floor(Math.random() * 1000) + 1200,
      difficultyStats,
      accuracyRate: accuracy,
      avgSolveTime: avgRuntime / 1000 / 60 // Convert to minutes
    };
  }

  private calculateDifficultyStats(solvedProblemIds: Set<number>): DifficultyStats {
    const solved = { easy: 0, medium: 0, hard: 0 };
    const total = { easy: 0, medium: 0, hard: 0 };

    this.problems.forEach(problem => {
      const difficulty = problem.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard';
      total[difficulty]++;
      if (solvedProblemIds.has(problem.id)) {
        solved[difficulty]++;
      }
    });

    return {
      easy: {
        solved: solved.easy,
        total: total.easy,
        percentage: total.easy > 0 ? solved.easy / total.easy : 0
      },
      medium: {
        solved: solved.medium,
        total: total.medium,
        percentage: total.medium > 0 ? solved.medium / total.medium : 0
      },
      hard: {
        solved: solved.hard,
        total: total.hard,
        percentage: total.hard > 0 ? solved.hard / total.hard : 0
      }
    };
  }

  private calculateTopicProgress(submissions: UserSubmission[], solvedProblemIds: Set<number>): TopicProgress[] {
    const topicStats = new Map<string, {
      total: number;
      solved: number;
      easy: { solved: number; total: number };
      medium: { solved: number; total: number };
      hard: { solved: number; total: number };
      recentSubmissions: UserSubmission[];
    }>();

    // Initialize topic stats
    this.topics.forEach(topic => {
      topicStats.set(topic, {
        total: 0,
        solved: 0,
        easy: { solved: 0, total: 0 },
        medium: { solved: 0, total: 0 },
        hard: { solved: 0, total: 0 },
        recentSubmissions: []
      });
    });

    // Count problems by topic
    this.problems.forEach(problem => {
      problem.topics.forEach(topic => {
        const stats = topicStats.get(topic);
        if (stats) {
          stats.total++;
          const difficulty = problem.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard';
          stats[difficulty].total++;

          if (solvedProblemIds.has(problem.id)) {
            stats.solved++;
            stats[difficulty].solved++;
          }
        }
      });
    });

    // Add recent submissions for each topic
    submissions.slice(0, 20).forEach(submission => {
      const problem = this.problems.find(p => p.id === submission.problemId);
      if (problem) {
        problem.topics.forEach(topic => {
          const stats = topicStats.get(topic);
          if (stats && stats.recentSubmissions.length < 5) {
            stats.recentSubmissions.push(submission);
          }
        });
      }
    });

    return Array.from(topicStats.entries()).map(([topicName, stats]) => ({
      topicName,
      totalProblems: stats.total,
      solvedProblems: stats.solved,
      easyCount: stats.easy,
      mediumCount: stats.medium,
      hardCount: stats.hard,
      progressPercentage: stats.total > 0 ? stats.solved / stats.total : 0,
      lastPracticed: stats.recentSubmissions[0]?.submissionTime || new Date().toISOString(),
      averageAcceptanceRate: this.calculateTopicAcceptanceRate(topicName),
      recentSubmissions: stats.recentSubmissions,
      averageAttempts: Math.random() * 2 + 1,
      timeSpent: Math.floor(Math.random() * 300) + 60
    }));
  }

  private calculateCompanyProgress(_submissions: UserSubmission[], solvedProblemIds: Set<number>): CompanyProgress[] {
    // Similar logic to topic progress but for companies
    const companyStats = new Map<string, any>();

    this.companies.forEach(company => {
      companyStats.set(company, {
        total: 0,
        solved: 0,
        easy: { solved: 0, total: 0 },
        medium: { solved: 0, total: 0 },
        hard: { solved: 0, total: 0 }
      });
    });

    this.problems.forEach(problem => {
      problem.companies.forEach(company => {
        const stats = companyStats.get(company);
        if (stats) {
          stats.total++;
          const difficulty = problem.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard';
          stats[difficulty].total++;

          if (solvedProblemIds.has(problem.id)) {
            stats.solved++;
            stats[difficulty].solved++;
          }
        }
      });
    });

    return Array.from(companyStats.entries())
      .filter(([, stats]) => stats.total > 0)
      .map(([companyName, stats]) => ({
        companyName,
        totalProblems: stats.total,
        solvedProblems: stats.solved,
        easyCount: stats.easy,
        mediumCount: stats.medium,
        hardCount: stats.hard,
        progressPercentage: stats.solved / stats.total,
        lastPracticed: new Date().toISOString(),
        frequency: this.getCompanyFrequency(companyName)
      }))
      .sort((a, b) => b.totalProblems - a.totalProblems)
      .slice(0, 10); // Top 10 companies
  }

  private calculateRecentActivity(submissions: UserSubmission[]): RecentActivity[] {
    const activities = new Map<string, RecentActivity>();

    submissions.slice(0, 30).forEach(submission => {
      const date = submission.submissionTime.split('T')[0];

      if (!activities.has(date)) {
        activities.set(date, {
          date,
          problemsSolved: 0,
          timeSpent: 0,
          topics: [],
          submissions: [],
          achievements: []
        });
      }

      const activity = activities.get(date)!;
      activity.submissions.push(submission);

      if (submission.status === 'Accepted') {
        activity.problemsSolved++;
      }

      activity.timeSpent += Math.floor(Math.random() * 45) + 15; // 15-60 minutes per submission

      const problem = this.problems.find(p => p.id === submission.problemId);
      if (problem) {
        problem.topics.forEach(topic => {
          if (!activity.topics.includes(topic)) {
            activity.topics.push(topic);
          }
        });
      }
    });

    return Array.from(activities.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 14); // Last 2 weeks
  }

  private calculateStreakInfo(submissions: UserSubmission[]): StreakInfo {
    const acceptedSubmissions = submissions
      .filter(s => s.status === 'Accepted')
      .sort((a, b) => new Date(b.submissionTime).getTime() - new Date(a.submissionTime).getTime());

    const uniqueDates = [...new Set(acceptedSubmissions.map(s => s.submissionTime.split('T')[0]))];

    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    for (let i = 0; i < uniqueDates.length; i++) {
      const date = new Date(uniqueDates[i]);
      const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

      if (i === 0 && daysDiff <= 1) {
        currentStreak = 1;
        tempStreak = 1;
      } else if (i > 0) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const diffBetweenDates = Math.floor((prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffBetweenDates === 1) {
          tempStreak++;
          if (i === 0 || (i === 1 && daysDiff <= 1)) {
            currentStreak = tempStreak;
          }
        } else {
          tempStreak = 1;
        }
      }

      maxStreak = Math.max(maxStreak, tempStreak);
    }

    return {
      currentStreak,
      maxStreak,
      streakDates: uniqueDates.slice(0, currentStreak),
      lastSolvedDate: acceptedSubmissions[0]?.submissionTime || new Date().toISOString()
    };
  }

  private identifyWeakestTopics(topicProgress: TopicProgress[]): WeakestTopic[] {
    return topicProgress
      .filter(tp => tp.totalProblems > 5) // Only topics with substantial problems
      .sort((a, b) => a.progressPercentage - b.progressPercentage)
      .slice(0, 3)
      .map(tp => ({
        topicName: tp.topicName,
        progressPercentage: tp.progressPercentage,
        problemsToImprove: this.problems
          .filter(p => p.topics.includes(tp.topicName) && p.difficulty === 'Easy')
          .slice(0, 5),
        suggestedOrder: this.problems
          .filter(p => p.topics.includes(tp.topicName))
          .sort((a, b) => a.acRate - b.acRate)
          .slice(0, 10)
          .map(p => p.id)
      }));
  }

  private identifyStrongestTopics(topicProgress: TopicProgress[]): string[] {
    return topicProgress
      .filter(tp => tp.totalProblems > 5)
      .sort((a, b) => b.progressPercentage - a.progressPercentage)
      .slice(0, 5)
      .map(tp => tp.topicName);
  }

  private calculateTopicAcceptanceRate(topic: string): number {
    const topicProblems = this.problems.filter(p => p.topics.includes(topic));
    if (topicProblems.length === 0) return 0;

    const totalRate = topicProblems.reduce((sum, p) => sum + p.acRate, 0);
    return totalRate / topicProblems.length;
  }

  private getCompanyFrequency(company: string): 'High' | 'Medium' | 'Low' {
    const highFreq = ['Google', 'Amazon', 'Microsoft', 'Apple', 'Facebook'];
    const mediumFreq = ['Netflix', 'Uber', 'Airbnb', 'LinkedIn'];

    if (highFreq.includes(company)) return 'High';
    if (mediumFreq.includes(company)) return 'Medium';
    return 'Low';
  }

  async updateUserProgress(userId: string, submission: UserSubmission): Promise<void> {
    const userSubmissions = this.userSubmissions.get(userId) || [];
    userSubmissions.unshift(submission);
    this.userSubmissions.set(userId, userSubmissions);
  }

  async getProblemsByTopic(topic: string, difficulty?: string): Promise<LeetCodeProblem[]> {
    return this.problems.filter(p =>
      p.topics.includes(topic) &&
      (!difficulty || p.difficulty === difficulty)
    );
  }

  async getProblemsByCompany(company: string, difficulty?: string): Promise<LeetCodeProblem[]> {
    return this.problems.filter(p =>
      p.companies.includes(company) &&
      (!difficulty || p.difficulty === difficulty)
    );
  }

  async getRecommendations(userId: string, count: number = 5): Promise<ProblemRecommendation[]> {
    const userSubmissions = this.userSubmissions.get(userId) || [];
    const solvedProblemIds = new Set(
      userSubmissions.filter(s => s.status === 'Accepted').map(s => s.problemId)
    );

    const unsolvedProblems = this.problems.filter(p => !solvedProblemIds.has(p.id));

    // Recommend based on user's weakest topics and current level
    const recommendations = unsolvedProblems
      .sort(() => 0.5 - Math.random()) // Random sorting for demo
      .slice(0, count)
      .map(problem => ({
        problem,
        reason: this.generateRecommendationReason(problem),
        priority: this.generatePriority(),
        estimatedDifficulty: Math.floor(Math.random() * 10) + 1,
        topics: problem.topics,
        expectedLearning: problem.topics.map(topic => `Improve ${topic} skills`)
      }));

    return recommendations;
  }

  private generateRecommendationReason(problem: LeetCodeProblem): string {
    const reasons = [
      `Strengthen your ${problem.topics[0]} skills`,
      `Popular at ${problem.companies[0]}`,
      `Good practice for ${problem.difficulty} level problems`,
      `High acceptance rate (${Math.round(problem.acRate * 100)}%)`,
      `Commonly asked in interviews`
    ];

    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  private generatePriority(): 'High' | 'Medium' | 'Low' {
    const priorities: ('High' | 'Medium' | 'Low')[] = ['High', 'Medium', 'Low'];
    return priorities[Math.floor(Math.random() * priorities.length)];
  }

  async searchProblems(query: string, filters?: ProblemFilters): Promise<LeetCodeProblem[]> {
    let results = this.problems.filter(p =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.topics.some(topic => topic.toLowerCase().includes(query.toLowerCase()))
    );

    if (filters) {
      if (filters.difficulty) {
        results = results.filter(p => filters.difficulty!.includes(p.difficulty));
      }
      if (filters.topics) {
        results = results.filter(p => p.topics.some(topic => filters.topics!.includes(topic)));
      }
      if (filters.companies) {
        results = results.filter(p => p.companies.some(company => filters.companies!.includes(company)));
      }
      if (filters.isPaid !== undefined) {
        results = results.filter(p => p.isPaid === filters.isPaid);
      }
      if (filters.minAcceptanceRate) {
        results = results.filter(p => p.acRate >= filters.minAcceptanceRate!);
      }
      if (filters.maxAcceptanceRate) {
        results = results.filter(p => p.acRate <= filters.maxAcceptanceRate!);
      }
    }

    return results.slice(0, 50); // Limit results
  }
}

// Singleton instance
export const progressService = new MockLeetCodeService();
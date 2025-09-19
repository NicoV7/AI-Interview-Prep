import { ProgressResponse, ApiResponse, UserSubmission, LeetCodeProblem, ProblemRecommendation } from '@/types/progress';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';

class ProgressApiService {
  private async fetchWithCredentials<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error for ${url}:`, error);
      throw error;
    }
  }

  /**
   * Get comprehensive progress data for a user
   */
  async getUserProgress(userId: string): Promise<ProgressResponse> {
    const response = await this.fetchWithCredentials<ProgressResponse>(
      `/api/v1/progress/${encodeURIComponent(userId)}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch progress data');
    }

    return response.data;
  }

  /**
   * Submit a new solution/attempt
   */
  async submitProblem(userId: string, submission: Omit<UserSubmission, 'submissionId'>): Promise<void> {
    const response = await this.fetchWithCredentials(
      `/api/v1/progress/${encodeURIComponent(userId)}/submissions`,
      {
        method: 'POST',
        body: JSON.stringify(submission),
      }
    );

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to submit problem');
    }
  }

  /**
   * Get problems by topic
   */
  async getProblemsByTopic(topic: string, difficulty?: string): Promise<LeetCodeProblem[]> {
    const params = new URLSearchParams();
    if (difficulty) params.append('difficulty', difficulty);

    const response = await this.fetchWithCredentials<LeetCodeProblem[]>(
      `/api/v1/progress/problems/topic/${encodeURIComponent(topic)}?${params.toString()}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch problems');
    }

    return response.data;
  }

  /**
   * Get problems by company
   */
  async getProblemsByCompany(company: string, difficulty?: string): Promise<LeetCodeProblem[]> {
    const params = new URLSearchParams();
    if (difficulty) params.append('difficulty', difficulty);

    const response = await this.fetchWithCredentials<LeetCodeProblem[]>(
      `/api/v1/progress/problems/company/${encodeURIComponent(company)}?${params.toString()}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch problems');
    }

    return response.data;
  }

  /**
   * Get personalized problem recommendations
   */
  async getRecommendations(userId: string, count?: number): Promise<ProblemRecommendation[]> {
    const params = new URLSearchParams();
    if (count) params.append('count', count.toString());

    const response = await this.fetchWithCredentials<ProblemRecommendation[]>(
      `/api/v1/progress/${encodeURIComponent(userId)}/recommendations?${params.toString()}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch recommendations');
    }

    return response.data;
  }

  /**
   * Search problems with filters
   */
  async searchProblems(
    query: string,
    filters?: {
      difficulty?: string[];
      topics?: string[];
      companies?: string[];
      isPaid?: boolean;
      minAcceptanceRate?: number;
      maxAcceptanceRate?: number;
    }
  ): Promise<LeetCodeProblem[]> {
    const params = new URLSearchParams();
    params.append('q', query);

    if (filters) {
      if (filters.difficulty) params.append('difficulty', filters.difficulty.join(','));
      if (filters.topics) params.append('topics', filters.topics.join(','));
      if (filters.companies) params.append('companies', filters.companies.join(','));
      if (filters.isPaid !== undefined) params.append('isPaid', filters.isPaid.toString());
      if (filters.minAcceptanceRate) params.append('minAcceptanceRate', filters.minAcceptanceRate.toString());
      if (filters.maxAcceptanceRate) params.append('maxAcceptanceRate', filters.maxAcceptanceRate.toString());
    }

    const response = await this.fetchWithCredentials<LeetCodeProblem[]>(
      `/api/v1/progress/problems/search?${params.toString()}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to search problems');
    }

    return response.data;
  }

  /**
   * Check API health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.fetchWithCredentials('/api/v1/progress/health');
      return response.success;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const progressApi = new ProgressApiService();

// Hook for React components
export const useProgressApi = () => progressApi;
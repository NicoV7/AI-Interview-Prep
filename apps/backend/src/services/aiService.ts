/**
 * AI Service Integration Layer
 *
 * Handles communication with multiple AI providers (OpenAI, Claude, Gemini)
 * for generating personalized study roadmaps
 */

import { AIProvider, AIResponse, StudyRoadmap, AIRoadmapPrompt } from '../types/roadmap';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface ClaudeResponse {
  content: Array<{
    text: string;
  }>;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class AIService {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // ms

  /**
   * Generate roadmap using configured AI provider
   */
  static async generateRoadmap(
    provider: AIProvider,
    prompt: AIRoadmapPrompt
  ): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      let response: AIResponse;

      switch (provider.name) {
        case 'openai':
          response = await this.callOpenAI(provider, prompt);
          break;
        case 'claude':
          response = await this.callClaude(provider, prompt);
          break;
        case 'gemini':
          response = await this.callGemini(provider, prompt);
          break;
        default:
          throw new Error(`Unsupported AI provider: ${provider.name}`);
      }

      // Add generation time
      if (response.success && response.data) {
        response.data.generatedAt = new Date().toISOString();
      }

      return response;
    } catch (error) {
      console.error(`AI service error with ${provider.name}:`, error);
      return {
        success: false,
        error: {
          code: 'AI_SERVICE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown AI service error',
          details: { provider: provider.name, duration: Date.now() - startTime }
        }
      };
    }
  }

  /**
   * OpenAI API integration
   */
  private static async callOpenAI(
    provider: AIProvider,
    prompt: AIRoadmapPrompt
  ): Promise<AIResponse> {
    const model = provider.model || 'gpt-4';

    const requestBody = {
      model,
      messages: [
        { role: 'system', content: prompt.systemPrompt },
        { role: 'user', content: prompt.userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data: OpenAIResponse = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    try {
      const roadmap: StudyRoadmap = JSON.parse(content);
      return {
        success: true,
        data: roadmap,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        } : undefined
      };
    } catch (parseError) {
      throw new Error(`Failed to parse OpenAI response as JSON: ${parseError}`);
    }
  }

  /**
   * Claude API integration
   */
  private static async callClaude(
    provider: AIProvider,
    prompt: AIRoadmapPrompt
  ): Promise<AIResponse> {
    const model = provider.model || 'claude-3-sonnet-20240229';

    const requestBody = {
      model,
      max_tokens: 2000,
      temperature: 0.7,
      system: prompt.systemPrompt,
      messages: [
        { role: 'user', content: prompt.userPrompt }
      ]
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': provider.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data: ClaudeResponse = await response.json();
    const content = data.content[0]?.text;

    if (!content) {
      throw new Error('No content received from Claude');
    }

    try {
      const roadmap: StudyRoadmap = JSON.parse(content);
      return {
        success: true,
        data: roadmap,
        usage: data.usage ? {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens
        } : undefined
      };
    } catch (parseError) {
      throw new Error(`Failed to parse Claude response as JSON: ${parseError}`);
    }
  }

  /**
   * Gemini API integration
   */
  private static async callGemini(
    provider: AIProvider,
    prompt: AIRoadmapPrompt
  ): Promise<AIResponse> {
    const model = provider.model || 'gemini-1.5-pro';

    const requestBody = {
      contents: [
        {
          parts: [
            { text: `${prompt.systemPrompt}\n\n${prompt.userPrompt}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
        responseMimeType: 'application/json'
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${provider.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data: GeminiResponse = await response.json();
    const content = data.candidates[0]?.content?.parts[0]?.text;

    if (!content) {
      throw new Error('No content received from Gemini');
    }

    try {
      const roadmap: StudyRoadmap = JSON.parse(content);
      return {
        success: true,
        data: roadmap,
        usage: data.usageMetadata ? {
          promptTokens: data.usageMetadata.promptTokenCount,
          completionTokens: data.usageMetadata.candidatesTokenCount,
          totalTokens: data.usageMetadata.totalTokenCount
        } : undefined
      };
    } catch (parseError) {
      throw new Error(`Failed to parse Gemini response as JSON: ${parseError}`);
    }
  }

  /**
   * Retry logic for failed API calls
   */
  private static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.MAX_RETRIES
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }

        const delay = this.RETRY_DELAY * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));

        console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      }
    }

    throw new Error('Max retries exceeded');
  }

  /**
   * Validate roadmap structure
   */
  static validateRoadmapStructure(roadmap: any): roadmap is StudyRoadmap {
    if (!roadmap || typeof roadmap !== 'object') return false;

    const required = [
      'userId', 'nextFocusArea', 'recommendedProblems',
      'studyPlan', 'weakestTopics', 'overallRecommendation'
    ];

    return required.every(field => field in roadmap);
  }
}
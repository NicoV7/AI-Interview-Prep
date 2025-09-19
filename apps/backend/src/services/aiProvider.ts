export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProviderConfig {
  provider: 'openai' | 'anthropic' | 'google';
  apiKey: string;
  model: string;
}

export abstract class AIProvider {
  protected config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  abstract chat(messages: AIMessage[]): Promise<AIResponse>;
  abstract validateApiKey(): Promise<boolean>;
}

export class OpenAIProvider extends AIProvider {
  async chat(messages: AIMessage[]): Promise<AIResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    return {
      content: (data as any).choices[0].message.content,
      model: (data as any).model,
      usage: (data as any).usage ? {
        promptTokens: (data as any).usage.prompt_tokens,
        completionTokens: (data as any).usage.completion_tokens,
        totalTokens: (data as any).usage.total_tokens
      } : undefined
    };
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export class AnthropicProvider extends AIProvider {
  async chat(messages: AIMessage[]): Promise<AIResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.config.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: 2000,
        messages: messages.filter(msg => msg.role !== 'system').map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        system: messages.find(msg => msg.role === 'system')?.content
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    return {
      content: (data as any).content[0].text,
      model: (data as any).model,
      usage: (data as any).usage ? {
        promptTokens: (data as any).usage.input_tokens,
        completionTokens: (data as any).usage.output_tokens,
        totalTokens: (data as any).usage.input_tokens + (data as any).usage.output_tokens
      } : undefined
    };
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.config.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }]
        })
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export class GoogleProvider extends AIProvider {
  async chat(messages: AIMessage[]): Promise<AIResponse> {
    const systemMessage = messages.find(msg => msg.role === 'system');
    const userMessages = messages.filter(msg => msg.role !== 'system');
    
    const contents = userMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const requestBody: any = {
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000
      }
    };

    if (systemMessage) {
      requestBody.systemInstruction = {
        parts: [{ text: systemMessage.content }]
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    return {
      content: (data as any).candidates[0].content.parts[0].text,
      model: this.config.model,
      usage: (data as any).usageMetadata ? {
        promptTokens: (data as any).usageMetadata.promptTokenCount,
        completionTokens: (data as any).usageMetadata.candidatesTokenCount,
        totalTokens: (data as any).usageMetadata.totalTokenCount
      } : undefined
    };
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${this.config.apiKey}`
      );
      return response.ok;
    } catch {
      return false;
    }
  }
}

export function createAIProvider(config: AIProviderConfig): AIProvider {
  switch (config.provider) {
    case 'openai':
      return new OpenAIProvider(config);
    case 'anthropic':
      return new AnthropicProvider(config);
    case 'google':
      return new GoogleProvider(config);
    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`);
  }
}

export function getAIProviderFromEnv(): AIProvider {
  const provider = process.env.AI_PROVIDER as 'openai' | 'anthropic' | 'google';
  
  if (!provider) {
    throw new Error('AI_PROVIDER environment variable is required');
  }

  let apiKey: string;
  let model: string;

  switch (provider) {
    case 'openai':
      apiKey = process.env.OPENAI_API_KEY!;
      model = process.env.OPENAI_MODEL || 'gpt-4';
      break;
    case 'anthropic':
      apiKey = process.env.ANTHROPIC_API_KEY!;
      model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
      break;
    case 'google':
      apiKey = process.env.GOOGLE_API_KEY!;
      model = process.env.GOOGLE_MODEL || 'gemini-1.5-pro';
      break;
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }

  if (!apiKey) {
    throw new Error(`API key is required for ${provider} provider`);
  }

  return createAIProvider({ provider, apiKey, model });
}

export function getAIProviderFromCookie(userConfig: {
  provider: 'openai' | 'anthropic' | 'google';
  model: string;
  apiKey: string;
}): AIProvider {
  if (!userConfig.provider) {
    throw new Error('AI provider not specified in user configuration');
  }

  if (!userConfig.apiKey) {
    throw new Error(`API key is required for ${userConfig.provider} provider`);
  }

  if (!userConfig.model) {
    throw new Error(`Model is required for ${userConfig.provider} provider`);
  }

  return createAIProvider({
    provider: userConfig.provider,
    apiKey: userConfig.apiKey,
    model: userConfig.model
  });
}
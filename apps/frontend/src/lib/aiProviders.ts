export interface AIModel {
  id: string;
  name: string;
  description: string;
  contextLimit: number;
  pricing: {
    input: string;
    output: string;
  };
  recommended?: boolean;
  capabilities: string[];
}

export interface AIProvider {
  id: string;
  name: string;
  displayName: string;
  description: string;
  logo: string;
  website: string;
  apiKeyUrl: string;
  pricing: {
    tierDescription: string;
    freeCredits?: string;
  };
  apiKeyFormat: {
    prefix: string;
    regex: RegExp;
    example: string;
  };
  models: AIModel[];
  environmentVariables: {
    provider: string;
    apiKey: string;
    model: string;
  };
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'openai',
    displayName: 'OpenAI',
    description: 'Industry-leading models including GPT-4 and GPT-3.5. Excellent for coding interviews and complex reasoning.',
    logo: '🤖',
    website: 'https://openai.com',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    pricing: {
      tierDescription: 'Pay-per-use pricing',
      freeCredits: '$5 free credits for new accounts'
    },
    apiKeyFormat: {
      prefix: 'sk-',
      regex: /^sk-[a-zA-Z0-9]{48,}$/,
      example: 'sk-...'
    },
    models: [
      {
        id: 'gpt-4',
        name: 'GPT-4',
        description: 'Most capable model, best for complex coding problems',
        contextLimit: 8192,
        pricing: {
          input: '$30/1M tokens',
          output: '$60/1M tokens'
        },
        recommended: true,
        capabilities: ['Complex reasoning', 'Code generation', 'Problem solving', 'Detailed explanations']
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        description: 'Faster and more cost-effective than GPT-4',
        contextLimit: 128000,
        pricing: {
          input: '$10/1M tokens',
          output: '$30/1M tokens'
        },
        recommended: true,
        capabilities: ['Large context', 'Fast responses', 'Code generation', 'Cost-effective']
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast and affordable, good for basic interview prep',
        contextLimit: 16385,
        pricing: {
          input: '$0.50/1M tokens',
          output: '$1.50/1M tokens'
        },
        capabilities: ['Fast responses', 'Cost-effective', 'Basic coding help']
      }
    ],
    environmentVariables: {
      provider: 'AI_PROVIDER=openai',
      apiKey: 'OPENAI_API_KEY',
      model: 'OPENAI_MODEL'
    }
  },
  {
    id: 'anthropic',
    name: 'anthropic',
    displayName: 'Anthropic Claude',
    description: 'Advanced AI assistant known for safety and reasoning. Excellent for detailed code explanations and interview guidance.',
    logo: '🔮',
    website: 'https://www.anthropic.com',
    apiKeyUrl: 'https://console.anthropic.com',
    pricing: {
      tierDescription: 'Pay-per-use pricing',
      freeCredits: '$5 free credits for new accounts'
    },
    apiKeyFormat: {
      prefix: 'sk-ant-',
      regex: /^sk-ant-[a-zA-Z0-9\-_]{95,}$/,
      example: 'sk-ant-...'
    },
    models: [
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        description: 'Most intelligent model, excellent for complex coding interviews',
        contextLimit: 200000,
        pricing: {
          input: '$3/1M tokens',
          output: '$15/1M tokens'
        },
        recommended: true,
        capabilities: ['Advanced reasoning', 'Code analysis', 'Large context', 'Detailed explanations']
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        description: 'Most powerful model for the most complex tasks',
        contextLimit: 200000,
        pricing: {
          input: '$15/1M tokens',
          output: '$75/1M tokens'
        },
        capabilities: ['Highest intelligence', 'Complex problem solving', 'Superior code generation']
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        description: 'Fastest and most cost-effective option',
        contextLimit: 200000,
        pricing: {
          input: '$0.25/1M tokens',
          output: '$1.25/1M tokens'
        },
        capabilities: ['Ultra-fast responses', 'Most affordable', 'Good for quick questions']
      }
    ],
    environmentVariables: {
      provider: 'AI_PROVIDER=anthropic',
      apiKey: 'ANTHROPIC_API_KEY',
      model: 'ANTHROPIC_MODEL'
    }
  },
  {
    id: 'google',
    name: 'google',
    displayName: 'Google Gemini',
    description: 'Google&apos;s latest AI models with strong coding capabilities and competitive pricing.',
    logo: '💎',
    website: 'https://ai.google.dev',
    apiKeyUrl: 'https://makersuite.google.com/app/apikey',
    pricing: {
      tierDescription: 'Generous free tier with pay-as-you-go',
      freeCredits: 'Free tier: 15 requests/minute'
    },
    apiKeyFormat: {
      prefix: 'AIza',
      regex: /^AIza[0-9A-Za-z\-_]{35}$/,
      example: 'AIzaSy...'
    },
    models: [
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: 'Most capable model with massive context window',
        contextLimit: 1000000,
        pricing: {
          input: '$3.50/1M tokens',
          output: '$10.50/1M tokens'
        },
        recommended: true,
        capabilities: ['Massive context', 'Advanced reasoning', 'Multimodal', 'Code generation']
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        description: 'Fast and efficient for most coding tasks',
        contextLimit: 1000000,
        pricing: {
          input: '$0.075/1M tokens',
          output: '$0.30/1M tokens'
        },
        recommended: true,
        capabilities: ['Ultra-fast', 'Huge context', 'Very affordable', 'Good for coding']
      },
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        description: 'Balanced performance and cost',
        contextLimit: 30720,
        pricing: {
          input: '$0.50/1M tokens',
          output: '$1.50/1M tokens'
        },
        capabilities: ['Balanced performance', 'Good reasoning', 'Affordable']
      }
    ],
    environmentVariables: {
      provider: 'AI_PROVIDER=google',
      apiKey: 'GOOGLE_API_KEY',
      model: 'GOOGLE_MODEL'
    }
  }
];

export function getProviderById(id: string): AIProvider | undefined {
  return AI_PROVIDERS.find(provider => provider.id === id);
}

export function getModelById(providerId: string, modelId: string): AIModel | undefined {
  const provider = getProviderById(providerId);
  return provider?.models.find(model => model.id === modelId);
}

export function validateApiKey(providerId: string, apiKey: string): boolean {
  const provider = getProviderById(providerId);
  if (!provider) return false;
  return provider.apiKeyFormat.regex.test(apiKey);
}

export function getRecommendedModel(providerId: string): AIModel | undefined {
  const provider = getProviderById(providerId);
  return provider?.models.find(model => model.recommended) || provider?.models[0];
}
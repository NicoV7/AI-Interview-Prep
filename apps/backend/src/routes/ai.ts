import { Router, Request, Response } from 'express';
import { getAIProviderFromEnv, getAIProviderFromCookie, AIMessage } from '../services/aiProvider';
import { requireConfigMiddleware, getConfigSummary } from '../middleware/cookieConfig';

const router = Router();

interface ChatRequest {
  messages: AIMessage[];
}

router.post('/chat', requireConfigMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages }: ChatRequest = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    // Use cookie configuration if available, fallback to environment
    const aiProvider = req.userConfig 
      ? getAIProviderFromCookie(req.userConfig)
      : getAIProviderFromEnv();
      
    const response = await aiProvider.chat(messages);

    res.json({
      success: true,
      response: response.content,
      model: response.model,
      usage: response.usage
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process AI request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/validate', async (_req: Request, res: Response) => {
  try {
    const aiProvider = getAIProviderFromEnv();
    const isValid = await aiProvider.validateApiKey();

    res.json({
      success: true,
      valid: isValid,
      provider: process.env.AI_PROVIDER,
      model: process.env[`${process.env.AI_PROVIDER?.toUpperCase()}_MODEL`]
    });
  } catch (error) {
    console.error('AI validation error:', error);
    res.status(500).json({ 
      error: 'Failed to validate AI configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/status', (req: Request, res: Response): void => {
  // Check cookie configuration first
  if (req.hasValidConfig && req.userConfig) {
    const summary = getConfigSummary(req.userConfig);
    res.json({
      success: true,
      configured: true,
      source: 'cookie',
      ...summary
    });
    return;
  }
  
  // Fallback to environment configuration
  const provider = process.env.AI_PROVIDER;
  const hasApiKey = !!process.env[`${provider?.toUpperCase()}_API_KEY`];
  const model = process.env[`${provider?.toUpperCase()}_MODEL`];

  res.json({
    success: true,
    provider,
    model,
    configured: !!provider && hasApiKey,
    source: 'environment',
    environment: process.env.NODE_ENV || 'development'
  });
});

// New endpoint for cookie-based validation
router.get('/validate-cookie', (req: Request, res: Response): void => {
  if (!req.hasValidConfig || !req.userConfig) {
    res.status(401).json({
      success: false,
      error: 'No valid configuration found',
      configured: false
    });
    return;
  }

  try {
    // Try to create AI provider to validate configuration
    getAIProviderFromCookie(req.userConfig); // Validate configuration
    const summary = getConfigSummary(req.userConfig);
    
    res.json({
      success: true,
      valid: true,
      configured: true,
      ...summary
    });
  } catch (error) {
    console.error('Cookie configuration validation error:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as aiRouter };
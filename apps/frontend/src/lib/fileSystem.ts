export interface FileWriteResult {
  success: boolean;
  method: 'direct' | 'download' | 'clipboard' | 'failed';
  message: string;
  error?: string;
}

export interface SetupConfig {
  provider: string;
  model: string;
  apiKey: string;
  apiUrl: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

// Check if File System Access API is supported
export function isFileSystemAccessSupported(): boolean {
  return 'showDirectoryPicker' in window && 'showSaveFilePicker' in window;
}

// Generate complete .env file content with proper formatting
export function generateEnvFileContent(config: SetupConfig): string {
  const timestamp = new Date().toISOString();
  const providerUpper = config.provider.toUpperCase();
  
  const lines = [
    '# AI Interview Prep Platform Configuration',
    `# Generated on ${timestamp}`,
    '# Restart your development server after making changes',
    '',
    '# AI Provider Configuration',
    `AI_PROVIDER=${config.provider}`,
    `${providerUpper}_API_KEY=${config.apiKey}`,
    `${providerUpper}_MODEL=${config.model}`,
    '',
    '# Application Configuration',
    `NEXT_PUBLIC_API_URL=${config.apiUrl}`,
    'NODE_ENV=development',
    '',
    '# Optional Database Configuration',
    '# Uncomment and configure if using Supabase for data persistence',
  ];

  if (config.supabaseUrl && config.supabaseUrl.trim()) {
    lines.push(`SUPABASE_URL=${config.supabaseUrl}`);
  } else {
    lines.push('# SUPABASE_URL=https://your-project.supabase.co');
  }

  if (config.supabaseAnonKey && config.supabaseAnonKey.trim()) {
    lines.push(`SUPABASE_ANON_KEY=${config.supabaseAnonKey}`);
  } else {
    lines.push('# SUPABASE_ANON_KEY=your_supabase_anon_key');
  }

  lines.push('');
  lines.push('# Security Notes:');
  lines.push('# - Never commit this file to version control');
  lines.push('# - Add .env to your .gitignore file');
  lines.push('# - Keep your API keys secure and private');

  return lines.join('\n');
}

// Primary method: Use File System Access API to write directly to file system
export async function writeEnvFileDirectly(content: string): Promise<FileWriteResult> {
  try {
    if (!isFileSystemAccessSupported()) {
      throw new Error('File System Access API not supported');
    }

    // Request directory access - user will need to select project root
    const dirHandle = await window.showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'desktop'
    });

    // Check if .env already exists and confirm overwrite
    let fileHandle: FileSystemFileHandle;
    try {
      fileHandle = await dirHandle.getFileHandle('.env');
      // File exists, confirm overwrite
      const shouldOverwrite = confirm(
        'A .env file already exists in this directory. Do you want to overwrite it?'
      );
      if (!shouldOverwrite) {
        return {
          success: false,
          method: 'failed',
          message: 'File creation cancelled by user',
        };
      }
    } catch {
      // File doesn't exist, create new one
      fileHandle = await dirHandle.getFileHandle('.env', { create: true });
    }

    // Write content to file
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();

    return {
      success: true,
      method: 'direct',
      message: 'Successfully created .env file in the selected directory! Please restart your development server.',
    };
  } catch (error: any) {
    return {
      success: false,
      method: 'failed',
      message: 'Failed to write file directly',
      error: error.message,
    };
  }
}

// Fallback method 1: Download as file
export function downloadEnvFile(content: string): FileWriteResult {
  try {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = '.env';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);

    return {
      success: true,
      method: 'download',
      message: 'Downloaded .env file! Please move it to your project root directory and restart your development server.',
    };
  } catch (error: any) {
    return {
      success: false,
      method: 'failed',
      message: 'Failed to download file',
      error: error.message,
    };
  }
}

// Fallback method 2: Copy to clipboard
export async function copyEnvToClipboard(content: string): Promise<FileWriteResult> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(content);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (!successful) {
        throw new Error('Failed to copy to clipboard');
      }
    }

    return {
      success: true,
      method: 'clipboard',
      message: 'Copied .env content to clipboard! Create a .env file in your project root and paste the content.',
    };
  } catch (error: any) {
    return {
      success: false,
      method: 'failed',
      message: 'Failed to copy to clipboard',
      error: error.message,
    };
  }
}

// Main function with intelligent fallback strategy
export async function createEnvFile(config: SetupConfig): Promise<FileWriteResult> {
  const content = generateEnvFileContent(config);

  // Strategy 1: Try direct file system access (modern browsers)
  if (isFileSystemAccessSupported()) {
    const directResult = await writeEnvFileDirectly(content);
    if (directResult.success) {
      return directResult;
    }
    
    // If direct write failed due to user cancellation, respect that
    if (directResult.error?.includes('cancelled') || directResult.error?.includes('aborted')) {
      return directResult;
    }
  }

  // Strategy 2: Try download method
  const downloadResult = downloadEnvFile(content);
  if (downloadResult.success) {
    return downloadResult;
  }

  // Strategy 3: Copy to clipboard as last resort
  const clipboardResult = await copyEnvToClipboard(content);
  return clipboardResult;
}

// Check if the application is properly configured
export function checkAppConfiguration(): {
  isConfigured: boolean;
  missing: string[];
  hasAnyProvider: boolean;
} {
  const requiredVars = ['AI_PROVIDER', 'NEXT_PUBLIC_API_URL'];
  const missing: string[] = [];
  
  // Check basic required variables
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Check if any AI provider is configured
  const hasOpenAI = !!(process.env.AI_PROVIDER === 'openai' && process.env.OPENAI_API_KEY);
  const hasAnthropic = !!(process.env.AI_PROVIDER === 'anthropic' && process.env.ANTHROPIC_API_KEY);
  const hasGoogle = !!(process.env.AI_PROVIDER === 'google' && process.env.GOOGLE_API_KEY);
  
  const hasAnyProvider = hasOpenAI || hasAnthropic || hasGoogle;
  
  if (!hasAnyProvider && process.env.AI_PROVIDER) {
    missing.push(`${process.env.AI_PROVIDER?.toUpperCase()}_API_KEY`);
  }

  return {
    isConfigured: missing.length === 0 && hasAnyProvider,
    missing,
    hasAnyProvider,
  };
}

// Validate that environment variables are loaded after file creation
export function validateEnvironmentLoaded(config: SetupConfig): {
  isLoaded: boolean;
  instructions: string[];
} {
  const providerKey = `${config.provider.toUpperCase()}_API_KEY`;
  const modelKey = `${config.provider.toUpperCase()}_MODEL`;
  
  const isLoaded = !!(
    process.env.AI_PROVIDER === config.provider &&
    process.env[providerKey] &&
    process.env[modelKey] &&
    process.env.NEXT_PUBLIC_API_URL
  );

  const instructions = [
    'To complete the setup:',
    '1. Ensure the .env file is in your project root directory (same level as package.json)',
    '2. Stop your development server (Ctrl+C)',
    '3. Restart the development server: npm run dev',
    '4. Refresh this page to verify configuration',
  ];

  if (!isLoaded) {
    instructions.push('');
    instructions.push('If the issue persists:');
    instructions.push('• Check that .env file exists in the correct location');
    instructions.push('• Verify there are no syntax errors in the .env file');
    instructions.push('• Ensure .env is not in .gitignore for local development');
  }

  return {
    isLoaded,
    instructions,
  };
}

// Browser compatibility check
export function getBrowserCompatibility(): {
  fileSystemAccess: boolean;
  clipboard: boolean;
  download: boolean;
  recommendation: string;
} {
  const fileSystemAccess = isFileSystemAccessSupported();
  const clipboard = !!(navigator.clipboard || document.execCommand);
  const download = !!(document.createElement('a').download !== undefined);

  let recommendation = '';
  if (fileSystemAccess) {
    recommendation = 'Your browser supports direct file creation for the best experience.';
  } else if (download) {
    recommendation = 'Your browser supports file downloads. Files will be downloaded to your Downloads folder.';
  } else if (clipboard) {
    recommendation = 'Your browser supports clipboard operations. Content will be copied for manual file creation.';
  } else {
    recommendation = 'Your browser has limited support. Manual copy-paste may be required.';
  }

  return {
    fileSystemAccess,
    clipboard,
    download,
    recommendation,
  };
}
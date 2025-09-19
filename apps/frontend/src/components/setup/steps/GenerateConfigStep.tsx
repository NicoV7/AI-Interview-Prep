'use client';

import { useState } from 'react';
import { Download, Copy, FileText, CheckCircle } from 'lucide-react';
import { StepProps } from '../types';
import { generateEnvTemplate, downloadEnvFile, copyToClipboard } from '@/lib/envValidation';

interface GenerateConfigStepProps extends StepProps {
  selectedProvider?: string;
}

export function GenerateConfigStep({ envValues, selectedProvider, onNext, onPrev }: GenerateConfigStepProps) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const envContent = generateEnvTemplate(envValues, selectedProvider);

  const handleCopy = async () => {
    const success = await copyToClipboard(envContent);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadEnvFile(envContent);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-card-foreground mb-2">
          Generate Configuration
        </h3>
        <p className="text-muted-foreground">
          Your .env file is ready! Save it to your project root directory.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-card-foreground">
              Generated .env file
            </h4>
            <div className="flex space-x-2">
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 text-xs rounded-md border transition-colors flex items-center space-x-1 ${
                  copied 
                    ? 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
                    : 'border-border hover:bg-accent text-muted-foreground hover:text-foreground'
                }`}
              >
                {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors flex items-center space-x-1 ${
                  downloaded
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {downloaded ? <CheckCircle className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                <span>{downloaded ? 'Downloaded!' : 'Download'}</span>
              </button>
            </div>
          </div>
          
          <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto text-muted-foreground">
            {envContent}
          </pre>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Installation Instructions
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>Save the file as <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">.env</code> in your project root directory</li>
            <li>The file should be in the same folder as your <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">package.json</code></li>
            <li>Restart your development server to load the new environment variables</li>
            <li>Never commit the .env file to version control</li>
          </ol>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
            Important Security Notes
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-amber-800 dark:text-amber-200">
            <li>Keep your API keys secure and never share them publicly</li>
            <li>Add <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">.env</code> to your <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">.gitignore</code> file</li>
            <li>Use different API keys for development and production</li>
            <li>Regenerate keys if you suspect they&apos;ve been compromised</li>
          </ul>
        </div>

        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
            Example File Location
          </h4>
          <div className="text-sm text-green-800 dark:text-green-200 font-mono">
            <div>your-project/</div>
            <div>├── apps/</div>
            <div>├── package.json</div>
            <div>├── .env ← Place file here</div>
            <div>└── .gitignore</div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Verify Setup
        </button>
      </div>
    </div>
  );
}
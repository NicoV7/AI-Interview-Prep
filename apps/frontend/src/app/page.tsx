'use client';

import { useState, useEffect } from 'react';
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { SetupWizard } from "@/components/setup/SetupWizard";
import { hasValidConfig, getConfigSummary } from "@/lib/cookieConfig";

export default function Home() {
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [configStatus, setConfigStatus] = useState<{
    isConfigured: boolean;
    provider?: string;
    model?: string;
  } | null>(null);

  useEffect(() => {
    // Check configuration status from cookies
    const isConfigured = hasValidConfig();
    const summary = getConfigSummary();
    
    setConfigStatus({
      isConfigured,
      provider: summary?.provider,
      model: summary?.model
    });
    
    // Auto-open setup wizard if not configured
    if (!isConfigured) {
      setIsSetupOpen(true);
    }
  }, []);
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with theme toggle */}
      <header className="absolute top-0 right-0 p-6 z-10">
        <ThemeToggle />
      </header>
      
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 pointer-events-none"></div>
      
      <div className="relative z-1">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary header-glow mb-6 min-h-[4rem] md:min-h-[6rem] flex items-center justify-center">
              <TypewriterText 
                text="AI Interview Prep"
                speed={150}
                delay={500}
                showCursor={true}
                aria-label="AI Interview Prep - Main heading"
                className="text-primary header-glow"
              />
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Master coding interviews with AI-powered practice and personalized roadmaps
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {configStatus?.isConfigured ? (
                <button
                  className="glow-button px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  data-testid="dashboard-btn"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  View Dashboard
                </button>
              ) : (
                <button
                  className="glow-button px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  data-testid="get-started-btn"
                  onClick={() => setIsSetupOpen(true)}
                >
                  Get Started
                </button>
              )}
              <button
                className="px-8 py-3 border-2 border-border hover:bg-accent hover:text-accent-foreground hover:border-accent text-foreground rounded-lg font-semibold transition-all"
                data-testid="setup-btn"
                onClick={() => setIsSetupOpen(true)}
              >
                {configStatus?.isConfigured ? 'Reconfigure' : 'Setup'}
              </button>
            </div>

            {/* Configuration Status */}
            {configStatus && (
              <div className="mt-6 flex justify-center">
                <div className={`px-4 py-2 rounded-full text-sm ${
                  configStatus.isConfigured 
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700'
                    : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                }`}>
                  {configStatus.isConfigured 
                    ? `✅ Ready with ${configStatus.provider} (${configStatus.model})` 
                    : '⚙️ Setup required to get started'}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-card border border-border rounded-lg shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 icon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                Track Progress
              </h3>
              <p className="text-muted-foreground">
                Monitor your coding skills across different topics and algorithms
              </p>
            </div>
            
            <div className="text-center p-6 bg-card border border-border rounded-lg shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 icon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                AI Roadmap
              </h3>
              <p className="text-muted-foreground">
                Get personalized study plans based on your current skill level
              </p>
            </div>
            
            <div className="text-center p-6 bg-card border border-border rounded-lg shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 icon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                Problem Suggestions
              </h3>
              <p className="text-muted-foreground">
                Receive targeted problem recommendations to improve weak areas
              </p>
            </div>
          </div>
        </div>
      </div>

      <SetupWizard
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onComplete={() => {
          setIsSetupOpen(false);
          // Refresh configuration status after setup completion
          const isConfigured = hasValidConfig();
          const summary = getConfigSummary();
          
          setConfigStatus({
            isConfigured,
            provider: summary?.provider,
            model: summary?.model
          });
        }}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  showCursor?: boolean;
  onComplete?: () => void;
  'aria-label'?: string;
}

export function TypewriterText({ 
  text, 
  speed = 100, 
  delay = 0, 
  className = '', 
  showCursor = true,
  onComplete,
  'aria-label': ariaLabel
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, currentIndex === 0 ? delay : speed);

      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, speed, delay, isComplete, onComplete]);

  return (
    <span 
      className={className}
      aria-label={ariaLabel || text}
      aria-live="polite"
    >
      {displayText}
      {showCursor && (
        <span 
          className="inline-block w-0.5 h-[1em] bg-current ml-1 typewriter-cursor"
          aria-hidden="true"
        />
      )}
    </span>
  );
}
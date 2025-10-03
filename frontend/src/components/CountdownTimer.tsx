import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt: string | null;
  className?: string;
  showIcon?: boolean;
  warningThreshold?: number; // Minutes before showing warning
}

interface TimeRemaining {
  minutes: number;
  seconds: number;
  isExpired: boolean;
  isWarning: boolean;
}

export default function CountdownTimer({
  expiresAt,
  className = '',
  showIcon = true,
  warningThreshold = 2
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    minutes: 0,
    seconds: 0,
    isExpired: false,
    isWarning: false
  });

  useEffect(() => {
    if (!expiresAt) {
      setTimeRemaining({
        minutes: 0,
        seconds: 0,
        isExpired: true,
        isWarning: false
      });
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const expires = new Date(expiresAt).getTime();
      const difference = expires - now;

      if (difference <= 0) {
        setTimeRemaining({
          minutes: 0,
          seconds: 0,
          isExpired: true,
          isWarning: false
        });
        return;
      }

      const minutes = Math.floor(difference / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      const isWarning = minutes < warningThreshold;

      setTimeRemaining({
        minutes,
        seconds,
        isExpired: false,
        isWarning
      });
    };

    // Update immediately
    updateTimer();

    // Set up interval to update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, warningThreshold]);

  if (!expiresAt) {
    return null;
  }

  const getColorClass = () => {
    if (timeRemaining.isExpired) {
      return 'text-red-600 dark:text-red-400';
    }
    if (timeRemaining.isWarning) {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    return 'text-gray-600 dark:text-gray-400';
  };

  const getBackgroundClass = () => {
    if (timeRemaining.isExpired) {
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    }
    if (timeRemaining.isWarning) {
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    }
    return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  };

  const formatTime = (minutes: number, seconds: number) => {
    if (minutes > 0) {
      return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${getBackgroundClass()} ${className}`}>
      {showIcon && (
        <div className={`flex-shrink-0 ${getColorClass()}`}>
          {timeRemaining.isWarning || timeRemaining.isExpired ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <Clock className="h-4 w-4" />
          )}
        </div>
      )}
      
      <div className="flex flex-col">
        <div className={`text-sm font-medium ${getColorClass()}`}>
          {timeRemaining.isExpired ? (
            'File expired'
          ) : (
            `Expires in: ${formatTime(timeRemaining.minutes, timeRemaining.seconds)}`
          )}
        </div>
        
        {!timeRemaining.isExpired && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Files are automatically deleted after 10 minutes
          </div>
        )}
        
        {timeRemaining.isExpired && (
          <div className="text-xs text-red-500 dark:text-red-400">
            This file has been permanently deleted
          </div>
        )}
      </div>
    </div>
  );
}

// Hook for using countdown timer in other components
export function useCountdownTimer(expiresAt: string | null) {
  const [timeRemaining, setTimeRemaining] = useState({
    minutes: 0,
    seconds: 0,
    isExpired: false,
    isWarning: false,
    totalSeconds: 0
  });

  useEffect(() => {
    if (!expiresAt) {
      setTimeRemaining({
        minutes: 0,
        seconds: 0,
        isExpired: true,
        isWarning: false,
        totalSeconds: 0
      });
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const expires = new Date(expiresAt).getTime();
      const difference = expires - now;

      if (difference <= 0) {
        setTimeRemaining({
          minutes: 0,
          seconds: 0,
          isExpired: true,
          isWarning: false,
          totalSeconds: 0
        });
        return;
      }

      const minutes = Math.floor(difference / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      const totalSeconds = Math.floor(difference / 1000);
      const isWarning = minutes < 2;

      setTimeRemaining({
        minutes,
        seconds,
        isExpired: false,
        isWarning,
        totalSeconds
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return timeRemaining;
}
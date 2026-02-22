'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react';

interface TimerProps {
  durationMinutes: number;
  onTimeUp?: () => void;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
}

export function Timer({ 
  durationMinutes, 
  onTimeUp, 
  isRunning, 
  onToggle, 
  onReset 
}: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60);
  const [warningThreshold] = useState(5 * 60); // 5 minutes warning

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            onTimeUp?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, onTimeUp]);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const progress = ((durationMinutes * 60 - timeRemaining) / (durationMinutes * 60)) * 100;
  const isWarning = timeRemaining <= warningThreshold && timeRemaining > 0;
  const isCritical = timeRemaining <= 60;

  return (
    <Card className={`${isWarning ? 'border-orange-400 bg-orange-50' : ''} ${isCritical ? 'border-red-400 bg-red-50 animate-pulse' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isWarning && (
              <AlertTriangle className={`h-5 w-5 ${isCritical ? 'text-red-500' : 'text-orange-500'}`} />
            )}
            <div>
              <div className="text-sm text-muted-foreground">Time Remaining</div>
              <div className={`text-2xl font-mono font-bold ${
                isCritical ? 'text-red-600' : 
                isWarning ? 'text-orange-600' : 
                'text-slate-900'
              }`}>
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onToggle}
              disabled={timeRemaining === 0}
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setTimeRemaining(durationMinutes * 60);
                onReset();
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              isCritical ? 'bg-red-500' : 
              isWarning ? 'bg-orange-500' : 
              'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

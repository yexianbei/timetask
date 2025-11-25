'use client';

import { useState, useEffect, useRef } from 'react';
import { formatDuration, formatCurrency, calculateCost, getSecondsBetween } from '@/lib/utils';
import type { Task, TimeEntry } from '@/types';

interface TimeTrackerProps {
  task: Task | null;
  onStop: (entry: TimeEntry) => void;
  onClose: () => void;
}

export default function TimeTracker({ task, onStop, onClose }: TimeTrackerProps) {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isPaused, setIsPaused] = useState(false);
  const [pausedDuration, setPausedDuration] = useState(0);
  const [pauseStartTime, setPauseStartTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (task && !startTime) {
      const now = new Date();
      setStartTime(now);
      setCurrentTime(now);
    }

    if (startTime && !isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [task, startTime, isPaused]);

  if (!task) return null;

  const handlePause = () => {
    if (isPaused) {
      // 恢复 - 计算暂停时长并累加
      if (pauseStartTime) {
        const pauseSeconds = getSecondsBetween(pauseStartTime, new Date());
        setPausedDuration(prev => prev + pauseSeconds);
      }
      setIsPaused(false);
      setPauseStartTime(null);
    } else {
      // 暂停
      setIsPaused(true);
      setPauseStartTime(new Date());
    }
  };

  const handleStop = () => {
    if (!startTime) return;

    const totalSeconds = getSecondsBetween(startTime, currentTime) - pausedDuration;
    const cost = calculateCost(totalSeconds, task.hourlyRate, 30);

    const entry: TimeEntry = {
      id: `entry_${Date.now()}`,
      taskId: task.id,
      startTime,
      endTime: currentTime,
      duration: totalSeconds,
      cost,
      isActive: false,
      createdAt: new Date(),
    };

    onStop(entry);
    
    // 重置状态
    setStartTime(null);
    setCurrentTime(new Date());
    setIsPaused(false);
    setPausedDuration(0);
    setPauseStartTime(null);
  };

  const elapsedSeconds = startTime 
    ? getSecondsBetween(startTime, currentTime) - pausedDuration 
    : 0;
  const cost = calculateCost(elapsedSeconds, task.hourlyRate, 30);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{task.title}</h2>
          <p className="text-gray-600">正在计时中...</p>
        </div>

        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-primary-600 mb-4">
            {formatDuration(elapsedSeconds)}
          </div>
          <div className="text-2xl text-gray-600 mb-2">
            费用: <span className="font-bold text-primary-600">{formatCurrency(cost)}</span>
          </div>
          <div className="text-lg text-gray-500">
            费率: {formatCurrency(task.hourlyRate)}/小时
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handlePause}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              isPaused
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-yellow-500 text-white hover:bg-yellow-600'
            }`}
          >
            {isPaused ? '继续' : '暂停'}
          </button>
          <button
            onClick={handleStop}
            className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            停止计时
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}


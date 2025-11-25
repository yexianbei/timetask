'use client';

import { useState } from 'react';
import { formatTime, formatDuration, formatCurrency, calculateCost } from '@/lib/utils';
import type { Task } from '@/types';

interface TaskListProps {
  tasks: Task[];
  selectedDate: Date;
  onTaskClick: (task: Task) => void;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onStartTracking: (task: Task) => void;
}

export default function TaskList({
  tasks,
  selectedDate,
  onTaskClick,
  onTaskUpdate,
  onTaskDelete,
  onStartTracking,
}: TaskListProps) {
  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);

  // 筛选当天的任务
  const filteredTasks = tasks.filter(task => {
    const taskDate = new Date(task.startTime);
    return (
      taskDate.getFullYear() === selectedDate.getFullYear() &&
      taskDate.getMonth() === selectedDate.getMonth() &&
      taskDate.getDate() === selectedDate.getDate()
    );
  }).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  // 分离全天任务和定时任务
  const allDayTasks = filteredTasks.filter(task => {
    const duration = (task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60 * 60);
    return duration >= 24;
  });

  const timedTasks = filteredTasks.filter(task => {
    const duration = (task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60 * 60);
    return duration < 24;
  });

  // 生成时间轴（8:00 - 23:00）
  const hours = Array.from({ length: 16 }, (_, i) => i + 8);

  // 计算任务在时间轴上的位置
  const getTaskPosition = (task: Task) => {
    const startHour = task.startTime.getHours();
    const startMinute = task.startTime.getMinutes();
    const endHour = task.endTime.getHours();
    const endMinute = task.endTime.getMinutes();
    
    // 计算从8:00开始的分钟数
    const startMinutes = (startHour - 8) * 60 + startMinute;
    const endMinutes = (endHour - 8) * 60 + endMinute;
    const duration = endMinutes - startMinutes;
    
    return { startMinutes, duration };
  };

  const handleTaskClick = (task: Task) => {
    onTaskClick(task);
  };

  return (
    <div className="bg-white flex-1 overflow-y-auto">
      {/* 全天任务 */}
      {allDayTasks.length > 0 && (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="text-xs font-medium text-gray-500 mb-2">全天</div>
          {allDayTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleTaskClick(task)}
              className="flex items-center gap-2 mb-2 p-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: task.color ? `${task.color}20` : '#f3e8ff',
              }}
            >
              <div
                className="w-1 h-6 rounded-full flex-shrink-0"
                style={{ backgroundColor: task.color || '#8b5cf6' }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800">{task.title}</div>
                {task.description && (
                  <div className="text-xs text-gray-600 mt-0.5 truncate">{task.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 时间轴视图 */}
      <div className="relative">
        {/* 时间轴 */}
        <div className="px-4 py-2">
          {hours.map((hour) => (
            <div key={hour} className="flex items-start border-b border-gray-100">
              <div className="w-12 flex-shrink-0 pt-1">
                <div className="text-xs text-gray-500">{hour.toString().padStart(2, '0')}:00</div>
              </div>
              <div className="flex-1 relative min-h-[60px]">
                {/* 任务条 */}
                {timedTasks
                  .filter(task => {
                    const taskStartHour = task.startTime.getHours();
                    const taskEndHour = task.endTime.getHours();
                    // 任务在当前小时或跨越当前小时
                    return (taskStartHour <= hour && taskEndHour >= hour) || 
                           (taskStartHour === hour) ||
                           (taskStartHour < hour && taskEndHour > hour);
                  })
                  .map((task) => {
                    const { startMinutes, duration } = getTaskPosition(task);
                    const taskStartHour = task.startTime.getHours();
                    const taskEndHour = task.endTime.getHours();
                    const taskStartMinute = task.startTime.getMinutes();
                    
                    // 只在任务开始的这一小时显示
                    if (taskStartHour === hour) {
                      const topOffset = taskStartMinute; // 分钟数作为像素偏移
                      const height = Math.max((duration / 60) * 60, 40); // 转换为像素高度
                      
                      const taskColor = task.color || '#8b5cf6';
                      
                      return (
                        <div
                          key={task.id}
                          onClick={() => handleTaskClick(task)}
                          className="absolute left-0 right-2 rounded-lg p-2 cursor-pointer hover:opacity-80 transition-opacity z-10"
                          style={{
                            top: `${topOffset}px`,
                            height: `${height}px`,
                            minHeight: '40px',
                            backgroundColor: `${taskColor}40`,
                            borderLeft: `3px solid ${taskColor}`,
                          }}
                        >
                          <div className="flex items-start gap-2 h-full">
                            <svg className="w-3 h-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: taskColor }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-800 truncate">
                                {task.title}
                              </div>
                              {task.description && (
                                <div className="text-xs text-gray-600 truncate mt-0.5">
                                  {task.description}
                                </div>
                              )}
                              <div className="text-xs text-gray-600 mt-0.5">
                                {formatTime(task.startTime)}-{formatTime(task.endTime)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 空状态 */}
      {filteredTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="text-sm">今天还没有任务</div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { formatDate, getCurrentWeek, isToday } from '@/lib/utils';
import type { Task, WeekCalendar } from '@/types';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  tasks: Task[];
}

export default function Calendar({ selectedDate, onDateSelect, tasks }: CalendarProps) {
  const [week, setWeek] = useState<WeekCalendar>(getCurrentWeek());

  const weekDays = [
    { key: 'monday' as const, label: '周一' },
    { key: 'tuesday' as const, label: '周二' },
    { key: 'wednesday' as const, label: '周三' },
    { key: 'thursday' as const, label: '周四' },
    { key: 'friday' as const, label: '周五' },
    { key: 'saturday' as const, label: '周六' },
    { key: 'sunday' as const, label: '周日' },
  ];

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.startTime);
      return (
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getDate() === date.getDate()
      );
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(({ key, label }) => {
          const date = week[key];
          const dayTasks = getTasksForDate(date);
          const isSelected = 
            selectedDate.getFullYear() === date.getFullYear() &&
            selectedDate.getMonth() === date.getMonth() &&
            selectedDate.getDate() === date.getDate();
          const today = isToday(date);

          return (
            <button
              key={key}
              onClick={() => onDateSelect(date)}
              className={`
                p-3 rounded-lg border-2 transition-all
                ${isSelected 
                  ? 'border-primary-500 bg-primary-50 text-primary-700' 
                  : 'border-gray-200 hover:border-primary-300'
                }
                ${today && !isSelected ? 'border-blue-300 bg-blue-50' : ''}
              `}
            >
              <div className="text-sm font-medium text-gray-600 mb-1">
                {label}
              </div>
              <div className={`
                text-lg font-bold mb-2
                ${isSelected ? 'text-primary-700' : 'text-gray-800'}
                ${today ? 'text-blue-600' : ''}
              `}>
                {date.getDate()}
              </div>
              <div className="text-xs text-gray-500">
                {dayTasks.length} 个任务
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}


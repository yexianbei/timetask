'use client';

import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { getCurrentWeek, isToday } from '@/lib/utils';
import { getLunarDate } from '@/lib/lunar';
import type { Task, WeekCalendar } from '@/types';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  tasks: Task[];
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  onCreateTask?: () => void;
}

export default function Calendar({ 
  selectedDate, 
  onDateSelect, 
  tasks,
  onPrevMonth,
  onNextMonth,
  onCreateTask
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  
  // 获取当前月份的第一周（包含该月的日期）
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // 从周日开始
  const endDate = startOfWeek(monthEnd, { weekStartsOn: 0 });
  
  // 获取当前显示周的日期
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const weekDayLabels = ['日', '一', '二', '三', '四', '五', '六'];

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

  const handlePrevWeek = () => {
    const newDate = addDays(selectedDate, -7);
    onDateSelect(newDate);
  };

  const handleNextWeek = () => {
    const newDate = addDays(selectedDate, 7);
    onDateSelect(newDate);
  };

  const handleToday = () => {
    onDateSelect(new Date());
  };

  return (
    <div className="bg-white">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
              setCurrentMonth(newDate);
              onPrevMonth?.();
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-lg font-medium text-gray-800">
            {format(currentMonth, 'yyyy年M月')}
          </span>
          <button
            onClick={() => {
              const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
              setCurrentMonth(newDate);
              onNextMonth?.();
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button
            onClick={onCreateTask}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* 日期选择栏 */}
      <div className="px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-1">
            {weekDayLabels.map((label, index) => (
              <div key={index} className="flex-1 text-center text-xs text-gray-500 font-medium">
                {label}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          {weekDates.map((date, index) => {
            const isSelected = 
              selectedDate.getFullYear() === date.getFullYear() &&
              selectedDate.getMonth() === date.getMonth() &&
              selectedDate.getDate() === date.getDate();
            const today = isToday(date);
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const dayTasks = getTasksForDate(date);
            const lunarDate = getLunarDate(date);

            return (
              <button
                key={index}
                onClick={() => onDateSelect(date)}
                className="flex-1 flex flex-col items-center py-2"
              >
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-1
                    ${isSelected
                      ? 'bg-black text-white'
                      : today
                      ? 'text-red-500'
                      : isCurrentMonth
                      ? 'text-gray-800'
                      : 'text-gray-400'
                    }
                  `}
                >
                  {date.getDate()}
                </div>
                <div className="text-xs text-gray-500">
                  {lunarDate}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 当前日期详情 */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-800">
          {format(selectedDate, 'yyyy年M月d日')} - {weekDayLabels[selectedDate.getDay()]}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {getLunarDate(selectedDate)}
        </div>
      </div>
    </div>
  );
}

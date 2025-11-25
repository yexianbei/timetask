'use client';

import { useState, useEffect } from 'react';
import { formatTime, formatDate } from '@/lib/utils';
import type { Task, RepeatType, RepeatUnit, RepeatEndType } from '@/types';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

interface ScheduleModalProps {
  task: Task | null;
  selectedDate: Date;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const COLOR_OPTIONS = [
  { name: '蓝色', value: '#3b82f6' },
  { name: '绿色', value: '#10b981' },
  { name: '黄色', value: '#f59e0b' },
  { name: '红色', value: '#ef4444' },
  { name: '紫色', value: '#8b5cf6' },
  { name: '粉色', value: '#ec4899' },
  { name: '橙色', value: '#f97316' },
  { name: '青色', value: '#06b6d4' },
];

export default function ScheduleModal({ task, selectedDate, onClose, onSave }: ScheduleModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    color: COLOR_OPTIONS[0].value,
    repeatType: 'never' as RepeatType,
    customInterval: 1,
    customUnit: 'day' as RepeatUnit,
    endRepeatType: 'never' as RepeatEndType,
    endRepeatDate: '',
  });

  useEffect(() => {
    if (task) {
      const startDate = new Date(task.startTime);
      const endDate = new Date(task.endTime);
      
      setFormData({
        title: task.title,
        description: task.description || '',
        startDate: formatDate(startDate, 'yyyy-MM-dd'),
        startTime: formatTime(startDate),
        endDate: formatDate(endDate, 'yyyy-MM-dd'),
        endTime: formatTime(endDate),
        color: task.color || COLOR_OPTIONS[0].value,
        repeatType: task.repeatRule?.type || 'never',
        customInterval: task.repeatRule?.customInterval || 1,
        customUnit: task.repeatRule?.customUnit || 'day',
        endRepeatType: task.repeatRule?.endType || 'never',
        endRepeatDate: task.repeatRule?.endDate ? formatDate(task.repeatRule.endDate, 'yyyy-MM-dd') : '',
      });
    } else {
      // 新建日程，默认使用选中日期
      const defaultStart = new Date(selectedDate);
      defaultStart.setHours(9, 0, 0, 0);
      const defaultEnd = new Date(defaultStart);
      defaultEnd.setHours(10, 0, 0, 0);
      
      setFormData({
        title: '',
        description: '',
        startDate: formatDate(defaultStart, 'yyyy-MM-dd'),
        startTime: formatTime(defaultStart),
        endDate: formatDate(defaultEnd, 'yyyy-MM-dd'),
        endTime: formatTime(defaultEnd),
        color: COLOR_OPTIONS[0].value,
        repeatType: 'never',
        customInterval: 1,
        customUnit: 'day',
        endRepeatType: 'never',
        endRepeatDate: '',
      });
    }
  }, [task, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const [startYear, startMonth, startDay] = formData.startDate.split('-').map(Number);
    const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
    const [endYear, endMonth, endDay] = formData.endDate.split('-').map(Number);
    const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
    
    const startTime = new Date(startYear, startMonth - 1, startDay, startHours, startMinutes, 0, 0);
    const endTime = new Date(endYear, endMonth - 1, endDay, endHours, endMinutes, 0, 0);
    
    if (endTime <= startTime) {
      alert('结束时间必须晚于开始时间');
      return;
    }

    const repeatRule = formData.repeatType !== 'never' ? {
      type: formData.repeatType,
      customInterval: formData.repeatType === 'custom' ? formData.customInterval : undefined,
      customUnit: formData.repeatType === 'custom' ? formData.customUnit : undefined,
      endType: formData.endRepeatType,
      endDate: formData.endRepeatType === 'date' && formData.endRepeatDate 
        ? new Date(formData.endRepeatDate + 'T23:59:59')
        : undefined,
    } : undefined;

    const updatedTask: Task = {
      id: task?.id || `task_${Date.now()}`,
      title: formData.title,
      description: formData.description,
      startTime,
      endTime,
      hourlyRate: task?.hourlyRate || 500,
      status: task?.status || 'pending',
      caseId: task?.caseId,
      employeeId: task?.employeeId,
      color: formData.color,
      repeatRule,
      parentTaskId: task?.parentTaskId,
      createdAt: task?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(updatedTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-2xl w-full mx-4 my-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {task ? '编辑日程' : '新建日程'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              placeholder="请输入日程标题"
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="请输入日程描述（可选）"
            />
          </div>

          {/* 开始时间 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                开始日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                开始时间 <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          {/* 结束时间 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                结束日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                结束时间 <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          {/* 颜色选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              颜色
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`
                    w-10 h-10 rounded-lg border-2 transition-all
                    ${formData.color === color.value 
                      ? 'border-gray-800 scale-110' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* 重复规则 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              重复
            </label>
            <select
              value={formData.repeatType}
              onChange={(e) => setFormData({ ...formData, repeatType: e.target.value as RepeatType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="never">永不重复</option>
              <option value="daily">每天</option>
              <option value="weekly">每周</option>
              <option value="biweekly">每两周</option>
              <option value="monthly">每月</option>
              <option value="yearly">每年</option>
              <option value="custom">自定义</option>
            </select>
          </div>

          {/* 自定义重复规则 */}
          {formData.repeatType === 'custom' && (
            <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  间隔数量
                </label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={formData.customInterval}
                  onChange={(e) => setFormData({ ...formData, customInterval: Math.max(1, Math.min(999, Number(e.target.value))) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  单位
                </label>
                <select
                  value={formData.customUnit}
                  onChange={(e) => setFormData({ ...formData, customUnit: e.target.value as RepeatUnit })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="day">天</option>
                  <option value="week">周</option>
                  <option value="month">月</option>
                  <option value="year">年</option>
                </select>
              </div>
            </div>
          )}

          {/* 结束重复 */}
          {formData.repeatType !== 'never' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                结束重复
              </label>
              <select
                value={formData.endRepeatType}
                onChange={(e) => setFormData({ ...formData, endRepeatType: e.target.value as RepeatEndType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
              >
                <option value="never">永不结束</option>
                <option value="date">在日期结束</option>
              </select>
              
              {formData.endRepeatType === 'date' && (
                <input
                  type="date"
                  value={formData.endRepeatDate}
                  onChange={(e) => setFormData({ ...formData, endRepeatDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required={formData.endRepeatType === 'date'}
                />
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              保存
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


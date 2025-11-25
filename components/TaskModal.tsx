'use client';

import { useState, useEffect } from 'react';
import { formatTime } from '@/lib/utils';
import type { Task } from '@/types';

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
}

export default function TaskModal({ task, onClose, onSave }: TaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    hourlyRate: 0,
    status: 'pending' as Task['status'],
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        startTime: formatTime(task.startTime),
        endTime: formatTime(task.endTime),
        hourlyRate: task.hourlyRate,
        status: task.status,
      });
    } else {
      const now = new Date();
      const defaultStart = new Date(now);
      defaultStart.setHours(9, 0, 0, 0);
      const defaultEnd = new Date(defaultStart);
      defaultEnd.setHours(10, 0, 0, 0);
      
      setFormData({
        title: '',
        startTime: formatTime(defaultStart),
        endTime: formatTime(defaultEnd),
        hourlyRate: 500,
        status: 'pending',
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
    const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
    
    const startTime = new Date(task?.startTime || new Date());
    startTime.setHours(startHours, startMinutes, 0, 0);
    
    const endTime = new Date(task?.endTime || new Date());
    endTime.setHours(endHours, endMinutes, 0, 0);
    
    if (endTime <= startTime) {
      alert('结束时间必须晚于开始时间');
      return;
    }

    const updatedTask: Task = {
      id: task?.id || `task_${Date.now()}`,
      title: formData.title,
      startTime,
      endTime,
      hourlyRate: formData.hourlyRate,
      status: formData.status,
      caseId: task?.caseId,
      employeeId: task?.employeeId,
      createdAt: task?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(updatedTask);
    onClose();
  };

  if (!task && !formData.title) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {task ? '编辑任务' : '创建任务'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              任务标题
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                开始时间
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                结束时间
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              每小时收费 (¥)
            </label>
            <input
              type="number"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              状态
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="pending">待处理</option>
              <option value="in-progress">进行中</option>
              <option value="completed">已完成</option>
            </select>
          </div>

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


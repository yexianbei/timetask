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
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);

  const filteredTasks = tasks.filter(task => {
    const taskDate = new Date(task.startTime);
    return (
      taskDate.getFullYear() === selectedDate.getFullYear() &&
      taskDate.getMonth() === selectedDate.getMonth() &&
      taskDate.getDate() === selectedDate.getDate()
    );
  }).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const handleTimeChange = (task: Task, field: 'startTime' | 'endTime', value: string) => {
    const [hours, minutes] = value.split(':').map(Number);
    const newDate = new Date(task[field]);
    newDate.setHours(hours, minutes, 0, 0);
    
    const updatedTask = {
      ...task,
      [field]: newDate,
      updatedAt: new Date(),
    };
    
    // 确保结束时间晚于开始时间
    if (field === 'startTime' && updatedTask.endTime <= updatedTask.startTime) {
      updatedTask.endTime = new Date(updatedTask.startTime.getTime() + 3600000); // 默认1小时
    }
    if (field === 'endTime' && updatedTask.endTime <= updatedTask.startTime) {
      updatedTask.startTime = new Date(updatedTask.endTime.getTime() - 3600000);
    }
    
    onTaskUpdate(updatedTask);
  };

  const handleDragStart = (index: number) => {
    setDragStartIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragStartIndex === null || dragStartIndex === dropIndex) return;

    const draggedTask = filteredTasks[dragStartIndex];
    const targetTask = filteredTasks[dropIndex];
    
    // 计算时间差
    const timeDiff = targetTask.startTime.getTime() - draggedTask.startTime.getTime();
    const duration = draggedTask.endTime.getTime() - draggedTask.startTime.getTime();
    
    const updatedTask: Task = {
      ...draggedTask,
      startTime: new Date(draggedTask.startTime.getTime() + timeDiff),
      endTime: new Date(draggedTask.startTime.getTime() + timeDiff + duration),
      updatedAt: new Date(),
    };
    
    onTaskUpdate(updatedTask);
    setDragStartIndex(null);
  };

  const getTaskDuration = (task: Task) => {
    return (task.endTime.getTime() - task.startTime.getTime()) / 1000;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        {selectedDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} 的任务
      </h2>
      
      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          今天还没有任务
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task, index) => {
            const duration = getTaskDuration(task);
            const cost = calculateCost(duration, task.hourlyRate);
            
            return (
              <div
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`
                  p-4 border rounded-lg cursor-move transition-all
                  ${task.status === 'in-progress' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-primary-300'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">{task.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{formatTime(task.startTime)} - {formatTime(task.endTime)}</span>
                      <span>时长: {formatDuration(duration)}</span>
                      <span>费率: {formatCurrency(task.hourlyRate)}/小时</span>
                      <span className="font-medium text-primary-600">
                        费用: {formatCurrency(cost)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => onStartTracking(task)}
                      className="px-3 py-1 bg-primary-500 text-white rounded hover:bg-primary-600 text-sm"
                    >
                      开始计时
                    </button>
                    <button
                      onClick={() => onTaskClick(task)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => onTaskDelete(task.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


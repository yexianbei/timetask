'use client';

import { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import TaskList from '@/components/TaskList';
import TaskModal from '@/components/TaskModal';
import TimeTracker from '@/components/TimeTracker';
import CaseManagement from '@/components/CaseManagement';
import Statistics from '@/components/Statistics';
import { getCurrentWeek } from '@/lib/utils';
import type { Task, TimeEntry } from '@/types';
import { 
  getTasks, 
  saveTask, 
  deleteTask, 
  getTimeEntries, 
  saveTimeEntry,
  initializeSampleData 
} from '@/lib/storage';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [trackingTask, setTrackingTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'cases' | 'statistics'>('calendar');

  useEffect(() => {
    // 初始化示例数据
    initializeSampleData();
    // 加载任务
    setTasks(getTasks());
  }, []);

  const handleTaskSave = (task: Task) => {
    saveTask(task);
    setTasks(getTasks());
  };

  const handleTaskDelete = (taskId: string) => {
    if (confirm('确定要删除这个任务吗？')) {
      deleteTask(taskId);
      setTasks(getTasks());
    }
  };

  const handleStartTracking = (task: Task) => {
    setTrackingTask(task);
    // 更新任务状态为进行中
    const updatedTask = { ...task, status: 'in-progress' as const };
    handleTaskSave(updatedTask);
  };

  const handleStopTracking = (entry: TimeEntry) => {
    saveTimeEntry(entry);
    
    // 更新任务状态为已完成
    if (trackingTask) {
      const updatedTask = { ...trackingTask, status: 'completed' as const };
      handleTaskSave(updatedTask);
    }
    
    setTrackingTask(null);
    setTasks(getTasks());
    
    // 显示计时结果
    alert(`计时完成！\n时长: ${entry.duration}秒\n费用: ¥${entry.cost.toFixed(2)}`);
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">律师事务所时间管理系统</h1>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'calendar'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                日历视图
              </button>
              <button
                onClick={() => setActiveTab('cases')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'cases'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                案件管理
              </button>
              <button
                onClick={() => setActiveTab('statistics')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'statistics'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                统计面板
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'calendar' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-800">日历视图</h2>
              <button
                onClick={handleCreateTask}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                新建任务
              </button>
            </div>

            <Calendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              tasks={tasks}
            />

            <TaskList
              tasks={tasks}
              selectedDate={selectedDate}
              onTaskClick={(task) => {
                setSelectedTask(task);
                setShowTaskModal(true);
              }}
              onTaskUpdate={handleTaskSave}
              onTaskDelete={handleTaskDelete}
              onStartTracking={handleStartTracking}
            />
          </div>
        )}

        {activeTab === 'cases' && (
          <CaseManagement />
        )}

        {activeTab === 'statistics' && (
          <Statistics />
        )}
      </main>

      {/* 任务编辑模态框 */}
      {showTaskModal && (
        <TaskModal
          task={selectedTask}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onSave={handleTaskSave}
        />
      )}

      {/* 计时器 */}
      {trackingTask && (
        <TimeTracker
          task={trackingTask}
          onStop={handleStopTracking}
          onClose={() => setTrackingTask(null)}
        />
      )}
    </div>
  );
}


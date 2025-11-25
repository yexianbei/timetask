'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from '@/components/Calendar';
import TaskList from '@/components/TaskList';
import TaskModal from '@/components/TaskModal';
import TimeTracker from '@/components/TimeTracker';
import CaseManagement from '@/components/CaseManagement';
import Statistics from '@/components/Statistics';
import InviteEmployee from '@/components/InviteEmployee';
import { getCurrentWeek } from '@/lib/utils';
import type { Task, TimeEntry, User } from '@/types';
import { 
  getTasks, 
  saveTask, 
  deleteTask, 
  getTimeEntries, 
  saveTimeEntry,
  initializeSampleData 
} from '@/lib/storage';
import { getCurrentUserSession, logoutUser, isBoss } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [trackingTask, setTrackingTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'cases' | 'statistics' | 'invite'>('calendar');

  useEffect(() => {
    // 检查登录状态
    const currentUser = getCurrentUserSession();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    
    // 初始化示例数据
    initializeSampleData();
    // 加载任务
    setTasks(getTasks());
  }, [router]);

  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">律师事务所时间管理系统</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
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
                {isBoss() && (
                  <button
                    onClick={() => setActiveTab('invite')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      activeTab === 'invite'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    邀请员工
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-300">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{user.name}</span>
                  <span className="ml-2 text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded">
                    {user.role === 'boss' ? '老板' : '员工'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                >
                  登出
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'calendar' && (
          <div className="flex flex-col h-[calc(100vh-4rem)]">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              tasks={tasks}
              onCreateTask={handleCreateTask}
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

            {/* 底部导航栏 */}
            <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-around">
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                今天
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className="p-2 text-gray-600 hover:text-primary-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => setActiveTab('cases')}
                className="p-2 text-gray-600 hover:text-primary-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'cases' && (
          <CaseManagement />
        )}

        {activeTab === 'statistics' && (
          <Statistics />
        )}

        {activeTab === 'invite' && isBoss() && (
          <InviteEmployee />
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


'use client';

import { useState, useRef, useEffect } from 'react';
import { formatTime } from '@/lib/utils';
import type { Task } from '@/types';

interface TaskListProps {
  tasks: Task[];
  selectedDate: Date;
  onTaskClick: (task: Task) => void;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onStartTracking: (task: Task) => void;
}

interface TaskLayout {
  task: Task;
  top: number;
  height: number;
  left: number;
  width: number;
  row: number;
}

export default function TaskList({
  tasks,
  selectedDate,
  onTaskClick,
  onTaskUpdate,
  onTaskDelete,
  onStartTracking,
}: TaskListProps) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [dragType, setDragType] = useState<'start' | 'end' | 'move' | null>(null);
  const [dragStartY, setDragStartY] = useState<number>(0);
  const [dragStartTime, setDragStartTime] = useState<Date | null>(null);
  const [dragStartEndTime, setDragStartEndTime] = useState<Date | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const taskRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isDraggingRef = useRef<boolean>(false);

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

  // 计算任务在时间轴上的位置
  const getTaskPosition = (task: Task) => {
    const startHour = task.startTime.getHours();
    const startMinute = task.startTime.getMinutes();
    const endHour = task.endTime.getHours();
    const endMinute = task.endTime.getMinutes();
    
    const startMinutes = (startHour - 8) * 60 + startMinute;
    const endMinutes = (endHour - 8) * 60 + endMinute;
    const duration = endMinutes - startMinutes;
    
    return { startMinutes, duration };
  };

  // 检测任务重叠并计算布局
  const calculateTaskLayouts = (tasks: Task[]): TaskLayout[] => {
    const layouts: TaskLayout[] = [];
    const rows: Task[][] = [];

    tasks.forEach(task => {
      const { startMinutes, duration } = getTaskPosition(task);
      const endMinutes = startMinutes + duration;

      // 找到可以放置的行
      let placed = false;
      for (let i = 0; i < rows.length; i++) {
        const canPlace = rows[i].every(existingTask => {
          const existing = getTaskPosition(existingTask);
          const existingEnd = existing.startMinutes + existing.duration;
          // 检查是否重叠
          return endMinutes <= existing.startMinutes || startMinutes >= existingEnd;
        });

        if (canPlace) {
          rows[i].push(task);
          layouts.push({
            task,
            top: startMinutes,
            height: duration,
            left: (i / rows.length) * 100,
            width: 100 / rows.length,
            row: i,
          });
          placed = true;
          break;
        }
      }

      // 如果没有找到合适的行，创建新行
      if (!placed) {
        rows.push([task]);
        layouts.push({
          task,
          top: startMinutes,
          height: duration,
          left: 0,
          width: 100 / rows.length,
          row: rows.length - 1,
        });
        // 重新计算所有任务的宽度
        layouts.forEach(layout => {
          layout.width = 100 / rows.length;
          layout.left = (layout.row / rows.length) * 100;
        });
      }
    });

    return layouts;
  };

  const taskLayouts = calculateTaskLayouts(timedTasks);

  const handleTaskClick = (task: Task) => {
    if (!editingTaskId) {
      onTaskClick(task);
    }
  };

  // 长按检测
  const handleLongPressStart = (task: Task, e: React.MouseEvent | React.TouchEvent) => {
    // 如果已经在编辑模式，不重复触发
    if (editingTaskId === task.id) return;
    
    longPressTimerRef.current = setTimeout(() => {
      setEditingTaskId(task.id);
      // 长按后不立即进入拖动模式，只是进入编辑模式
      // 用户需要再次拖动才会进入拖动模式
    }, 300); // 300ms长按，更快响应
  };

  const handleLongPressEnd = () => {
    // 长按结束后不清除定时器，让编辑模式保持
    // 只有在真正开始拖动时才设置拖动相关状态
  };

  // 拖动开始（拖动点或整体拖动）
  const handleDragStart = (task: Task, type: 'start' | 'end' | 'move', e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // 确保在编辑模式
    if (editingTaskId !== task.id) {
      setEditingTaskId(task.id);
    }
    
    setDragType(type);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStartY(clientY);
    setDragStartTime(new Date(task.startTime));
    setDragStartEndTime(new Date(task.endTime));
    isDraggingRef.current = true;
  };

  // 整体拖动开始（在编辑模式下拖动任务条）
  const handleTaskDragStart = (task: Task, e: React.MouseEvent | React.TouchEvent) => {
    // 只有在编辑模式下才能整体拖动
    if (editingTaskId === task.id) {
      handleDragStart(task, 'move', e);
    }
  };

  // 拖动中
  const handleDrag = (e: MouseEvent | TouchEvent) => {
    if (!dragType || !editingTaskId || !dragStartTime || !dragStartEndTime) return;

    const task = timedTasks.find(t => t.id === editingTaskId);
    if (!task) return;

    e.preventDefault();
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - dragStartY;
    
    // 每12像素 = 5分钟，使用更精确的计算，让拖动更丝滑
    // 时间轴每60像素代表1小时（60分钟），所以每像素 = 1分钟
    // 每12像素 = 12分钟，但我们想要每5分钟一个步进
    const pixelsPerMinute = 1; // 每像素 = 1分钟
    const minutesDelta = Math.round(deltaY / pixelsPerMinute / 5) * 5; // 四舍五入到5分钟的倍数
    const timeDelta = minutesDelta * 60 * 1000; // 转换为毫秒

    if (dragType === 'move') {
      // 整体拖动：同时移动开始和结束时间
      const newStartTime = new Date(dragStartTime.getTime() + timeDelta);
      const duration = dragStartEndTime.getTime() - dragStartTime.getTime();
      const newEndTime = new Date(newStartTime.getTime() + duration);

      const updatedTask: Task = {
        ...task,
        startTime: newStartTime,
        endTime: newEndTime,
        updatedAt: new Date(),
      };
      onTaskUpdate(updatedTask);
    } else if (dragType === 'start') {
      // 拖动开始时间点：往上（deltaY < 0）时间更早，往下（deltaY > 0）时间更晚
      const newStartTime = new Date(dragStartTime.getTime() + timeDelta);
      
      if (newStartTime >= dragStartEndTime) return; // 开始时间不能晚于结束时间
      
      const updatedTask: Task = {
        ...task,
        startTime: newStartTime,
        updatedAt: new Date(),
      };
      onTaskUpdate(updatedTask);
    } else if (dragType === 'end') {
      // 拖动结束时间点：往上（deltaY < 0）时间更早，往下（deltaY > 0）时间更晚
      const newEndTime = new Date(dragStartEndTime.getTime() + timeDelta);
      
      if (newEndTime <= dragStartTime) return; // 结束时间不能早于开始时间
      
      const updatedTask: Task = {
        ...task,
        endTime: newEndTime,
        updatedAt: new Date(),
      };
      onTaskUpdate(updatedTask);
    }
  };

  // 拖动结束
  const handleDragEnd = () => {
    setDragType(null);
    setDragStartY(0);
    setDragStartTime(null);
    setDragStartEndTime(null);
    isDraggingRef.current = false;
    // 延迟退出编辑模式，让用户看到最终结果
    setTimeout(() => {
      if (!isDraggingRef.current) {
        setEditingTaskId(null);
      }
    }, 200);
  };

  useEffect(() => {
    if (dragType) {
      document.addEventListener('mousemove', handleDrag as any);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDrag as any);
      document.addEventListener('touchend', handleDragEnd);

      return () => {
        document.removeEventListener('mousemove', handleDrag as any);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchmove', handleDrag as any);
        document.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [dragType, editingTaskId, dragStartY, dragStartTime, dragStartEndTime, timedTasks]);

  // 点击外部退出编辑模式
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (editingTaskId && !dragType && !isDraggingRef.current) {
        const target = e.target as HTMLElement;
        const taskElement = taskRefs.current.get(editingTaskId);
        // 检查是否点击在任务元素外部，且不是拖动点
        if (taskElement && !taskElement.contains(target) && !target.closest('[class*="cursor-ns-resize"]')) {
          setEditingTaskId(null);
        }
      }
    };

    // 使用 mousedown 而不是 click，确保能捕获到点击事件
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside as any);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as any);
    };
  }, [editingTaskId, dragType]);

  // 生成时间轴（8:00 - 23:00）
  const hours = Array.from({ length: 16 }, (_, i) => i + 8);

  // 获取时间调整提示
  const getTimeAdjustmentHint = (task: Task) => {
    if (editingTaskId !== task.id || !dragType) return null;
    if (dragType === 'move') {
      return `${formatTime(task.startTime)} - ${formatTime(task.endTime)}`;
    }
    const time = dragType === 'start' ? task.startTime : task.endTime;
    const hours = time.getHours();
    const minutes = Math.round(time.getMinutes() / 5) * 5;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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
              className="flex items-center gap-2 mb-2 p-2 rounded-lg hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: task.color ? `${task.color}20` : '#f3e8ff',
              }}
            >
              <div
                onClick={() => handleTaskClick(task)}
                className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
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
                  <div className="text-xs text-gray-500 mt-0.5">
                    {formatTime(task.startTime)}-{formatTime(task.endTime)}
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartTracking(task);
                }}
                className="flex-shrink-0 px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-xs font-medium flex items-center gap-1"
                title="开始专注"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>专注</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 时间轴视图 */}
      <div className="relative">
        <div className="px-4 py-2">
          {hours.map((hour) => (
            <div key={hour} className="flex items-start border-b border-gray-100">
              <div className="w-12 flex-shrink-0 pt-1">
                <div className="text-xs text-gray-500">{hour.toString().padStart(2, '0')}:00</div>
              </div>
              <div className="flex-1 relative min-h-[60px]">
                {/* 任务条 */}
                {taskLayouts
                  .filter(layout => {
                    const taskStartHour = layout.task.startTime.getHours();
                    return taskStartHour === hour;
                  })
                  .map((layout) => {
                    const { task } = layout;
                    const taskStartMinute = task.startTime.getMinutes();
                    const isEditing = editingTaskId === task.id;
                    const taskColor = task.color || '#8b5cf6';
                    const hint = getTimeAdjustmentHint(task);

                    return (
                      <div
                        key={task.id}
                        ref={(el) => {
                          if (el) taskRefs.current.set(task.id, el);
                        }}
                        onMouseDown={(e) => {
                          // 如果点击的是拖动点，不触发长按
                          const target = e.target as HTMLElement;
                          if (!target.closest('[class*="cursor-ns-resize"]')) {
                            if (isEditing) {
                              // 如果已经在编辑模式，开始整体拖动
                              handleTaskDragStart(task, e);
                            } else {
                              // 否则开始长按检测
                              handleLongPressStart(task, e);
                            }
                          }
                        }}
                        onMouseUp={(e) => {
                          // 松手时不退出编辑模式，只清除长按定时器
                          if (longPressTimerRef.current) {
                            clearTimeout(longPressTimerRef.current);
                            longPressTimerRef.current = null;
                          }
                        }}
                        onMouseLeave={(e) => {
                          // 离开时不退出编辑模式，只清除长按定时器
                          if (longPressTimerRef.current) {
                            clearTimeout(longPressTimerRef.current);
                            longPressTimerRef.current = null;
                          }
                        }}
                        onTouchStart={(e) => {
                          const target = e.target as HTMLElement;
                          if (!target.closest('[class*="cursor-ns-resize"]')) {
                            if (isEditing) {
                              handleTaskDragStart(task, e);
                            } else {
                              handleLongPressStart(task, e);
                            }
                          }
                        }}
                        onTouchEnd={(e) => {
                          if (longPressTimerRef.current) {
                            clearTimeout(longPressTimerRef.current);
                            longPressTimerRef.current = null;
                          }
                        }}
                        className={`absolute rounded-lg p-2 z-10 transition-all ${
                          isEditing && dragType === 'move' ? 'cursor-move' : isEditing ? 'cursor-default' : 'cursor-pointer'
                        }`}
                        style={{
                          top: `${taskStartMinute}px`,
                          height: `${Math.max(layout.height, 40)}px`,
                          minHeight: '40px',
                          left: `${layout.left}%`,
                          width: `${layout.width - 2}%`,
                          backgroundColor: isEditing ? taskColor : `${taskColor}40`,
                          borderLeft: `3px solid ${taskColor}`,
                        }}
                      >
                        {/* 拖动点 - 顶部（控制开始时间） */}
                        {isEditing && (
                          <div
                            onMouseDown={(e) => handleDragStart(task, 'start', e)}
                            onTouchStart={(e) => handleDragStart(task, 'start', e)}
                            className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-2 border-gray-400 rounded-full cursor-ns-resize z-20 shadow-md"
                            style={{ borderColor: taskColor }}
                            title="拖动调整开始时间"
                          />
                        )}

                        {/* 拖动点 - 底部（控制结束时间） */}
                        {isEditing && (
                          <div
                            onMouseDown={(e) => handleDragStart(task, 'end', e)}
                            onTouchStart={(e) => handleDragStart(task, 'end', e)}
                            className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-2 border-gray-400 rounded-full cursor-ns-resize z-20 shadow-md"
                            style={{ borderColor: taskColor }}
                            title="拖动调整结束时间"
                          />
                        )}

                        <div className="flex items-start gap-2 h-full">
                          <div
                            onClick={() => !isEditing && handleTaskClick(task)}
                            className="flex items-start gap-2 flex-1 min-w-0"
                          >
                            <svg className="w-3 h-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: isEditing ? '#fff' : taskColor }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium truncate ${isEditing ? 'text-white' : 'text-gray-800'}`}>
                                {task.title}
                              </div>
                              {task.description && (
                                <div className={`text-xs truncate mt-0.5 ${isEditing ? 'text-white opacity-90' : 'text-gray-600'}`}>
                                  {task.description}
                                </div>
                              )}
                              <div className={`text-xs mt-0.5 ${isEditing ? 'text-white opacity-90' : 'text-gray-600'}`}>
                                {formatTime(task.startTime)}-{formatTime(task.endTime)}
                              </div>
                              {hint && (
                                <div className="text-xs text-white opacity-75 mt-1">
                                  调整至: {hint}
                                </div>
                              )}
                            </div>
                          </div>
                          {!isEditing && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onStartTracking(task);
                              }}
                              className="flex-shrink-0 px-2 py-1 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors text-xs font-medium flex items-center gap-1"
                              title="开始专注"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    );
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

// 重复规则计算工具
import { addDays, addWeeks, addMonths, addYears, isBefore, isAfter } from 'date-fns';
import type { Task, RepeatRule } from '@/types';

/**
 * 根据重复规则生成任务实例
 */
export function generateTaskInstances(task: Task, endDate?: Date): Task[] {
  if (!task.repeatRule || task.repeatRule.type === 'never') {
    return [task];
  }

  const instances: Task[] = [task];
  const repeatRule = task.repeatRule;
  const startDate = new Date(task.startTime);
  const taskDuration = task.endTime.getTime() - task.startTime.getTime();
  
  // 确定结束日期
  let finalEndDate: Date;
  if (repeatRule.endType === 'date' && repeatRule.endDate) {
    finalEndDate = new Date(repeatRule.endDate);
    finalEndDate.setHours(23, 59, 59, 999);
  } else if (endDate) {
    finalEndDate = endDate;
  } else {
    // 默认生成未来一年的实例
    finalEndDate = addYears(new Date(), 1);
  }

  let currentDate = new Date(startDate);
  let instanceCount = 0;
  const maxInstances = 1000; // 防止无限循环

  while (isBefore(currentDate, finalEndDate) && instanceCount < maxInstances) {
    let nextDate: Date;

    switch (repeatRule.type) {
      case 'daily':
        nextDate = addDays(currentDate, 1);
        break;
      case 'weekly':
        nextDate = addWeeks(currentDate, 1);
        break;
      case 'biweekly':
        nextDate = addWeeks(currentDate, 2);
        break;
      case 'monthly':
        nextDate = addMonths(currentDate, 1);
        break;
      case 'yearly':
        nextDate = addYears(currentDate, 1);
        break;
      case 'custom':
        if (repeatRule.customInterval && repeatRule.customUnit) {
          switch (repeatRule.customUnit) {
            case 'day':
              nextDate = addDays(currentDate, repeatRule.customInterval);
              break;
            case 'week':
              nextDate = addWeeks(currentDate, repeatRule.customInterval);
              break;
            case 'month':
              nextDate = addMonths(currentDate, repeatRule.customInterval);
              break;
            case 'year':
              nextDate = addYears(currentDate, repeatRule.customInterval);
              break;
            default:
              return instances;
          }
        } else {
          return instances;
        }
        break;
      default:
        return instances;
    }

    if (isAfter(nextDate, finalEndDate)) {
      break;
    }

    // 创建新的任务实例
    const instanceStartTime = new Date(nextDate);
    instanceStartTime.setHours(
      startDate.getHours(),
      startDate.getMinutes(),
      startDate.getSeconds(),
      startDate.getMilliseconds()
    );

    const instanceEndTime = new Date(instanceStartTime.getTime() + taskDuration);

    const instance: Task = {
      ...task,
      id: `${task.id}_${instanceCount + 1}`,
      startTime: instanceStartTime,
      endTime: instanceEndTime,
      parentTaskId: task.id,
      createdAt: task.createdAt,
      updatedAt: new Date(),
    };

    instances.push(instance);
    currentDate = nextDate;
    instanceCount++;
  }

  return instances;
}

/**
 * 获取指定日期范围内的任务实例
 */
export function getTasksInDateRange(tasks: Task[], startDate: Date, endDate: Date): Task[] {
  const allInstances: Task[] = [];

  tasks.forEach(task => {
    const instances = generateTaskInstances(task, endDate);
    
    // 筛选出在日期范围内的实例
    instances.forEach(instance => {
      const instanceDate = new Date(instance.startTime);
      if (
        (instanceDate >= startDate && instanceDate <= endDate) ||
        (instance.startTime <= endDate && instance.endTime >= startDate)
      ) {
        allInstances.push(instance);
      }
    });
  });

  return allInstances;
}


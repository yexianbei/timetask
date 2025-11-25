import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import type { WeekCalendar } from '@/types';

// 格式化日期
export function formatDate(date: Date, formatStr: string = 'yyyy-MM-dd'): string {
  return format(date, formatStr);
}

// 格式化时间
export function formatTime(date: Date): string {
  return format(date, 'HH:mm');
}

// 格式化日期时间
export function formatDateTime(date: Date): string {
  return format(date, 'yyyy-MM-dd HH:mm');
}

// 获取本周的日期范围（周一到周日）
export function getCurrentWeek(): WeekCalendar {
  const today = new Date();
  const monday = startOfWeek(today, { weekStartsOn: 1 });
  
  return {
    monday,
    tuesday: addDays(monday, 1),
    wednesday: addDays(monday, 2),
    thursday: addDays(monday, 3),
    friday: addDays(monday, 4),
    saturday: addDays(monday, 5),
    sunday: addDays(monday, 6),
  };
}

// 判断日期是否是今天
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

// 计算两个日期之间的秒数
export function getSecondsBetween(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / 1000);
}

// 格式化时长（秒数转为小时:分钟:秒）
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

// 格式化时长（小时数）
export function formatHours(seconds: number): string {
  const hours = seconds / 3600;
  return hours.toFixed(2);
}

// 计算费用（基于秒数和每小时费率）
export function calculateCost(seconds: number, hourlyRate: number, minUnit: number = 30): number {
  // 最小计时单元（分钟）
  const minUnitSeconds = minUnit * 60;
  
  // 如果时长小于最小单元，按最小单元计算
  const billableSeconds = seconds < minUnitSeconds ? minUnitSeconds : seconds;
  
  // 向上取整到最小单元
  const roundedSeconds = Math.ceil(billableSeconds / minUnitSeconds) * minUnitSeconds;
  
  return (roundedSeconds / 3600) * hourlyRate;
}

// 格式化金额
export function formatCurrency(amount: number): string {
  return `¥${amount.toFixed(2)}`;
}


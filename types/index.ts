// 数据模型类型定义

export type RepeatType = 'never' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly' | 'custom';
export type RepeatUnit = 'day' | 'week' | 'month' | 'year';
export type RepeatEndType = 'never' | 'date';

export interface RepeatRule {
  type: RepeatType;
  customInterval?: number; // 自定义重复的间隔数量（1-999）
  customUnit?: RepeatUnit; // 自定义重复的单位
  endType: RepeatEndType;
  endDate?: Date; // 结束重复的日期
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  hourlyRate: number;
  status: 'pending' | 'in-progress' | 'completed';
  caseId?: string;
  employeeId?: string;
  color?: string; // 颜色（hex格式，如 #3b82f6）
  repeatRule?: RepeatRule; // 重复规则
  parentTaskId?: string; // 如果是重复任务生成的实例，指向原始任务ID
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // 秒数
  cost: number; // 费用
  isActive: boolean;
  createdAt: Date;
}

export interface Case {
  id: string;
  name: string;
  totalFee: number; // 总收费
  assignedEmployees: string[]; // 员工ID数组
  tasks: string[]; // 任务ID数组
  status: 'active' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: string;
  name: string;
  hourlySalary: number; // 每小时薪资
  email?: string;
  createdAt: Date;
}

export interface Statistics {
  weekStats: {
    clientCount: number;
    totalHours: number;
    totalRevenue: number;
    totalCost: number;
    profit: number;
  };
  caseProgress: {
    caseId: string;
    caseName: string;
    totalHours: number;
    cost: number;
    profit: number;
  }[];
  employeeStats: {
    employeeId: string;
    employeeName: string;
    monthlyHours: number;
    monthlyRevenue: number;
    monthlySalary: number;
  }[];
}

export interface WeekCalendar {
  monday: Date;
  tuesday: Date;
  wednesday: Date;
  thursday: Date;
  friday: Date;
  saturday: Date;
  sunday: Date;
}

export type UserRole = 'boss' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password: string; // 简单存储，生产环境应使用哈希
  invitedBy?: string; // 邀请人ID（如果是员工）
  createdAt: Date;
}

export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string; // 邀请人ID
  token: string; // 邀请令牌
  used: boolean;
  expiresAt: Date;
  createdAt: Date;
}


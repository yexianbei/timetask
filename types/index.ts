// 数据模型类型定义

export interface Task {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  hourlyRate: number;
  status: 'pending' | 'in-progress' | 'completed';
  caseId?: string;
  employeeId?: string;
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


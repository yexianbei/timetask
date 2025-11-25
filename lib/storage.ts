// 数据存储工具（使用localStorage，生产环境可替换为数据库）
import type { Task, TimeEntry, Case, Employee, User, Invitation } from '@/types';

const STORAGE_KEYS = {
  TASKS: 'law_firm_tasks',
  TIME_ENTRIES: 'law_firm_time_entries',
  CASES: 'law_firm_cases',
  EMPLOYEES: 'law_firm_employees',
  USERS: 'law_firm_users',
  INVITATIONS: 'law_firm_invitations',
  CURRENT_USER: 'law_firm_current_user',
};

// Tasks
export function getTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.TASKS);
  if (!data) return [];
  return JSON.parse(data).map((task: any) => ({
    ...task,
    startTime: new Date(task.startTime),
    endTime: new Date(task.endTime),
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
  }));
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

export function getTask(id: string): Task | null {
  const tasks = getTasks();
  return tasks.find(t => t.id === id) || null;
}

export function saveTask(task: Task): void {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === task.id);
  if (index >= 0) {
    tasks[index] = task;
  } else {
    tasks.push(task);
  }
  saveTasks(tasks);
}

export function deleteTask(id: string): void {
  const tasks = getTasks();
  const filtered = tasks.filter(t => t.id !== id);
  saveTasks(filtered);
}

// Time Entries
export function getTimeEntries(): TimeEntry[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.TIME_ENTRIES);
  if (!data) return [];
  return JSON.parse(data).map((entry: any) => ({
    ...entry,
    startTime: new Date(entry.startTime),
    endTime: entry.endTime ? new Date(entry.endTime) : null,
    createdAt: new Date(entry.createdAt),
  }));
}

export function saveTimeEntries(entries: TimeEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(entries));
}

export function getTimeEntry(id: string): TimeEntry | null {
  const entries = getTimeEntries();
  return entries.find(e => e.id === id) || null;
}

export function saveTimeEntry(entry: TimeEntry): void {
  const entries = getTimeEntries();
  const index = entries.findIndex(e => e.id === entry.id);
  if (index >= 0) {
    entries[index] = entry;
  } else {
    entries.push(entry);
  }
  saveTimeEntries(entries);
}

// Cases
export function getCases(): Case[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.CASES);
  if (!data) return [];
  return JSON.parse(data).map((c: any) => ({
    ...c,
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
  }));
}

export function saveCases(cases: Case[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
}

export function getCase(id: string): Case | null {
  const cases = getCases();
  return cases.find(c => c.id === id) || null;
}

export function saveCase(caseItem: Case): void {
  const cases = getCases();
  const index = cases.findIndex(c => c.id === caseItem.id);
  if (index >= 0) {
    cases[index] = caseItem;
  } else {
    cases.push(caseItem);
  }
  saveCases(cases);
}

// Users
export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!data) return [];
  return JSON.parse(data).map((u: any) => ({
    ...u,
    createdAt: new Date(u.createdAt),
  }));
}

export function saveUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function getUser(id: string): User | null {
  const users = getUsers();
  return users.find(u => u.id === id) || null;
}

export function getUserByEmail(email: string): User | null {
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function saveUser(user: User): void {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  saveUsers(users);
}

// Current User Session
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!userId) return null;
  return getUser(userId);
}

export function setCurrentUser(userId: string | null): void {
  if (typeof window === 'undefined') return;
  if (userId) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

// Invitations
export function getInvitations(): Invitation[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.INVITATIONS);
  if (!data) return [];
  return JSON.parse(data).map((inv: any) => ({
    ...inv,
    expiresAt: new Date(inv.expiresAt),
    createdAt: new Date(inv.createdAt),
  }));
}

export function saveInvitations(invitations: Invitation[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(invitations));
}

export function getInvitation(token: string): Invitation | null {
  const invitations = getInvitations();
  return invitations.find(inv => inv.token === token && !inv.used) || null;
}

export function saveInvitation(invitation: Invitation): void {
  const invitations = getInvitations();
  const index = invitations.findIndex(inv => inv.id === invitation.id);
  if (index >= 0) {
    invitations[index] = invitation;
  } else {
    invitations.push(invitation);
  }
  saveInvitations(invitations);
}

// Employees
export function getEmployees(): Employee[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
  if (!data) return [];
  return JSON.parse(data).map((e: any) => ({
    ...e,
    createdAt: new Date(e.createdAt),
  }));
}

export function saveEmployees(employees: Employee[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
}

export function getEmployee(id: string): Employee | null {
  const employees = getEmployees();
  return employees.find(e => e.id === id) || null;
}

export function saveEmployee(employee: Employee): void {
  const employees = getEmployees();
  const index = employees.findIndex(e => e.id === employee.id);
  if (index >= 0) {
    employees[index] = employee;
  } else {
    employees.push(employee);
  }
  saveEmployees(employees);
}

// 初始化示例数据
export function initializeSampleData(): void {
  if (typeof window === 'undefined') return;
  
  // 检查是否已初始化
  if (localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) return;
  
  // 创建示例员工
  const employees: Employee[] = [
    {
      id: 'emp1',
      name: '张三',
      hourlySalary: 200,
      email: 'zhangsan@lawfirm.com',
      createdAt: new Date(),
    },
    {
      id: 'emp2',
      name: '李四',
      hourlySalary: 150,
      email: 'lisi@lawfirm.com',
      createdAt: new Date(),
    },
  ];
  saveEmployees(employees);
  
  // 创建示例案件
  const cases: Case[] = [
    {
      id: 'case1',
      name: '合同纠纷案',
      totalFee: 50000,
      assignedEmployees: ['emp1', 'emp2'],
      tasks: [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  saveCases(cases);
}


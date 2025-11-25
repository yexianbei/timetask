// 认证工具函数
import type { User, UserRole, Invitation } from '@/types';
import { 
  getUsers, 
  saveUser, 
  getUserByEmail, 
  setCurrentUser, 
  getCurrentUser,
  getInvitations,
  saveInvitation,
  getInvitation,
} from './storage';

// 注册用户
export function registerUser(
  email: string,
  password: string,
  name: string,
  role: UserRole = 'employee',
  invitationToken?: string
): { success: boolean; error?: string; user?: User } {
  // 检查邮箱是否已存在
  if (getUserByEmail(email)) {
    return { success: false, error: '该邮箱已被注册' };
  }

  // 如果提供了邀请令牌，验证邀请
  if (invitationToken) {
    const invitation = getInvitation(invitationToken);
    if (!invitation) {
      return { success: false, error: '邀请链接无效或已过期' };
    }
    if (invitation.email.toLowerCase() !== email.toLowerCase()) {
      return { success: false, error: '邀请邮箱与注册邮箱不匹配' };
    }
    if (new Date() > invitation.expiresAt) {
      return { success: false, error: '邀请链接已过期' };
    }
    role = invitation.role;
  } else if (role === 'boss') {
    // 检查是否已有老板账户
    const users = getUsers();
    const hasBoss = users.some(u => u.role === 'boss');
    if (hasBoss) {
      return { success: false, error: '系统中已存在老板账户，请联系现有老板邀请您' };
    }
  }

  // 创建新用户
  const user: User = {
    id: `user_${Date.now()}`,
    email: email.toLowerCase(),
    name,
    password, // 生产环境应使用哈希
    role,
    invitedBy: invitationToken ? getInvitation(invitationToken)?.invitedBy : undefined,
    createdAt: new Date(),
  };

  saveUser(user);

  // 如果使用了邀请，标记为已使用
  if (invitationToken) {
    const invitation = getInvitation(invitationToken);
    if (invitation) {
      invitation.used = true;
      saveInvitation(invitation);
    }
  }

  // 自动登录
  setCurrentUser(user.id);

  return { success: true, user };
}

// 登录
export function loginUser(email: string, password: string): { success: boolean; error?: string; user?: User } {
  const user = getUserByEmail(email);
  
  if (!user) {
    return { success: false, error: '邮箱或密码错误' };
  }

  if (user.password !== password) {
    return { success: false, error: '邮箱或密码错误' };
  }

  setCurrentUser(user.id);
  return { success: true, user };
}

// 登出
export function logoutUser(): void {
  setCurrentUser(null);
}

// 检查是否已登录
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

// 获取当前用户
export function getCurrentUserSession(): User | null {
  return getCurrentUser();
}

// 检查用户角色
export function hasRole(role: UserRole): boolean {
  const user = getCurrentUser();
  return user?.role === role;
}

// 检查是否为老板
export function isBoss(): boolean {
  return hasRole('boss');
}

// 检查是否为员工
export function isEmployee(): boolean {
  return hasRole('employee');
}

// 创建邀请
export function createInvitation(
  email: string,
  role: UserRole,
  invitedBy: string
): { success: boolean; error?: string; invitation?: Invitation } {
  const user = getCurrentUser();
  if (!user || user.role !== 'boss') {
    return { success: false, error: '只有老板可以创建邀请' };
  }

  // 检查邮箱是否已注册
  if (getUserByEmail(email)) {
    return { success: false, error: '该邮箱已被注册' };
  }

  // 检查是否已有未使用的邀请
  const existingInvitations = getInvitations();
  const existing = existingInvitations.find(
    inv => inv.email.toLowerCase() === email.toLowerCase() && !inv.used && new Date() < inv.expiresAt
  );
  if (existing) {
    return { success: false, error: '该邮箱已有未使用的邀请' };
  }

  // 生成邀请令牌
  const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

  const invitation: Invitation = {
    id: `inv_${Date.now()}`,
    email: email.toLowerCase(),
    role,
    invitedBy,
    token,
    used: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后过期
    createdAt: new Date(),
  };

  saveInvitation(invitation);
  return { success: true, invitation };
}

// 获取所有邀请（老板可见）
export function getAllInvitations(): Invitation[] {
  return getInvitations();
}


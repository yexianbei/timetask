'use client';

import { useState } from 'react';
import { createInvitation, getAllInvitations, getCurrentUserSession } from '@/lib/auth';
import type { UserRole } from '@/types';
import { formatDateTime } from '@/lib/utils';

export default function InviteEmployee() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState(getAllInvitations());

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const currentUser = getCurrentUserSession();
    if (!currentUser) {
      setError('请先登录');
      setLoading(false);
      return;
    }

    const result = createInvitation(email, role, currentUser.id);
    
    if (result.success) {
      setSuccess(`邀请已发送至 ${email}`);
      setEmail('');
      setInvitations(getAllInvitations());
    } else {
      setError(result.error || '邀请失败');
    }
    
    setLoading(false);
  };

  const getInvitationLink = (token: string) => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/register?token=${token}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('邀请链接已复制到剪贴板');
    setTimeout(() => setSuccess(''), 3000);
  };

  const activeInvitations = invitations.filter(
    inv => !inv.used && new Date() < inv.expiresAt
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">邀请员工</h2>

      <form onSubmit={handleInvite} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              邮箱地址
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="employee@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              角色
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="employee">员工</option>
              <option value="boss">老板</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '发送中...' : '发送邀请'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}
      </form>

      {activeInvitations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">待使用的邀请</h3>
          <div className="space-y-3">
            {activeInvitations.map((inv) => (
              <div
                key={inv.id}
                className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{inv.email}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    角色: {inv.role === 'boss' ? '老板' : '员工'} | 
                    创建时间: {formatDateTime(inv.createdAt)} | 
                    过期时间: {formatDateTime(inv.expiresAt)}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => copyToClipboard(getInvitationLink(inv.token))}
                    className="px-3 py-1 bg-primary-500 text-white rounded hover:bg-primary-600 text-sm"
                  >
                    复制链接
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


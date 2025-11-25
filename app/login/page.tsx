'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { getCurrentUserSession } from '@/lib/auth';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const invitationToken = searchParams.get('token');

  useEffect(() => {
    // 如果已登录，重定向到主页
    const user = getCurrentUserSession();
    if (user) {
      router.push('/');
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleSuccess = (user: any) => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return <AuthForm onSuccess={handleSuccess} invitationToken={invitationToken || undefined} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}


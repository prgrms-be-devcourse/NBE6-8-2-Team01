'use client';

import { useState, useEffect } from 'react';
import { authFetch } from '../util/authFetch';

interface User {
  id: number;
  nickname: string;
  address: string;
  email: string;
  profileImage?: string;
}

interface UseCurrentUserReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  userId: number | null;
}

export function useCurrentUser(): UseCurrentUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await authFetch('/api/v1/bookbook/users/me');
        
        if (!response.ok) {
          if (response.status === 401) {
            // 인증되지 않은 사용자
            setUser(null);
            setError('로그인이 필요합니다.');
            return;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (mounted && data.data) {
          setUser(data.data);
        }
      } catch (err) {
        if (mounted) {
          console.error('사용자 정보 조회 실패:', err);
          setError(err instanceof Error ? err.message : '사용자 정보를 불러오는데 실패했습니다.');
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchCurrentUser();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    user,
    loading,
    error,
    userId: user?.id || null
  };
}
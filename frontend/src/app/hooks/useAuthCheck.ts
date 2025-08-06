// 08.04 현준
// 글 상세페이지를 위한 로그인 체크

'use client';

import { useState, useEffect } from 'react';
import { authFetch } from '../util/authFetch'; // authFetch 유틸리티 임포트

interface User {
  id: number;
  nickname: string;
  address: string;
  email: string;
  profileImage?: string;
}

interface UseAuthCheckReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  userId: number | null;
  isAuthenticated: boolean;
}

export function useAuthCheck(): UseAuthCheckReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuthStatusAndFetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. 먼저 인증 상태를 확인하는 API를 호출합니다.
        // 이 API는 JWT가 없어도 401을 반환하지 않고, 단순히 'false'를 반환합니다.
        const authStatusResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/users/isAuthenticated`, {
            credentials: 'include',
        });
        
        if (!mounted) return;

        if (authStatusResponse.ok) {
            const authStatusData = await authStatusResponse.json();
            const isAuth = authStatusData.data;
            setIsAuthenticated(isAuth);

            if (isAuth) {
                // 2. 인증된 경우에만 'me' API를 호출하여 사용자 정보를 가져옵니다.
                const userResponse = await authFetch('/api/v1/bookbook/users/me');
                if (!mounted) return;
                
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    if (userData && userData.data) {
                        setUser(userData.data);
                    }
                }
            } else {
                // 인증되지 않은 경우
                setUser(null);
            }
        } else {
            // isAuthenticated API 호출 자체가 실패한 경우 (서버 오류 등)
            throw new Error('인증 상태를 확인하는 데 실패했습니다.');
        }
      } catch (err: unknown) {
          if (!mounted) return;
          console.error('인증 상태 확인 또는 사용자 정보 조회 실패:', err);

          //  err가 Error 객체인지 확인하고 message에 접근합니다.
          if (err instanceof Error) {
              setError(err.message || '사용자 정보를 불러오는 데 실패했습니다.');
          } else {
              setError('사용자 정보를 불러오는 데 실패했습니다.');
          }

          setUser(null);
          setIsAuthenticated(false);
      } finally {
          if (mounted) {
              setLoading(false);
          }
      }
    };

    checkAuthStatusAndFetchUser();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    user,
    loading,
    error,
    userId: user?.id || null,
    isAuthenticated,
  };
}
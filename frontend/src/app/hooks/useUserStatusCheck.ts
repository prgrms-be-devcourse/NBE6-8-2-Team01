// src/app/hooks/useUserStatusCheck.ts (전체 코드)

'use client';

import { useState, useEffect } from 'react';

const REFRESH_SUCCESS_KEY = 'refreshSucceeded';
const INITIAL_LOGIN_KEY = 'initialLoginSucceeded';
const MODAL_SHOWN_KEY = 'suspensionModalShown';

export function useUserStatusCheck() {
    const [isSuspended, setIsSuspended] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const checkUserStatus = async () => {
            const refreshSucceeded = sessionStorage.getItem(REFRESH_SUCCESS_KEY);
            const initialLoginSucceeded = sessionStorage.getItem(INITIAL_LOGIN_KEY);
            const hasModalBeenShown = sessionStorage.getItem(MODAL_SHOWN_KEY);

            // ⭐ 핵심 로직: 최초 로그인 또는 리프레시 성공 시에만 진행
            if ((!refreshSucceeded && !initialLoginSucceeded) || hasModalBeenShown) {
                setIsLoaded(true);
                return;
            }

            try {
                const res = await fetch('http://localhost:8080/api/v1/bookbook/users/me', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (res.status === 200) {
                    const data = await res.json();
                    if (data.data && data.data.userStatus === 'SUSPENDED') {
                        setIsSuspended(true);
                        sessionStorage.setItem(MODAL_SHOWN_KEY, 'true');
                    } else {
                        setIsSuspended(false);
                    }
                }
            } catch (error) {
                console.error('사용자 상태 확인 실패:', error);
            } finally {
                setIsLoaded(true);
                // ✅ 로직 실행 후 플래그 삭제
                sessionStorage.removeItem(REFRESH_SUCCESS_KEY);
                sessionStorage.removeItem(INITIAL_LOGIN_KEY);
            }
        };

        checkUserStatus();
    }, []);

    return { isSuspended, isLoaded };
}
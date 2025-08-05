'use client';

import { useState, useEffect } from 'react';

const REFRESH_SUCCESS_KEY = 'refreshSucceeded';
const INITIAL_LOGIN_KEY = 'initialLoginSucceeded';
const MODAL_SHOWN_KEY = 'suspensionModalShown';

export function useUserStatusCheck(loginSuccessDetected: boolean) {
    const [isSuspended, setIsSuspended] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            if (typeof window === 'undefined') {
                setIsLoaded(true);
                return;
            }

            const initialLoginSucceeded = sessionStorage.getItem(INITIAL_LOGIN_KEY);
            const refreshSucceeded = sessionStorage.getItem(REFRESH_SUCCESS_KEY);
            const hasModalBeenShown = sessionStorage.getItem(MODAL_SHOWN_KEY);

            if ((initialLoginSucceeded || refreshSucceeded) && !hasModalBeenShown) {
                console.log('[useUserStatusCheck] 플래그 감지. 사용자 상태 확인 API 호출.');
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
                            console.log('[useUserStatusCheck] 정지된 회원 확인. 모달 상태 true로 설정.');
                        } else {
                            setIsSuspended(false);
                            console.log('[useUserStatusCheck] 정지된 회원이 아닙니다:', data.data.userStatus);
                        }
                    } else {
                        setIsSuspended(false);
                    }
                } catch (error) {
                    console.error('사용자 상태 확인 실패:', error);
                    setIsSuspended(false);
                } finally {
                    setIsLoaded(true);
                    sessionStorage.removeItem(INITIAL_LOGIN_KEY);
                    sessionStorage.removeItem(REFRESH_SUCCESS_KEY);
                }
            } else {
                setIsLoaded(true);
            }
        };

        checkStatus();

    }, [loginSuccessDetected]); // ✅ 의존성 배열에 props 추가

    return { isSuspended, isLoaded, setIsSuspended };
}
'use client';

import { useState, useEffect } from 'react';

const REFRESH_SUCCESS_KEY = 'refreshSucceeded';
const MODAL_SHOWN_KEY = 'suspensionModalShown';

export function useUserStatusCheck() {
    const [isSuspended, setIsSuspended] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const checkUserStatus = async () => {
            const refreshSucceeded = sessionStorage.getItem(REFRESH_SUCCESS_KEY);
            const hasModalBeenShown = sessionStorage.getItem(MODAL_SHOWN_KEY);

            if (!refreshSucceeded || hasModalBeenShown) {
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
                sessionStorage.removeItem(REFRESH_SUCCESS_KEY);
            }
        };

        checkUserStatus();
    }, []);

    return { isSuspended, isLoaded };
}
'use client';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const GOOGLE_LOGIN_URI = process.env.NEXT_PUBLIC_GOOGLE_SERVER_REDIRECT_URI || `${BACKEND_BASE_URL}/oauth2/authorization/google`;

async function refreshAccessToken(): Promise<boolean> {
    try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/bookbook/auth/refresh-token`, {
            method: 'POST',
            credentials: 'include',
        });

        if (response.ok) {
            console.log('토큰 갱신 성공: 새로운 토큰이 발급되어 브라우저 쿠키에 저장됨.');
            return true;
        } else {
            console.error('토큰 갱신 실패:', response.status, response.statusText);
            return false;
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('토큰 갱신 요청 중 네트워크 또는 예상치 못한 오류 발생:', error.message);
        } else {
            console.error('토큰 갱신 요청 중 알 수 없는 오류 발생:', error);
        }
        return false;
    }
}

export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const fullUrl = `${BACKEND_BASE_URL}${path}`;
    options.credentials = 'include';

    try {
        let response = await fetch(fullUrl, options);

        if (response.status === 401) {
            console.warn(`[authFetch] 액세스 토큰 만료 또는 유효하지 않음 (${path}). 토큰 갱신 시도...`);

            const refreshSuccessful = await refreshAccessToken();

            if (refreshSuccessful) {
                console.log('[authFetch] 토큰 갱신 성공! 원래 요청 재시도...');
                response = await fetch(fullUrl, options);
            } else {
                console.error('[authFetch] 리프레시 토큰 갱신마저 실패. 재로그인 필요.');
                alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                window.location.href = GOOGLE_LOGIN_URI;
                return response;
            }
        }
        return response;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`[authFetch] 네트워크 또는 예상치 못한 오류 발생 (${path}): ${error.message}`);
        } else {
            console.error(`[authFetch] 알 수 없는 오류 발생 (${path}):`, error);
        }
        throw error;
    }
}

export async function checkAuthStatus(): Promise<boolean> {
    try {
        const response = await authFetch('/api/v1/bookbook/users/isAuthenticated', {
            method: 'GET',
        });
        if (response.ok) {
            const rsData = await response.json();
            return rsData.data;
        }
        return false;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`인증 상태 확인 중 오류 발생: ${error.message}`);
        } else {
            console.error(`인증 상태 확인 중 알 수 없는 오류 발생:`, error);
        }
        return false;
    }
}

export async function logoutUser(): Promise<boolean> {
    try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/bookbook/users/logout`, {
            method: 'GET',
            credentials: 'include',
            redirect: 'manual'
        });

        if (response.type === 'opaqueredirect' || response.ok) {
            console.log('로그아웃 성공.');
            window.location.href = '/bookbook';
            return true;
        } else {
            console.error('로그아웃 실패:', response.status, response.statusText);
            return false;
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`로그아웃 처리 중 오류 발생: ${error.message}`);
        } else {
            console.error(`로그아웃 처리 중 알 수 없는 오류 발생:`, error);
        }
        return false;
    }
}
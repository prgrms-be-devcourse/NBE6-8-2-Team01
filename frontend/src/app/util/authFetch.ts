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

// openLoginModal 함수를 인자로 받도록 변경
export async function authFetch(
    path: string,
    options: RequestInit = {},
    openLoginModal?: () => void // ✅ 추가된 인자
): Promise<Response> {
    const fullUrl = `${BACKEND_BASE_URL}${path}`;
    options.credentials = 'include';
    options.headers = {
        "Content-Type": "application/json; charset=utf-8",
        ...(options.headers || {}),
    }

    try {
        let response = await fetch(fullUrl, options);

        if (response.status === 401) {
            console.warn(`[authFetch] 액세스 토큰 만료 또는 유효하지 않음 (${path}). 토큰 갱신 시도...`);

            const refreshSuccessful = await refreshAccessToken();

            if (refreshSuccessful) {
                console.log('[authFetch] 토큰 갱신 성공! 원래 요청 재시도...');
                sessionStorage.setItem('initialLoginSucceeded', 'true');
                response = await fetch(fullUrl, options);
            } else {
                console.error('[authFetch] 리프레시 토큰 갱신마저 실패. 재로그인 필요.');
                // alert() 대신 모달 사용
                if (openLoginModal) { // ✅ openLoginModal이 제공된 경우 모달 띄우기
                    openLoginModal();
                } else {
                    // 모달을 띄울 수 없는 환경(예: 서버 컴포넌트)이거나 openLoginModal이 전달되지 않은 경우 폴백
                    window.location.href = GOOGLE_LOGIN_URI;
                }
                return response; // 요청이 재시도되지 않고 모달이 띄워졌으므로 즉시 반환
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

// checkAuthStatus는 여전히 authFetch를 사용하지만, openLoginModal을 직접 전달하지 않습니다.
// checkAuthStatus를 호출하는 컴포넌트에서 authFetch를 직접 호출하고 openLoginModal을 전달하는 것이 더 일반적입니다.
export async function checkAuthStatus(): Promise<boolean> {
    try {
        // 이 checkAuthStatus는 주로 Header 컴포넌트에서 초기 로그인 상태를 확인할 때 사용됩니다.
        // openLoginModal을 여기서 직접 전달하는 대신, Header 컴포넌트에서 authFetch를 호출할 때 전달하도록 변경합니다.
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/bookbook/users/isAuthenticated`, {
            method: 'GET',
            credentials: 'include',
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
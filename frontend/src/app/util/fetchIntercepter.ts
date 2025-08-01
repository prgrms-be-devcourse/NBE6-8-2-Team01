export interface FetchRequestInit extends RequestInit {
    _retry?: boolean;
}

let globalOpenLoginModal: (() => void) | null = null;
export const setFetchInterceptorOpenLoginModal = (func: () => void) => {
    globalOpenLoginModal = func;
};

if (typeof window !== 'undefined') {
    const originalFetch = window.fetch;

    window.fetch = async function (input: RequestInfo | URL, init: FetchRequestInit = {}) {
        const newInit: FetchRequestInit = {
            ...init,
            credentials: 'include',
        };

        const response = await originalFetch(input, newInit);

        // 401 Unauthorized 에러 발생 시 토큰 갱신 시도
        if (response.status === 401 && !newInit._retry) {
            console.warn('[fetchInterceptor] 액세스 토큰 만료. 토큰 갱신 시도...');
            newInit._retry = true;

            try {
                const refreshResponse = await originalFetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/auth/refresh-token`,
                    newInit
                );

                if (refreshResponse.ok) {
                    console.log('[fetchInterceptor] 토큰 갱신 성공! 원래 요청 재시도...');
                    return originalFetch(input, newInit);
                } else {
                    // ✅ 토큰 갱신 요청 자체가 실패한 경우, 명확한 에러를 발생시켜 호출자에게 알립니다.
                    console.error('[fetchInterceptor] 리프레시 토큰 갱신 실패.');
                    if (globalOpenLoginModal) {
                        globalOpenLoginModal();
                    }
                    throw new Error('재로그인이 필요합니다.');
                }
            } catch (refreshError) {
                // ✅ 네트워크 오류 등 예상치 못한 에러 발생 시, 동일하게 처리합니다.
                console.error('[fetchInterceptor] 리프레시 토큰 갱신 중 네트워크 오류 발생.', refreshError);
                if (globalOpenLoginModal) {
                    globalOpenLoginModal();
                }
                throw new Error('재로그인이 필요합니다.');
            }
        }

        return response;
    };
}
interface FetchRequestInit extends RequestInit {
    _retry?: boolean;
}

// 원본 fetch 함수를 백업
const originalFetch = window.fetch;

let globalOpenLoginModal: (() => void) | null = null;
export const setFetchInterceptorOpenLoginModal = (func: () => void) => {
    globalOpenLoginModal = func;
};

// fetch를 덮어쓰는 함수
window.fetch = async function (input, init: FetchRequestInit = {}) {
    const newInit: FetchRequestInit = {
        ...init,
        credentials: 'include',
    };

    // 2. 원래 fetch 함수를 호출합니다.
    const response = await originalFetch(input, newInit);

    // 3. 응답 상태가 401 Unauthorized이고, 이미 재시도한 요청이 아니라면
    if (response.status === 401 && !newInit._retry) { // ✅ any 타입 캐스팅 제거
        console.warn('[fetchInterceptor] 액세스 토큰 만료. 토큰 갱신 시도...');
        newInit._retry = true; // 재시도 플래그 설정

        try {
            // 4. 리프레시 토큰 요청을 보냅니다.
            const refreshResponse = await originalFetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/auth/refresh-token`,
                newInit
            );

            if (refreshResponse.ok) {
                console.log('[fetchInterceptor] 토큰 갱신 성공! 원래 요청 재시도...');
                // 5. 토큰이 갱신된 후, 원래 요청을 다시 보냅니다.
                return originalFetch(input, newInit);
            }
        } catch (refreshError) {
            console.error('[fetchInterceptor] 리프레시 토큰 갱신 실패. 재로그인 필요.', refreshError);
            if (globalOpenLoginModal) {
                globalOpenLoginModal(); // 로그인 모달 띄우기
            }
            // 6. 리프레시 실패 시 에러를 반환합니다.
            return Promise.reject(refreshError);
        }
    }

    // 7. 401 에러가 아니면 원래 응답을 그대로 반환합니다.
    return response;
};
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const GOOGLE_LOGIN_URI = process.env.NEXT_PUBLIC_GOOGLE_SERVER_REDIRECT_URI || `${BACKEND_BASE_URL}/oauth2/authorization/google`;

// 1. axios 인스턴스 생성
const axiosInstance = axios.create({
    baseURL: BACKEND_BASE_URL,
    timeout: 10000,
    withCredentials: true,
});

// 2. openLoginModal 함수를 외부에서 주입받기 위한 변수 및 setter
let setGlobalOpenLoginModal: (() => void) | null = null;

export const setOpenLoginModalFunction = (func: () => void) => {
    setGlobalOpenLoginModal = func;
};

// 3. 요청 인터셉터: 모든 요청이 나가기 전에 실행
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // `withCredentials: true` 설정으로 쿠키는 자동으로 포함됩니다.
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// 4. 응답 인터셉터: 서버 응답이 들어온 후에 실행 (인증 로직의 핵심)
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // 401 Unauthorized 에러이고, 이미 재시도한 요청이 아니라면
        if (error.response && error.response.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            console.warn('[axiosInstance] 액세스 토큰 만료 또는 유효하지 않음. 토큰 갱신 시도...');

            try {
                const refreshResponse = await axiosInstance.post('/api/v1/bookbook/auth/refresh-token');

                if (refreshResponse.status === 200) {
                    console.log('[axiosInstance] 토큰 갱신 성공! 원래 요청 재시도...');
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError: unknown) {
                console.error('[axiosInstance] 리프레시 토큰 갱신마저 실패. 재로그인 필요.', (refreshError as AxiosError).response?.data || (refreshError as Error).message);

                if (setGlobalOpenLoginModal) {
                    setGlobalOpenLoginModal();
                } else {
                    window.location.href = GOOGLE_LOGIN_URI;
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
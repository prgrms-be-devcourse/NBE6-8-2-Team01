const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

type ApiResponse<T> = {
    resultCode: string;
    msg: string;
    data: T;
};

const apiClient = async <T>(
    endpoint: string,
    options?: RequestInit
): Promise<ApiResponse<T>> => {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options, // 외부에서 전달된 옵션을 먼저 적용
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        credentials: 'include',
    });


    const data = await response.json().catch(() => ({ msg: response.statusText || '응답을 파싱할 수 없습니다.' }));
    if (!response.ok) {
        throw new Error(data.msg || response.statusText || '알 수 없는 오류가 발생했습니다.');
    }
    return data;
};

export default apiClient;
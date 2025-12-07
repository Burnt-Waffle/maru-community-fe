import { API_BASE_URL } from "./config.js";

let accessToken = null;
let isRefreshing = false;
let refreshPromise = null;

// 인증 토큰을 포함하여 API 요청을 보내는 범용 fetch 함수
export const authFetch = async (endpoint, options = {}) => {
    const makeRequest = async (token) => {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        // 토큰이 있는 경우 Authorization 헤더 추가
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }

        return fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });
    };

    let response = await makeRequest(accessToken);

    // 응답이 실패했고 그 이유가 401 Unauthorized 이라면 access token 갱신 시도
    if (!response.ok && response.status === 401) {
        if (!isRefreshing) {
            isRefreshing = true;
            // 갱신 결과를 저장
            refreshPromise = refreshToken().finally(() => {
                isRefreshing = false;
                refreshPromise = null;
            });
        }

        try {
            // 진행 중인 갱신 작업이 끝나기를 기다림
            const newAccessToken = await refreshPromise;
            // 갱신된 토큰으로 원래 요청 재시도
            response = await makeRequest(newAccessToken);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: '재시도 요청 실패' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
        } catch (refreshError) {
            // refreshToken 함수 내부 또는 재시도 요청에서 에러 발생 시
            console.error("Refresh or retry failed:", refreshError);
            logoutUser();
            throw new Error('인증 갱신 또는 재시도에 실패했습니다. 다시 로그인해주세요.');
        }
    } else if (!response.ok) {
        // 401 외 다른 에러 처리
        const errorData = await response.json().catch(() => ({ message: '서버 에러 발생' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response;
};

export const logoutUser = async () => {
    try {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
    } catch (error) {
        console.error("Logout API call failed:", error);
    } finally {
        accessToken = null;
        window.location.href = '/public/pages/login/login.html';
    }
};

export const refreshToken = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token.');
            error.status = response.status;
            throw error;
        }

        const data = await response.json();

        // 새로운 AT를 인메모리에 저장
        setAccessToken(data.accessToken);
        return data.accessToken;

    } catch (error) {
        console.warn('Token refresh failed (expected if not logged in):', error.message);
        throw error;
    }
}

export const setAccessToken = (token) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

export const fetchCurrentUser = async () => {
    try {
        const response = await authFetch('/api/v1/users/me', {
            method: 'GET'
        });
        
        if (!response.ok) {
            return null;
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        return null;
    }
};
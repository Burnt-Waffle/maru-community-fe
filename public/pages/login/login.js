import { API_BASE_URL } from "../../../utils/config.js";
import { loadHeader } from "../../components/header/header.js";
import { setAccessToken, getAccessToken } from "../../../utils/authClient.js";
import { performSilentRefresh } from "../../../utils/silentRefresh.js";

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('id');
const passwordInput = document.getElementById('pw');
const helperText = document.getElementById('helper');
const signupLink = document.getElementById('signup-link');

// DOM이 완전히 로드된 후에 스크립트를 실행
document.addEventListener('DOMContentLoaded', async () => {
    if (getAccessToken()) {
        window.location.href = '/public/pages/post_list/post_list.html';
        return;
    }
    await loadHeader({ showProfileButton: false, showBackButton: false });
    signupLink.href = '/public/pages/terms/terms.html';
});

// 로그인 버튼의 이벤트 리스너
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // 입력된 이메일과 비밀번호 값 가져옴
    const email = emailInput.value;
    const password = passwordInput.value;

    // 비어있는지 확인
    if (!email) {
        helperText.textContent = '이메일을 입력해주세요.';
        emailInput.focus();
        return;
    }
    if (!password) {
        helperText.textContent = '비밀번호를 입력해주세요.';
        passwordInput.focus();
        return;
    }

    // 에러 메시지 초기화
    helperText.textContent = '';

    // 서버에 보낼 데이터
    const loginData = {
        email: email,
        password: password
    };

    // 서버에 로그인 요청
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            credentials: 'include', // refresh cookie를 받아오기 위해 필요
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData) // JSON 문자열로 변환하여 전송
        });

        if (response.ok) {
            // 로그인 성공 (HTTP 상태 코드가 200-299인 경우)
            const data = await response.json();

            setAccessToken(data.accessToken);

            // 로그인 성공 후 이동할 페이지 주소
            window.location.href = '/public/pages/post_list/post_list.html';

        } else {
            // 로그인 실패 (서버에서 에러 응답을 보낸 경우)
            const errorData = await response.json();
            helperText.textContent = errorData.message || '이메일 또는 비밀번호가 올바르지 않습니다.';
        }
    } catch (error) {
        // 네트워크 에러 등 fetch 요청 자체가 실패한 경우
        console.error('Login Error:', error);
        helperText.textContent = '로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
});
import { API_BASE_URL } from "../../../utils/config.js";
import { loadHeader } from "../../components/header/header.js";

const titleElement = document.getElementById('term-title');
const contentElement = document.getElementById('term-content');

document.addEventListener('DOMContentLoaded', async () => {
    await loadHeader({
        showBackButton: true,
        showProfileButton: false,
        backUrl: '/public/pages/terms/terms.html'
    });

    const urlParams = new URLSearchParams(window.location.search);
    const termId = urlParams.get('id');

    if (termId) {
        await loadTermDetail(termId);
    } else {
        alert('잘못된 접근입니다.');
        window.location.href = '/public/pages/terms/terms.html';
    }
});

const loadTermDetail = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/terms/${id}`);
        if (!response.ok) throw new Error('약관 정보를 불러오는데 실패했습니다.');

        const term = await response.json();

        titleElement.textContent = term.title;
        contentElement.textContent = term.content;
    } catch (error) {
        console.error(error);
        titleElement.textContent = '오류 발생';
        contentElement.textContent = '약관 내용을 불러올 수 없습니다.';
    }
};

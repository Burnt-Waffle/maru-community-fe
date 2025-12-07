import { logoutUser, fetchCurrentUser } from "../../../utils/authClient.js";
import { showConfirmModal, showInfoModal } from "../../components/layout/ui.js";

export const loadHeader = async (options = {}) => {
    const config = {
        showProfileButton: true,
        showBackButton: true,
        backurl: null,
        ...options
    };

    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) {
        return;
    }

    try {
        const response = await fetch('/public/components/header/header.html');
        if (!response.ok) {
            throw new Error(`HTTP error satus: ${response.status}`);
        }
        const headerHtml = await response.text();
        headerPlaceholder.innerHTML = headerHtml;

        const backButton = document.getElementById('back-button');
        const profileButton = document.getElementById('profile-button');
        const profileImgElement = document.getElementById('header-profile-img');
        const dropdownMenu = document.querySelector('.header-dropdown-menu')
        const logoutButton = document.getElementById('logout-button');
        
        // 뒤로가기 버튼 숨김
        if (!config.showBackButton && backButton) {
            backButton.classList.add('hidden');
        }
        
        // 프로필 아이콘 숨김
        if (!config.showProfileButton && profileButton) {
            profileButton.classList.add('hidden');
        } else if (profileButton && profileImgElement) {
            const userData = await fetchCurrentUser();
            if (userData && userData.profileImageUrl) {
                profileImgElement.src = userData.profileImageUrl;
            }
        }

        // 뒤로가기 버튼 설정
        if (backButton) {
            backButton.addEventListener('click', () => {
                if (config.backurl) {
                    window.location.href = config.backurl
                } else {
                    history.back();
                }
            });
        }

        // 프로필 이미지 버튼 설정
        if (profileButton && dropdownMenu) {
            profileButton.addEventListener('click', (event) => {
                event.stopPropagation();
                dropdownMenu.classList.toggle('is-active');
            });
        }

        // 로그아웃 버튼 설정
        if (logoutButton) {
            logoutButton.addEventListener('click', async (e) => {
                e.preventDefault();
                const userConfirm = await showConfirmModal('정말 로그아웃 하시겠습니까?');
                if (userConfirm) {
                    await showInfoModal('로그아웃이 완료되었습니다.');
                    logoutUser();
                }
            });
        }

        // 페이지 아무곳이나 클릭하면 드롭다운 메뉴 제거
        document.addEventListener('click', () => {
            if (dropdownMenu && dropdownMenu.classList.contains('is-active')) {
                dropdownMenu.classList.remove('is-active');
            }
        });

    } catch (error) {
        console.error('헤더를 불러오는 데 실패했습니다:', error);
        headerPlaceholder.textContent = '헤더를 불러올 수 없습니다.';
    }
}
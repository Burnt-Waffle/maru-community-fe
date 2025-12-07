import { authFetch, logoutUser } from "../../../utils/authClient.js";
import { API_BASE_URL, awsUploadUrl } from "../../../utils/config.js";
import { uploadImagesToS3 } from "../../../utils/imageFile.js";
import { fetchCurrentUser, deleteCurrentUser } from "../../../utils/userRequest.js";
import { validateNickname } from "../../../utils/validation.js";
import { loadHeader } from "../../components/header/header.js";
import { performSilentRefresh } from "../../../utils/silentRefresh.js";
import { showInfoModal, showConfirmModal, showToast } from "../../components/layout/ui.js";

const imagePreview = document.getElementById('profile-image-button');
const fileInput = document.getElementById('profile-image-upload');
const nicknameInput = document.getElementById('nickname');
const nicknameHelper = document.getElementById('nickname-helper');
const submitButton = document.getElementById('submit-button');
const deleteButton = document.getElementById('delete-account-button');

const MAX_PROFILE_FILE_SIZE = 5 * 1024 * 1024;

let selectedFile = null;

document.addEventListener('DOMContentLoaded', async () => {
    await performSilentRefresh();
    await loadHeader({ showProfileButton: true, showBackButton: true });
    await loadUserData();
    updateSubmitButtonState();
});

const loadUserData = async () => {
    try {
        const userData = await fetchCurrentUser();

        const emailDisplay = document.getElementById('user-email');
        if (emailDisplay) {
            emailDisplay.textContent = userData.email;
        }
        nicknameInput.value = userData.nickname;

        if (userData.profileImageUrl) {
            imagePreview.src = `${API_BASE_URL}${userData.profileImageUrl}`;
        } else {
            imagePreview.src = '/assets/profile-default.png'
        }
    } catch (error) {
        console.error('회원 정보 로드 실패:', error);
        showToast('회원 정보를 불러오는 데 실패했습니다.')
    }
}

// 프로필 미리보기 이미지를 누르면 fileInput을 누른 것으로 간주
imagePreview.addEventListener('click', () => {
    fileInput.click();
});

// 프로필 미리보기 이미지 교체
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {

        if (file.size > MAX_PROFILE_FILE_SIZE) {
            showToast(`프로필 사진의 용량은 ${MAX_PROFILE_FILE_SIZE / (1024 * 1024)}MB를 초과할 수 없습니다.`);
            fileInput.value = '';
            return;
        }

        selectedFile = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        // 취소를 누르면 다시 기본 이미지로 변경
        imagePreview.src = '/assets/profile-default.png';
        selectedFile = null;
    }
})

nicknameInput.addEventListener('blur', () => {
    const errorMessage = validateNickname(nicknameInput.value);
    nicknameHelper.textContent = errorMessage || '';
});

// 버튼 활성화
const updateSubmitButtonState = () => {
    submitButton.disabled = validateNickname(nicknameInput.value);
}

// 키보드 입력할 때마다 버튼 상태 업데이트
nicknameInput.addEventListener('input', updateSubmitButtonState);

// 수정하기 버튼 클릭
submitButton.addEventListener('click', async () => {
    const nicknameError = validateNickname(nicknameInput.value);
    if (nicknameError) {
        nicknameHelper.textContent = nicknameError;
        nicknameInput.focus();
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "수정 중...";

    const changeData = {
        nickname: nicknameInput.value,
    };

    try {
        let newProfileImageUrl = null;

        if (selectedFile) {
            const uploadedUrls = await uploadImagesToS3([selectedFile], awsUploadUrl);
            if (uploadedUrls && uploadedUrls.length > 0) {
                newProfileImageUrl = uploadedUrls[0];
            } else {
                throw new Error('이미지 업로드에 실패했습니다.');
            }
        }

        const changeData = {
            nickname: nicknameInput.value,
        };

        if (newProfileImageUrl) {
            changeData.profileImageUrl = newProfileImageUrl;
        }

        const response = await authFetch(`/api/v1/users/me`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(changeData)
        });
        if (response.ok) {
            await showInfoModal('회원정보수정 성공!');
            location.replace(location.href)
        } else {
            const errorData = await response.json();
            nicknameHelper.textContent = errorData.message;
        }
    } catch (error) {
        console.error('Change User Info Error:', error);
        nicknameHelper.textContent = error.message;
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "수정하기";
    };
});

deleteButton.addEventListener('click', async () => {
    const userConfirm = await showConfirmModal('정말로 회원 탈퇴를 진행하시겠습니까?');
    if (userConfirm) {
        try {
            const response = await deleteCurrentUser();
            await showInfoModal('회원 탈퇴가 완료되었습니다.');
            logoutUser();
        } catch (error) {
            console.error('Delete Account Error:', error);
            showToast(`회원 탈퇴 처리 중 문제가 발생했습니다. ${error.message}`);
        }
    }
});
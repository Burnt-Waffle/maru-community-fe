import { loadHeader } from "../../components/header/header.js";
import { fetchPost, updatePost } from "../../../utils/postRequest.js";
import { performSilentRefresh } from "../../../utils/silentRefresh.js";
import { showInfoModal, showToast } from "../../components/layout/ui.js";
import { uploadImagesToS3 } from "../../../utils/imageFile.js";
import { awsUploadUrl } from "../../../utils/config.js";

const form = document.getElementById('post-edit-form');
const titleInput = document.getElementById('post-title');
const contentInput = document.getElementById('post-content');
const imageInput = document.getElementById('post-images');
const previewContainer = document.getElementById('image-preview-container');
const submitButton = document.getElementById('submit-button');
const charCounter = document.getElementById('content-char-counter');

const MAX_POST_LENGTH = 10000;
const MAX_FILE_COUNT = 3;
const MAX_TOTAL_FILES_SIZE = 10 * 1024 * 1024;

let currentPostId = null;
let existingImageUrls = [];
let newFiles = [];

document.addEventListener('DOMContentLoaded' , async () => {
    await performSilentRefresh();
    await loadHeader({ showProfileButton: true, showBackButton: true });

    const urlParams = new URLSearchParams(window.location.search);
    currentPostId = urlParams.get('id');

    if (currentPostId) {
        await loadPostData(currentPostId);
    } else {
        await showInfoModal('잘못된 접근입니다.');
        window.location.replace('/public/pages/post_list/post_list.html');
    }

    updateSubmitButtonState();
})

const loadPostData = async(postId) => {
    try {
        const postData = await fetchPost(postId);

        titleInput.value = postData.title;
        contentInput.value = postData.content;

        if (postData.imageUrls && postData.imageUrls.length > 0) {
            existingImageUrls = postData.imageUrls;
            renderPreviews(); // 통합 렌더링 함수 호출
        }

        updateCharCounter();
        updateSubmitButtonState();
    } catch (error) {
        console.error('게시글 정보 로드 실패:', error);
        showToast('게시글 정보를 불러오는 데 실패했습니다.');
    }
}

imageInput.addEventListener('change', () => {
    const files = Array.from(imageInput.files);
     if (newFiles.length + files.length > MAX_FILE_COUNT) {
            showToast(`이미지는 최대 ${MAX_FILE_COUNT}장까지 첨부할 수 있습니다.`);
            imageInput.value = '';
            return;
        }
    
        const currentTotalSize = newFiles.reduce((acc, file) => acc + file.size, 0);
    
        const newFilesTotalSize = files.reduce((acc, file) => acc + file.size, 0);
    
        if (currentTotalSize + newFilesTotalSize > MAX_TOTAL_FILES_SIZE) {
            showToast(`총 업로드 용량은 ${MAX_TOTAL_FILES_SIZE / (1024 * 1024)}MB를 초과할 수 없습니다.`);
            imageInput.value = ''; 
            return; 
        }
    newFiles = [...newFiles, ...files];
    imageInput.value = '';
    renderPreviews();
    updateSubmitButtonState();
});

const renderPreviews = () => {
    previewContainer.innerHTML = '';

    existingImageUrls.forEach((url, index) => {
        createPreviewElement(url, index, 'existing');
    });

    newFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            createPreviewElement(e.target.result, index, 'new');
        };
        reader.readAsDataURL(file);
    });
}

const createPreviewElement = (src, index, type) => {
    const container = document.createElement('div');
    container.className = 'preview-item';

    const img = document.createElement('img');
    img.src = src;
    
    const btn = document.createElement('button');
    btn.className = 'delete-button';
    btn.innerHTML = '&#10005;'; // X 특수문자
    btn.type = 'button';

    // 삭제 버튼 클릭
    btn.onclick = () => {
        if (type === 'existing') {
            existingImageUrls.splice(index, 1);
        } else {
            newFiles.splice(index, 1);
        }
        renderPreviews();
        updateSubmitButtonState();
    };

    container.appendChild(img);
    container.appendChild(btn);
    previewContainer.appendChild(container);
};

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    submitButton.disabled = true;
    submitButton.textContent = '수정 중...';

    try {
        let newImageUrls = [];

        if (newFiles.length > 0) {
            newImageUrls = await uploadImagesToS3(newFiles, awsUploadUrl);
            if (!newImageUrls) throw new Error('새 이미지 업로드 실패');
        }

        const finalImageUrls = [...existingImageUrls, ...newImageUrls];

        const responseData = await updatePost(currentPostId, titleInput.value, contentInput.value, finalImageUrls);
        if (responseData && responseData.id) {
            await showInfoModal('게시글 수정 완료!')
            window.location.replace(`/public/pages/post_detail/post_detail.html?id=${responseData.id}`);
        } else {
            showToast(responseData.message || '게시글 수정에 실패했습니다.');
        }
    } catch (error) {
        console.error('게시글 수정 중 에러 발생:', error);
        showToast(`게시글 수정 중 오류가 발생했습니다. ${error.message}`);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = '작성 완료';
    }
});

const updateSubmitButtonState = () => {
    const title = titleInput.value.trim();
    const content = contentInput.value;

    updateCharCounter();

    if (title.length > 0 && content.trim().length > 0) {
        submitButton.disabled = false;
    } else {
        submitButton.disabled = true;
    }
};

const updateCharCounter = () => {
    const currentLength = contentInput.value.length;
    charCounter.textContent = `${currentLength} / ${MAX_POST_LENGTH}`;
}

titleInput.addEventListener('input', updateSubmitButtonState);
contentInput.addEventListener('input', updateSubmitButtonState);
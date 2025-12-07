import { loadHeader } from '../../components/header/header.js';
import { fetchPost, toggleLike, deletePost } from '../../../utils/postRequest.js';
import { fetchcomments, postComment, deleteComment, updateComment } from '../../../utils/commentRequest.js';
import { createPostElement } from '../../components/post/createPostElement.js';
import { createCommentElement } from '../../components/comment/createCommentElement.js';
import { performSilentRefresh } from '../../../utils/silentRefresh.js';
import { showConfirmModal, showInfoModal, showToast } from '../../components/layout/ui.js';

let nextPage = 0;
const pageSize = 10;
let isLastPage = false;
let isLoading = false;
let currentPostId = null;

let isEditingComment = false;
let editingCommentId = null;

const loadMoreButton = document.getElementById('load-more-button');
const commentInputBox = document.getElementById('comment-input-box');
const commentPostButton = document.getElementById('comment-button');
const charCounter = document.getElementById('char-counter');
const MAX_COMMENT_LENGTH = 2000;
const commentListContainer = document.getElementById('comment-list');

document.addEventListener('DOMContentLoaded', async () => {
    await performSilentRefresh();
    await loadHeader({
        showProfileButton: true,
        showBackButton: true,
        backUrl: '/public/pages/post_list/post_list.html'
    });
    const urlParams = new URLSearchParams(window.location.search);
    currentPostId = urlParams.get('id');
    if (currentPostId) {
        await loadPost(currentPostId);
        await loadComments(currentPostId);
    } else {
        console.error('Post ID not found in URL.')
        document.body.innerHTML = '<h1>게시물을 찾을 수 없습니다.</h1>'
    }
    loadMoreButton.addEventListener('click', () => loadComments(currentPostId));
    commentPostButton.addEventListener('click', () => handleSubmitComment(currentPostId));
    commentInputBox.addEventListener('input', updateCommentButtonState);
    updateCommentButtonState();
});

const loadPost = async (postId) => {
    const postPlaceholder = document.getElementById('post-placeholder');

    try {
        const postData = await fetchPost(postId);
        const postElement = createPostElement(postData);
        postPlaceholder.innerHTML = '';
        postPlaceholder.appendChild(postElement);

        const editButton = document.getElementById('edit');
        const deleteButton = document.getElementById('delete');

        if (editButton && deleteButton) {

            if (postData.author) {
                editButton.style.display = 'inline-block';
                deleteButton.style.display = 'inline-block';

                editButton.addEventListener('click', () => {
                    window.location.href = `/public/pages/post_edit/post_edit.html?id=${postId}`;
                });
                deleteButton.addEventListener('click', () => {
                    handleDeletePost(postId);
                });
            } else {
                editButton.style.display = 'none';
                deleteButton.style.display = 'none';
            }
        } else {
            console.error("수정 또는 삭제 버튼을 찾을 수 없습니다. HTML 구조나 선택자를 확인하세요.");
        }

        const likeButton = document.getElementById('like-button');
        if (likeButton) {
            likeButton.addEventListener('click', () => handleLikeClick(postId));
        }
    } catch (err) {
        console.error(err);
        document.getElementById('post-placeholder').innerHTML =
            '<p>게시물을 불러오는 중 오류가 발생했습니다.</p>';
    }
}

const loadComments = async (postId) => {
    if (isLoading || isLastPage) return;
    isLoading = true;

    try {
        const commentData = await fetchcomments(postId, { page: nextPage, size: pageSize });
        isLastPage = commentData.last;
        nextPage = commentData.number + 1;
        appendComments(commentData.content);

        if (isLastPage) {
            loadMoreButton.style.display = 'none';
        } else {
            loadMoreButton.style.display = 'inline-block';
        }

    } catch (error) {
        console.error('댓글 로딩 중 에러 발생', error);
    } finally {
        isLoading = false;
    }
};

const attachCommentEventListeners = (commentElement, commentData) => {
    const editButton = commentElement.querySelector('.comment-edit-button');
    const deleteButton = commentElement.querySelector('.comment-delete-button');

    if (editButton && deleteButton) {
        if (commentData.author) {
            editButton.style.display = 'inline-block';
            deleteButton.style.display = 'inline-block';

            editButton.addEventListener('click', () => {
                handleEditComment(commentData.id, commentData.content);
            });

            deleteButton.addEventListener('click', () => {
                handleDeleteComment(currentPostId, commentData.id);
            });
        } else {
            editButton.style.display = 'none';
            deleteButton.style.display = 'none';
        }
    }
};


const appendComments = (comments) => {
    comments.forEach(commentData => {
        const commentElement = createCommentElement(commentData);
        // [변경] 공통 함수 사용하여 이벤트 연결
        attachCommentEventListeners(commentElement, commentData);
        commentListContainer.appendChild(commentElement);
    });
};

const updateCommentButtonState = () => {
    const currentLength = commentInputBox.value.length;
    const contentTrimmed = commentInputBox.value.trim();

    charCounter.textContent = `${currentLength} / ${MAX_COMMENT_LENGTH}`;

    if (contentTrimmed.length === 0) {
        commentPostButton.disabled = true;
    } else {
        commentPostButton.disabled = false;
    }
};

const handleSubmitComment = async (postId) => {
    const content = commentInputBox.value;

    if (content.trim().length === 0) {
        showToast('댓글 내용을 입력해주세요.')
        return;
    }

    commentPostButton.disabled = true;
    const originalButtonText = commentPostButton.textContent;
    commentPostButton.textContent = isEditingComment ? '수정 중...' : '등록 중...'

    try {
        if (isEditingComment && editingCommentId) {
            const updatedData = await updateComment(postId, editingCommentId, content);
            const commentElement = document.querySelector(`.comment-container[data-comment-id="${editingCommentId}"]`);
            if (commentElement) {
                const contentDiv = commentElement.querySelector('.comment-content');
                if (contentDiv) {
                    contentDiv.textContent = content;
                }
                const newCommentElement = createCommentElement(updatedData);
                attachCommentEventListeners(newCommentElement, updatedData);
                commentElement.replaceWith(newCommentElement);
            }
            isEditingComment = false;
            editingCommentId = null;
            commentPostButton.textContent = '댓글 등록';
            showToast('댓글이 수정되었습니다.');

        } else {
            const newCommentData = await postComment(postId, content);
            const newCommentElement = createCommentElement(newCommentData);
            attachCommentEventListeners(newCommentElement, newCommentData);
            commentListContainer.prepend(newCommentElement);
            updateCommentCountDisplay(1);
        }

        commentInputBox.value = '';
        updateCommentButtonState();
    } catch (error) {
        console.error('댓글 등록 실패:', error);
        showToast(`댓글 등록에 실패했습니다. ${error.message}`);
        commentPostButton.textContent = originalButtonText;
    } finally {
        commentPostButton.textContent = isEditingComment ? '댓글 수정' : '댓글 등록';
        commentPostButton.disabled = false;
    }
};

const handleLikeClick = async (postId) => {
    try {
        const result = await toggleLike(postId);

        const likeCountElement = document.getElementById('like-count');
        const likeButton = document.getElementById('like-button');

        if (!likeButton || !likeCountElement) return;

        likeCountElement.textContent = `좋아요 ${result.likeCount}`;
        likeButton.classList.toggle('liked', result.isLikedByCurrentUser);
    } catch (error) {
        console.error('좋아요 처리 실패:', error);
        showToast(`좋아요 처리에 실패했습니다: ${error.message}`);
    }
};

const handleDeletePost = async (postId) => {
    const userConfirm = await showConfirmModal('정말로 이 게시글을 삭제하시겠습니까?');
    if (userConfirm) {
        try {
            await deletePost(postId);
            await showInfoModal('게시글이 삭제되었습니다.');
            window.location.href = '/public/pages/post_list/post_list.html';
        } catch (error) {
            console.error('게시글 삭제 실패:', error);
            showToast(`게시글 삭제에 실패했습니다: ${error.message}`);
        }
    }
};

const handleDeleteComment = async (postId, commentId) => {
    const userConfirm = await showConfirmModal('정말로 이 댓글을 삭제하시겠습니까?');
    if (userConfirm) {
        try {
            await deleteComment(postId, commentId);

            const commentElement = document.querySelector(`.comment-container[data-comment-id="${commentId}"]`);
            if (commentElement) {
                commentElement.style.opacity = '0';
                setTimeout(() => commentElement.remove(), 300);
            }
            updateCommentCountDisplay(-1);

            await showInfoModal('댓글이 삭제되었습니다.');
        } catch (error) {
            console.error('댓글 삭제 실패:', error);
            showToast(`댓글 삭제에 실패했습니다: ${error.message}`);
        }
    }
};

const handleEditComment = async (commentId, currentContent) => {
    isEditingComment = true;
    editingCommentId = commentId;

    commentInputBox.value = currentContent;
    commentInputBox.focus();
    commentPostButton.textContent = '댓글 수정';

    updateCommentButtonState();
}

// 댓글 수를 업데이트하는 헬퍼 함수
const updateCommentCountDisplay = (delta) => {
    const commentCountElement = document.querySelector('.post-detail-container .comments');
    if (commentCountElement) {
        let currentCount = parseInt(commentCountElement.textContent.replace('댓글수 ', '')) || 0;
        currentCount += delta;
        commentCountElement.textContent = `댓글수 ${currentCount}`;
    }
};
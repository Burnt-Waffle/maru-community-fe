import { API_BASE_URL } from "../../../utils/config.js";
import { formatDate, escapeHtml } from "../../../utils/function.js";

export const createCommentElement = ({ id, content, postId, authorNickname,
    authorProfileImageUrl, createdAt, updatedAt, author }) => {
    const container = document.createElement('div');
    container.className = 'comment-container';
    container.dataset.commentId = id;

    // 날짜 형태 맞춤
    const formattedDate = formatDate(createdAt);

    let profileImageUrl = '';
    if (authorProfileImageUrl) {
        profileImageUrl = `${API_BASE_URL}${authorProfileImageUrl}`
    } else {
        profileImageUrl = '/assests/profile-default.png'
    }

    container.innerHTML = `
        <img class="comment-profile-image" src="${escapeHtml(profileImageUrl)}" alt="${escapeHtml(authorNickname)} 프로필">
        <div class="comment-body">
            <div class="comment-info">
                <span class="comment-author">${escapeHtml(authorNickname)}</span>
                <span class="comment-date">${formattedDate}</span>
                <div class="comment-actions">
                    <button class="comment-edit-button">수정</button>
                    <button class="comment-delete-button">삭제</button>
                </div>
            </div>
            <div class="comment-content">${escapeHtml(content)}</div>
        </div>
    `

    return container;
}
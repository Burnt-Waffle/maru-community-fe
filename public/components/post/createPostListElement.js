import { API_BASE_URL } from "../../../utils/config.js";
import { formatDate, escapeHtml } from "../../../utils/function.js";

export const createPostListElement = ({ id, title, thumbnailUrl, authorNickname, authorProfileImageUrl, createdAt, updatedAt, viewCount, likeCount, commentCount }) => {
    const container = document.createElement('div');
    container.className = 'post-container';
    container.dataset.id = id;

    // 작성날짜 형태 맞춤
    const formattedDate = formatDate(createdAt);

    // 프로필 이미지 경로 조합
    let profileImageUrl = '';
    if(authorProfileImageUrl){
        profileImageUrl = `${API_BASE_URL}${authorProfileImageUrl}`
    } else {
        profileImageUrl = '/assests/profile-default.png'
    }

    container.innerHTML = `
        <h3 class="post-title">${escapeHtml(title)}</h3>
        <div class="post-meta">
            <div class="post-stats">
                <span>좋아요 ${likeCount}</span>
                <span>댓글 ${commentCount}</span>
                <span>조회수 ${viewCount}</span>
            </div>
            <span class="post-date">${formattedDate}</span>
        </div>
        <div class="author">
            <img class="author-profile-image" src="${escapeHtml(profileImageUrl)}" alt="프로필 이미지">
            <div class="author-nickname">${escapeHtml(authorNickname)}</div>
        </div>
    `;

    return container;
}

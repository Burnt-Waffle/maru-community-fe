import { formatDate, escapeHtml } from "../../../utils/function.js";

export const createPostElement = ({ id, title, content, thumbnailUrl, imageUrls, authorNickname, authorProfileImageUrl,
    createdAt, updatedAt, viewCount, likeCount, commentCount, author, likedByCurrentUser }) => {
    const container = document.createElement('div');
    container.className = 'post-detail-container';
    container.dataset.id = id;
    
    const formattedDate = formatDate(createdAt);

    let profileImageUrl = '';

    if(authorProfileImageUrl){
        profileImageUrl = `${authorProfileImageUrl}`;
    } else {
        profileImageUrl = '/assets/profile-default.png';
    }

    const imagesHtml = imageUrls.map(url => `<img src="${escapeHtml(url)}" alt="게시물 이미지" class="post-image-item">`).join('');

    const likedClass = likedByCurrentUser ? 'liked' : '';

    container.innerHTML = `
        <h3 class="post-title">${escapeHtml(title)}</h3>
                <div class="post-header">
                    <img class="author-profile-image" src="${escapeHtml(profileImageUrl)}" alt="프로필 이미지">
                    <div class="author">${escapeHtml(authorNickname)}</div>
                    <div class="post-date">${escapeHtml(formattedDate)}</div>
                    <div class="buttons">
                        <button class="post-manage-button" id="edit">수정</button>
                        <button class="post-manage-button" id="delete">삭제</button>
                    </div>
                </div>
                <div class="post-main">
                    <div class="post-image-container">${imagesHtml}</div>
                    <div class="post-content">${escapeHtml(content)}</div>
                    <div class="post-meta">
                        <button class="like-button ${likedClass}" id="like-button">
                            <span class="count" id="like-count">좋아요 ${likeCount}</span>
                        </button>
                        <div class="comments">댓글수 ${commentCount}</div>
                        <div class="views">조회수 ${viewCount}</div>
                    </div>
                </div>
    `;
    return container;
}
import { sendMessage } from './runtimeClient.js';
import { setStatus } from './ui.js';

const ids = {
    refresh: 'refreshFavoritePostsBtn',
    summary: 'favoritePostsSummary',
    list: 'favoritePostsList',
};

let favoriteItems = [];
let refreshPromise = null;

function getEl(id) {
    return document.getElementById(id);
}

function formatDateTime(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('zh-CN');
}

function appendFavoriteDate(card, item) {
    const parts = [];
    const postDate = formatDateTime(item.postDate);
    const favoritedAt = formatDateTime(item.favoritedAt);
    if (postDate) parts.push(`帖子日期：${postDate}`);
    if (favoritedAt) parts.push(`收藏日期：${favoritedAt}`);
    if (!parts.length) return;

    const date = document.createElement('p');
    date.className = 'favorite-post-date';
    date.textContent = parts.join(' · ');
    card.appendChild(date);
}

function renderFavorites() {
    const summary = getEl(ids.summary);
    const list = getEl(ids.list);
    if (!summary || !list) return;

    summary.className = 'info-box';
    summary.textContent = `共收藏 ${favoriteItems.length} 个论坛帖子。`;
    list.innerHTML = '';
    if (!favoriteItems.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = '暂无收藏。请在论坛 topics 页面点击“☆ 收藏”。';
        list.appendChild(empty);
        return;
    }

    const fragment = document.createDocumentFragment();
    favoriteItems.forEach((item) => {
        const card = document.createElement('article');
        card.className = 'favorite-post-card';
        card.dataset.postId = String(item.postId || '');

        const head = document.createElement('div');
        head.className = 'favorite-post-head';

        const title = document.createElement('a');
        title.className = 'favorite-post-title';
        title.href = String(item.postUrl || '');
        title.target = '_blank';
        title.rel = 'noopener noreferrer';
        title.textContent = String(item.title || `帖子 ${item.postId || ''}`);

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'favorite-post-remove';
        remove.dataset.action = 'remove-favorite';
        remove.dataset.postId = String(item.postId || '');
        remove.textContent = '取消收藏';
        remove.title = `取消收藏：${title.textContent}`;
        head.append(title, remove);

        const url = document.createElement('a');
        url.className = 'favorite-post-url';
        url.href = title.href;
        url.target = '_blank';
        url.rel = 'noopener noreferrer';
        url.textContent = title.href;
        url.title = title.href;

        card.append(head, url);
        appendFavoriteDate(card, item);
        fragment.appendChild(card);
    });
    list.appendChild(fragment);
}

async function refreshFavorites() {
    if (refreshPromise) return refreshPromise;
    const refreshButton = getEl(ids.refresh);
    if (refreshButton) refreshButton.disabled = true;
    refreshPromise = sendMessage('WQP_COMMUNITY_POST_FAVORITES_GET')
        .then((data) => {
            favoriteItems = Array.isArray(data?.items) ? data.items : [];
            renderFavorites();
        })
        .catch((error) => {
            const summary = getEl(ids.summary);
            if (summary) {
                summary.className = 'info-box error';
                summary.textContent = `收藏加载失败：${error.message}`;
            }
            throw error;
        })
        .finally(() => {
            refreshPromise = null;
            if (refreshButton) refreshButton.disabled = false;
        });
    return refreshPromise;
}

async function removeFavorite(postId, button) {
    const item = favoriteItems.find((entry) => String(entry.postId) === postId);
    if (!item) return;
    if (!confirm(`确定取消收藏“${item.title}”吗？`)) return;
    if (button) button.disabled = true;
    try {
        await sendMessage('WQP_COMMUNITY_POST_FAVORITE_SET', {
            postId,
            favorite: false,
        });
        favoriteItems = favoriteItems.filter((entry) => String(entry.postId) !== postId);
        renderFavorites();
        setStatus('已取消论坛帖子收藏。', 'success');
    } catch (error) {
        setStatus(`取消收藏失败：${error.message}`, 'error');
        if (button) button.disabled = false;
    }
}

export async function initFavoritePostsPanel() {
    const refreshButton = getEl(ids.refresh);
    const list = getEl(ids.list);
    refreshButton?.addEventListener('click', () => {
        refreshFavorites().catch(() => {});
    });
    list?.addEventListener('click', (event) => {
        const button = event.target?.closest?.('[data-action="remove-favorite"]');
        if (button) removeFavorite(button.dataset.postId, button);
    });
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.WQP_CommunityPostMarkers) {
            refreshFavorites().catch(() => {});
        }
    });
    await refreshFavorites();
}

import { initLoadMore, renderCard, escapeHtml, type PostMeta } from './loadMore';

const PAGE_SIZE = 12;

let postsCache: PostMeta[] | null = null;

async function getPosts(): Promise<PostMeta[]> {
  if (postsCache) return postsCache;
  const res = await fetch('/blog/posts.json');
  if (!res.ok) throw new Error(`加载文章失败：${res.status}`);
  postsCache = (await res.json()) as PostMeta[];
  return postsCache;
}

function getSiteName(): string {
  const section = document.getElementById('content-section');
  return section?.dataset.siteName ?? '';
}

function getCategoryFromUrl(pathname: string): string | null {
  if (pathname === '/blog/' || pathname === '/blog') return null;
  const m = pathname.match(/^\/category\/([^/]+)\/?$/);
  if (!m) return null;
  const slug = decodeURIComponent(m[1]);
  const link = document.querySelector<HTMLAnchorElement>(
    `[data-cat-link][href="/category/${slug}"]`,
  );
  return link?.dataset.catName ?? null;
}

function getIconForCategory(category: string | null): string {
  if (category === null) return '';
  const link = document.querySelector<HTMLAnchorElement>(
    `[data-cat-link][data-cat-name="${CSS.escape(category)}"]`,
  );
  return link?.dataset.catIcon ?? 'article';
}

function filterPosts(posts: PostMeta[], category: string | null): PostMeta[] {
  if (!category) return posts;
  return posts.filter((p) => p.categories.includes(category));
}

function renderHeader(opts: { category: string | null; icon: string; count: number }): string {
  if (opts.category === null) {
    return `
      <header class="mb-stack-lg stagger-item" style="--stagger-i: 0">
        <h1 class="font-headline text-headline-md font-bold mb-2">全部文章</h1>
        <p class="font-label text-label-md text-on-surface-variant">共 ${opts.count} 篇文章</p>
      </header>`;
  }
  return `
    <header class="mb-stack-lg stagger-item" style="--stagger-i: 0">
      <div class="flex items-center gap-3 mb-3">
        <span class="material-symbols-outlined text-[28px] text-tertiary-fixed-dim">${escapeHtml(opts.icon)}</span>
        <h1 class="font-headline text-headline-md font-bold">${escapeHtml(opts.category)}</h1>
      </div>
      <p class="font-label text-label-md text-on-surface-variant">共 ${opts.count} 篇文章</p>
    </header>`;
}

function renderLoadMore(remaining: number): string {
  if (remaining <= 0) return '';
  return `
    <div id="load-more-wrap" class="flex flex-col items-center gap-3 pt-stack-lg">
      <button
        id="load-more-btn"
        type="button"
        class="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-outline-variant font-label text-label-md text-on-surface hover:bg-surface-container-high transition-colors"
      >
        <span class="load-more-label">加载更多</span>
        <span class="material-symbols-outlined text-[18px] load-more-icon">expand_more</span>
        <span class="loading-spinner load-more-spinner hidden" style="--spinner-size:18px" role="status" aria-label="加载中">
          <span class="loading-spinner__dot" aria-hidden="true"></span>
          <span class="loading-spinner__dot" aria-hidden="true"></span>
          <span class="loading-spinner__dot" aria-hidden="true"></span>
        </span>
      </button>
      <p id="load-more-hint" class="font-label text-[12px] text-on-surface-variant/70">还有 ${remaining} 篇</p>
    </div>`;
}

const ACTIVE_LINK_CLASSES = ['bg-secondary-container', 'text-on-secondary-container'];
const INACTIVE_LINK_CLASSES = ['text-on-surface-variant', 'hover:bg-surface-container-high'];

function updateActive(category: string | null) {
  document.querySelectorAll<HTMLAnchorElement>('[data-cat-link]').forEach((a) => {
    const isActive =
      (category === null && a.dataset.catAll === '1') || a.dataset.catName === category;
    ACTIVE_LINK_CLASSES.forEach((c) => a.classList.toggle(c, isActive));
    INACTIVE_LINK_CLASSES.forEach((c) => a.classList.toggle(c, !isActive));
    const count = a.querySelector('.cat-count');
    count?.classList.toggle('text-on-secondary-container/70', isActive);
    count?.classList.toggle('text-on-surface-variant/60', !isActive);
  });
}

async function switchTo(category: string | null, url: string, pushState: boolean) {
  const headerEl = document.getElementById('content-header');
  const gridEl = document.getElementById('post-grid');
  const section = document.getElementById('content-section');
  if (!headerEl || !gridEl || !section) return;

  section.classList.add('content-switching');
  // 等待淡出完成
  await new Promise((r) => setTimeout(r, 150));

  let posts: PostMeta[];
  try {
    posts = await getPosts();
  } catch (err) {
    console.error(err);
    section.classList.remove('content-switching');
    return;
  }

  const filtered = filterPosts(posts, category);
  const total = filtered.length;
  const initial = filtered.slice(0, PAGE_SIZE);
  const remaining = Math.max(0, total - PAGE_SIZE);
  const icon = getIconForCategory(category);

  headerEl.innerHTML = renderHeader({ category, icon, count: total });
  gridEl.innerHTML = initial.map((p, i) => renderCard(p, i + 1)).join('');
  gridEl.dataset.total = String(total);
  if (category) {
    gridEl.dataset.category = category;
  } else {
    delete gridEl.dataset.category;
  }

  const existingWrap = document.getElementById('load-more-wrap');
  if (existingWrap) existingWrap.remove();
  if (remaining > 0) {
    gridEl.insertAdjacentHTML('afterend', renderLoadMore(remaining));
  }

  updateActive(category);

  initLoadMore({
    gridId: 'post-grid',
    btnId: 'load-more-btn',
    hintId: 'load-more-hint',
    total,
    initialCount: PAGE_SIZE,
    pageSize: PAGE_SIZE,
    filterCategory: category ?? undefined,
  });

  const siteName = getSiteName();
  if (siteName) {
    document.title = category ? `${category} | ${siteName}` : `全部文章 | ${siteName}`;
  }

  if (pushState) {
    history.pushState({ spa: true, category }, '', url);
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => section.classList.remove('content-switching'));
  });
}

function onClick(e: MouseEvent) {
  const target = (e.target as HTMLElement)?.closest<HTMLAnchorElement>('[data-cat-link]');
  if (!target) return;
  const href = target.getAttribute('href');
  if (!href) return;
  // 仅拦截同源分类/博客首页跳转
  if (href === '/' || href === '') return;
  // 已选中的标签再次点击：不操作
  if (target.classList.contains('bg-secondary-container')) {
    e.preventDefault();
    return;
  }
  e.preventDefault();
  const category = target.dataset.catAll === '1' ? null : (target.dataset.catName ?? null);
  switchTo(category, href, true);
}

function onPopState() {
  const category = getCategoryFromUrl(window.location.pathname);
  switchTo(category, window.location.pathname + window.location.search, false);
}

export function initCategoryNav() {
  if ((document.documentElement as HTMLElement).dataset.catNavBound === '1') return;
  (document.documentElement as HTMLElement).dataset.catNavBound = '1';
  // 用捕获阶段抢先于 Astro ClientRouter 的链接拦截，确保 preventDefault 生效
  document.addEventListener('click', onClick, true);
  window.addEventListener('popstate', onPopState);
}

declare global {
  interface History {
    state?: { spa?: boolean; category?: string | null };
  }
}

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  image: string | null;
  categories: string[];
  url: string;
  pubDate: string;
};

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderCard(
  post: PostMeta,
  staggerIndex: number,
  variant: 'initial' | 'incremental' = 'initial',
): string {
  const cats = post.categories.join(' · ');
  const coverInner = post.image
    ? `<img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" loading="lazy" class="absolute inset-0 block h-full w-full object-cover" />`
    : '';
  const coverPlaceholder = post.image ? '' : 'placeholder-cover';
  const staggerClass = variant === 'incremental' ? 'stagger-item-incremental' : 'stagger-item';
  return `
    <article
      class="group cursor-pointer ${staggerClass}"
      style="--stagger-i: ${staggerIndex}; view-transition-name: post-${escapeHtml(post.slug)}"
    >
      <a href="${escapeHtml(post.url)}" class="block">
        <div
          class="relative w-full aspect-video overflow-hidden mb-4 w-full rounded-xl border border-outline-variant ${coverPlaceholder}"
          style="view-transition-name: cover-${escapeHtml(post.slug)}"
        >
          ${coverInner}
        </div>
        <p class="font-label text-label-md text-secondary mb-2">
          ${escapeHtml(cats)} · ${escapeHtml(post.pubDate)}
        </p>
        <h3
          class="font-headline text-headline-sm mb-3 group-hover:text-on-primary-container transition-colors font-semibold"
          style="view-transition-name: title-${escapeHtml(post.slug)}"
        >
          ${escapeHtml(post.title)}
        </h3>
        <p class="font-body text-[16px] text-on-surface-variant line-clamp-3">${escapeHtml(post.description)}</p>
      </a>
    </article>`;
}

export interface LoadMoreOptions {
  gridId: string;
  btnId: string;
  hintId: string;
  total: number;
  initialCount: number;
  pageSize?: number;
  endpoint?: string;
  filterCategory?: string;
}

let cachedPosts: PostMeta[] | null = null;

async function fetchPosts(endpoint: string): Promise<PostMeta[]> {
  if (cachedPosts) return cachedPosts;
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`加载失败：${res.status}`);
  cachedPosts = (await res.json()) as PostMeta[];
  return cachedPosts;
}

export function initLoadMore(opts: LoadMoreOptions): void {
  const btn = document.getElementById(opts.btnId) as HTMLButtonElement | null;
  const grid = document.getElementById(opts.gridId);
  const hint = document.getElementById(opts.hintId);
  if (!btn || !grid) return;
  if (btn.dataset.bound === '1') return;
  btn.dataset.bound = '1';

  const pageSize = opts.pageSize ?? 12;
  const endpoint = opts.endpoint ?? '/blog/posts.json';
  const filterCategory = opts.filterCategory;

  let renderedCount = opts.initialCount;
  let loading = false;

  const labelEl = btn.querySelector('.load-more-label');
  const iconEl = btn.querySelector('.load-more-icon');
  const spinnerEl = btn.querySelector('.load-more-spinner');

  function setBusy(busy: boolean) {
    loading = busy;
    btn.disabled = busy;
    labelEl?.classList.toggle('hidden', busy);
    iconEl?.classList.toggle('hidden', busy);
    spinnerEl?.classList.toggle('hidden', !busy);
  }

  function updateHint() {
    const remaining = opts.total - renderedCount;
    if (!hint) return;
    if (remaining <= 0) {
      hint.textContent = '已全部加载完毕';
      // 用内联 display 而非 .hidden 类：按钮带 inline-flex，而 .hidden 在 CSS 中
      // 排在 .inline-flex 之前，类层叠会被 inline-flex 覆盖，导致按钮藏不掉。
      btn.style.display = 'none';
      btn.setAttribute('aria-hidden', 'true');
      btn.tabIndex = -1;
    } else {
      hint.textContent = `还有 ${remaining} 篇`;
      btn.style.display = '';
      btn.removeAttribute('aria-hidden');
      btn.tabIndex = 0;
    }
  }

  async function loadNext() {
    if (loading || renderedCount >= opts.total) return;
    setBusy(true);
    try {
      const all = await fetchPosts(endpoint);
      const filtered = filterCategory
        ? all.filter((p) => p.categories.includes(filterCategory))
        : all;
      const batch = filtered.slice(renderedCount, renderedCount + pageSize);
      const frag = document.createElement('div');
      frag.innerHTML = batch
        .map((p, i) => renderCard(p, i, 'incremental'))
        .join('');
      Array.from(frag.children).forEach((node) => grid.appendChild(node));
      renderedCount += batch.length;
      updateHint();
    } catch (err) {
      console.error(err);
      if (labelEl) labelEl.textContent = '加载失败，点击重试';
    } finally {
      setBusy(false);
    }
  }

  btn.addEventListener('click', loadNext);
  updateHint();
}

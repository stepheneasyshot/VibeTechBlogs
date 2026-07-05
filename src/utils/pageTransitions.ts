export type PageKind = 'list' | 'post' | 'category' | 'static';

export interface TransitionAnimation {
  name: string;
  delay?: number | string;
  duration?: number | string;
  easing?: string;
  fillMode?: string;
}

export interface TransitionAnimationPair {
  old: TransitionAnimation;
  new: TransitionAnimation;
}

export interface PageTransition {
  forwards: TransitionAnimationPair;
  backwards: TransitionAnimationPair;
}

const easeOut = 'cubic-bezier(0.22, 1, 0.36, 1)';
const easeIn = 'cubic-bezier(0.4, 0, 1, 1)';

/** 首页 / 博客列表 — 离开时有轻微上移，返回时柔和淡入 */
export const listTransition: PageTransition = {
  forwards: {
    old: {
      name: 'page-list-out',
      duration: '0.2s',
      easing: easeIn,
      fillMode: 'forwards',
    },
    new: {
      name: 'page-fade-in',
      duration: '0.32s',
      easing: easeOut,
      delay: '0.04s',
    },
  },
  backwards: {
    old: {
      name: 'page-fade-out',
      duration: '0.2s',
      easing: easeIn,
      fillMode: 'forwards',
    },
    new: {
      name: 'page-list-return',
      duration: '0.3s',
      easing: easeOut,
    },
  },
};

/** 文章页 — 进入时延迟淡入，让封面/标题共享过渡更突出 */
export const postTransition: PageTransition = {
  forwards: {
    old: {
      name: 'page-post-shell-out',
      duration: '0.18s',
      easing: easeIn,
      fillMode: 'forwards',
    },
    new: {
      name: 'page-post-in',
      duration: '0.28s',
      easing: easeOut,
      delay: '0.06s',
    },
  },
  backwards: {
    old: {
      name: 'page-post-exit',
      duration: '0.22s',
      easing: easeIn,
      fillMode: 'forwards',
    },
    new: {
      name: 'page-fade-in',
      duration: '0.28s',
      easing: easeOut,
    },
  },
};

/** 分类页 — 轻微缩放 crossfade，强调网格切换 */
export const categoryTransition: PageTransition = {
  forwards: {
    old: {
      name: 'page-category-out',
      duration: '0.22s',
      easing: easeIn,
      fillMode: 'forwards',
    },
    new: {
      name: 'page-category-in',
      duration: '0.3s',
      easing: easeOut,
      delay: '0.02s',
    },
  },
  backwards: {
    old: {
      name: 'page-category-out',
      duration: '0.2s',
      easing: easeIn,
      fillMode: 'forwards',
    },
    new: {
      name: 'page-category-in',
      duration: '0.28s',
      easing: easeOut,
    },
  },
};

/** 关于 / 链接 — 横向 slide */
export const staticTransition: PageTransition = {
  forwards: {
    old: {
      name: 'page-slide-out-left',
      duration: '0.24s',
      easing: easeIn,
      fillMode: 'forwards',
    },
    new: {
      name: 'page-slide-in-right',
      duration: '0.32s',
      easing: easeOut,
      delay: '0.02s',
    },
  },
  backwards: {
    old: {
      name: 'page-slide-out-right',
      duration: '0.24s',
      easing: easeIn,
      fillMode: 'forwards',
    },
    new: {
      name: 'page-slide-in-left',
      duration: '0.32s',
      easing: easeOut,
    },
  },
};

export function getPageKind(pathname: string): PageKind {
  if (/^\/blog\/[^/]+\/?$/.test(pathname)) return 'post';
  if (pathname.startsWith('/category/')) return 'category';
  if (pathname === '/about' || pathname === '/about/') {
    return 'static';
  }
  return 'list';
}

export function getTransitionPairLabel(from: PageKind, to: PageKind, direction: 'forward' | 'back'): string {
  return `${direction}:${from}->${to}`;
}

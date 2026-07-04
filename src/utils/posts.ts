import { getCollection, type CollectionEntry } from 'astro:content';
import readingTime from 'reading-time';

export type BlogEntry = CollectionEntry<'blog'>;

export async function getPublishedPosts(): Promise<BlogEntry[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
}

export function getPostSlug(post: BlogEntry): string {
  return post.id.replace(/\.mdx?$/, '');
}

export function getPostUrl(post: BlogEntry): string {
  return `/blog/${getPostSlug(post)}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function getReadingTime(body: string): string {
  const stats = readingTime(body, { wordsPerMinute: 400 });
  const minutes = Math.ceil(stats.minutes);
  return `${minutes} 分钟阅读`;
}

export function getCategories(posts: BlogEntry[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    const cat = post.data.category;
    counts.set(cat, (counts.get(cat) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function filterByCategory(
  posts: BlogEntry[],
  category: string | null,
): BlogEntry[] {
  if (!category) return posts;
  return posts.filter((p) => p.data.category === category);
}

export function getCategoryUrl(category: string): string {
  return `/category/${encodeURIComponent(category)}`;
}

export function getFeaturedPost(posts: BlogEntry[]): BlogEntry | undefined {
  return posts.find((p) => p.data.featured) ?? posts[0];
}

export function getNonFeaturedPosts(
  posts: BlogEntry[],
  featured?: BlogEntry,
): BlogEntry[] {
  if (!featured) return posts;
  return posts.filter((p) => p.id !== featured.id);
}

export interface TocHeading {
  depth: number;
  slug: string;
  text: string;
}

export function extractHeadings(html: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const regex = /<h([2-3])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    headings.push({
      depth: Number(match[1]),
      slug: match[2],
      text: match[3].replace(/<[^>]+>/g, ''),
    });
  }
  return headings;
}

import type { APIRoute } from 'astro';
import {
  getPublishedPosts,
  getPostSlug,
  getPostUrl,
  getPostCategories,
  formatDate,
} from '../../utils/posts';

export const prerender = true;

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();

  const payload = posts.map((post) => {
    const slug = getPostSlug(post);
    return {
      slug,
      title: post.data.title,
      description: post.data.description,
      image: post.data.image ?? null,
      categories: getPostCategories(post),
      url: getPostUrl(post),
      pubDate: formatDate(post.data.pubDate),
    };
  });

  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

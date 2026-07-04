import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '../data/site';
import { getPublishedPosts, getPostUrl } from '../utils/posts';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();

  return rss({
    title: site.title,
    description: site.description,
    site: context.site ?? site.url,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: getPostUrl(post),
    })),
    customData: `<language>zh-CN</language>`,
  });
}

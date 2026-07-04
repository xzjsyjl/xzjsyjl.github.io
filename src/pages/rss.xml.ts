import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: { site: URL | string }) {
    const posts = await getCollection('blog');
    const sortedPosts = posts.sort(
        (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
    );

    return rss({
        title: 'PSQ',
        description: '关于代码、数学与生活的技术文章',
        site: context.site || 'http://localhost:4321',
        items: sortedPosts.map((post) => ({
            title: post.data.title,
            pubDate: post.data.pubDate,
            description: post.data.description,
            link: `/blog/${post.id}/`,
            categories: post.data.tags,
        })),
        customData: '<language>zh-CN</language>',
    });
}

import type { MarkdownInstance } from 'astro';
const files = import.meta.glob<MarkdownInstance<Record<string, unknown>>>('../content/after-joining/*/*.md', { eager: true });
export const afterJoiningDocs: Record<string, MarkdownInstance<Record<string, unknown>>> = {};
for (const [file, doc] of Object.entries(files)) {
  const slug = file.split('/').at(-1)!.replace(/\.md$/, '');
  if (afterJoiningDocs[slug]) throw new Error(`Duplicate after-joining lesson: ${slug}`);
  afterJoiningDocs[slug] = doc;
}
export const isAfterJoiningPublished = (slug?: string) => Boolean(slug && afterJoiningDocs[slug]);
export const afterJoiningProgressId = (slug: string) => `after-joining/${slug}`;
export const publishedAfterJoiningSlugs = Object.keys(afterJoiningDocs);

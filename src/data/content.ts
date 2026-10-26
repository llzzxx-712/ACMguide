import type { MarkdownInstance } from 'astro';

const files = import.meta.glob<MarkdownInstance<Record<string, unknown>>>('../content/*/*.md', { eager: true });
export const lessonDocs: Record<string, MarkdownInstance<Record<string, unknown>>> = {};
for (const [file, doc] of Object.entries(files)) {
  const slug = file.split('/').at(-1)!.replace(/\.md$/, '');
  if (lessonDocs[slug]) throw new Error(`Duplicate lesson slug: ${slug}`);
  lessonDocs[slug] = doc;
}
export const isPublished = (slug: string) => Boolean(lessonDocs[slug]);
export const publishedLessonSlugs = Object.keys(lessonDocs);

import type { APIRoute, MarkdownInstance } from 'astro';
import { lessons, href } from '../data/course';
export const GET: APIRoute = async () => {
  const content=import.meta.glob<MarkdownInstance<Record<string,unknown>>>('../content/language/*.md',{eager:true});
  const items=lessons.map(item=>({title:item.title,url:href(`learn/${item.slug}/`),description:item.summary,planned:item.chapter.id>1,text:content[`../content/language/${item.slug}.md`]?.rawContent() || item.topics?.join(' ') || ''}));
  items.unshift({title:'前言 · 写给刚入学的你',url:href(),description:'认识 ACM，了解竞赛、学习收益和课程范围。',planned:false,text:'ACM ICPC 课程 就业 考研 保研 综测 奖学金'},{title:'30 天学习路线',url:href('roadmap/'),description:'完整日程与新生组、提高组目标。',planned:false,text:'一个月 计划 第一天 新生组 提高组 800 1500 1800'});
  return new Response(JSON.stringify(items),{headers:{'Content-Type':'application/json; charset=utf-8'}});
};

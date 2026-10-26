import type { APIRoute, MarkdownInstance } from 'astro';
import { lessons, href } from '../data/course';
export const GET: APIRoute = async () => {
  const content=import.meta.glob<MarkdownInstance<Record<string,unknown>>>('../content/language/*.md',{eager:true});
  const items=lessons.map(item=>({title:item.title,url:href(`learn/${item.slug}/`),description:item.summary,planned:item.chapter.id>1,text:content[`../content/language/${item.slug}.md`]?.rawContent() || item.topics?.join(' ') || ''}));
  items.unshift({title:'前言 · 写给刚入学的你',url:href(),description:'认识 ACM，了解竞赛、学习收益和课程范围。',planned:false,text:'ACM ICPC 课程 就业 考研 保研 综测 奖学金'},{title:'更多学习方式/渠道',url:`${href()}#learning-channels`,description:'AI 伴学、DeepSeek 网页版与提示词，以及搜索、百科、书籍、OJ 和交流渠道。',planned:false,text:'AI DeepSeek Harness WorkBuddy 人工智能 伴学 讲解 测验 提示词 搜索引擎 OI Wiki 信息学奥赛一本通 深入浅出程序设计竞赛 挑战程序设计竞赛 洛谷 Codeforces 学长学姐 视频 网课'},{title:'30 天学习路线',url:href('roadmap/'),description:'完整日程与新生组练习目标。',planned:false,text:'一个月 计划 第一天 新生组 800 1500'});
  return new Response(JSON.stringify(items),{headers:{'Content-Type':'application/json; charset=utf-8'}});
};

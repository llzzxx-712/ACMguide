import type { APIRoute } from 'astro';
import { lessons, href } from '../data/course';
import { lessonDocs, isPublished } from '../data/content';
import { afterJoiningChapters, afterJoiningChapterPath } from '../data/after-joining';
export const GET: APIRoute = async () => {
  const items=lessons.map(item=>({title:item.title,url:href(`learn/${item.slug}/`),description:item.summary,planned:!isPublished(item.slug),text:lessonDocs[item.slug]?.rawContent() || item.topics?.join(' ') || ''}));
  items.push({title:'结语 · 恭喜完成 31 天的学习',url:href('summary/'),description:'回顾语言、算法、数学、DP 与博弈，选择洛谷对应题单继续巩固。',planned:false,text:'总结 结语 恭喜 完成 31天 巩固 复习 洛谷 题单 继续练习'});
  items.push({title:'入队后—寒假前 · 章节大纲',url:href('after-joining/'),description:'第二板块：二叉树、集合、图论基础与进阶算法、数据结构、动态规划、数学。',planned:false,text:'第二板块 入队 寒假 大纲 进阶篇 提高篇'});
  items.push(...afterJoiningChapters.map(chapter => ({title:`入队后 · ${chapter.id}. ${chapter.title}`,url:href(afterJoiningChapterPath(chapter.slug)),description:chapter.summary,planned:true,text:chapter.sections.join(' ')})));
  items.unshift({title:'前言 · 写给刚入学的你',url:href(),description:'认识 ACM，了解竞赛、学习收益和课程范围。',planned:false,text:'ACM ICPC 课程 就业 考研 保研 综测 奖学金'},{title:'更多学习方式/渠道',url:`${href()}#learning-channels`,description:'AI 伴学、DeepSeek 网页版与提示词，以及搜索、百科、书籍、OJ 和交流渠道。',planned:false,text:'AI DeepSeek Harness WorkBuddy 人工智能 伴学 讲解 测验 提示词 搜索引擎 OI Wiki 信息学奥赛一本通 深入浅出程序设计竞赛 挑战程序设计竞赛 洛谷 Codeforces 学长学姐 视频 网课'},{title:'31 天学习路线',url:href('roadmap/'),description:'完整日程与新生组练习目标。',planned:false,text:'一个月 31天 计划 第一天 新生组 800 1500 背包 两天'});
  return new Response(JSON.stringify(items),{headers:{'Content-Type':'application/json; charset=utf-8'}});
};

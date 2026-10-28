import {buildTrace,modes} from './trace.mjs';
import {graphSvg,escape,palette} from './svg.mjs';
const $=s=>document.querySelector(s),demo=document.body.dataset.demo;
let trace,index=0,playing=false,timer;
const groupColors=['#e9f3fb','#e3f2ea','#f4eafb','#fff0d7','#fce7e5'];
const specials={bst:[['compare','看大小比较'],['attach','看接回父亲']],traversal:[['skip','看跳过重复点']],dijkstra:[['stale','看过期堆记录']],bellman:[['round','看一轮扫描']],floyd:[['relax','看经过中间点更新']],mst:[['reject','看成环跳过']],lowlink:[['back','看绕回早期点'],['bridge','看判断桥']],tarjan:[['return','看调用返回'],['pop','看分量弹栈']]};
const legends={bst:[['#b27712','当前比较的点'],['#087e6d','已经走过的路径'],['#337aab','尚未返回的调用'],['#91aaba','∅ 是空位置']],traversal:[['#b27712','当前点或边'],['#087e6d','已经输出'],['#337aab','等待处理']],dijkstra:[['#b27712','当前点或边'],['#087e6d','距离已经确定']],bellman:[['#b27712','正在检查的边及两端']],floyd:[['#b27712','当前中间点 / 路线上的点'],['#087e6d','比较中的两段路线']],mst:[['#b27712','正在检查'],['#087e6d','已选树边 / 树内点'],['#b54540','成环跳过的边']],lowlink:[['#b27712','正在处理'],['#087e6d','DFS 树边'],['#5479b5','非树绕行边'],['#b54540','已经确认的桥']],tarjan:[['#b27712','当前调用或边'],['#087e6d','DFS 树边'],['#5479b5','同色结点已归入同一组']]};
function pause(){playing=false;clearTimeout(timer);$('#play').textContent='播放';}
function draw(){
    const f=trace.frames[index];$('#demo').dataset.step=index;$('#demo').dataset.event=f.event;
    $('#slider').value=index;$('#step-count').textContent=`${index+1} / ${trace.frames.length}`;
    $('#previous').disabled=index===0;$('#next').disabled=index===trace.frames.length-1;
    $('#note').textContent=f.note;
    $('#panels').innerHTML=f.panels.map(([label,text])=>`<section class="panel"><strong>${escape(label)}</strong><p>${escape(text)}</p></section>`).join('');
    $('#rows').innerHTML=f.rows.map(row=>`<tr class="${f.active.includes(row[0])?'active-row':''}">${row.map(x=>`<td>${escape(x)}</td>`).join('')}</tr>`).join('');
    const svg=$('#graph svg');
    for(const n of trace.graph.nodes){const el=svg.querySelector('#node-'+n.id),circle=el.querySelector('circle'),text=el.querySelector('text'),group=f.groups?.[n.id];
        text.textContent=f.labels?.[n.id]??n.label;
        const active=f.active.includes(n.id),done=f.done.includes(n.id),queued=f.frontier.includes(n.id),empty=text.textContent==='∅';
        circle.style.fill=active?'#fff0cc':group?groupColors[group%groupColors.length]:done?'#e0f2e9':queued?'#e1effa':empty?'#f1f5f8':'#fff';
        circle.style.stroke=active?palette.active:done?palette.chosen:queued?'#337aab':'#91aaba';circle.style.strokeDasharray=empty?'5 4':'';
    }
    for(const e of trace.graph.edges){const el=svg.querySelector('#edge-'+e.id),bridge=f.bridges?.includes(e.id),rejected=f.rejected.includes(e.id),active=f.edge===e.id;
        el.style.stroke=bridge?palette.bridge:active?palette.active:f.chosen.includes(e.id)?palette.chosen:f.back?.includes(e.id)?palette.back:rejected?palette.bridge:palette.plain;
        el.style.strokeWidth=active||bridge?'4.5':'3';
        const emptyEnd=svg.querySelector('#node-'+e.to+' text')?.textContent==='∅';el.style.strokeDasharray=rejected||emptyEnd?'7 5':'';
        el.style.opacity=f.hiddenEdges?.includes(e.id)?'0':'1';
    }
    document.querySelectorAll('.code div').forEach(el=>el.classList.toggle('current',el.dataset.line===f.line));
    if(index===trace.frames.length-1)pause();
}
function load(){
    pause();index=0;trace=buildTrace(demo,$('#mode').value);$('#title').textContent=trace.title;document.title=trace.title;
    $('#intro').textContent=trace.intro;$('#graph').innerHTML=graphSvg(trace.graph,{id:'live'});
    $('.legend').innerHTML=legends[demo].map(([color,label])=>`<span style="--dot:${color}">${escape(label)}</span>`).join('');
    $('#head').innerHTML='<tr>'+trace.columns.map(x=>`<th>${escape(x)}</th>`).join('')+'</tr>';
    $('#code').innerHTML=trace.code.map(([id,text])=>`<div data-line="${id}">${escape(text)}</div>`).join('');
    $('#slider').max=trace.frames.length-1;
    $('#checkpoints').innerHTML=(specials[demo]||[]).map(([event,label])=>{const step=trace.frames.findIndex(f=>f.event===event);return step<0?'':`<button data-jump="${step}">${escape(label)}</button>`;}).join('')+`<button data-jump="${trace.frames.length-1}">看结束</button>`;
    $('#checkpoints').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>seek(Number(b.dataset.jump))));draw();
}
function seek(step){pause();index=Math.max(0,Math.min(trace.frames.length-1,step));draw();}
function tick(){clearTimeout(timer);if(!playing)return;timer=setTimeout(()=>{if(index<trace.frames.length-1){index++;draw();}if(playing)tick();},1800/Number($('#speed').value));}
$('#mode').innerHTML=modes[demo].map(([id,label])=>`<option value="${id}">${escape(label)}</option>`).join('');
$('#mode').addEventListener('change',load);$('#previous').addEventListener('click',()=>seek(index-1));$('#next').addEventListener('click',()=>seek(index+1));$('#restart').addEventListener('click',()=>seek(0));$('#slider').addEventListener('input',()=>seek(Number($('#slider').value)));
$('#play').addEventListener('click',()=>{if(playing){pause();return;}if(index===trace.frames.length-1){index=0;draw();}playing=true;$('#play').textContent='暂停';tick();});$('#speed').addEventListener('change',tick);
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('pagehide',pause);
// Same-origin lesson embeds follow the reader's chosen light/dark theme.
try {const root=parent.document.documentElement;const sync=()=>document.body.classList.toggle('dark',root.classList.contains('dark'));sync();new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']});}catch{}
load();

// One source of truth for values, selected-item counts and stage labels in the animation.
export const presets = {
    single: {name:'一株药的反例', capacity:4, items:[{name:'A',weight:2,value:3}]},
    lesson: {name:'教程中的三株药', capacity:4, items:[
        {name:'A',weight:3,value:5}, {name:'B',weight:2,value:3}, {name:'C',weight:2,value:3}
    ]}
};
const clone = value => JSON.parse(JSON.stringify(value));
const describe = (counts,items) => counts.map((count,index)=>count ? items[index].name+'×'+count : '').filter(Boolean).join(' + ') || '空选法';

export function buildTrace(preset='single',mode='two') {
    if(!presets[preset] || !['two','descending','ascending'].includes(mode)) throw new Error('Unknown knapsack configuration');
    const config=presets[preset],{items,capacity}=config;
    const matrix=Array.from({length:items.length+1},(_,r)=>Array(capacity+1).fill(r===0 ? 0 : null));
    const matrixPicks=Array.from({length:items.length+1},()=>Array.from({length:capacity+1},()=>Array(items.length).fill(0)));
    const values=Array(capacity+1).fill(0),picks=Array.from({length:capacity+1},()=>Array(items.length).fill(0));
    let updated=Array(capacity+1).fill(false),before=[...values];
    const frames=[];
    const emit=(event,i,j,extra={})=>frames.push(clone({event,i,j,mode,matrix,values,picks,updated,before,
        notake:null,take:null,source:null,result:null,resultPicks:null,reused:false,
        note:'',line:'item',...extra}));
    emit('init',0,null,{line:'',note:'容量表示“至多使用”，允许不选。初始没有物品，每个容量上限的最优价值都是 0。'});
    for(let i=1;i<=items.length;i++) {
        const item=items[i-1];
        updated=Array(capacity+1).fill(false);
        before=mode==='two' ? [...matrix[i-1]] : [...values];
        emit('prepare',i,null,{note:'开始处理第 '+i+' 株 '+item.name+'：耗时 '+item.weight+'，价值 '+item.value+'。'+
            (mode==='two' ? '当前行只从上一行读取。' : '灰色格子先代表上一轮；本轮写过的格子会标成绿色。')});
        const order=mode==='two' ? Array.from({length:capacity+1},(_,j)=>j)
            : Array.from({length:Math.max(0,capacity-item.weight+1)},(_,j)=>mode==='descending' ? capacity-j : item.weight+j);
        for(const j of order) {
            const notake={value:mode==='two' ? matrix[i-1][j] : values[j],
                counts:[...(mode==='two' ? matrixPicks[i-1][j] : picks[j])]};
            let best=notake.value,bestPicks=[...notake.counts],take=null,source=null;
            if(mode==='two') {
                matrix[i][j]=notake.value;
                matrixPicks[i][j]=[...notake.counts];
                emit('copy',i,j,{line:'copy',notake,
                    note:'先不选 '+item.name+'，把上一行 f['+(i-1)+']['+j+']='+notake.value+' 作为当前答案。'});
            }
            if(j>=item.weight) {
                const col=j-item.weight;
                source={row:mode==='two' ? i-1 : null,col,
                    value:mode==='two' ? matrix[i-1][col] : values[col],
                    counts:[...(mode==='two' ? matrixPicks[i-1][col] : picks[col])],
                    stage:mode!=='two' && updated[col] ? 'current' : 'previous'};
                const counts=[...source.counts];counts[i-1]++;
                take={value:source.value+item.value,counts};
                if(take.value>best) {best=take.value;bestPicks=[...take.counts];}
                const reused=counts.some(count=>count>1);
                const ref=mode==='two' ? 'f['+(i-1)+']['+col+']' : 'f['+col+']';
                emit('read',i,j,{line:'update',notake,take,source,result:best,resultPicks:bestPicks,reused,
                    note:source.stage==='current'
                        ? '读取 '+ref+'='+source.value+'，它已在本轮写过，包含 '+describe(source.counts,items)+'。'+
                            (source.counts[i-1]>0 ? '再加 '+item.name+'，同一株被重复选择！' : '这里读取了本轮结果；这种顺序不再保证每株最多一次。')
                        : '读取'+(mode==='two' ? '上一行 ' : '尚未在本轮更新的 ')+ref+'='+source.value+'，再加当前价值 '+item.value+'，比较 '+notake.value+' 与 '+take.value+'。'});
            }
            if(mode==='two') {matrix[i][j]=best;matrixPicks[i][j]=[...bestPicks];}
            else {values[j]=best;picks[j]=[...bestPicks];updated[j]=true;}
            const reused=bestPicks.some(count=>count>1);
            emit('write',i,j,{line:j>=item.weight ? 'update' : 'copy',notake,take,source,result:best,resultPicks:bestPicks,reused,
                note:(mode==='two' ? '写入 f['+i+']['+j+']' : '写入 f['+j+']')+'='+best+'，对应 '+describe(bestPicks,items)+'。'+
                    (reused ? '这已违反每株最多采一次的要求。' : mode==='descending' ? '容量向左更新，较小容量仍保留上一轮。' : '')});
        }
    }
    const result=mode==='two' ? matrix[items.length][capacity] : values[capacity];
    const resultPicks=mode==='two' ? matrixPicks[items.length][capacity] : picks[capacity];
    emit('done',items.length,null,{line:'',result,resultPicks,reused:resultPicks.some(count=>count>1),note:mode==='ascending'
        ? (preset==='single' ? '正序得到 6：实际上把唯一的一株 A 采了两次。二维与倒序的答案都是 3。'
            : '正序在中途已重复使用本轮物品。最终数值碰巧同为 6，也不能说明它实现了 0/1 背包；切换“单株反例”看 3 与 6 的差别。')
        : '计算结束，容量上限 '+capacity+' 的最大价值为 '+result+'。每个选中的物品都没有超过一次。'});
    const keyStep=frames.findIndex(frame=>frame.event==='read' && frame.i===1 && frame.j===capacity);
    return {config,mode,frames,keyStep,result};
}

export function pickDescription(counts,items) {return describe(counts,items);}

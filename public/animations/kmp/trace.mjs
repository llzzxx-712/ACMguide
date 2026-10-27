export const seconds=1.3;
export const presets={match:{source:'ABABABAC',pattern:'ABABAC'},pi:{source:'ABABAC',pattern:'ABABAC'},overlap:{source:'AAAAA',pattern:'AAA'}};
function prefix(pattern){const pi=Array(pattern.length).fill(0);for(let i=1;i<pattern.length;i++){let j=pi[i-1];while(j>0&&pattern[i]!==pattern[j])j=pi[j-1];if(pattern[i]===pattern[j])j++;pi[i]=j;}return pi;}
export function buildKmpTrace(mode='match',custom){
    if(!presets[mode])throw new Error('Unknown KMP mode');
    const config=custom||presets[mode],p=config.pattern,s=mode==='pi'?p:config.source;
    if(!p.length)throw new Error('Pattern must not be empty');
    const pi=mode==='pi'?Array(p.length).fill(null):prefix(p),frames=[],results=[];
    let i=0,j=0,consumed=0;
    const emit=(event,line,note,extra={})=>frames.push(JSON.parse(JSON.stringify({event,line,note,i,j,consumed,alignment:consumed-j,pi,results,...extra})));
    if(mode==='pi'){
        pi[0]=0;consumed=1;
        emit('initial','init','单个字符没有非空真 border，所以 pi[0]=0。接下来依次计算后面的前缀。');
        for(i=1;i<p.length;i++){
            j=pi[i-1];consumed=i;
            emit('scan','scan',`计算 pi[${i}]，先令 j=pi[${i-1}]=${j}，尝试延长已有 border。`);
            while(j>0&&p[i]!==p[j]){
                emit('compare','fallback',`p[${i}]=${p[i]} 与 p[${j}]=${p[j]} 不同，要寻找更短的可用 border。`,{mismatch:true});
                const old=j;j=pi[j-1];
                emit('fallback','fallback',`j 从 ${old} 回退到 pi[${old-1}]=${j}；i 仍是 ${i}，保留长度 ${j} 的前后缀再比较。`,{from:old,readIndex:old-1});
            }
            emit('compare','compare',`比较 p[${i}]=${p[i]} 与 p[${j}]=${p[j]}。`,{mismatch:p[i]!==p[j]});
            if(p[i]===p[j]){j++;consumed=i+1;emit('extend','extend',`字符相同，border 可以延长到 ${j}，随后写入 pi[${i}]。`);}
            pi[i]=j;consumed=i+1;
            emit('write','write',`当前前缀的最长 border 长度是 ${j}，写入 pi[${i}]=${j}。`,{writeIndex:i});
        }
    }else{
        emit('initial','init','pi 已准备好。j 表示已经匹配的字符数，i 从左到右读取文本，不因失配后退。');
        for(i=0;i<s.length;i++){
            consumed=i;
            emit('scan','scan',`读取 s[${i}]=${s[i]}，此前已匹配 ${j} 个字符，下一位比较 p[${j}]。`);
            while(j>0&&s[i]!==p[j]){
                emit('compare','fallback',`s[${i}]=${s[i]} 与 p[${j}]=${p[j]} 不同。已经匹配的部分不能原样接上。`,{mismatch:true});
                const old=j;j=pi[j-1];
                emit('fallback','fallback',`j 从 ${old} 回退到 pi[${old-1}]=${j}。i 仍是 ${i}，只移动模式的对齐位置，保留末尾的 ${p.slice(0,j)||'空串'}。`,{from:old,readIndex:old-1});
            }
            emit('compare','compare',`比较 s[${i}]=${s[i]} 与 p[${j}]=${p[j]}。`,{mismatch:s[i]!==p[j]});
            if(s[i]===p[j]){j++;consumed=i+1;emit('extend','extend',`字符相同，j 增加到 ${j}，已匹配部分延长一位。`);}
            else {consumed=i+1;emit('miss','compare','j=0 时仍不相同，当前字符不能接上；下一轮读取下一个文本字符。');}
            if(j===p.length){
                results.push(i-p.length+2);
                emit('found','found',`匹配完成！按从 1 开始的下标输出起点 ${i-p.length+2}。`);
                const old=j;j=pi[j-1];
                emit('reset','reset',`保留 pi[${old-1}]=${j} 个字符，继续寻找下一次匹配；这些后缀可以成为重叠答案的开头。`,{from:old,readIndex:old-1});
            }
        }
    }
    i=s.length;consumed=s.length;
    emit('done','',mode==='pi'?'pi 计算完成。回退沿着更短 border 前进，每个值都来自已求出的前缀。':`文本读取完毕，匹配起点为 ${results.length?results.join('、'):'无'}。`);
    const fallbackStep=frames.findIndex(f=>f.event==='fallback'||f.event==='reset');
    const foundStep=frames.findIndex(f=>f.event==='found');
    return {source:s,pattern:p,frames,fallbackStep,beforeFallbackStep:Math.max(0,fallbackStep-1),foundStep:foundStep<0?frames.length-1:foundStep};
}

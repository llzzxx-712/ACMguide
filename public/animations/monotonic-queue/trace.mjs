export const values = [4,2,2,5,6,1,3,3];
export const windowSize = 3;
export const seconds = 1.3;
export function buildQueueTrace(mode='min') {
    if(!['min','max'].includes(mode))throw new Error('Unknown queue mode');
    const queue=[],outputs=[],frames=[];
    const minimum=mode==='min';
    let i=0,left=0;
    const emit=(event,line,note,extra={})=>frames.push(JSON.parse(JSON.stringify({event,line,note,i,left,queue,outputs,...extra})));
    emit('initial','','从左到右移动窗口。候选队列保存下标，颜色和下方数组一起帮你对照数值。');
    for(i=1;i<=values.length;i++) {
        left=i-windowSize+1;
        emit('arrive','left',`来到 i=${i}，当前左边界为 ${left}；先检查旧候选是否已经过期。`);
        while(queue.length&&queue[0]<left) {
            const removed=queue.shift();
            emit('expire','expire',`下标 ${removed} 小于左边界 ${left}，已不在窗口内，从队头删除。`,{removed});
        }
        while(queue.length) {
            const tail=queue.at(-1),old=values[tail-1],current=values[i-1];
            const discard=minimum?old>=current:old<=current;
            emit('compare','discard',`比较队尾 ${tail}:${old} 与新数 ${i}:${current}。`+(discard?'新数不差且更晚过期，旧候选可以删除。':'队尾仍有优势，停止从队尾删除。'),{tail,discard});
            if(!discard)break;
            queue.pop();
            emit('discard','discard',`从队尾删除 ${tail}:${old}。`+(old===current?'数值相等，保留下标更大的新候选，能在窗口中停留更久。':'新数更'+(minimum?'小':'大')+'，旧数以后都不会更优。'),{removed:tail,equal:old===current});
        }
        queue.push(i);
        emit('push','push',`将当前下标 ${i} 加入队尾。候选下标递增，数值从队头到队尾严格`+(minimum?'递增。':'递减。'));
        if(i>=windowSize) {
            outputs.push(values[queue[0]-1]);
            emit('output','output',`完整窗口 [${left},${i}] 的`+(minimum?'最小':'最大')+`值是 a[${queue[0]}]=${values[queue[0]-1]}，读取队头输出。`);
        } else emit('wait','output','窗口还没有满 3 个数，先维护候选，不输出答案。');
    }
    i=values.length;
    emit('done','','扫描完成。每个下标入队一次，至多从队头或队尾删除一次，全部窗口只需 O(n) 时间。');
    return {frames,expireStep:frames.findIndex(f=>f.event==='expire'),discardStep:frames.findIndex(f=>f.event==='discard'),equalStep:frames.findIndex(f=>f.event==='discard'&&f.equal)};
}

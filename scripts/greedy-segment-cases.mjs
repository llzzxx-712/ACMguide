// Independent exhaustive schedules/permutations and plain-array oracles.
let seed = 7122026;
function random(n) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return (seed >>> 8) % n; }
function repairCase(tasks) {
    let best = 0;
    const sorted = tasks.slice().sort((a,b) => a[1]-b[1]);
    for (let mask=0;mask<2**tasks.length;mask++) {
        let time=0,count=0,valid=true;
        for(let i=0;i<sorted.length;i++) if(mask & (1<<i)) {
            time+=sorted[i][0];count++;
            if(time>sorted[i][1]) {valid=false;break;}
        }
        if(valid)best=Math.max(best,count);
    }
    return [tasks.length+'\n'+tasks.map(x=>x.join(' ')).join('\n')+'\n',best+'\n'];
}
function kingCase(king,people) {
    let best=null;
    function enumerate(used,product,maximum) {
        if(used===(1<<people.length)-1) {if(best===null||maximum<best)best=maximum;return;}
        for(let i=0;i<people.length;i++)if(!(used&(1<<i))){
            const reward=product/BigInt(people[i][1]);
            enumerate(used|(1<<i),product*BigInt(people[i][0]),reward>maximum?reward:maximum);
        }
    }
    enumerate(0,BigInt(king),0n);
    return [people.length+'\n'+king+' 7\n'+people.map(p=>p.join(' ')).join('\n')+'\n',best+'\n'];
}
function rangeCase(values,ops,mode,mod=571373n) {
    const a=values.map(BigInt),output=[];
    if(mode==='affine')for(let i=0;i<a.length;i++)a[i]%=mod;
    for(const [type,l,r,value] of ops) {
        if(mode==='minimum') output.push(a.slice(l-1,r).reduce((x,y)=>x<y?x:y).toString());
        else if(mode==='point'&&type===1)a[l-1]+=BigInt(r);
        else if(mode==='lazy'&&type===1)for(let i=l-1;i<r;i++)a[i]+=BigInt(value);
        else if(mode==='affine'&&type!==3)for(let i=l-1;i<r;i++)a[i]=(type===1?a[i]*BigInt(value):a[i]+BigInt(value))%mod;
        else {let sum=a.slice(l-1,r).reduce((x,y)=>x+y,0n);if(mode==='affine')sum%=mod;output.push(sum.toString());}
    }
    const input=values.length+' '+ops.length+(mode==='affine'?' '+mod:'')+'\n'+values.join(' ')+'\n'+ops.map(op=>(mode==='minimum'?op.slice(1):op).join(' ')).join('\n')+'\n';
    return [input,output.join(mode==='minimum'?' ':'\n')+'\n'];
}
const randomRangeCases=mode=>Array.from({length:55},()=>{
    const n=1+random(17),values=Array.from({length:n},()=>1+random(100));
    const ops=[];
    for(let j=0;j<40;j++){
        let l=1+random(n),r=1+random(n);if(l>r)[l,r]=[r,l];
        if(mode==='minimum')ops.push([2,l,r]);
        else if(mode==='point')ops.push(j%3===0?[1,l,random(101)-50]:[2,l,r]);
        else if(mode==='lazy')ops.push(j%3===0?[1,l,r,1+random(100)]:[2,l,r]);
        else ops.push(j%4===0?[3,l,r]:[1+j%2,l,r,1+random(10000)]);
    }
    return rangeCase(values,ops,mode,BigInt([1,38,100,571373][random(4)]));
});
export const greedySegmentCases={
    'regret-greedy': [[
        repairCase([[4,5],[2,6],[2,7]]),repairCase([[4,5],[2,6],[2,7],[3,8]]),
        repairCase([[1,2]]),repairCase([[5,6],[5,6],[1,6],[2,6]]),
        ...Array.from({length:75},()=>repairCase(Array.from({length:1+random(11)},()=>{const t=1+random(12);return [t,t+1+random(18)];}))),
        ['149999\n'+'1000000000 2147483647\n'.repeat(149999),'2\n']
    ]],
    'exchange-greedy': [[
        kingCase(2,[[3,2],[2,5]]),kingCase(1,[[1,9999]]),kingCase(8,[[2,6],[3,4],[4,3],[6,2]]),
        ...Array.from({length:45},()=>kingCase(1+random(20),Array.from({length:1+random(6)},()=>[1+random(9),1+random(9)]))),
        ['1000\n9999 1\n'+'9999 9999\n'.repeat(1000),(9999n**999n)+'\n']
    ]],
    'segment-build': [[
        rangeCase([5,2,7,1,4],[[2,1,3],[2,2,5],[2,3,3]],'minimum'),
        rangeCase([0],[[2,1,1]],'minimum'),...randomRangeCases('minimum'),
        rangeCase(Array(100000).fill(100000),[[2,1,100000],[2,100000,100000]],'minimum')
    ]],
    'segment-point': [[
        rangeCase([1,2,3,4,5],[[2,2,4],[1,3,10],[2,1,3],[2,3,3]],'point'),
        rangeCase([0],[[1,1,-10],[2,1,1],[1,1,10],[2,1,1]],'point'),...randomRangeCases('point'),
        rangeCase(Array(500000).fill(1000000000),[[2,1,500000],[1,500000,-1000000000],[2,499999,500000]],'point')
    ]],
    'segment-lazy': [[
        rangeCase([1,2,3,4],[[1,1,4,10],[2,2,2],[1,2,3,5],[2,1,4],[2,3,4]],'lazy'),
        rangeCase([2],[[1,1,1,3],[1,1,1,7],[2,1,1]],'lazy'),...randomRangeCases('lazy'),
        rangeCase(Array(100000).fill(10000000000000),[[1,1,100000,10000000000000],[2,1,100000],[2,100000,100000]],'lazy')
    ]],
    'segment-composition': [[
        rangeCase([1,2,3],[[2,1,3,2],[1,1,3,3],[3,2,2],[2,2,3,1],[3,1,3]],'affine',100n),
        rangeCase([1,2,3,4],[[2,1,4,2],[1,1,4,3],[2,2,3,7],[1,3,4,5],[3,1,1],[3,2,3],[3,1,4]],'affine'),
        rangeCase([9999],[[1,1,1,9999],[2,1,1,9999],[3,1,1]],'affine',1n),...randomRangeCases('affine'),
        rangeCase(Array(100000).fill(10000),[[2,1,100000,10000],[1,1,100000,10000],[3,2,99999],[2,1,1,10000],[3,1,100000]],'affine')
    ]]
};

// For the beginner switch example, use an explicit boolean array rather than bit operations.
export const switchCases=Array.from({length:50},()=>{
    const initial=random(2**20),state=Array.from({length:20},(_,i)=>Math.floor(initial/2**i)%2),ops=[],out=[];
    for(let j=0;j<60;j++){const type=1+random(4),k=random(20);ops.push([type,k]);if(type===1)state[k]=1;else if(type===2)state[k]=0;else if(type===3)state[k]=1-state[k];else out.push(state[k]);}
    return [initial+' '+ops.length+'\n'+ops.map(x=>x.join(' ')).join('\n')+'\n',out.length?out.join('\n')+'\n':''];
});
switchCases.unshift(['5 6\n4 0\n1 1\n2 2\n3 0\n4 0\n4 1\n','1\n0\n1\n']);

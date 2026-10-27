// Direct, small-instance oracles for the optimization lessons.
// Large cases use closed-form answers to exercise input, capacity and integer boundaries.
let seed = 20261029;
function rnd(n) {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    return (seed >>> 0) % n;
}
const line = a => a.join(' ') + '\n';
function vectorCase(a) {
    return [a.length+'\n'+line(a),a.length+'\n'+line(a)+line([...a].sort((x,y)=>x-y))];
}
function pairs(a,c) {
    let count=0;
    for(let i=0;i<a.length;i++)for(let j=0;j<a.length;j++)if(a[i]-a[j]===c)count++;
    return [`${a.length} ${c}\n`+line(a),count+'\n'];
}
function exhibition(a,m) {
    let best=a.length+1,answer=[];
    for(let l=0;l<a.length;l++) {
        const seen=new Set();
        for(let r=l;r<a.length;r++) {
            seen.add(a[r]);
            if(seen.size===m){if(r-l+1<best){best=r-l+1;answer=[l+1,r+1];}break;}
        }
    }
    if(!answer.length)throw new Error('Exhibition generator must cover every artist');
    return [`${a.length} ${m}\n`+line(a),line(answer)];
}
function awards(a,w) {
    const result=[];
    for(let p=1;p<=a.length;p++){
        const sorted=a.slice(0,p).sort((x,y)=>y-x);
        result.push(sorted[Math.max(1,Math.floor(p*w/100))-1]);
    }
    return [`${a.length} ${w}\n`+line(a),line(result)];
}
function greater(a) {
    const result=a.map((value,i)=>{
        for(let j=i+1;j<a.length;j++)if(a[j]>value)return j+1;
        return 0;
    });
    return [a.length+'\n'+line(a),line(result)];
}
function cows(a) {
    let result=0;
    for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){
        if(a[j]>=a[i])break;
        result++;
    }
    return [a.length+'\n'+a.join('\n')+'\n',result+'\n'];
}
function windows(a,k) {
    const mins=[],maxs=[];
    for(let l=0;l+k<=a.length;l++){
        const current=a.slice(l,l+k);
        mins.push(Math.min(...current));maxs.push(Math.max(...current));
    }
    return [`${a.length} ${k}\n`+line(a),line(mins)+line(maxs)];
}
const shortArrays=[
    [1],[2,1,2,4,3],[5,2,2,4,1],[1,1,1,1],
    [1,2,3,4,5],[5,4,3,2,1],[1,1000000000,1,1000000000],
    ...Array.from({length:40},()=>Array.from({length:1+rnd(70)},()=>1+rnd(12)))
];
export const vectorIntroCases=[
    vectorCase([4,1,4,7,1]),vectorCase([-2147483648,2147483647,0,0]),
    ...shortArrays.map(vectorCase)
];
export const optimizationCases={
    'two-pointers': [
        [pairs([1,3,1,3,5,3],2),pairs([0,1,2147483647],2147483647),pairs([1073741823,1073741822],1073741823),...shortArrays.map(a=>pairs(a,1+rnd(15)))],
        [exhibition([1,2,1,3,2,1,3],3),exhibition([1],1),exhibition([2,2,1,1,3],3),exhibition([1,2,3,1,2,3],3),...Array.from({length:42},()=>{
            const m=1+rnd(7),a=Array.from({length:m},(_,i)=>i+1);
            for(let i=0;i<20;i++)a.splice(rnd(a.length+1),0,1+rnd(m));
            return exhibition(a,m);
        })]
    ],
    'counting-precomputation': [[
        awards([80,90,80,100,90],40),awards([0],1),awards([600,600,0,0,0],99),awards([100,90,80,70,60],60),
        ...Array.from({length:46},()=>awards(Array.from({length:1+rnd(70)},()=>rnd(601)),1+rnd(99)))
    ]],
    'monotonic-stack': [shortArrays.map(greater),shortArrays.map(cows)],
    'monotonic-queue': [[
        windows([4,2,2,5,6,1,3,3],3),windows([-2147483648,2147483647,-2147483648,2147483647],2),
        ...shortArrays.flatMap(a=>[windows(a,1),windows(a,a.length),windows(a,1+rnd(a.length))]),
        ...Array.from({length:32},()=>{const a=Array.from({length:1+rnd(70)},()=>rnd(200)-100);return windows(a,1+rnd(a.length));})
    ]]
};
const pairN=200000;
optimizationCases['two-pointers'][0].push([`${pairN} 2\n`+'1 '.repeat(pairN/2)+'3 '.repeat(pairN/2)+'\n','10000000000\n']);
const paintingN=1000000,artistN=2000;
optimizationCases['two-pointers'][1].push([`${paintingN} ${artistN}\n`+line(Array.from({length:paintingN},(_,i)=>i%artistN+1)),'1 2000\n']);
optimizationCases['counting-precomputation'][0].push(['100000 99\n'+'0 '.repeat(100000)+'\n',line(Array(100000).fill(0))]);
const stackN=3000000;
optimizationCases['monotonic-stack'][0].push([stackN+'\n'+'1 '.repeat(stackN)+'\n',line(Array(stackN).fill(0))]);
const cowN=80000;
optimizationCases['monotonic-stack'][1].push([cowN+'\n'+Array.from({length:cowN},(_,i)=>cowN-i).join('\n')+'\n',(cowN*(cowN-1)/2)+'\n']);
const queueN=1000000,queueK=500000;
optimizationCases['monotonic-queue'][0].push([`${queueN} ${queueK}\n`+line(Array.from({length:queueN},(_,i)=>i+1)),
    line(Array.from({length:queueN-queueK+1},(_,i)=>i+1))+line(Array.from({length:queueN-queueK+1},(_,i)=>i+queueK))]);

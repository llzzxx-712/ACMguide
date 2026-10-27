let seed=20261031;
const rnd=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n;};
const line=a=>a.join(' ')+'\n';
function budgetCase(items,budget){const size=2**items.length,cost=Array(size).fill(0),gain=Array(size).fill(0);let best=0;for(let mask=1;mask<size;mask++){const bit=mask&-mask,index=Math.log2(bit);cost[mask]=cost[mask^bit]+items[index][0];gain[mask]=gain[mask^bit]+items[index][1];if(cost[mask]<=budget)best=Math.max(best,gain[mask]);}return[`${items.length} ${budget}\n`+items.map(line).join(''),best+'\n'];}
function sticksCase(a){const total=a.reduce((s,x)=>s+x,0);let answer=total;for(let target=Math.max(...a);target<=total;target++){if(total%target)continue;const dp=Array(2**a.length).fill(-1);dp[0]=0;for(let mask=0;mask<dp.length;mask++)if(dp[mask]>=0)for(let j=0;j<a.length;j++)if(!(mask&(1<<j))&&dp[mask]+a[j]<=target)dp[mask|(1<<j)]=(dp[mask]+a[j])%target;if(dp.at(-1)===0){answer=target;break;}}return[a.length+'\n'+line(a),answer+'\n'];}
// A complete one-direction BFS is an independent distance oracle for the bidirectional lesson.
const goal='123804765',puzzleStates=[goal],puzzleDistance=new Map([[goal,0]]);
const neighbours=[[1,3],[0,2,4],[1,5],[0,4,6],[1,3,5,7],[2,4,8],[3,7],[4,6,8],[5,7]];
for(let head=0;head<puzzleStates.length;head++){const state=puzzleStates[head],zero=state.indexOf('0');for(const pos of neighbours[zero]){const chars=state.split('');[chars[zero],chars[pos]]=[chars[pos],chars[zero]];const next=chars.join('');if(!puzzleDistance.has(next)){puzzleDistance.set(next,puzzleDistance.get(state)+1);puzzleStates.push(next);}}}
const puzzleCases=[goal,'123084765',puzzleStates.find(s=>s.startsWith('0')),puzzleStates.at(-1),...Array.from({length:24},()=>puzzleStates[rnd(puzzleStates.length)])].map(s=>[s+'\n',puzzleDistance.get(s)+'\n']);
function ticketsCase(prices,budget){prices=prices.map(BigInt);budget=BigInt(budget);const sums=Array(2**prices.length).fill(0n);let count=1;for(let mask=1;mask<sums.length;mask++){const bit=mask&-mask;sums[mask]=sums[mask^bit]+prices[Math.log2(bit)];if(sums[mask]<=budget)count++;}return[`${prices.length} ${budget}\n`+line(prices),count+'\n'];}
function heapCase(ops){const a=[],answers=[];for(const[op,x]of ops){if(op===1)a.push(x);else{const value=Math.min(...a);if(op===2)answers.push(value);else a.splice(a.indexOf(value),1);}}return[ops.length+'\n'+ops.map(line).join(''),answers.map(x=>x+'\n').join('')];}
function fruitsCase(a){const size=2**a.length,sums=Array(size).fill(0),dp=Array(size).fill(Infinity);dp[0]=0;for(let mask=1;mask<size;mask++){const bit=mask&-mask;sums[mask]=sums[mask^bit]+a[Math.log2(bit)];if((mask&(mask-1))===0){dp[mask]=0;continue;}for(let sub=(mask-1)&mask;sub;sub=(sub-1)&mask)if(sub&bit)dp[mask]=Math.min(dp[mask],dp[sub]+dp[mask^sub]+sums[mask]);}return[a.length+'\n'+line(a),dp.at(-1)+'\n'];}
function medianCase(a){const answer=[];for(let n=1;n<=a.length;n+=2)answer.push([...a.slice(0,n)].sort((x,y)=>x-y)[(n-1)/2]);return[a.length+'\n'+line(a),answer.map(x=>x+'\n').join('')];}
function fenwickCase(a,ops,difference=false){const b=[...a],answer=[];for(const op of ops){if(op[0]===1){if(difference)for(let i=op[1]-1;i<op[2];i++)b[i]+=op[3];else b[op[1]-1]+=op[2];}else if(difference)answer.push(b[op[1]-1]);else answer.push(b.slice(op[1]-1,op[2]).reduce((s,x)=>s+x,0));}return[`${a.length} ${ops.length}\n`+line(a)+ops.map(line).join(''),answer.map(x=>x+'\n').join('')];}
function invCase(a){let answer=0;for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)if(a[i]>a[j])answer++;return[a.length+'\n'+line(a),answer+'\n'];}
export const searchHeapCases={
 'search-pruning':[[budgetCase([[4,6],[3,5],[5,8],[2,2]],7),budgetCase([[5,8]],0),...Array.from({length:26},()=>budgetCase(Array.from({length:1+rnd(14)},()=>[1+rnd(20),1+rnd(30)]),rnd(70)))],[sticksCase([5,2,1,5,2,1,5,2,1]),sticksCase([50]),...Array.from({length:34},()=>sticksCase(Array.from({length:1+rnd(12)},()=>1+rnd(12))))]],
 'meet-in-middle':[puzzleCases,[ticketsCase([1,2,3,4],6),ticketsCase([2,2,2],4),ticketsCase([9],1),ticketsCase([10000000000000000n,10000000000000000n],20000000000000000n),...Array.from({length:28},()=>ticketsCase(Array.from({length:1+rnd(15)},()=>1+rnd(30)),1+rnd(100))) ]],
 'priority-queues':[[heapCase([[1,4],[1,2],[1,2],[2],[3],[2],[3],[2]]),...Array.from({length:30},()=>{const ops=[];let count=0;for(let i=0;i<120;i++){const op=count?1+rnd(3):1;if(op===1){ops.push([1,1+rnd(1000000000)]);count++;}else{ops.push([op]);if(op===3)count--;}}return heapCase(ops);})]],
 'heap-applications':[[fruitsCase([1,2,3,4]),fruitsCase([1]),...Array.from({length:26},()=>fruitsCase(Array.from({length:1+rnd(7)},()=>1+rnd(20))))],[medianCase([5,1,4,2,3]),medianCase([0,0,0,0,0]),...Array.from({length:28},()=>medianCase(Array.from({length:1+rnd(100)},()=>rnd(1000000001))))]],
 fenwick:[[fenwickCase([1,2,3,4,5],[[2,2,4],[1,3,10],[2,1,3],[2,3,3]]),fenwickCase([2147483647],[[1,1,2147483647],[2,1,1],[1,1,-2147483648],[2,1,1]]),...Array.from({length:28},()=>{const n=1+rnd(45);return fenwickCase(Array.from({length:n},()=>rnd(201)-100),Array.from({length:100},()=>{if(rnd(2))return[1,1+rnd(n),rnd(201)-100];const x=1+rnd(n),y=1+rnd(n);return[2,Math.min(x,y),Math.max(x,y)];}));})]],
 'fenwick-applications':[[fenwickCase([1,2,3,4,5],[[1,2,4,10],[2,1],[2,3],[2,5]],true),fenwickCase([0],[[1,1,1,1000000000],[2,1],[1,1,1,-1000000000],[2,1]],true),...Array.from({length:28},()=>{const n=1+rnd(45);return fenwickCase(Array.from({length:n},()=>rnd(201)-100),Array.from({length:100},()=>{if(rnd(2)){const x=1+rnd(n),y=1+rnd(n);return[1,Math.min(x,y),Math.max(x,y),rnd(201)-100];}return[2,1+rnd(n)];}),true);})],[invCase([4,2,2,1]),invCase([1,1,1]),...Array.from({length:30},()=>invCase(Array.from({length:1+rnd(80)},()=>1+rnd(30))))]]
};
searchHeapCases['search-pruning'][0].push(['22 11\n'+'1 1\n'.repeat(22),'11\n']);
searchHeapCases['search-pruning'][1].push(['65\n'+'50 '.repeat(65)+'\n','50\n']);
searchHeapCases['meet-in-middle'][1].push(['40 40\n'+'1 '.repeat(40)+'\n',(2n**40n)+'\n'],['40 1000000000000000000\n'+'10000000000000000 '.repeat(40)+'\n',(2n**40n)+'\n']);
const heapN=333333;
searchHeapCases['priority-queues'][0].push(['1000000\n'+Array.from({length:heapN},(_,i)=>'1 '+(heapN-i)+'\n').join('')+'2\n3\n'.repeat(heapN)+'1 1\n',Array.from({length:heapN},(_,i)=>i+1+'\n').join('')]);
const fruitN=10000,height=Math.ceil(Math.log2(fruitN));
searchHeapCases['heap-applications'][0].push([fruitN+'\n'+'1 '.repeat(fruitN)+'\n',(fruitN*(height+1)-2**height)+'\n']);
searchHeapCases['heap-applications'][1].push(['100000\n'+line(Array.from({length:100000},(_,i)=>100000-i)),Array.from({length:50000},(_,i)=>100000-i+'\n').join('')]);
const fwN=500000;
searchHeapCases.fenwick[0].push([`${fwN} 4\n`+'2147483647 '.repeat(fwN)+'\n2 1 500000\n1 500000 -2147483648\n2 500000 500000\n2 1 500000\n',(2147483647*fwN)+'\n-1\n'+(2147483647*fwN-2147483648)+'\n']);
searchHeapCases['fenwick-applications'][0].push([`${fwN} 4\n`+'0 '.repeat(fwN)+'\n1 1 500000 1000000000\n2 500000\n1 500000 500000 -1000000000\n2 500000\n','1000000000\n0\n']);
searchHeapCases['fenwick-applications'][1].push([fwN+'\n'+line(Array.from({length:fwN},(_,i)=>fwN-i)),(fwN*(fwN-1)/2)+'\n']);

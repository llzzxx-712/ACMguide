// Independent small enumerations and arithmetic identities for chapters 21–24.
export const remainingMathCases = {};
let seed = 28212026;
function rnd(n) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return Math.floor(seed / 4294967296 * n); }
function gcd(a,b) { while(b) [a,b]=[b,a%b]; return a; }
const textRows = a => a.map(row=>row.join(' ')).join('\n');
function diophantine(a,b,c) {
  const g=gcd(a,b),possible=c%g===0;
  return [`${a} ${b} ${c}\n`,possible?'': 'NO\n',out=>{
    if(!possible)return out.trim()==='NO';
    if(!/^-?\d+ -?\d+\r?\n$/.test(out))return false;
    const [x,y]=out.trim().split(/\s+/).map(BigInt);
    return x>=0n&&x<BigInt(b/g)&&BigInt(a)*x+BigInt(b)*y===BigInt(c);
  }];
}
const extended=[];
for(let t=0;t<45;t++)extended.push(diophantine(1+rnd(100),1+rnd(100),rnd(401)-200));
extended.push(diophantine(1000000000,999999937,-1000000000),diophantine(1,1,-1),diophantine(6,10,3));
function inverseCase(n,p) {
  // Extended Euclid per value, independent of the linear inverse recurrence.
  const inv=[];
  for(let i=1;i<=n;i++){let a=i,b=p,x=1,y=0;while(b){const q=Math.floor(a/b);[a,b]=[b,a-q*b];[x,y]=[y,x-q*y];}inv.push((x%p+p)%p);}
  return [`${n} ${p}\n`,inv.join('\n')+'\n'];
}
const inverses=[inverseCase(1,2),inverseCase(3,7),inverseCase(100,101),inverseCase(1000,19999999)];
function crtCase(conditions,known=null){let period=1;for(const[m]of conditions)period=period/gcd(period,m)*m;let answer=-1;if(known!==null)answer=known;else for(let x=0;x<period;x++)if(conditions.every(([m,r])=>x%m===r)){answer=x;break;}return[conditions.length+'\n'+textRows(conditions)+'\n',answer===-1?'NO\n':answer+'\n'];}
const crts=[];
for(let t=0;t<35;t++){const mods=Array.from({length:1+rnd(5)},()=>1+rnd(10)),x=rnd(200);crts.push(crtCase(mods.map(m=>[m,t%3===0?rnd(m):x%m])));}
const crtAnswer=98765432101234567n,crtM=999999937n,crtN=999999929n;
crts.push([`2\n${crtM} ${crtAnswer%crtM}\n${crtN} ${crtAnswer%crtN}\n`,crtAnswer+'\n'],crtCase([[4,1],[6,2]]),crtCase([[1,0],[1,0]]));
function phiTrial(n){let answer=n,x=n;for(let p=2;p*p<=x;p++)if(x%p===0){answer=answer/p*(p-1);while(x%p===0)x/=p;}if(x>1)answer=answer/x*(x-1);return answer;}
const phiQueries=Array.from({length:150},()=>1+rnd(1000000)).concat([1,2,999983,1000000]);
const phis=[['1000000 '+phiQueries.length+'\n'+phiQueries.join(' ')+'\n',phiQueries.map(phiTrial).join('\n')+'\n']];
for(let t=0;t<8;t++){const n=1+rnd(100),query=Array.from({length:n},(_,i)=>i+1);phis.push([`${n} ${n}\n${query.join(' ')}\n`,query.map(x=>{let k=0;for(let a=1;a<=x;a++)if(gcd(a,x)===1)k++;return k;}).join('\n')+'\n']);}
function divisorSum(n){let root=Math.floor(Math.sqrt(n)),sum=0;for(let i=1;i<=root;i++)sum+=Math.floor(n/i);return 2*sum-root*root;}
const blocks=[1,2,5,10,36,49,100,999,1000000000000,...Array.from({length:30},()=>1+rnd(10000))].map(n=>[n+'\n',divisorSum(n)+'\n']);
Object.assign(remainingMathCases,{'extended-gcd':[extended],'modular-inverse':[inverses],'chinese-remainder':[crts],'linear-sieve-phi':[phis],'division-blocks':[blocks]});

const MOD=1000000007n;
function choose(n,k){if(k<0||k>n)return 0n;k=Math.min(k,n-k);let v=1n;for(let i=1;i<=k;i++)v=v*BigInt(n-i+1)/BigInt(i);return v;}
function chooseDivisible(k,queries){return[`${queries.length} ${k}\n${textRows(queries)}\n`,queries.map(([n,m])=>{let count=0;for(let i=0;i<=n;i++)for(let j=0;j<=Math.min(i,m);j++)if(choose(i,j)%BigInt(k)===0n)count++;return count;}).join('\n')+'\n'];}
const binomial=[];
for(let k=2;k<=21;k++)binomial.push(chooseDivisible(k,Array.from({length:10},()=>[rnd(25),rnd(30)]).concat([[0,0],[2,2],[4,0]])));
binomial.push(['3 2\n2000 0\n2000 1\n0 2000\n','0\n1000\n0\n']);
const combinationQueries=Array.from({length:100},()=>{const n=rnd(100);return[n,rnd(n+3)-1];}).concat([[0,0],[1000000,2],[1000000,999999],[1000000,1000001]]);
const factorialComb=[[combinationQueries.length+'\n'+textRows(combinationQueries)+'\n',combinationQueries.map(([n,k])=>choose(n,k)%MOD).join('\n')+'\n']];
const inclusions=[];
for(let t=0;t<40;t++){const n=1+rnd(500),d=Array.from({length:1+rnd(8)},()=>2+rnd(30));let answer=0;for(let x=1;x<=n;x++)if(d.some(v=>x%v===0))answer++;inclusions.push([`${n} ${d.length}\n${d.join(' ')}\n`,answer+'\n']);}
inclusions.push(['1000000000000 3\n1000000000 999999999 999999998\n','3000\n'],['1000000000000 15\n'+'2 '.repeat(14)+'2\n','500000000000\n']);
function classicCounts(n){let factorial=1n;for(let i=1;i<=n;i++)factorial*=BigInt(i);let d=0n,denominator=1n;for(let k=0;k<=n;k++){if(k)denominator*=BigInt(k);d+=(k%2?-1n:1n)*(factorial/denominator);}const cat=choose(2*n,n)/BigInt(n+1);return[n+'\n',`${d%MOD} ${cat%MOD}\n`];}
const classics=Array.from({length:16},(_,n)=>classicCounts(n)).concat([classicCounts(2000)]);
function ballsCase(n,k){let answer=0;function assign(pos,mask){if(pos===n){if(mask===(1<<k)-1)answer++;return;}for(let b=0;b<k;b++)assign(pos+1,mask|(1<<b));}assign(0,0);return[`${n} ${k}\n`,answer+'\n'];}
const balls=[];for(let n=0;n<=7;n++)for(let k=0;k<=4;k++)balls.push(ballsCase(n,k));
let fact2000=1n;for(let i=1;i<=2000;i++)fact2000=fact2000*BigInt(i)%MOD;
balls.push(['2000 2000\n',fact2000+'\n'],['2000 1\n','1\n'],['5 8\n','0\n']);
Object.assign(remainingMathCases,{'binomial-identities':[binomial],'factorial-combinations':[factorialComb],'inclusion-exclusion':[inclusions],'derangements-catalan':[classics],'stirling-balls':[balls]});

function floatCase(input,value,digits,tolerance=0.5*10**(-digits)+1e-9){return[input,value.toFixed(digits)+'\n',out=>new RegExp('^-?\\d+\\.\\d{'+digits+'}\\r?\\n$').test(out)&&Math.abs(Number(out)-value)<=tolerance];}
const meetings=[];
for(let t=0;t<35;t++){const L=1+rnd(1000),T=rnd(1500);const favorable=T>=L?L*L:2*L*T-T*T;meetings.push(floatCase(`${L} ${T}\n`,favorable/(L*L),6));}
meetings.push(floatCase('60 15\n',0.4375,6),floatCase('1 0\n',0,6),floatCase('5 5\n',1,6));
const bayes=[];
for(let t=0;t<35;t++){const p=rnd(101),s=rnd(101),f=rnd(101),joint=p*s,total=joint+(100-p)*f;bayes.push(total===0?[`${p/100} ${s/100} ${f/100}\n`,'UNDEFINED\n']:floatCase(`${p/100} ${s/100} ${f/100}\n`,joint/total,6));}
bayes.push(['0 1 0\n','UNDEFINED\n'],['1 0 1\n','UNDEFINED\n'],floatCase('0.01 0.99 0.05\n',1/6,6));
const coupons=[];for(let n=1;n<=30;n++){let numerator=0n,denominator=1n;for(let j=1;j<=n;j++){numerator=numerator*BigInt(j)+denominator;denominator*=BigInt(j);}coupons.push(floatCase(n+'\n',Number(numerator*BigInt(n))/Number(denominator),6));}
const N=10000000, harmonicEstimate=Math.log(N)+0.5772156649015328606+1/(2*N)-1/(12*N*N);
coupons.push(floatCase(N+'\n',N*harmonicEstimate,6,0.000001));
function classroomCase(c,d,p,V,edges,m){
  const n=c.length,dist=[];
  // Repeated single-source Dijkstra; do not reproduce the tutorial Floyd or DP.
  for(let start=0;start<V;start++){const row=Array(V).fill(Infinity),done=Array(V).fill(false);row[start]=0;for(let t=0;t<V;t++){let u=-1;for(let v=0;v<V;v++)if(!done[v]&&(u<0||row[v]<row[u]))u=v;done[u]=true;for(const[a,b,w]of edges){if(a===u)row[b]=Math.min(row[b],row[u]+w);if(b===u)row[a]=Math.min(row[a],row[u]+w);}}dist.push(row);}
  let best=Infinity;
  for(let apply=0;apply<1<<n;apply++){if(apply.toString(2).replaceAll('0','').length>m)continue;let expectation=0;for(let result=apply;;result=(result-1)&apply){let probability=1;const room=[];for(let i=0;i<n;i++){room.push(result&(1<<i)?d[i]:c[i]);if(apply&(1<<i))probability*=result&(1<<i)?p[i]:1-p[i];}let sum=0;for(let i=1;i<n;i++)sum+=dist[room[i-1]][room[i]];expectation+=probability*sum;if(result===0)break;}best=Math.min(best,expectation);}
  return floatCase(`${n} ${m} ${V} ${edges.length}\n${c.map(x=>x+1).join(' ')}\n${d.map(x=>x+1).join(' ')}\n${p.join(' ')}\n${textRows(edges.map(([a,b,w])=>[a+1,b+1,w]))}\n`,best,2);
}
const classrooms=[];
for(let t=0;t<35;t++){const V=1+rnd(5),n=1+rnd(6),edges=[];for(let v=1;v<V;v++)edges.push([v,rnd(v),1+rnd(10)]);for(let e=0;e<4;e++)edges.push([rnd(V),rnd(V),1+rnd(10)]);classrooms.push(classroomCase(Array.from({length:n},()=>rnd(V)),Array.from({length:n},()=>rnd(V)),Array.from({length:n},()=>rnd(5)/4),V,edges,rnd(n+1)));}
classrooms.push([`2000 2000 300 299\n${'1 '.repeat(1999)}1\n${'1 '.repeat(1999)}1\n${'0.5 '.repeat(1999)}0.5\n${textRows(Array.from({length:299},(_,i)=>[i+1,i+2,1]))}\n`,'0.00\n']);
Object.assign(remainingMathCases,{'probability-events':[meetings],'conditional-bayes':[bayes],'expectation-linearity':[coupons],'probability-dp':[classrooms]});

function matrixCase(a,b){const r=a.length,s=b.length,t=b[0].length;const out=Array.from({length:r},(_,i)=>Array.from({length:t},(_,j)=>a[i].reduce((sum,x,k)=>(sum+BigInt(x)*BigInt(b[k][j]))%MOD,0n)));return[`${r} ${s} ${t}\n${textRows(a)}\n${textRows(b)}\n`,textRows(out)+'\n'];}
const matrices=[];for(let t=0;t<35;t++){const r=1+rnd(5),s=1+rnd(5),c=1+rnd(5);matrices.push(matrixCase(Array.from({length:r},()=>Array.from({length:s},()=>rnd(1000000007))),Array.from({length:s},()=>Array.from({length:c},()=>rnd(1000000007)))));}
matrices.push(matrixCase(Array.from({length:100},()=>Array(100).fill(1000000006)),Array.from({length:100},()=>Array(100).fill(1000000006))));
function recurrence(n){
  // Polynomial reduction x^3=x^2+1, not matrix multiplication.
  const mul=(a,b)=>{const c=Array(5).fill(0n);for(let i=0;i<3;i++)for(let j=0;j<3;j++)c[i+j]=(c[i+j]+a[i]*b[j])%MOD;for(let d=4;d>=3;d--){c[d-1]=(c[d-1]+c[d])%MOD;c[d-3]=(c[d-3]+c[d])%MOD;}return c.slice(0,3);};
  let value=[1n,0n,0n],base=[0n,1n,0n],exponent=n;
  while(exponent>0){if(exponent%2)value=mul(value,base);base=mul(base,base);exponent=Math.floor(exponent/2);}return(value[1]+value[2])%MOD;
}
const recurrenceQueries=Array.from({length:100},(_,i)=>i+1).concat([2000000000,1999999999,123456789]);
const powers=[[recurrenceQueries.length+'\n'+recurrenceQueries.join('\n')+'\n',recurrenceQueries.map(recurrence).join('\n')+'\n']];
function gaussianCase(a,solution=null){const n=a.length;return[n+'\n'+textRows(a)+'\n',solution===null?'No Solution\n':solution.map(x=>x.toFixed(2)).join('\n')+'\n',out=>{if(solution===null)return out.trim()==='No Solution';const nums=out.trim().split(/\s+/).map(Number);return nums.length===n&&nums.every((x,i)=>Number.isFinite(x)&&Math.abs(x-solution[i])<0.00501); }];}
const gaussians=[gaussianCase([[0,1,2],[1,1,3]],[1,2]),gaussianCase([[1,1,1],[2,2,2]]),gaussianCase([[1,1,1],[2,2,3]]),gaussianCase([[0,0],[0,0]].slice(0,1))];
// Build a guaranteed invertible matrix by elementary row additions from a diagonal matrix.
for(let t=0;t<35;t++){const n=1+rnd(6),solution=Array.from({length:n},()=>rnd(21)-10),a=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?1+rnd(9):0));for(let z=0;z<8&&n>1;z++){const i=rnd(n),j=(i+1+rnd(n-1))%n,f=rnd(3)-1;for(let k=0;k<n;k++)a[i][k]+=f*a[j][k];}gaussians.push(gaussianCase(a.map(row=>row.concat(row.reduce((s,v,i)=>s+v*solution[i],0))),solution));}
gaussians.push(gaussianCase([[2,1]],[0.5]),gaussianCase(Array.from({length:100},(_,i)=>Array.from({length:100},(_,j)=>i===j?1:0).concat(i-50)),Array.from({length:100},(_,i)=>i-50)));
function xorCase(a,n){const solutions=[];for(let mask=0;mask<1<<n;mask++)if(a.every(row=>{let sum=0;for(let i=0;i<n;i++)if(mask&(1<<i))sum^=row[i];return sum===row[n];}))solutions.push(mask);return[`${a.length} ${n}\n${textRows(a)}\n`,solutions.length?'':'NO SOLUTION\n',out=>{if(!solutions.length)return out.trim()==='NO SOLUTION';const tokens=out.trim().split(/\s+/);if(tokens.length!==n+1||Number(tokens[0])!==solutions.length)return false;const bits=tokens.slice(1).map(Number);return bits.every(x=>x===0||x===1)&&a.every(row=>row.slice(0,n).reduce((s,v,i)=>s^(v&bits[i]),0)===row[n]);}];}
const xors=[];for(let t=0;t<40;t++){const n=1+rnd(9),m=1+rnd(10);xors.push(xorCase(Array.from({length:m},()=>Array.from({length:n+1},()=>rnd(2))),n));}
const freeWays=(2n**200n)%MOD;
xors.push(['1 200\n'+'0 '.repeat(200)+'0\n','',out=>{const tokens=out.trim().split(/\s+/);return tokens.length===201&&tokens[0]===String(freeWays)&&tokens.slice(1).every(x=>x==='0'||x==='1');}]);
function determinant(a){const n=a.length;let sum=0n;function permute(values,used){if(values.length===n){let sign=1n,product=1n;for(let i=0;i<n;i++){product*=BigInt(a[i][values[i]]);for(let j=i+1;j<n;j++)if(values[i]>values[j])sign=-sign;}sum+=sign*product;return;}for(let i=0;i<n;i++)if(!(used&(1<<i)))permute(values.concat(i),used|(1<<i));}permute([],0);return(sum%MOD+MOD)%MOD;}
const determinants=[];for(let t=0;t<35;t++){const n=1+rnd(6),a=Array.from({length:n},()=>Array.from({length:n},()=>rnd(2000000001)-1000000000));determinants.push([n+'\n'+textRows(a)+'\n',determinant(a)+'\n']);}
const triangle=Array.from({length:200},(_,i)=>Array.from({length:200},(_,j)=>j<i?0:j===i?2:rnd(100)));
determinants.push(['200\n'+textRows(triangle)+'\n',(2n**200n%MOD)+'\n'],['2\n0 1\n1 0\n','1000000006\n'],['2\n1 2\n2 4\n','0\n']);
Object.assign(remainingMathCases,{'matrix-products':[matrices],'matrix-powers':[powers],'gaussian-elimination':[gaussians],'xor-determinants':[xors,determinants]});

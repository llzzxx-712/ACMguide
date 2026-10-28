import assert from 'node:assert/strict';

// The expected results below come from enumeration or arithmetic identities,
// independently of the tutorial implementations. Inputs are deterministic.
let seed = 20261028;
function rnd(n) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return Math.floor(seed / 4294967296 * n); }
const rows = a => a.map(x => x.join(' ')).join('\n');
const gcd = (a,b) => { while (b) [a,b] = [b,a%b]; return a; };
const choose = (n,k) => { if (k < 0 || k > n) return 0n; k=Math.min(k,n-k); let v=1n; for(let i=1;i<=k;i++) v=v*BigInt(n-i+1)/BigInt(i); return v; };
const normalized = (a,m) => (a%m+m)%m;
function inv(a,m) { let [r,s,x,y]=[a,m,1n,0n]; while(s){const q=r/s; [r,s]=[s,r-q*s]; [x,y]=[y,x-q*y];} assert.equal(r,1n); return normalized(x,m); }
function inverseCase(a,b) {return [`${a} ${b}\n`, `${inv(BigInt(a),BigInt(b))}\n`];}
function crtBrute(c) {let l=1; for(const [m] of c) l=l/gcd(l,m)*m; let x=0; while(x<l && !c.every(([m,r])=>x%m===r%m)) x++; assert.ok(x<l); return [c.length+'\n'+rows(c)+'\n',x+'\n'];}
function crtKnown(mods,x) { const gcdB=(a,b)=>b?gcdB(b,a%b):a; let period=1n; for(const m of mods)period=period/gcdB(period,m)*m; x=normalized(x,period); return [mods.length+'\n'+mods.map(m=>`${m} ${x%m}`).join('\n')+'\n',`${x}\n`]; }
function visible(n) {let count=0;for(let x=0;x<n;x++)for(let y=0;y<n;y++)if((x||y)&&gcd(x,y)===1)count++;return count;}
function phiByTrial(x) {let n=x,result=x;for(let p=2;p*p<=n;p++)if(n%p===0){result=result/p*(p-1);while(n%p===0)n/=p;}if(n>1)result=result/n*(n-1);return result;}
function visibleLarge(n) {if(n===1)return 0;let sum=0;for(let i=1;i<n;i++)sum+=phiByTrial(i);return 2*sum+1;}
function divPrefix(n) {const root=Math.floor(Math.sqrt(n));let sum=0n;for(let i=1;i<=root;i++)sum+=BigInt(Math.floor(n/i));return 2n*sum-BigInt(root)*BigInt(root);}
const DM=998244353n;
function divisorCase(l,r){return [`${l} ${r}\n`,`${normalized(divPrefix(r)-divPrefix(l-1),DM)}\n`];}
function coeffCase(a,b,k,n) {const m=k-n;return [`${a} ${b} ${k} ${n} ${m}\n`,`${choose(k,n)*(BigInt(a)**BigInt(n))*(BigInt(b)**BigInt(m))%10007n}\n`];}
// Enumerate each type's count, so identical face values still represent different types.
function coinCount(c,d,s) {let total=0n;function walk(i,remaining){if(i===4){if(remaining===0)total++;return;}for(let k=0;k<=d[i]&&k*c[i]<=remaining;k++)walk(i+1,remaining-k*c[i]);}walk(0,s);return total;}
function coinCase(c,qs){return [`${c.join(' ')} ${qs.length}\n${rows(qs)}\n`,qs.map(q=>coinCount(c,q.slice(0,4),q[4])).join('\n')+'\n'];}
function derangement(n){let result=0n,f=1n;for(let i=2;i<=n;i++)f*=BigInt(i);let fac=1n;for(let i=0;i<=n;i++){if(i)fac*=BigInt(i);result+=(i%2?-1n:1n)*(f/fac);}return result;}
function catalan(n){return choose(2*n,n)/BigInt(n+1);}
function balls(n,k){let count=0;function walk(i,mask){if(i===n){if(mask===(1<<k)-1)count++;return;}for(let j=0;j<k;j++)walk(i+1,mask|(1<<j));}walk(0,0);return count;}
function ballsFormula(n,k){let a=0n;for(let j=0;j<=k;j++)a+=(j%2?-1n:1n)*choose(k,j)*BigInt(k-j)**BigInt(n);return a;}
function decimalCheck(expected, precision, tolerance){return output=>{let x=output.trim();return new RegExp(`^-?\\d+\\.\\d{${precision}}$`).test(x)&&Math.abs(Number(x)-expected)<=tolerance;};}
function wifiCase(sent,received){const goal=[...sent].reduce((a,c)=>a+(c==='+'?1:-1),0), positions=[...received].flatMap((c,i)=>c==='?'?[i]:[]);let yes=0;for(let mask=0;mask<2**positions.length;mask++){let p=0,q=0;for(const c of received){if(c==='?')p+=(mask&(1<<q++))?1:-1;else p+=c==='+'?1:-1;}if(p===goal)yes++;}const value=yes/2**positions.length;return [`${sent}\n${received}\n`,`${value.toFixed(12)}\n`,decimalCheck(value,12,1e-9)];}
// BigInt products compare exact joint probabilities before formatting; all have denominator 100^(m+1).
function bayesCase(prior,p,observed){const n=prior.length,m=observed.length,weights=prior.map((x,i)=>p[i].reduce((v,q,j)=>v*BigInt(observed[j]?q:100-q),BigInt(x)));const total=weights.reduce((a,b)=>a+b,0n);assert.ok(total>0n);const order=Array.from({length:n},(_,i)=>i).sort((a,b)=>weights[a]===weights[b]?a-b:weights[a]>weights[b]?-1:1);const expected=order.map(i=>`${i+1} ${(100*Number(weights[i])/Number(total)).toFixed(2)}`).join('\n')+'\n';const input=`${n} ${m}\n${prior.join(' ')}\n${rows(p)}\n${observed.filter(Boolean).length}\n${observed.flatMap((v,i)=>v?[i+1]:[]).join(' ')}\n`;return [input,expected,out=>{const lines=out.trim().split(/\r?\n/);if(lines.length!==n)return false;return lines.every((line,j)=>{const match=/^(\d+) (\d+\.\d{2})$/.exec(line);if(!match||Number(match[1])!==order[j]+1)return false;return Math.abs(Number(match[2])-100*Number(weights[order[j]])/Number(total))<=0.00501;});}];}
function diceCase(ns) {const values=ns.map(n=>{let s=0;for(let i=1;i<=n;i++)s+=n/i;return s;});return [ns.length+'\n'+ns.join('\n')+'\n',values.map(x=>x.toFixed(2)).join('\n')+'\n',out=>{const lines=out.trim().split(/\r?\n/);return lines.length===ns.length&&lines.every((s,i)=>/^\d+\.\d{2}$/.test(s)&&Math.abs(Number(s)-values[i])<=0.00501);}];}
function matrixCase(a,b){const r=a.length,s=b.length,t=b[0].length;const c=a.map(row=>Array.from({length:t},(_,j)=>row.reduce((sum,x,k)=>sum+x*b[k][j],0)));return [`${r} ${s} ${t}\n${rows(a)}\n${rows(b)}\n`,rows(c)+'\n'];}

export function applyRealMathCases(cases) {
  const keys=['extended-gcd','chinese-remainder','linear-sieve-phi','division-blocks','factorial-combinations','inclusion-exclusion','derangements-catalan','stirling-balls','probability-events','conditional-bayes','expectation-linearity','matrix-products'];
  for(const key of keys)assert.ok(Array.isArray(cases[key])&&cases[key].length>=1,`Missing case blocks: ${key}`);
  const inverses=[];for(let i=0;i<50;i++){const b=2+rnd(300),a=2+rnd(300);if(gcd(a,b)===1)inverses.push(inverseCase(a,b));}inverses.push(inverseCase(1999999999,2000000000),inverseCase(2000000000,1999999999),inverseCase(2,3));
  const crts=[];for(let t=0;t<35;t++){const x=rnd(200),c=Array.from({length:1+rnd(4)},()=>{const m=1+rnd(9);return [m,x%m+(rnd(3)*m)];});crts.push(crtBrute(c));}crts.push(crtKnown([999983n,999999999989n],876543210987654321n),crtKnown([999999937n,999999929n],98765432101234567n),crtKnown([1000000000000n,1000000n],999999999999n),crtBrute([[1,0],[1,0]]));
  const vis=[1,2,3,4,5,10,...Array.from({length:30},()=>1+rnd(50))].map(n=>[`${n}\n`,`${visible(n)}\n`]);vis.push(['40000\n',`${visibleLarge(40000)}\n`]);
  const divs=[];for(let t=0;t<35;t++){const l=1+rnd(1000),r=l+rnd(250);let sum=0;for(let x=l;x<=r;x++)for(let d=1;d<=x;d++)if(x%d===0)sum++;divs.push([`${l} ${r}\n`,`${sum%Number(DM)}\n`]);}divs.push(...[[1,1],[1,5],[100,100],[1,1000000000000],[999999000000,1000000000000]].map(([l,r])=>divisorCase(l,r)));
  const coeff=[];for(let t=0;t<35;t++){const k=rnd(30);coeff.push(coeffCase(rnd(30),rnd(30),k,rnd(k+1)));}coeff.push(coeffCase(0,0,0,0),coeffCase(1000000,1000000,1000,500),coeffCase(0,5,1000,1000),coeffCase(5,0,1000,1000));
  const coins=[];for(let t=0;t<30;t++){const c=Array.from({length:4},()=>1+rnd(8));const qs=Array.from({length:4},()=>[...Array.from({length:4},()=>1+rnd(6)),1+rnd(44)]);coins.push(coinCase(c,qs));}const qmax=[100000,100000,100000,100000,100000];coins.push([`1 1 1 1 1\n${qmax.join(' ')}\n`,`${choose(100003,3)}\n`],coinCase([1,2,3,4],[[1,1,1,1,5],[1,1,1,1,12]]));
  const der=Array.from({length:20},(_,i)=>[`${i+1}\n`,`${derangement(i+1)}\n`]);
  const cats=Array.from({length:18},(_,i)=>[`${i+1}\n`,`${catalan(i+1)}\n`]);
  const ball=[];for(let n=1;n<=7;n++)for(let k=1;k<=Math.min(n,4);k++)ball.push([`${n} ${k}\n`,`${balls(n,k)}\n`]);for(const [n,k] of [[10,1],[10,2],[10,5],[10,10]])ball.push([`${n} ${k}\n`,`${ballsFormula(n,k)}\n`]);
  const wifi=[wifiCase('+-','??'),wifiCase('+++','???'),wifiCase('---','+++'),wifiCase('+'.repeat(10),'?'.repeat(10))];for(let i=0;i<40;i++){const n=1+rnd(10),sent=Array.from({length:n},()=>rnd(2)?'+':'-').join(''),received=Array.from({length:n},()=>['+','-','?'][rnd(3)]).join('');wifi.push(wifiCase(sent,received));}
  const bayes=[];for(let t=0;t<35;t++){const n=2+rnd(5),m=1+rnd(5);let cuts=Array.from({length:n-1},()=>rnd(101)).sort((a,b)=>a-b),prev=0,prior=cuts.concat(100).map(x=>{const v=x-prev;prev=x;return v;});const p=Array.from({length:n},()=>Array.from({length:m},()=>10+rnd(81)));const seen=Array.from({length:m},()=>rnd(2));if(!seen.some(Boolean))seen[rnd(m)]=1;bayes.push(bayesCase(prior,p,seen));}
  bayes.push(bayesCase([25,25,50],[[20,80],[80,20],[50,50]],[1,1]),bayesCase([50,50],[[50,70],[70,50]],[1,1]),bayesCase([30,60,10],[[40,75],[50,30],[0,0]],[1,1]),bayesCase([50,50],[[99,1],[1,99]],[1,0]),bayesCase(Array(40).fill(0).map((_,i)=>i===39?100:0),Array.from({length:40},()=>Array(20).fill(99)),Array(20).fill(1)));
  const dice=[diceCase([1,2,3,12,1000]),diceCase(Array.from({length:40},()=>1+rnd(1000)))];
  const matrices=[];for(let t=0;t<30;t++){const r=1+rnd(6),s=1+rnd(6),c=1+rnd(6);matrices.push(matrixCase(Array.from({length:r},()=>Array.from({length:s},()=>rnd(2001)-1000)),Array.from({length:s},()=>Array.from({length:c},()=>rnd(2001)-1000))));}matrices.push(matrixCase([[1,-2],[3,4]],[[-5,6],[7,-8]]),matrixCase(Array.from({length:100},()=>Array(100).fill(1000)),Array.from({length:100},()=>Array(100).fill(-1000))));
  for(const [key,value] of Object.entries({'extended-gcd':inverses,'chinese-remainder':crts,'linear-sieve-phi':vis,'division-blocks':divs,'factorial-combinations':coeff,'inclusion-exclusion':coins,'stirling-balls':ball,'probability-events':wifi,'conditional-bayes':bayes,'expectation-linearity':dice,'matrix-products':matrices}))cases[key][0]=value;
  cases['derangements-catalan'][0]=der;
  cases['derangements-catalan'][1]=cats;
}

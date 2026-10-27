let seed=20261030;
const rnd=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n;};
const line=a=>a.join(' ')+'\n';
function sums(a,k){let answer=0;for(let l=0;l<a.length;l++){let sum=0;for(let r=l;r<a.length;r++){sum+=a[r];if(sum===k)answer++;}}return[`${a.length} ${k}\n`+line(a),answer+'\n'];}
function maximum(a){let best=-Infinity;for(let l=0;l<a.length;l++){let sum=0;for(let r=l;r<a.length;r++){sum+=a[r];best=Math.max(best,sum);}}return[a.length+'\n'+line(a),best+'\n'];}
function inversions(a){let answer=0;for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)if(a[i]>a[j])answer++;return[a.length+'\n'+line(a),answer+'\n'];}
function jumpOracle(next,x,k){const order=[],seen=new Map();while(!seen.has(x)){seen.set(x,order.length);order.push(x);x=next[x-1];}if(k<BigInt(order.length))return order[Number(k)];const start=seen.get(x),length=order.length-start;return order[start+Number((k-BigInt(start))%BigInt(length))];}
function jumping(next,queries){return[`${next.length} ${queries.length}\n`+line(next)+queries.map(([x,k])=>`${x} ${k}\n`).join(''),queries.map(([x,k])=>jumpOracle(next,x,k)+'\n').join('')];}
function ranges(a,queries){return[`${a.length} ${queries.length}\n`+a.join('\n')+'\n'+queries.map(line).join(''),queries.map(([l,r])=>{const part=a.slice(l-1,r);return Math.max(...part)-Math.min(...part)+'\n';}).join('')];}
function hashCase(s,queries){return[`${s} ${queries.length}\n`+queries.map(line).join(''),queries.map(([l,r,x,y])=>(s.slice(l-1,r)===s.slice(x-1,y)?'Yes':'No')+'\n').join('')];}
function prefixOracle(s){return Array.from({length:s.length},(_,i)=>{const part=s.slice(0,i+1);let best=0;for(let k=1;k<part.length;k++)if(part.slice(0,k)===part.slice(-k))best=k;return best;});}
function matching(s,p){const positions=[];for(let i=0;i+p.length<=s.length;i++)if(s.startsWith(p,i))positions.push(i+1);return[s+'\n'+p+'\n',positions.map(x=>x+'\n').join('')+line(prefixOracle(p))];}
function period(s){let best=s.length;for(let p=1;p<=s.length;p++){let works=true;for(let i=p;i<s.length;i++)if(s[i]!==s[i-p]){works=false;break;}if(works){best=p;break;}}return[s.length+'\n'+s+'\n',best+'\n'];}
function names(words,queries){const valid=new Set(words),called=new Set();return[words.length+'\n'+words.join('\n')+'\n'+queries.length+'\n'+queries.join('\n')+'\n',queries.map(q=>{if(!valid.has(q))return'WRONG\n';if(called.has(q))return'REPEAT\n';called.add(q);return'OK\n';}).join('')];}
function xor(a){let best=0;for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)best=Math.max(best,a[i]^a[j]);return[a.length+'\n'+line(a),best+'\n'];}
const small=Array.from({length:36},()=>Array.from({length:1+rnd(45)},()=>rnd(31)-15));
const word=length=>Array.from({length},()=>String.fromCharCode(97+rnd(4))).join('');
export const prefixSumCases=[sums([1,-1,0],0),sums([0],0),sums([1,-2,3,-2,1],-1),...small.map(a=>sums(a,rnd(21)-10)),['200000 0\n'+'0 '.repeat(200000)+'\n','20000100000\n'],['200000 100000000000000\n'+'1000000000 '.repeat(200000)+'\n','100001\n']];
export const divideStringCases={
    'divide-conquer':[[maximum([-2,3,-1,2,-5]),maximum([-8,-2,-9]),maximum([0]),...small.map(maximum)]],
    'merge-inversions':[[inversions([4,2,2,1]),inversions([1]),inversions([7,7,7]),...small.map(a=>inversions(a.map(x=>x+16)))]],
    'binary-lifting':[[jumping([2,3,4,5,3],[[1,0n],[1,3n],[1,13n],[5,4n]]),jumping([1],[[1,0n],[1,1n<<59n],[1,10n**18n]]),...Array.from({length:28},()=>{const n=1+rnd(25),next=Array.from({length:n},()=>1+rnd(n));return jumping(next,Array.from({length:30},()=>[1+rnd(n),(BigInt(rnd(1000000))*(1n<<40n)+BigInt(rnd(1000000)))%(10n**18n+1n)]));})]],
    'sparse-table':[[ranges([2,6,4,8,1],[[1,3],[2,5],[4,4],[1,5]]),ranges([1],[[1,1]]),...Array.from({length:28},()=>{const n=1+rnd(70),a=Array.from({length:n},()=>1+rnd(1000000));return ranges(a,Array.from({length:50},()=>{const l=1+rnd(n),r=1+rnd(n);return[Math.min(l,r),Math.max(l,r)];}));})]],
    'substring-hash':[[hashCase('abcabc',[[1,3,4,6],[1,2,2,3],[1,3,1,2]]),hashCase('a',[[1,1,1,1]]),...Array.from({length:32},()=>{const n=1+rnd(70),s=word(n);return hashCase(s,Array.from({length:80},()=>{const l=1+rnd(n),r=1+rnd(n),x=1+rnd(n),y=1+rnd(n);return[Math.min(l,r),Math.max(l,r),Math.min(x,y),Math.max(x,y)];}));})]],
    kmp:[[matching('ABABABAC','ABABAC'),matching('AAA','AA'),matching('A','B'),matching('AA','AAAA'),matching('AAAA','A'),...Array.from({length:34},()=>matching(word(1+rnd(80)).toUpperCase(),word(1+rnd(18)).toUpperCase()))]],
    'string-periods':[[...['cabcabca','abababa','ababab','abc','a','aaaa','abacaba'].map(period),...Array.from({length:34},()=>period(word(1+rnd(65))))]],
    trie:[
        [names(['ab','ac'],['ab','a','ab','ac','ad']),names(['a','ab','abc','b'],['abc','ab','a','b','abc','abcd']),...Array.from({length:26},()=>{const words=[...new Set(Array.from({length:30},()=>word(1+rnd(14))))];return names(words,Array.from({length:80},()=>rnd(2)?words[rnd(words.length)]:word(1+rnd(14))));})],
        [xor([5,2,7]),xor([0,0]),xor([0,2147483647]),xor([1073741824,0,1]),...Array.from({length:32},()=>xor(Array.from({length:2+rnd(65)},()=>rnd(2147483648))))]
    ]
};
const nInv=500000;
divideStringCases['merge-inversions'][0].push([nInv+'\n'+line(Array.from({length:nInv},(_,i)=>nInv-i)),nInv*(nInv-1)/2+'\n']);
divideStringCases['divide-conquer'][0].push(['200000\n'+'-2 '.repeat(199999)+'-1\n','-1\n']);
const nJump=200000;
divideStringCases['binary-lifting'][0].push([`${nJump} 3\n`+line(Array.from({length:nJump},(_,i)=>(i+1)%nJump+1))+'1 1000000000000000000\n200000 1\n12345 0\n','1\n1\n12345\n']);
const nRange=50000,qRange=180000;
const rangeQueries=Array.from({length:qRange},()=>{const l=1+rnd(nRange),r=1+rnd(nRange);return[Math.min(l,r),Math.max(l,r)];});
divideStringCases['sparse-table'][0].push([`${nRange} ${qRange}\n`+line(Array.from({length:nRange},(_,i)=>i+1))+rangeQueries.map(line).join(''),rangeQueries.map(([l,r])=>r-l+'\n').join('')]);
divideStringCases['substring-hash'][0].push(hashCase('ab'.repeat(50000),[[1,99999,2,100000],[1,99998,3,100000],[1,100000,1,100000]]));
divideStringCases.kmp[0].push(['A'.repeat(999999)+'B\n'+'A'.repeat(500000)+'B\n','500000\n'+line([...Array.from({length:500000},(_,i)=>i),0])]);
divideStringCases['string-periods'][0].push(['1000000\n'+'a'.repeat(1000000)+'\n','1\n']);
function nameId(i){let s='';for(let j=0;j<4;j++){s=String.fromCharCode(97+i%26)+s;i=Math.floor(i/26);}return s;}
const longNames=Array.from({length:10000},(_,i)=>Array.from({length:46},()=>String.fromCharCode(97+rnd(26))).join('')+nameId(i));
divideStringCases.trie[0].push(names(longNames,[...longNames,longNames[0],longNames[9999],longNames[3].slice(0,49)]));
const manyNumbers=[0,2147483647,...Array.from({length:99998},()=>rnd(2147483648))];
divideStringCases.trie[1].push([manyNumbers.length+'\n'+line(manyNumbers),'2147483647\n']);

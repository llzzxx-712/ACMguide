// Independent input models for the complete programs in the second block.
let seed = 20261027;
function rnd(n) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed % n;
}
function shuffle(a) {
  for (let i=a.length-1;i>0;i--) {
    const j=rnd(i+1);
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function tournament(values) {
  let players=values.map((power,i)=>({power,id:i+1}));
  while (players.length>2) {
    const next=[];
    for (let i=0;i<players.length;i+=2) next.push(players[i].power>players[i+1].power?players[i]:players[i+1]);
    players=next;
  }
  return [Math.log2(values.length)+'\n'+values.join(' ')+'\n',(players[0].power<players[1].power?players[0].id:players[1].id)+'\n'];
}
function tree(n) {
  const left=Array(n+1).fill(0), right=Array(n+1).fill(0);
  const slots=[[1,0],[1,1]];
  const labels=[1,...shuffle(Array.from({length:n-1},(_,i)=>i+2))];
  for (let i=1;i<n;i++) {
    const slot=slots.splice(rnd(slots.length),1)[0];
    (slot[1]===0?left:right)[slot[0]]=labels[i];
    slots.push([labels[i],0],[labels[i],1]);
  }
  const pre=[],inorder=[],post=[];
  let depth=0;
  function visit(u,d) {
    if(!u)return;
    depth=Math.max(depth,d);
    pre.push(u);visit(left[u],d+1);inorder.push(u);visit(right[u],d+1);post.push(u);
  }
  visit(1,1);
  const input=n+'\n'+Array.from({length:n},(_,i)=>`${left[i+1]} ${right[i+1]}\n`).join('');
  return {n,left,right,pre,inorder,post,depth,input};
}
const smallTrees=Array.from({length:32},(_,i)=>tree(1+i%26));
function letter(u,upper=false){return String.fromCharCode((upper?64:96)+u);}
function characterTree(t) {
  const descriptions=[1,...shuffle(Array.from({length:t.n-1},(_,i)=>i+2))].map(u=>letter(u)+(t.left[u]?letter(t.left[u]):'*')+(t.right[u]?letter(t.right[u]):'*'));
  return [t.n+'\n'+descriptions.join('\n')+'\n',t.pre.map(u=>letter(u)).join('')+'\n'];
}
function chain(n,left) {
  return n+'\n'+Array.from({length:n},(_,i)=>i+1===n?'0 0\n':left?`${i+2} 0\n`:`0 ${i+2}\n`).join('');
}
function chainTraversal(n,left) {
  const ascending=Array.from({length:n},(_,i)=>i+1).join(' ');
  const descending=Array.from({length:n},(_,i)=>n-i).join(' ');
  return [chain(n,left),ascending+'\n'+(left?descending:ascending)+'\n'+descending+'\n'];
}
function bst(values,queries) {
  return [values.length+' '+queries.length+'\n'+values.join(' ')+'\n'+queries.join(' ')+'\n',queries.map(x=>(values.includes(x)?'Yes':'No')+'\n').join('')];
}
// Sort and scan a plain list for every removal, instead of an ordered set / lower_bound.
function wood(ops) {
  const values=[],out=[];
  for(const [op,x] of ops) {
    if(op===1) {
      if(values.includes(x))out.push('Already Exist');else values.push(x);
    } else if(!values.length) out.push('Empty');
    else {
      values.sort((a,b)=>Math.abs(a-x)-Math.abs(b-x)||a-b);
      out.push(String(values.shift()));
    }
  }
  return [ops.length+'\n'+ops.map(op=>op.join(' ')).join('\n')+'\n',out.join('\n')+(out.length?'\n':'')];
}
function records(ops) {
  const rows=[],out=[];
  for(const [op,name,value] of ops) {
    const index=rows.findIndex(row=>row[0]===name);
    if(op===1) {
      if(index<0)rows.push([name,value]);else rows[index][1]=value;
      out.push('OK');
    } else if(op===2)out.push(index<0?'Not found':String(rows[index][1]));
    else if(op===3) {out.push(index<0?'Not found':'Deleted successfully');if(index>=0)rows.splice(index,1);}
    else out.push(String(rows.length));
  }
  return [ops.length+'\n'+ops.map(op=>op.join(' ')).join('\n')+'\n',out.join('\n')+'\n'];
}
function strings(values) {
  const sorted=values.slice().sort();
  const count=sorted.filter((x,i)=>i===0||x!==sorted[i-1]).length;
  return [values.length+'\n'+values.join('\n')+'\n',count+'\n'];
}
// Connected components are found by an ordinary graph walk, without parent arrays.
function components(n,edges) {
  const graph=Array.from({length:n},()=>[]),group=Array(n).fill(-1);
  for(const [a,b] of edges){graph[a-1].push(b-1);graph[b-1].push(a-1);}
  let count=0;
  for(let v=0;v<n;v++)if(group[v]<0) {
    group[v]=count;
    const pending=[v];
    while(pending.length){const u=pending.pop();for(const w of graph[u])if(group[w]<0){group[w]=count;pending.push(w);}}
    count++;
  }
  return {group,count};
}
function relatives(n,edges,queries) {
  const groups=components(n,edges).group;
  return [`${n} ${edges.length} ${queries.length}\n`+edges.map(e=>e.join(' ')+'\n').join('')+queries.map(q=>q.join(' ')+'\n').join(''),queries.map(([a,b])=>(groups[a-1]===groups[b-1]?'Yes':'No')+'\n').join('')];
}
function villages(cases) {
  return [cases.map(([n,edges])=>`${n} ${edges.length}\n`+edges.map(e=>e.join(' ')+'\n').join('')).join('')+'0\n',cases.map(([n,edges])=>(components(n,edges).count-1)+'\n').join('')];
}
// P1892 only requires friendship edges and pairs sharing one explicitly known enemy.
// Build those original-person edges directly, avoiding the tutorial's auxiliary nodes.
function gangs(n,relations) {
  const edges=[],enemies=Array.from({length:n},()=>[]);
  for(const [kind,a,b] of relations) {
    if(kind==='F')edges.push([a,b]);
    else {enemies[a-1].push(b);enemies[b-1].push(a);}
  }
  for(const list of enemies)for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++)edges.push([list[i],list[j]]);
  return [`${n}\n${relations.length}\n`+relations.map(r=>r.join(' ')+'\n').join(''),components(n,edges).count+'\n'];
}
const nDeep=200000;
const treeInput='6\n2 3\n4 5\n0 6\n0 0\n0 0\n0 0\n';
export const afterJoiningCases={
  'tree-basics': [[tournament([5,9,7,3]),tournament([2147483647,-2147483648]),...Array.from({length:28},(_,i)=>tournament(shuffle(Array.from({length:2**(i%7+1)},(_,j)=>j*13-1000))))]],
  'tree-storage': [[[treeInput,'3\n'],...smallTrees.map(t=>[t.input,t.depth+'\n']),[chain(1000000,true),'1000000\n']]],
  'tree-traversals': [smallTrees.map(characterTree),[[treeInput,'1 2 4 5 3 6\n4 2 5 1 3 6\n4 5 2 6 3 1\n'],...smallTrees.map(t=>[t.input,[t.pre,t.inorder,t.post].map(a=>a.join(' ')+'\n').join('')]),chainTraversal(nDeep,true),chainTraversal(nDeep,false)]],
  'tree-reconstruction': [smallTrees.filter(t=>t.n<=8).map(t=>[t.inorder.map(u=>letter(u,true)).join('')+'\n'+t.post.map(u=>letter(u,true)).join('')+'\n',t.pre.map(u=>letter(u,true)).join('')+'\n']),[bst([5,2,8,3,7,9],[7,6,2]),bst([],[-1,0,1]),bst([1,1,1],[1,2]),bst(Array.from({length:1000},(_,i)=>i),[-1,0,999,1000]),...Array.from({length:20},()=>bst(Array.from({length:80},()=>rnd(200)-100),Array.from({length:40},()=>rnd(220)-110)))]],
  'ordered-sets': [[wood([[2,7],[1,4],[1,10],[1,4],[2,7],[2,7],[2,7],[1,7],[2,7]]),wood([[1,1],[1,1000000000],[2,1],[2,1000000000],[2,2]]),...Array.from({length:24},()=>wood(Array.from({length:100},()=>[1+rnd(2),1+rnd(30)])))]],
  maps: [[records([[4],[1,'Alice',90],[1,'Alice',95],[2,'Alice'],[2,'Bob'],[4],[3,'Alice'],[3,'Alice'],[4]]),records([[1,'ABCDEFGHIJKLMNOPQRST',2147483647],[1,'alice',1],[1,'Alice',2],[2,'ABCDEFGHIJKLMNOPQRST'],[4]]),...Array.from({length:24},()=>records(Array.from({length:100},()=>{const op=1+rnd(4);return op===4?[4]:op===1?[1,'name'+rnd(14),1+rnd(1000)]:[op,'name'+rnd(14)];})))]],
  'hash-basics': [[strings(['ab','ba','ab','AB','ba']),strings(['0']),strings(['a'.repeat(1500),'a'.repeat(1499)+'b','a'.repeat(1500)]),strings(Array.from({length:10000},(_,i)=>'id'+i)),...Array.from({length:24},()=>strings(Array.from({length:100},()=>['ab','ba','ABC','abc','01','1','same','word'+rnd(20)][rnd(8)])))]],
  dsu: [[relatives(5,[[1,2],[2,3],[4,5]],[[1,3],[1,4],[4,5],[2,2]]),relatives(1,[],[[1,1]]),relatives(5000,Array.from({length:4999},(_,i)=>[i+1,i+2]),[[1,5000],[2500,4999]]),...Array.from({length:28},()=>{const n=1+rnd(25);return relatives(n,Array.from({length:30},()=>[1+rnd(n),1+rnd(n)]),Array.from({length:40},()=>[1+rnd(n),1+rnd(n)]));})]],
  'dsu-size': [[villages([[6,[[1,2],[2,3],[4,5],[1,3]]],[1,[]]]),villages([[4,[]],[4,[[1,2],[2,3],[3,4],[1,2]]],[2,[]]]),...Array.from({length:24},()=>villages(Array.from({length:3},()=>{const n=1+rnd(20);return [n,Array.from({length:rnd(30)},()=>[1+rnd(n),1+rnd(n)])];})))],[gangs(5,[['F',1,2],['E',2,3],['F',3,4],['E',4,5]]),gangs(3,[['E',1,3],['E',2,3]]),gangs(5,[['F',1,1]]),...Array.from({length:28},()=>{const n=2+rnd(15),colors=Array.from({length:n},()=>rnd(2));return gangs(n,Array.from({length:35},()=>{const a=1+rnd(n),b=1+rnd(n);return [colors[a-1]===colors[b-1]?'F':'E',a,b];}));})]]
};

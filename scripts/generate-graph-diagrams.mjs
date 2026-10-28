import {mkdir,writeFile} from 'node:fs/promises';
import {graphs} from '../public/animations/graph-process/graphs.mjs';
import {graphSvg} from '../public/animations/graph-process/svg.mjs';
await mkdir('public/diagrams/graphs',{recursive:true});
for(const [key,graph] of Object.entries(graphs)) await writeFile(`public/diagrams/graphs/${key}.svg`,graphSvg(graph,{id:key})+'\n');
console.log(`Generated ${Object.keys(graphs).length} graph illustrations.`);

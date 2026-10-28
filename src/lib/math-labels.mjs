// Preserve the original TeX as an accessible name for the static vector output.
function walk(node, visit, inHeading = false) {
  inHeading ||= /^h[1-6]$/.test(node.tagName ?? '');
  visit(node, inHeading);
  for (const child of node.children ?? []) walk(child, visit, inHeading);
}

function headingMathText(source) {
  const symbols = {times:'×', cdot:'·', to:'→', le:'≤', leq:'≤', ge:'≥', geq:'≥', ne:'≠', neq:'≠', ldots:'…', cdots:'…', oplus:'⊕', sqrt:'√', log:'log ', min:'min ', max:'max ', bmod:' mod ', left:'', right:'', quad:' ', qquad:' '};
  return source.replace(/\\(?:mathrm|mathcal|operatorname|text)\{([^{}]*)\}/g,'$1')
    .replace(/\\([A-Za-z]+)/g,(_match,name)=>symbols[name] ?? name)
    .replace(/\\[,;! ]/g,' ').replace(/[{}]/g,'').trim();
}

function textContent(node) {
  return node.type === 'text' ? node.value : (node.children ?? []).map(textContent).join('');
}

export function captureMathSources() {
  return (tree, file) => {
    const sources = [];
    walk(tree, node => {
      if (node.tagName === 'code' && node.properties?.className?.includes('language-math')) {
        sources.push(textContent(node));
      }
    });
    file.data.mathSources = sources;
  };
}

export function labelMathOutput() {
  return (tree, file) => {
    const sources = file.data.mathSources ?? [];
    let index = 0;
    walk(tree, (node, inHeading) => {
      if (node.tagName !== 'mjx-container') return;
      const source = sources[index++];
      if (source === undefined) throw new Error('Missing source for a rendered formula');
      node.properties = {...node.properties, role: 'math', ariaLabel: source, dataMathSource: source};
      const svg = node.children?.find(child => child.tagName === 'svg');
      if (svg) {
        svg.properties.ariaHidden = true;
        // Astro collects heading text after typesetting; SVG paths have no text.
        if (inHeading) svg.children.unshift({type:'element', tagName:'title', properties:{}, children:[{type:'text', value:headingMathText(source)}]});
      }
    });
    if (index !== sources.length) throw new Error('Not all formulas were rendered');
  };
}

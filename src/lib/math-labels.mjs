// Preserve the original TeX as an accessible name for the static vector output.
function walk(node, visit) {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
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
    walk(tree, node => {
      if (node.tagName !== 'mjx-container') return;
      const source = sources[index++];
      if (source === undefined) throw new Error('Missing source for a rendered formula');
      node.properties = {...node.properties, role: 'math', ariaLabel: source, dataMathSource: source};
      const svg = node.children?.find(child => child.tagName === 'svg');
      if (svg) svg.properties.ariaHidden = true;
    });
    if (index !== sources.length) throw new Error('Not all formulas were rendered');
  };
}

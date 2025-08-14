
const greekAlphabets = [
  { name: "alpha", upper: "Α", lower: "α" },
  { name: "beta", upper: "Β", lower: "β" },
  { name: "gamma", upper: "Γ", lower: "γ" },
  { name: "delta", upper: "Δ", lower: "δ" },
  { name: "epsilon", upper: "Ε", lower: "ε" },
  { name: "zeta", upper: "Ζ", lower: "ζ" },
  { name: "eta", upper: "Η", lower: "η" },
  { name: "theta", upper: "Θ", lower: "θ" },
  { name: "iota", upper: "Ι", lower: "ι" },
  { name: "kappa", upper: "Κ", lower: "κ" },
  { name: "lambda", upper: "Λ", lower: "λ" },
  { name: "mu", upper: "Μ", lower: "μ" },
  { name: "nu", upper: "Ν", lower: "ν" },
  { name: "xi", upper: "Ξ", lower: "ξ" },
  { name: "omicron", upper: "Ο", lower: "ο" },
  { name: "pi", upper: "Π", lower: "π" },
  { name: "rho", upper: "Ρ", lower: "ρ" },
  { name: "sigma", upper: "Σ", lower: "σ" },
  { name: "tau", upper: "Τ", lower: "τ" },
  { name: "upsilon", upper: "Υ", lower: "υ" },
  { name: "phi", upper: "Φ", lower: "φ" },
  { name: "chi", upper: "Χ", lower: "χ" },
  { name: "psi", upper: "Ψ", lower: "ψ" },
  { name: "omega", upper: "Ω", lower: "ω" }
];

/**
 * @param {string} key 
 * @returns {string}
 */
export function escapeKey(key) {
  return Array.from(key).reduce((a, c) => {
      const gi = greekAlphabets.findIndex(g => [g.upper, g.lower].includes(c));
      a += (gi > -1) ? `|${greekAlphabets[gi].name}|` : c;
      return a;
    }, "")
    .toLocaleLowerCase()
    .replaceAll('|', '-')
    .replaceAll('’s', '')
    .replaceAll("'s", '')
    .replaceAll("'", '-')
    .replaceAll('"', '')
    .replaceAll(".", '')
    .replace(/[\s]+/g, '-')
    .replace(/[\u2605]/g, '*')
    .replace(/[^0-9a-z\*\-]/gi, '-')
    .replace(/[-]+/g, '-')
    .replace(/^[-]+/, '')
    .replace(/[-]+$/, '');
}

/**
 * @param {string} title 
 * @param {Object} listData 
 * @param {Array<string>} completed 
 * @returns {string}
 */
export function generateMarkdown(title, listData, completed) {
  const dataKeys = Object.keys(listData).filter(x => !x.startsWith('$'));
  if (dataKeys.length == 0) return;

  const isCompleted = (dataKey) => {
    return !!~completed.indexOf(dataKey);
  };

  const lines = [
    `# ${title}\n`
  ];

  const walkList = (dKey, list) => {
    for (const i in list) {
      const d = list[i];

      if (typeof d === 'string') {
        const key = `${dKey}/${escapeKey(d)}`;
        lines.push(` ${parseInt(i, 10) + 1}. ${isCompleted(key) ? '[x]' : '[ ]'} ${d}`);

      } else if (typeof d === 'object') {
        const t = d.name || d.code || d.title;
        const key = `${dKey}/${d.key || escapeKey(t)}`;

        if (Array.isArray(d.variants)) {
          lines.push(` ${parseInt(i, 10) + 1}. ${t}`);

          for (const v of d.variants) {
            if (typeof v === 'object') {
              const vt = v.name || v.code || v.title;
              const vkey = `${key}/${v.key || escapeKey(vt)}`;
              lines.push(`   - ${isCompleted(vkey) ? '[x]' : '[ ]'} ${vt}`);

            } else {
              const vkey = `${key}/${escapeKey(v)}`;
              lines.push(`   - ${isCompleted(vkey) ? '[x]' : '[ ]'} ${v}`);
            }
          }
          lines.push('');

        } else {
          lines.push(` ${parseInt(i, 10) + 1}. ${isCompleted(key) ? '[x]' : '[ ]'} ${t}`);
        }            
      }
    }
    lines.push('');
  };

  const walkSubList = (dKey, list, head) => {
    const keys = Object.keys(list);

    for (const k of keys) {
      const data = list[k];
      lines.push(`${head} ${data.title}\n`);

      if (typeof data.list === 'object') {
        if (Array.isArray(data.list)) {
          walkList(`${dKey}/${k}`, data.list);

        } else {
          walkSubList(`${dKey}/${k}`, data.list, head + '#');
        }
      }
    }
  };

  for (const key of dataKeys) {
    const data = listData[key];
    lines.push(`## ${data.title}\n`);

    if (typeof data.list === 'object') {
      if (Array.isArray(data.list)) {
        walkList(key, data.list);

      } else {
        walkSubList(key, data.list, '###');
      }
    }

    lines.push('--------------------------------------\n');
  }

  return lines.join('\n');
}
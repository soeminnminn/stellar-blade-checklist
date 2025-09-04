
//#region escape functions
const greekAlphabets = [
  { name: "Alpha", upper: "Α", lower: "α" },
  { name: "Beta", upper: "Β", lower: "β" },
  { name: "Gamma", upper: "Γ", lower: "γ" },
  { name: "Delta", upper: "Δ", lower: "δ" },
  { name: "Epsilon", upper: "Ε", lower: "ε" },
  { name: "Zeta", upper: "Ζ", lower: "ζ" },
  { name: "Eta", upper: "Η", lower: "η" },
  { name: "Theta", upper: "Θ", lower: "θ" },
  { name: "Iota", upper: "Ι", lower: "ι" },
  { name: "Kappa", upper: "Κ", lower: "κ" },
  { name: "Lambda", upper: "Λ", lower: "λ" },
  { name: "Mu", upper: "Μ", lower: "μ" },
  { name: "Nu", upper: "Ν", lower: "ν" },
  { name: "Xi", upper: "Ξ", lower: "ξ" },
  { name: "Omicron", upper: "Ο", lower: "ο" },
  { name: "Pi", upper: "Π", lower: "π" },
  { name: "Rho", upper: "Ρ", lower: "ρ" },
  { name: "Sigma", upper: "Σ", lower: "σ" },
  { name: "Tau", upper: "Τ", lower: "τ" },
  { name: "Upsilon", upper: "Υ", lower: "υ" },
  { name: "Phi", upper: "Φ", lower: "φ" },
  { name: "Chi", upper: "Χ", lower: "χ" },
  { name: "Psi", upper: "Ψ", lower: "ψ" },
  { name: "Omega", upper: "Ω", lower: "ω" }
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
    .replaceAll('“', '')
    .replaceAll('”', '')
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
 * @param {string} text 
 * @returns {string}
 */
export function escapeGreekAlphabets(text) {
  return Array.from(text).reduce((s, c) => {
    const giu = greekAlphabets.findIndex(g => g.upper === c);
    const gil = greekAlphabets.findIndex(g => g.lower === c);

    if (giu > -1) {
      s += `&${greekAlphabets[giu].name};`

    } else if (gil > -1) {
      s += `&${greekAlphabets[gil].name.toLocaleLowerCase()};`

    } else {
      s += c;
    }

    return s;
  }, "");
}
//#endregion

//#region generate export functions
/**
 * @param {string} title 
 * @param {Object[]} gameModes 
 * @param {Object[]} regions 
 * @param {Object} listData 
 * @param {Array<string>} completed 
 * @returns {string}
 */
export function generateMarkdown(title, gameModes, regions, listData, completed) {
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

  lines.push(`## ${gameModes.title}\n`);
  for (const i in gameModes.list) {
    const mode = gameModes.list[i];
    lines.push(` ${parseInt(i, 10) + 1}. ${mode.completed ? '[x]' : '[ ]'} ${mode.title}`);
  }
  lines.push('\n--------------------------------------\n');

  lines.push(`## ${regions.title}\n`);
  for (const i in regions.list) {
    const region = regions.list[i];
    lines.push(` ${parseInt(i, 10) + 1}. ${region.completed ? '[x]' : '[ ]'} ${region.title}`);
  }
  lines.push('\n--------------------------------------\n');

  for (const key of dataKeys) {
    const data = listData[key];
    if (!data) continue;

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
//#endregion

//#region conditional functions

/**
 * @param {Record<string, any>} conditions 
 * @param {Record<string, any>} values 
 * @returns {boolean}
 */
export function conditional(conditions, values) {
  const conditionOpRegex = /^(==|!=|<=|<|>=|>|in)[\s]{1,}(.*)$/;

  const fields = Object.keys(values);

  const execCondition = (conditionStr, value, defRes) => {
    const matches = conditionOpRegex.exec(conditionStr.trim());
    if (!matches) return defRes;

    const operator = matches[1];
    let valueIs;
    try {
      const temp = JSON.parse(`[${matches[2].trim()}]`);
      if (!Array.isArray(temp)) return defRes;
      if (temp.length !== 1) return defRes;

      valueIs = temp[0];

    } catch {
      return defRes;
    }

    switch (operator) {
      case '==':
        return value == valueIs;
      case '!=':
        return value != valueIs;
      case '<=':
        return value <= valueIs;
      case '<':
        return value < valueIs;
      case '>=':
        return value >= valueIs;
      case '>':
        return value > valueIs;
      case 'in':
        if (Array.isArray(valueIs)) {
          return value !== '' && valueIs.includes(value);
        }
        return defRes;
      default:
        return defRes;
    }
  };

  const andCondition = (con) => {
    if (typeof con !== 'object') return false;

    let res = true;

    const keys = Object.keys(con);
    for (const k of keys) {
      const c = con[k];

      if (fields.includes(k)) {

        if (typeof c === 'object') {
          if (Array.isArray(c)) {
            res = res && orCondition(c, k);
          } else {
            res = res && andCondition(c);
          }

        } else {
          let op = c;
          if (typeof c === 'number' || typeof c === 'boolean' || c === null) {
            op = `== ${c}`;
          }

          if (typeof op === 'string' && conditionOpRegex.test(op.trim())) {
            res = res && execCondition(op, values[k], true);
          }
        }
      }
    }
    return res;
  };

  const orCondition = (con, field) => {
    if (typeof con !== 'object' || !Array.isArray(con)) return false;

    let res = false;
    for (const i in con) {
      const c = con[i];

      if (typeof c === 'object') {
        if (Array.isArray(c)) {
          res = res || orCondition(c);
        } else {
          res = res || andCondition(c);
        }

      } else if (field && typeof c === 'string') {
        res = res || execCondition(c, values[field], false);

      }
    }

    return res;
  };

  let result = false;

  if (typeof conditions === 'object') {
    if (Array.isArray(conditions)) {
      result = orCondition(conditions);
    } else {
      result = andCondition(conditions);
    }
  }

  return result;
}
//#endregion

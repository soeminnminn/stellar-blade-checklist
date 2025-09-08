/**
 * @param {string} str 
 * @returns {string}
 */
export function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

class StringLiteral {
  /**
   * @constructor
   * @param {string} input 
   * @param {number} [lastIndex] 
   */
  constructor(input, lastIndex = 0) {
    const quoteChars = ['"', "'", "`"];
    const re = new RegExp(`(?:(^[${escapeRegExp(quoteChars.join(''))}])|(?:[^\\\\]([${escapeRegExp(quoteChars.join(''))}])))`, 'g');
    re.lastIndex = lastIndex;

    this.matches = [];
    let match = re.exec(input);
    while (match) {
      if (match[1]) {
        this.matches.push({ quote: match[1], index: match.index });

      } else if (match[2]) {
        this.matches.push({ quote: match[2], index: match.index + 1 });
      }

      re.lastIndex = match.index + 1;
      match = re.exec(input);
    }

    this.input = input;
    this.index = 0;
  }

  [Symbol.iterator]() {
    return this;
  }

  /**
   * @returns {{ value: RegExpExecArray|null, done: boolean }}
   */
  next() {
    const input = this.input;
    const matches = this.matches;
    const found = [-1, -1];

    for (let i = this.index; i < matches.length; i++) {
      const m = matches[i];
      const nextI = matches.findIndex((x, xi) => xi > i && x.quote === m.quote);
      if (nextI > i) {
        found[0] = m.index;
        found[1] = matches[nextI].index;
        this.index = nextI + 1;
        break;
      }

      this.index = i;
    }

    if (found[0] > -1 && found[1] > -1) {
      const result = [
        input.slice(found[0], found[1] + 1),
        input.charAt(found[0]),
        input.slice(found[0] + 1, found[1]),
        input.charAt(found[1]),
      ];
      result.index = found[0];
      result.input = input;
      result.groups = undefined;

      return {
        value: result,
        done: false
      };
    }

    return {
      value: null,
      done: true,
    };
  }
}

const conditionsCache = [];

/**
 * @param {string} expr 
 * @param {object} obj 
 * @returns {boolean}
 * @example 
 *   const expr = "(field1 == 1 && field2 in ['a', 'b']) || (field1 in [1, 2]) || (field1 % 2 == 1)";
 *   const isMatch = conditionMatcher(expr, { field1: 1, field2: 'a' });
 */
function conditionMatcher(expr, obj) {
  const input = expr.trim();

  const cacheIdx = conditionsCache.findIndex(x => x.input === input);
  if (cacheIdx > -1) {
    const fn = conditionsCache[cacheIdx].fn;
    return fn.call(obj, obj);
  }

  const fields = Object.keys(obj);

  const allowed = [
    ...Object.keys(obj),
    '===', '!==', '==', '!=', '>=', '<=', 'in', '&&', '||', '>', '<', '%', '!', '~', '/', '*',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', ' ', '#', ',', '.',
    '"', "'", "`", '(', ')', '[', ']',
  ];

  let cleanStr = input;
  const st = Array.from(new StringLiteral(input));
  for (const s of st) {
    let temp = cleanStr.slice(0, s.index + 1);
    let i = s.index + 1;
    for (; i < (s.index + s[0].length) - 1; i++) {
      temp += '#';
    }
    temp += cleanStr.slice(i);
    cleanStr = temp;
  }

  const re = new RegExp(`(${allowed.map(x => escapeRegExp(x)).join('|')})`, 'g');
  const placeholders = cleanStr.replaceAll(re, (ss) => {
    const a = new Array(ss.length);
    return a.fill('#').join('');
  });

  if (/^[#]+$/.test(placeholders)) {
    const fieldMatches = [];
    for (const f of fields) {
      const fRe = new RegExp(`(${escapeRegExp(f)})`, 'g');
      let match = fRe.exec(cleanStr);
      while (match) {
        fieldMatches.push({
          input: f,
          replace: `obj.${f}`,
          index: match.index,
        });
        fRe.lastIndex = match.index + 1;
        match = fRe.exec(cleanStr);
      }
    }
    fieldMatches.sort((a, b) => a.index - b.index);

    let fPreIdx = 0;
    let fieldedInput = '';
    let fieldedClean = '';
    for (const fExpr of fieldMatches) {
      let temp = input.slice(fPreIdx, fExpr.index);
      fieldedInput += temp + fExpr.replace;

      temp = cleanStr.slice(fPreIdx, fExpr.index);
      fieldedClean += temp + fExpr.replace;

      fPreIdx = fExpr.index + fExpr.input.length;
    }
    fieldedInput += input.slice(fPreIdx);
    fieldedClean += cleanStr.slice(fPreIdx);

    const inMatches = [];
    for (const f of fields) {
      const inRe = new RegExp(`(obj[\.]${escapeRegExp(f)})([\\s]+in[\\s]+)(\\[[^\\]]+\\])`, 'g');
      let match = inRe.exec(fieldedClean);
      while (match) {
        const idx = match.index + match[1].length + match[2].length;
        const val = fieldedInput.slice(idx, idx + match[3].length);

        inMatches.push({
          input: `${match[1]}${match[2]}${val}`,
          replace: `${val}.includes(${match[1]})`,
          index: match.index
        });
        inRe.lastIndex = match.index + 1;
        match = inRe.exec(fieldedClean);
      }
    }

    let escaped = fieldedClean;

    for (const inExpr of inMatches) {
      let temp = escaped.slice(0, inExpr.index);
      temp += inExpr.replace;
      temp += escaped.slice(inExpr.index + inExpr.input.length);
      escaped = temp;
    }
    
    try {
      const fn = new Function('obj', `return (${escaped});`);
      const result = fn.call(obj, obj);
      conditionsCache.push({ input, fn });
      return result;
    } catch (e) {
      console.error(e);
    }
  }

  return false;
}

/**
 * @param {string|Record<string, any>} conditions 
 * @param {Record<string, any>} values 
 * @returns {boolean}
 */
export default function conditional(conditions, values) {
  const conditionOpRegex = /^(==|!=|<=|>=|<|>|in)[\s]{1,}(.*)$/;

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
  
  if (typeof conditions === 'string') {
    result = conditionMatcher(conditions, values);

  } else if (typeof conditions === 'object') {
    if (Array.isArray(conditions)) {
      result = orCondition(conditions);
    } else {
      result = andCondition(conditions);
    }
  }

  return result;
}
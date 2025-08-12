
// https://raw.githubusercontent.com/pinguinjkeke/vue-local-storage
function getDefaultStorage(testKey) {
  try {
    // Access to global `localStorage` property must be guarded as it
    // fails under iOS private session mode.
    if (typeof global !== 'undefined') {
      const ls = global.localStorage;
      ls.setItem(testKey, 'foo');
      ls.removeItem(testKey);
      return ls;
    }

    if (typeof globalThis !== 'undefined') {
      const ls = globalThis.localStorage;
      ls.setItem(testKey, 'foo');
      ls.removeItem(testKey);
      return ls;
    }
    
  } catch (e) {
    console.log(e.message);
  }

  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
}

export default class LocalStorage {
  /**
   * LocalStorage constructor
   */
  constructor(namespace) {
    this._properties = {};
    this._namespace = namespace || 'ls';
    this._localStorage = getDefaultStorage(`${namespace}.test-key`);
  }

  /**
   * Namespace getter.
   *
   * @returns {string}
   */
  get namespace() {
    return this._namespace;
  }

  /**
   * Namespace setter.
   *
   * @param {string} value
   */
  set namespace(value) {
    this._namespace = value ? `${value}.` : '';
  }

  /**
   * Concatenates localStorage key with namespace prefix.
   *
   * @param {string} lsKey
   * @returns {string}
   * @private
   */
  _getLsKey(lsKey) {
    return [this._namespace, lsKey].filter(Boolean).join('-');
  }

  /**
   * Set a value to localStorage giving respect to the namespace.
   *
   * @param {string} lsKey
   * @param {*} rawValue
   * @param {*} type
   * @private
   */
  _lsSet(lsKey, rawValue, type) {
    const key = this._getLsKey(lsKey);
    const value = type && [Array, Object].includes(type)
      ? JSON.stringify(rawValue)
      : rawValue;

    this._localStorage.setItem(key, value);
  }

  /**
   * Get value from localStorage giving respect to the namespace.
   *
   * @param {string} lsKey
   * @returns {any}
   * @private
   */
  _lsGet(lsKey) {
    const key = this._getLsKey(lsKey);
    return this._localStorage[key];
  }

  /**
   * Get value from localStorage
   *
   * @param {String} lsKey
   * @param {*} defaultValue
   * @param {*} defaultType
   * @returns {*}
   */
  get(lsKey, defaultValue = null, defaultType = String) {
    if (!this._localStorage) {
      return null;
    }

    if (this._lsGet(lsKey)) {
      let type = defaultType;

      for (const key in this._properties) {
        if (key === lsKey) {
          type = this._properties[key].type;
          break;
        }
      }

      return this._process(type, this._lsGet(lsKey));
    }

    return defaultValue !== null ? defaultValue : null;
  }

  /**
   * Set localStorage value
   *
   * @param {String} lsKey
   * @param {*} value
   * @returns {*}
   */
  set(lsKey, value) {
    if (!this._localStorage) {
      return null;
    }

    for (const key in this._properties) {
      const type = this._properties[key].type;

      if ((key === lsKey)) {
        this._lsSet(lsKey, value, type);

        return value;
      }
    }

    this._lsSet(lsKey, value);

    return value;
  }

  /**
   * Remove value from localStorage
   *
   * @param {String} lsKey
   */
  remove(lsKey) {
    if (!this._localStorage) {
      return null;
    }

    return this._localStorage.removeItem(lsKey);
  }

  /**
   * Add new property to localStorage
   *
   * @param {String} key
   * @param {function} type
   * @param {*} defaultValue
   */
  addProperty(key, type, defaultValue = undefined) {
    type = type || String;

    this._properties[key] = { type };

    if (!this._lsGet(key) && defaultValue !== null) {
      this._lsSet(key, defaultValue, type);
    }
  }

  /**
   * Process the value before return it from localStorage
   *
   * @param {String} type
   * @param {*} value
   * @returns {*}
   * @private
   */
  _process(type, value) {
    switch (type) {
      case Boolean:
        return value === 'true';
      case Number:
        return parseFloat(value);
      case Array:
        try {
          const array = JSON.parse(value);

          return Array.isArray(array) ? array : [];
        } catch (e) {
          return [];
        }
      case Object:
        try {
          return JSON.parse(value);
        } catch (e) {
          return {};
        }
      default:
        return value;
    }
  }
}
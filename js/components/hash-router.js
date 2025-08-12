export default {
  name: "hash-router",
  data() {
    return {
      hash: 'default'
    };
  },
  emits: [ 'change' ],
  mounted() {
    window.addEventListener('hashchange', this.handleHashChange);
    this.$nextTick(this.handleHashChange);
  },
  beforeUnmount() {
    window.removeEventListener('hashchange', this.handleHashChange);
  },
  methods: {
    handleHashChange() {
      this.hash = window.location.hash.replace(/^#/, '') || 'default';
      this.$emit('change', this.hash);
    }
  },
  render() {
    let slot = () => 'Not Found';
    if (typeof this.$slots === 'function') {
      slot = () => this.$slots(this.hash);
      
    } else if (typeof this.$slots[this.hash] === 'function') {
      slot = this.$slots[this.hash];

    } else if (typeof this.$slots['#routes'] === 'function') {
      slot = () => this.$slots['#routes'](this.hash);
    }

    return slot();
  }
}

/*
h('div', {}, [
  h('a', { href: '#' }, 'Default'),
  h('a', { href: '#home' }, 'Home'),
  h('a', { href: '#about' }, 'About'),
]),
h(HashRouter, {}, {
  default: h('p', {}, 'Default'),
  home: h('p', {}, 'Home'),
  about: h('p', {}, 'About'),
  '#routes': (pathnames) => h('p', {}, pathnames),
});
*/

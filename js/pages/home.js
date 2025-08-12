import { h } from 'vue';

export default {
  name: 'home-page',
  props: {
    title: String,
  },
  render() {
    return h('div', { class: 'page-content' }, [
      h('header', { class: 'site-header' }, 
        h('h1', {}, this.title || 'Checklist')
      ),
      h('div', { class: 'cover-image' }, 
        h('img', { src: './images/cover.png' })
      ),
      h('footer', { class: 'site-footer' }, [
        'Check out the project or ',
        h('a', { href: 'https://github.com/Lepehn/stellar-blade-checklist', target: '_blank' }, 'report an issue on GitHub'),
        '.'
      ]),
    ]);
  }
}
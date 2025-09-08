import { h } from 'vue';
import { coverImageUrl, gitRepoUrl } from '../constants.js';

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
        h('img', { src: coverImageUrl })
      ),
      h('footer', { class: 'site-footer' }, [
        this.$t('CHECKOUT_PROJECT'),
        h('a', { href: gitRepoUrl, target: '_blank' }, this.$t('REPORT_ISSUE')),
        '.'
      ]),
    ]);
  }
}
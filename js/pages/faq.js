import { h } from 'vue';
import { gitRepoUrl } from '../constants.js';

export default {
  name: 'faqs-page',
  render() {
    return h('div', { class: 'page-content' }, [
      h('h3', {}, 'FAQ'),
      h('p', {}, 'This project was built by a fan and is inspired by similar checklists for other games like Dark Souls.'),
      h('ul', { class: 'faq-content' }, [
        h('li', {},
          [
            h('h4', {}, 'I have feedback, how can I contribute?'),
            h('p', {}, [
              'You can visit the ',
              h('a', { href: gitRepoUrl, target: '_blank', style: 'color: #88c0d0; text-decoration: none;' }, 'GitHub repository'),
              ' and report Issues or create a fork and submit a Pull Request.'
            ]),
          ]
        ),
        h('li', {},
          [
            h('h4', {}, 'Is this a guide?'),
            h('p', {}, 'No, this is not a full walkthrough or guide. It simply helps you stay organized while playing by letting you check off content as you complete it.'),
          ]
        ),
        h('li', {},
          [
            h('h4', {}, 'How does the checklist status get saved?'),
            h('p', {}, 'Your progress is saved locally in your browser using localStorage. This means your checklist will stay saved as long as you don’t clear your browser data.'),
          ]
        ),
      ]),
    ]);
  }
}
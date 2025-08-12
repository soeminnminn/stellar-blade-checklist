import { h } from 'vue';

export default {
  name: 'faqs-page',
  render() {
    return h('div', { class: 'page-content' }, [
      h('h3', {}, 'FAQ'),
      h('p', {}, 'This project was built by a fan and is inspired by similar checklists for other games like Dark Souls.'),
      h('p', {}, [
        h('strong', {}, 'I have feedback, how can I contribute?'),
        h('br'),
        'You can visit the ',
        h('a', { href: 'https://github.com/Lepehn/stellar-blade-checklist', target: '_blank', style: 'color: #88c0d0; text-decoration: none;' }, 'GitHub repository'),
        ' and report Issues or create a fork and submit a Pull Request.'
      ]),
      h('p', {}, [
        h('strong', {}, 'Is this a guide?'),
        h('br'),
        'No, this is not a full walkthrough or guide. It simply helps you stay organized while playing by letting you check off content as you complete it.'
      ]),
      h('p', {}, [
        h('strong', {}, 'How does the checklist status get saved?'),
        h('br'),
        'Your progress is saved locally in your browser using localStorage. This means your checklist will stay saved as long as you don’t clear your browser data.'
      ]),
    ]);
  }
}
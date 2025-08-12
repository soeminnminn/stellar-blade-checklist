import { h } from 'vue';

export default {
  name: 'checklist-header',
  props: {
    title: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    progress: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    }
  },
  computed: {
    progressValue() {
      return `${this.progress} / ${this.total}`;
    }
  },
  render() {
    return h('header', { class: 'checklist-header' }, [
      h('h2', {}, this.title),
      this.location && h('div', { class: 'location' }, this.location),
      h('div', { class: 'progress' }, [
        'Completed ',
        this.progressValue,
      ]),
    ]);
  }
}
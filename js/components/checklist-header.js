import { h } from 'vue';
import SortMenu from './sort-menu.js';

export default {
  name: 'checklist-header',
  components: {
    SortMenu
  },
  props: {
    dataKey: String,
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
    },
    sort: Object,
  },
  computed: {
    progressValue() {
      return `${this.progress} / ${this.total}`;
    }
  },
  emits: [ 'sort' ],
  methods: {
    handleSort(ev, sortKey) {
      this.$emit('sort', ev, this.dataKey, sortKey);
    }
  },
  render() {
    return h('header', { class: 'checklist-header' }, [
      h('div', { class: 'title' }, [
        h('h2', {}, this.title),
        this.sort && h(SortMenu, { dataKey: this.dataKey, sort: this.sort, onItemClick: this.handleSort }),
      ]),
      this.location && h('div', { class: 'location' }, this.location),
      h('div', { class: 'progress' }, [
        'Completed ',
        this.progressValue,
      ]),
    ]);
  }
}
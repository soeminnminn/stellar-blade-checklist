import { h, defineComponent } from 'vue';
import PopperMenu from './popper-menu.js';

const SortMenuItem = defineComponent({
  name: 'sort-menu-item',
  props: {
    title: String,
    sortKey: String,
    checked: Boolean,
  },
  emits: [ 'click' ],
  methods: {
    handleClick(ev) {
      this.$emit('click', ev, this.sortKey);
    },
  },
  render() {
    return h('span', { class: ['menu-item', this.checked && 'sorted'], 
      onClick: this.handleClick }, this.title);
  }
});

export default {
  name: 'sort-menu',
  components: {
    PopperMenu,
    SortMenuItem
  },
  props: {
    dataKey: String,
    sort: {
      type: Object,
      default: []
    }
  },
  emits: [ 'itemClick' ],
  methods: {
    handleItemClick(ev, sortKey) {
      this.$emit('itemClick', ev, sortKey);
    }
  },
  render() {
    return h(PopperMenu, { title: 'Sort', width: '10em' }, {
      trigger: () => h('i', { class: 'fa-solid fa-arrow-down-short-wide' }),
      default: () => this.sort.map((x, i) => 
        h(SortMenuItem, { key: `sort-item-${i}`, sortKey: x.key, title: x.title, checked: x.sorted, onClick: this.handleItemClick })
      )
    });
  }
}
import { h } from 'vue';
import ChecklistHeader from '../components/checklist-header.js';
import CheckListItem from '../components/checklist-item.js';
import Tabs, { Tab } from '../components/tabs.js';

export default {
  name: 'checklist-page',
  components: {
    ChecklistHeader,
    CheckListItem,
    Tabs,
    Tab
  },
  props: {
    dataKey: {
      type: String,
      default: 'checklist'
    },
    listData: {
      type: Object,
      default: {
        title: 'Checklist',
        list: null
      }
    }
  },
  watch: {
    listData: {
      handler(value) {
        if (!value.list || Array.isArray(value.list)) return;

        const keys = Object.keys(value.list);
        if (keys.length) {
          this.$nextTick(() => this.$refs.tabs.selectTab(keys[0]));
        }
      },
      deep: true
    }
  },
  computed: {
    title() {
      return this.listData.title ?? 'Checklist';
    },
  },
  inject: [ 'getCompletedCount' ],
  methods: {
    getTotal(list) {
      if (Array.isArray(list)) {
        return list.reduce((t, x) => {
          if (typeof x === 'object' && Array.isArray(x.variants)) {
            t += x.variants.length;
          } else {
            t++;
          }
          return t;
        }, 0);
      }
      return 0;
    }
  },
  render() {
    if (typeof this.listData.list !== 'object' || this.listData.list === null) {
      return h('div', { class: 'page-content', 'data-key': this.dataKey });
    }

    if (Array.isArray(this.listData.list)) {
      return h('div', { class: 'page-content', 'data-key': this.dataKey }, [
        h(ChecklistHeader, { title: this.title, location: this.listData.location, total: this.getTotal(this.listData.list), progress: this.getCompletedCount(this.dataKey) }),
        h('div', { class: 'scrollable-list' }, 
          h('menu', { class: 'checklist' }, this.listData.list.map((x, i) => 
            h(CheckListItem, { key: `${this.dataKey}-${i}`, index: i + 1, dataKey: this.dataKey, value: x })
          ))
        )
      ]);
    }

    const createTab = (key) => {
      const d = this.listData.list[key];
      
      return h(Tab, { key: key, id: key, header: d.name || d.title }, [
        h(ChecklistHeader, { title: d.title, location: d.location, total: this.getTotal(d.list), progress: this.getCompletedCount(`${this.dataKey}/${key}`) }),
        h('div', { class: 'scrollable-list' }, 
          h('menu', { class: 'checklist' }, d.list.map((x, i) => 
            h(CheckListItem, { key: `${this.dataKey}-${key}-${i}`, index: i + 1, dataKey: `${this.dataKey}/${key}`, value: x })
          ))
        )
      ]);
    };

    return h('div', { class: 'page-content', 'data-key': this.dataKey }, 
      h(Tabs, { ref: 'tabs', wrapperClass: 'tab-wrapper', navClass: 'tab-buttons', panelWrapperClass: 'tab-panel', itemClass: 'tab-button', itemActiveClass: 'active' }, () => Object.keys(this.listData.list || {}).map(createTab))
    );
  }
}
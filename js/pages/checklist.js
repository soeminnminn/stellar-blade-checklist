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
    Tab,
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
  data() {
    return {
      sortKey: {
        [this.dataKey]: '#'
      }
    };
  },
  watch: {
    listData: {
      handler(value) {
        // if (!value.list || Array.isArray(value.list)) return;

        // const keys = Object.keys(value.list);
        // if (keys.length) {
        //   this.$nextTick(() => {
        //     const idx = keys.reduce((i, k) => {
        //       if (this.isDisabled(value.list[k])) {
        //         i = i + 1;
        //       }
        //       return i;

        //     }, 0);

        //     this.$refs.tabs.selectTab(keys[idx]);
        //   });
        // }
      },
      deep: true
    }
  },
  computed: {
    title() {
      return this.listData.title ?? 'Checklist';
    },
  },
  inject: [ 'getCompletedCount', 'isDisabled', 'setSort', 'getSort' ],
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
    },
    getSortMenu(dataKey, data) {
      if (typeof data['$sort'] === 'object') {
        const sort = data['$sort'];
        const sortKey = typeof this.getSort === 'function' ? this.getSort(dataKey) : '#';

        for (const s of sort) {
          s.sorted = s.key == sortKey;
        }
        return sort;
      }
      return undefined;
    },
    getSortedList(dataKey, list) {
      if (Array.isArray(list)) {
        const sortKey = typeof this.getSort === 'function' ? this.getSort(dataKey) : this.sortKey[dataKey] || '#';
        if (sortKey !== '#') {
          return [...list].sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];

            if (typeof valA === 'string' && typeof valB === 'string') {
              return valA.localeCompare(valB);
            } else {
              return (valA < valB) ? -1 : (valA > valB) ? 1 : 0;
            }
          });
        }
      }
      return list;
    },
    handleSort(ev, dataKey, sortKey) {
      const sort = {
        ...this.sortKey,
      }
      sort[dataKey] = sortKey;
      this.sortKey = sort;

      if (typeof this.setSort === 'function') {
        this.setSort(dataKey, sortKey);
      }
    }
  },
  render() {
    const isDisabled = typeof this.isDisabled === 'function' ? this.isDisabled : (() => false);

    if (typeof this.listData.list !== 'object' || this.listData.list === null) {
      return h('div', { class: 'page-content', 'data-key': this.dataKey });
    }

    if (Array.isArray(this.listData.list)) {
      return h('div', { class: 'page-content', 'data-key': this.dataKey }, [
        h(ChecklistHeader, { dataKey: this.dataKey, title: this.title, location: this.listData.location, 
          total: this.getTotal(this.listData.list), progress: this.getCompletedCount(this.dataKey), 
          sort: this.getSortMenu(this.dataKey, this.listData), onSort: this.handleSort }),
        h('div', { class: 'scrollable-list' }, 
          h('menu', { class: 'checklist' }, this.getSortedList(this.dataKey, this.listData.list).map((x, i) => 
            h(CheckListItem, { key: `${this.dataKey}-${i}`, index: i + 1, dataKey: this.dataKey, value: x })
          ))
        )
      ]);
    }

    const createTab = (key) => {
      const d = this.listData.list[key];
      const dataKey = `${this.dataKey}/${key}`;
      
      return h(Tab, { key: key, id: key, header: d.name || d.title, disabled: isDisabled(d) }, [
        h(ChecklistHeader, { dataKey, title: d.title, location: d.location, 
          total: this.getTotal(d.list), progress: this.getCompletedCount(dataKey), 
          sort: this.getSortMenu(dataKey, d), onSort: this.handleSort }),
        h('div', { class: 'scrollable-list' }, 
          h('menu', { class: 'checklist' }, this.getSortedList(dataKey, d.list).map((x, i) => 
            h(CheckListItem, { key: `${this.dataKey}-${key}-${i}`, index: i + 1, dataKey, value: x })
          ))
        )
      ]);
    };

    return h('div', { class: 'page-content', 'data-key': this.dataKey }, 
      h(Tabs, { ref: 'tabs', wrapperClass: 'tab-wrapper', navClass: 'tab-buttons', panelWrapperClass: 'tab-panel', 
        itemClass: 'tab-button', itemActiveClass: 'active', itemDisabledClass: 'disabled' }, 
        () => Object.keys(this.listData.list || {}).map(createTab)
      )
    );
  }
}
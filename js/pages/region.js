import { h, defineComponent } from 'vue';
import ChecklistHeader from '../components/checklist-header.js';

const RegionItem = defineComponent({
  name: 'region-item',
  props: {
    dataKey: String,
    value: [String, Object],
    index: {
      type: Number,
      default: 0,
    },
    disabled: Boolean,
    completed: Boolean,
    checked: Boolean,
  },
  computed: {
    title() {
      if (typeof this.value === 'string') {
        return this.value;

      } else if (typeof this.value === 'object') {
        let title = this.value.name || this.value.title;

        return title;
      }

      return '';
    },
  },
  inject: [ 'makeKey', 'setPassed' ],
  emits: [ 'change' ],
  methods: {
    handleChange(ev) {
      if (this.disabled === true) {
        ev.preventDefault();
        ev.stopPropagation();
        return;
      }

      const key = ev.target.value;
      const isChecked = ev.target.checked;

      if (typeof this.setPassed === 'function' && isChecked) {
        this.setPassed(Number(key));
      }

      this.$emit('change', ev, key, isChecked);
    }
  },
  render() {
    const key = this.makeKey(this.dataKey, this.value);

    return h('li', { class: 'checklist-item' }, 
      h('label', { class: ['checklist-label', this.completed && 'completed'] }, [
        h('span', { class: 'item-index' }, `${this.index}`),
        h('input', { type: 'radio', name: 'regions', value: this.index, checked: Boolean(this.checked), disabled: Boolean(this.disabled), onChange: this.handleChange }),
        this.title,
      ])
    );
  }
});

export default {
  name: 'region',
  components: {
    ChecklistHeader,
    RegionItem
  },
  props: {
    dataKey: {
      type: String,
      default: 'region'
    },
    listData: {
      type: Object,
      default: {
        title: 'Region',
        list: []
      }
    }
  },
  provide() {
    return {
      setPassed: (index) => {
        this.lastRegion = index - 1;

        if (typeof this.setLastRegion === 'function') {
          this.setLastRegion(index - 1);
        }
      }
    }
  },
  inject: [ 'getLastRegion', 'setLastRegion' ],
  data() {
    return {
      lastRegion: 0,
    };
  },
  computed: {
    title() {
      return this.listData.title ?? 'Region';
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (typeof this.getLastRegion === 'function') {
        this.lastRegion = this.getLastRegion();
      }
    });
  },
  render() {
    return h('div', { class: 'page-content', 'data-key': this.dataKey }, [
      h(ChecklistHeader, { title: this.title, total: this.listData.list.length, progress: this.lastRegion + 1 }),
      h('div', { class: 'scrollable-list' }, 
        h('menu', { class: 'checklist' }, this.listData.list.map((x, i) => 
          h(RegionItem, { key: `${this.dataKey}-${i}`, index: i + 1, completed: i <= this.lastRegion, checked: i == this.lastRegion, dataKey: this.dataKey, value: x })
        ))
      )
    ]);
  }
}
import { h } from 'vue';

export default {
  name: 'checklist-item',
  props: {
    dataKey: String,
    value: [String, Object],
    index: {
      type: Number,
      default: 0,
    }
  },
  computed: {
    title() {
      if (typeof this.value === 'string') {
        return this.value;

      } else if (typeof this.value === 'object') {
        let title = this.value.name || this.value.code || this.value.title;

        if (typeof this.value.serial !== 'undefined') {
          title += ` (No. ${this.value.serial})`;
        }

        return title;
      }

      return '';
    },
    itemKey() {
      let key = `${this.dataKey}/${this.escapeKey(this.title)}`;
      if (typeof this.value === 'object') {
        key = `${this.dataKey}/${this.value.key || this.escapeKey(this.title)}`;
      }
      return key;
    }
  },
  inject: [ 'setCompleted', 'isCompleted', 'escapeKey' ],
  emits: [ 'change' ],
  methods: {
    isChecked(key) {
      if (typeof this.isCompleted === 'function') {
        return this.isCompleted(key);
      }
      return false;
    },
    handleChange(ev) {
      const key = ev.target.value;
      const isChecked = ev.target.checked;

      if (typeof this.setCompleted === 'function') {
        this.setCompleted(key, isChecked);
      }

      this.$emit('change', ev, key, isChecked);
    }
  },
  render() {
    const label = () => {
      if (typeof this.value === 'object' && Array.isArray(this.value.variants) && this.value.variants.length) {
        return h('div', { class: 'checklist-variants' }, [
          h('div', { class: 'variants-label' }, [
            h('span', { class: 'item-index' }, `${this.index}`),
            h('span', { class: 'checklist-label' }, this.title),
          ]),
          h('div', { class: 'variants' }, this.value.variants.map((v, i) => {
            let title = `${v}`;
            let key = `${this.itemKey}/variant-${i}`;

            if (typeof v === 'string') {
              key = `${this.itemKey}/${this.escapeKey(v)}`;

            } else if (typeof v === 'object') {
              title = v.name || v.code || v.title;
              key = `${this.itemKey}/${v.key || this.escapeKey(title)}`;
            }

            return h('label', { key: `variants-${i}`, class: 'checklist-label' }, [
              h('input', { type: 'checkbox', value: key, checked: this.isChecked(key), onChange: this.handleChange }),
              title
            ]);
          }))
        ]);
      }

      const key = this.itemKey;
      return h('label', { class: 'checklist-label' }, [
        h('span', { class: 'item-index' }, `${this.index}`),
        h('input', { type: 'checkbox', value: key, checked: this.isChecked(key), onChange: this.handleChange }),
        this.title,
      ]);
    };

    const location = () => {
      if (typeof this.value !== 'object') return undefined;

      const elms = [];
      if (typeof this.value.location !== 'undefined' && this.value.location) {
        elms.push(h('span', {}, this.value.location));
      }

      if (typeof this.value.sector !== 'undefined' && this.value.sector) {
        elms.push(h('span', {}, this.value.sector));
      }

      if (typeof this.value.locations !== 'undefined' && Array.isArray(this.value.locations)) {
        this.value.locations.forEach(loc => {
          elms.push(h('span', {}, loc));
        });        
      }

      if (elms.length) {
        return h('div', { class: 'location' }, elms);
      }

      return undefined;
    };

    const shop = () => {
      if (typeof this.value !== 'object') return undefined;
      if (typeof this.value.shop !== 'undefined' && this.value.shop) {
        return h('div', { class: 'shop' }, 
          h('span', {}, this.value.shop)
        );
      }
      return undefined;
    };

    const tags = () => {
      if (typeof this.value !== 'object') return undefined;

      if (typeof this.value.tags !== 'undefined' && Array.isArray(this.value.tags) && this.value.tags.length) {
        return h('div', { class: 'tags' }, 
          this.value.tags.map((t, i) => h('span', { key: `tags-${i}`, class: 'tag' }, t))
        );
      }

      return undefined;
    };

    const notes = () => {
      if (typeof this.value !== 'object') return undefined;

      if (typeof this.value.notes !== 'undefined' && this.value.notes) {
        return h('div', { class: 'notes' }, 
          h('span', {}, this.value.notes)
        );
      }
      return undefined;
    };

    const bait = () => {
      if (typeof this.value !== 'object') return undefined;

      if (typeof this.value.bait !== 'undefined' && this.value.bait) {
        return h('div', { class: 'bait' }, 
          h('span', {}, this.value.bait)
        );
      }
      return undefined;
    };

    return h('li', { class: 'checklist-item' }, [
      label(),
      typeof this.value === 'object' && h('div', { class: 'checklist-info' }, [
        location(),
        shop(),
        bait(),
        tags(),
        notes(),
      ]),
    ]);
  }
}
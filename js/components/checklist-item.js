import { h } from 'vue';

export default {
  name: 'checklist-item',
  props: {
    dataKey: String,
    value: [String, Object],
    index: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    title() {
      if (typeof this.value === 'string') {
        return this.value;

      } else if (typeof this.value === 'object') {
        const title = this.value.name || this.value.code || this.value.title;
        return title || '-';
      }

      return '';
    },
    isCode() {
      return typeof this.value === 'object' && this.value.code;
    }
  },
  inject: ['makeKey', 'setCompleted', 'isCompleted', 'isDefCompleted', 'isDisabled'],
  emits: ['change'],
  methods: {
    isChecked(key) {
      if (typeof this.isCompleted === 'function') {
        return this.isCompleted(key);
      }
      return false;
    },
    handleChange(ev) {
      if (this.disabled === true) {
        ev.preventDefault();
        ev.stopPropagation();
        return;
      }

      const key = ev.target.value;
      const isChecked = ev.target.checked;

      if (typeof this.setCompleted === 'function') {
        this.setCompleted(key, isChecked);
      }

      this.$emit('change', ev, key, isChecked);
    }
  },
  render() {
    const isDisabled = typeof this.isDisabled === 'function' ? this.isDisabled : (() => false);
    const isDefCompleted = typeof this.isDefCompleted === 'function' ? this.isDefCompleted : (() => false);
    const disabled = isDisabled(this.value);

    const label = () => {
      const key = this.makeKey(this.dataKey, this.value);

      if (typeof this.value === 'object' && Array.isArray(this.value.ranks) && this.value.ranks.length) {
        return h('div', { class: 'checklist-ranks' }, [
          h('div', { class: 'ranks-label' }, [
            h('span', { class: 'item-index' }, `${this.index}`),
            h('span', { class: ['checklist-label', this.isCode && 'code'] }, this.title),
          ]),
          h('div', { class: 'ranks' }, this.value.ranks.map((v, i) => {
            const title = (typeof v === 'object') ? v.name || v.code || v.title : `${v}`;
            const vkey = this.makeKey(key, v);
            const vDisabled = isDisabled(v);
            const vDefCompleted = isDefCompleted(vkey);

            return h('label', { key: `rank-${i}`, class: ['checklist-label', v.code && 'code', vDisabled && 'disabled', vDefCompleted && 'default'], 'aria-disabled': vDisabled ? undefined : 'true' }, [
              h('input', { type: 'checkbox', value: vkey, disabled: vDisabled || vDefCompleted ? 'true' : undefined, checked: this.isChecked(vkey), onChange: this.handleChange }),
              title
            ]);
          }))
        ]);
      }

      const defCompleted = isDefCompleted(key);

      return h('label', { class: ['checklist-label', this.isCode && 'code', disabled && 'disabled', defCompleted && 'default'], 'aria-disabled': disabled ? 'true' : undefined }, [
        h('span', { class: 'item-index' }, `${this.index}`),
        h('input', { type: 'checkbox', value: key, disabled: disabled || defCompleted ? 'true' : undefined, checked: this.isChecked(key), onChange: this.handleChange }),
        this.title,
      ]);
    };

    const serial = () => {
      if (typeof this.value !== 'object') return undefined;

      if (typeof this.value.serial !== 'undefined') {
        return h('div', { class: 'serial' },
          h('span', {}, `No. ${this.value.serial}`)
        );
      }
      return undefined;
    };

    const variants = () => {
      if (typeof this.value !== 'object') return undefined;

      if (typeof this.value.variants === 'object') {
        const variants = this.value.variants;
        const variantsKeys = Object.keys(variants);

        return h('menu', { class: 'variants' },
          variantsKeys.map((vk, i) => h('li', { key: `variants-${i}`, class: 'variant' }, [
            h('span', { class: 'key' }, vk),
            h('span', { class: 'text' }, variants[vk])
          ]))
        );
      }

      return undefined;
    };

    const location = () => {
      if (typeof this.value !== 'object') return undefined;

      if (typeof this.value.locations !== 'undefined' && Array.isArray(this.value.locations)) {
        const locations = this.value.locations;

        return h('div', { class: 'locations' }, 
          locations.map((loc, i) => 
            h('span', { key: `loc-${i}` }, loc)
          )
        );

      } else {
        const elms = [];
        if (typeof this.value.location !== 'undefined' && this.value.location) {
          elms.push(h('span', { class: 'region' }, this.value.location));
        }

        if (typeof this.value.sector !== 'undefined' && this.value.sector) {
          elms.push(h('span', { class: 'area' }, this.value.sector));
        }

        if (elms.length) {
          return h('div', { class: 'location' }, elms);
        }
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
      typeof this.value === 'object' && !disabled && h('div', { class: 'checklist-info' }, [
        serial(),
        variants(),
        location(),
        shop(),
        bait(),
        tags(),
        notes(),
      ]),
    ]);
  }
}
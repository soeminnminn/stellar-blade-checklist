import { h } from 'vue';
import Popper from 'popper';

export default {
  name: 'popper-menu',
  props: {
    placement: {
      type: String,
      default: 'bottom',
      validator: (v) => /^(top|bottom|left|right)(-start|-end)?$/.test(v),
    },
    title: {
      type: String,
      default: 'Menu'
    },
    width: {
      type: String,
      default: '5em'
    },
    arrow: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      popperInstance: null
    };
  },
  methods: {
    createInstance() {
      this.destroyInstance();

      if (!this.$refs || !this.$refs.popperButton || !this.$refs.popperPopup) {
        return;
      }

      const modifiers = [
        {
          name: 'preventOverflow',
          options: {
            boundary: 'clippingParents'
          }
        },
        {
          name: 'flip', //flips popper with allowed placements
          options: {
            allowedAutoPlacements: ['bottom', 'top', 'right', 'left'],
            rootBoundary: 'viewport'
          }
        }
      ];

      if (this.arrow && this.$refs.popperArrow) {
        modifiers.push({
          name: 'arrow',
          options: {
            element: this.$refs.popperArrow,
          },
        });

        modifiers.push({
          name: 'offset', //offsets popper from the reference/button
          options: {
            offset: [8, 8]
          }
        });

      } else {
        modifiers.push({
          name: 'offset', //offsets popper from the reference/button
          options: {
            offset: [0, 2]
          }
        });
      }
      
      this.popperInstance = Popper.createPopper(this.$refs.popperButton, this.$refs.popperPopup, {
        placement: this.placement, //preferred placement of popper
        modifiers
      });
    },
    destroyInstance() {
      if (this.popperInstance) {
        this.popperInstance.destroy();
        this.popperInstance = null;
      }
    },
    showPopper() {
      if (!this.$refs || !this.$refs.popperButton || !this.$refs.popperPopup) {
        return;
      }

      this.$refs.popperPopup.setAttribute('show-popper', '');
      this.$refs.popperArrow.setAttribute('data-popper-arrow', '');
      this.createInstance();
    },
    hidePopper() {
      if (!this.$refs || !this.$refs.popperButton || !this.$refs.popperPopup) {
        return;
      }

      this.$refs.popperPopup.removeAttribute('show-popper');
      this.$refs.popperArrow.removeAttribute('data-popper-arrow');
      this.destroyInstance();
    },
    togglePopper() {
      if (!this.$refs || !this.$refs.popperPopup) {
        return;
      }

      if (this.$refs.popperPopup.hasAttribute('show-popper')) {
        this.hidePopper();
      } else {
        this.showPopper();
      }
    },
    handleClick(e) {
      e.preventDefault();
      this.togglePopper();
    },
    escClose(e) {
      if (e.keyCode === 27) {
        this.hidePopper();
      }
    },
    closeMenu(e) {
      if (!e || (e && !this.$el.contains(e.target))) {
        this.hidePopper();
      }
    },
    closeMenuDelayed() {
      setTimeout(() => {
        this.hidePopper();
      }, 100);
    }
  },
  mounted() {
    document.addEventListener('mousedown', this.closeMenu);
    document.addEventListener('pointerdown', this.closeMenu);
    document.addEventListener('keydown.menu', this.escClose);

    this.$nextTick(() => {
      if (this.popperInstance) {
        this.popperInstance.update();
      }
    });
  },
  beforeUnmount() {
    document.removeEventListener('keydown.menu', this.escClose);
    document.removeEventListener('mousedown', this.closeMenu);
    document.removeEventListener('pointerdown', this.closeMenu);

    this.destroyInstance();
  },
  render() {
    const defaultSlot = this.$slots.default || (() => { });
    const triggerSlot = this.$slots.trigger || (() => this.title);

    return h('div', { class: 'popper' }, [
      h('button', {
        ref: 'popperButton', type: 'button', class: 'popper-button', title: this.title,
        onclick: (e) => this.handleClick(e)
      }, triggerSlot()),
      h('div', { ref: 'popperPopup', class: 'popper-popup', style: `width: ${this.width}` }, [
        h('div', { ref: 'popperArrow', class: ['popper-arrow', !this.arrow && 'hidden'] }),
        h('div', { class: 'popper-menu', onClick: this.closeMenuDelayed }, defaultSlot())
      ]),
    ]);
  }
}
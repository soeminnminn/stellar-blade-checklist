import { h } from 'vue';
import Popper from 'popper';

export default {
  name: 'popper-menu',
  props: {
    title: {
      type: String,
      default: 'Menu'
    },
    width: {
      type: String,
      default: '5em'
    },
  },
  data() {
    return {
      popperInstance: null
    };
  },
  methods: {
    createInstance() {
      this.popperInstance = Popper.createPopper(this.$refs.popperButton, this.$refs.popperPopup, {
        placement: 'bottom', //preferred placement of popper
        modifiers: [
          {
            name: 'offset', //offsets popper from the reference/button
            options: {
              offset: [0, 2]
            }
          },
          {
            name: 'flip', //flips popper with allowed placements
            options: {
              allowedAutoPlacements: ['bottom', 'top', 'right', 'left'],
              rootBoundary: 'viewport'
            }
          }
        ]
      });
    },
    destroyInstance() {
      if (this.popperInstance) {
        this.popperInstance.destroy();
        this.popperInstance = null;
      }
    },
    showPopper() {
      this.$refs.popperPopup.setAttribute('show-popper', '');
      this.$refs.popperArrow.setAttribute('data-popper-arrow', '');
      this.createInstance();
    },
    hidePopper() {
      this.$refs.popperPopup.removeAttribute('show-popper');
      this.$refs.popperArrow.removeAttribute('data-popper-arrow');
      this.destroyInstance();
    },
    togglePopper() {
      if (this.$refs.popperPopup.hasAttribute('show-popper')) {
        this.hidePopper();
      } else {
        this.showPopper();
      }
    },
    onClick(e) {
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
  },
  beforeUnmount() {
    document.removeEventListener('keydown.menu', this.escClose);
    document.removeEventListener('mousedown', this.closeMenu);
    document.removeEventListener('pointerdown', this.closeMenu);
  },
  render() {
    const defaultSlot = this.$slots.default || (() => { });
    const triggerSlot = this.$slots.trigger || (() => this.title);

    return h('div', { class: 'popper' }, [
      h('button', {
        ref: 'popperButton', type: 'button', class: 'popper-button', title: this.title,
        onclick: (e) => this.onClick(e)
      }, triggerSlot()),
      h('div', { ref: 'popperPopup', class: 'popper-popup', style: `width: ${this.width}` }, [
        h('div', { ref: 'popperArrow', class: 'popper-arrow' }),
        h('div', { class: 'popper-menu', onClick: this.closeMenuDelayed }, defaultSlot())
      ]),
    ]);
  }
}
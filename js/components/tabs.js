import { h, defineComponent } from 'vue';

function uniqueId(length = 10) {
  let generated = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    generated += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return generated;
}

export const Tab = defineComponent({
  name: 'tab-panel',
  props: {
    id: String,
    header: {
      type: String,
      required: true,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
  },
  inject: ['addTab', 'removeTab', 'updateTab'],
  data() {
    return {
      tabId: this.id ?? uniqueId(8),
      isActive: false,
    };
  },
  watch: {
    header(val) {
      if (typeof this.updateTab === 'function') {
        this.updateTab(this.tabId, {
          header: val,
          hidden: this.hidden,
          setActive: (active) => {
            this.isActive = active;
          },
        });
      }      
    },
  },
  mounted() {
    if (typeof this.addTab === 'function') {
      this.addTab({
        tabId: this.tabId,
        header: this.header,
        hidden: this.hidden,
        setActive: (active) => {
          this.isActive = active;
        },
      });
    }    
  },
  beforeUnmount() {
    if (typeof this.removeTab === 'function') {
      this.removeTab(this.tabId);
    }    
  },
  render() {
    const defaultSlot = typeof this.$slots === 'function' ? this.$slots : typeof this.$slots.default === 'function' ? this.$slots.default : (() => null);
    return this.isActive && h('section', { id: this.tabId, role: 'tabpanel', tabIndex: '-1' }, defaultSlot());
  }
});

export default {
  name: 'tabs',
  props: {
    modelValue: {
      type: [String, null],
      default: null,
    },
    wrapperClass: String,
    navClass: String,
    itemClass: String,
    itemActiveClass: String,
    panelWrapperClass: String,
  },
  data() {
    return {
      tabName: uniqueId(8),
      tabs: [],
    };
  },
  provide() {
    return {
      addTab: (tab) => this.addTab(tab),
      removeTab: (tabId) => this.removeTab(tabId),
      updateTab: (tabId, data) => this.updateTab(tabId, data),
    };
  },
  emits: ['update:modelValue', 'change'],
  computed: {
    activeTab: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    }
  },
  methods: {
    addTab(tab) {
      this.tabs.push(tab);
    },
    removeTab(tabId) {
      const tabIndex = this.tabs.findIndex((tab) => tab.tabId === tabId);
      if (tabIndex > -1) {
        this.tabs.splice(tabIndex, 1);
      }
    },
    updateTab(tabId, data) {
      const tabIndex = this.tabs.findIndex((tab) => tab.tabId === tabId);
      if (tabIndex > -1) {
        data.isActive = this.tabs[tabIndex].isActive;
        this.tabs[tabIndex] = data;
      }
    },
    selectTab(tabId) {
      const selectedTab = this.tabs.find((tab) => tab.tabId === tabId);
      if (selectedTab) {
        this.tabs.forEach((tab) => {
          tab.isActive = tab.tabId === selectedTab.tabId;
          tab.setActive(tab.tabId === selectedTab.tabId);
        });

        this.activeTab = selectedTab.tabId;

        this.$emit('change', selectedTab.tabId);
      }
    },
    handleInputChange(ev) {
      this.selectTab(ev.target.value);
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (this.tabs.length) {
        const tabId = this.activeTab ?? window.location.hash.slice(1);
        let tabIndex = this.tabs.findIndex((tab) => tab.tabId === tabId);
        if (tabIndex == -1) tabIndex = 0;
        this.selectTab(this.tabs[tabIndex].tabId);
      }
    });
  },
  render() {
    const defaultSlot = typeof this.$slots === 'function' ? this.$slots : typeof this.$slots.default === 'function' ? this.$slots.default : (() => null);

    return h('div', { class: this.wrapperClass }, [
      h('nav', { role: 'tablist', class: this.navClass }, this.tabs.filter(tab => !tab.hidden).map((tab, i) =>
        h('label', { key: `tab-${i}`, role: 'presentation', class: [this.itemClass, tab.isActive && this.itemActiveClass].filter(Boolean).join(' ') }, [
          h('input', { type: 'radio', name: this.tabName, role: 'tab', tabIndex: '0', checked: tab.isActive, value: tab.tabId, style: 'appearance: none; display: none;', onChange: this.handleInputChange }),
          tab.header
        ])
      )),
      h('div', { class: this.panelWrapperClass }, defaultSlot()),
    ]);
  }
}
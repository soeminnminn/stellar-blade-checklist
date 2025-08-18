import { h } from 'vue';

export default {
  props: {
    modelValue: {
      type: Object,
      default: []
    },
    activeId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isOpen: false,
      gameMode: 0,
    };
  },
  inject: [ 'getGameMode', 'setGameMode', 'isDisabled', 'exportMarkdown', 'exportChecklist', 'importChecklist' ],
  methods: {
    handleGameModeChange(ev) {
      const key = Number(ev.target.value);
      const isChecked = ev.target.checked;

      if (!Number.isNaN(key) && isChecked) {
        this.gameMode = key;

        if (typeof this.setGameMode === 'function') {
          this.setGameMode(key);
        }
      }
    },
    handleClickOutside(ev) {
      if (!this.$refs.sidebar.contains(ev.target)) {
        this.isOpen = false;
      }
    },
    handleOpen() {
      this.isOpen = true;
    },
    handleClose() {
      this.isOpen = false;
    },
    handleExportMarkdownClick() {
      if (typeof this.exportMarkdown === 'function') {
        this.exportMarkdown();
      }
    },
    handleExportClick() {
      if (typeof this.exportChecklist === 'function') {
        this.exportChecklist();
      }
    },
    handleImportChange(ev) {
      const file = ev.target.files[0];
      if (!file) return;

      if (typeof this.importChecklist === 'function') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const fileContent = e.target.result;
            this.importChecklist(fileContent);

          } catch (err) {
            console.error(err);
          }
        };
        reader.readAsText(file);
      }      
    },
  },
  mounted() {
    document.addEventListener('pointerdown', this.handleClickOutside);

    this.$nextTick(() => {
      if (typeof this.getGameMode === 'function') {
        this.gameMode = this.getGameMode();
      }
    });
  },
  beforeUnmount() {
    document.removeEventListener('pointerdown', this.handleClickOutside);
  },
  render() {
    const isDisabled = typeof this.isDisabled === 'function' ? this.isDisabled : (() => false);

    return [
      h('div', { class: 'side-menu' }, 
        h('button', { type: 'button', onClick: this.handleOpen },
          h('i', { class: 'fa-solid fa-bars' })
        )
      ),
      h('aside', { ref: 'sidebar', class: ['sidebar', this.isOpen && 'open' ] }, [
        h('div', { class: 'side-menu close' }, 
          h('button', { type: 'button', onClick: this.handleClose },
            h('i', { class: 'fa-solid fa-xmark' })
          )
        ),
        h('a', { class: 'side-logo', href: '#' }, 
          h('img', { src: './images/logo.png' })
        ),
        h('div', { class: 'side-content' }, [
          h('menu', { class: 'side-card' }, [
            h('li', { key: 'game-mode-ng' }, 
              h('label', { class: 'side-button' }, [
                h('input', { type: 'radio', name: 'game-mode', value: 0, checked: this.gameMode == 0, style: 'appearance: none; display: none;', onChange: this.handleGameModeChange }),
                'New Game'
              ])
            ),
            h('li', { key: 'game-mode-ng-plus' }, 
              h('label', { class: 'side-button' }, [
                h('input', { type: 'radio', name: 'game-mode', value: 1, checked: this.gameMode == 1, style: 'appearance: none; display: none;', onChange: this.handleGameModeChange }),
                'New Game+'
              ])
            ),
            h('li', { key: 'game-mode-ng-plus-plus' }, 
              h('label', { class: 'side-button' }, [
                h('input', { type: 'radio', name: 'game-mode', value: 2, checked: this.gameMode == 2, style: 'appearance: none; display: none;', onChange: this.handleGameModeChange }),
                'New Game++'
              ])
            )
          ]),
          h('menu', { class: 'side-card' }, 
            this.modelValue.map((x, i) => 
              h('li', { key: x.key }, [
                h(x.children ? 'span' : 'a', { href: `#${x.key}`, class: ['side-button', this.activeId === x.key && 'active', isDisabled(x) && 'disabled'] }, x.title),
                x.children && h('menu', { class: 'side-sub-menu' }, x.children.map(c => 
                  h('li', { key: `${x.key}-${c.key}`, class: isDisabled(c) ? 'disabled' : '' }, 
                    h('a', { href: `#${x.key}/${c.key}`, class: [isDisabled(c) && 'disabled', this.activeId === `${x.key}/${c.key}` && 'active'] }, c.title)
                  )
                ))
              ])
            )
          ),
          h('div', { class: 'side-card' }, [
            h('a', { href: '#faq', class: ['side-button', this.activeId === 'faq' && 'active'] }, 'FAQ'),
            h('label', { class: 'side-button' }, [
              'Import Progress',
              h('input', { type: 'file', style: 'display: none;', onChange: this.handleImportChange })
            ]),
            h('button', { type: 'button', class: 'side-button', onClick: this.handleExportClick }, 'Export Progress'),
            h('button', { type: 'button', class: 'side-button', onClick: this.handleExportMarkdownClick }, 'Markdown Export'),
          ]),
        ])
      ])
    ];
  }
}
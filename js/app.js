import { h } from 'vue';
import { ONotificationsContainer } from 'notifications';
import LocalStorage from 'local-storage';
import AsyncLoader from './components/async-loader.js';
import Sidebar from './sidebar.js';
import HashRouter from './components/hash-router.js';
import HomePage from './pages/home.js';
import FAQPage from './pages/faq.js';
import ChecklistPage from './pages/checklist.js';
import { escapeKey, generateMarkdown } from './utils.js';

const progressKey = 'stellar-blade-checklist';
const appTitle = 'Stellar Blade Checklist';

export default {
  name: 'app',
  components: {
    AsyncLoader,
    ONotificationsContainer,
    Sidebar,
    HashRouter,
    HomePage,
    FAQPage,
    ChecklistPage,
  },
  data() {
    const ls = new LocalStorage(progressKey);
    ls.addProperty('completed', Array);

    return {
      localStorage: ls,
      checklistData: {},
      sideMenuData: [],
      completed: ls.get('completed', []),
      pageId: false,
    };
  },
  watch: {
    checklistData(value) {
      if (typeof value === 'object') {
        this.sideMenuData = Object.keys(value).map(key => {
          const item = {
            key,
            title: value[key].title
          };

          if (key === 'data-bank') {
            const list = value[key].list;
            item.children = Object.keys(list).map(k => ({ key: k, title: list[k].title }));
          }

          return item;
        });
      }
    },
    completed: {
      handler(value) {
        if (this.localStorage) {
          this.localStorage.set('completed', value);
        }
      },
      deep: true
    }
  },
  provide() {
    return {
      setCompleted: this.setCompleted,
      isCompleted: this.isCompleted,
      getCompletedCount: this.getCompletedCount,
      exportMarkdown: this.exportMarkdown,
      exportChecklist: this.exportChecklist,
      importChecklist: this.importChecklist,
      makeKey: this.makeKey,
    };
  },
  methods: {
    makeKey(dataKey, ...values) {
      return values.reduce((t, v) => {
        if (!Boolean(v)) return t;

        if (typeof v === 'object') {
          if (typeof v.key === 'string') {
            t.push(v.key);

          } else {
            t.push(escapeKey(v.name || v.title));
          }

        } else if (typeof v === 'string') {
          t.push(escapeKey(v));
        }

        return t;

      }, [dataKey]).filter(Boolean).join('/');
    },
    async loadData() {
      const res = await fetch('./data.json');
      if (res.ok) {
        const data = await res.json();

        const defCompleted = data['$completed'];
        if (Array.isArray(defCompleted)) {
          const completed = [].concat(this.completed || [])
            .concat(defCompleted)
            .filter((x, i, arr) => arr.indexOf(x) === i);
          this.completed = completed;
        }

        for (const key of Object.keys(data).filter(x => x.startsWith('$'))) {
          delete data[key];
        }

        this.checklistData = data;
      }
    },
    handlePageChange(pageId) {
      this.pageId = pageId;
    },
    setCompleted(dataKey, completed) {
      if (completed === true) {
        const index = this.completed.indexOf(dataKey);
        if (index == -1) {
          this.completed.push(dataKey);
        }

      } else {
        const index = this.completed.indexOf(dataKey);
        if (index > -1) {
          this.completed.splice(index, 1);
        }
      }
    },
    isCompleted(dataKey) {
      return !!~this.completed.indexOf(dataKey);
    },
    getCompletedCount(dataKey) {
      return this.completed.filter(x => x.startsWith(dataKey)).length;
    },
    exportMarkdown() {
      const markdown = generateMarkdown(appTitle, this.checklistData, this.completed);

      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${progressKey}.md`;
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    },
    exportChecklist() {
      if (this.completed.length == 0) return;

      const data = {
        key: progressKey,
        completed: this.completed.sort()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${progressKey}.json`;
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    },
    importChecklist(fileContent) {
      try {
        const data = JSON.parse(fileContent);
        if (data.key === progressKey && Array.isArray(data.completed)) {
          this.completed = data.completed;

          this.$nextTick(() => {
            this.$notifications.open('Checklist progress imported!', {
              title: appTitle,
              icon: 'success',
              type: 'success',
            });
          });

        } else {
          throw new Error('Import failed.');
        }

      } catch (err) {
        console.error(err);

        this.$notifications.open('Failed to import: Invalid file format.', {
          title: appTitle,
          icon: 'error',
          type: 'error',
        });
      }
    },
  },
  render() {
    return [
      h(AsyncLoader, { promise: this.loadData }),
      h('div', { class: 'content-container' }, [
        h(Sidebar, { modelValue: this.sideMenuData, activeId: this.pageId }),
        h('div', { class: 'content-card' },
          h(HashRouter, { onChange: this.handlePageChange }, {
            default: () => h(HomePage, { title: appTitle }),
            faq: () => h(FAQPage),
            '#routes': (pathNames) => {
              if (pathNames) {
                const parts = pathNames.split('/');
                if (parts.length > 0) {
                  const key = parts[0];
                  const data = this.checklistData[key];

                  if (data) {
                    if (parts.length === 2) {
                      return h(ChecklistPage, { key: pathNames, dataKey: pathNames, listData: data.list[parts[1]] });

                    } else {
                      return h(ChecklistPage, { key: pathNames, dataKey: pathNames, listData: data })
                    }
                  }
                }
              }
              return '';
            }
          })
        )
      ]),
      h(ONotificationsContainer, { position: 'bottom-right' }),
    ];
  }
}
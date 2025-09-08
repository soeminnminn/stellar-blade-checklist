import { h } from 'vue';
import { ONotificationsContainer } from 'notifications';
import LocalStorage from 'local-storage';
import { appTitle, progressKey } from './constants.js';
import AsyncLoader from './components/async-loader.js';
import Sidebar from './sidebar.js';
import HashRouter from './components/hash-router.js';
import HomePage from './pages/home.js';
import FAQPage from './pages/faq.js';
import RegionPage from './pages/region.js';
import ChecklistPage from './pages/checklist.js';
import { escapeKey, generateMarkdown } from './utils.js';
import conditional from './conditional.js';

const conditionsDataDef = {
  gameMode: {
    title: "Game Mode",
    list: []
  },
  region: {
    title: "Region",
    list: []
  }
};

export default {
  name: 'app',
  components: {
    AsyncLoader,
    ONotificationsContainer,
    Sidebar,
    HashRouter,
    HomePage,
    FAQPage,
    RegionPage,
    ChecklistPage,
  },
  data() {
    const ls = new LocalStorage(progressKey);
    ls.addProperty('completed', Array);
    ls.addProperty('gameMode', Number);
    ls.addProperty('region', Number);

    return {
      localStorage: ls,
      conditionsData: conditionsDataDef,
      checklistData: {},
      sideMenuData: [],
      defCompleted: [],
      completed: ls.get('completed', []),
      pageId: false,
      gameMode: ls.get('gameMode', 0),
      lastRegion: ls.get('region', 0),
      sort: {},
    };
  },
  watch: {
    checklistData(value) {
      if (typeof value === 'object') {
        const conditionsData = this.conditionsData || {};

        const conditionsMenu = Object.keys(conditionsData).reduce((t, x) => {
          if (x !== 'gameMode') {
            t.push({
              key: x,
              title: conditionsData[x].title,
            });
          }
          return t;
        }, []);

        const menuData = Object.keys(value).map(key => {
          const item = {
            key,
            title: value[key].title,
            '$condition': value[key]['$condition'],
          };

          if (key === 'data-bank') {
            const list = value[key].list;
            item.children = Object.keys(list).map(k => ({ key: k, title: list[k].title, '$condition': list[k]['$condition'] }));
          }

          return item;
        });

        this.sideMenuData = [
          ...conditionsMenu,
          ...menuData
        ];
      }
    },
    gameMode() {
      if (this.pageId) {
        this.pageId = false;

        this.$nextTick(() => {
          window.location.hash = '';
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
      getGameMode: () => this.gameMode,
      setGameMode: this.setGameMode,
      getLastRegion: () => this.lastRegion,
      setLastRegion: this.setLastRegion,
      isDisabled: this.isDisabled,
      setCompleted: this.setCompleted,
      isCompleted: this.isCompleted,
      isDefCompleted: (dataKey) => this.defCompleted.includes(dataKey),
      getCompletedCount: this.getCompletedCount,
      exportMarkdown: this.exportMarkdown,
      exportChecklist: this.exportChecklist,
      importChecklist: this.importChecklist,
      makeKey: this.makeKey,
      setSort: (dataKey, sortKey) => {
        this.sort[dataKey] = sortKey;
      },
      getSort: (dataKey) => this.sort[dataKey] || '#',
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

        this.conditionsData = data['$condition-data'] || conditionsDataDef;

        const defCompleted = data['$default-completed'];
        if (Array.isArray(defCompleted)) {
          const completed = [].concat(this.completed || [])
            .concat(defCompleted)
            .filter((x, i, arr) => arr.indexOf(x) === i);
          this.completed = completed;
          this.defCompleted = defCompleted;
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
    setGameMode(value) {
      this.gameMode = value;

      if (this.localStorage) {
        this.localStorage.set('gameMode', value);
      }
    },
    setLastRegion(value) {
      this.lastRegion = value;

      if (this.localStorage) {
        this.localStorage.set('region', value);
      }
    },
    isDisabled(value) {
      if (typeof value === 'object') {
        const condition = value['$condition'];
        if (typeof condition === 'object' || typeof condition === 'string') {
          const values = {
            gameMode: this.gameMode,
            region: this.lastRegion
          };

          return conditional(condition, values) === false;
        }
      }
      return false;
    },
    exportMarkdown() {
      const gameModesData = {
        ...this.conditionsData['gameMode'],
        list: this.conditionsData['gameMode'].list.map((x, i) => ({ ...x, completed: i <= this.gameMode }))
      };

      const regionsData = {
        ...this.conditionsData['region'],
        list: this.conditionsData['region'].list.map((x, i) => ({ ...x, completed: i <= this.lastRegion }))
      };

      const listData = { ...this.checklistData };

      const markdown = generateMarkdown(this.$t('APP_TITLE'), gameModesData, regionsData, listData, this.completed);

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
        gameMode: this.gameMode,
        region: this.lastRegion,
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

          if (typeof data.region !== 'undefined') {
            const num = Number(data.region);
            if (!Number.isNaN(num)) {
              this.setLastRegion(num);
            }
          }

          if (typeof data.gameMode !== 'undefined') {
            const num = Number(data.gameMode);
            if (!Number.isNaN(num)) {
              this.setGameMode(num);
            }
          }

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
      h('div', { key: `${this.gameMode}-${this.lastRegion}`, class: 'content-container' }, [
        h(Sidebar, { gameModes: this.conditionsData['gameMode'].list, modelValue: this.sideMenuData, activeId: this.pageId }),
        h('div', { class: 'content-card' },
          h(HashRouter, { onChange: this.handlePageChange }, {
            default: () => h(HomePage, { title: this.$t('APP_TITLE') }),
            faq: () => h(FAQPage),
            region: () => h(RegionPage, { dataKey: 'region', listData: this.conditionsData['region'] }),
            '#routes': (pathNames) => {
              if (pathNames) {
                const parts = pathNames.split('/');
                if (parts.length > 0) {
                  const key = parts[0];
                  const data = this.checklistData[key];

                  if (data) {
                    if (parts.length === 2) {
                      const subData = data.list[parts[1]];
                      return h(ChecklistPage, { key: pathNames, dataKey: pathNames, listData: subData });

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
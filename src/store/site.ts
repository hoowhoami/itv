import { defineStore } from 'pinia';

export interface Site {
  name?: string;
  url?: string;
}

interface SiteState {
  sites: Site[];
  selected?: Site[];
}

export const useSiteStore = defineStore('site', {
  // 持久化
  persist: true,

  state: (): SiteState => ({
    sites: [
      {
        name: 'itv',
        url: 'https://www.itv.com',
      },
      {
        name: 'bbc',
        url: 'https://www.bbc.com',
      },
      {
        name: 'cnn',
        url: 'https://www.cnn.com',
      },
      {
        name: 'test',
        url: 'https://www.test.com',
      },
    ],
    selected: [],
  }),

  // 获取器
  getters: {
    getSites: (state: SiteState) => {
      return state.sites;
    },
    getSelectedSites: (state: SiteState) => {
      return state.selected;
    },
  },

  // 动作
  actions: {
    addSite(site: Site) {
      this.sites.push(site);
    },
    deleteSite(site: Site) {
      const index = this.sites.indexOf(site);
      if (index > -1) {
        this.sites.splice(index, 1);
      }
      const selectedIndex = this.selected?.indexOf(site);
      if (selectedIndex && selectedIndex > -1) {
        this.selected?.splice(selectedIndex, 1);
      }
    },
    setSelected(selected: Site[]) {
      const filtered = selected.filter((s) => this.sites.includes(s));
      this.selected = filtered;
    },
  },
});

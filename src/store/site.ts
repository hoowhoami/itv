import { defineStore } from 'pinia';

export interface Site {
  key: string;
  name: string;
  api: string;
  deletable: boolean;
  speed?: number;
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
        key: 'heimuer',
        api: 'https://json.heimuer.xyz',
        name: '黑木耳',
        deletable: false,
      },
      {
        key: 'wolong',
        api: 'https://wolongzyw.com',
        name: '卧龙资源',
        deletable: false,
      },
      {
        key: 'jisu',
        api: 'https://jszyapi.com',
        name: '极速资源',
        deletable: false,
      },
      {
        key: 'ffzy5',
        api: 'http://ffzy5.tv',
        name: '非凡影视',
        deletable: false,
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
    updateSite(site: Site) {
      const index = this.sites.indexOf(site);
      if (index > -1) {
        this.sites.splice(index, 1, site);
      }
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

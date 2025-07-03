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
    sites: [],
    selected: []
  }),

  // 获取器
  getters: {
    getSites: (state: SiteState) => {
      return state.sites;
    },
    getSelectedSites: (state: SiteState) => {
      return state.selected;
    }
  },

  // 动作
  actions: {
    addSite(site: Site) {
      this.sites.push(site);
    },
    setSelected(selected: Site[]) {
      const filtered = selected.filter((s) => this.sites.includes(s));
      this.selected = filtered;
    }
  }
});

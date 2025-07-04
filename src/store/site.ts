import { computed } from 'vue';
import { defineStore } from 'pinia';

export interface Site {
  key: string;
  name: string;
  api: string;
  deletable: boolean;
}

interface SiteState {
  sites: Site[];
  selected?: string[];
}

export const useSiteStore = defineStore('site', {
  // 持久化
  persist: true,

  state: (): SiteState => ({
    sites: [],
    selected: [],
  }),

  // 获取器
  getters: {
    getSites: (state: SiteState) => {
      return state.sites;
    },
    getSelectedKeys: (state: SiteState) => {
      return state.selected || [];
    },
    getSelectedSites: (state: SiteState) => {
      return computed(() => {
        return state.selected?.map((key) => state.sites.find((site) => site.key === key)) || [];
      });
    },
  },

  // 动作
  actions: {
    addSite(site: Site) {
      this.sites.push(site);
    },
    deleteSite(site: Site) {
      this.sites = this.sites.filter((item) => item.key !== site.key);
      this.selected = this.selected?.filter((item) => item !== site.key);
    },
    setSelected(selected: string[]) {
      this.selected = selected.filter((item) => this.sites.some((site) => site.key === item));
    },
  },
});

import { defineStore } from 'pinia';

export interface Proxy {
  key: string;
  name: string;
  url: string;
  deletable: boolean;
}

interface ProxyState {
  proxies: Proxy[];
  selected?: string;
}

export const useProxyStore = defineStore('proxy', {
  // 持久化
  persist: true,

  state: (): ProxyState => ({
    proxies: [],
    selected: undefined,
  }),

  // 获取器
  getters: {
    getProxies: (state: ProxyState) => {
      return state.proxies;
    },
    getSelectedKey: (state: ProxyState) => {
      return state.selected;
    },
  },

  // 动作
  actions: {
    addProxy(proxy: Proxy) {
      this.proxies.push(proxy);
    },
    deleteProxy(proxy: Proxy) {
      this.proxies = this.proxies.filter((p) => p.key !== proxy.key);
      if (this.selected === proxy.key) {
        if (this.proxies.length > 0) {
          this.selected = this.proxies[0].key;
        } else {
          this.selected = undefined;
        }
      }
    },
    setSelected(selected: string) {
      if (this.proxies.some((item) => item.key === selected)) {
        this.selected = selected;
      }
    },
  },
});

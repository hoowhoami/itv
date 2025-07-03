import { defineStore } from 'pinia';

export interface Proxy {
  key: string;
  name: string;
  url: string;
  deletable: boolean;
}

interface ProxyState {
  proxies: Proxy[];
  selected?: Proxy;
}

export const useProxyStore = defineStore('proxy', {
  // 持久化
  persist: true,

  state: (): ProxyState => ({
    proxies: [
      {
        key: 'none',
        name: '不代理',
        url: 'unknown',
        deletable: false,
      },
    ],
    selected: undefined,
  }),

  // 获取器
  getters: {
    getProxies: (state: ProxyState) => {
      return state.proxies;
    },
    getSelectedProxy: (state: ProxyState) => {
      return state.selected;
    },
  },

  // 动作
  actions: {
    addProxy(proxy: Proxy) {
      this.proxies.push(proxy);
    },
    deleteProxy(proxy: Proxy) {
      const index = this.proxies.indexOf(proxy);
      if (index > -1) {
        this.proxies.splice(index, 1);
        if (this.selected && this.selected.name === proxy.name) {
          if (this.proxies.length > 0) {
            this.selected = this.proxies[0];
          } else {
            this.selected = undefined;
          }
        }
      }
    },
    selectProxy(proxy: Proxy) {
      if (this.proxies.includes(proxy)) {
        this.selected = proxy;
      }
    },
  },
});

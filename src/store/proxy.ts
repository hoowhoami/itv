import { Proxy } from '@/types';
import { defineStore } from 'pinia';

interface ProxyState {
  proxies: Proxy[];
  selectedProxy?: Proxy;
}

export const useProxyState = defineStore('proxy', {
  // 持久化
  persist: true,

  state: (): ProxyState => ({
    proxies: [
      {
        name: '不代理',
        url: ''
      }
    ],
    selectedProxy: undefined
  }),

  // 获取器
  getters: {
    getProxies: (state: ProxyState) => {
      return state.proxies;
    },
    getSelectedProxy: (state: ProxyState) => {
      return state.selectedProxy;
    }
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
        if (this.selectedProxy && this.selectedProxy.name === proxy.name) {
          if (this.proxies.length > 0) {
            this.selectedProxy = this.proxies[0];
          } else {
            this.selectedProxy = undefined;
          }
        }
      }
    },
    selectProxy(proxy: Proxy) {
      if (this.proxies.includes(proxy)) {
        this.selectedProxy = proxy;
      }
    }
  }
});

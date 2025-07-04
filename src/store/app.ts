import { defineStore } from 'pinia';

export interface AppState {
  PROXY_BASE_URL?: string;
  AUTH_BASE_URL?: string;
}

export const useAppStore = defineStore('app', {
  // 持久化
  persist: true,

  state: (): AppState => ({
    PROXY_BASE_URL: undefined,
    AUTH_BASE_URL: undefined,
  }),

  // 获取器
  getters: {
    getProxyBaseUrl: (state: AppState) => {
      return state.PROXY_BASE_URL;
    },
    getAuthBaseUrl: (state: AppState) => {
      return state.AUTH_BASE_URL;
    },
  },

  // 动作
  actions: {
    setAppConfig(config: Partial<AppState>) {
      if (config) {
        Object.entries(config).forEach(([key, value]) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this as Record<string, any>)[key] = value;
        });
      }
    },
  },
});

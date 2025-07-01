import { defineStore } from 'pinia';

interface AppState {
  theme: 'light' | 'dark' | 'system';
}

export const useAppStore = defineStore('app', {
  // 状态
  state: (): AppState => ({
    theme: 'dark'
  }),

  // 获取器（类似于计算属性）
  getters: {
    getThemeMode: (state: AppState) => {
      return state.theme;
    }
  },

  // 动作（类似于方法）
  actions: {
    setThemeMode(value: 'light' | 'dark' | 'system') {
      this.theme = value;
    },
    reset() {
      this.theme = 'dark';
    }
  }
});

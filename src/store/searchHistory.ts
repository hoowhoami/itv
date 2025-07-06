import { defineStore } from 'pinia';
import { ref } from 'vue';

// 定义历史搜索记录的类型
export interface SearchHistory {
  term: string;
  timestamp: number;
}

export const useSearchHistoryStore = defineStore(
  'searchHistory',
  () => {
    const searchHistory = ref<SearchHistory[]>([]);

    // 添加搜索历史
    const addToSearchHistory = (term: string) => {
      if (!term.trim()) return;

      // 过滤掉相同的搜索词
      const filtered = searchHistory.value.filter((item) => item.term !== term);
      // 添加新的搜索记录到开头，限制最多保存10条
      const newHistory = [{ term, timestamp: Date.now() }, ...filtered].slice(0, 10);
      searchHistory.value = newHistory;
    };

    // 清除搜索历史
    const clearSearchHistory = () => {
      searchHistory.value = [];
    };

    // 删除单个搜索历史项
    const removeSearchHistoryItem = (term: string) => {
      searchHistory.value = searchHistory.value.filter((item) => item.term !== term);
    };

    // 获取搜索历史
    const getSearchHistory = () => {
      return searchHistory.value;
    };

    return {
      searchHistory,
      addToSearchHistory,
      clearSearchHistory,
      removeSearchHistoryItem,
      getSearchHistory,
    };
  },
  {
    persist: true,
  }
);

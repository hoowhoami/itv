<script lang="ts" setup>
  import { InputSearch, Button } from 'ant-design-vue';
  import { ref, computed } from 'vue';
  import { Trash2 } from 'lucide-vue-next';
  import { useRouter } from 'vue-router';
  import { useSearchHistoryStore } from '@/store';

  defineOptions({
    name: 'SearchForm',
  });

  const inputRef = ref<HTMLInputElement>();
  const modelValue = defineModel('value', { default: '' });
  const showHistory = ref(false);

  const router = useRouter();
  const searchHistoryStore = useSearchHistoryStore();

  // 使用 computed 来获取搜索历史
  const searchHistory = computed(() => searchHistoryStore.getSearchHistory());

  const handleFocus = () => {
    showHistory.value = true;
  };

  const handleBlur = () => {
    setTimeout(() => (showHistory.value = false), 200);
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    //
    handleSearch();
  };

  // 检查是否是m3u8链接
  const isM3u8Url = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.endsWith('.m3u8') || url.includes('.m3u8');
    } catch {
      return false;
    }
  };

  const handleSearch = (term: string = modelValue.value) => {
    if (!term.trim()) return;

    // 检查是否是m3u8链接
    if (isM3u8Url(term)) {
      window.open(`#/simple-play?url=${encodeURIComponent(term)}`, '_blank');
      return;
    }

    // 检查是否是URL
    try {
      new URL(term);
      // 如果是URL但不是m3u8，跳转到在线解析页面
      window.open(`#/online-play?url=${encodeURIComponent(term)}`, '_blank');
      return;
    } catch {
      // 不是URL，按普通搜索处理
    }

    // 增加searchKey以强制触发重新搜索
    // setSearchKey((prev: number) => prev + 1);
    // 跳转到搜索结果页面，添加时间戳参数
    // navigate(`/search?q=${encodeURIComponent(term)}&t=${Date.now()}`);
    router.push({
      path: '/search',
      query: {
        q: term,
        t: Date.now(),
      },
    });
    addToSearchHistory(term);
    showHistory.value = false;
    inputRef.value?.blur();
  };

  // 添加搜索历史
  const addToSearchHistory = (term: string) => {
    searchHistoryStore.addToSearchHistory(term);
  };

  // 清除搜索历史
  const clearSearchHistory = () => {
    searchHistoryStore.clearSearchHistory();
  };

  // 从搜索历史中搜索
  const searchFromHistory = (term: string) => {
    modelValue.value = term;
    handleSearch(term);
  };
</script>
<template>
  <div class="search-form relative">
    <form @submit="handleSubmit">
      <div class="relative w-full">
        <input-search
          class="w-full"
          v-model:value="modelValue"
          allow-clear
          @search="handleSearch"
          @focus="handleFocus"
          @blur="handleBlur"
          placeholder="搜索电影、电视剧、视频地址、m3u8地址..."
        />
        <div
          v-if="showHistory && searchHistory.length > 0"
          class="absolute top-full left-0 right-0 bg-background/95 backdrop-blur border border-border/50 rounded-lg shadow-lg z-10 overflow-hidden"
        >
          <div class="flex items-center justify-between p-3 text-sm text-muted-foreground border-b border-border/30">
            <span>搜索历史</span>
            <Button size="small" type="dashed" danger @click="clearSearchHistory">
              <Trash2 class="w-3 h-3" />
            </Button>
          </div>
          <div
            class="max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400/30 scrollbar-track-transparent"
          >
            <div
              v-for="item in searchHistory"
              :key="item.timestamp"
              class="p-3 hover:bg-muted/50 cursor-pointer text-sm transition-colors"
              @click="searchFromHistory(item.term)"
            >
              {{ item.term }}
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
<style scoped>
  .search-form {
    padding: 0; /* 确保没有内边距影响宽度计算 */
  }
  :deep(.ant-input-group-addon > button > span) {
    line-height: 30px;
  }
</style>

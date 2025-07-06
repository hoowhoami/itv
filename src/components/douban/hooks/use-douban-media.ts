import { ref, onMounted, watch, Ref, onUnmounted } from 'vue';
import { useProxy } from '@/hooks/use-proxy';
import { useIntersectionObserver } from '@vueuse/core';

// 定义类型
export interface MediaItem {
  id: string;
  title: string;
  cover: string;
  rate?: string;
  url?: string;
  is_new?: boolean;
  currentEpisode?: number;
  totalEpisodes?: number;
  episodes_info?: string;
}

export function useDoubanMedia(
  type: string,
  activeCategory: Ref<string | undefined>,
  loadMoreRef: Ref<HTMLElement | undefined>,
  pageLimit: number = 18
) {
  // 公共逻辑
  const loading = ref(false);
  const list = ref<MediaItem[]>([]);
  const page = ref(1);
  const hasMore = ref(true);

  const { fetchWithProxy } = useProxy();

  const fetchData = async (category: string, pageStart: number = 0) => {
    loading.value = true;
    try {
      const targetUrl = `https://movie.douban.com/j/search_subjects?type=${type}&tag=${encodeURIComponent(category)}&sort=recommend&page_limit=${pageLimit}&page_start=${pageStart}`;
      const response = await fetchWithProxy(targetUrl);
      const data = await response.json();
      return data.subjects || [];
    } catch (error) {
      console.error(`Error fetching ${type} data:`, error);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const loadMore = async () => {
    if (loading.value) return;
    const newData = await fetchData(activeCategory.value as string, page.value * pageLimit);
    if (newData.length < pageLimit) {
      hasMore.value = false;
      return;
    }
    list.value = [...list.value, ...newData];
    page.value = page.value + 1;
  };

  const mediaObserver = useIntersectionObserver(
    loadMoreRef,
    ([{ isIntersecting }]) => {
      if (isIntersecting && !loading.value && hasMore.value) {
        loadMore();
      }
    },
    { threshold: 0.1 }
  );

  // 组件卸载时自动停止
  onUnmounted(() => {
    mediaObserver?.stop();
  });

  onMounted(async () => {
    await fetchData(activeCategory.value as string);
  });

  watch(
    () => activeCategory.value,
    async (newCategory) => {
      if (newCategory) {
        list.value = [];
        const data = await fetchData(newCategory);
        list.value = data;
      }
    }
  );

  return {
    loading,
    list,
  };
}

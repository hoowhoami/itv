<script lang="ts" setup>
  import { Button, Tabs, TabPane, Spin } from 'ant-design-vue';
  import { onMounted, onUnmounted, ref, watch } from 'vue';
  import { useProxy } from '@/hooks/use-proxy';
  import { useIntersectionObserver } from '@vueuse/core';
  import MediaCard from '@/components/MediaCard.vue';

  defineOptions({
    name: 'DoubanMedia',
  });

  // 定义类型
  interface MediaItem {
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

  // 分类数据
  const movieCategories = ref([
    { id: '热门', name: '热门' },
    { id: '最新', name: '最新' },
    { id: '动漫', name: '动漫' },
    { id: '豆瓣高分', name: '豆瓣高分' },
  ]);

  const tvCategories = ref([
    { id: '热门', name: '热门' },
    { id: '国产剧', name: '国产剧' },
    { id: '综艺', name: '综艺' },
    { id: '美剧', name: '美剧' },
  ]);

  const activeKey = ref('movies');
  const activeMovieCategory = ref<string>();
  const activeTvCategory = ref<string>();
  const movieLoading = ref(false);
  const tvLoading = ref(false);
  const movies = ref<MediaItem[]>([]);
  const tvShows = ref<MediaItem[]>([]);
  const moviePage = ref<number>(1);
  const tvPage = ref<number>(1);
  const movieHasMore = ref(true);
  const tvHasMore = ref(true);

  const setActiveMovieCategory = (category: string) => {
    activeMovieCategory.value = category;
  };

  const setActiveTvCategory = (category: string) => {
    activeTvCategory.value = category;
  };

  const handleMediaClick = (title: string) => {
    console.log('Clicked on:', title);
  };

  const { fetchWithProxy } = useProxy();

  // 获取电影数据
  const fetchMovies = async (category: string, pageStart: number = 0) => {
    movieLoading.value = true;
    try {
      const targetUrl = `https://movie.douban.com/j/search_subjects?type=movie&tag=${encodeURIComponent(category)}&sort=recommend&page_limit=18&page_start=${pageStart}`;
      const response = await fetchWithProxy(targetUrl);
      const data = await response.json();
      return data.subjects || [];
    } catch (error) {
      console.error('Error fetching movies:', error);
      return [];
    } finally {
      movieLoading.value = false;
    }
  };

  // 获取电视剧数据
  const fetchTvShows = async (category: string, pageStart: number = 0) => {
    tvLoading.value = true;
    try {
      const targetUrl = `https://movie.douban.com/j/search_subjects?type=tv&tag=${encodeURIComponent(category)}&sort=recommend&page_limit=18&page_start=${pageStart}`;
      const response = await fetchWithProxy(targetUrl);
      const data = await response.json();
      return data.subjects || [];
    } catch (error) {
      console.error('Error fetching tv shows:', error);
      return [];
    } finally {
      tvLoading.value = false;
    }
  };

  // 加载更多电影
  const loadMoreMovies = async () => {
    if (movieLoading.value) return;
    const newMovies = await fetchMovies(activeMovieCategory.value as string, moviePage.value * 18);
    movies.value = [...movies.value, ...newMovies];
    moviePage.value = moviePage.value + 1;
  };

  // 加载更多电视剧
  const loadMoreTvShows = async () => {
    if (tvLoading.value) return;
    const newShows = await fetchTvShows(activeTvCategory.value as string, tvPage.value * 18);
    tvShows.value = [...tvShows.value, ...newShows];
    tvPage.value = tvPage.value + 1;
  };

  const loadInitialData = async () => {
    const movieData = await fetchMovies(activeMovieCategory.value as string);
    movies.value = movieData;
    const tvData = await fetchTvShows(activeTvCategory.value as string);
    tvShows.value = tvData;
  };

  onMounted(async () => {
    await loadInitialData();
  });

  watch(
    () => activeMovieCategory.value,
    async (newCategory) => {
      if (newCategory) {
        const movieData = await fetchMovies(newCategory);
        movies.value = movieData;
      }
    }
  );

  watch(
    () => activeTvCategory.value,
    async (newCategory) => {
      if (newCategory) {
        const tvData = await fetchTvShows(newCategory);
        tvShows.value = tvData;
      }
    }
  );

  const movieRef = ref();

  const movieObserver = useIntersectionObserver(
    movieRef,
    ([{ isIntersecting }]) => {
      if (isIntersecting && !movieLoading.value && movieHasMore.value) {
        loadMoreMovies();
      }
    },
    { threshold: 0.1 }
  );

  const tvRef = ref();

  const tvObserver = useIntersectionObserver(
    tvRef,
    ([{ isIntersecting }]) => {
      if (isIntersecting && !tvLoading.value && tvHasMore.value) {
        loadMoreTvShows();
      }
    },
    { threshold: 0.1 }
  );

  // 停止监听
  const stopListening = () => {
    movieObserver?.stop();
    tvObserver?.stop();
  };

  // 组件卸载时自动停止
  onUnmounted(() => {
    stopListening();
  });
</script>
<template>
  <Tabs v-model:activeKey="activeKey" class="w-grid w-full grid-cols-2" centered>
    <template #renderTabBar="{ DefaultTabBar, ...props }">
      <component
        :is="DefaultTabBar"
        v-bind="props"
        class="aria-[selected=true]:bg-background aria-[selected=true]:border-border/50"
      />
    </template>
    <TabPane key="movies" tab="热门电影">
      <div class="mt-6">
        <div class="flex gap-2 mb-6">
          <Button
            v-for="category in movieCategories"
            :key="category.id"
            :danger="activeMovieCategory === category.id"
            @click="setActiveMovieCategory(category.id)"
            :class="activeMovieCategory !== category.id ? 'border-border/50 hover:border-border' : ''"
          >
            {{ category.name }}
          </Button>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <MediaCard
            v-for="movie in movies"
            :key="movie.id"
            :title="movie.title"
            :cover="movie.cover"
            :rate="movie.rate"
            :tag="movie.is_new ? '新片' : ''"
            @click="handleMediaClick(movie.title)"
          />
        </div>
        <div ref="movieRef" class="w-full py-8 flex justify-center">
          <Spin :spinning="movieLoading" />
        </div>
      </div>
    </TabPane>
    <TabPane key="tv" tab="热门电视剧">
      <div class="mt-6">
        <div class="flex gap-2 mb-6">
          <Button
            v-for="category in tvCategories"
            :key="category.id"
            :danger="activeTvCategory === category.id"
            @click="setActiveTvCategory(category.id)"
            :class="activeTvCategory !== category.id ? 'border-border/50 hover:border-border' : ''"
          >
            {{ category.name }}
          </Button>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <MediaCard
            v-for="show in tvShows"
            :key="show.id"
            :title="show.title"
            :cover="show.cover"
            :rate="show.rate"
            :tag="show.is_new ? '新片' : ''"
            :remark="show.episodes_info"
            @click="handleMediaClick(show.title)"
          />
        </div>
        <div ref="tvRef" class="w-full py-8 flex justify-center">
          <Spin :spinning="tvLoading" />
        </div>
      </div>
    </TabPane>
  </Tabs>
</template>
<style scoped></style>

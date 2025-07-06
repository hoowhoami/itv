<script lang="ts" setup>
  import { computed, onMounted, ref, watch } from 'vue';
  import Tabs from '@/components/Tabs/index.vue';
  import TabPanel from '@/components/Tabs/TabPanel.vue';
  import { RadioButton, RadioGroup, Spin, message, Badge } from 'ant-design-vue';
  import { Filter, Search } from 'lucide-vue-next';
  import MediaCard from '@/components/MediaCard.vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useSiteStore } from '@/store';
  import { useProxy } from '@/hooks/use-proxy';
  import type { Movie } from '@/types';

  defineOptions({
    name: 'SearchResultPage',
  });

  interface MovieResult {
    id: string;
    title: string;
    poster: string;
    source: string;
    vod_remarks: string;
    source_key: string;
    type: string;
    year: string;
    region: string;
    rate?: string;
  }

  interface CloudResource {
    id: number;
    title: string;
    poster: string;
    sourceChannel: string;
    platform: string;
    publishTime: string;
    shareUrl: string;
    shareCode: string;
    tags: string[];
  }

  const searchQuery = ref('');
  const searchKey = ref('');
  const movieResults = ref<MovieResult[]>([]);
  const cloudResults = ref<CloudResource[]>([]);
  const activeKey = ref('movie');
  const loading = ref(false);
  const cloudLoading = ref(false);
  const selectedPlatform = ref('');
  const route = useRoute();
  const router = useRouter();
  const siteStore = useSiteStore();
  const { fetchWithProxy } = useProxy();

  const platforms = computed(() => {
    const rs = new Set<string>();
    cloudResults.value.forEach((resource) => rs.add(resource.platform));
    return Array.from(['all', ...rs]);
  });

  const platformCounts = computed<Record<string, number>>(() => {
    const counts: Record<string, number> = { all: cloudResults.value.length };
    cloudResults.value.forEach((resource) => {
      if (counts[resource.platform]) {
        counts[resource.platform]++;
      } else {
        counts[resource.platform] = 1;
      }
    });
    return counts;
  });

  const filteredCloudResults = computed<CloudResource[]>(() => {
    if (!selectedPlatform.value || selectedPlatform.value === 'all') {
      return cloudResults.value;
    }
    return cloudResults.value.filter((resource) => resource.platform === selectedPlatform.value);
  });

  const handleMediaClick = (movie: MovieResult) => {
    console.log('movie', movie);
    if (!movie.id) {
      console.error('Missing movie ID');
      return;
    }
    const vodId = movie.id;
    const source = movie.source_key || '';
    // window.location.hash=`play?vodId=${vodId}&source=${source}`;
    // RouterUtils.navigateTo('play', { vodId: vodId, source: source });
    router.push({
      path: '/play',
      query: {
        vodId,
        source,
      },
    });
  };

  const performSearch = async (query: string) => {
    loading.value = true;
    try {
      // 获取所有启用的资源站
      const selectedSites = siteStore.getSelectedSites;

      // 并行搜索所有站点
      const searchResults = await Promise.all(
        selectedSites.value.map(async (site) => {
          try {
            const targetUrl = `${site?.api}/api.php/provide/vod/?ac=videolist&wd=${encodeURIComponent(query)}`;
            const response = await fetchWithProxy(targetUrl);
            if (!response.ok) return [];
            const data = await response.json();
            if (data.code === 1 && data.list) {
              return data.list.map((item: Movie) => ({
                id: item.vod_id,
                title: item.vod_name,
                poster: item.vod_pic,
                source: site?.name,
                source_key: site?.key,
                vod_remarks: item.vod_remarks,
                type: item.type_name || '未知',
                year: item.vod_year || '未知',
                region: item.vod_area || '未知',
                rate: item.vod_score,
              }));
            }
            return [];
          } catch (error) {
            console.error(`Error searching in site ${site?.name}:`, error);
            return [];
          }
        })
      );

      // 合并所有搜索结果
      const allResults = searchResults.flat();
      movieResults.value = allResults;
      console.log('allResults', allResults);
    } catch (error) {
      console.error('Error fetching search results:', error);
      message.error('获取搜索结果时出错，请稍后重试');
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    if (route.query.q) {
      searchQuery.value = route.query.q as string;
    }
    if (route.query.t) {
      searchKey.value = route.query.t as string;
    }
  });

  watch([searchQuery, searchKey], async ([newSearchQuery]) => {
    if (!newSearchQuery) return;
    searchQuery.value = route.query.q as string;
    searchKey.value = route.query.t as string;
    loading.value = true;
    cloudLoading.value = true;
    await performSearch(newSearchQuery);
  });
</script>
<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-8">
      <div v-if="searchQuery" class="mb-6">
        <h1 class="text-2xl font-bold mb-2">搜索结果</h1>
        <p class="text-muted-foreground">关键词："{{ searchQuery }}"</p>
      </div>

      <Tabs v-if="movieResults.length > 0 || cloudResults.length > 0" v-model:activeKey="activeKey">
        <TabPanel tab="movie" :label="`影视作品 (${movieResults.length})`">
          <div class="pt-4">
            <div v-if="loading" class="flex items-center justify-center py-12">
              <Spin :spinning="loading" tip="正在搜索影视作品..." />
            </div>
            <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 justify-items-between">
              <MediaCard
                v-for="item in movieResults"
                :key="item.id"
                :title="item.title"
                :cover="item.poster"
                :rate="item.rate"
                :year="item.year"
                :region="item.region"
                :type="item.type"
                :remark="item.vod_remarks"
                :source="item.source"
                @click="handleMediaClick(item)"
              />
            </div>
          </div>
        </TabPanel>
        <TabPanel tab="cloud" :label="`网盘资源 (${cloudResults.length})`">
          <div class="px-4">
            <div v-if="cloudLoading" class="flex items-center justify-center py-12">
              <Spin :spinning="cloudLoading" tip="正在搜索网盘资源..." />
            </div>
            <div v-if="cloudResults.length > 0" class="mb-4">
              <div class="flex items-center gap-2 mb-3">
                <Filter class="w-4 h-4" />
                <h3 class="font-medium">按网盘类型筛选</h3>
              </div>
              <div class="flex flex-wrap gap-2">
                <RadioGroup v-model:value="selectedPlatform">
                  <Badge v-for="platform in platforms" :key="platform" :count="platformCounts[platform]">
                    <RadioButton :key="platform" :value="platform">{{ platform }}</RadioButton>
                  </Badge>
                </RadioGroup>
              </div>
              <div
                v-if="filteredCloudResults.length > 0"
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center"
              >
                <MediaCard
                  v-for="item in filteredCloudResults"
                  :key="item.id"
                  :title="item.title"
                  :cover="item.poster"
                  :source="item.sourceChannel"
                  :remark="item.platform"
                  @click="handleMediaClick(item as any)"
                />
              </div>
              <div v-else class="text-center py-8">
                <p class="text-muted-foreground">没有找到符合条件的{{ selectedPlatform }}资源</p>
              </div>
            </div>
          </div>
        </TabPanel>
      </Tabs>
      <div
        v-if="!loading && movieResults.length === 0 && cloudResults.length === 0 && searchQuery"
        class="text-center py-12"
      >
        <Search class="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 class="text-lg font-semibold mb-2">未找到相关资源</h3>
        <p class="text-muted-foreground mb-4">没有找到与 "{{ searchQuery }}" 相关的影视作品或网盘资源</p>
        <p class="text-sm text-muted-foreground">请检查采集站和网盘资源站配置，或尝试其他关键词</p>
      </div>
    </div>
  </div>
</template>
<style scoped>
  /* 确保MediaCard在grid中居中显示 */
  .grid {
    place-items: center;
  }

  /* 移动端网格适配 */
  @media (max-width: 768px) {
    .grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }

    .md\:grid-cols-4 {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    }

    .lg\:grid-cols-3 {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }

    .xl\:grid-cols-4 {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
  }

  @media (max-width: 480px) {
    .grid-cols-2 {
      grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
    }

    .md\:grid-cols-4 {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }

    .lg\:grid-cols-3,
    .xl\:grid-cols-4 {
      grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
    }

    .gap-4 {
      gap: 8px !important;
    }
  }
</style>

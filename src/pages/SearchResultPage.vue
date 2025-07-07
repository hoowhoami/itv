<script lang="ts" setup>
  import { computed, onMounted, ref, watch } from 'vue';
  import Tabs from '@/components/Tabs/index.vue';
  import TabPanel from '@/components/Tabs/TabPanel.vue';
  import { Spin, message } from 'ant-design-vue';
  import { Search, Loader2 } from 'lucide-vue-next';
  import MediaCard from '@/components/MediaCard.vue';
  import CloudResourceCard from '@/components/CloudResourceCard.vue';
  import CloudResourceFilter from '@/components/CloudResourceFilter.vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useDriveStore, useSiteStore } from '@/store';
  import { useProxy } from '@/hooks/use-proxy';
  import type { Movie } from '@/types';
  import { clearString } from '@/utils';
  import * as cheerio from 'cheerio';

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
  const activeKey = ref<'movie' | 'cloud'>('movie');
  const loading = ref(false);
  const hasNoData = ref(false);
  const movieLoading = ref(false);
  const cloudLoading = ref(false);
  const selectedPlatform = ref('all');
  const route = useRoute();
  const router = useRouter();
  const siteStore = useSiteStore();
  const driveStore = useDriveStore();
  const { fetchWithProxy } = useProxy();

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

  const movieCount = computed(() => {
    return movieResults.value.length;
  });

  const cloudCount = computed(() => {
    return cloudResults.value.length;
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

  // 根据链接判断网盘平台
  const getPlatformByUrl = (url: string): string => {
    try {
      const u = new URL(url);
      const host = u.hostname;
      if (/alipan\.com|aliyundrive\.com/.test(host)) return '阿里云网盘';
      if (/quark\.cn/.test(host)) return '夸克网盘';
      if (/baidu\.com/.test(host)) return '百度网盘';
      if (/189\.cn/.test(host)) return '天翼云网盘';
      if (/xunlei\.com/.test(host)) return '迅雷云盘';
      if (/123865\.com|123684\.com|123912\.com/.test(host)) return '123云盘';
      if (/139\.com/.test(host)) return '移动云盘';
      if (/uc\.cn/.test(host)) return 'UC网盘';
      return host;
    } catch {
      return '未知平台';
    }
  };

  // 格式化时间为相对时间
  const formatTimeAgo = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return '今天';
      if (diffDays === 1) return '1天前';
      if (diffDays < 7) return `${diffDays}天前`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
      return `${Math.floor(diffDays / 365)}年前`;
    } catch {
      return '未知时间';
    }
  };

  // 替换URL中的关键词
  const replaceKeywordInUrl = (url: string, keyword: string): string => {
    return url.replace(/{keyword}/g, encodeURIComponent(keyword));
  };

  // TG频道规则提取网盘信息
  const extractCloudInfoByTG = (htmlContent: string, channelName: string): CloudResource[] => {
    const $ = cheerio.load(htmlContent);
    const items: CloudResource[] = [];
    // 获取频道名（如有）
    let sourceChannel = channelName;
    const channelHeader = $('.tgme_header_link').find('img').attr('src');
    if (channelHeader) {
      sourceChannel = channelName;
    }

    // 遍历每个消息容器
    $('.tgme_widget_message_wrap').each((_: unknown, element: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const messageEl = $(element as any);

      // 发布时间
      const pubDate = messageEl.find('time').attr('datetime') || new Date().toISOString();
      // 标题（第一个<br>前的内容）
      const html = messageEl.find('.js-message_text').html() || '';
      const title =
        html
          .split('<br>')[0]
          ?.replace(/<[^>]+>/g, '')
          .replace(/\n/g, '')
          .trim() || '';

      // 云盘链接
      const links = messageEl
        .find('.tgme_widget_message_text a')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((_: unknown, el: unknown) => (el as any).href || (el as any).attribs?.href || '')
        .get();

      // 只保留平台能识别的云盘链接
      const validLinks = (links as string[]).filter((link: string) => {
        const platform = getPlatformByUrl(link);

        // 只要不是"未知平台"且不是原始 host
        return platform && platform !== '未知平台' && !/^([\w.-]+)$/.test(platform);
      });

      if (validLinks.length === 0) return;

      validLinks.forEach((link: string) => {
        items.push({
          id: Date.now() + Math.random(),
          title,
          poster: '', // TG规则不提取封面
          sourceChannel,
          platform: getPlatformByUrl(link),
          publishTime: pubDate,
          shareUrl: link,
          shareCode: '',
          tags: [],
        });
      });
    });
    // 按发布时间倒序排序
    const sortedItems = items.sort((a, b) => {
      const t1 = new Date(a.publishTime).getTime();
      const t2 = new Date(b.publishTime).getTime();
      return t2 - t1;
    });
    return sortedItems;
  };

  // 搜索采集站资源
  const performSearch = async (query: string) => {
    // 获取所有启用的资源站
    const selectedSites = siteStore.getSelectedSites;
    if (selectedSites.value.length === 0) {
      movieResults.value = [];
      return;
    }

    movieLoading.value = true;
    movieResults.value = [];

    try {
      // 并行搜索所有站点
      const searchResults = await Promise.all(
        selectedSites.value.map(async (site) => {
          try {
            const targetUrl = `${site?.api}/api.php/provide/vod/?ac=videolist&wd=${encodeURIComponent(query)}`;
            const response = await fetchWithProxy(targetUrl);
            if (!response.ok) return [];
            const data = await response.json();
            if (data.code === 1 && data.list) {
              if (data.list.length > 0) {
                loading.value = false;
              }
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
    } catch (error) {
      console.error('Error fetching search results:', error);
      message.error('获取搜索结果时出错，请稍后重试');
    } finally {
      movieLoading.value = false;
    }
  };

  // 搜索影视资源（包含重试逻辑）
  const searchMovieResourcesWithRetry = async (query: string) => {
    await performSearch(query);
    if (!movieResults.value.length) {
      const clearName = clearString(query);
      if (clearName !== query) {
        console.log('影视资源处理名称后再次搜索:', query, clearName);
        await performSearch(clearName);
      }
    }
  };

  // 搜索网盘资源（包含重试逻辑）
  const searchCloudResourcesWithRetry = async (query: string) => {
    await searchCloudResources(query);
    if (!cloudResults.value.length) {
      const clearName = clearString(query);
      if (clearName !== query) {
        console.log('网盘资源处理名称后再次搜索:', query, clearName);
        await searchCloudResources(clearName);
      }
    }
  };

  // 搜索网盘资源
  const searchCloudResources = async (query: string) => {
    // 获取所有启用的网盘资源站
    const selectedDrives = driveStore.getSelectedDrives.value;
    if (selectedDrives.length === 0) {
      cloudResults.value = [];
      return;
    }
    cloudLoading.value = true;
    const results: CloudResource[] = [];
    try {
      // 并行搜索所有启用的站点
      const searchPromises = selectedDrives.map(async (drive) => {
        if (drive) {
          try {
            const searchUrl = replaceKeywordInUrl(drive.url, query);
            const response = await fetchWithProxy(searchUrl);
            if (!response.ok) throw new Error(`站点 ${drive.name} 请求失败`);
            const html = await response.text();
            const list = extractCloudInfoByTG(html, drive.name);
            if (list.length > 0) {
              loading.value = false;
            }
            return list;
          } catch (error) {
            console.error(`搜索站点 ${drive.name} 失败:`, error);
            return [];
          }
        } else {
          return [];
        }
      });
      const siteResults = await Promise.all(searchPromises);
      const allResults = siteResults.flat();
      // 过滤重复链接，保留最新的资源
      const uniqueResults = allResults.reduce((acc: CloudResource[], current: CloudResource) => {
        const existingIndex = acc.findIndex((item) => item.shareUrl === current.shareUrl);
        if (existingIndex === -1) {
          acc.push(current);
        } else {
          const existing = acc[existingIndex];
          const existingTime = new Date(existing.publishTime).getTime();
          const currentTime = new Date(current.publishTime).getTime();
          if (currentTime > existingTime) {
            acc[existingIndex] = current;
          }
        }
        return acc;
      }, []);
      results.push(...uniqueResults);
    } catch (error) {
      console.error('搜索网盘资源失败:', error);
      message.error('获取网盘资源时出错，请稍后重试');
    } finally {
      cloudLoading.value = false;
      cloudResults.value = results;
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

  watch([searchQuery, searchKey], async ([newSearchQuery, newSearchKey]) => {
    if (!newSearchQuery) return;

    console.log('开始搜索:', newSearchQuery, newSearchKey);
    // loading
    loading.value = true;
    // 并行执行影视资源和网盘资源搜索
    await Promise.all([searchMovieResourcesWithRetry(newSearchQuery), searchCloudResourcesWithRetry(newSearchQuery)]);
    loading.value = false;
  });
</script>
<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-8">
      <div v-if="searchQuery" class="mb-6">
        <h1 class="text-2xl font-bold mb-2">搜索结果</h1>
        <p class="text-muted-foreground">关键词："{{ searchQuery }}"</p>
      </div>
      <div v-if="loading" class="flex items-center justify-center py-12">
        <Spin :spinning="loading" tip="正在搜索..." />
      </div>
      <Tabs v-if="movieResults.length > 0 || cloudResults.length > 0" v-model:activeKey="activeKey">
        <template #movie-tab="{ tab }">
          <div class="flex items-center justify-center">
            <div>
              {{ `${tab.label} (${movieCount})` }}
            </div>
            <div class="ml-2">
              <Loader2 v-if="movieLoading" class="w-4 h-4 animate-spin" />
            </div>
          </div>
        </template>
        <template #cloud-tab="{ tab }">
          <div class="flex items-center justify-center">
            <div>
              {{ `${tab.label} (${cloudCount})` }}
            </div>
            <div class="ml-2">
              <Loader2 v-if="cloudLoading" class="w-4 h-4 animate-spin" />
            </div>
          </div>
        </template>
        <TabPanel tab="movie" label="影视作品">
          <div class="pt-4">
            <div v-if="movieLoading" class="flex items-center justify-center py-12">
              <Spin :spinning="movieLoading" tip="正在搜索影视作品..." />
            </div>
            <div
              v-else
              class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 justify-items-between"
            >
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
        <TabPanel tab="cloud" label="网盘资源">
          <div class="pt-4">
            <div v-if="cloudLoading" class="flex items-center justify-center py-12">
              <Spin :spinning="cloudLoading" tip="正在搜索网盘资源..." />
            </div>
            <div v-else>
              <CloudResourceFilter
                v-if="cloudResults.length > 0"
                :platform-counts="platformCounts"
                :selected-platform="selectedPlatform"
                :total-count="cloudCount"
                @update:selected-platform="selectedPlatform = $event"
              />
              <div
                v-if="filteredCloudResults.length > 0"
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4"
              >
                <CloudResourceCard
                  v-for="item in filteredCloudResults"
                  :key="item.id"
                  :title="item.title"
                  :platform="item.platform"
                  :time-ago="formatTimeAgo(item.publishTime)"
                  :source="item.sourceChannel"
                  :link="item.shareUrl"
                />
              </div>
              <div v-else-if="cloudResults.length === 0" class="text-center py-8">
                <p class="text-muted-foreground">没有找到网盘资源</p>
              </div>
              <div v-else class="text-center py-8">
                <p class="text-muted-foreground">没有找到符合条件的{{ selectedPlatform }}资源</p>
              </div>
            </div>
          </div>
        </TabPanel>
      </Tabs>
      <div v-if="hasNoData && searchQuery" class="text-center py-12">
        <Search class="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 class="text-lg font-semibold mb-2">未找到相关资源</h3>
        <p class="text-muted-foreground mb-4">没有找到与 "{{ searchQuery }}" 相关的影视作品或网盘资源</p>
        <p class="text-sm text-muted-foreground">请检查采集站和网盘资源站配置，或尝试其他关键词</p>
      </div>
    </div>
  </div>
</template>
<style scoped></style>

<script lang="ts" setup>
  import { computed, ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { usePlayHistoryStore, useSiteStore } from '@/store';
  import { Button, Modal, message } from 'ant-design-vue';
  import { Trash2, History } from 'lucide-vue-next';
  import HistoryCard from '@/components/HistoryCard.vue';
  import { useProxy } from '@/hooks/use-proxy';
  import type { PlayHistoryItem } from '@/store/playHistory';

  // 详情API响应类型
  interface DetailApiResponse {
    code: number;
    msg?: string;
    list?: Array<{
      vod_id: string;
      vod_name: string;
      vod_remarks?: string;
      vod_year?: string;
      vod_area?: string;
      vod_score?: string;
      type_name?: string;
    }>;
  }

  // 影片详情信息类型
  interface MovieDetails {
    latestEpisode?: string;
    year?: string;
    region?: string;
    score?: string;
    type?: string;
  }

  defineOptions({
    name: 'HistoryPage',
  });

  const router = useRouter();
  const playHistoryStore = usePlayHistoryStore();
  const siteStore = useSiteStore();
  const { fetchWithProxy } = useProxy();

  // 影片详情相关状态
  const movieDetails = ref<Record<string, MovieDetails>>({});
  const loadingEpisodes = ref<Record<string, boolean>>({});

  // 获取播放历史
  const playHistory = computed(() => {
    return playHistoryStore.getAllPlayHistory();
  });

  // 获取影视详情和最新集数
  const fetchLatestEpisode = async (item: PlayHistoryItem) => {
    const key = `${item.vodId}-${item.source}`;

    // 如果正在加载或已经获取过，则跳过
    if (loadingEpisodes.value[key] || movieDetails.value[key]) {
      return;
    }

    loadingEpisodes.value[key] = true;

    try {
      // 获取所有站点
      const allSites = siteStore.getSelectedSites;

      // 查找对应的站点 API
      const foundSite = allSites.value.find((site) => site?.key === item.source);

      if (!foundSite) {
        throw new Error(`未找到源: ${item.source}`);
      }

      const apiBase = foundSite.api;

      // 使用 ac=detail 获取详情
      const targetUrl = `${apiBase}/api.php/provide/vod/?ac=detail&ids=${item.vodId}`;
      const response = await fetchWithProxy(targetUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DetailApiResponse = await response.json();

      if (data.code === 1 && data.list && data.list.length > 0) {
        const movie = data.list[0];

        // 存储完整的详情信息
        movieDetails.value[key] = {
          latestEpisode: movie.vod_remarks?.trim() || '',
          year: movie.vod_year?.trim() || '',
          region: movie.vod_area?.trim() || '',
          score: movie.vod_score?.trim() || '',
          type: movie.type_name?.trim() || '',
        };
      }
    } catch (error) {
      console.error(`获取 ${item.title} 的最新集数失败:`, error);
    } finally {
      loadingEpisodes.value[key] = false;
    }
  };

  // 组件挂载时获取所有历史记录的最新集数
  onMounted(() => {
    const history = playHistoryStore.getAllPlayHistory();
    history.forEach((item) => {
      fetchLatestEpisode(item);
    });
  });

  // 继续播放
  const handleContinueWatch = (item: { vodId: string; source: string; episode: string }) => {
    router.push({
      path: '/play',
      query: {
        vodId: item.vodId,
        source: item.source,
        episode: item.episode,
      },
    });
  };

  // 删除单个历史记录
  const handleDeleteHistory = (vodId: string, source: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条观看记录吗？',
      okText: '删除',
      cancelText: '取消',
      okType: 'danger',
      onOk() {
        playHistoryStore.removePlayHistory(vodId, source);
        message.success('删除成功');
      },
    });
  };

  // 清空所有历史记录
  const handleClearAll = () => {
    Modal.confirm({
      title: '确认清空',
      content: '确定要清空所有观看记录吗？此操作不可恢复。',
      okText: '清空',
      cancelText: '取消',
      okType: 'danger',
      onOk() {
        playHistoryStore.clearAllHistory();
        message.success('清空成功');
      },
    });
  };
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold mb-2">观看历史</h1>
          <p v-if="playHistory.length" class="text-muted-foreground">共 {{ playHistory.length }} 条观看记录</p>
        </div>
        <div v-if="playHistory.length" class="flex gap-2">
          <Button danger @click="handleClearAll">
            <div style="display: flex; align-items: center; gap: 6px">
              <Trash2 style="width: 14px !important; height: 14px !important; flex-shrink: 0" />
              <span style="font-size: 13px !important">清空历史</span>
            </div>
          </Button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!playHistory.length" class="text-center py-16">
        <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <History class="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 class="text-lg font-semibold mb-2">还没有观看记录</h3>
        <p class="text-muted-foreground mb-4">去首页发现精彩内容吧！</p>
        <Button type="primary" @click="router.push('/')"> 去首页看看 </Button>
      </div>

      <!-- 历史记录列表 -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 justify-items-between"
      >
        <HistoryCard
          v-for="item in playHistory"
          :key="`${item.vodId}-${item.source}`"
          :vod-id="item.vodId"
          :title="item.title"
          :cover="item.pic"
          :episode="item.episode"
          :source="item.source"
          :timestamp="item.timestamp"
          :current-time="item.currentTime"
          :duration="item.duration"
          :latest-episode="movieDetails[`${item.vodId}-${item.source}`]?.latestEpisode || ''"
          :movie-year="movieDetails[`${item.vodId}-${item.source}`]?.year || ''"
          :movie-region="movieDetails[`${item.vodId}-${item.source}`]?.region || ''"
          :movie-score="movieDetails[`${item.vodId}-${item.source}`]?.score || ''"
          :movie-type="movieDetails[`${item.vodId}-${item.source}`]?.type || ''"
          @continue-watch="handleContinueWatch"
          @delete="handleDeleteHistory"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>

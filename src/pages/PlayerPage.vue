<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
  import { useProxy } from '@/hooks/use-proxy';
  import { useSiteStore, usePlayHistoryStore } from '@/store';
  import type { Movie } from '@/types';
  import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { Button, Card, Tag, Checkbox } from 'ant-design-vue';
  const { CheckableTag } = Tag;
  import {
    ArrowUpDown,
    ChevronRight,
    ListVideo,
    Info,
    Calendar,
    Star,
    MapPin,
    Film,
    Globe,
    AlertCircle,
    ArrowLeft,
  } from 'lucide-vue-next';
  import Hls from 'hls.js';
  import Artplayer from 'artplayer';

  defineOptions({
    name: 'PlayerPage',
  });

  // --- Interfaces ---
  interface Episode {
    number: string;
    url: string;
  }

  interface DetailApiResponse {
    code: number;
    msg: string;
    list: Movie[];
  }

  const vodId = ref('');
  const sourceKey = ref('');
  const route = useRoute();
  const error = ref();
  const loading = ref(false);
  const movieDetails = ref<Movie | undefined>();
  const currentSource = ref<string | undefined>();
  const currentEpisode = ref<Episode | undefined>(); // 当前播放的集数
  const siteStore = useSiteStore();
  const playHistoryStore = usePlayHistoryStore();
  const { fetchWithProxy } = useProxy();
  const sortOrder = ref<'asc' | 'desc'>('asc');
  // 可用的采集站（动态搜索结果）
  const availableSources = ref<{ key: string; name: string }[]>([]);
  const searchingOtherSources = ref(false);
  const searchParams = ref();
  const skipStart = ref<number>(0);
  const skipEnd = ref<number>(0);
  const artRef = ref<HTMLDivElement | null>(null);
  const showDetailExpanded = ref(false); // 详情展开状态
  const playerKey = ref(0); // 播放器重新渲染的 key
  const previousSourceKey = ref<string>(''); // 上一个采集站
  const fetchError = ref(false); // 获取影片详情错误状态
  const errorMessage = ref(''); // 错误信息

  // 计算当前视频 URL
  const currentVideoUrl = computed(() => {
    if (!currentEpisode.value) return '';
    return currentEpisode.value.url || '';
  });

  // 计算当前集数索引
  const currentEpisodeIndex = computed(() => {
    if (!currentEpisode.value || !episodes.value.length) return -1;
    return episodes.value.findIndex((ep) => ep.url === currentEpisode.value?.url);
  });

  // 计算下一集
  const nextEpisode = computed(() => {
    const currentIndex = currentEpisodeIndex.value;
    if (currentIndex === -1 || currentIndex >= episodes.value.length - 1) return null;
    return episodes.value[currentIndex + 1];
  });

  // 计算上一集
  const prevEpisode = computed(() => {
    const currentIndex = currentEpisodeIndex.value;
    if (currentIndex <= 0) return null;
    return episodes.value[currentIndex - 1];
  });

  // 手动管理 Artplayer 实例
  const playerRef = ref<any>(null);
  const currentTime = ref(0);
  const duration = ref(0);

  // 创建播放器实例
  const createPlayer = () => {
    if (!artRef.value || !currentVideoUrl.value) return;

    // 销毁旧的播放器实例
    if (playerRef.value) {
      playerRef.value.destroy();
      playerRef.value = null;
    }

    console.log('创建新的播放器实例，URL:', currentVideoUrl.value);

    const currentEpisodeNumber = currentEpisode.value?.number || '1';
    const playerId = `itv-${vodId.value}-${sourceKey.value || 'default'}-${currentEpisodeNumber}`;

    try {
      const art = new Artplayer({
        container: artRef.value,
        url: currentVideoUrl.value,
        setting: true,
        autoplay: true,
        pip: true,
        fullscreen: true,
        fullscreenWeb: true,
        miniProgressBar: true,
        hotkey: true,
        playbackRate: true,
        lock: true,
        fastForward: true,
        id: playerId,
        autoPlayback: true,
        autoOrientation: true,
        theme: '#23ade5',
        settings: [
          {
            html: '播放速度',
            tooltip: '播放速度',
            selector: [
              {
                html: '2.0x',
                value: 2,
              },
              {
                html: '1.5x',
                value: 1.5,
              },
              {
                html: '1.25x',
                value: 1.25,
              },
              {
                html: '1.0x',
                value: 1,
                default: true,
              },
              {
                html: '0.75x',
                value: 0.75,
              },
              {
                html: '0.5x',
                value: 0.5,
              },
            ],
            onSelect: function (item: any) {
              console.log('播放速度选择:', item.value);
              return item.html;
            },
          },
        ],
        customType: {
          m3u8: function (video: HTMLVideoElement, url: string, art: any) {
            if (Hls.isSupported()) {
              if (art.hls) art.hls.destroy();
              const hls = new Hls();
              hls.loadSource(url);
              hls.attachMedia(video);
              art.hls = hls;
              art.on('destroy', () => hls.destroy());
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
              video.src = url;
            } else {
              art.notice.show = '不支持的播放格式: m3u8';
            }
          },
        },
      });

      // 定期保存播放进度
      let progressSaveTimer: NodeJS.Timeout | null = null;

      // 监听时间更新
      art.on('video:timeupdate', () => {
        currentTime.value = art.currentTime;
        duration.value = art.duration;

        // 保存播放进度
        if (currentEpisode.value && movieDetails.value) {
          // 清除之前的定时器
          if (progressSaveTimer) {
            clearTimeout(progressSaveTimer);
          }

          // 延迟保存，避免频繁写入
          progressSaveTimer = setTimeout(() => {
            const currentTimeValue = currentTime.value || 0;
            const durationValue = duration.value || 0;

            if (durationValue > 0 && currentEpisode.value && movieDetails.value) {
              playHistoryStore.updateEpisodeProgress({
                vodId: String(movieDetails.value.vod_id),
                source: sourceKey.value,
                episode: currentEpisode.value.number,
                currentTime: currentTimeValue,
                duration: durationValue,
              });
            }
          }, 2000); // 2秒后保存
        }
      });

      // 监听播放器准备就绪
      art.on('ready', () => {
        console.log('播放器准备就绪');

        // 恢复播放进度
        if (currentEpisode.value && movieDetails.value) {
          const progress = playHistoryStore.getEpisodeProgress(
            String(movieDetails.value.vod_id),
            sourceKey.value,
            currentEpisode.value.number
          );

          if (progress && progress.currentTime > 30) {
            // 如果有保存的进度且大于30秒，则跳转到该位置
            setTimeout(() => {
              art.seek = progress.currentTime;
            }, 1000);
          }
        }
      });

      // 监听视频播放完毕事件
      art.on('video:ended', () => {
        console.log('当前集播放完成');

        // 清除当前集的播放进度
        if (currentEpisode.value && movieDetails.value) {
          playHistoryStore.clearEpisodeProgress(
            String(movieDetails.value.vod_id),
            sourceKey.value,
            currentEpisode.value.number
          );
        }

        if (playHistoryStore.autoPlayNext) {
          const currentIndex = sortedEpisodes.value.findIndex((ep: Episode) => ep.url === currentSource.value);
          let nextEpisode: Episode | undefined;

          if (sortOrder.value === 'asc') {
            nextEpisode = sortedEpisodes.value[currentIndex + 1];
          } else {
            nextEpisode = sortedEpisodes.value[currentIndex - 1];
          }

          if (nextEpisode) {
            console.log('自动播放下一集:', nextEpisode.number);
            setTimeout(() => {
              handleEpisodeSelect(nextEpisode);
            }, 2000); // 2秒后自动播放下一集
          } else {
            art.notice.show = '全部剧集已播放完毕';
          }
        }
      });

      // 监听播放器错误
      art.on('error', (error: any) => {
        console.error('播放器错误:', error);
      });

      // 监听视频加载错误
      art.on('video:error', (error: any) => {
        console.error('视频加载错误:', error);
      });

      playerRef.value = art;
      console.log('播放器创建成功');
    } catch (error) {
      console.error('创建播放器失败:', error);
    }
  };

  // 销毁播放器实例
  const destroyPlayer = () => {
    if (playerRef.value) {
      console.log('销毁播放器实例');
      playerRef.value.destroy();
      playerRef.value = null;
    }
  };

  // 播放下一集
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const playNextEpisode = () => {
    if (nextEpisode.value) {
      handleEpisodeSelect(nextEpisode.value);
    }
  };

  // 播放上一集
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const playPrevEpisode = () => {
    if (prevEpisode.value) {
      handleEpisodeSelect(prevEpisode.value);
    }
  };

  const episodes = computed(() => {
    if (!movieDetails.value?.vod_play_url) return [];
    try {
      let playUrlData = movieDetails.value.vod_play_url;
      // 检查是否包含 $$$，如果包含则取最后一个分段
      if (playUrlData.includes('$$$')) {
        const parts = playUrlData.split('$$$');
        playUrlData = parts[parts.length - 1];
      }

      // 使用 # 分割剧集信息
      return playUrlData
        .split('#')
        .map((part: string) => {
          const [number, url] = part.split('$');
          if (number && url && url.startsWith('http')) {
            return { number: number.trim(), url: url.trim() };
          }
          return null;
        })
        .filter((ep: Episode | null): ep is Episode => ep !== null);
    } catch (error) {
      console.error('Error parsing episodes string:', error);
      return [];
    }
  });

  const sortedEpisodes = computed(() => {
    // 如果是正序，直接返回原始顺序的副本
    if (sortOrder.value === 'asc') {
      return [...episodes.value];
    }
    // 如果是倒序，返回反转后的副本
    return [...episodes.value].reverse();
  });

  const fetchDetails = async () => {
    loading.value = true;
    error.value = undefined;
    movieDetails.value = undefined;
    currentSource.value = undefined;
    fetchError.value = false;
    errorMessage.value = '';

    try {
      if (!sourceKey.value) {
        throw new Error('缺少视频源参数 (source)');
      }

      // 加载开启的站点
      const checkedSites = siteStore.getSelectedSites;

      // 查找对应的站点 API
      const foundSite = checkedSites.value.find((site) => site?.key === sourceKey.value);

      if (!foundSite) {
        throw new Error(`未找到源: ${sourceKey.value}`);
      }

      const apiBase = foundSite.api;

      // 使用 ac=detail 获取详情
      const targetUrl = `${apiBase}/api.php/provide/vod/?ac=detail&ids=${vodId.value}`;
      const response = await fetchWithProxy(targetUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: DetailApiResponse = await response.json();
      if (data.code === 1 && data.list && data.list.length > 0) {
        movieDetails.value = data.list[0];
        // 成功获取详情，清除错误状态
        fetchError.value = false;
        errorMessage.value = '';

        // 搜索其他采集站中的相同影片
        await searchOtherSources();
      } else {
        throw new Error(data.msg || '无法获取视频详情');
      }
    } catch (e) {
      console.error('Failed to fetch movie details:', e);
      const errorMsg = e instanceof Error ? e.message : '加载详情失败';
      error.value = errorMsg;
      fetchError.value = true;
      errorMessage.value = errorMsg;
    } finally {
      loading.value = false;
    }
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder.value === 'asc' ? 'desc' : 'asc';
    sortOrder.value = newOrder;

    // 更新 Pinia store 中的排序状态
    if (movieDetails.value) {
      playHistoryStore.updateSortOrder(String(movieDetails.value.vod_id), sourceKey.value, newOrder);
    }
  };

  const handleEpisodeSelect = (episode: Episode) => {
    currentSource.value = episode.url;
    currentEpisode.value = episode; // 设置当前集数
    searchParams.value = {
      vodId: vodId.value,
      epNum: encodeURIComponent(episode.number),
      source: sourceKey.value || '',
    };

    // 切集时也写入历史，使用 Pinia store
    if (movieDetails.value) {
      playHistoryStore.addPlayHistory({
        vodId: String(movieDetails.value.vod_id),
        title: movieDetails.value.vod_name,
        pic: movieDetails.value.vod_pic,
        episode: String(episode.number),
        source: sourceKey.value || '',
        sortOrder: sortOrder.value,
        skipStart: skipStart.value,
        skipEnd: skipEnd.value,
      });
    }
  };

  const handleSourceChange = async (key: string) => {
    console.log('切换采集站:', key);

    // 保存当前影片信息，用于在新采集站中搜索
    const currentMovieName = movieDetails.value?.vod_name;
    if (!currentMovieName) {
      console.error('无法获取当前影片名称');
      return;
    }

    // 保存当前采集站作为上一个采集站
    if (sourceKey.value && sourceKey.value !== key) {
      previousSourceKey.value = sourceKey.value;
    }

    // 先销毁播放器
    destroyPlayer();

    // 清空状态
    currentEpisode.value = undefined;
    currentSource.value = '';
    movieDetails.value = undefined;
    fetchError.value = false;
    errorMessage.value = '';

    // 切换采集站
    sourceKey.value = key;

    // 强制重新渲染
    playerKey.value += 1;

    try {
      // 在新采集站中搜索相同影片
      const newVodId = await searchMovieInSource(key, currentMovieName);
      if (newVodId) {
        vodId.value = newVodId;
        // 重新获取数据
        await fetchDetails();
        console.log('采集站切换完成');
      } else {
        throw new Error('在新采集站中未找到相同影片');
      }
    } catch (error) {
      console.error('采集站切换失败:', error);
      fetchError.value = true;
      errorMessage.value = '无法从当前采集站获取影片详情';
    }
  };

  // 回到上一个采集站
  const goBackToPreviousSource = async () => {
    if (previousSourceKey.value) {
      console.log('回到上一个采集站:', previousSourceKey.value);
      const prevKey = previousSourceKey.value;
      previousSourceKey.value = ''; // 清空，避免循环
      await handleSourceChange(prevKey);
    }
  };

  // 刷新页面
  const refreshPage = () => {
    window.location.reload();
  };

  // 在指定采集站中搜索影片并返回vodId
  const searchMovieInSource = async (sourceKey: string, movieName: string): Promise<string | null> => {
    try {
      const allSites = siteStore.getSelectedSites.value.filter((site) => site?.key);
      const targetSite = allSites.find((site) => site?.key === sourceKey);

      if (!targetSite?.api) {
        console.error(`未找到采集站: ${sourceKey}`);
        return null;
      }

      const targetUrl = `${targetSite.api}/api.php/provide/vod/?ac=videolist&wd=${encodeURIComponent(movieName)}`;
      console.log(`在采集站 ${targetSite.name} 中搜索影片: ${movieName}`);

      const response = await fetchWithProxy(targetUrl);
      if (!response.ok) {
        console.error(`采集站 ${targetSite.name} 响应失败:`, response.status);
        return null;
      }

      const data = await response.json();

      if (data.code === 1 && data.list && Array.isArray(data.list)) {
        // 寻找完全匹配的影片
        const exactMatch = data.list.find((item: any) => item.vod_name === movieName);

        if (exactMatch) {
          console.log(`在采集站 ${targetSite.name} 找到匹配影片，vodId: ${exactMatch.vod_id}`);
          return String(exactMatch.vod_id);
        } else {
          console.log(`采集站 ${targetSite.name} 没有找到完全匹配的影片`);
          return null;
        }
      } else {
        console.log(`采集站 ${targetSite.name} 返回数据格式错误:`, data);
        return null;
      }
    } catch (error) {
      console.error(`在采集站 ${sourceKey} 中搜索影片时出错:`, error);
      return null;
    }
  };

  // 搜索其他采集站中的相同影片
  const searchOtherSources = async () => {
    if (!movieDetails.value?.vod_name) return;

    console.log('开始搜索其他采集站...');
    searchingOtherSources.value = true;
    const sources: { key: string; name: string }[] = [];

    try {
      const allSites = siteStore.getSelectedSites.value.filter((site) => site?.key);

      // 按照原始顺序处理采集站，不优先处理当前采集站
      for (const site of allSites) {
        if (!site?.key || !site?.api) continue;

        // 对所有采集站使用相同的处理逻辑
        if (site.key === sourceKey.value) {
          // 当前采集站直接添加
          sources.push({ key: site.key, name: site.name || '未知站点' });
        } else {
          // 使用新的搜索函数确保找到相同影片
          const foundVodId = await searchMovieInSource(site.key, movieDetails.value!.vod_name);

          if (foundVodId) {
            console.log(`在采集站 ${site.name} 找到匹配影片，vodId: ${foundVodId}`);
            sources.push({ key: site.key, name: site.name || '未知站点' });
          } else {
            console.log(`采集站 ${site.name} 没有找到匹配影片`);
          }
        }
      }

      // 保持原始顺序，不进行排序

      availableSources.value = sources;
      console.log('搜索完成，可用采集站:', sources);
    } catch (error) {
      console.error('搜索其他采集站时出错:', error);
    } finally {
      searchingOtherSources.value = false;
    }
  };

  // 写入播放记录
  const writePlayHistory = (episode: Episode) => {
    if (!movieDetails.value) return;

    playHistoryStore.addPlayHistory({
      vodId: String(movieDetails.value.vod_id),
      title: movieDetails.value.vod_name,
      pic: movieDetails.value.vod_pic,
      episode: String(episode.number),
      source: sourceKey.value || '',
      sortOrder: sortOrder.value,
      skipStart: skipStart.value,
      skipEnd: skipEnd.value,
    });
  };

  // 从历史记录中恢复播放状态
  const restorePlayState = () => {
    if (!movieDetails.value) return;

    // 从 Pinia store 获取播放历史
    const historyItem = playHistoryStore.getPlayHistory(String(movieDetails.value.vod_id), sourceKey.value);

    if (historyItem) {
      // 恢复排序状态
      sortOrder.value = historyItem.sortOrder || 'asc';
      // 恢复跳过设置
      skipStart.value = historyItem.skipStart || 0;
      skipEnd.value = historyItem.skipEnd || 0;

      // 查找对应的集数
      const episode = episodes.value.find((ep) => ep.number === historyItem.episode);
      if (episode) {
        currentSource.value = episode.url;
        currentEpisode.value = episode;
        return;
      }
    }

    // 如果没有历史记录或恢复失败，播放第一集
    if (episodes.value.length > 0) {
      const firstEpisode = episodes.value[0];
      currentSource.value = firstEpisode.url;
      currentEpisode.value = firstEpisode;
    }
  };

  watch(
    () => movieDetails.value,
    (newVal) => {
      if (newVal) {
        restorePlayState();
      }
    }
  );

  onMounted(async () => {
    if (route.query.vodId) {
      vodId.value = route.query.vodId as string;
    }
    if (route.query.source) {
      sourceKey.value = route.query.source as string;
    }

    await fetchDetails();

    if (movieDetails.value && currentSource.value) {
      const ep = episodes.value.find((ep: Episode) => ep.url === currentSource.value);
      if (ep) writePlayHistory(ep);
    }
  });

  // 监听 currentVideoUrl 变化，自动创建/销毁播放器
  watch(
    () => currentVideoUrl.value,
    (newUrl, oldUrl) => {
      console.log('currentVideoUrl 变化:', { oldUrl, newUrl });
      if (newUrl && newUrl !== oldUrl) {
        // 延时创建播放器，确保 DOM 已更新
        setTimeout(() => {
          createPlayer();
        }, 100);
      } else if (!newUrl && oldUrl) {
        // URL 清空时销毁播放器
        destroyPlayer();
      }
    }
  );

  // 组件卸载时销毁播放器
  onUnmounted(() => {
    destroyPlayer();
  });
</script>

<template>
  <div class="player-page">
    <div v-if="loading" class="min-h-screen bg-black text-white flex items-center justify-center">
      <p>正在加载视频信息...</p>
    </div>
    <div v-else-if="error" class="min-h-screen bg-black text-white flex items-center justify-center">
      <div class="text-center space-y-4">
        <div class="text-red-400 text-xl mb-4">
          <AlertCircle class="w-12 h-12 mx-auto mb-3" />
          获取影片详情失败
        </div>
        <p class="text-red-300 text-lg mb-6">{{ error }}</p>
        <Button
          @click="refreshPage"
          variant="outline"
          size="large"
          class="text-white border-white hover:bg-white hover:text-black"
        >
          刷新页面
        </Button>
        <div class="text-sm text-gray-400 mt-4">或尝试切换到其他采集站</div>
      </div>
    </div>
    <div v-else-if="!movieDetails" class="min-h-screen bg-black text-white flex items-center justify-center">
      <div class="text-center space-y-4">
        <div class="text-yellow-400 text-xl mb-4">
          <AlertCircle class="w-12 h-12 mx-auto mb-3" />
          未能加载视频信息
        </div>
        <Button
          @click="refreshPage"
          variant="outline"
          size="large"
          class="text-white border-white hover:bg-white hover:text-black"
        >
          刷新页面
        </Button>
      </div>
    </div>
    <div v-else class="min-h-screen bg-background">
      <div class="container mx-auto px-4 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <div class="h-[250px] xl:h-[600px] bg-black rounded-lg overflow-hidden">
              <div
                v-if="currentVideoUrl && !fetchError"
                ref="artRef"
                :key="`player-${playerKey}-${sourceKey}`"
                class="w-full h-full"
              ></div>

              <!-- 获取详情错误状态 -->
              <div v-else-if="fetchError" class="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                <div class="text-center space-y-4">
                  <div class="text-red-400 text-lg mb-2">
                    <AlertCircle class="w-8 h-8 mx-auto mb-2" />
                    {{ errorMessage || '当前采集站无法获取影片详情' }}
                  </div>
                  <div class="text-sm text-gray-400 mb-4">采集站: {{ sourceKey || '未知' }}</div>
                  <div class="space-y-2">
                    <Button
                      v-if="previousSourceKey"
                      @click="goBackToPreviousSource"
                      variant="outline"
                      class="text-white border-white hover:bg-white hover:text-black"
                    >
                      <ArrowLeft class="w-4 h-4 mr-2" />
                      回到上一个采集站
                    </Button>
                    <div class="text-xs text-gray-500">或尝试切换到其他采集站</div>
                  </div>
                </div>
              </div>

              <!-- 默认状态 -->
              <div v-else class="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                <div class="text-center">
                  <div class="text-lg mb-2">请选择要播放的剧集</div>
                  <div class="text-sm text-gray-400">
                    采集站: {{ sourceKey || '未选择' }} | 集数: {{ currentEpisode?.number || '未选择' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 影片详情卡片 -->
            <Card class="border-border/50 bg-card/50">
              <div class="flex gap-4">
                <!-- 海报 -->
                <div class="flex-shrink-0">
                  <img
                    :src="movieDetails.vod_pic"
                    :alt="movieDetails.vod_name"
                    class="w-24 h-32 object-cover rounded-lg shadow-md"
                    @error="(e) => ((e.target as HTMLImageElement).src = '/placeholder-poster.jpg')"
                  />
                </div>

                <!-- 基础信息 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                      <h2 class="text-lg font-bold text-foreground mb-2 line-clamp-1">
                        {{ movieDetails.vod_name }}
                      </h2>
                    </div>
                    <!-- 展开按钮 -->
                    <Button
                      variant="ghost"
                      @click="showDetailExpanded = !showDetailExpanded"
                      class="text-muted-foreground hover:text-primary text-sm px-2 py-1 whitespace-nowrap min-w-fit"
                      style="font-size: 13px !important"
                    >
                      <div class="icon-text-row" style="display: flex; align-items: center; gap: 6px">
                        <Info style="width: 14px !important; height: 14px !important; flex-shrink: 0" />
                        <span style="font-size: 13px !important">{{ showDetailExpanded ? '收起' : '详情' }}</span>
                      </div>
                    </Button>
                  </div>

                  <!-- 默认显示的基本信息 -->
                  <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-3">
                    <div
                      class="text-muted-foreground"
                      style="display: flex; align-items: center; gap: 6px; font-size: 13px"
                    >
                      <Calendar style="width: 14px !important; height: 14px !important; flex-shrink: 0" />
                      <span style="font-size: 13px !important">{{ movieDetails.vod_year || '未知' }}</span>
                    </div>
                    <div
                      class="text-muted-foreground"
                      style="display: flex; align-items: center; gap: 6px; font-size: 13px"
                    >
                      <Film style="width: 14px !important; height: 14px !important; flex-shrink: 0" />
                      <span style="font-size: 13px !important">{{ movieDetails.type_name || '未知' }}</span>
                    </div>
                    <div
                      class="text-muted-foreground"
                      style="display: flex; align-items: center; gap: 6px; font-size: 13px"
                    >
                      <MapPin style="width: 14px !important; height: 14px !important; flex-shrink: 0" />
                      <span style="font-size: 13px !important">{{ movieDetails.vod_area || '未知' }}</span>
                    </div>
                    <div
                      class="text-muted-foreground"
                      style="display: flex; align-items: center; gap: 6px; font-size: 13px"
                    >
                      <Star style="width: 14px !important; height: 14px !important; flex-shrink: 0" />
                      <span style="font-size: 13px !important">{{ movieDetails.vod_score || '暂无评分' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 展开的详细信息 -->
              <div v-if="showDetailExpanded" class="mt-4 pt-4 border-t border-border/30">
                <div class="space-y-4">
                  <!-- 简介 -->
                  <div v-if="movieDetails.vod_remarks" class="text-sm">
                    <div class="mb-2 text-foreground font-medium icon-text-row text-sm">
                      <Info class="icon" />
                      <span class="text">简介</span>
                    </div>
                    <p class="text-muted-foreground leading-relaxed pl-6">
                      {{ movieDetails.vod_remarks }}
                    </p>
                  </div>

                  <!-- 其他详细信息 -->
                  <div class="grid grid-cols-1 gap-3 text-sm">
                    <div class="flex items-start gap-2">
                      <Info class="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground" />
                      <div>
                        <span class="text-foreground font-medium">更多信息：</span>
                        <span class="text-muted-foreground">暂无更多详细信息</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div class="flex flex-col gap-8">
            <!-- 剧集列表 -->
            <Card class="border-border/50 bg-card/50">
              <div class="flex items-center justify-between mb-6 pb-4 border-b border-border/30">
                <div class="icon-text-row text-lg">
                  <ListVideo class="icon-lg text-primary" />
                  <h3 class="text font-semibold">剧集列表</h3>
                  <Tag color="blue" class="text-xs ml-2"> 共 {{ sortedEpisodes.length }} 集 </Tag>
                </div>
                <div class="flex items-center gap-3">
                  <!-- 自动播放下一集开关 -->
                  <Checkbox
                    :checked="playHistoryStore.autoPlayNext"
                    @change="(e) => playHistoryStore.setAutoPlayNext(e.target.checked)"
                    class="text-sm whitespace-nowrap"
                  >
                    自动播放下一集
                  </Checkbox>
                  <!-- 排序按钮 -->
                  <Button variant="ghost" @click="toggleSortOrder" class="sort-button">
                    <div class="icon-text-row" style="display: flex; align-items: center; gap: 6px">
                      <ArrowUpDown style="width: 14px !important; height: 14px !important; flex-shrink: 0" />
                      <span style="font-size: 13px !important">{{ sortOrder === 'asc' ? '正序' : '倒序' }}</span>
                    </div>
                  </Button>
                </div>
              </div>

              <div
                class="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              >
                <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-5 xl:grid-cols-6 gap-2 p-1">
                  <CheckableTag
                    v-for="ep in sortedEpisodes"
                    :key="`${ep.number}_${ep.url}`"
                    :checked="currentSource === ep.url"
                    class="relative episode-tag"
                    @change="() => handleEpisodeSelect(ep)"
                  >
                    {{ ep.number }}
                    <!-- 当前播放指示器 -->
                    <div
                      v-if="currentSource === ep.url"
                      class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full flex items-center justify-center z-20 episode-indicator"
                    >
                      <div class="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                  </CheckableTag>
                </div>
              </div>
            </Card>

            <!-- 采集站切换 -->
            <Card class="border-border/50 bg-card/50 mt-8">
              <div class="mb-6 pb-4 border-b border-border/30 icon-text-row text-lg">
                <Globe class="icon-lg text-primary" />
                <h3 class="text font-semibold">采集站切换</h3>
                <div v-if="searchingOtherSources" class="ml-auto text-sm text-muted-foreground">搜索中...</div>
              </div>
              <div class="space-y-4">
                <!-- 搜索中的提示 -->
                <div v-if="searchingOtherSources && availableSources.length === 0" class="text-center py-4">
                  <div class="text-muted-foreground text-sm">正在搜索可用的采集站...</div>
                </div>

                <!-- 没有找到可用采集站的提示 -->
                <div v-else-if="!searchingOtherSources && availableSources.length === 0" class="text-center py-4">
                  <div class="text-muted-foreground text-sm">未找到包含此影片的采集站</div>
                </div>

                <!-- 采集站列表 -->
                <div class="source-buttons-container">
                  <Button
                    v-for="source in availableSources"
                    :key="source.key"
                    :type="sourceKey === source.key ? 'primary' : 'default'"
                    class="source-button"
                    @click="handleSourceChange(source.key)"
                  >
                    <div class="source-button-content">
                      <Globe class="source-button-icon" />
                      <span class="source-button-text">{{ source.name }}</span>
                    </div>
                    <ChevronRight v-if="sourceKey === source.key" class="source-button-arrow" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* 自定义滚动条样式 */
  .scrollbar-thin {
    scrollbar-width: thin;
  }

  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  /* 文本截断样式 */
  .line-clamp-2 {
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    line-clamp: 3;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* 播放指示器动画 */
  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  /* 剧集标签样式 */
  .episode-checkable-tag {
    margin: 0;
  }

  /* 图标和文字对齐样式 - Flex布局优化方案 */
  .icon-text-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .icon-text-row .icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  .icon-text-row .icon-lg {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }

  .icon-text-row .text {
    line-height: 1.3;
  }

  .icon-text-row h3 {
    margin: 0;
    line-height: 1.3;
  }

  /* 确保 Tag 组件也能正确对齐 */
  .icon-text-row .ant-tag {
    display: inline-flex;
    align-items: center;
  }

  /* 按钮内的图标对齐特殊处理 - 使用最强的选择器 */
  .player-page button.ant-btn .icon-text-row {
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
    width: 100% !important;
    justify-content: flex-start !important;
  }

  .player-page button.ant-btn .icon-text-row svg {
    width: 14px !important;
    height: 14px !important;
    flex-shrink: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .player-page button.ant-btn .icon-text-row .icon {
    width: 14px !important;
    height: 14px !important;
    flex-shrink: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .player-page button.ant-btn .icon-text-row .text {
    flex: 1 !important;
    text-align: left !important;
    line-height: 1.2 !important;
    margin: 0 !important;
    padding: 0 !important;
    font-size: 13px !important;
  }

  .player-page button.ant-btn .icon-text-row span {
    font-size: 13px !important;
    line-height: 1.2 !important;
  }

  /* 采集站按钮的特殊样式 */
  .player-page button.ant-btn.w-full {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 12px 16px !important;
    margin-bottom: 4px !important;
    font-size: 13px !important;
  }

  .player-page button.ant-btn.w-full .icon-text-row {
    flex: 1 !important;
    margin-right: 8px !important;
  }

  .player-page button.ant-btn.w-full svg {
    width: 14px !important;
    height: 14px !important;
  }

  /* 确保按钮内容不被覆盖 */
  button.ant-btn .ant-btn-content {
    display: flex !important;
    align-items: center !important;
    width: 100% !important;
  }

  /* 采集站按钮容器间隙 */
  .space-y-4 > button.ant-btn + button.ant-btn {
    margin-top: 16px !important;
  }

  /* 强制样式应用 - 调试用 */
  .player-page [class*='ant-btn'] svg {
    width: 14px !important;
    height: 14px !important;
  }

  .player-page [class*='ant-btn'] span {
    font-size: 13px !important;
  }

  /* 特别针对采集站按钮 */
  .player-page .ant-btn.w-full * {
    font-size: 13px !important;
  }

  .player-page .ant-btn.w-full svg {
    width: 14px !important;
    height: 14px !important;
  }

  /* 剧集标签样式 - 使用Ant Design Vue主题变量 */
  .episode-tag {
    height: 36px !important;
    min-width: 52px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 8px !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    cursor: pointer !important;
    position: relative !important;
    margin: 2px !important;
    user-select: none !important;
  }

  /* 未选中状态 - 使用Ant Design Vue主题变量 */
  .episode-tag:not(.ant-tag-checkable-checked) {
    background: #f5f5f5 !important;
    border: 1px solid #d9d9d9 !important;
    color: #595959 !important;
  }

  .episode-tag:not(.ant-tag-checkable-checked):hover {
    background: #e6f4ff !important;
    border-color: #40a9ff !important;
    color: #1677ff !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 4px 12px rgba(22, 119, 255, 0.15) !important;
  }

  /* 选中状态 - 使用Ant Design Vue主题变量 */
  .episode-tag.ant-tag-checkable-checked {
    background: #1677ff !important;
    border: 1px solid #1677ff !important;
    color: #ffffff !important;
    box-shadow: 0 2px 8px rgba(22, 119, 255, 0.3) !important;
    z-index: 1 !important;
  }

  .episode-tag.ant-tag-checkable-checked:hover {
    background: #4096ff !important;
    border-color: #4096ff !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 16px rgba(22, 119, 255, 0.4) !important;
  }

  /* 暗色主题适配 */
  .dark .episode-tag:not(.ant-tag-checkable-checked) {
    background: #1f1f1f !important;
    border: 1px solid #434343 !important;
    color: #a6a6a6 !important;
  }

  .dark .episode-tag:not(.ant-tag-checkable-checked):hover {
    background: #111b26 !important;
    border-color: #177ddc !important;
    color: #91caff !important;
  }

  /* 采集站按钮容器 */
  .source-buttons-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* 采集站按钮样式 - 使用Ant Design Vue主题变量 */
  .source-button {
    width: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    min-height: 48px !important;
    border-radius: 8px !important;
    border-width: 1px !important;
    position: relative !important;
    overflow: hidden !important;
    transition: all 0.2s ease !important;
    font-size: 14px !important;
    padding: 12px 16px !important;
  }

  /* 按钮内容布局 */
  .source-button-content {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    justify-content: flex-start;
  }

  .source-button-icon {
    width: 16px !important;
    height: 16px !important;
    flex-shrink: 0;
    margin-right: 4px;
  }

  .source-button-text {
    font-size: 14px !important;
    font-weight: 500;
    line-height: 1.4;
  }

  .source-button-arrow {
    width: 16px !important;
    height: 16px !important;
    flex-shrink: 0;
    opacity: 0.7;
    margin-left: auto;
  }

  /* 滚动条样式 - 使用Ant Design Vue主题变量 */
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px !important;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background: var(--ant-color-fill-quaternary) !important;
    border-radius: 3px !important;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: var(--ant-color-border) !important;
    border-radius: 3px !important;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: var(--ant-color-text-secondary) !important;
  }

  /* 排序按钮样式 - 使用Ant Design Vue默认样式 */
  .sort-button {
    font-size: 13px !important;
    white-space: nowrap !important;
    min-width: fit-content !important;
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    /* 播放页面布局调整 */
    .player-page .flex.gap-8 {
      flex-direction: column !important;
      gap: 16px !important;
    }

    /* 剧集标签移动端适配 */
    .episode-tag {
      height: 28px !important;
      min-width: 40px !important;
      font-size: 12px !important;
    }

    /* 采集站按钮移动端适配 */
    .source-button {
      min-height: 40px !important;
      font-size: 12px !important;
    }

    .source-button-text {
      font-size: 12px !important;
    }

    .source-buttons-container {
      gap: 8px;
    }

    /* 网格布局调整 */
    .grid-cols-4 {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    }

    .grid-cols-5 {
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    }

    .grid-cols-6 {
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    }

    /* 卡片间距调整 */
    .gap-8 {
      gap: 16px !important;
    }

    /* 内边距调整 */
    .px-4 {
      padding-left: 12px !important;
      padding-right: 12px !important;
    }

    .py-8 {
      padding-top: 16px !important;
      padding-bottom: 16px !important;
    }
  }

  /* 小屏幕适配 */
  @media (max-width: 480px) {
    /* 剧集标签小屏幕适配 */
    .episode-tag {
      height: 24px !important;
      min-width: 36px !important;
      font-size: 11px !important;
    }

    /* 采集站按钮小屏幕适配 */
    .source-button {
      min-height: 36px !important;
      font-size: 11px !important;
    }

    .source-button-text {
      font-size: 11px !important;
    }

    .source-button-icon,
    .source-button-arrow {
      width: 12px !important;
      height: 12px !important;
    }

    .source-buttons-container {
      gap: 6px;
    }

    /* 网格布局进一步调整 */
    .grid-cols-4,
    .grid-cols-5,
    .grid-cols-6 {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    }

    /* 间距进一步缩小 */
    .gap-2 {
      gap: 4px !important;
    }

    .gap-4 {
      gap: 8px !important;
    }

    /* 内边距进一步调整 */
    .px-4 {
      padding-left: 8px !important;
      padding-right: 8px !important;
    }

    .py-8 {
      padding-top: 12px !important;
      padding-bottom: 12px !important;
    }

    /* 按钮图标和文字大小调整 */
    .player-page button.ant-btn .icon-text-row svg {
      width: 12px !important;
      height: 12px !important;
    }

    .player-page button.ant-btn .icon-text-row span {
      font-size: 11px !important;
    }
  }
</style>

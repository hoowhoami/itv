import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface PlayHistoryItem {
  vodId: string;
  title: string;
  pic: string;
  episode: string;
  timestamp: number;
  source: string;
  sortOrder: 'asc' | 'desc';
  skipStart: number;
  skipEnd: number;
  currentTime?: number; // 播放进度
  duration?: number; // 视频总时长
}

export interface EpisodeProgress {
  vodId: string;
  source: string;
  episode: string;
  currentTime: number;
  duration: number;
  timestamp: number;
}

export const usePlayHistoryStore = defineStore(
  'playHistory',
  () => {
    // 播放历史记录
    const playHistory = ref<PlayHistoryItem[]>([]);

    // 播放进度记录
    const episodeProgress = ref<EpisodeProgress[]>([]);

    // 自动播放下一集设置
    const autoPlayNext = ref(true);

    // 默认排序方式
    const defaultSortOrder = ref<'asc' | 'desc'>('asc');

    // 添加或更新播放历史
    const addPlayHistory = (item: Omit<PlayHistoryItem, 'timestamp'>) => {
      const newItem: PlayHistoryItem = {
        ...item,
        timestamp: Date.now(),
      };

      // 移除相同的记录（相同 vodId 和 source）
      playHistory.value = playHistory.value.filter((i) => !(i.vodId === newItem.vodId && i.source === newItem.source));

      // 添加到开头
      playHistory.value.unshift(newItem);

      // 限制历史记录数量
      if (playHistory.value.length > 50) {
        playHistory.value = playHistory.value.slice(0, 50);
      }
    };

    // 获取特定视频的播放历史
    const getPlayHistory = (vodId: string, source: string): PlayHistoryItem | undefined => {
      return playHistory.value.find((item) => item.vodId === vodId && item.source === source);
    };

    // 更新播放历史中的排序方式
    const updateSortOrder = (vodId: string, source: string, sortOrder: 'asc' | 'desc') => {
      const item = playHistory.value.find((i) => i.vodId === vodId && i.source === source);
      if (item) {
        item.sortOrder = sortOrder;
      }
    };

    // 更新跳过设置
    const updateSkipSettings = (vodId: string, source: string, skipStart: number, skipEnd: number) => {
      const item = playHistory.value.find((i) => i.vodId === vodId && i.source === source);
      if (item) {
        item.skipStart = skipStart;
        item.skipEnd = skipEnd;
      }
    };

    // 添加或更新播放进度
    const updateEpisodeProgress = (progress: Omit<EpisodeProgress, 'timestamp'>) => {
      const newProgress: EpisodeProgress = {
        ...progress,
        timestamp: Date.now(),
      };

      // 移除相同的记录
      episodeProgress.value = episodeProgress.value.filter(
        (p) => !(p.vodId === newProgress.vodId && p.source === newProgress.source && p.episode === newProgress.episode)
      );

      // 只有播放进度大于 30 秒且小于总时长的 90% 时才保存
      if (newProgress.currentTime > 30 && newProgress.currentTime < newProgress.duration * 0.9) {
        episodeProgress.value.unshift(newProgress);

        // 限制进度记录数量
        if (episodeProgress.value.length > 200) {
          episodeProgress.value = episodeProgress.value.slice(0, 200);
        }
      }
    };

    // 获取特定集数的播放进度
    const getEpisodeProgress = (vodId: string, source: string, episode: string): EpisodeProgress | undefined => {
      return episodeProgress.value.find((p) => p.vodId === vodId && p.source === source && p.episode === episode);
    };

    // 清除特定集数的播放进度（播放完成时调用）
    const clearEpisodeProgress = (vodId: string, source: string, episode: string) => {
      episodeProgress.value = episodeProgress.value.filter(
        (p) => !(p.vodId === vodId && p.source === source && p.episode === episode)
      );
    };

    // 删除播放历史
    const removePlayHistory = (vodId: string, source: string) => {
      playHistory.value = playHistory.value.filter((item) => !(item.vodId === vodId && item.source === source));

      // 同时删除相关的播放进度
      episodeProgress.value = episodeProgress.value.filter((p) => !(p.vodId === vodId && p.source === source));
    };

    // 清空所有历史记录
    const clearAllHistory = () => {
      playHistory.value = [];
      episodeProgress.value = [];
    };

    // 获取最近播放的记录（用于首页显示）
    const getRecentHistory = (limit: number = 10) => {
      return playHistory.value.slice(0, limit).sort((a, b) => b.timestamp - a.timestamp);
    };

    // 设置自动播放下一集
    const setAutoPlayNext = (enabled: boolean) => {
      autoPlayNext.value = enabled;
    };

    // 设置默认排序方式
    const setDefaultSortOrder = (order: 'asc' | 'desc') => {
      defaultSortOrder.value = order;
    };

    return {
      // 状态
      playHistory,
      episodeProgress,
      autoPlayNext,
      defaultSortOrder,

      // 方法
      addPlayHistory,
      getPlayHistory,
      updateSortOrder,
      updateSkipSettings,
      updateEpisodeProgress,
      getEpisodeProgress,
      clearEpisodeProgress,
      removePlayHistory,
      clearAllHistory,
      getRecentHistory,
      setAutoPlayNext,
      setDefaultSortOrder,
    };
  },
  {
    persist: true, // 启用持久化存储
  }
);

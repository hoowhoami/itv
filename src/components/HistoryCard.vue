<template>
  <!-- 历史记录卡片容器 -->
  <div
    class="history-card group w-full min-w-[172px] h-[380px] rounded-md overflow-hidden relative flex flex-col justify-between cursor-pointer"
  >
    <!-- 海报+内容区 -->
    <div class="relative flex-1 bg-cover bg-center history-poster" :style="{ backgroundImage: `url(${props.cover})` }">
      <!-- 播放进度条 -->
      <div v-if="progressPercent > 0" class="absolute top-0 left-0 right-0 h-1 bg-black/30">
        <div class="h-full bg-primary transition-all duration-300" :style="{ width: `${progressPercent}%` }"></div>
      </div>

      <!-- 评分：右上角 -->
      <div v-if="props.rate || props.movieScore" class="absolute top-2 right-2 flex items-center space-x-1 z-10">
        <div class="history-badge rate-badge">
          <div class="flex items-center px-2 py-0.5">
            <Star class="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
            <span class="text-xs">{{ props.rate || props.movieScore }}</span>
          </div>
        </div>
      </div>

      <!-- 播放时间信息：左下角 -->
      <div v-if="props.episode || progressText" class="absolute bottom-2 left-2">
        <div class="history-badge info-badge">
          <div class="text-xs flex items-center px-2 py-0.5">
            <Play class="w-3 h-3 mr-1" />
            <span>{{ props.episode || '正片' }}</span>
            <span v-if="progressText" class="ml-1 opacity-80">{{ progressText }}</span>
          </div>
        </div>
      </div>

      <!-- 来源：右下角 -->
      <div v-if="sourceName" class="absolute bottom-2 right-2">
        <div class="history-badge source-badge">
          <div class="text-xs flex items-center px-2 py-0.5">
            {{ sourceName }}
          </div>
        </div>
      </div>

      <!-- 中央按钮区域：继续播放 + 删除 -->
      <div
        class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20"
      >
        <div class="flex items-center justify-center">
          <!-- 继续观看按钮 -->
          <button
            @click.stop="handleContinueWatch"
            class="continue-btn h-10 flex items-center gap-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            style="margin-right: 16px"
          >
            <Play class="w-4 h-4" />
            继续观看
          </button>

          <!-- 删除按钮 - 正方形 -->
          <button
            @click.stop="handleDelete"
            class="delete-btn w-10 h-10 flex items-center justify-center bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
            title="删除历史记录"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- 底部标题区 -->
    <div class="history-title-area h-12 flex items-center justify-center overflow-hidden">
      <div
        ref="titleRef"
        class="text-sm font-medium tracking-wide whitespace-nowrap px-2"
        :class="{ 'animate-scroll': isScrolling }"
      >
        {{ props.title }}
      </div>
    </div>

    <!-- 影片详情信息区 -->
    <div
      v-if="props.movieYear || props.movieType || props.movieRegion"
      class="history-info-area h-12 flex items-center justify-between overflow-hidden px-2"
    >
      <div v-if="props.movieType" class="text-xs text-muted-foreground">
        {{ props.movieType }}
      </div>
      <div v-if="props.movieYear" class="text-xs text-muted-foreground">
        {{ props.movieYear }}
      </div>
      <div v-if="props.movieRegion" class="text-xs text-muted-foreground">
        {{ props.movieRegion }}
      </div>
    </div>

    <!-- 观看进度信息区 -->
    <div class="history-progress-area h-12 flex items-center justify-between overflow-hidden px-2">
      <div class="text-xs text-muted-foreground">
        {{ formatWatchTime(props.timestamp) }}
      </div>
      <div v-if="props.latestEpisode" class="text-xs text-green-400">更新至 {{ props.latestEpisode }}</div>
      <div v-else-if="props.type" class="text-xs text-muted-foreground">
        {{ props.type }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useElementSize } from '@vueuse/core';
  import { Star, Trash2, Play } from 'lucide-vue-next';
  import { computed, ref } from 'vue';
  import { useSiteStore } from '@/store';

  // Props
  const props = defineProps({
    // 基本信息
    vodId: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, default: '' },
    episode: { type: String, default: '' },
    source: { type: String, default: '' },
    timestamp: { type: Number, required: true },

    // 播放进度
    currentTime: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },

    // 额外信息
    rate: { type: String, default: '' },
    type: { type: String, default: '' },
    year: { type: String, default: '' },
    region: { type: String, default: '' },
    latestEpisode: { type: String, default: '' },
    movieYear: { type: String, default: '' },
    movieRegion: { type: String, default: '' },
    movieScore: { type: String, default: '' },
    movieType: { type: String, default: '' },
  });

  // Emits
  const emit = defineEmits<{
    continueWatch: [item: { vodId: string; source: string; episode: string }];
    delete: [vodId: string, source: string];
  }>();

  // 获取站点信息
  const siteStore = useSiteStore();

  // 根据 source key 获取站点名称
  const sourceName = computed(() => {
    if (!props.source) return '';
    const site = siteStore.getSelectedSites.value.find((site) => site?.key === props.source);
    return site?.name || props.source;
  });

  // 状态管理
  const titleRef = ref<HTMLElement>();
  const { width: contentWidth } = useElementSize(titleRef);
  const containerWidth = 160;

  // 计算属性
  const isScrolling = computed(() => contentWidth.value > containerWidth);

  // 播放进度百分比
  const progressPercent = computed(() => {
    if (!props.duration || !props.currentTime) return 0;
    return Math.min((props.currentTime / props.duration) * 100, 100);
  });

  // 播放进度文本
  const progressText = computed(() => {
    if (!props.duration || !props.currentTime) return '';
    return `${formatTime(props.currentTime)}/${formatTime(props.duration)}`;
  });

  // 工具函数
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatWatchTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
  };

  // 事件处理
  const handleContinueWatch = () => {
    emit('continueWatch', {
      vodId: props.vodId,
      source: props.source,
      episode: props.episode,
    });
  };

  const handleDelete = () => {
    emit('delete', props.vodId, props.source);
  };
</script>

<style scoped>
  /* 历史记录卡片样式 */
  .history-card {
    background: color-mix(in oklch, rgb(var(--color-card)), white 8%);
    border: 1px solid color-mix(in oklch, rgb(var(--color-border)), white 20%);
    box-shadow:
      0 4px 12px 0 rgb(0 0 0 / 0.2),
      0 2px 6px -1px rgb(0 0 0 / 0.15);
    transition: all 0.2s ease;
  }

  .history-card:hover {
    box-shadow:
      0 10px 15px -3px rgb(0 0 0 / 0.1),
      0 4px 6px -4px rgb(0 0 0 / 0.1);
    border-color: rgb(var(--color-primary) / 0.5);
    transform: translateY(-2px);
  }

  /* 海报区域 */
  .history-poster {
    background-color: rgb(var(--color-muted));
  }

  /* 徽章样式 */
  .history-badge {
    background: rgb(0 0 0 / 0.7);
    color: white;
    border-radius: 0.375rem;
    backdrop-filter: blur(4px);
    border: 1px solid rgb(255 255 255 / 0.2);
  }

  .delete-badge {
    background: rgb(239 68 68 / 0.8);
    padding: 0.25rem;
    cursor: pointer;
  }

  /* 继续观看按钮 */
  .continue-btn {
    backdrop-filter: blur(12px);
    box-shadow:
      0 10px 15px -3px rgb(0 0 0 / 0.1),
      0 4px 6px -4px rgb(0 0 0 / 0.1);
  }

  /* 标题区域 */
  .history-title-area {
    background: rgb(var(--color-background));
    color: rgb(var(--color-foreground));
    border-top: 1px solid rgb(var(--color-border));
  }

  /* 信息区域 */
  .history-info-area {
    background: rgb(var(--color-muted));
    color: rgb(var(--color-muted-foreground));
    border-top: 1px solid rgb(var(--color-border));
  }

  /* 滚动动画 */
  @keyframes scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(calc(-100% + 100px));
    }
  }

  .animate-scroll {
    animation: scroll 8s linear infinite;
  }

  .animate-scroll:hover {
    animation-play-state: paused;
  }
</style>

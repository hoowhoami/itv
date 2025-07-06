<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { usePlayHistoryStore } from '@/store';
  import { Button, Card, Empty } from 'ant-design-vue';
  import { Play, Clock, Trash2, Calendar } from 'lucide-vue-next';

  defineOptions({
    name: 'HistoryPage',
  });

  const router = useRouter();
  const playHistoryStore = usePlayHistoryStore();

  // 获取播放历史
  const playHistory = computed(() => {
    return playHistoryStore.getAllPlayHistory();
  });

  // 继续播放
  const continuePlay = (item: any) => {
    router.push({
      path: '/play',
      query: {
        vodId: item.vodId,
        source: item.sourceKey,
      },
    });
  };

  // 删除单个历史记录
  const deleteHistory = (vodId: string, sourceKey: string) => {
    playHistoryStore.removePlayHistory(vodId, sourceKey);
  };

  // 清空所有历史记录
  const clearAllHistory = () => {
    playHistoryStore.clearAllHistory();
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  // 格式化播放进度
  const formatProgress = (currentTime: number, duration: number) => {
    if (!duration) return '0%';
    const progress = Math.round((currentTime / duration) * 100);
    return `${progress}%`;
  };

  // 格式化时长
  const formatDuration = (seconds: number) => {
    if (!seconds) return '00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-8">
      <!-- 页面标题 -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Clock class="w-6 h-6 text-primary" />
            <h1 class="text-3xl font-bold text-foreground">观看历史</h1>
          </div>
          <Button
            v-if="playHistory.length > 0"
            danger
            @click="clearAllHistory"
            class="history-clear-button"
          >
            <div class="flex items-center gap-2">
              <Trash2 class="w-4 h-4" />
              <span>清空历史</span>
            </div>
          </Button>
        </div>
        <p class="text-muted-foreground mt-2">
          {{ playHistory.length > 0 ? `共 ${playHistory.length} 条观看记录` : '暂无观看记录' }}
        </p>
      </div>

      <!-- 历史记录列表 -->
      <div v-if="playHistory.length > 0" class="space-y-4">
        <Card
          v-for="item in playHistory"
          :key="`${item.vodId}-${item.sourceKey}`"
          class="history-card"
        >
          <div class="flex items-center gap-4">
            <!-- 影片封面 -->
            <div class="flex-shrink-0">
              <div class="w-20 h-28 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  v-if="item.poster"
                  :src="item.poster"
                  :alt="item.title"
                  class="w-full h-full object-cover"
                  @error="$event.target.style.display = 'none'"
                />
                <Play v-else class="w-8 h-8 text-muted-foreground" />
              </div>
            </div>

            <!-- 影片信息 -->
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold text-foreground mb-1 truncate">
                {{ item.title }}
              </h3>
              <div class="space-y-1 text-sm text-muted-foreground">
                <div class="flex items-center gap-4">
                  <span>{{ item.episodeName || '正片' }}</span>
                  <span>来源: {{ item.sourceName }}</span>
                </div>
                <div class="flex items-center gap-4">
                  <span>进度: {{ formatProgress(item.currentTime, item.duration) }}</span>
                  <span>时长: {{ formatDuration(item.duration) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Calendar class="w-3 h-3" />
                  <span>{{ formatTime(item.lastPlayTime) }}</span>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex-shrink-0 flex items-center gap-2">
              <Button
                type="primary"
                @click="continuePlay(item)"
                class="history-play-button"
              >
                <div class="flex items-center gap-2">
                  <Play class="w-4 h-4" />
                  <span>继续播放</span>
                </div>
              </Button>
              <Button
                danger
                ghost
                @click="deleteHistory(item.vodId, item.sourceKey)"
                class="history-delete-button"
              >
                <Trash2 class="w-4 h-4" />
              </Button>
            </div>
          </div>

          <!-- 进度条 -->
          <div class="mt-4">
            <div class="w-full bg-muted rounded-full h-1">
              <div
                class="bg-primary h-1 rounded-full transition-all duration-300"
                :style="{ width: formatProgress(item.currentTime, item.duration) }"
              ></div>
            </div>
          </div>
        </Card>
      </div>

      <!-- 空状态 -->
      <div v-else class="flex flex-col items-center justify-center py-16">
        <Empty
          description="暂无观看历史"
          class="history-empty"
        >
          <template #image>
            <Clock class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          </template>
          <Button type="primary" @click="router.push('/')">
            <div class="flex items-center gap-2">
              <Play class="w-4 h-4" />
              <span>去首页看看</span>
            </div>
          </Button>
        </Empty>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* 历史记录卡片样式 - 使用Ant Design Vue主题变量 */
  .history-card {
    background: var(--ant-color-bg-container) !important;
    border: 1px solid var(--ant-color-border) !important;
    border-radius: 6px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
    transition: all 0.2s ease !important;
  }

  .history-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    transform: translateY(-1px) !important;
  }

  /* 按钮样式 */
  .history-play-button {
    background: var(--ant-color-primary) !important;
    border-color: var(--ant-color-primary) !important;
    color: var(--ant-color-white) !important;
    border-radius: 6px !important;
  }

  .history-play-button:hover {
    background: var(--ant-color-primary-hover) !important;
  }

  .history-delete-button {
    border-color: var(--ant-color-error) !important;
    color: var(--ant-color-error) !important;
    border-radius: 6px !important;
  }

  .history-delete-button:hover {
    background: var(--ant-color-error) !important;
    color: var(--ant-color-white) !important;
  }

  .history-clear-button {
    background: var(--ant-color-error) !important;
    border-color: var(--ant-color-error) !important;
    color: var(--ant-color-white) !important;
    border-radius: 6px !important;
  }

  .history-clear-button:hover {
    background: var(--ant-color-error-hover) !important;
  }

  /* 空状态样式 */
  .history-empty {
    color: var(--ant-color-text-secondary) !important;
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    .history-card .flex {
      flex-direction: column !important;
      gap: 12px !important;
    }

    .history-card .w-20 {
      width: 100% !important;
      height: 120px !important;
    }

    .history-card .flex-shrink-0:last-child {
      align-self: stretch !important;
    }

    .history-card .flex-shrink-0:last-child .flex {
      justify-content: space-between !important;
      width: 100% !important;
    }

    .container {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
  }

  @media (max-width: 480px) {
    .history-card {
      margin: 8px 0 !important;
    }

    .history-card .text-lg {
      font-size: 16px !important;
    }

    .history-card .text-sm {
      font-size: 12px !important;
    }

    .history-play-button,
    .history-delete-button {
      font-size: 12px !important;
      padding: 4px 8px !important;
    }

    .container {
      padding-left: 12px !important;
      padding-right: 12px !important;
    }

    .py-8 {
      padding-top: 16px !important;
      padding-bottom: 16px !important;
    }
  }
</style>

<template>
  <!-- 卡片容器：控制尺寸、阴影、圆角 -->
  <div
    class="media-card w-48 h-[350px] rounded-md overflow-hidden relative flex flex-col justify-between cursor-pointer"
  >
    <!-- 海报+内容区 -->
    <div class="relative flex-1 bg-cover bg-center media-poster" :style="{ backgroundImage: `url(${props.cover})` }">
      <!-- 评分：右上角 -->
      <div v-if="props.rate" class="absolute top-2 right-2 flex items-center space-x-1 z-10">
        <div class="media-badge rate-badge">
          <div class="flex items-center px-2 py-0.5">
            <Star class="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
            <span class="text-xs">{{ props.rate }}</span>
          </div>
        </div>
      </div>
      <!-- 新片角标：左上角 -->
      <div v-if="props.tag" class="media-tag">
        {{ props.tag }}
      </div>
      <!-- 备注：左下角 -->
      <div v-if="props.remark" class="absolute bottom-2 left-2">
        <div class="media-badge info-badge">
          <div class="text-xs flex items-center px-2 py-0.5">
            {{ props.remark }}
          </div>
        </div>
      </div>
      <!-- 来源：右下角 -->
      <div v-if="props.source" class="absolute bottom-2 right-2">
        <div class="media-badge source-badge">
          <div class="text-xs flex items-center px-2 py-0.5">
            {{ props.source }}
          </div>
        </div>
      </div>
    </div>
    <!-- 底部标题区：使用 VueUse 实现智能滚动 -->
    <div class="media-title-area h-12 flex items-center justify-center overflow-hidden">
      <div
        ref="titleRef"
        class="text-sm font-medium tracking-wide whitespace-nowrap px-2"
        :class="{ 'animate-scroll': isScrolling }"
      >
        {{ props.title }}
      </div>
    </div>
    <div
      v-if="props.year || props.type || props.region"
      class="media-info-area h-12 flex items-center justify-between overflow-hidden px-2"
    >
      <div v-if="props.type" class="text-xs">
        {{ props.type }}
      </div>
      <div v-if="props.year" class="text-xs">
        {{ props.year }}
      </div>
      <div v-if="props.region" class="text-xs">
        {{ props.region }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useElementSize, useIntersectionObserver } from '@vueuse/core';
  import { Star } from 'lucide-vue-next';
  import { computed, ref } from 'vue';

  // Props
  const props = defineProps({
    // 海报图
    cover: {
      type: String,
      default: '',
    },
    // 评分（如 8.1）
    rate: {
      type: String,
      default: '',
    },
    // 标签
    tag: {
      type: String,
      default: '',
    },
    // 标题
    title: {
      type: String,
      default: '',
    },
    // 年份
    year: {
      type: String,
      default: '',
    },
    // 类型
    type: {
      type: String,
      default: '',
    },
    // 地区
    region: {
      type: String,
      default: '',
    },
    // 备注
    remark: {
      type: String,
      default: '',
    },
    // 来源
    source: {
      type: String,
      default: '',
    },
  });

  // 状态管理
  const titleRef = ref<HTMLElement>();

  const { width: contentWidth } = useElementSize(titleRef);
  // 标题容器宽度（根据 w-48 计算）
  const containerWidth = 160;

  // 计算属性：判断文本是否溢出
  const isOverflow = computed(() => {
    return contentWidth.value > containerWidth;
  });

  // 计算属性：控制滚动动画
  const isScrolling = computed(() => {
    return isOverflow.value;
  });

  // 使用 IntersectionObserver 检测元素可见性（可选优化）
  const { stop } = useIntersectionObserver(titleRef, ([{ isIntersecting }]) => {
    // 当元素不可见时暂停滚动（优化性能）
    if (!isIntersecting) {
      // 可添加暂停滚动的逻辑
      stop();
    }
  });
</script>

<style scoped>
  /* 媒体卡片样式 - 使用Ant Design Vue主题变量，深色模式适配 */
  .media-card {
    background: var(--ant-color-bg-container) !important;
    border: 1px solid var(--ant-color-border) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
    transition: all 0.2s ease !important;
  }

  .media-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
    transform: translateY(-2px) !important;
    border-color: var(--ant-color-primary-border) !important;
  }

  /* 海报区域 */
  .media-poster {
    background-color: var(--ant-color-fill-quaternary) !important;
  }

  /* 徽章样式 */
  .media-badge {
    background: rgba(0, 0, 0, 0.7) !important;
    color: white !important;
    border-radius: 6px !important;
    backdrop-filter: blur(4px) !important;
  }

  .rate-badge {
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
  }

  .info-badge {
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
  }

  .source-badge {
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
  }

  /* 新片标签 */
  .media-tag {
    position: absolute !important;
    top: 8px !important;
    left: 8px !important;
    background: #ff4d4f !important;
    color: #ffffff !important;
    font-size: 12px !important;
    padding: 2px 8px !important;
    border-radius: 6px !important;
    font-weight: 500 !important;
    z-index: 10 !important;
  }

  /* 标题区域 */
  .media-title-area {
    background: var(--ant-color-bg-container) !important;
    color: var(--ant-color-text) !important;
    border-top: 1px solid var(--ant-color-border) !important;
  }

  /* 信息区域 */
  .media-info-area {
    background: var(--ant-color-fill-quaternary) !important;
    color: var(--ant-color-text-secondary) !important;
    border-top: 1px solid var(--ant-color-border) !important;
  }

  /* 滚动动画 */
  @keyframes scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(calc(-100% + 100px));
    } /* 滚动距离 = 文本宽度 - 容器宽度 */
  }

  .animate-scroll {
    animation: scroll 8s linear infinite;
  }

  /* 鼠标悬停时暂停动画 */
  .animate-scroll:hover {
    animation-play-state: paused;
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    .media-card {
      width: 160px !important;
      height: 280px !important;
    }

    .media-title-area,
    .media-info-area {
      height: 10px !important;
      font-size: 12px !important;
    }

    .media-badge {
      font-size: 10px !important;
      padding: 1px 4px !important;
    }

    .media-tag {
      font-size: 10px !important;
      padding: 1px 6px !important;
    }
  }

  /* 小屏幕适配 */
  @media (max-width: 480px) {
    .media-card {
      width: 140px !important;
      height: 240px !important;
    }

    .media-title-area,
    .media-info-area {
      height: 8px !important;
      font-size: 11px !important;
      padding: 0 8px !important;
    }

    .media-badge {
      font-size: 9px !important;
      padding: 1px 3px !important;
    }

    .media-tag {
      font-size: 9px !important;
      padding: 1px 4px !important;
      top: 6px !important;
      left: 6px !important;
    }
  }
</style>

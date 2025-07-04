<template>
  <!-- 卡片容器：控制尺寸、阴影、圆角 -->
  <div
    class="w-48 h-[350px] bg-black rounded-md overflow-hidden shadow-md relative flex flex-col justify-between cursor-pointer"
  >
    <!-- 海报+内容区 -->
    <div class="relative flex-1 bg-cover bg-center" :style="{ backgroundImage: `url(${props.cover})` }">
      <!-- 评分：右上角 -->
      <div v-if="props.rate" class="absolute top-2 right-2 flex items-center space-x-1 text-yellow-400 z-10">
        <Badge class="bg-black/70 text-white text-xs border-0 rounded">
          <div class="flex items-center px-2 py-0.5">
            <Star class="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
            <span class="text-xs">{{ props.rate }}</span>
          </div>
        </Badge>
      </div>
      <!-- 新片角标：左上角 -->
      <div v-if="props.tag" class="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded">
        {{ props.tag }}
      </div>
      <!-- 备注：左下角 -->
      <div v-if="props.remark" class="absolute bottom-2 left-2">
        <Badge class="bg-black/70 text-white border-1 border-white/30 rounded">
          <div class="text-xs flex items-center px-2 py-0.5">
            {{ props.remark }}
          </div>
        </Badge>
      </div>
      <!-- 站点：左下角 -->
      <div v-if="props.site" class="absolute bottom-2 right-2">
        <Badge class="bg-black/70 text-white border-1 border-white/30 rounded">
          <div class="text-xs flex items-center px-2 py-0.5">
            {{ props.site }}
          </div>
        </Badge>
      </div>
    </div>
    <!-- 底部标题区：使用 VueUse 实现智能滚动 -->
    <div class="bg-black/80 text-white border-0 border-gray-700 h-12 flex items-center justify-center overflow-hidden">
      <div
        ref="titleRef"
        class="text-sm font-medium tracking-wide whitespace-nowrap px-2"
        :class="{ 'animate-scroll': isScrolling }"
      >
        {{ props.title }}
      </div>
    </div>
    <div
      v-if="props.year || props.type || props.area"
      class="bg-black/80 text-gray-400 border-t border-gray-700 h-12 flex items-center justify-between overflow-hidden"
    >
      <div v-if="props.type" class="text-xs">
        {{ props.type }}
      </div>
      <div v-if="props.year" class="text-xs">
        {{ props.year }}
      </div>
      <div v-if="props.area" class="text-xs">
        {{ props.area }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useElementSize, useIntersectionObserver } from '@vueuse/core';
  import { Badge } from 'ant-design-vue';
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
    area: {
      type: String,
      default: '',
    },
    // 备注
    remark: {
      type: String,
      default: '',
    },
    // 站点
    site: {
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
</style>

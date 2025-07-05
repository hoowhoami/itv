<template>
  <div v-show="false">
    <!-- 使用插槽捕获内容 -->
    <slot />
  </div>
</template>

<script setup lang="ts">
  import { defineProps, inject, getCurrentInstance, onMounted, markRaw } from 'vue';
  import type { TabItem } from './index.vue';

  defineOptions({
    name: 'TabPanel',
  });

  interface Props {
    tab: string; // 标签唯一标识
    label?: string; // 标签显示文本
  }

  const props = defineProps<Props>();

  const registerTabPanel = inject<(tab: Omit<TabItem, 'contentComponent'>) => void>('registerTabPanel')!;

  onMounted(() => {
    // 获取组件内容
    const content = getCurrentInstance()?.slots.default?.() || null;

    registerTabPanel({
      key: props.tab,
      label: props.label || props.tab,
      content: content ? markRaw(content) : null, // 使用 markRaw 标记内容
    });
  });
</script>

<template>
  <!-- TabPanel 组件不直接渲染内容，内容由父组件 Tabs 管理 -->
  <div style="display: none"></div>
</template>

<script setup lang="ts">
  import { inject, onMounted, onUnmounted, useSlots, watch } from 'vue';
  import type { TabItem } from './index.vue';

  defineOptions({
    name: 'TabPanel',
  });

  interface Props {
    tab: string; // 标签唯一标识
    label?: string; // 标签显示文本
  }

  const props = defineProps<Props>();
  const slots = useSlots();

  const registerTabPanel = inject<(tab: TabItem) => void>('registerTabPanel');
  const unregisterTabPanel = inject<(key: string) => void>('unregisterTabPanel');

  // 监听 label 变化并重新注册
  const updateTabPanel = () => {
    if (registerTabPanel) {
      registerTabPanel({
        key: props.tab,
        label: props.label || props.tab,
        content: () => slots.default?.() || [],
      });
    }
  };

  onMounted(() => {
    updateTabPanel();
  });

  // 监听 label 属性变化
  watch(
    () => props.label,
    () => {
      updateTabPanel();
    }
  );

  onUnmounted(() => {
    if (unregisterTabPanel) {
      unregisterTabPanel(props.tab);
    }
  });
</script>

<template>
  <div class="w-full rounded-lg bg-background dark:bg-background/80">
    <!-- 标签栏 -->
    <div class="flex overflow-hidden border rounded-lg">
      <button
        v-for="tab in tabPanels"
        :key="tab.key"
        class="flex-1 py-2 text-center text-sm font-medium transition-all duration-200 relative first:rounded-l-lg last:rounded-r-lg px-3 cursor-pointer"
        :class="{
          // 激活态样式
          'active-tab': modelValue === tab.key,
          'text-muted-foreground dark:text-sidebar-foreground/80 hover:bg-muted/30 dark:hover:bg-sidebar/30':
            modelValue !== tab.key,
        }"
        @click="handleTabClick(tab.key)"
      >
        <!-- 激活标签的视觉元素 -->
        <div
          v-if="modelValue === tab.key"
          class="absolute inset-[2px] z-10 rounded-md border-1 border-primary bg-white dark:bg-sidebar flex items-center justify-center"
        >
          {{ tab.label }}
        </div>

        <!-- 未激活标签的视觉元素 -->
        <div v-else>{{ tab.label }}</div>
      </button>
    </div>

    <!-- 内容面板 -->
    <div>
      <!-- 渲染当前选中的标签内容 -->
      <div v-if="currentTabPanel" class="tab-content w-full">
        <component :is="currentTabPanel.content" />
      </div>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
  import { computed, defineModel, provide, ref, onUnmounted } from 'vue';

  defineOptions({
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'Tabs',
  });

  export interface TabItem {
    key: string;
    label: string;
    content: () => unknown;
  }

  // 使用 defineModel 实现 v-model
  const modelValue = defineModel<string>('activeKey');

  // 处理标签点击
  const handleTabClick = (key: string) => {
    modelValue.value = key;
  };

  // 存储所有子 TabPanel 数据
  const tabPanels = ref<TabItem[]>([]);

  // 注册 TabPanel 的方法
  const registerTabPanel = (tab: TabItem) => {
    const existingIndex = tabPanels.value.findIndex((t) => t.key === tab.key);

    if (existingIndex !== -1) {
      tabPanels.value[existingIndex] = tab;
    } else {
      tabPanels.value.push(tab);
    }
  };

  // 注销 TabPanel 的方法
  const unregisterTabPanel = (key: string) => {
    const index = tabPanels.value.findIndex((t) => t.key === key);
    if (index !== -1) {
      tabPanels.value.splice(index, 1);
    }
  };

  // 提供注册和注销方法给子组件
  provide('registerTabPanel', registerTabPanel);
  provide('unregisterTabPanel', unregisterTabPanel);

  // 当前选中的标签面板
  const currentTabPanel = computed(() => {
    return tabPanels.value.find((tab) => tab.key === modelValue.value) || null;
  });

  // 清理资源
  onUnmounted(() => {
    tabPanels.value = [];
  });
</script>

<style scoped>
  .tab-content {
    animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>

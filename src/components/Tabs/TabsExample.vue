<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">Tabs 组件使用示例</h2>

    <!-- 方式1: 使用 TabPanel 组件 (原有方式) -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-2">方式1: 使用 TabPanel 组件</h3>
      <Tabs v-model:activeKey="activeKey1">
        <TabPanel tab="tab1" label="标签1">
          <div class="p-4">
            <h4 class="font-medium mb-2">这是标签1的内容</h4>
            <p>使用 TabPanel 组件包装内容</p>
          </div>
        </TabPanel>
        <TabPanel tab="tab2" label="标签2">
          <div class="p-4">
            <h4 class="font-medium mb-2">这是标签2的内容</h4>
            <p>每个 TabPanel 都有自己的内容</p>
          </div>
        </TabPanel>
      </Tabs>
    </div>

    <!-- 方式2: 使用标签页插槽 (新功能) -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-2">方式2: 使用标签页插槽</h3>
      <Tabs v-model:activeKey="activeKey2">
        <TabPanel tab="tab1" label="标签1">
          <div class="p-4">
            <h4 class="font-medium mb-2">标签1内容</h4>
            <p>标签页标题使用了自定义插槽</p>
          </div>
        </TabPanel>
        <TabPanel tab="tab2" label="标签2">
          <div class="p-4">
            <h4 class="font-medium mb-2">标签2内容</h4>
            <p>带有图标和计数的标签页</p>
          </div>
        </TabPanel>

        <!-- 使用标签页插槽自定义标签页标题 -->
        <template #tab1-tab="{ tab, active }">
          <div class="flex items-center gap-2">
            <span>🎬</span>
            <span>{{ tab.label }}</span>
            <span class="text-xs bg-blue-500 text-white px-1 rounded">5</span>
            <span v-if="active" class="text-xs">✓</span>
          </div>
        </template>

        <template #tab2-tab="{ tab, active }">
          <div class="flex items-center gap-2">
            <span>☁️</span>
            <span>{{ tab.label }}</span>
            <span class="text-xs bg-green-500 text-white px-1 rounded">12</span>
            <span v-if="active" class="text-xs">✓</span>
          </div>
        </template>
      </Tabs>
    </div>

    <!-- 方式3: 组合使用 -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-2">方式3: 组合使用</h3>
      <Tabs v-model:activeKey="activeKey3">
        <!-- 普通标签 -->
        <TabPanel tab="normal" label="普通标签">
          <div class="p-4">
            <h4 class="font-medium mb-2">普通标签</h4>
            <p>这个标签使用默认的文本显示</p>
          </div>
        </TabPanel>

        <!-- 自定义标签页 -->
        <TabPanel tab="custom" label="自定义标签">
          <div class="p-4">
            <h4 class="font-medium mb-2">自定义标签页</h4>
            <p>这个标签页的标题使用了自定义插槽</p>
          </div>
        </TabPanel>

        <!-- 只有这个标签使用自定义标签页插槽 -->
        <template #custom-tab="{ tab, active }">
          <div class="flex items-center gap-2">
            <span>⚡</span>
            <span>{{ tab.label }}</span>
            <span class="text-xs bg-purple-500 text-white px-1 rounded">NEW</span>
            <span v-if="active" class="text-xs">●</span>
          </div>
        </template>
      </Tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import Tabs from './index.vue';
  import TabPanel from './TabPanel.vue';

  const activeKey1 = ref('tab1');
  const activeKey2 = ref('slot1');
  const activeKey3 = ref('mixed1');
</script>

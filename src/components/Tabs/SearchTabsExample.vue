<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">搜索页面标签页插槽示例</h2>
    
    <Tabs v-model:activeKey="activeKey">
      <TabPanel tab="movie" label="影视作品">
        <div class="p-4">
          <div v-if="movieLoading" class="flex items-center justify-center py-12">
            <Spin :spinning="movieLoading" tip="正在搜索影视作品..." />
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div v-for="i in movieCount" :key="i" class="p-4 border rounded">
              电影 {{ i }}
            </div>
          </div>
        </div>
      </TabPanel>
      
      <TabPanel tab="cloud" label="网盘资源">
        <div class="p-4">
          <div v-if="cloudLoading" class="flex items-center justify-center py-12">
            <Spin :spinning="cloudLoading" tip="正在搜索网盘资源..." />
          </div>
          <div v-else class="space-y-2">
            <div v-for="i in cloudCount" :key="i" class="p-3 border rounded">
              网盘资源 {{ i }}
            </div>
          </div>
        </div>
      </TabPanel>
      
      <!-- 使用标签页插槽自定义标签页标题 -->
      <template #movie-tab="{ tab, active }">
        <div class="flex items-center gap-2">
          <span>🎬</span>
          <span>{{ tab.label }}</span>
          <span class="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">{{ movieCount }}</span>
          <Spin v-if="movieLoading" :size="12" />
          <span v-else-if="active" class="text-xs text-blue-500">●</span>
        </div>
      </template>
      
      <template #cloud-tab="{ tab, active }">
        <div class="flex items-center gap-2">
          <span>☁️</span>
          <span>{{ tab.label }}</span>
          <span class="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">{{ cloudCount }}</span>
          <Spin v-if="cloudLoading" :size="12" />
          <span v-else-if="active" class="text-xs text-green-500">●</span>
        </div>
      </template>
    </Tabs>
    
    <div class="mt-6 flex gap-4">
      <button 
        @click="simulateMovieSearch" 
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        :disabled="movieLoading"
      >
        {{ movieLoading ? '搜索中...' : '搜索电影' }}
      </button>
      <button 
        @click="simulateCloudSearch" 
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        :disabled="cloudLoading"
      >
        {{ cloudLoading ? '搜索中...' : '搜索网盘' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Spin } from 'ant-design-vue';
import Tabs from './index.vue';
import TabPanel from './TabPanel.vue';

const activeKey = ref('movie');
const movieCount = ref(0);
const cloudCount = ref(0);
const movieLoading = ref(false);
const cloudLoading = ref(false);

const simulateMovieSearch = async () => {
  movieLoading.value = true;
  // 模拟搜索延迟
  await new Promise(resolve => setTimeout(resolve, 2000));
  movieCount.value = Math.floor(Math.random() * 20) + 1;
  movieLoading.value = false;
};

const simulateCloudSearch = async () => {
  cloudLoading.value = true;
  // 模拟搜索延迟
  await new Promise(resolve => setTimeout(resolve, 1500));
  cloudCount.value = Math.floor(Math.random() * 50) + 1;
  cloudLoading.value = false;
};
</script>

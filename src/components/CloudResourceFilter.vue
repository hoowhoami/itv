<template>
  <div
    class="cloud-resource-filter bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4"
  >
    <!-- 标题 -->
    <h3 class="text-base font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
      <FilterOutlined class="text-gray-600 dark:text-gray-400 mr-2" />
      按网盘类型筛选
    </h3>

    <!-- 筛选按钮组 -->
    <div class="filter-buttons mt-4">
      <!-- 全部按钮 -->
      <div class="filter-button-wrapper">
        <Badge :count="totalCount" :show-zero="true">
          <Button @click="selectPlatform('all')" :type="selectedPlatform === 'all' ? 'primary' : 'default'">
            全部
          </Button>
        </Badge>
      </div>

      <!-- 各平台按钮 -->
      <div v-for="(count, platform) in filteredPlatformCounts" :key="platform" class="filter-button-wrapper">
        <Badge :count="count" :show-zero="true">
          <Button @click="selectPlatform(platform)" :type="selectedPlatform === platform ? 'primary' : 'default'">
            {{ platform }}
          </Button>
        </Badge>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { FilterOutlined } from '@ant-design/icons-vue';
  import { Button, Badge } from 'ant-design-vue';

  interface Props {
    platformCounts: Record<string, number>;
    selectedPlatform?: string;
    totalCount: number;
  }

  interface Emits {
    (e: 'update:selectedPlatform', value: string): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    selectedPlatform: 'all',
  });
  const emit = defineEmits<Emits>();

  // 过滤掉 'all' 平台
  const filteredPlatformCounts = computed(() => {
    const filtered: Record<string, number> = {};
    Object.entries(props.platformCounts).forEach(([platform, count]) => {
      if (platform !== 'all') {
        filtered[platform] = count;
      }
    });
    return filtered;
  });

  // 选择平台
  const selectPlatform = (platform: string) => {
    emit('update:selectedPlatform', platform);
  };
</script>

<style scoped>
  .cloud-resource-filter {
    transition: all 0.2s ease-in-out;
  }

  .filter-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }

  .filter-button-wrapper {
    display: inline-block;
    margin: 0 4px 8px 0;
  }
</style>

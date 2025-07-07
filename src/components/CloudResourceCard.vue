<template>
  <div
    class="cloud-resource-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
  >
    <!-- 标题部分 -->
    <div class="flex items-start justify-between mb-3">
      <h3 class="text-base font-medium text-gray-900 dark:text-gray-100 leading-tight flex-1 mr-3">
        <span class="text-gray-600 dark:text-gray-400 text-sm mr-2">名称:</span>
        {{ title }}
      </h3>
      <!-- 网盘类型标签 -->
      <Tag color="blue">{{ platform }}</Tag>
    </div>

    <!-- 来源信息 -->
    <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
      <CalendarOutlined class="mr-1" />
      <span class="mr-4">{{ timeAgo }}</span>
      <span class="text-gray-400 dark:text-gray-500">来源:</span>
      <span class="ml-1">{{ source }}</span>
    </div>

    <!-- 操作按钮 -->
    <div class="flex gap-2">
      <Button @click="copyLink" class="flex-1">
        <div class="flex items-center justify-center">
          <CopyOutlined class="mr-1" />
          复制链接
        </div>
      </Button>
      <Button @click="visitPlatform" type="primary" class="flex-1">
        <div class="flex items-center justify-center">
          <LinkOutlined class="mr-1" />
          访问{{ platform }}
        </div>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { CalendarOutlined, CopyOutlined, LinkOutlined } from '@ant-design/icons-vue';
  import { Button, Tag, message } from 'ant-design-vue';

  interface Props {
    title: string;
    platform: string;
    timeAgo: string;
    source: string;
    link: string;
  }

  const props = defineProps<Props>();

  // 复制链接
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(props.link);
      message.success('链接已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      message.error('复制失败，请手动复制');
    }
  };

  // 访问网盘平台
  const visitPlatform = () => {
    window.open(props.link, '_blank');
  };
</script>

<style scoped>
  .cloud-resource-card {
    transition: all 0.2s ease-in-out;
  }

  .cloud-resource-card:hover {
    transform: translateY(-1px);
  }
</style>

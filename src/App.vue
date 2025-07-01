<template>
  <div class="min-h-screen bg-background">
    <section class="hidden md:block bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            发现精彩影视内容
          </h1>
          <p class="text-xl text-muted-foreground mb-8">
            基于采集站和网站资源站的全网影视资源搜索平台，为您提供最新最全的影视资源
          </p>
          <div class="flex flex-wrap justify-center gap-4 text-sm">
            <div class="flex items-center gap-2 bg-background/80 backdrop-blur rounded-full px-4 py-2 border border-border/30">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>实时更新</span>
            </div>
            <div class="flex items-center gap-2 bg-background/80 backdrop-blur rounded-full px-4 py-2 border border-border/30">
              <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>多源聚合</span>
            </div>
            <div class="flex items-center gap-2 bg-background/80 backdrop-blur rounded-full px-4 py-2 border border-border/30">
              <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>高清资源</span>
            </div>
            <div class="flex items-center gap-2 bg-background/80 backdrop-blur rounded-full px-4 py-2 border border-border/30">
              <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>免费观看</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="container mx-auto px-4 py-8">
      <DoubanMedia />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, watch} from 'vue';
import {
  LucideHome,
  LucideSettings,
  LucideLayoutDashboard,
  LucideClock,
  LucideMenu,
  LucideSearch,
  LucideBell,
  LucideUser
} from 'lucide-vue-next';
import {useRouter, useRoute} from 'vue-router';

const router = useRouter();
const route = useRoute();
const collapsed = ref(false);
const selectedKey = ref('home');
const breadcrumbTitle = ref('欢迎使用iTV');

const toggleSidebar = () => {
  collapsed.value = !collapsed.value;
};

const handleMenuSelect = ({key}: { key: string }) => {
  selectedKey.value = key;

  // 设置面包屑标题
  const titleMap: Record<string, string> = {
    'home': '欢迎使用iTV',
    'appearance-settings': '外观设置',
    'cloud-drive-settings': '云盘设置',
    'ai-model-settings': 'AI模型设置',
    'ai-speed-test': 'AI速率测试',
    'history': '历史记录',
  };

  breadcrumbTitle.value = titleMap[key] || '未知页面';

  // 导航到对应路由
  router.push({path: `/${key}`});
};

// 监听路由变化，更新选中的菜单项
watch(() => route.path, (newPath) => {
  // 从路径中提取路由名称
  const pathName = newPath.replace(/^\//, '');
  if (pathName) {
    selectedKey.value = pathName;
  }
});
</script>

<style scoped>
:deep(.ant-layout-sider) {
  min-height: 100vh;
}

:deep(.ant-menu-item-selected) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}
</style>
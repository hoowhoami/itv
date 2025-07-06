<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { RouterView, RouterLink, useRoute } from 'vue-router';
  import { Button } from 'ant-design-vue';
  import SettingsDialog from '@/components/settings/SettingsDialog.vue';
  import InitDialog from '@/components/InitDialog.vue';
  import { useAppStore } from '@/store';
  import { useConfig } from '@/hooks/use-config';
  import SearchForm from '@/components/SearchForm.vue';

  defineOptions({
    name: 'MainLayout',
  });

  const year = new Date().getFullYear();

  const settingVisible = ref(false);
  const openSettingsDialog = () => {
    settingVisible.value = true;
  };

  const initVisible = ref(false);

  const keyword = ref();

  const appStore = useAppStore();

  const config = useConfig();

  const api = ref<string>();

  const route = useRoute();

  onMounted(async () => {
    await config.init();
    api.value = appStore.getAuthBaseUrl;
    if (!appStore.getProxyBaseUrl) {
      initVisible.value = true;
    }
  });
</script>

<template>
  <div class="min-h-screen bg-background">
    <header
      class="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between md:gap-6">
          <div class="hidden md:block items-center gap-2">
            <router-link to="/" class="text-xl font-bold text-primary flex-shrink-0"> 影视资源站 </router-link>
          </div>

          <div class="flex-1 max-w-2xl mx-2">
            <SearchForm v-model:value="keyword" />
          </div>

          <div class="flex items-center gap-2">
            <nav class="hidden md:flex items-center gap-1">
              <router-link to="/">
                <Button variant="ghost" class="text-sm font-medium hover:bg-muted/80"> 首页 </Button>
              </router-link>
              <router-link to="/history">
                <Button variant="ghost" class="text-sm font-medium hover:bg-muted/80"> 观看历史 </Button>
              </router-link>
              <Button variant="ghost" class="text-sm font-medium hover:bg-muted/80" @click="openSettingsDialog">
                设置
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </header>

    <div class="h-[56px]" />

    <main>
      <router-view :key="route.fullPath" />
    </main>

    <footer class="hidden md:block bg-muted/30 mt-16 border-t border-border/30">
      <div class="container mx-auto px-4 py-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 class="font-semibold mb-4">影视资源站</h3>
            <p class="text-sm text-muted-foreground">基于采集站和网盘资源站的全网影视资源搜索平台</p>
          </div>
          <div>
            <h4 class="font-medium mb-4">功能</h4>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>影视搜索</li>
              <li>网盘资源</li>
              <li>观看历史</li>
              <li>搜索历史</li>
            </ul>
          </div>
          <div>
            <h4 class="font-medium mb-4">资源类型</h4>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>电影资源</li>
              <li>电视剧资源</li>
              <li>动漫资源</li>
              <li>综艺资源</li>
            </ul>
          </div>
          <div>
            <h4 class="font-medium mb-4">支持平台</h4>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>阿里云盘</li>
              <li>115网盘</li>
              <li>百度网盘</li>
              <li>夸克网盘</li>
            </ul>
          </div>
        </div>
        <div class="border-t border-border/30 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {{ year }} 影视资源站. 所有权利保留.</p>
        </div>
      </div>
    </footer>

    <SettingsDialog v-model:open="settingVisible" />
    <InitDialog v-model:open="initVisible" v-model:api="api" />
  </div>
</template>

<style scoped></style>

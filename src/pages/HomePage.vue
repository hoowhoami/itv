<script lang="ts" setup>
  import DoubanMedia from '@/components/douban/DoubanMedia.vue';

  defineOptions({
    name: 'HomePage',
  });
</script>

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
            <div
              class="flex items-center gap-2 bg-background/80 backdrop-blur rounded-full px-4 py-2 border border-border/30"
            >
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>实时更新</span>
            </div>
            <div
              class="flex items-center gap-2 bg-background/80 backdrop-blur rounded-full px-4 py-2 border border-border/30"
            >
              <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>多源聚合</span>
            </div>
            <div
              class="flex items-center gap-2 bg-background/80 backdrop-blur rounded-full px-4 py-2 border border-border/30"
            >
              <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>高清资源</span>
            </div>
            <div
              class="flex items-center gap-2 bg-background/80 backdrop-blur rounded-full px-4 py-2 border border-border/30"
            >
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

<style scoped></style>

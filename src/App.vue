<template>
  <div class="min-h-screen bg-background">
    <config-provider :locale="zhCN" componentSize="large" :theme="{ algorithm: themeMode }">
      <app>
        <router-view :key="route.fullPath" />
        <back-top />
      </app>
    </config-provider>
  </div>
</template>

<script lang="ts" setup>
  import { App, BackTop, ConfigProvider, theme } from 'ant-design-vue';
  import zhCN from 'ant-design-vue/es/locale/zh_CN';
  import { RouterView, useRoute } from 'vue-router';
  import { computed } from 'vue';
  import { useColorMode } from '@vueuse/core';

  const route = useRoute();

  const { darkAlgorithm, defaultAlgorithm } = theme;
  const { system, store } = useColorMode();
  //  system.value 'dark' | 'light'
  //  store.value 'dark' | 'light' | 'auto'
  const colorMode = computed(() => (store.value === 'auto' ? system.value : store.value));
  const themeMode = computed(() => {
    return colorMode.value === 'dark' ? darkAlgorithm : defaultAlgorithm;
  });
</script>

<style scoped></style>

<template>
  <div class="min-h-screen bg-background">
    <config-provider componentSize="middle" :theme="{ algorithm: themeMode }">
      <app>
        <router-view />
        <back-top />
      </app>
    </config-provider>
  </div>
</template>

<script lang="ts" setup>
  import { App, BackTop, ConfigProvider, theme } from 'ant-design-vue';
  import { RouterView } from 'vue-router';
  import { computed } from 'vue';
  import { useDark } from '@vueuse/core';

  const { darkAlgorithm, defaultAlgorithm } = theme;

  const isDark = useDark();

  const themeMode = computed(() => {
    return isDark ? darkAlgorithm : defaultAlgorithm;
  });
</script>

<style scoped></style>

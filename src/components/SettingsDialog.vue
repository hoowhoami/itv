<script lang="ts" setup>
  import { h, FunctionalComponent, ref, computed, onMounted } from 'vue';
  import type { ItemType } from 'ant-design-vue';
  import { Menu, Modal } from 'ant-design-vue';
  import { Settings, Server, Database, Bot, Archive, Link, Palette } from 'lucide-vue-next';
  import { MenuInfo } from 'ant-design-vue/es/menu/src/interface';
  import AppearanceSettings from './AppearanceSettings.vue';
  import ProxySettings from './ProxySettings.vue';
  import ApiSiteSettings from './ApiSiteSettings.vue';
  import { useWindowSize } from '@vueuse/core';

  defineOptions({
    name: 'SettingsDialog',
  });

  const modelValue = defineModel<boolean>('open');

  const renderMenuIcon = (icon: FunctionalComponent) => {
    return h(icon, { class: 'w-4 h-4' });
  };

  const activeMenuKey = ref<string>();

  const selectedKeys = ref<string[]>([]);

  const handleMenuClick = (info: MenuInfo) => {
    activeMenuKey.value = info.key as string;
  };

  const menuItems = [
    { key: 'appearance', icon: renderMenuIcon(Palette), label: '外观设置' },
    { key: 'proxy', icon: renderMenuIcon(Settings), label: '代理设置' },
    { key: 'site', icon: renderMenuIcon(Server), label: '采集站点' },
    { key: 'parser', icon: renderMenuIcon(Link), label: '在线解析' },
    { key: 'ai', icon: renderMenuIcon(Bot), label: '模型服务' },
    { key: 'drive', icon: renderMenuIcon(Archive), label: '网盘资源' },
    { key: 'data', icon: renderMenuIcon(Database), label: '数据管理' },
  ] as ItemType[];

  const { width: windowWidth } = useWindowSize();

  const dialogWidth = computed(() => {
    // md:max-h-[650px] md:max-w-[700px] lg:max-w-[1000px]
    let width = '100%';
    if (windowWidth.value >= 1024) {
      // lg
      width = '1000px';
    } else if (windowWidth.value >= 768) {
      // md
      width = '700px';
    }
    return width;
  });

  onMounted(() => {
    activeMenuKey.value = 'appearance';
    selectedKeys.value = [activeMenuKey.value];
  });
</script>

<template>
  <Modal v-model:open="modelValue" :footer="null" title="系统设置" :width="dialogWidth">
    <div class="p-0 md:max-h-[650px] md:max-w-[700px] lg:max-w-[1000px] z-70">
      <div class="flex flex-row h-[calc(100vh-260px)] min-h-[500px]">
        <div class="w-[180px] h-full">
          <Menu :items="menuItems" @click="handleMenuClick" v-model:selected-keys="selectedKeys"></Menu>
        </div>
        <div class="flex-1 h-full p-4 overflow-auto">
          <AppearanceSettings v-if="activeMenuKey === 'appearance'"></AppearanceSettings>
          <ProxySettings v-if="activeMenuKey === 'proxy'"></ProxySettings>
          <ApiSiteSettings v-if="activeMenuKey === 'site'"></ApiSiteSettings>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
  :deep(.ant-menu-light) {
    background: transparent;
  }
</style>

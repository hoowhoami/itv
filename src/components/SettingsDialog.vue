<script lang="ts" setup>
  import { defineOptions, defineModel, h, FunctionalComponent, ref } from 'vue';
  import type { ItemType } from 'ant-design-vue';
  import { Menu, Modal } from 'ant-design-vue';
  import { Settings, Server, Database, Bot, Archive, Link, Palette } from 'lucide-vue-next';
  import { MenuInfo } from 'ant-design-vue/es/menu/src/interface';
  import AppearanceSettings from './AppearanceSettings.vue';
  import ProxySettings from './ProxySettings.vue';

  defineOptions({
    name: 'SettingsDialog'
  });

  const modelValue = defineModel<boolean>('open');

  const renderMenuIcon = (icon: FunctionalComponent) => {
    return h(icon, { class: 'w-4 h-4' });
  };

  const activeMenuKey = ref('appearance');

  const handleMenuClick = (key: MenuInfo) => {
    console.log(key);
    activeMenuKey.value = key.key as string;
  };

  const menuItems = [
    { key: 'appearance', icon: renderMenuIcon(Palette), label: '外观设置' },
    { key: 'proxy', icon: renderMenuIcon(Settings), label: '代理设置' },
    { key: 'site', icon: renderMenuIcon(Server), label: '采集站点' },
    { key: 'parser', icon: renderMenuIcon(Link), label: '在线解析' },
    { key: 'ai', icon: renderMenuIcon(Bot), label: '模型服务' },
    { key: 'drive', icon: renderMenuIcon(Archive), label: '网盘资源' },
    { key: 'data', icon: renderMenuIcon(Database), label: '数据管理' }
  ] as ItemType[];
</script>

<template>
  <Modal v-model:open="modelValue" :footer="null" title="系统设置" width="70%">
    <div class="p-0 md:max-h-[650px] md:max-w-[700px] lg:max-w-[1000px] z-70">
      <div class="flex flex-row h-[calc(100vh-260px)] min-h-[500px]">
        <div class="w-[180px] h-full">
          <Menu :items="menuItems" @click="handleMenuClick"></Menu>
        </div>
        <div class="flex-1 h-full p-4 overflow-auto">
          <AppearanceSettings v-if="activeMenuKey === 'appearance'"></AppearanceSettings>
          <ProxySettings v-if="activeMenuKey === 'proxy'"></ProxySettings>
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

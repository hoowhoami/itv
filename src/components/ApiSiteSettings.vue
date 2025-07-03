<script lang="ts" setup>
  import { computed, defineOptions, onMounted, ref } from 'vue';
  import { CheckboxGroup, Checkbox } from 'ant-design-vue';
  import { useSiteStore } from '@/store';
  import type { CheckboxOptionType } from 'ant-design-vue';
  import { CheckboxValueType } from 'ant-design-vue/es/checkbox/interface';

  defineOptions({
    name: 'ApiSiteSettings'
  });

  const siteStore = useSiteStore();

  const sites = siteStore.getSites as CheckboxOptionType[];

  const selected = computed(() => {
    return siteStore.getSelectedSites as CheckboxValueType[];
  });
</script>
<template>
  <div>
    <CheckboxGroup v-model:value="selected" :options="sites"></CheckboxGroup>
  </div>
</template>
<style scoped></style>

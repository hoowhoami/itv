<script lang="ts" setup>
  import DoubanMovie from './DoubanMovie.vue';
  import DoubanTV from './DoubanTV.vue';
  import { ref } from 'vue';
  import Tabs from '@/components/Tabs/index.vue';
  import TabPanel from '@/components/Tabs/TabPanel.vue';

  defineOptions({
    name: 'DoubanMedia',
  });

  const activeKey = ref('movies');
</script>
<template>
  <Tabs v-model:activeKey="activeKey">
    <TabPanel tab="movies" label="热门电影">
      <DoubanMovie />
    </TabPanel>
    <TabPanel tab="tv" label="热门电视剧">
      <DoubanTV />
    </TabPanel>
  </Tabs>
</template>
<style scoped></style>

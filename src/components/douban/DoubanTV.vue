<script lang="ts" setup>
  import { onMounted, ref, toRef } from 'vue';
  import { MediaItem, useDoubanMedia } from './hooks/use-douban-media';
  import { RadioGroup, RadioButton, Spin } from 'ant-design-vue';
  import MediaCard from '../MediaCard.vue';
  import { useRouter } from 'vue-router';

  defineOptions({
    name: 'DoubanTV',
  });

  // 分类数据
  const categories = ref([
    { id: '热门', name: '热门' },
    { id: '国产剧', name: '国产剧' },
    { id: '港剧', name: '港剧' },
    { id: '美剧', name: '美剧' },
    { id: '韩剧', name: '韩剧' },
    { id: '日剧', name: '日剧' },
    { id: '综艺', name: '综艺' },
    { id: '纪录片', name: '纪录片' },
  ]);

  const activeCategory = ref<string>();
  const tvRef = ref<HTMLElement>();
  const router = useRouter();

  const handleMediaClick = (media: MediaItem) => {
    router.push({
      path: '/search',
      query: {
        q: media.title,
        t: Date.now(),
      },
    });
  };

  const { loading, list } = useDoubanMedia('tv', toRef(activeCategory), toRef(tvRef));

  onMounted(() => {
    activeCategory.value = categories.value?.[0].id;
  });
</script>
<template>
  <div class="pt-4">
    <div class="flex gap-2 mb-6 px-4">
      <RadioGroup v-model:value="activeCategory">
        <RadioButton v-for="category in categories" :key="category.id" :value="category.id">
          {{ category.name }}
        </RadioButton>
      </RadioGroup>
    </div>

    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 justify-items-center px-4"
    >
      <MediaCard
        v-for="item in list"
        :key="item.id"
        :title="item.title"
        :cover="item.cover"
        :rate="item.rate"
        :tag="item.is_new ? '新片' : ''"
        :remark="item.episodes_info"
        @click="handleMediaClick(item)"
      />
    </div>
    <div ref="tvRef" class="w-full py-8 flex justify-center">
      <Spin :spinning="loading" />
    </div>
  </div>
</template>
<style scoped></style>

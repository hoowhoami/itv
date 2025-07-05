<script lang="ts" setup>
  import { onMounted, ref, toRef } from 'vue';
  import { useDoubanMedia } from './hooks/use-douban-media';
  import { RadioGroup, RadioButton, Spin } from 'ant-design-vue';
  import MediaCard from '../MediaCard.vue';

  defineOptions({
    name: 'DoubanMovie',
  });

  // 分类数据
  const categories = ref([
    { id: '热门', name: '热门' },
    { id: '最新', name: '最新' },
    { id: '豆瓣高分', name: '豆瓣高分' },
    { id: '冷门佳片', name: '冷门佳片' },
    { id: '华语', name: '华语' },
    { id: '欧美', name: '欧美' },
    { id: '韩国', name: '韩国' },
    { id: '日本', name: '日本' },
    { id: '动漫', name: '动漫' },
  ]);

  const activeCategory = ref<string>();
  const movieRef = ref<HTMLElement>();

  const handleMediaClick = (title: string) => {
    console.log('click media', title);
  };

  const { loading, list } = useDoubanMedia('movie', toRef(activeCategory), toRef(movieRef));

  onMounted(() => {
    activeCategory.value = categories.value?.[0].id;
  });
</script>
<template>
  <div class="mt-6">
    <div class="flex gap-2 mb-6">
      <RadioGroup v-model:value="activeCategory">
        <RadioButton v-for="category in categories" :key="category.id" :value="category.id">
          {{ category.name }}
        </RadioButton>
      </RadioGroup>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <MediaCard
        v-for="item in list"
        :key="item.id"
        :title="item.title"
        :cover="item.cover"
        :rate="item.rate"
        :tag="item.is_new ? '新片' : ''"
        @click="handleMediaClick(item.title)"
      />
    </div>
    <div ref="movieRef" class="w-full py-8 flex justify-center">
      <Spin :spinning="loading" />
    </div>
  </div>
</template>
<style scoped></style>

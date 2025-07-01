<template>
  <div class="flex flex-col items-center justify-center h-screen bg-background px-4">
    <div class="text-center">
      <div class="inline-block mb-6 relative">
        <span class="text-[160px] font-bold text-gray-200">404</span>
        <img
            src="https://picsum.photos/200/150"
            alt="Page Not Found"
            class="absolute inset-0 m-auto w-32 h-24 object-cover rounded-lg"
        />
      </div>
      <h1 class="text-[clamp(2rem,5vw,3.5rem)] font-bold text-gray-800 mb-4">页面未找到</h1>
      <p class="text-xl text-gray-600 max-w-md mx-auto mb-8">
        您访问的页面不存在或已被移除。请检查URL或返回首页。
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a-button type="primary" size="large" @click="goHome">
          <lucide-home class="mr-2" /> 返回首页
        </a-button>
        <a-button size="large" @click="goBack">
          <lucide-arrow-left class="mr-2" /> 返回上一页
        </a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter, useRoute } from 'vue-router';
import { LucideHome, LucideArrowLeft } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();

const goHome = () => {
  router.push('/');
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
/* 添加一些自定义动画效果 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.text-center {
  animation: fadeIn 0.6s ease-out forwards;
}
</style>
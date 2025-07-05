<template>
  <div class="flex flex-col items-center justify-center h-screen bg-background px-4">
    <div class="text-center">
      <div class="inline-block mb-6 relative">
        <span class="text-[160px] font-bold text-gray-200">404</span>
      </div>
      <h1 class="text-[clamp(2rem,5vw,3.5rem)] font-bold text-gray-800 mb-4">页面未找到</h1>
      <p class="text-xl text-gray-600 mx-auto mb-8">您访问的页面不存在或已被移除。请检查URL或返回首页。</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <Button type="primary" @click="goHome">
          <div class="flex items-center gap-2">
            <lucide-home class="w-4 h-4" />
            <div>返回首页</div>
          </div>
        </Button>
        <Button @click="goBack">
          <div class="flex items-center gap-2">
            <lucide-arrow-left class="w-4 h-4" />
            <div>返回上一页</div>
          </div>
        </Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useRouter } from 'vue-router';
  import { LucideHome, LucideArrowLeft } from 'lucide-vue-next';
  import { Button } from 'ant-design-vue';
  defineOptions({
    name: 'NotFound',
  });

  const router = useRouter();

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
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .text-center {
    animation: fadeIn 0.6s ease-out forwards;
  }
</style>

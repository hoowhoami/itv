<template>
  <div class="flex flex-col items-center justify-center h-screen bg-background px-4">
    <div class="text-center">
      <div class="inline-block mb-6 relative">
        <span class="text-[160px] font-bold text-muted-foreground/30">404</span>
      </div>
      <h1 class="text-[clamp(2rem,5vw,3.5rem)] font-bold text-foreground mb-4">页面未找到</h1>
      <p class="text-xl text-muted-foreground mx-auto mb-8">您访问的页面不存在或已被移除。请检查URL或返回首页。</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <Button type="primary" @click="goHome" class="error-page-button">
          <div class="flex items-center gap-2">
            <lucide-home class="w-4 h-4" />
            <div>刷新页面</div>
          </div>
        </Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { LucideHome } from 'lucide-vue-next';
  import { Button } from 'ant-design-vue';
  defineOptions({
    name: 'NotFound',
  });

  const goHome = () => {
    window.location.reload();
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

  /* 错误页面按钮样式 - 使用Ant Design Vue主题变量 */
  .error-page-button {
    background: var(--ant-color-primary) !important;
    border-color: var(--ant-color-primary) !important;
    color: var(--ant-color-white) !important;
    border-radius: 6px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
    transition: all 0.2s ease !important;
  }

  .error-page-button:hover {
    background: var(--ant-color-primary-hover) !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    .text-\[160px\] {
      font-size: 120px !important;
    }

    .text-\[clamp\(2rem\,5vw\,3\.5rem\)\] {
      font-size: clamp(1.5rem, 4vw, 2.5rem) !important;
    }

    .text-xl {
      font-size: 16px !important;
    }

    .px-4 {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
  }

  @media (max-width: 480px) {
    .text-\[160px\] {
      font-size: 80px !important;
    }

    .text-\[clamp\(2rem\,5vw\,3\.5rem\)\] {
      font-size: clamp(1.2rem, 3vw, 2rem) !important;
    }

    .text-xl {
      font-size: 14px !important;
    }
  }
</style>

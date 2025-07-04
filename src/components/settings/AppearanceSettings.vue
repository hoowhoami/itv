<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { RadioGroup, RadioButton, TypographyText } from 'ant-design-vue';
  import { useTheme } from '@/hooks/use-theme';
  import { Sun, Moon, Monitor } from 'lucide-vue-next';

  defineOptions({
    name: 'AppearanceSettings',
  });

  const { colorMode, switchTheme } = useTheme();

  const currentTheme = ref<'light' | 'dark' | 'auto'>('dark');

  onMounted(() => {
    currentTheme.value = colorMode.store.value;
  });

  const setTheme = () => {
    switchTheme(currentTheme.value);
  };
</script>

<template>
  <div class="rounded-xl border border-border bg-card/60 mx-0 p-4 space-y-6 w-full">
    <div class="flex justify-between items-center mx-2">
      <TypographyText class="w-16 text-base text-foreground/80">主题模式</TypographyText>
      <div class="flex">
        <radio-group button-style="solid" v-model:value="currentTheme" @change="setTheme">
          <radio-button value="light">
            <div class="flex items-center space-x-2">
              <Sun class="w-4 h-4" />
              <span>浅色</span>
            </div>
          </radio-button>
          <radio-button value="dark">
            <div class="flex items-center space-x-2">
              <Moon class="w-4 h-4" />
              <span>深色</span>
            </div>
          </radio-button>
          <radio-button value="auto">
            <div class="flex items-center space-x-2">
              <Monitor class="w-4 h-4" />
              <span>系统</span>
            </div>
          </radio-button>
        </radio-group>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

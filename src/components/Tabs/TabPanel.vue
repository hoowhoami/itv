<script setup lang="ts">
  import { inject, onMounted, onUnmounted, useSlots } from 'vue';
  import type { TabItem } from './index.vue';

  defineOptions({
    name: 'TabPanel',
  });

  interface Props {
    tab: string; // 标签唯一标识
    label?: string; // 标签显示文本
  }

  const props = defineProps<Props>();
  const slots = useSlots();

  const registerTabPanel = inject<(tab: TabItem) => void>('registerTabPanel');
  const unregisterTabPanel = inject<(key: string) => void>('unregisterTabPanel');

  onMounted(() => {
    if (registerTabPanel) {
      registerTabPanel({
        key: props.tab,
        label: props.label || props.tab,
        content: () => slots.default?.() || [],
      });
    }
  });

  onUnmounted(() => {
    if (unregisterTabPanel) {
      unregisterTabPanel(props.tab);
    }
  });
</script>

<script lang="ts" setup>
  import { Button, Modal, message } from 'ant-design-vue';
  import { Download, Upload } from 'lucide-vue-next';
  import { ref } from 'vue';

  defineOptions({
    name: 'DataManagement',
  });

  type LocalStorageData = Record<string, string | object>;

  const fileInput = ref<HTMLInputElement>();

  const openFileSelector = () => {
    // 触发文件选择框
    fileInput.value?.click();
  };

  const handleExportData = () => {
    const data: LocalStorageData = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith('__VUE_DEVTOOLS')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          data[key] = localStorage.getItem(key) || '';
        }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `itv-data-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('数据导出成功');
  };

  const handleImportData = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string) as LocalStorageData;
          Object.entries(data).forEach(([key, value]) => {
            if (typeof value === 'string') {
              localStorage.setItem(key, value);
            } else {
              localStorage.setItem(key, JSON.stringify(value));
            }
          });
          message.success('数据导入成功');
          window.location.reload();
        } catch {
          message.error('数据内容错误，请检查后重试');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearLocalData = () => {
    Modal.confirm({
      title: '确定要执行此操作吗？',
      content: '此操作将清除所有播放记录和设置，且无法恢复！',
      async onOk() {
        try {
          return await new Promise((resolve) => {
            localStorage.clear();
            window.location.reload();
            resolve(true);
          });
        } catch {
          return console.log('Oops errors!');
        }
      },
      onCancel() {},
    });
  };
</script>
<template>
  <div>
    <div class="mb-6">
      <div class="space-y-4">
        <div class="flex gap-2">
          <Button class="flex-1" variant="outline" @click="handleExportData">
            <div class="flex items-center justify-center">
              <Download class="w-4 h-4 mr-2" />
              <div>导出数据</div>
            </div>
          </Button>
          <Button class="flex-1" @click="openFileSelector">
            <div class="flex items-center justify-center">
              <Upload class="w-4 h-4 mr-2" />
              <div>导入数据</div>
            </div>
            <input ref="fileInput" type="file" accept=".json" class="hidden" @change="handleImportData" />
          </Button>
        </div>
        <Button class="w-full" type="dashed" danger @click="handleClearLocalData">清空本地数据</Button>
      </div>
    </div>
  </div>
</template>
<style scoped></style>

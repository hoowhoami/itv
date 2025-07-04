<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { Button, Input, Modal, TabPane, Tabs, Textarea, message } from 'ant-design-vue';
  import { AppState, useAppStore } from '@/store';

  defineOptions({
    name: 'InitDialog',
  });

  const modelValue = defineModel<boolean>('open');

  const api = defineModel<string>('api');

  const appStore = useAppStore();

  const closable = computed(() => {
    return !!appStore.getProxyBaseUrl;
  });

  const activeKey = ref('text');

  const text = ref();

  const importLoading = ref(false);

  const importFromText = () => {
    try {
      const json = JSON.parse(text.value);
      handleImportData(json);
    } catch (e) {
      console.error('Failed to import config from text', e);
      message.error('导入失败，无效的配置文本格式');
    }
  };

  const importFromApi = async () => {
    try {
      importLoading.value = true;
      const response = await fetch(api.value as string);
      const data = await response.json();
      handleImportData(data);
      importLoading.value = false;
    } catch (e) {
      importLoading.value = false;
      console.error('Failed to import config from api', e);
      message.error('导入失败，无法从远程接口获取配置');
    }
  };

  const handleImportData = (data: Partial<AppState>) => {
    try {
      if (data.PROXY_BASE_URL) {
        appStore.setAppConfig(data);
        window.location.reload();
      } else {
        message.error('导入失败：缺少必要的代理地址配置');
      }
    } catch (e) {
      console.error('Failed to import config data', e);
      message.error('配置文本内容错误，请检查后重试');
    }
  };
</script>
<template>
  <Modal
    v-model:open="modelValue"
    :footer="null"
    title="系统初始化"
    width="500px"
    :closable="closable"
    :mask-closable="false"
    :keyboard="false"
  >
    <div>
      <Tabs v-model:active-key="activeKey">
        <TabPane key="text" tab="配置文本">
          <div class="flex flex-col">
            <Textarea
              v-model:value="text"
              placeholder="请输入配置文本，示例如下：
{'proxyBaseUrl': 'https://example.com/proxy'}"
            ></Textarea>
            <div class="mt-2">
              <Button class="w-full" @click="importFromText" :disabled="!text">导入配置</Button>
            </div>
          </div>
        </TabPane>
        <TabPane key="api" tab="远程接口">
          <div>
            <Input v-model:value="api" placeholder="请输入远程接口地址" allow-clear></Input>
            <div class="mt-2">
              <Button class="w-full" @click="importFromApi" :disabled="!api" :loading="importLoading">导入配置</Button>
            </div>
          </div>
        </TabPane>
      </Tabs>
    </div>
  </Modal>
</template>
<style scoped></style>

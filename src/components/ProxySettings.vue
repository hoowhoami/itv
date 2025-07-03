<script lang="ts" setup>
  import { List, ListItem, Button, Input, RadioGroup, Radio, Popconfirm } from 'ant-design-vue';
  import { defineOptions, onMounted, ref } from 'vue';
  import { Trash2, Plus } from 'lucide-vue-next';
  import { useProxyStore } from '@/store';
  import type { Proxy } from '@/store';

  defineOptions({
    name: 'ProxySettings',
  });

  const proxyStore = useProxyStore();

  const selectedProxy = ref<Proxy>({
    name: undefined,
    url: undefined,
  });

  const proxies = proxyStore.getProxies;

  const newProxy = ref<Proxy>({
    name: undefined,
    url: undefined,
  });

  const handleAddProxy = () => {
    if (newProxy.value.name && newProxy.value.url) {
      proxyStore.addProxy(newProxy.value);
      newProxy.value = {
        name: undefined,
        url: undefined,
      };
    }
  };

  const handleSelectProxy = () => {
    if (selectedProxy.value) {
      proxyStore.selectProxy(selectedProxy.value);
    }
  };

  const handleDeleteProxy = (proxy: Proxy) => {
    proxyStore.deleteProxy(proxy);
    initSelectedProxy();
  };

  const initSelectedProxy = () => {
    const selected = proxyStore.getSelectedProxy;
    if (selected) {
      selectedProxy.value = selected;
    }
  };

  onMounted(() => {
    initSelectedProxy();
  });
</script>
<template>
  <div>
    <div class="mb-6">
      <div class="space-y-2">
        <div class="flex gap-2">
          <Input placeholder="代理名称" v-model:value="newProxy.name" allow-clear />
          <Input placeholder="代理地址" v-model:value="newProxy.url" allow-clear />

          <Button @click="handleAddProxy" :disabled="!newProxy.name || !newProxy.url">
            <Plus class="w-4 h-4" />
          </Button>
        </div>
        <div class="text-xs text-gray-500">留空即不代理，代理地址需支持M3U8转发</div>
      </div>
    </div>
    <div class="space-y-2">
      <RadioGroup v-model:value="selectedProxy" @change="handleSelectProxy" style="width: 100%">
        <List bordered :data-source="proxies" row-key="name">
          <template #renderItem="{ item }">
            <ListItem>
              <Radio :value="item" style="width: 100%">
                <div class="flex items-center justify-between">
                  <div>
                    {{ item.name }}
                  </div>
                  <div class="ml-2 text-xs text-gray-400">{{ item.url }}</div>
                </div>
              </Radio>
              <template #actions v-if="item.url">
                <Popconfirm title="确定要删除吗？" ok-text="确定" cancel-text="取消" @confirm="handleDeleteProxy(item)">
                  <Button danger>
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </Popconfirm>
              </template>
            </ListItem>
          </template>
        </List>
      </RadioGroup>
    </div>
  </div>
</template>
<style scoped>
  :deep(.ant-radio-wrapper > span:not(.ant-radio)) {
    width: 100%;
  }
</style>

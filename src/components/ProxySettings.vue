<script lang="ts" setup>
  import { List, ListItem, Button, Input, RadioGroup, Radio } from 'ant-design-vue';
  import { ref } from 'vue';
  import { CheckCircle2, Trash2, Plus } from 'lucide-vue-next';

  interface Proxy {
    name?: string;
    url?: string;
  }

  const selectedProxy = ref<Proxy>({
    name: undefined,
    url: undefined
  });

  const proxies = ref<Proxy[]>([
    {
      name: 'No Proxy',
      url: ''
    },
    {
      name: 'Proxy 1',
      url: 'http://localhost:8080'
    },
    {
      name: 'Proxy 2',
      url: 'http://localhost:8081'
    },
    {
      name: 'Proxy 3',
      url: 'http://localhost:8082'
    }
  ]);

  const newProxy = ref<Proxy>({
    name: undefined,
    url: undefined
  });

  const handleAddProxy = () => {};

  const handleSelectProxy = () => {
    if (selectedProxy.value) {
      console.log(selectedProxy.value);
    }
  };

  const handleDeleteProxy = (proxy: Proxy) => {
    const index = proxies.value.indexOf(proxy);
    if (index > -1) {
      proxies.value.splice(index, 1);
    }
  };
</script>
<template>
  <div>
    <div class="mb-6">
      <div class="space-y-2">
        <div class="flex gap-2">
          <Input placeholder="代理名称" v-model:value="newProxy.name" allow-clear />
          <Input placeholder="代理地址" v-model:value="newProxy.url" allow-clear />

          <Button class="cursor-pointer" @click="handleAddProxy">
            <Plus class="w-4 h-4" />
          </Button>
        </div>
        <div class="text-xs text-gray-500">留空即不代理，代理地址需支持M3U8转发</div>
      </div>
    </div>
    <div class="space-y-2">
      <RadioGroup v-model:value="selectedProxy.url" @change="handleSelectProxy" style="width: 100%">
        <List bordered :data-source="proxies" row-key="url">
          <template #renderItem="{ item }">
            <ListItem>
              <Radio :value="item.url" style="width: 100%">
                <div class="flex items-center justify-between">
                  <div>
                    {{ item.name }}
                  </div>
                  <div class="ml-2 text-xs text-gray-400">{{ item.url }}</div>
                </div>
              </Radio>
              <template #actions v-if="item.url">
                <button class="text-gray-400 hover:text-red-500 p-1" @click.stop="handleDeleteProxy(item)">
                  <Trash2 class="w-4 h-4" />
                </button>
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

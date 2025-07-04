<script lang="ts" setup>
  import {
    List,
    ListItem,
    Button,
    Form,
    FormItem,
    Input,
    Modal,
    RadioGroup,
    Radio,
    Popconfirm,
    Tag,
    Tooltip,
  } from 'ant-design-vue';
  import { onMounted, ref, computed } from 'vue';
  import { Trash2, Plus } from 'lucide-vue-next';
  import { useProxyStore } from '@/store';
  import type { Proxy } from '@/store';

  defineOptions({
    name: 'ProxySettings',
  });

  const proxyStore = useProxyStore();

  const selectedKey = ref<string>();

  const proxies = computed(() => {
    return proxyStore.getProxies;
  });

  const proxy = ref<Proxy>({
    name: '',
    url: '',
    deletable: true,
  } as Proxy);

  const rules = ref({
    name: [{ required: true, message: '请输入代理名称', trigger: 'change' }],
    url: [
      { required: true, message: '请输入代理地址', trigger: 'change' },
      { pattern: /^https?:\/\/.*/, message: '请输入正确的代理地址', trigger: 'change' },
    ],
  });

  const editDialogVisible = ref(false);

  const useForm = Form.useForm;

  const { resetFields, validate, validateInfos } = useForm(proxy, rules);

  const handleAddProxy = () => {
    resetFields();
    editDialogVisible.value = true;
  };

  const handleAddProxyConfirm = () => {
    validate()
      .then(() => {
        // 生成代理编码
        proxy.value.key = Math.random().toString(36).substring(2);
        proxyStore.addProxy(Object.assign({}, proxy.value));
        editDialogVisible.value = false;
      })
      .catch(() => {
        // ignore
      });
  };

  const handleSelectProxy = () => {
    if (selectedKey.value) {
      proxyStore.setSelected(selectedKey.value);
    }
  };

  const handleDeleteProxy = (proxy: Proxy) => {
    proxyStore.deleteProxy(proxy);
    initSelectedProxy();
  };

  const initSelectedProxy = () => {
    const selected = proxyStore.getSelectedKey;
    if (selected) {
      selectedKey.value = selected;
    }
  };

  onMounted(() => {
    initSelectedProxy();
  });

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
  };
</script>
<template>
  <div>
    <div class="mb-6">
      <List bordered row-key="key">
        <template #header>
          <div class="flex gap-2 items-center justify-between">
            <div class="text-xs text-gray-500">代理地址需支持M3U8转发</div>
            <div class="flex items-center gap-2">
              <Tooltip>
                <template #title>添加代理</template>
                <Button @click="handleAddProxy">
                  <Plus class="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
          </div>
        </template>
        <RadioGroup v-model:value="selectedKey" @change="handleSelectProxy" class="w-full">
          <ListItem v-for="item in proxies" :key="item.key" class="w-full">
            <div class="flex flex-row items-center justify-between w-full">
              <div>
                <Radio :value="item.key" :key="item.key">
                  {{ item.name }}
                </Radio>
              </div>
              <div class="flex items-center justify-end gap-10">
                <div class="ml-2 text-xs text-gray-400">{{ item.url }}</div>
              </div>
            </div>

            <template #actions>
              <div class="flex items-center justify-center w-full">
                <Popconfirm v-if="item.deletable" title="确定要删除吗？" @confirm="handleDeleteProxy(item)">
                  <Button size="small" type="dashed" danger>
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </Popconfirm>
                <Tag color="green" v-else>内置</Tag>
              </div>
            </template>
          </ListItem>
        </RadioGroup>
      </List>
    </div>
    <Modal title="添加代理" v-model:open="editDialogVisible" destroy-on-close @ok="handleAddProxyConfirm">
      <Form v-bind="formItemLayout">
        <FormItem label="代理名称" v-bind="validateInfos.name">
          <Input v-model:value="proxy.name" allow-clear />
        </FormItem>
        <FormItem label="代理地址" v-bind="validateInfos.url">
          <Input v-model:value="proxy.url" allow-clear />
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>
<style scoped>
  :deep(.ant-list-item-action) {
    width: 50px;
  }
  :deep(.ant-list-item-action > li) {
    width: 100%;
  }

  :deep(.ant-list-item-action .ant-tag) {
    margin-inline-end: 0 !important;
  }
</style>

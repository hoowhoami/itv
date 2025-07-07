<script lang="ts" setup>
  import { List, ListItem, Button, Form, FormItem, Input, Modal, Popconfirm, Tag, Tooltip } from 'ant-design-vue';
  import { ref, computed } from 'vue';
  import { Trash2, Plus } from 'lucide-vue-next';
  import { useParserStore } from '@/store';
  import type { Parser } from '@/store';

  defineOptions({
    name: 'OnlineParserSettings',
  });

  const parserStore = useParserStore();

  const parsers = computed(() => {
    return parserStore.getParsers;
  });

  const parser = ref<Parser>({
    name: '',
    url: '',
    deletable: true,
  } as Parser);

  const rules = ref({
    name: [{ required: true, message: '请输入解析站名称', trigger: 'change' }],
    url: [
      { required: true, message: '请输入接口地址', trigger: 'change' },
      { pattern: /^https?:\/\/.*/, message: '请输入正确的接口地址', trigger: 'change' },
    ],
  });

  const editDialogVisible = ref(false);

  const useForm = Form.useForm;

  const { resetFields, validate, validateInfos } = useForm(parser, rules);

  const handleAddParser = () => {
    resetFields();
    editDialogVisible.value = true;
  };

  const handleAddParserConfirm = () => {
    validate()
      .then(() => {
        // 生成解析站编码
        parser.value.key = Math.random().toString(36).substring(2);
        parserStore.addParser(Object.assign({}, parser.value));
        editDialogVisible.value = false;
      })
      .catch(() => {
        // ignore
      });
  };

  const handleDeleteParser = (parser: Parser) => {
    parserStore.deleteParser(parser);
  };

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
            <div class="text-xs text-gray-500">接口地址需包含{url}参数，例如：https://www.pouyun.com/?url={url}</div>
            <div class="flex items-center gap-2">
              <Tooltip>
                <template #title>添加解析站</template>
                <Button @click="handleAddParser">
                  <Plus class="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
          </div>
        </template>
        <ListItem v-for="item in parsers" :key="item.key" class="w-full">
          <div class="flex flex-row items-center justify-between w-full">
            <div>
              {{ item.name }}
            </div>
            <div class="flex items-center justify-end gap-10">
              <div class="ml-2 text-xs text-gray-400">{{ item.url }}</div>
            </div>
          </div>

          <template #actions>
            <div class="flex items-center justify-center w-full">
              <Popconfirm v-if="item.deletable" title="确定要删除吗？" @confirm="handleDeleteParser(item)">
                <Button type="link" danger>
                  <Trash2 class="w-4 h-4" />
                </Button>
              </Popconfirm>
              <Tag color="green" v-else>内置</Tag>
            </div>
          </template>
        </ListItem>
      </List>
    </div>
    <Modal title="添加解析站" v-model:open="editDialogVisible" destroy-on-close @ok="handleAddParserConfirm">
      <Form v-bind="formItemLayout">
        <FormItem label="解析站名称" v-bind="validateInfos.name">
          <Input v-model:value="parser.name" allow-clear />
        </FormItem>
        <FormItem label="接口地址" v-bind="validateInfos.url">
          <Input v-model:value="parser.url" allow-clear />
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

<script lang="ts" setup>
  import { watch, ref, onMounted, computed } from 'vue';
  import {
    Button,
    CheckboxGroup,
    Checkbox,
    Form,
    FormItem,
    Modal,
    Input,
    List,
    ListItem,
    Popconfirm,
    Tag,
    Tooltip,
  } from 'ant-design-vue';
  import { Trash2, Plus } from 'lucide-vue-next';
  import { useDriveStore } from '@/store';
  import type { Drive } from '@/store';
  import type { CheckboxChangeEvent, CheckboxValueType } from 'ant-design-vue/es/checkbox/interface';

  defineOptions({
    name: 'CloudDriveSettings',
  });

  const driveStore = useDriveStore();

  const drives = computed(() => {
    return driveStore.getDrives;
  });

  const selectedKeys = ref([] as CheckboxValueType[]);

  const checkAll = ref(false);

  const indeterminate = ref(false);

  watch(
    () => selectedKeys,
    (val) => {
      const selected = val.value;
      driveStore.setSelected(selected as string[]);
      checkAll.value = selected.length === drives.value.length;
      indeterminate.value = selected.length > 0 && selected.length < drives.value.length;
    },
    { deep: true }
  );

  onMounted(() => {
    initSelectedDrives();
  });

  const handleCheckAllChange = (e: CheckboxChangeEvent) => {
    const checked = e.target.checked ? drives.value.map((item) => item.key) : [];
    selectedKeys.value = checked as unknown as CheckboxValueType[];
  };

  const initSelectedDrives = () => {
    const checked = driveStore.getSelectedKeys;
    selectedKeys.value = checked as unknown as CheckboxValueType[];
  };

  const handleDeleteDrive = (drive: Drive) => {
    driveStore.deleteDrive(drive);
    initSelectedDrives();
  };

  const drive = ref<Drive>({
    name: '',
    url: '',
    deletable: true,
  } as Drive);

  const rules = ref({
    name: [{ required: true, message: '请输入站点名称', trigger: 'change' }],
    url: [
      { required: true, message: '请输入站点地址', trigger: 'change' },
      { pattern: /^https?:\/\/.*/, message: '请输入正确的站点地址', trigger: 'change' },
    ],
  });

  const editDialogVisible = ref(false);

  const useForm = Form.useForm;

  const { resetFields, validate, validateInfos } = useForm(drive, rules);

  const handleAddDrive = () => {
    resetFields();
    editDialogVisible.value = true;
  };

  const handleAddDriveConfirm = () => {
    validate()
      .then(() => {
        // 生成站点编码
        drive.value.key = Math.random().toString(36).substring(2);
        driveStore.addDrive(Object.assign({}, drive.value));
        editDialogVisible.value = false;
      })
      .catch(() => {
        // ignore
      });
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
      <List bordered row-key="key" class="w-full">
        <template #header>
          <div class="flex items-center justify-between">
            <Checkbox v-model:checked="checkAll" :indeterminate="indeterminate" @change="handleCheckAllChange"
              >全选</Checkbox
            >
            <div class="flex items-center gap-2">
              <Tooltip>
                <template #title>添加云盘搜索站点</template>
                <Button @click="handleAddDrive">
                  <Plus class="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
          </div>
        </template>
        <CheckboxGroup v-model:value="selectedKeys">
          <ListItem v-for="item in drives" :key="item.key" class="w-full">
            <div class="flex flex-row items-center justify-between w-full">
              <div>
                <Checkbox :value="item.key" :key="item.key">
                  {{ item.name }}
                </Checkbox>
              </div>
              <div class="flex items-center justify-end gap-10">
                <div class="ml-2 text-xs text-gray-400">{{ item.url }}</div>
              </div>
            </div>
            <template #actions>
              <div class="flex items-center justify-center w-full">
                <Popconfirm v-if="item.deletable" title="确定要删除吗？" @confirm="handleDeleteDrive(item)">
                  <Button size="small" type="dashed" danger>
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </Popconfirm>
                <Tag v-else color="green">内置</Tag>
              </div>
            </template>
          </ListItem>
        </CheckboxGroup>
      </List>
    </div>
    <Modal title="添加站点" v-model:open="editDialogVisible" destroy-on-close @ok="handleAddDriveConfirm">
      <Form v-bind="formItemLayout">
        <FormItem label="站点名称" v-bind="validateInfos.name">
          <Input v-model:value="drive.name" allow-clear />
        </FormItem>
        <FormItem label="站点地址" v-bind="validateInfos.url">
          <Input v-model:value="drive.url" allow-clear />
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

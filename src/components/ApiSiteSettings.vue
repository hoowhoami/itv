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
  import { Trash2, HeartPulse, Plus } from 'lucide-vue-next';
  import { useSiteStore } from '@/store';
  import type { Site } from '@/store';
  import type { CheckboxChangeEvent, CheckboxValueType } from 'ant-design-vue/es/checkbox/interface';
  import { useProxy } from '@/hooks/useProxy';

  defineOptions({
    name: 'ApiSiteSettings',
  });

  const siteStore = useSiteStore();

  const sites = computed(() => {
    return siteStore.getSites;
  });

  const selectedKeys = ref([] as CheckboxValueType[]);

  const checkAll = ref(false);

  const indeterminate = ref(false);

  watch(
    () => selectedKeys,
    (val) => {
      const selected = val.value;
      siteStore.setSelected(selected as string[]);
      checkAll.value = selected.length === sites.value.length;
      indeterminate.value = selected.length > 0 && selected.length < sites.value.length;
    },
    { deep: true }
  );

  onMounted(() => {
    initSelectedSites();
  });

  const handleCheckAllChange = (e: CheckboxChangeEvent) => {
    const checked = e.target.checked ? sites.value.map((item) => item.key) : [];
    selectedKeys.value = checked as unknown as CheckboxValueType[];
  };

  const initSelectedSites = () => {
    const checked = siteStore.getSelectedKeys;
    selectedKeys.value = checked as unknown as CheckboxValueType[];
  };

  const handleDeleteSite = (site: Site) => {
    siteStore.deleteSite(site);
    initSelectedSites();
  };

  const site = ref<Site>({
    name: '',
    api: '',
    deletable: true,
  } as Site);

  const rules = ref({
    name: [{ required: true, message: '请输入站点名称', trigger: 'change' }],
    api: [
      { required: true, message: '请输入站点地址', trigger: 'change' },
      { pattern: /^https?:\/\/.*/, message: '请输入正确的站点地址', trigger: 'change' },
    ],
  });

  const editDialogVisible = ref(false);

  const useForm = Form.useForm;

  const { resetFields, validate, validateInfos } = useForm(site, rules);

  const handleAddSite = () => {
    resetFields();
    editDialogVisible.value = true;
  };

  const handleAddSiteConfirm = () => {
    validate()
      .then(() => {
        // 生成站点编码
        site.value.key = Math.random().toString(36).substring(2);
        siteStore.addSite(Object.assign({}, site.value));
        editDialogVisible.value = false;
      })
      .catch(() => {
        // ignore
      });
  };

  const testSpeedLoading = ref(false);

  const testSpeedResults = ref<Map<string, number | undefined>>(new Map<string, number | undefined>());

  const { fetchWithProxy } = useProxy();

  const handleTestSiteSpeed = async () => {
    // clear results
    testSpeedResults.value.clear();
    // get all selected
    const selectedSites = siteStore.getSelectedSites;
    if (selectedSites.value.length > 0) {
      testSpeedLoading.value = true;
      // test speed
      await Promise.all(
        selectedSites.value.map(async (site) => {
          if (site) {
            const targetUrl = `${site.api}/api.php/provide/vod/?ac=detail&wd=${encodeURIComponent('仙逆')}`;
            const startTime = performance.now();
            try {
              const response = await fetchWithProxy(targetUrl);
              if (!response.ok) throw new Error('Network response was not ok');
              await response.json();
              const endTime = performance.now();
              const responseTime = endTime - startTime;
              testSpeedResults.value?.set(site.key, responseTime);
            } catch {
              testSpeedResults.value?.set(site.key, undefined);
            }
          }
        })
      );
      testSpeedLoading.value = false;
    }
  };

  const speedTagColor = (speed: number | undefined) => {
    if (speed === undefined) return 'default';
    if (speed < 1000) return 'green';
    if (speed < 2000) return 'blue';
    if (speed < 3000) return 'orange';
    return 'red';
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
                <template #title>检测站点接口响应速度</template>
                <Button
                  @click="handleTestSiteSpeed"
                  :disabled="!selectedKeys || selectedKeys.length === 0"
                  :loading="testSpeedLoading"
                >
                  <HeartPulse class="h-4 w-4" />
                </Button>
              </Tooltip>
              <Tooltip>
                <template #title>添加站点</template>
                <Button @click="handleAddSite">
                  <Plus class="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
          </div>
        </template>
        <CheckboxGroup v-model:value="selectedKeys">
          <ListItem v-for="item in sites" :key="item.key" class="w-full">
            <div class="flex flex-row items-center justify-between w-full">
              <div>
                <Checkbox :value="item.key" :key="item.key">
                  {{ item.name }}
                </Checkbox>
              </div>
              <div class="flex items-center justify-end gap-10">
                <div class="ml-2 text-xs text-gray-400">{{ item.api }}</div>
                <Tag :color="speedTagColor(testSpeedResults.get(item.key))">{{
                  testSpeedResults.get(item.key) ? `${testSpeedResults.get(item.key)?.toFixed(0)}ms` : 'N/A'
                }}</Tag>
              </div>
            </div>
            <template #actions>
              <div class="flex items-center justify-center w-full">
                <Popconfirm v-if="item.deletable" title="确定要删除吗？" @confirm="handleDeleteSite(item)">
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
    <Modal title="添加站点" v-model:open="editDialogVisible" destroy-on-close @ok="handleAddSiteConfirm">
      <Form>
        <FormItem label="站点名称" v-bind="validateInfos.name">
          <Input v-model:value="site.name" allow-clear />
        </FormItem>
        <FormItem label="站点地址" v-bind="validateInfos.api">
          <Input v-model:value="site.api" allow-clear />
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

<script lang="ts" setup>
  import { watch, ref, onMounted } from 'vue';
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

  const sites = siteStore.getSites;

  const selected = ref([] as CheckboxValueType[]);

  const checkAll = ref(false);

  const indeterminate = ref(false);

  const handleCheckAllChange = (e: CheckboxChangeEvent) => {
    const checked = e.target.checked ? (sites as Site[]) : [];
    selected.value = checked as unknown as CheckboxValueType[];
  };

  const initSelectedSites = () => {
    const checked = siteStore.getSelectedSites;
    selected.value = checked as unknown as CheckboxValueType[];
  };

  const handleDeleteSite = (site: Site) => {
    siteStore.deleteSite(site);
    initSelectedSites();
  };

  const site = ref<Site>({
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

  const { fetchWithProxy } = useProxy();

  const handleTestSiteSpeed = async () => {
    console.log('test site speed');
    await Promise.all(
      (selected.value as unknown as Site[])?.map(async (site) => {
        const targetUrl = `${site.api}/api.php/provide/vod/?ac=detail&wd=${encodeURIComponent('仙逆')}`;
        const startTime = performance.now();
        try {
          const response = await fetchWithProxy(targetUrl);
          if (!response.ok) throw new Error('Network response was not ok');
          await response.json();
          const endTime = performance.now();
          const responseTime = endTime - startTime;
          site.speed = responseTime;
          siteStore.updateSite(site);
        } catch {
          site.speed = undefined;
          siteStore.updateSite(site);
        }
      })
    );
  };

  const speedTagColor = (speed: number | undefined) => {
    if (speed === undefined) return 'default';
    if (speed < 1000) return 'green';
    if (speed < 2000) return 'blue';
    if (speed < 3000) return 'orange';
    return 'red';
  };

  watch(
    () => selected,
    (val) => {
      siteStore.setSelected(val.value as unknown as Site[]);
      checkAll.value = val.value.length === sites.length;
      indeterminate.value = val.value.length > 0 && val.value.length < sites.length;
    },
    { deep: true }
  );

  onMounted(() => {
    initSelectedSites();
  });
</script>
<template>
  <div>
    <div class="mb-6">
      <List bordered row-key="name" class="w-full">
        <template #header>
          <div class="flex items-center justify-between">
            <Checkbox v-model:checked="checkAll" :indeterminate="indeterminate" @change="handleCheckAllChange"
              >全选</Checkbox
            >
            <div class="flex items-center gap-2">
              <Tooltip>
                <template #title>检测站点接口响应速度</template>
                <Button @click="handleTestSiteSpeed">
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
        <CheckboxGroup v-model:value="selected" class="w-full">
          <ListItem v-for="item in sites" :key="item.key" class="w-full">
            <Checkbox :value="item" style="width: 100%">
              <div class="flex items-center justify-between">
                <div>
                  {{ item.name }}
                </div>
                <div class="ml-2 text-xs text-gray-400">{{ item.api }}</div>
                <Tag :color="speedTagColor(item.speed)">{{ item.speed ? `${item.speed.toFixed(0)}ms` : 'N/A' }}</Tag>
              </div>
            </Checkbox>
            <template #actions>
              <Popconfirm v-if="item.deletable" title="确定要删除吗？" @confirm="handleDeleteSite(item)">
                <Button size="small" type="dashed" danger style="margin-right: 12px">
                  <Trash2 class="w-4 h-4" />
                </Button>
              </Popconfirm>
              <Tag v-else color="green">内置</Tag>
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
  :deep(.ant-checkbox-wrapper > span:not(.ant-checkbox)) {
    width: 100%;
  }
</style>

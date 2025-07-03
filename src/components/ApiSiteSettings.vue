<script lang="ts" setup>
  import { computed, defineOptions, watch, ref, onMounted } from 'vue';
  import { Button, CheckboxGroup, Checkbox, List, ListItem, Popconfirm } from 'ant-design-vue';
  import { Trash2, HeartPulse, Plus } from 'lucide-vue-next';
  import { Site, useSiteStore } from '@/store';
  import type { CheckboxChangeEvent, CheckboxValueType } from 'ant-design-vue/es/checkbox/interface';

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
    selected.value = checked as CheckboxValueType[];
  };

  const initSelectedSites = () => {
    const checked = siteStore.getSelectedSites;
    selected.value = checked as CheckboxValueType[];
  };

  const handleDeleteSite = (site: Site) => {
    siteStore.deleteSite(site);
    initSelectedSites();
  };

  watch(
    () => selected,
    (val) => {
      siteStore.setSelected(val.value as Site[]);
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
  <div class="mb-6">
    <div class="flex items-center justify-between">
      <Checkbox v-model:checked="checkAll" :indeterminate="indeterminate" @change="handleCheckAllChange">全选</Checkbox>
      <div class="flex items-center gap-2">
        <Button>
          <HeartPulse class="h-4 w-4" />
        </Button>
        <Button>
          <Plus class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <div class="mt-2">
      <CheckboxGroup v-model:value="selected" style="width: 100%">
        <List bordered :data-source="sites" row-key="name" style="width: 100%">
          <template #renderItem="{ item }">
            <ListItem>
              <Checkbox :value="item" style="width: 100%">
                <div class="flex items-center justify-between">
                  <div>
                    {{ item.name }}
                  </div>
                  <div class="ml-2 text-xs text-gray-400">{{ item.url }}</div>
                </div>
              </Checkbox>
              <template #actions v-if="item.url">
                <Popconfirm title="确定要删除吗？" ok-text="确定" cancel-text="取消" @confirm="handleDeleteSite(item)">
                  <Button danger>
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </Popconfirm>
              </template>
            </ListItem>
          </template>
        </List>
      </CheckboxGroup>
    </div>
  </div>
</template>
<style scoped>
  :deep(.ant-checkbox-wrapper > span:not(.ant-checkbox)) {
    width: 100%;
  }
</style>

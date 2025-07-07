# Tabs 组件使用说明

## 概述

Tabs 组件现在支持**标签页插槽**功能：
- 自定义标签页标题的显示内容，支持图标、计数、状态指示器等复杂内容
- 可以根据标签页的激活状态显示不同的样式

## 基本用法

### 方式1: 使用 TabPanel 组件

```vue
<template>
  <Tabs v-model:activeKey="activeKey">
    <TabPanel tab="tab1" label="标签1">
      <div>标签1的内容</div>
    </TabPanel>
    <TabPanel tab="tab2" label="标签2">
      <div>标签2的内容</div>
    </TabPanel>
  </Tabs>
</template>
```

### 方式2: 使用标签页插槽

```vue
<template>
  <Tabs v-model:activeKey="activeKey">
    <TabPanel tab="movies" label="电影">
      <div>电影内容</div>
    </TabPanel>
    <TabPanel tab="cloud" label="网盘">
      <div>网盘内容</div>
    </TabPanel>

    <!-- 自定义标签页标题 -->
    <template #movies-tab="{ tab, active }">
      <div class="flex items-center gap-2">
        <span>🎬</span>
        <span>{{ tab.label }}</span>
        <span class="badge">{{ movieCount }}</span>
        <span v-if="active">✓</span>
      </div>
    </template>

    <template #cloud-tab="{ tab, active }">
      <div class="flex items-center gap-2">
        <span>☁️</span>
        <span>{{ tab.label }}</span>
        <span class="badge">{{ cloudCount }}</span>
      </div>
    </template>
  </Tabs>
</template>
```

## API

### Tabs Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| v-model:activeKey | string | - | 当前激活的标签页 key |

### TabPanel Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| tab | string | - | 标签页的唯一标识 |
| label | string | tab | 标签页显示的文本 |

### 插槽

#### 默认插槽

用于放置 TabPanel 组件。

#### 标签页插槽

- **插槽名**: `{tab-key}-tab`，其中 `{tab-key}` 对应 TabPanel 的 `tab` 属性值
- **插槽参数**: `{ tab, active }` - 包含当前标签页的信息和激活状态

```vue
<template #movies-tab="{ tab, active }">
  <div class="flex items-center gap-2">
    <span>🎬</span>
    <span>{{ tab.label }}</span>
    <span v-if="active" class="active-indicator">●</span>
  </div>
</template>
```

**插槽参数说明:**

- `tab.key`: 标签页的唯一标识
- `tab.label`: 标签页的显示文本
- `active`: 当前标签页是否为激活状态（boolean）

## 响应式支持

TabPanel 的 `label` 属性支持响应式数据，当数据变化时标签文本会自动更新：

```vue
<template>
  <Tabs v-model:activeKey="activeKey">
    <TabPanel tab="movies" :label="`电影 (${movieCount})`">
      <!-- 内容 -->
    </TabPanel>
  </Tabs>
</template>

<script setup>
import { ref } from 'vue';
const movieCount = ref(0); // 当这个值变化时，标签文本会自动更新
</script>
```

## 注意事项

1. 每个 TabPanel 的 `tab` 属性必须唯一
2. 标签页插槽名格式为 `{tab-key}-tab`，必须与 TabPanel 的 `tab` 属性值匹配
3. 如果没有提供标签页插槽，会显示 TabPanel 的 `label` 属性值
4. 标签页插槽支持响应式数据，可以动态显示计数、状态等信息

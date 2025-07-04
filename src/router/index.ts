// src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import AppearanceSettings from '@/components/AppearanceSettings.vue';
import CloudDriveSettings from '@/components/CloudDriveSettings.vue';
import HistoryPage from '@/pages/HistoryPage.vue';
import PageNotFound from '@/pages/NotFound.vue';
import HomePage from '@/pages/HomePage.vue';

const routes = [
  {
    path: '/',
    name: 'MainLayout',
    component: MainLayout,
    children: [
      {
        path: '', // 默认子路由，访问根路径时显示
        name: 'Home',
        component: HomePage,
      },
      {
        path: 'appearance-settings',
        name: 'AppearanceSettings',
        component: AppearanceSettings,
      },
      {
        path: 'cloud-drive-settings',
        name: 'CloudDriveSettings',
        component: CloudDriveSettings,
      },
      {
        path: 'history',
        name: 'History',
        component: HistoryPage,
      },
    ],
  },
  // 404 错误处理
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: PageNotFound,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  console.log('route to', to.path);
  next();
});

export default router;

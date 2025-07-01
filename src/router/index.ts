// src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router';
import HomePage from '@/pages/HomePage.vue';
import AppearanceSettings from '@/components/AppearanceSettings.vue';
import CloudDriveSettings from '@/components/CloudDriveSettings.vue';
import AISpeedTestPage from '@/pages/AISpeedTestPage.vue';
import AIModelSettings from '@/components/AIModelSettings.vue';
import HistoryPage from '@/pages/HistoryPage.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomePage,
    },
    {
        path: '/appearance-settings',
        name: 'AppearanceSettings',
        component: AppearanceSettings,
    },
    {
        path: '/cloud-drive-settings',
        name: 'CloudDriveSettings',
        component: CloudDriveSettings,
    },
    {
        path: '/ai-speed-test',
        name: 'AISpeedTest',
        component: AISpeedTestPage,
    },
    {
        path: '/ai-model-settings',
        name: 'AIModelSettings',
        component: AIModelSettings,
    },
    {
        path: '/history',
        name: 'History',
        component: HistoryPage,
    },
    // 404 错误处理
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/pages/NotFound.vue'),
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    console.log('路由导航:', from.path, '->', to.path);
    next();
});

export default router;
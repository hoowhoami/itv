import { createApp } from 'vue';
import App from './App.vue';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import './styles/index.css';
import router from './router';
import { createPinia } from 'pinia';

const app = createApp(App);
app.use(Antd);
app.use(router); // 使用路由
const pinia = createPinia();
app.use(pinia);
app.mount('#app');

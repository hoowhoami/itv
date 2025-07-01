import { createApp } from 'vue';
import App from './App.vue';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import "./index.css";
import router from './router'; // 导入路由配置

const app = createApp(App);
app.use(Antd);
app.use(router); // 使用路由
app.mount('#app');
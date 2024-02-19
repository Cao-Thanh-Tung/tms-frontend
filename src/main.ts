import { createApp } from 'vue'
import '@/style.css'
import Ant from 'ant-design-vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import axios from 'axios';
export * from "@/api";
export * from "@/configuration";
const baseUrl = import.meta.env.VITE_BASE_URL;
axios.defaults.baseURL = baseUrl;
createApp(App).use(store).use(router).use(Ant).mount('#app')


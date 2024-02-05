import { createApp } from 'vue'
import '@/style.css'
import Ant from 'ant-design-vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import axios from 'axios';
export * from "@/api";
export * from "@/configuration";
import { BASE_URL } from '@/config';
axios.defaults.baseURL = BASE_URL;
createApp(App).use(store).use(router).use(Ant).mount('#app')


import { createApp } from 'vue'
import '@/style.css'
import Ant from 'ant-design-vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
createApp(App).use(store).use(router).use(Ant).mount('#app')


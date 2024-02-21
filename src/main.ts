import {createApp} from 'vue'
import './style.css'
import App from './App.vue'

export * from "./api";
export * from "./configuration";

createApp(App).mount('#app')

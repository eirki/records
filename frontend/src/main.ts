import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import ContextMenu from '@imengyu/vue3-context-menu'

import Toast, { PluginOptions, POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";

import { createApp } from 'vue'
import App from './App.vue'

const ToastOptions: PluginOptions = {
    position: POSITION.BOTTOM_LEFT,
    icon: false,
    showCloseButtonOnHover: true,
    hideProgressBar: true,
    toastClassName: "custom-toast",
    transition: "",
    timeout: 1000,
    maxToasts: 1,
};
createApp(App).use(ContextMenu).use(Toast, ToastOptions).mount('#app')

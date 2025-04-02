import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import store from './stores'
import permission from './directives/permission'
import { setupErrorHandler } from './utils/error-handler'
import './styles/index.scss'

// 添加ResizeObserver错误处理
const originalError = window.console.error;
window.console.error = (...args) => {
  if (
    args.length > 0 && 
    typeof args[0] === 'string' && 
    args[0].includes('ResizeObserver loop')
  ) {
    // 忽略ResizeObserver循环错误
    return;
  }
  originalError.apply(window.console, args);
};

const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册全局异常处理
setupErrorHandler(app)

app.use(ElementPlus)
app.use(router)
app.use(store)
app.use(permission)

app.mount('#app')

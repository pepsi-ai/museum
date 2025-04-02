import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 路由配置
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/register/index.vue'),
    meta: { title: '注册', requiresAuth: false }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layout/index.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: { title: '首页', requiresAuth: false }
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/user/index.vue'),
        meta: { title: '个人中心', requiresAuth: true }
      },
      {
        path: 'exhibition',
        name: 'ExhibitionList',
        component: () => import('@/views/exhibition/index.vue'),
        meta: { title: '展览预约', requireAuth: false }
      },
      {
        path: 'exhibition/detial/:id',
        name: 'ExhibitionDetail',
        component: () => import('@/views/exhibition/detial.vue'),
        meta: { title: '展览详情', requireAuth: false }
      },
      {
        path: '/collection',
        name: 'Collection',
        component: () => import('@/views/collection/index.vue'),
        meta: { title: '馆藏珍品', requireAuth: false, key: 'collection' }
      },
      {
        path: '/collection/detail/:id',
        name: 'CollectionDetail',
        component: () => import('@/views/collection/detail.vue'),
        meta: { title: '藏品详情', requireAuth: false, key: 'collection' }
      }
    ]
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', requiresAuth: false }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 不需要登录就可以访问的白名单路径
const whiteList = ['/login', '/register', '/', '/home', '/404']

// 配置NProgress
NProgress.configure({ showSpinner: false })

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  // 开始进度条
  NProgress.start()
  
  // 设置页面标题
  const title = to.meta.title
  if (title) {
    document.title = `${title} - 博物馆预约系统`
  }
  
  const userStore = useUserStore()
  const hasToken = userStore.token
  
  if (hasToken) {
    if (to.path === '/login') {
      // 已登录状态访问登录页，重定向到首页
      next({ path: '/' })
      NProgress.done()
    } else {
      // 已登录状态，检查是否有用户信息
      if (!userStore.userInfo) {
        try {
          // 获取用户信息
          await userStore.getUserInfoAction()
          next()
        } catch (error) {
          // 获取用户信息失败，可能是token过期，清除用户信息并重新登录
          await userStore.logoutAction()
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      } else {
        next()
      }
    }
  } else {
    // 未登录状态
    if (whiteList.includes(to.path) || !to.meta.requiresAuth) {
      // 白名单路径或不需要登录的页面，直接访问
      next()
    } else {
      // 其他路径重定向到登录页
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

// 路由后置守卫
router.afterEach(() => {
  // 结束进度条
  NProgress.done()
})

export default router 
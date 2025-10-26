import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import NProgress from 'nprogress'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/',
      component: () => import('@/views/Layout.vue'),
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/Dashboard.vue'),
          meta: { title: '数据面板', icon: 'DataAnalysis' }
        },
        {
          path: 'carousel',
          name: 'carousel',
          component: () => import('@/views/Carousel.vue'),
          meta: { title: '轮播图管理', icon: 'Picture' }
        },
        {
          path: 'category',
          name: 'category',
          component: () => import('@/views/Category.vue'),
          meta: { title: '分类管理', icon: 'Menu' }
        },
        {
          path: 'goods',
          name: 'goods',
          component: () => import('@/views/Goods.vue'),
          meta: { title: '商品管理', icon: 'ShoppingCart' }
        },
        {
          path: 'goods/add',
          name: 'goodsAdd',
          component: () => import('@/views/GoodsAdd.vue'),
          meta: { title: '添加商品', hidden: true }
        },
        {
          path: 'goods/edit/:id',
          name: 'goodsEdit',
          component: () => import('@/views/GoodsEdit.vue'),
          meta: { title: '编辑商品', hidden: true }
        },
        {
          path: 'index-config',
          name: 'indexConfig',
          component: () => import('@/views/IndexConfig.vue'),
          meta: { title: '首页配置', icon: 'Setting' }
        },
        {
          path: 'order',
          name: 'order',
          component: () => import('@/views/Order.vue'),
          meta: { title: '订单管理', icon: 'DocumentCopy' }
        },
        {
          path: 'order/:id',
          name: 'orderDetail',
          component: () => import('@/views/OrderDetail.vue'),
          meta: { title: '订单详情', hidden: true }
        },
        {
          path: 'user',
          name: 'user',
          component: () => import('@/views/User.vue'),
          meta: { title: '用户管理', icon: 'User' }
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/Profile.vue'),
          meta: { title: '个人信息', icon: 'UserFilled' }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('@/views/NotFound.vue'),
      meta: { title: '404' }
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  NProgress.start()
  
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - NewBee Mall 后台管理系统` : 'NewBee Mall 后台管理系统'
  
  const userStore = useUserStore()
  
  // 白名单路由
  const whiteList = ['/login']
  
  if (whiteList.includes(to.path)) {
    // 已登录用户访问登录页，重定向到首页
    if (userStore.isLoggedIn) {
      next('/')
    } else {
      next()
    }
  } else {
    // 需要登录的路由
    if (userStore.isLoggedIn) {
      next()
    } else {
      next('/login')
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router

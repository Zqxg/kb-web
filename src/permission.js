import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/register', '/getCaptcha', '/auth-redirect'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // 如果已经登录，且目标路径为登录页，重定向到首页
      next({ path: '/' })
      NProgress.done() // hack: https://github.com/PanJiaChen/vue-element-admin/pull/2939
    } else {
      // 确保没有重复跳转
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      console.log('store.getters.roles: ', store.getters.roles)
      console.log('store.getters.roles.length: ', store.getters.roles.length)
      console.log('hasRoles: ', hasRoles)
      if (hasRoles) {
        next()
      } else {
        try {
          // 获取用户信息和权限信息
          // const { roles } =
          await store.dispatch('user/getUserInfo')
          // 根据权限角色生成可访问的路由
          const accessRoutes = await store.dispatch('permission/generateRoutes', store.getters.roles)
          // 动态添加可访问的路由
          router.addRoutes(accessRoutes)
          // 确保路由添加完成后再进行跳转
          next({ ...to, replace: true })
        } catch (error) {
          // 捕获错误，重置 token 并跳转到登录页
          // await store.dispatch('user/resetToken')
          console.log('error: ', error)
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    // if not logged in

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})

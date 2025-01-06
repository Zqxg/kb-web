import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // 不需要 Token 的接口列表
    const noTokenRequired = ['/login', '/getCaptcha', '/register'] // 根据你的需求来添加接口路径

    // 判断请求路径是否包含在 noTokenRequired 列表中
    if (store.getters.token && !noTokenRequired.includes(config.url)) {
      // 如果有 token 且当前请求不在 noTokenRequired 中，则添加 Token
      config.headers['X-Token'] = getToken()
    }

    return config
  },
  error => {
    console.log(error) // for debug
    return Promise.reject(error) // 继续处理错误
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * 这里直接处理返回的响应数据
   */
  response => {
    const res = response.data

    // 判断返回的 code 是否不等于 0
    if (res.code !== 0) {
      // 如果 code 不等于 0，说明发生了错误，弹出错误消息
      Message({
        message: res.message || '操作失败',
        type: 'error',
        duration: 5 * 1000
      })

      // 可以在这里根据实际需求做更多的处理，比如跳转登录页面、清除 Token 等
      // 例如：
      // if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
      //   store.dispatch('user/resetToken').then(() => {
      //     location.reload();
      //   });
      // }

      return Promise.reject(new Error(res.message || '操作失败')) // 返回错误
    } else {
      // 如果 code 为 0，表示请求成功，直接返回数据
      return res
    }
  },
  error => {
    console.log('response error:', error) // 打印错误信息

    // 出现错误时弹出消息
    Message({
      message: error.message || '请求失败',
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error) // 继续返回错误
  }
)


export default service

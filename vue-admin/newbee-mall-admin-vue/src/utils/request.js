import axios from 'axios'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import router from '@/router'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    NProgress.start()
    
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['X-Access-Token'] = token
    }
    
    return config
  },
  error => {
    NProgress.done()
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    NProgress.done()
    
    const res = response.data
    
    // 根据后端返回的 code 判断请求是否成功
    if (res.code === 200) {
      return res
    }
    
    // 处理特殊错误码
    if (res.code === 416) {
      // token 失效
      ElMessage.error('登录已过期，请重新登录')
      localStorage.removeItem('token')
      router.push('/login')
      return Promise.reject(new Error(res.message || '登录已过期'))
    }
    
    // 其他错误
    ElMessage.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  error => {
    NProgress.done()
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          localStorage.removeItem('token')
          router.push('/login')
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求地址出错')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error('网络错误')
      }
    } else {
      ElMessage.error('网络连接失败')
    }
    
    return Promise.reject(error)
  }
)

export default request

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, logout, getProfile } from '@/utils/api'
import { ElMessage } from 'element-plus'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref({})

  const isLoggedIn = computed(() => !!token.value)

  // 登录
  const userLogin = async (loginForm) => {
    try {
      const res = await login(loginForm)
      if (res.code === 200) {
        token.value = res.data.token
        userInfo.value = res.data.userInfo
        localStorage.setItem('token', res.data.token)
        ElMessage.success('登录成功')
        router.push('/')
        return true
      }
    } catch (error) {
      ElMessage.error(error.message || '登录失败')
      return false
    }
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const res = await getProfile()
      if (res.code === 200) {
        userInfo.value = res.data
        return true
      }
    } catch (error) {
      // token 失效，清除登录状态
      userLogout()
      return false
    }
  }

  // 退出登录
  const userLogout = async () => {
    try {
      await logout()
    } catch (error) {
      // 忽略退出接口错误
    }
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    router.push('/login')
  }

  // 修改密码后需要重新登录
  const clearLoginStatus = () => {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    userLogin,
    getUserInfo,
    userLogout,
    clearLoginStatus
  }
})

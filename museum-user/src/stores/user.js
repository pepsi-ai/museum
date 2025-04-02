import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, logout, getUserInfo, getUserDetailInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { getUserInfo as getStorageUserInfo, setUserInfo as setStorageUserInfo, removeUserInfo as removeStorageUserInfo } from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
  // 用户token
  const token = ref(localStorage.getItem('token') || '')
  // 用户信息
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo')) || null)
  // 登录状态
  const isLogin = ref(!!token.value)

  // 设置token
  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
    isLogin.value = true
  }

  // 清除token
  const clearToken = () => {
    token.value = ''
    localStorage.removeItem('token')
    isLogin.value = false
  }

  // 设置用户信息
  const setUserInfo = (info) => {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  // 清除用户信息
  const clearUserInfo = () => {
    userInfo.value = null
    localStorage.removeItem('userInfo')
  }

  // 登录操作
  const loginAction = async (loginForm) => {
    try {
      const res = await login(loginForm)
      console.log('登录响应：', res)
      
      if (res.code === 200 && res.data) {
        // 直接从response中获取token和用户信息
        const userData = res.data
        
        // 将用户ID作为token保存
        if (userData.id) {
          setToken(String(userData.id))
        }
        
        // 保存用户信息
        setUserInfo(userData)
        
        return res
      }
      return Promise.reject(new Error(res.msg || '登录失败'))
    } catch (error) {
      console.error('登录API调用失败:', error)
      return Promise.reject(error)
    }
  }

  // 获取用户信息
  const getUserInfoAction = async () => {
    try {
      if (!token.value) {
        return null
      }
      
      // 如果已经有用户信息，直接返回
      if (userInfo.value) {
        return userInfo.value
      }
      
      const res = await getUserInfo()
      if (res.code === 200 && res.data) {
        setUserInfo(res.data)
        return res.data
      }
      return null
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }

  // 获取用户详细信息（包含手机号和注册时间）
  const getUserDetailAction = async () => {
    try {
      console.log('准备获取用户详细信息，当前用户状态:', {
        tokenExists: !!token.value,
        userInfoExists: !!userInfo.value,
        userId: userInfo.value?.id
      })
      
      if (!token.value || !userInfo.value || !userInfo.value.id) {
        console.warn('无法获取用户详细信息：缺少token或用户ID')
        return null
      }
      
      console.log(`正在调用API获取用户ID为${userInfo.value.id}的详细信息`)
      const res = await getUserDetailInfo(userInfo.value.id)
      console.log('API响应结果:', res)
      
      if (res.code === 200 && res.data) {
        // 从分页结果中提取用户数据
        let userData = null
        
        // 检查res.data本身是否就是用户数据
        if (res.data.id && res.data.id === userInfo.value.id) {
          userData = res.data
          console.log('直接从响应中获取到用户数据')
        } 
        // 检查分页结构中的records数组
        else if (res.data.records && res.data.records.length > 0) {
          // 确保找到的用户ID与当前用户ID匹配
          const userRecord = res.data.records.find(record => record.id === userInfo.value.id)
          if (userRecord) {
            userData = userRecord
            console.log('从records数组中获取到匹配的用户数据')
          } else {
            console.warn('records数组中没有找到当前用户ID的记录')
          }
        } 
        // 检查分页结构中的list数组
        else if (res.data.list && res.data.list.length > 0) {
          // 确保找到的用户ID与当前用户ID匹配
          const userItem = res.data.list.find(item => item.id === userInfo.value.id)
          if (userItem) {
            userData = userItem
            console.log('从list数组中获取到匹配的用户数据')
          } else {
            console.warn('list数组中没有找到当前用户ID的记录')
          }
        } else {
          console.warn('API返回了成功状态，但未找到用户数据:', res.data)
        }
        
        if (userData) {
          console.log('获取到的用户详细信息:', userData)
          // 合并新旧用户信息
          const updatedUserInfo = { ...userInfo.value, ...userData }
          console.log('更新后的用户信息:', updatedUserInfo)
          setUserInfo(updatedUserInfo)
          return updatedUserInfo
        }
      } else {
        console.warn('API请求失败或返回空数据:', res)
      }
      
      return userInfo.value
    } catch (error) {
      console.error('获取用户详细信息失败:', error)
      return userInfo.value
    }
  }

  // 退出登录
  const logoutAction = async () => {
    try {
      if (token.value) {
        await logout()
      }
      clearToken()
      clearUserInfo()
    } catch (error) {
      console.error('退出登录失败:', error)
      // 即使API调用失败也清除本地状态
      clearToken()
      clearUserInfo()
    }
  }

  return {
    token,
    userInfo,
    isLogin,
    loginAction,
    logoutAction,
    getUserInfoAction,
    getUserDetailAction
  }
}) 
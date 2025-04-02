const app = getApp()

Page({
  data: {
    phone: '', // 用户手机号
    isVerified: false, // 实名认证状态
    notificationEnabled: true, // 消息通知状态
    locationEnabled: true, // 定位服务状态
    cacheSize: '0MB', // 缓存大小
    versionInfo: 'V1.0.0' // 版本信息
  },

  onLoad() {
    // 获取缓存大小
    this.getCacheSize()
    
    // 获取本地存储的设置
    this.getLocalSettings()
    
    // 获取版本信息
    this.getVersionInfo()
  },
  
  onShow() {
    // 获取用户信息
    this.getUserInfo()
  },
  
  // 获取用户信息
  getUserInfo() {
    // 从本地存储获取用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      return
    }
    
    // 直接使用本地存储的用户信息先显示
    console.log('使用本地存储的用户信息:', userInfo)
    this.setData({
      phone: userInfo.mobile ? this.formatPhone(userInfo.mobile) : '未绑定',
      isVerified: userInfo.idCard ? true : false
    })
    
    // 调用新的API获取最新用户信息
    this.fetchLatestUserProfile(userInfo.id)
  },
  
  // 获取最新的用户资料信息
  fetchLatestUserProfile(userId) {
    const app = getApp()
    const baseUrl = app.globalData.baseUrl
    
    // 调用API，注意这里不再使用/api前缀
    wx.request({
      url: `${baseUrl}/user/getUserProfile`,
      method: 'POST',
      data: {
        userId: userId
      },
      success: (res) => {
        console.log('获取用户资料响应:', res.data)
        if (res.data.code === 200 && res.data.data) {
          const userData = res.data.data
          
          // 更新本地存储的用户信息
          const userInfo = wx.getStorageSync('userInfo')
          const updatedUserInfo = {...userInfo, ...userData}
          wx.setStorageSync('userInfo', updatedUserInfo)
          
          // 更新UI显示
          this.setData({
            phone: userData.mobile ? this.formatPhone(userData.mobile) : '未绑定',
            isVerified: userData.hasVerified
          })
        } else {
          console.warn('获取用户资料失败:', res.data.message || '未知错误')
        }
      },
      fail: (err) => {
        console.error('获取用户资料请求失败:', err)
      }
    })
  },
  
  // 格式化手机号码，显示为 133****8888 格式
  formatPhone(phone) {
    if (!phone || phone.length !== 11) {
      return phone
    }
    return phone.substring(0, 3) + '****' + phone.substring(7)
  },
  
  // 获取本地存储的设置
  getLocalSettings() {
    const notificationEnabled = wx.getStorageSync('notificationEnabled')
    const locationEnabled = wx.getStorageSync('locationEnabled')
    
    this.setData({
      notificationEnabled: notificationEnabled === '' ? true : notificationEnabled,
      locationEnabled: locationEnabled === '' ? true : locationEnabled
    })
  },
  
  // 获取版本信息
  getVersionInfo() {
    const accountInfo = wx.getAccountInfoSync()
    const version = accountInfo.miniProgram.version || '1.0.0'
    
    this.setData({
      versionInfo: 'V' + version
    })
  },
  
  // 获取缓存大小
  getCacheSize() {
    wx.getStorageInfo({
      success: (res) => {
        const sizeInMB = (res.currentSize / 1024).toFixed(2)
        this.setData({
          cacheSize: sizeInMB + 'MB'
        })
      }
    })
  },
  
  // 导航到其他页面
  navigateTo(e) {
    const url = e.currentTarget.dataset.url
    wx.navigateTo({ url })
  },
  
  // 切换消息通知
  toggleNotification(e) {
    const value = e.detail.value
    this.setData({ notificationEnabled: value })
    wx.setStorageSync('notificationEnabled', value)
    
    // 如果关闭通知，可能需要调用取消订阅的API
    if (!value) {
      // TODO: 取消订阅消息的API调用
    }
  },
  
  // 切换定位服务
  toggleLocation(e) {
    const value = e.detail.value
    this.setData({ locationEnabled: value })
    wx.setStorageSync('locationEnabled', value)
    
    // 如果开启定位，可能需要获取权限
    if (value) {
      this.checkLocationPermission()
    }
  },
  
  // 检查定位权限
  checkLocationPermission() {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => {
              // 用户已授权
            },
            fail: () => {
              // 用户拒绝授权，引导用户打开设置
              wx.showModal({
                title: '定位权限',
                content: '请在设置中开启定位权限',
                confirmText: '去设置',
                success: (res) => {
                  if (res.confirm) {
                    wx.openSetting()
                  } else {
                    // 用户拒绝打开设置，将开关关闭
                    this.setData({ locationEnabled: false })
                    wx.setStorageSync('locationEnabled', false)
                  }
                }
              })
            }
          })
        }
      }
    })
  },
  
  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除浏览历史和收藏缓存数据
          const keys = ['viewHistory']
          
          // 保留用户登录信息和设置
          keys.forEach(key => {
            wx.removeStorageSync(key)
          })
          
          // 重新获取缓存大小
          this.getCacheSize()
          
          wx.showToast({
            title: '缓存已清除',
            icon: 'success'
          })
        }
      }
    })
  },
  
  // 退出登录
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除用户登录信息
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('token')
          
          // 更新全局登录状态
          app.globalData.isLogin = false
          
          // 返回到登录页
          wx.reLaunch({
            url: '/pages/login/index'
          })
        }
      }
    })
  }
}) 
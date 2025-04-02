const app = getApp()

Page({
  data: {
    phone: '',
    password: '',
    verifyCode: '',
    captchaText: '8A2X', // 验证码文本
    showPassword: false,
    remember: false,
    redirectUrl: '/pages/user/index' // 默认登录成功后跳转到个人中心
  },

  onLoad(options) {
    this.generateCaptcha()
    
    // 获取重定向URL
    if (options.redirect) {
      this.setData({
        redirectUrl: decodeURIComponent(options.redirect)
      })
    }
  },

  // 生成验证码
  generateCaptcha() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let captcha = ''
    for (let i = 0; i < 4; i++) {
      captcha += chars[Math.floor(Math.random() * chars.length)]
    }
    this.setData({ captchaText: captcha })
  },

  // 切换密码显示
  togglePasswordVisibility() {
    this.setData({
      showPassword: !this.data.showPassword
    })
  },

  // 切换记住登录
  toggleRemember() {
    this.setData({
      remember: !this.data.remember
    })
  },

  // 登录处理
  onLogin() {
    const { phone, password } = this.data

    // 表单验证
    if (!phone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return
    }

    if (!password) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      })
      return
    }

    // 调用登录接口
    wx.request({
      url: `${app.globalData.baseUrl}/user/login`,
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        username: phone,
        password
      },
      success: (res) => {
        if (res.data.code === 200) {
          // 登录成功，从响应中获取用户数据
          const loginResponse = res.data.data
          
          console.log('登录响应数据:', loginResponse) // 调试输出
          
          // 假设登录响应包含token和用户信息
          let token, userInfo;
          
          // 根据返回的数据结构处理
          if (typeof loginResponse === 'string') {
            // 如果只返回了token字符串
            token = loginResponse
            userInfo = {
              id: phone, // 确保有id字段
              username: phone,
              phone: phone
            }
          } else if (typeof loginResponse === 'object') {
            // 如果返回了对象
            if (loginResponse.token) {
              // 有token字段的情况
              token = loginResponse.token
              userInfo = loginResponse.userInfo || {
                id: loginResponse.userId || phone,
                username: loginResponse.username || phone,
                phone: phone
              }
            } else {
              // 整个对象就是用户信息（后端直接返回MsUser对象）
              userInfo = loginResponse
              // 使用id作为token
              token = userInfo.id ? String(userInfo.id) : phone
            }
          }
          
          // 防止userInfo为null或undefined
          if (!userInfo) {
            userInfo = {
              id: phone,
              username: phone,
              phone: phone
            }
          }
          
          // 确保用户ID存在且为字符串类型
          if (userInfo.id === undefined || userInfo.id === null) {
            userInfo.id = phone
          } else if (typeof userInfo.id === 'number') {
            // 将数字ID转为字符串以保持一致性
            userInfo.id = String(userInfo.id)
          }
          
          console.log('处理后的用户信息:', userInfo)
          console.log('用户ID:', userInfo.id)
          
          // 保存token
          wx.setStorageSync('token', token)
          
          // 明确保存userId
          const userId = userInfo.id
          wx.setStorageSync('userId', userId)
          
          // 保存用户信息到全局数据
          app.globalData.userInfo = userInfo
          app.globalData.isLogin = true
          app.globalData.userId = userId
          
          // 保存到本地存储
          wx.setStorageSync('userInfo', userInfo)
          
          if (this.data.remember) {
            wx.setStorageSync('loginInfo', {
              phone,
              password
            })
          } else {
            wx.removeStorageSync('loginInfo')
          }
          
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          })
          
          // 验证保存的数据
          console.log('验证保存的数据:', {
            globalUserInfo: app.globalData.userInfo,
            globalUserId: app.globalData.userId,
            storedUserInfo: wx.getStorageSync('userInfo'),
            storedUserId: wx.getStorageSync('userId')
          })
          
          // 根据redirectUrl判断跳转方式
          setTimeout(() => {
            console.log('准备跳转到:', this.data.redirectUrl) // 调试输出
            
            // 判断是否是Tab页面
            const tabPages = ['/pages/index/index', '/pages/collection/index', '/pages/user/index']
            
            if (tabPages.includes(this.data.redirectUrl)) {
              wx.switchTab({
                url: this.data.redirectUrl
              })
            } else {
              wx.navigateTo({
                url: this.data.redirectUrl
              })
            }
          }, 1500)
        } else {
          wx.showToast({
            title: res.data.msg || '用户名或密码错误',
            icon: 'none'
          })
        }
      },
      fail: (error) => {
        console.error('登录失败:', error)
        wx.showToast({
          title: '登录失败，请稍后重试',
          icon: 'none'
        })
      }
    })
  },

  // 忘记密码
  onForgetPassword() {
    wx.navigateTo({
      url: '/pages/forget-password/index'
    })
  },

  // 用户协议
  onUserAgreement() {
    wx.navigateTo({
      url: '/pages/agreement/user'
    })
  },

  // 隐私政策
  onPrivacyPolicy() {
    wx.navigateTo({
      url: '/pages/agreement/privacy'
    })
  }
}) 
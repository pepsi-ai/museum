Page({
  data: {
    isVerified: false,    // 是否已认证
    realName: '',         // 真实姓名
    idCard: '',           // 身份证号
    idCardFormat: '',     // 格式化后的身份证号（隐藏中间部分）
    submitDisabled: true  // 提交按钮是否禁用
  },

  onLoad() {
    this.getUserVerifyInfo()
  },

  // 获取用户认证信息
  getUserVerifyInfo() {
    // 从本地存储获取用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.id) {
      return
    }
    
    // 检查本地存储中是否已有身份证信息
    if (userInfo.idCard) {
      // 直接使用本地存储中的认证信息
      console.log('使用本地存储中的认证信息')
      this.setData({
        isVerified: true,
        realName: userInfo.nickname || userInfo.username || '',
        idCardFormat: this.formatIdCard(userInfo.idCard)
      })
      return // 已有信息，无需请求后端
    }
    
    // 调用新API获取用户最新资料
    this.fetchUserProfile(userInfo.id)
  },
  
  // 获取用户资料
  fetchUserProfile(userId) {
    const app = getApp()
    const baseUrl = app.globalData.baseUrl
    
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    
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
          
          // 如果已认证，显示认证信息
          if (userData.idCard) {
            // 更新本地存储
            const userInfo = wx.getStorageSync('userInfo')
            const updatedUserInfo = {...userInfo, 
              idCard: userData.idCard, 
              nickname: userData.nickname || userData.username
            }
            wx.setStorageSync('userInfo', updatedUserInfo)
            
            this.setData({
              isVerified: true,
              realName: userData.nickname || userData.username,
              idCardFormat: this.formatIdCard(userData.idCard)
            })
          }
        }
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  // 格式化身份证号，显示为 110101********1234 格式
  formatIdCard(idCard) {
    if (!idCard || idCard.length < 18) {
      return idCard
    }
    return idCard.substring(0, 6) + '********' + idCard.substring(14)
  },

  // 监听姓名输入
  onRealNameInput(e) {
    this.setData({
      realName: e.detail.value
    })
    this.checkFormValid()
  },

  // 监听身份证号输入
  onIdCardInput(e) {
    this.setData({
      idCard: e.detail.value
    })
    this.checkFormValid()
  },

  // 检查表单是否有效
  checkFormValid() {
    const { realName, idCard } = this.data
    
    // 检查姓名是否有效
    const nameValid = this.validateName(realName)
    
    // 检查身份证号是否有效
    const idCardValid = this.validateIdCard(idCard)
    
    this.setData({
      submitDisabled: !(nameValid && idCardValid)
    })
  },

  // 验证姓名
  validateName(name) {
    // 姓名必须为2-20个汉字
    const nameRegex = /^[\u4e00-\u9fa5]{2,20}$/
    return nameRegex.test(name)
  },

  // 验证身份证号
  validateIdCard(idCard) {
    // 简单验证身份证号格式
    const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    return idCardRegex.test(idCard)
  },

  // 提交表单
  submitForm() {
    const { realName, idCard, submitDisabled } = this.data
    
    if (submitDisabled) {
      return
    }
    
    if (!this.validateName(realName)) {
      wx.showToast({
        title: '请输入有效的姓名',
        icon: 'none'
      })
      return
    }
    
    if (!this.validateIdCard(idCard)) {
      wx.showToast({
        title: '请输入有效的身份证号',
        icon: 'none'
      })
      return
    }
    
    const app = getApp()
    const baseUrl = app.globalData.baseUrl
    const userInfo = wx.getStorageSync('userInfo')
    
    if (!userInfo || !userInfo.id) {
      wx.showToast({
        title: '用户信息获取失败',
        icon: 'none'
      })
      return
    }
    
    // 弹窗确认
    wx.showModal({
      title: '确认提交',
      content: '实名认证信息提交后将进行实名校验，认证成功后无法修改，请确认信息准确无误。',
      confirmText: '确认提交',
      success: (res) => {
        if (res.confirm) {
          this.submitVerify(userInfo.id, realName, idCard)
        }
      }
    })
  },

  // 提交认证
  submitVerify(userId, realName, idCard) {
    const app = getApp()
    const baseUrl = app.globalData.baseUrl
    const userInfo = wx.getStorageSync('userInfo')
    
    if (!userInfo) {
      wx.showToast({
        title: '用户信息获取失败',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({
      title: '提交中...',
      mask: true
    })
    
    // 调用API，注意这里不再使用/api前缀
    wx.request({
      url: `${baseUrl}/user/verifyIdentity`,
      method: 'POST',
      data: {
        userId: userId,
        realName: realName,
        idCard: idCard
      },
      success: (res) => {
        console.log('提交实名认证响应:', res.data)
        if (res.data.code === 200) {
          // 认证成功，更新本地用户信息
          const updatedUserInfo = {...userInfo, nickname: realName, idCard: idCard}
          wx.setStorageSync('userInfo', updatedUserInfo)
          
          wx.showToast({
            title: '认证成功',
            icon: 'success'
          })
          
          // 更新页面状态
          this.setData({
            isVerified: true,
            idCardFormat: this.formatIdCard(idCard)
          })
        } else {
          let errorMsg = '认证失败'
          
          // 处理常见错误
          if (res.data.message) {
            errorMsg = res.data.message
          }
          
          wx.showToast({
            title: errorMsg,
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('提交实名认证失败:', err)
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  }
}) 
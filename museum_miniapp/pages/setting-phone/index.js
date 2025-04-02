Page({
  data: {
    isUpdate: false,      // 是否为修改手机号
    phone: '',            // 手机号
    code: '',             // 验证码
    countDown: 0,         // 验证码倒计时
    codeBtnDisabled: false, // 验证码按钮是否禁用
    submitDisabled: true  // 提交按钮是否禁用
  },

  onLoad() {
    // 获取用户信息，判断是否已绑定手机号
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo.phone) {
      this.setData({
        isUpdate: true
      })
    }
  },

  // 监听手机号输入
  onPhoneInput(e) {
    const phone = e.detail.value
    this.setData({
      phone
    })
    this.checkFormValid()
  },

  // 监听验证码输入
  onCodeInput(e) {
    const code = e.detail.value
    this.setData({
      code
    })
    this.checkFormValid()
  },

  // 检查表单是否有效
  checkFormValid() {
    const { phone, code } = this.data
    const phoneValid = this.validatePhone(phone)
    const codeValid = code.length === 6

    this.setData({
      codeBtnDisabled: !phoneValid,
      submitDisabled: !(phoneValid && codeValid)
    })
  },

  // 验证手机号
  validatePhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(phone)
  },

  // 发送验证码
  sendVerificationCode() {
    const { phone, codeBtnDisabled } = this.data
    
    if (codeBtnDisabled) {
      return
    }
    
    // 开始倒计时
    this.startCountDown()
    
    wx.showLoading({
      title: '发送中...',
      mask: true
    })
    
    const app = getApp()
    const baseUrl = app.globalData.baseUrl
    
    wx.request({
      url: `${baseUrl}/user/sendPhoneCode`,
      method: 'POST',
      data: {
        phone: phone
      },
      success: (res) => {
        if (res.data.code === 200) {
          wx.showToast({
            title: '验证码已发送',
            icon: 'success'
          })
        } else {
          // 发送失败，停止倒计时
          this.setData({
            countDown: 0,
            codeBtnDisabled: false
          })
          
          wx.showToast({
            title: res.data.message || '发送失败，请稍后重试',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('验证码发送失败:', err)
        
        // 发送失败，停止倒计时
        this.setData({
          countDown: 0,
          codeBtnDisabled: false
        })
        
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  // 开始倒计时
  startCountDown() {
    this.setData({
      countDown: 60,
      codeBtnDisabled: true
    })
    
    this.countDownTimer = setInterval(() => {
      if (this.data.countDown <= 1) {
        clearInterval(this.countDownTimer)
        this.setData({
          countDown: 0,
          codeBtnDisabled: !this.validatePhone(this.data.phone)
        })
      } else {
        this.setData({
          countDown: this.data.countDown - 1
        })
      }
    }, 1000)
  },

  // 提交表单
  submitForm() {
    const { phone, code, submitDisabled, isUpdate } = this.data
    
    if (submitDisabled) {
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
    
    wx.showLoading({
      title: '提交中...',
      mask: true
    })
    
    // 调用API，注意这里不再使用/api前缀
    wx.request({
      url: `${baseUrl}/user/updateMobile`,
      method: 'POST',
      data: {
        userId: userInfo.id,
        mobile: phone,
        verifyCode: code
      },
      success: (res) => {
        console.log('手机号更新响应:', res.data)
        if (res.data.code === 200) {
          // 更新本地存储的用户信息
          const updatedUserInfo = {...userInfo, mobile: phone}
          wx.setStorageSync('userInfo', updatedUserInfo)
          
          wx.showToast({
            title: isUpdate ? '手机号修改成功' : '手机号绑定成功',
            icon: 'success'
          })
          
          // 返回设置页面
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        } else {
          wx.showToast({
            title: res.data.message || '操作失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('手机号更新失败:', err)
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  // 页面卸载时清除定时器
  onUnload() {
    if (this.countDownTimer) {
      clearInterval(this.countDownTimer)
    }
  }
}) 
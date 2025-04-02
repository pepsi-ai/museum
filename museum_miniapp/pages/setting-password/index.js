Page({
  data: {
    currentPassword: '',  // 当前密码
    newPassword: '',      // 新密码
    confirmPassword: '',  // 确认新密码
    submitDisabled: true  // 提交按钮是否禁用
  },

  // 监听当前密码输入
  onCurrentPasswordInput(e) {
    this.setData({
      currentPassword: e.detail.value
    })
    this.checkFormValid()
  },

  // 监听新密码输入
  onNewPasswordInput(e) {
    this.setData({
      newPassword: e.detail.value
    })
    this.checkFormValid()
  },

  // 监听确认密码输入
  onConfirmPasswordInput(e) {
    this.setData({
      confirmPassword: e.detail.value
    })
    this.checkFormValid()
  },

  // 检查表单是否有效
  checkFormValid() {
    const { currentPassword, newPassword, confirmPassword } = this.data
    
    // 检查是否所有字段都已填写
    const allFilled = currentPassword && newPassword && confirmPassword
    
    // 检查新密码是否符合规则
    const passwordValid = this.validatePassword(newPassword)
    
    // 检查两次输入的新密码是否一致
    const passwordMatch = newPassword === confirmPassword
    
    // 检查新密码与当前密码是否不同
    const passwordDifferent = newPassword !== currentPassword
    
    this.setData({
      submitDisabled: !(allFilled && passwordValid && passwordMatch && passwordDifferent)
    })
  },

  // 验证密码
  validatePassword(password) {
    // 密码长度为8-20位，必须包含字母和数字
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/
    return passwordRegex.test(password)
  },

  // 提交表单
  submitForm() {
    const { currentPassword, newPassword, confirmPassword, submitDisabled } = this.data
    
    if (submitDisabled) {
      return
    }
    
    if (newPassword !== confirmPassword) {
      wx.showToast({
        title: '两次输入的新密码不一致',
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
    
    // 先验证当前密码是否正确
    wx.showLoading({
      title: '验证密码...',
      mask: true
    })
    
    // 调用登录接口验证当前密码
    wx.request({
      url: `${baseUrl}/user/login`,
      method: 'POST',
      data: {
        username: userInfo.username,
        password: currentPassword
      },
      success: (loginRes) => {
        wx.hideLoading()
        
        if (loginRes.data.code === 200) {
          // 密码验证成功，调用更新接口修改密码
          this.updatePassword(userInfo.id, newPassword)
        } else {
          // 当前密码错误
          wx.showToast({
            title: '当前密码错误',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('验证密码失败:', err)
        wx.hideLoading()
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      }
    })
  },
  
  // 更新密码
  updatePassword(userId, newPassword) {
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
      title: '修改密码...',
      mask: true
    })
    
    // 调用后端修改密码API - 确保提供所有必要字段
    wx.request({
      url: `${baseUrl}/user/editUserInfo`,
      method: 'POST',
      data: {
        id: userId,
        username: userInfo.username, // 提供必要的username字段避免SQL错误
        password: newPassword,
        nickname: userInfo.nickname || '', // 保持原昵称不变
        mobile: userInfo.mobile || '', // 保持原手机号不变
        idCard: userInfo.idCard || '' // 保持原身份证号不变
      },
      success: (res) => {
        console.log('密码修改响应:', res.data)
        if (res.data.code === 200) {
          // 更新本地用户信息中的密码
          const updatedUserInfo = {...userInfo, password: newPassword}
          wx.setStorageSync('userInfo', updatedUserInfo)
          
          wx.showToast({
            title: '密码修改成功',
            icon: 'success'
          })
          
          // 返回设置页面
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        } else {
          let errorMsg = '密码修改失败'
          
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
        console.error('密码修改失败:', err)
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
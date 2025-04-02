App({
  globalData: {
    userInfo: null,
    isLogin: false,
    userId: '',
    apiAvailable: false // 添加API可用性标志
  },
  onLaunch() {
    console.log('小程序启动')
    
    // 初始化baseUrl并检测API可用性
    this.initBaseUrl()
    
    // 检查登录状态
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    const userId = wx.getStorageSync('userId')

    if (token && userInfo) {
      this.globalData.isLogin = true
      this.globalData.userInfo = userInfo
      this.globalData.userId = userId
    }
  },
  
  // 初始化baseUrl，支持多环境
  initBaseUrl() {
    const env = 'dev' // 可选：dev, test, prod
    
    let baseUrl = ''
    switch (env) {
      case 'dev':
        // 尝试使用localhost地址
        baseUrl = 'http://localhost:8090/api'
        break
      case 'test':
        baseUrl = 'http://test-server:8090/api'
        break
      case 'prod':
        baseUrl = 'http://server:8090/api'
        break
      default:
        baseUrl = 'http://localhost:8090/api'
    }
    
    // 确保baseUrl不以斜杠结尾，避免拼接API路径时出现双斜杠
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1)
    }
    
    this.globalData.baseUrl = baseUrl
    console.log('baseUrl已初始化:', baseUrl)
    
    // 检查API服务器是否可用
    this.checkApiAvailability()
  },
  
  // 检查API服务器是否可用
  checkApiAvailability() {
    wx.request({
      // 尝试用展览列表接口检测API可用性
      url: `${this.globalData.baseUrl}/exhibition/list`,
      method: 'POST',
      data: {
        pagenum: 1,
        pagesize: 1 // 只获取一条数据即可验证API可用性
      },
      success: (res) => {
        console.log('API可用性检测结果:', res.statusCode, res.data?.code)
        
        // 状态码200并且业务状态码也正常
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          console.log('API服务器连接正常')
          this.globalData.apiAvailable = true
        } else {
          console.error('API服务器响应异常:', res.statusCode, res.data)
          this.globalData.apiAvailable = false
          this.showApiErrorToast()
        }
      },
      fail: (err) => {
        console.error('无法连接到API服务器:', err)
        this.globalData.apiAvailable = false
        this.showApiErrorToast()
      }
    })
  },
  
  // 显示API错误提示
  showApiErrorToast() {
    wx.showToast({
      title: '无法连接到服务器，将使用本地数据',
      icon: 'none',
      duration: 2000
    })
  },

  /**
   * 统一的登录流程
   * @param {Object} page - 页面实例对象，即this
   * @param {String} redirect - 登录成功后的重定向页面
   */
  checkLoginAndShowPrivacy(page, redirect) {
    // 检查登录状态
    if (this.globalData.isLogin) {
      // 已登录，直接返回true
      return true;
    } else {
      // 未登录，显示隐私协议弹窗
      if (!page.onPrivacyAgree) {
        // 添加隐私协议同意处理方法
        page.onPrivacyAgree = function() {
          page.setData({ showPrivacyModal: false, showPhoneModal: true });
        }
      }
      
      if (!page.onPrivacyReject) {
        // 添加隐私协议拒绝处理方法
        page.onPrivacyReject = function() {
          page.setData({ showPrivacyModal: false });
          wx.showToast({
            title: '需要同意隐私协议才能继续',
            icon: 'none'
          });
        }
      }
      
      if (!page.onPhoneConfirm) {
        // 添加手机号授权确认处理方法
        page.onPhoneConfirm = function() {
          // 这里应实现从微信服务器获取手机号的逻辑（暂未实现）
          page.setData({ showPhoneModal: false });
          console.log("应通过微信接口获取手机号（功能暂未实现）");
          // 临时跳转到登录页
          wx.navigateTo({
            url: '/pages/login/index' + (redirect ? '?redirect=' + encodeURIComponent(redirect) : '')
          });
        }
      }
      
      if (!page.onPhoneReject) {
        // 添加手机号授权拒绝处理方法
        page.onPhoneReject = function() {
          page.setData({ showPhoneModal: false });
          wx.showToast({
            title: '需要授权手机号才能继续',
            icon: 'none'
          });
        }
      }
      
      if (!page.onUseOtherPhone) {
        // 添加使用其他手机号处理方法
        page.onUseOtherPhone = function() {
          page.setData({ showPhoneModal: false });
          wx.navigateTo({
            url: '/pages/login/index' + (redirect ? '?redirect=' + encodeURIComponent(redirect) : '')
          });
        }
      }
      
      // 显示隐私协议弹窗
      page.setData({
        showPrivacyModal: true,
        pendingPage: redirect || ''
      });
      
      return false;
    }
  }
})


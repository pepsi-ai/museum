Page({
  data: {
    isLogin: false,
    userInfo: {},
    userId: '',
    showPrivacyModal: false,
    showPhoneModal: false,
    phoneNumber: '123****1234' // 示例手机号
  },
  
  onLoad() {
    this.checkLoginStatus();
  },
  
  onShow() {
    // 每次显示页面时刷新登录状态
    this.checkLoginStatus();
  },
  
  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    const userId = wx.getStorageSync('userId')
    
    this.setData({
      isLogin: !!token,
      userInfo: userInfo,
      userId: userId
    })
  },

  // 处理页面访问
  handlePageAccess(e) {
    const { page } = e.currentTarget.dataset;
    
    // 如果用户已登录且点击的是登录页面，则不做任何操作
    if (this.data.isLogin && page === '/pages/login/index') {
      return;
    }
    
    // 使用全局统一登录方法，传递目标页面作为重定向URL
    const app = getApp();
    
    // 如果是点击登录页面，则传递当前页面作为重定向目标
    const redirectPath = page === '/pages/login/index' ? '/pages/user/index' : page;
    
    // 对于设置页面，直接跳转，不需要检查登录
    if (page === '/pages/setting/index') {
      wx.navigateTo({
        url: page
      });
      return;
    }
    
    if (!app.checkLoginAndShowPrivacy(this, redirectPath)) {
      return;
    }
    
    // 已登录，跳转到目标页面
    wx.navigateTo({
      url: page,
      fail: (err) => {
        console.error('页面跳转失败:', err);
        wx.showToast({
          title: '页面开发中',
          icon: 'none'
        });
      }
    });
  },
  
  // 隐私协议相关方法由全局方法自动添加

  // 获取用户信息
  getUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        isLoggedIn: true
      });
    } else {
      this.setData({
        userInfo: {},
        isLoggedIn: false
      });
    }
  }
});
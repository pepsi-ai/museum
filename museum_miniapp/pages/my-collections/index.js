Page({
  data: {
    baseUrl: '',
    activeTab: 'exhibition', // 默认显示展览收藏
    
    // 展览收藏相关数据
    exhibitionList: [],
    exhibitionPageNum: 1,
    exhibitionPageSize: 10,
    exhibitionTotal: 0,
    
    // 藏品收藏相关数据
    collectionList: [],
    collectionPageNum: 1,
    collectionPageSize: 10,
    collectionTotal: 0,
    
    loading: false,
    showPrivacyModal: false,
    showPhoneModal: false,
    phoneNumber: '138****1234', // 示例手机号
    userInfo: null,
    pageNum: 1,
    pageSize: 10,
    collections: [],
    total: 0,
    refreshing: false
  },
  
  onLoad() {
    const app = getApp();
    this.setData({
      baseUrl: app.globalData.baseUrl
    });
    
    // 检查登录状态并获取收藏数据
    this.checkLoginAndGetCollections();
  },
  
  onShow() {
    // 每次页面显示时刷新数据
    if (getApp().globalData.isLogin) {
      this.refreshCollections();
    }
  },
  
  // 检查登录状态并获取收藏数据
  checkLoginAndGetCollections() {
    // 使用全局统一登录方法
    const app = getApp();
    if (!app.checkLoginAndShowPrivacy(this, '/pages/my-collections/index')) {
      return;
    }
    
    // 已登录，获取收藏数据
    this.refreshCollections();
  },
  
  // 刷新全部收藏数据
  refreshCollections() {
    // 根据当前活动标签页获取对应数据
    if (this.data.activeTab === 'exhibition') {
      this.getExhibitionCollections(true);
    } else {
      this.getCollectionCollections(true);
    }
  },
  
  // 获取展览收藏列表
  getExhibitionCollections(reset = false) {
    if (this.data.loading) return;
    
    const pageNum = reset ? 1 : this.data.exhibitionPageNum;
    
    this.setData({ loading: true });
    wx.showLoading({ title: '加载中...' });
    
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.id) {
      wx.hideLoading();
      this.setData({ loading: false });
      console.error('用户未登录或用户信息不完整');
      return;
    }
    
    const app = getApp();
    const baseUrl = app.globalData.baseUrl;
    
    // 确保userId是字符串类型
    const userId = String(userInfo.id);
    
    console.log('获取展览收藏列表:', {
      url: `${baseUrl}/like/listLikeExh`,
      userId: userId,
      pageNum: pageNum,
      pageSize: this.data.exhibitionPageSize
    });
    
    // 发送请求获取用户收藏的展览
    wx.request({
      url: `${baseUrl}/like/listLikeExh`,
      method: 'POST',
      data: {
        userId: userId,
        pageNum: pageNum,
        pageSize: this.data.exhibitionPageSize
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        wx.hideLoading();
        
        console.log('展览收藏列表响应:', {
          statusCode: res.statusCode,
          data: res.data
        });
        
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          const list = res.data.data.list || res.data.data || [];
          const total = res.data.data.total || list.length || 0;
          
          // 处理展览数据，确保所有必要字段都存在
          const processedList = list.map(item => ({
            ...item,
            id: item.id || item.exhId,
            title: item.title || item.name || '未命名展览',
            colPic: item.colPic || item.picturePath || '/images/logo.jpeg',
            startDate: this.formatDate(item.startDate),
            endDate: this.formatDate(item.endDate),
            location: item.location || '临展馆'
          }));
          
          this.setData({
            exhibitionList: reset ? processedList : [...this.data.exhibitionList, ...processedList],
            exhibitionTotal: total,
            exhibitionPageNum: pageNum + 1,
            loading: false
          });
          
          // 如果列表为空，显示提示
          if (list.length === 0 && pageNum === 1) {
            wx.showToast({
              title: '暂无收藏',
              icon: 'none',
              duration: 2000
            });
          }
        } else {
          this.setData({ loading: false });
          console.error('获取展览收藏失败:', res.data);
          wx.showToast({
            title: res.data?.msg || '获取收藏失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        console.error('获取展览收藏失败:', err);
        wx.hideLoading();
        this.setData({ loading: false });
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  
  // 获取藏品收藏列表
  getCollectionCollections(reset = false) {
    if (this.data.loading) return;
    
    const pageNum = reset ? 1 : this.data.collectionPageNum;
    
    this.setData({ loading: true });
    wx.showLoading({ title: '加载中...' });
    
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.id) {
      wx.hideLoading();
      this.setData({ loading: false });
      console.error('用户未登录或用户信息不完整');
      return;
    }
    
    const app = getApp();
    const baseUrl = app.globalData.baseUrl;
    
    // 确保userId是字符串类型
    const userId = String(userInfo.id);
    
    console.log('获取收藏藏品列表:', {
      url: `${baseUrl}/like/listLikeColl`,
      userId: userId,
      pageNum: pageNum,
      pageSize: this.data.collectionPageSize
    });
    
    // 发送请求获取用户收藏的藏品
    wx.request({
      url: `${baseUrl}/like/listLikeColl`,
      method: 'POST',
      data: {
        userId: userId,
        pageNum: pageNum,
        pageSize: this.data.collectionPageSize
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        wx.hideLoading();
        
        console.log('收藏藏品列表响应:', {
          statusCode: res.statusCode,
          data: res.data
        });
        
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          const list = res.data.data.list || [];
          
          this.setData({
            collectionList: reset ? list : [...this.data.collectionList, ...list],
            collectionTotal: res.data.data.total || 0,
            collectionPageNum: pageNum + 1,
            loading: false
          });
          
          // 如果列表为空，显示提示
          if (list.length === 0 && pageNum === 1) {
            wx.showToast({
              title: '暂无收藏',
              icon: 'none',
              duration: 2000
            });
          }
        } else {
          this.setData({ loading: false });
          console.error('获取收藏失败:', res.data);
          wx.showToast({
            title: res.data?.msg || '获取收藏失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        console.error('获取藏品收藏失败:', err);
        wx.hideLoading();
        this.setData({ loading: false });
        
        // 显示具体的错误信息
        let errorMsg = '网络错误，请稍后重试';
        if (err.errMsg) {
          if (err.errMsg.includes('timeout')) {
            errorMsg = '请求超时，请检查网络';
          } else if (err.errMsg.includes('fail')) {
            errorMsg = '无法连接到服务器';
          }
        }
        
        wx.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 3000
        });
      }
    });
  },
  
  // 切换标签页
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeTab) return;
    
    this.setData({ activeTab: tab });
    
    // 切换标签页时，如果对应数据列表为空，则加载数据
    if (tab === 'exhibition' && this.data.exhibitionList.length === 0) {
      this.getExhibitionCollections(true);
    } else if (tab === 'collection' && this.data.collectionList.length === 0) {
      this.getCollectionCollections(true);
    }
  },
  
  // 点击取消收藏
  onUnlikeTap(e) {
    const { id, type } = e.currentTarget.dataset;
    
    // 添加确认对话框
    wx.showModal({
      title: '取消收藏',
      content: '确定要取消收藏该藏品吗？',
      confirmColor: '#4169E1',
      success: (res) => {
        if (res.confirm) {
          this.unlikeItem(id, type);
        }
      }
    });
  },
  
  // 取消收藏处理
  unlikeItem(id, type) {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({ title: '取消收藏中...' });
    
    const app = getApp();
    const baseUrl = app.globalData.baseUrl;
    
    // 确保userId是字符串类型
    const userId = String(userInfo.id);
    
    // 选择正确的API端点
    const url = type === 'exhibition' 
      ? `${baseUrl}/like/delLikeExh`
      : `${baseUrl}/like/delLikeColl`;
    
    console.log('取消收藏请求:', {
      url: url,
      userId: userId,
      collId: id
    });
    
    wx.request({
      url: url,
      method: 'POST',
      data: {
        userId: userId,
        collId: id
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        wx.hideLoading();
        
        console.log('取消收藏响应:', {
          statusCode: res.statusCode,
          data: res.data
        });
        
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          wx.showToast({
            title: '已取消收藏',
            icon: 'success',
            duration: 2000
          });
          
          // 刷新收藏列表
          if (type === 'exhibition') {
            this.getExhibitionCollections(true);
          } else {
            this.getCollectionCollections(true);
          }
        } else {
          wx.showToast({
            title: res.data?.msg || '操作失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        console.error('取消收藏请求失败:', err);
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  
  // 点击展览项
  onExhibitionTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/exhibition-detail/index?id=${id}`
    });
  },
  
  // 点击藏品项
  onCollectionTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/collection-detail/index?id=${id}`
    });
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    // 刷新当前标签页数据
    if (this.data.activeTab === 'exhibition') {
      this.getExhibitionCollections(true);
    } else {
      this.getCollectionCollections(true);
    }
    
    wx.stopPullDownRefresh();
  },
  
  // 上拉加载更多
  onReachBottom() {
    // 加载当前标签页的更多数据
    if (this.data.activeTab === 'exhibition') {
      if (this.data.exhibitionList.length < this.data.exhibitionTotal) {
        this.getExhibitionCollections();
      }
    } else {
      if (this.data.collectionList.length < this.data.collectionTotal) {
        this.getCollectionCollections();
      }
    }
  },
  
  // 隐私协议同意
  onPrivacyAgree() {
    this.setData({ 
      showPrivacyModal: false,
      showPhoneModal: true 
    });
  },
  
  // 隐私协议拒绝
  onPrivacyReject() {
    this.setData({ showPrivacyModal: false });
    wx.showToast({
      title: '需要同意隐私协议才能继续',
      icon: 'none'
    });
  },
  
  // 手机号授权确认
  onPhoneConfirm() {
    this.setData({ showPhoneModal: false });
    // 跳转到登录页面
    wx.navigateTo({
      url: '/pages/login/index?redirect=' + encodeURIComponent('/pages/my-collections/index')
    });
  },
  
  // 手机号授权拒绝
  onPhoneReject() {
    this.setData({ showPhoneModal: false });
    wx.showToast({
      title: '需要授权手机号才能继续',
      icon: 'none'
    });
  },
  
  // 使用其他手机号
  onUseOtherPhone() {
    this.setData({ showPhoneModal: false });
    wx.navigateTo({
      url: '/pages/login/index?redirect=' + encodeURIComponent('/pages/my-collections/index')
    });
  },
  
  // 获取我的收藏列表
  getMyCollections(reset = false) {
    // 检查登录状态
    if (!this.checkLogin()) return;
    
    const baseUrl = app.globalData.baseUrl;
    const userId = this.data.userInfo.id;
    const pageNum = reset ? 1 : this.data.pageNum;
    const pageSize = this.data.pageSize;
    
    this.setData({ loading: true });
    
    console.log('获取用户收藏列表, 用户ID:', userId, '页码:', pageNum);
    
    wx.request({
      url: `${baseUrl}/collect/user/${userId}`,
      method: 'GET',
      header: {
        'Authorization': wx.getStorageSync('token') || ''
      },
      data: {
        pageNum: pageNum,
        pageSize: pageSize
      },
      success: (res) => {
        console.log('收藏列表API结果:', res.data);
        
        if (res.data && res.data.code === 200) {
          const list = res.data.data.list || [];
          const total = res.data.data.total || 0;
          
          // 处理收藏数据
          const processedList = this.processCollectionData(list);
          
          this.setData({
            collections: reset ? processedList : [...this.data.collections, ...processedList],
            total: total,
            pageNum: pageNum + 1,
            loading: false,
            refreshing: false
          });
        } else {
          console.log('API返回错误');
          
          if (reset) {
            this.setData({
              collections: [],
              loading: false,
              refreshing: false
            });
          } else {
            this.setData({
              loading: false,
              refreshing: false
            });
          }
          
          wx.showToast({
            title: '获取收藏列表失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.log('收藏列表请求失败:', err);
        
        if (reset) {
          this.setData({
            collections: [],
            loading: false,
            refreshing: false
          });
        } else {
          this.setData({
            loading: false,
            refreshing: false
          });
        }
        
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      }
    });
  },
  
  // 处理收藏数据
  processCollectionData(list) {
    return list.map(item => {
      return {
        ...item,
        // 确保字段映射正确
        id: item.collectionId || item.id,
        name: item.title || item.name || '',
        picturePath: item.colPic || item.picturePath || '',
        dynasty: item.origin || item.dynasty || '未知年代',
        description: item.desColl || item.description || ''
      };
    });
  },
  
  // 检查登录状态
  checkLogin() {
    const userInfo = wx.getStorageSync('userInfo');
    
    if (!userInfo) {
      wx.showModal({
        title: '提示',
        content: '请先登录后查看我的收藏',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/index'
            });
          }
        }
      });
      return false;
    }
    
    this.setData({
      userInfo: userInfo
    });
    
    return true;
  },
  
  // 添加收藏处理
  addLike(id, type) {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    wx.showLoading({ title: '收藏中...' });
    
    const app = getApp();
    const baseUrl = app.globalData.baseUrl;
    
    // 确保userId是字符串类型
    const userId = String(userInfo.id);
    
    // 选择正确的API端点
    const url = type === 'exhibition' 
      ? `${baseUrl}/like/addLikeExh`
      : `${baseUrl}/like/addLikeColl`;
    
    console.log('添加收藏请求:', {
      url: url,
      userId: userId,
      collId: id
    });
    
    wx.request({
      url: url,
      method: 'POST',
      data: {
        userId: userId,
        collId: id
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        wx.hideLoading();
        
        console.log('添加收藏响应:', {
          statusCode: res.statusCode,
          data: res.data
        });
        
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          wx.showToast({
            title: '收藏成功',
            icon: 'success',
            duration: 2000
          });
          
          // 刷新收藏列表
          if (type === 'exhibition') {
            this.getExhibitionCollections(true);
          } else {
            this.getCollectionCollections(true);
          }
        } else {
          wx.showToast({
            title: res.data?.msg || '收藏失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        console.error('添加收藏请求失败:', err);
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  
  // 点击收藏按钮
  onLikeTap(e) {
    const { id, type, isLiked } = e.currentTarget.dataset;
    
    if (isLiked) {
      // 如果已收藏，则取消收藏
      this.unlikeItem(id, type);
    } else {
      // 如果未收藏，则添加收藏
      this.addLike(id, type);
    }
  },
  
  // 格式化日期
  formatDate(date) {
    if (!date) return '';
    if (typeof date === 'string') {
      // 如果已经是格式化的字符串，直接返回
      if (date.includes('-')) return date;
      // 尝试转换为日期对象
      date = new Date(date);
    }
    if (!(date instanceof Date) || isNaN(date)) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}); 
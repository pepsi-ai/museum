const app = getApp()

Page({
  data: {
    // 标签切换相关
    activeTab: 'exhibition', // 默认显示展览标签

    // 藏品相关数据
    categories: [
      { id: 0, name: '全部' },
      { id: 1, name: '石刻' },
      { id: 2, name: '壁画' },
      { id: 3, name: '石器' },
      { id: 4, name: '玉器' },
      { id: 5, name: '陶器' },
      { id: 6, name: '铜器' },
      { id: 7, name: '铁器' },
      { id: 8, name: '瓷器' },
      { id: 9, name: '骨器' }
    ],
    currentCategory: '全部', // 默认选中全部分类
    collectionList: [], // 藏品列表
    pageNum: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    likedItems: {}, // 存储收藏状态，格式：{藏品id: 是否收藏}
    
    // 展览相关数据
    exhibitionList: [], // 展览列表
    exhibitionPageNum: 1,
    exhibitionPageSize: 10,
    exhibitionTotal: 0,
    exhibitionLoading: false,
    exhibitionLikedItems: {}, // 存储展览收藏状态
    
    // 通用数据
    baseUrl: '', // 存储基础URL
    showPrivacyModal: false,
    showPhoneModal: false,
    phoneNumber: '',
    userLikesLoaded: false
  },

  onLoad() {
    const app = getApp()
    this.setData({
      baseUrl: app.globalData.baseUrl
    })
    
    // 获取分类列表
    this.getCategories()
    
    // 获取展览列表（默认标签已更改为展览）
    this.getExhibitionList()
    
    // 如果用户已登录，获取用户收藏信息
    if (app.globalData.isLogin) {
      this.getUserLikes()
    }
  },
  
  onShow() {
    // 检查登录状态变化
    const app = getApp()
    if (app.globalData.isLogin && !this.data.userLikesLoaded) {
      this.getUserLikes()
    }
  },
  
  // 标签切换方法
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    if (tab === this.data.activeTab) return
    
    this.setData({ activeTab: tab })
    
    // 切换到展览标签时，如果展览列表为空则加载展览数据
    if (tab === 'exhibition' && this.data.exhibitionList.length === 0) {
      this.getExhibitionList()
    }
    
    // 切换到藏品标签时，如果藏品列表为空则加载藏品数据
    if (tab === 'collection' && this.data.collectionList.length === 0) {
      this.getCollectionList()
    }
  },
  
  // 获取藏品列表
  getCollectionList(reset = false) {
    const baseUrl = app.globalData.baseUrl;
    const pageNum = reset ? 1 : this.data.pageNum;
    const pageSize = this.data.pageSize;
    
    this.setData({ loading: true });
    
    console.log('获取藏品列表 页码:', pageNum, '每页数量:', pageSize);
    
    wx.request({
      url: `${baseUrl}/collection/list`,
      method: 'POST',
      data: {
        pagenum: pageNum,
        pagesize: pageSize,
        name: this.data.searchKeyword || '',
        // 添加其他筛选条件
        dynasty: this.data.filter.dynasty !== 'all' ? this.data.filter.dynasty : '',
        category: this.data.filter.category !== 'all' ? this.data.filter.category : ''
      },
      success: (res) => {
        console.log('藏品列表API结果:', res.data);
        
        if (res.data && res.data.code === 200) {
          const list = res.data.data.records || res.data.data.list || [];
          const total = res.data.data.total || 0;
          
          // 处理藏品数据
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
          this.setData({
            loading: false,
            refreshing: false
          });
          
          wx.showToast({
            title: '获取藏品列表失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.log('藏品列表请求失败:', err);
        this.setData({
          loading: false,
          refreshing: false
        });
        
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      }
    });
  },
  
  // 处理藏品数据
  processCollectionData(list) {
    return list.map(item => {
      return {
        ...item,
        // 确保字段名称一致
        id: item.id || item.collectionId,
        name: item.title || item.name || '',
        picturePath: item.colPic || item.picturePath || '',
        dynasty: item.origin || item.dynasty || '未知年代',
        description: item.desColl || item.description || ''
      };
    });
  },
  
  // 新增获取展览列表方法
  getExhibitionList(reset = false) {
    if (this.data.exhibitionLoading) return
    
    if (reset) {
      this.setData({
        exhibitionPageNum: 1,
        exhibitionList: []
      })
    }

    this.setData({ exhibitionLoading: true })
    wx.showLoading({ title: '加载中...' })

    wx.request({
      url: `${this.data.baseUrl}/exhibit/getdata`,
      method: 'POST',
      data: {
        pageNum: this.data.exhibitionPageNum,
        pageSize: this.data.exhibitionPageSize
      },
      success: (res) => {
        if (res.data.code === 200) {
          const list = res.data.data.list || []
          const total = res.data.data.total || 0
          
          this.setData({
            exhibitionList: [...this.data.exhibitionList, ...list],
            exhibitionTotal: total,
            exhibitionPageNum: this.data.exhibitionPageNum + 1
          })
        }
      },
      fail: (err) => {
        console.error('获取展览列表失败:', err)
      },
      complete: () => {
        this.setData({ exhibitionLoading: false })
        wx.hideLoading()
        wx.stopPullDownRefresh()
      }
    })
  },

  // 点击展览项
  onExhibitionTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/exhibition-detail/index?id=${id}`
    })
  },
  
  // 点击展览收藏按钮
  onExhibitionLikeTap(e) {
    // 添加对e对象的检查，避免调用不存在的stopPropagation方法
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation(); // 阻止冒泡，避免触发onExhibitionTap
    }
    
    const id = e && e.currentTarget ? e.currentTarget.dataset.id : e;
    const app = getApp();
    
    // 检查用户是否登录
    if (!app.checkLoginAndShowPrivacy(this, '/pages/collection/index')) {
      return;
    }
    
    // 已登录，执行收藏/取消收藏操作
    const isLiked = !!this.data.exhibitionLikedItems[id];
    const url = isLiked ? 
      `${this.data.baseUrl}/like/delLikeExh` : 
      `${this.data.baseUrl}/like/addLikeExh`;
    
    // 先更新UI，再发送请求
    const exhibitionLikedItems = { ...this.data.exhibitionLikedItems };
    exhibitionLikedItems[id] = !isLiked;
    this.setData({ exhibitionLikedItems });
    
    wx.request({
      url: url,
      method: 'POST',
      data: {
        userId: app.globalData.userId,
        collId: id
      },
      success: (res) => {
        if (res.data.code === 200) {
          wx.showToast({
            title: isLiked ? '已取消收藏' : '收藏成功',
            icon: 'success'
          });
        } else {
          // 恢复原来的状态
          exhibitionLikedItems[id] = isLiked;
          this.setData({ exhibitionLikedItems });
          
          wx.showToast({
            title: '操作失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('收藏操作失败:', err);
        // 恢复原来的状态
        exhibitionLikedItems[id] = isLiked;
        this.setData({ exhibitionLikedItems });
        
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },
  
  // 重写获取用户收藏信息方法
  getUserLikes() {
    const app = getApp()
    if (!app.globalData.isLogin) return
    
    // 获取藏品收藏信息
    wx.request({
      url: `${this.data.baseUrl}/like/listUserLikes`,
      method: 'GET',
      data: {
        userId: app.globalData.userId,
        collType: 'collection' // 普通藏品类型
      },
      success: (res) => {
        if (res.data.code === 200) {
          const likedItems = {}
          const items = res.data.data || []
          
          items.forEach(item => {
            likedItems[item.id] = true
          })
          
          this.setData({ 
            likedItems,
            userLikesLoaded: true
          })
        }
      }
    })
    
    // 获取展览收藏信息
    wx.request({
      url: `${this.data.baseUrl}/like/listUserLikes`,
      method: 'GET',
      data: {
        userId: app.globalData.userId,
        collType: 'exhibition' // 展览类型
      },
      success: (res) => {
        if (res.data.code === 200) {
          const exhibitionLikedItems = {}
          const items = res.data.data || []
          
          items.forEach(item => {
            exhibitionLikedItems[item.id] = true
          })
          
          this.setData({ exhibitionLikedItems })
        }
      }
    })
  },
  
  // 保留原有方法
  formatDesc(htmlText) {
    if (!htmlText) return ''
    return htmlText.replace(/<[^>]+>/g, '') // 移除HTML标签
  },
  
  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category
    
    if (category === this.data.currentCategory) return
    
    this.setData({ 
      currentCategory: category
    })
    
    // 切换分类后重新获取藏品列表
    this.getCollectionList(true)
  },
  
  onCollectionTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/collection-detail/index?id=${id}`
    })
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    // 根据当前激活的标签页决定刷新哪个列表
    if (this.data.activeTab === 'collection') {
      this.getCollectionList(true)
    } else {
      this.getExhibitionList(true)
    }
  },
  
  // 上拉加载更多
  onReachBottom() {
    // 根据当前激活的标签页决定加载哪个列表的更多数据
    if (this.data.activeTab === 'collection') {
      // 如果已加载完所有数据，则不再加载
      if (this.data.collectionList.length >= this.data.total) return
      this.getCollectionList()
    } else {
      // 如果已加载完所有展览数据，则不再加载
      if (this.data.exhibitionList.length >= this.data.exhibitionTotal) return
      this.getExhibitionList()
    }
  },
  
  // 保留原有收藏方法
  onLikeTap(e) {
    // 添加对e对象的检查，避免调用不存在的stopPropagation方法
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation()
    }
    
    const id = e && e.currentTarget ? e.currentTarget.dataset.id : e
    const app = getApp()
    
    // 检查用户是否登录
    if (!app.checkLoginAndShowPrivacy(this, '/pages/collection/index')) {
      return
    }
    
    // 已登录，执行收藏/取消收藏操作
    const isLiked = !!this.data.likedItems[id]
    const url = isLiked ? 
      `${this.data.baseUrl}/like/delLikeColl` : 
      `${this.data.baseUrl}/like/addLikeColl`
    
    // 先更新UI，再发送请求
    const likedItems = { ...this.data.likedItems }
    likedItems[id] = !isLiked
    this.setData({ likedItems })
    
    wx.request({
      url: url,
      method: 'POST',
      data: {
        userId: app.globalData.userId,
        collId: id
      },
      success: (res) => {
        if (res.data.code === 200) {
          wx.showToast({
            title: isLiked ? '已取消收藏' : '收藏成功',
            icon: 'success'
          })
        } else {
          // 恢复原来的状态
          likedItems[id] = isLiked
          this.setData({ likedItems })
          
          wx.showToast({
            title: '操作失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('收藏操作失败:', err)
        // 恢复原来的状态
        likedItems[id] = isLiked
        this.setData({ likedItems })
        
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  },
  
  // 保留隐私弹窗相关方法
  onPrivacyAgree() {
    this.setData({ 
      showPrivacyModal: false,
      showPhoneModal: true
    })
  },
  
  onPrivacyReject() {
    this.setData({ showPrivacyModal: false })
    wx.showToast({
      title: '需要同意隐私政策才能使用该功能',
      icon: 'none'
    })
  },
  
  onPhoneConfirm() {
    this.setData({ showPhoneModal: false })
    // 手机号确认后登录
    // 这里可以加入获取手机号后的登录逻辑
  },
  
  onPhoneReject() {
    this.setData({ showPhoneModal: false })
    wx.showToast({
      title: '需要授权手机号才能使用该功能',
      icon: 'none'
    })
  },
  
  onUseOtherPhone() {
    this.setData({ showPhoneModal: false })
    // 跳转到手动登录页面
    wx.navigateTo({
      url: '/pages/login/index?redirect=/pages/collection/index'
    })
  },

  // 获取藏品分类列表
  getCategories() {
    wx.request({
      url: `${this.data.baseUrl}/dic/listDicByTyp`,
      method: 'POST',
      data: {
        dicTyp: '藏品分类'
      },
      success: (res) => {
        if (res.data.code === 200) {
          const categoryList = res.data.data || [];
          // 添加"全部"选项
          const categories = [{ id: 0, name: '全部' }].concat(
            categoryList.map(item => ({ 
              id: item.id, 
              name: item.dicValue 
            }))
          );
          
          this.setData({ categories });
        }
      }
    });
  }
}) 
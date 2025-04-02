// 获取应用实例
const app = getApp()

Page({
  data: {
    baseUrl: '',
    searchKeyword: '',
    exhibitions: [], // 展览列表数据
    pageNum: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    refreshing: false,
    showBackToTop: false,
    
    // 标签切换相关
    activeTab: 'exhibition', // 默认显示展览标签
    
    // 收藏相关数据
    collectionList: [], // 藏品列表
    collectionPageNum: 1,
    collectionTotal: 0,
    collectionLoading: false,
    likedItems: {}, // 藏品收藏状态
    likedExhibitions: {}, // 展览收藏状态
    
    // 筛选条件
    filter: {
      status: 'all', // 展览状态筛选：all全部，ongoing进行中，upcoming即将开始，available可预约
    },
    
    // 分类相关
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
    
    // 弹窗状态
    showPrivacyModal: false,
    showPhoneModal: false,
    phoneNumber: '',
  },
  
  onLoad() {
    // 初始化基础URL
    const app = getApp()
    this.setData({
      baseUrl: app.globalData.baseUrl
    })
    
    console.log('展览页面加载，baseUrl:', app.globalData.baseUrl);
    
    // 加载展览数据
    this.getExhibitionList()
  },
  
  onShow() {
    // 检查登录状态并获取收藏信息
    const app = getApp();
    console.log('展览页面显示，登录状态:', app.globalData.isLogin);
    
    if (app.globalData.isLogin) {
      this.checkUserLikedItems();
    } else {
      // 未登录，清空收藏状态
      this.setData({
        likedItems: {},
        likedExhibitions: {}
      });
    }
    
    // 页面显示时获取用户收藏状态
    this.getUserLikedExhibitions();
  },
  
  // 标签切换方法
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    if (tab === this.data.activeTab) return
    
    this.setData({ activeTab: tab })
    
    // 切换到藏品标签时，如果藏品列表为空则加载藏品数据
    if (tab === 'collection' && this.data.collectionList.length === 0) {
      this.getCollectionList()
    }
    
    // 切换到展览标签时，如果展览列表为空则加载展览数据
    if (tab === 'exhibition' && this.data.exhibitions.length === 0) {
      this.getExhibitionList()
    }
  },
  
  // 获取展览列表
  getExhibitionList(reset = false) {
    const baseUrl = app.globalData.baseUrl;
    const pageNum = reset ? 1 : this.data.pageNum;
    const pageSize = this.data.pageSize;
    this.setData({ loading: true });
    
    console.log('获取展览列表 页码:', pageNum, '每页数量:', pageSize, '搜索关键词:', this.data.searchKeyword);
    
    // 尝试两种参数格式，增加兼容性
    const requestData = {
      pageNum: pageNum,  // 尝试驼峰命名
      pageSize: pageSize,
      name: this.data.searchKeyword || ''
    };
    
    console.log('请求参数:', requestData);
    
    wx.request({
      url: `${baseUrl}/exhibition/list`,
      method: 'POST',
      data: requestData,
      success: (res) => {
        console.log('展览列表API结果:', res.data);
        
        if (res.data && res.data.code === 200) {
          const list = res.data.data.records || res.data.data.list || res.data.data || [];
          const total = res.data.data.total || list.length || 0;
          
          console.log('获取到的展览原始数据:', list);
          
          if (list.length === 0) {
            console.log('展览列表为空，使用默认数据');
            if (reset) {
              this.useDefaultExhibitionList();
            }
            this.setData({ loading: false, refreshing: false });
            return;
          }
          
          // 处理展览数据
          const processedList = this.processExhibitionData(list);
          console.log('处理后的展览数据:', processedList);
          
          // 根据筛选条件过滤
          const filteredList = this.filterExhibitions(processedList);
          console.log('筛选后的展览数据:', filteredList, '筛选条件:', this.data.filter);
          
          this.setData({
            exhibitions: reset ? filteredList : [...this.data.exhibitions, ...filteredList],
            total: total,
            pageNum: pageNum + 1,
            loading: false,
            refreshing: false
          });
        } else {
          console.error('API返回错误:', res.data);
          this.setData({
            loading: false,
            refreshing: false
          });
          
          if (reset) {
            // 如果是重置列表，则使用默认数据
            this.useDefaultExhibitionList();
          }
          
          wx.showToast({
            title: res.data?.msg || '获取展览列表失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('获取展览列表网络错误:', err);
        this.setData({
          loading: false,
          refreshing: false
        });
        
        if (reset) {
          // 如果是重置列表，则使用默认数据
          this.useDefaultExhibitionList();
        }
        
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        });
      }
    });
  },
  
  // 获取所有展览（不分页）
  getAllExhibitions() {
    const baseUrl = app.globalData.baseUrl;
    
    wx.request({
      url: `${baseUrl}/exhibition/all`,
      method: 'GET',
      success: (res) => {
        console.log('所有展览API结果:', res.data);
        
        if (res.data && res.data.code === 200) {
          const list = res.data.data || [];
          
          // 处理展览数据
          const processedList = this.processExhibitionData(list);
          
          // 根据筛选条件过滤
          const filteredList = this.filterExhibitions(processedList);
          
          this.setData({
            exhibitions: filteredList,
            total: filteredList.length,
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
            title: '获取展览列表失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.log('所有展览请求失败:', err);
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
  
  // 处理展览数据（格式化日期等）
  processExhibitionData(data) {
    const today = this.getTodayString()
    const currentDate = new Date() // 当前时间
    
    return data.map(item => {
      // 使用真实展览数据的字段
      const startDate = item.startDate || today
      const endDate = item.endDate || this.addMonths(today, 1)
      
      // 计算状态
      let status = 'upcoming' // 默认即将开始
      
      // 将日期字符串转换为Date对象进行比较
      const startDateObj = new Date(startDate.replace(/\./g, '-'))
      const endDateObj = new Date(endDate.replace(/\./g, '-'))
      
      if (currentDate < startDateObj) {
        status = 'upcoming' // 即将开始
      } else if (currentDate > endDateObj) {
        status = 'ended' // 已结束
      } else {
        status = 'ongoing' // 进行中
      }
      
      // 处理图片路径，确保始终有可用的图片
      let colPic = item.colPic || item.picturePath || '';
      
      // 如果图片路径不是以http开头且不是以/开头，添加/作为前缀
      if (colPic && !colPic.startsWith('http') && !colPic.startsWith('/')) {
        colPic = '/' + colPic;
      }
      
      // 如果仍然没有图片路径，使用默认图片
      if (!colPic) {
        colPic = '/images/logo.jpeg';
      }
      
      return {
        ...item,
        id: item.id,
        title: item.title || '展览',
        colPic: colPic,
        startDate: this.formatDate(startDate),
        endDate: this.formatDate(endDate),
        location: item.location || '临展馆',
        status: status // 计算后的状态
      }
    })
  },
  
  // 根据筛选条件过滤展览
  filterExhibitions(exhibitions) {
    // 如果没有筛选条件，或筛选条件为"all"，则返回所有展览
    if (!this.data.filter || this.data.filter.status === 'all') {
      return exhibitions;
    }
    
    // 根据状态筛选
    return exhibitions.filter(item => item.status === this.data.filter.status);
  },
  
  // 获取当前日期的字符串表示 (YYYY-MM-DD)
  getTodayString() {
    const today = new Date()
    return today.getFullYear() + '-' + 
           String(today.getMonth() + 1).padStart(2, '0') + '-' + 
           String(today.getDate()).padStart(2, '0')
  },
  
  // 判断日期是否已过
  isPastDate(dateStr) {
    if (!dateStr) return false
    
    try {
      // 将日期字符串转换为Date对象
      const date = new Date(dateStr.replace(/-/g, '/'))
      const today = new Date()
      
      // 重置时间部分，只比较日期
      today.setHours(0, 0, 0, 0)
      date.setHours(0, 0, 0, 0)
      
      return date < today
    } catch (e) {
      return false
    }
  },
  
  // 添加月份到日期
  addMonths(dateStr, months) {
    try {
      const date = new Date(dateStr.replace(/-/g, '/'))
      date.setMonth(date.getMonth() + months)
      
      return date.getFullYear() + '-' + 
             String(date.getMonth() + 1).padStart(2, '0') + '-' + 
             String(date.getDate()).padStart(2, '0')
    } catch (e) {
      return dateStr
    }
  },
  
  // 筛选条件切换
  onFilterTap(e) {
    const type = e.currentTarget.dataset.type
    const value = e.currentTarget.dataset.value
    
    // 更新筛选条件
    const filter = {...this.data.filter}
    filter[type] = value
    
    this.setData({ filter }, () => {
      // 重新获取数据
      this.getExhibitionList(true)
    })
  },
  
  // 点击展览卡片，跳转到详情页
  onExhibitionTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/exhibition-detail/index?id=${id}`
    })
  },
  
  // 点击预约按钮
  onReserveTap(e) {
    try {
      // catchtap已经阻止了冒泡，不需要调用stopPropagation
      // 安全地获取展览ID
      const id = e && e.currentTarget ? e.currentTarget.dataset.id : null;
      if (!id) {
        console.error('无法获取展览ID');
        return;
      }
      
      console.log('点击预约按钮，展览ID:', id);
      
      // 直接跳转到展览详情页
      wx.navigateTo({
        url: `/pages/exhibition-detail/index?id=${id}`,
        success: () => {
          console.log('成功跳转到展览详情页');
        },
        fail: (err) => {
          console.error('跳转到展览详情页失败:', err);
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    } catch (error) {
      console.error('预约按钮处理错误:', error);
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      });
    }
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ refreshing: true })
    
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
      if (this.data.collectionList.length >= this.data.collectionTotal) return
      this.getCollectionList()
    } else {
      // 如果已加载完所有展览数据，则不再加载
      if (this.data.exhibitions.length >= this.data.total) return
      this.getExhibitionList()
    }
  },
  
  // 页面滚动
  onPageScroll(e) {
    // 显示/隐藏返回顶部按钮
    this.setData({
      showBackToTop: e.scrollTop > 300
    })
  },
  
  // 返回顶部
  backToTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },
  
  // 格式化日期
  formatDate(dateStr) {
    if (!dateStr) return ''
    
    // 如果已经是 yyyy.MM.dd 格式，直接返回
    if (/^\d{4}\.\d{2}\.\d{2}$/.test(dateStr)) {
      return dateStr
    }
    
    try {
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}.${month}.${day}`
    } catch (e) {
      return dateStr
    }
  },
  
  // 隐私协议相关方法
  onPrivacyAgree() {
    this.setData({ showPrivacyModal: false })
    // 可能需要继续跳转或其他操作
  },
  
  onPrivacyReject() {
    this.setData({ showPrivacyModal: false })
    // 处理拒绝隐私协议的情况
  },
  
  // 手机号授权相关方法
  onPhoneConfirm() {
    this.setData({ showPhoneModal: false })
    // 可能需要继续跳转或其他操作
  },
  
  onPhoneReject() {
    this.setData({ showPhoneModal: false })
    // 处理拒绝手机号授权的情况
  },
  
  onUseOtherPhone() {
    this.setData({ showPhoneModal: false })
    // 跳转到手动输入手机号页面
  },
  
  // 展览图片加载错误处理
  onImageError(e) {
    const index = e.currentTarget.dataset.index;
    console.log('展览图片加载错误，索引:', index);
    
    // 获取当前展览列表
    const exhibitions = [...this.data.exhibitions];
    
    // 如果索引有效
    if (exhibitions[index]) {
      // 替换为默认图片
      exhibitions[index].colPic = '/images/logo.jpeg';
      
      this.setData({ exhibitions });
      console.log('已将展览图片替换为默认图片');
    }
  },
  
  // 获取藏品列表
  getCollectionList(reset = false) {
    if (this.data.collectionLoading) return
    
    if (reset) {
      this.setData({
        collectionPageNum: 1,
        collectionList: []
      })
    }

    this.setData({ collectionLoading: true })
    wx.showLoading({ title: '加载中...' })

    // 准备请求参数
    const params = {
      pageNum: this.data.collectionPageNum,
      pageSize: this.data.pageSize
    }
    
    // 如果选择了分类，添加分类参数
    if (this.data.currentCategory !== '全部') {
      params.cateId = this.data.currentCategory
    }

    wx.request({
      url: `${this.data.baseUrl}/collect/getdata`,
      method: 'POST',
      data: params,
      success: (res) => {
        if (res.data.code === 200) {
          const list = res.data.data.list || []
          const total = res.data.data.total || 0
          
          this.setData({
            collectionList: [...this.data.collectionList, ...list],
            collectionTotal: total,
            collectionPageNum: this.data.collectionPageNum + 1
          })
        }
      },
      fail: (err) => {
        console.error('获取藏品列表失败:', err)
      },
      complete: () => {
        this.setData({ collectionLoading: false })
        wx.hideLoading()
        wx.stopPullDownRefresh()
      }
    })
  },
  
  // 分类点击事件
  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category
    
    this.setData({
      currentCategory: category,
      collectionList: [],
      collectionPageNum: 1
    }, () => {
      this.getCollectionList()
    })
  },
  
  // 藏品点击事件
  onCollectionTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/collection-detail/index?id=${id}`
    })
  },
  
  // 藏品收藏点击事件
  onCollectionLikeTap(e) {
    try {
      // catchtap已经阻止了冒泡，不需要调用stopPropagation
      const id = e && e.currentTarget ? e.currentTarget.dataset.id : null;
      if (!id) {
        console.error('无法获取藏品ID');
        return;
      }
      
      const app = getApp();
      
      // 检查用户是否登录
      if (!app.checkLoginAndShowPrivacy || !app.checkLoginAndShowPrivacy(this, '/pages/exhibition-list/index')) {
        return;
      }
      
      // 已登录，执行收藏/取消收藏操作
      const isLiked = !!this.data.likedItems[id];
      const url = isLiked ? 
        `${this.data.baseUrl}/like/delLikeColl` : 
        `${this.data.baseUrl}/like/addLikeColl`;
      
      // 先更新UI，再发送请求
      const likedItems = { ...this.data.likedItems };
      likedItems[id] = !isLiked;
      this.setData({ likedItems });
      
      wx.request({
        url: url,
        method: 'POST',
        data: {
          userId: app.globalData.userId,
          collId: id
        },
        success: (res) => {
          if (res.data.code !== 200) {
            // 如果请求失败，恢复之前的状态
            likedItems[id] = isLiked;
            this.setData({ likedItems });
            
            wx.showToast({
              title: '操作失败，请稍后重试',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('收藏请求失败:', err);
          
          // 请求失败，恢复之前的状态
          likedItems[id] = isLiked;
          this.setData({ likedItems });
          
          wx.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          });
        }
      });
    } catch (error) {
      console.error('收藏按钮处理错误:', error);
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      });
    }
  },
  
  // 格式化描述文本（去除HTML标签）
  formatDesc(htmlText) {
    if (!htmlText) return '';
    return htmlText.replace(/<[^>]+>/g, '').substring(0, 50) + '...';
  },
  
  // 藏品图片加载错误处理
  onCollectionImageError(e) {
    const index = e.currentTarget.dataset.index
    const defaultImage = '/images/default-collection.jpg' // 默认图片路径
    
    // 更新对应藏品的图片路径为默认图片
    const collectionList = this.data.collectionList
    if (collectionList[index]) {
      collectionList[index].colPic = defaultImage
      this.setData({ collectionList })
    }
  },
  
  // 搜索按钮点击事件
  onSearchTap() {
    wx.navigateTo({
      url: '/pages/search/index?type=exhibition'
    })
  },
  
  // 使用默认展览数据
  useDefaultExhibitionList() {
    console.log('使用默认展览列表数据');
    
    const defaultExhibitions = [
      {
        id: 1,
        title: '古代文物特展',
        colPic: '/images/logo.jpeg', // 使用已知存在的图片
        startDate: '2023-03-01',
        endDate: '2023-06-30',
        location: '临展馆1号厅',
        status: 'ongoing'
      },
      {
        id: 2,
        title: '当代艺术展',
        colPic: '/images/logo.jpeg', // 使用已知存在的图片
        startDate: '2023-02-15',
        endDate: '2023-05-15',
        location: '临展馆2号厅',
        status: 'ongoing'
      },
      {
        id: 3,
        title: '历史文化展',
        colPic: '/images/logo.jpeg', // 使用已知存在的图片
        startDate: '2023-04-20',
        endDate: '2023-07-20',
        location: '临展馆3号厅',
        status: 'upcoming'
      },
      {
        id: 4,
        title: '科技创新展',
        colPic: '/images/logo.jpeg', // 使用已知存在的图片
        startDate: '2023-01-10',
        endDate: '2023-02-28',
        location: '临展馆4号厅',
        status: 'ended'
      }
    ];
    
    // 根据当前筛选条件过滤默认数据
    const filteredList = this.filterExhibitions(defaultExhibitions);
    
    this.setData({
      exhibitions: filteredList,
      total: defaultExhibitions.length,
      pageNum: 2 // 设为2，表示下一页
    });
  },
  
  // 获取用户收藏的展览ID列表
  getUserLikedExhibitions() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.id) {
      return;
    }
    
    const app = getApp();
    const baseUrl = app.globalData.baseUrl;
    
    // 确保userId是字符串类型
    const userId = String(userInfo.id);
    
    console.log('获取用户收藏展览列表:', {
      url: `${baseUrl}/like/listLikeExh`,  // 移除 /api 前缀
      userId: userId
    });
    
    wx.request({
      url: `${baseUrl}/like/listLikeExh`,  // 移除 /api 前缀
      method: 'POST',
      data: {
        userId: userId,
        pageNum: 1,
        pageSize: 999  // 获取所有收藏的展览
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        console.log('获取用户收藏展览列表响应:', res);
        
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          const list = res.data.data.list || res.data.data || [];
          const likedExhibitions = {};
          
          // 使用展览ID作为key
          list.forEach(item => {
            const id = item.id || item.exhId;
            if (id) {
              likedExhibitions[id] = true;
            }
          });
          
          this.setData({
            likedExhibitions: likedExhibitions
          });
          
          console.log('更新展览收藏状态成功，收藏数:', Object.keys(likedExhibitions).length);
        }
      },
      fail: (err) => {
        console.error('获取用户收藏展览列表失败:', err);
      }
    });
  },
  
  // 展览收藏点击处理
  onExhibitionLikeTap(e) {
    const { id } = e.currentTarget.dataset;
    const userInfo = wx.getStorageSync('userInfo');
    
    if (!userInfo || !userInfo.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    const isLiked = this.data.likedExhibitions[id];
    const app = getApp();
    const baseUrl = app.globalData.baseUrl;
    
    // 确保userId是字符串类型
    const userId = String(userInfo.id);
    
    // 根据当前状态选择API
    const url = isLiked 
      ? `${baseUrl}/like/delLikeExh`
      : `${baseUrl}/like/addLikeExh`;
    
    wx.showLoading({
      title: isLiked ? '取消收藏中...' : '收藏中...'
    });
    
    console.log('收藏操作请求:', {
      url: url,
      userId: userId,
      collId: id
    });
    
    // 先更新本地状态
    const newLikedExhibitions = { ...this.data.likedExhibitions };
    if (isLiked) {
      delete newLikedExhibitions[id];
    } else {
      newLikedExhibitions[id] = true;
    }
    
    this.setData({
      likedExhibitions: newLikedExhibitions
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
        
        console.log('收藏操作响应:', {
          statusCode: res.statusCode,
          data: res.data
        });
        
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          // 刷新我的收藏页面的数据
          const pages = getCurrentPages();
          const myCollectionsPage = pages.find(page => page.route === 'pages/my-collections/index');
          if (myCollectionsPage) {
            myCollectionsPage.getExhibitionCollections(true);
          }
          
          wx.showToast({
            title: isLiked ? '已取消收藏' : '收藏成功',
            icon: 'success',
            duration: 2000
          });
        } else {
          // 操作失败，恢复之前的状态
          if (isLiked) {
            newLikedExhibitions[id] = true;
          } else {
            delete newLikedExhibitions[id];
          }
          
          this.setData({
            likedExhibitions: newLikedExhibitions
          });
          
          wx.showToast({
            title: res.data?.msg || '操作失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        console.error('收藏操作请求失败:', err);
        wx.hideLoading();
        
        // 网络错误，恢复之前的状态
        if (isLiked) {
          newLikedExhibitions[id] = true;
        } else {
          delete newLikedExhibitions[id];
        }
        
        this.setData({
          likedExhibitions: newLikedExhibitions
        });
        
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  
  // 检查用户已收藏的展览和藏品
  checkUserLikedItems() {
    const app = getApp();
    if (!app.globalData.isLogin || !app.globalData.userId) {
      console.log('用户未登录，无法获取收藏状态');
      return;
    }
    
    console.log('检查用户收藏状态，用户ID:', app.globalData.userId);
    
    // 获取用户收藏的藏品
    wx.request({
      url: `${this.data.baseUrl}/like/listUserLikes`,
      method: 'POST',
      data: {
        userId: app.globalData.userId,
        collType: 'COLL'
      },
      success: (res) => {
        console.log('用户收藏藏品列表响应:', res.data);
        
        if (res.data.code === 200) {
          const likedList = res.data.data || [];
          const likedItems = {};
          
          likedList.forEach(id => {
            likedItems[id] = true;
          });
          
          this.setData({ likedItems });
          console.log('更新藏品收藏状态完成，共', likedList.length, '个藏品');
        }
      },
      fail: (err) => {
        console.error('获取藏品收藏列表请求失败:', err);
      }
    });
    
    // 获取用户收藏的展览
    wx.request({
      url: `${this.data.baseUrl}/like/listUserLikes`,
      method: 'POST',
      data: {
        userId: app.globalData.userId,
        collType: 'EXH'  // 统一使用EXH作为展览类型标识
      },
      success: (res) => {
        console.log('用户收藏展览列表响应:', res.data);
        
        if (res.data.code === 200) {
          const likedList = res.data.data || [];
          const likedExhibitions = {};
          
          likedList.forEach(id => {
            likedExhibitions[id] = true;
          });
          
          this.setData({ likedExhibitions });
          console.log('更新展览收藏状态完成，共', likedList.length, '个展览');
        }
      },
      fail: (err) => {
        console.error('获取展览收藏列表请求失败:', err);
      }
    });
  },
})
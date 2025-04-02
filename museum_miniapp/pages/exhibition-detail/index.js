// 引入工具
const app = getApp();

Page({
  // 数据
  data: {
    baseUrl: '',
    exhibition: {}, // 展览详情
    isIntroFolded: true, // 简介是否折叠
    isHeaderFixed: false, // 头部是否吸顶
    isLoading: true, // 是否正在加载
    
    // 日期和时间段相关
    dateList: [], // 日期列表
    currentDate: '', // 当前选中日期
    timeSlots: [], // 时间段列表
    currentTimeSlot: -1, // 当前选中时间段索引
    timeSlotsLoading: false, // 时间段加载状态
    
    // 藏品相关
    collections: [], // 相关藏品
    collectionsLoading: false, // 藏品加载状态
    hasMoreCollections: true, // 是否有更多藏品
    collectionsPage: 1, // 藏品分页
    collectionsPageSize: 10, // 藏品每页数量
    
    // 预约相关
    canReserve: false, // 是否可以预约
    selectedTimeSlot: null, // 选中的时间段

    // 评论相关
    comments: [], // 评论列表
    commentText: '', // 评论内容
    commentsLoading: false, // 评论加载状态
    hasMoreComments: true, // 是否有更多评论
    commentsPage: 1, // 评论分页
    commentsPageSize: 10, // 评论每页数量
    showPrivacyModal: false, // 是否显示隐私协议弹窗
    showPhoneModal: false, // 是否显示手机号授权弹窗
    phoneNumber: '', // 手机号
    userInfo: null, // 用户信息
  },

  // 生命周期函数
  onLoad: function(options) {
    console.log('展览详情页面加载，参数:', options);
    
    // 初始化baseUrl
    const baseUrl = app.globalData.baseUrl || '';
    this.setData({
      baseUrl: baseUrl
    });
    
    // 获取展览ID
    const exhibitionId = options.id;
    if (!exhibitionId) {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    console.log('当前baseUrl:', baseUrl, '展览ID:', exhibitionId);
    
    // 保存展览ID
    this.setData({
      exhibitionId: exhibitionId
    });
    
    // 获取展览详情
    this.getExhibitionDetail(exhibitionId);
    
    // 获取评论列表
    this.getComments();
    
    // 监听页面滚动
    wx.createIntersectionObserver().relativeToViewport().observe('.header-section', (res) => {
      if (res.intersectionRatio < 0.5 && !this.data.isHeaderFixed) {
        this.setData({
          isHeaderFixed: true
        });
      } else if (res.intersectionRatio >= 0.5 && this.data.isHeaderFixed) {
        this.setData({
          isHeaderFixed: false
        });
      }
    });
  },
  
  onShow: function() {
    // 检查登录状态
    this.checkLoginStatus();
    
    // 添加自动刷新逻辑，确保从预约页面返回时能刷新时间段信息
    if (this.data.currentDate && this.data.exhibitionId) {
      console.log('页面显示，自动刷新当前日期的时间段:', this.data.currentDate);
      this.initTimeSlots(this.data.currentDate);
    }
  },
  
  // 下拉刷新
  onPullDownRefresh: function() {
    this.refreshData();
    // 刷新评论
    this.getComments(true);
  },
  
  // 上拉加载更多
  onReachBottom: function() {
    console.log('触发上拉加载更多，hasMoreCollections:', this.data.hasMoreCollections, 'collectionsLoading:', this.data.collectionsLoading);
    
    // 只有当有更多藏品且当前不在加载状态时才加载更多
    if (this.data.hasMoreCollections && !this.data.collectionsLoading) {
      this.loadMoreCollections();
    }
  },
  
  // 分享
  onShareAppMessage: function() {
    const exhibition = this.data.exhibition;
    return {
      title: exhibition.title || '博物馆展览详情',
      path: `/pages/exhibition-detail/index?id=${this.data.exhibitionId}`,
      imageUrl: exhibition.colPic ? `${this.data.baseUrl}/file/getPic?name=${exhibition.colPic}` : undefined
    };
  },
  
  // 获取展览详情
  getExhibitionDetail: function(exhibitionId) {
    console.log('正在获取展览详情，ID:', exhibitionId);
    
    this.setData({ isLoading: true });
    
    wx.showLoading({
      title: '加载中...'
    });
    
    // 请求API
    const apiUrl = `${this.data.baseUrl}/exhibition/detail/${exhibitionId}`;
    console.log('请求API:', apiUrl);
    
    wx.request({
      url: apiUrl,
      method: 'GET',
      success: (res) => {
        console.log('展览详情API响应:', res);
        
        if (res.data && res.data.code === 200) {
          const exhibition = this.processExhibitionData(res.data.data);
          console.log('处理后的展览数据:', exhibition);
          
          this.setData({
            exhibition: exhibition,
            isLoading: false
          });
          
          // 记录浏览历史
          this.recordViewHistory(exhibitionId, exhibition.name || exhibition.title, exhibition.colPic);
          
          // 初始化日期和时间段
          this.initDateAndTimeSlots(exhibition);
          
          // 获取相关藏品
          this.getRelatedCollections(exhibitionId);
        } else {
          console.log('API响应不成功');
          
          wx.showToast({
            title: res.data?.msg || '获取展览详情失败',
            icon: 'none'
          });
          
          this.setData({
            isLoading: false
          });
        }
      },
      fail: (err) => {
        console.log('API请求失败:', err);
        
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
        
        this.setData({
          isLoading: false
        });
      },
      complete: () => {
        wx.hideLoading();
        wx.stopPullDownRefresh();
      }
    });
  },
  
  // 处理展览数据
  processExhibitionData: function(exhibition) {
    if (!exhibition) return {};
    
    console.log('原始展览数据:', exhibition);
    
    // 格式化日期
    const startDate = exhibition.startDate || '';
    const endDate = exhibition.endDate || '';
    
    // 计算展览状态
    const currentDate = new Date();
    let status = 'upcoming'; // 默认即将开始
    
    // 将日期字符串转换为Date对象进行比较
    const startDateObj = new Date(startDate.replace(/\./g, '-'));
    const endDateObj = new Date(endDate.replace(/\./g, '-'));
    
    if (currentDate < startDateObj) {
      status = 'upcoming'; // 即将开始
    } else if (currentDate > endDateObj) {
      status = 'ended'; // 已结束
    } else {
      status = 'ongoing'; // 进行中
    }
    
    // 添加字段映射，确保WXML能正确显示
    return {
      ...exhibition,
      status: status,
      intro: exhibition.description || exhibition.intro || '' // 确保intro字段存在
    };
  },
  
  // 初始化日期和时间段
  initDateAndTimeSlots: function(exhibition) {
    if (!exhibition || !exhibition.startDate || !exhibition.endDate) return;
    
    // 解析开始和结束日期
    const startDate = new Date(exhibition.startDate.replace(/\./g, '-'));
    const endDate = new Date(exhibition.endDate.replace(/\./g, '-'));
    
    // 当前日期
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // 确定显示的起始日期（从当前日期或展览开始日期中取较大值）
    const displayStartDate = currentDate > startDate ? currentDate : startDate;
    
    // 计算日期范围（最多显示14天）
    const dateList = [];
    const maxDays = 14;
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    
    for (let i = 0; i < maxDays; i++) {
      const date = new Date(displayStartDate);
      date.setDate(displayStartDate.getDate() + i);
      
      // 如果超过展览结束日期，则停止
      if (date > endDate) break;
      
      // 判断是否为过去日期
      const isPast = date < currentDate;
      
      // 格式化日期 - 使用自定义的formatDate而不是util中的
      const formattedDate = this.formatDate(date, 'yyyy-MM-dd');
      const day = date.getDate().toString();
      const weekDay = weekDays[date.getDay()];
      
      dateList.push({
        date: formattedDate,
        day: day,
        week: weekDay,
        isPast: isPast
      });
    }
    
    console.log('生成的日期列表:', dateList);
    
    // 更新日期列表
    this.setData({
      dateList: dateList
    });
    
    // 如果有可用日期，默认选中第一个
    if (dateList.length > 0) {
      this.setData({
        currentDate: dateList[0].date
      });
      
      // 初始化时间段
      this.initTimeSlots(dateList[0].date);
    }
  },
  
  // 格式化日期（自定义函数，替代util.js中的formatDate）
  formatDate: function(date, format) {
    if (!date) return '';
    if (typeof date === 'string') date = new Date(date.replace(/-/g, '/'));
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    format = format || 'yyyy-MM-dd';
    return format
      .replace(/yyyy/g, year)
      .replace(/MM/g, month.toString().padStart(2, '0'))
      .replace(/dd/g, day.toString().padStart(2, '0'));
  },
  
  // 初始化时间段
  initTimeSlots: function(date) {
    if (!date) return;
    
    console.log('初始化日期的时间段:', date);
    
    // 设置加载状态
    this.setData({
      timeSlotsLoading: true
    });
    
    // 从后端API获取时间段数据
    wx.request({
      url: `${this.data.baseUrl}/reserve/timeslots`,
      method: 'GET',
      data: {
        exhibitionId: this.data.exhibitionId,
        date: date,
        useRealData: true,  // 使用真实数据
        _t: new Date().getTime() // 添加时间戳避免缓存
      },
      success: (res) => {
        console.log('时间段API响应:', res);
        
        if (res.data && res.data.code === 200 && Array.isArray(res.data.data)) {
          const timeSlotsData = res.data.data;
          console.log('处理前的时间段数据:', timeSlotsData);
          
          // 输出详细的每个时间段字段信息，用于调试
          timeSlotsData.forEach((slot, index) => {
            console.log(`时间段${index+1}详细信息:`, {
              startTime: slot.startTime,
              endTime: slot.endTime,
              totalSlots: slot.totalSlots,
              bookedSlots: slot.bookedSlots,
              availableSlots: slot.availableSlots,
              session: slot.session
            });
          });
          
          // 处理从后端返回的时间段数据
          const timeSlots = timeSlotsData.map(slot => {
            // 处理字段，兼容不同的字段命名方式
            const availableSlots = parseInt(slot.availableSlots || 0);
            const totalSlots = parseInt(slot.totalSlots || 45);
            const bookedSlots = parseInt(slot.bookedSlots || 0);
            
            return {
              id: slot.id, // 添加id字段
              startTime: slot.startTime || '',
              endTime: slot.endTime || '',
              totalSlots: totalSlots,
              bookedSlots: bookedSlots,
              availableSlots: availableSlots,
              isPast: false,  // 默认不是过期时间段，下面会进一步判断
              isFull: availableSlots <= bookedSlots,
              session: slot.session || '', // 保存场次信息
              date: date, // 添加日期字段
              timeSlot: `${slot.startTime}-${slot.endTime}` // 添加完整时间段字符串
            };
          });
          
          console.log('处理后的时间段数据:', timeSlots);
          
          // 标记过期时间段
          const now = new Date();
          const selectedDate = new Date(date);
          const isToday = selectedDate.toDateString() === now.toDateString();
          
          if (isToday) {
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            
            timeSlots.forEach(slot => {
              // 解析时间段的开始时间
              const [startHour, startMinute] = slot.startTime.split(':').map(Number);
              
              // 如果今天的时间段已经过了，标记为过期
              if (currentHour > startHour || (currentHour === startHour && currentMinute > startMinute)) {
                slot.isPast = true;
              }
            });
          }
          
          // 更新时间段数据
          this.setData({
            timeSlots: timeSlots,
            timeSlotsLoading: false
          });
          
          // 如果有可用的时间段，默认选择第一个非过期、非满的时间段
          const availableSlotIndex = timeSlots.findIndex(slot => 
            !slot.isPast && !slot.isFull);
          
          if (availableSlotIndex !== -1) {
            this.setData({
              currentTimeSlot: availableSlotIndex,
              canReserve: true,
              selectedTimeSlot: timeSlots[availableSlotIndex]
            });
          } else {
            // 没有可用时间段
            this.setData({
              currentTimeSlot: -1,
              canReserve: false,
              selectedTimeSlot: null
            });
          }
        } else {
          console.log('时间段API响应错误或数据格式不对');
          
          this.setData({
            timeSlots: [],
            timeSlotsLoading: false,
            currentTimeSlot: -1,
            canReserve: false,
            selectedTimeSlot: null
          });
          
          wx.showToast({
            title: '获取时间段失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.log('时间段API请求失败:', err);
        
        this.setData({
          timeSlots: [],
          timeSlotsLoading: false,
          currentTimeSlot: -1,
          canReserve: false,
          selectedTimeSlot: null
        });
        
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      }
    });
  },
  
  // 获取相关藏品
  getRelatedCollections: function(exhibitionId, page = 1) {
    console.log('获取相关藏品，展览ID:', exhibitionId, '页码:', page);
    
    // 设置加载状态
    this.setData({
      collectionsLoading: true
    });
    
    // 请求相关藏品
    wx.request({
      url: `${this.data.baseUrl}/exhibition/collections/${exhibitionId}`,
      method: 'GET',
      success: (res) => {
        console.log('藏品API响应:', res);
        
        if (res.data && res.data.code === 200) {
          // 数据可能直接在data中，或者在data.list中
          const newCollections = Array.isArray(res.data.data) ? res.data.data : (res.data.data.list || []);
          const total = res.data.data.total || newCollections.length || 0;
          
          // 处理字段名称映射
          const processedCollections = newCollections.map(item => {
            return {
              ...item,
              // 确保字段映射正确，适配WXML中的字段名
              id: item.id || item.collectionId,
              name: item.title || item.name || '',
              picturePath: item.colPic || item.picturePath || '',
              dynasty: item.origin || item.dynasty || '未知年代',
              description: item.desColl || item.description || ''
            };
          });
          
          console.log('处理后的藏品数据:', processedCollections);
          
          // 如果是第一页，覆盖数据，否则追加
          const collections = page === 1 ? processedCollections : [...this.data.collections, ...processedCollections];
          
          this.setData({
            collections: collections,
            hasMoreCollections: collections.length < total,
            collectionsPage: page,
            collectionsLoading: false // 确保在成功时设置loading为false
          });
        } else {
          console.log('藏品API响应不成功，尝试备用API');
          // 尝试第二种API格式
          this.tryFallbackCollectionsAPI(exhibitionId, page);
        }
      },
      fail: (err) => {
        console.log('藏品API请求失败，尝试备用API:', err);
        // 尝试第二种API格式
        this.tryFallbackCollectionsAPI(exhibitionId, page);
      }
    });
  },
  
  // 尝试备用API获取展览相关藏品
  tryFallbackCollectionsAPI: function(exhibitionId, page = 1) {
    wx.request({
      url: `${this.data.baseUrl}/exhibition/collections`,
      method: 'GET',
      data: {
        exhibitionId: exhibitionId,
        pageNum: page,
        pageSize: this.data.collectionsPageSize
      },
      success: (res) => {
        console.log('备用藏品API响应:', res);
        
        if (res.data && res.data.code === 200) {
          const newCollections = res.data.data.list || [];
          const total = res.data.data.total || 0;
          
          // 处理字段名称映射
          const processedCollections = newCollections.map(item => {
            return {
              ...item,
              // 确保字段映射正确，适配WXML中的字段名
              name: item.title || item.name || '',
              picturePath: item.colPic || item.picturePath || '',
              dynasty: item.origin || item.dynasty || '未知年代',
              description: item.desColl || item.description || ''
            };
          });
          
          console.log('处理后的藏品数据:', processedCollections);
          
          // 如果是第一页，覆盖数据，否则追加
          const collections = page === 1 ? processedCollections : [...this.data.collections, ...processedCollections];
          
          this.setData({
            collections: collections,
            hasMoreCollections: collections.length < total,
            collectionsPage: page,
            collectionsLoading: false // 确保在成功时设置loading为false
          });
        } else {
          console.log('备用藏品API响应不成功');
          
          if (page === 1) {
            // 第一页数据获取失败时，显示空数据
            this.setData({
              collections: [],
              hasMoreCollections: false,
              collectionsLoading: false
            });
          } else {
            // 非第一页获取失败，保留已有数据，停止加载更多
            this.setData({
              hasMoreCollections: false,
              collectionsLoading: false
            });
          }
          
          wx.showToast({
            title: '获取藏品数据失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.log('备用藏品API请求失败:', err);
        
        if (page === 1) {
          // 第一页数据获取失败时，显示空数据
          this.setData({
            collections: [],
            hasMoreCollections: false,
            collectionsLoading: false
          });
        } else {
          // 非第一页获取失败，保留已有数据，停止加载更多
          this.setData({
            hasMoreCollections: false,
            collectionsLoading: false
          });
        }
        
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      }
    });
  },
  
  // 加载更多藏品
  loadMoreCollections: function() {
    if (this.data.hasMoreCollections && !this.data.collectionsLoading) {
      const nextPage = this.data.collectionsPage + 1;
      
      // 设置加载状态
      this.setData({
        collectionsLoading: true
      });
      
      // 获取下一页藏品
      this.getRelatedCollections(this.data.exhibitionId, nextPage);
    }
  },
  
  // 刷新数据
  refreshData: function() {
    this.getExhibitionDetail(this.data.exhibitionId);
  },
  
  // 检查登录状态
  checkLoginStatus: function() {
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({
      isLoggedIn: !!userInfo
    });
  },
  
  // 折叠/展开简介
  toggleIntro: function() {
    this.setData({
      isIntroFolded: !this.data.isIntroFolded
    });
  },
  
  // 日期选择
  onDateSelect: function(e) {
    const date = e.currentTarget.dataset.date;
    const index = e.currentTarget.dataset.index;
    
    // 如果是禁用状态或已选中状态，不作处理
    if (this.data.dateList[index].isPast || this.data.currentDate === date) {
      return;
    }
    
    console.log('切换到日期:', date);
    
    // 更新选中的日期
    this.setData({
      currentDate: date,
      timeSlots: [], // 清空时间段，避免显示旧数据
      currentTimeSlot: -1, // 重置时间段选择
      canReserve: false,
      selectedTimeSlot: null
    });
    
    // 更新时间段
    this.initTimeSlots(date);
  },
  
  // 选择时间段
  onTimeSelect: function(e) {
    const index = e.currentTarget.dataset.index;
    const timeSlot = this.data.timeSlots[index];
    
    // 检查时间段是否可选
    if (timeSlot.isFull || timeSlot.isPast) {
      return;
    }
    
    this.setData({
      currentTimeSlot: index,
      selectedTimeSlot: timeSlot,
      canReserve: true
    });
    
    console.log('选择时间段:', timeSlot);
  },
  
  // 藏品点击
  onCollectionTap: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/collection-detail/index?id=${id}`
    });
  },
  
  // 点击预约按钮
  onReserveTap: function() {
    if (!this.data.canReserve || !this.data.selectedTimeSlot) {
      wx.showToast({
        title: '请先选择预约时间',
        icon: 'none'
      });
      return;
    }
    
    // 检查登录状态
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      
      // 跳转到登录页面
      wx.navigateTo({
        url: '/pages/login/index'
      });
      return;
    }
    
    // 获取选中的时间段信息
    const timeSlot = this.data.selectedTimeSlot;
    
    // 弹出预约确认框
    wx.showModal({
      title: '预约确认',
      content: `您确定要预约以下时间吗？\n日期：${timeSlot.date}\n时间：${timeSlot.timeSlot}\n场次：${timeSlot.session}`,
      success: (res) => {
        if (res.confirm) {
          this.makeReservation(timeSlot);
        }
      }
    });
  },
  
  // 发起预约请求
  makeReservation: function(timeSlot) {
    const userInfo = wx.getStorageSync('userInfo');
    
    wx.showLoading({
      title: '预约中...',
      mask: true
    });
    
    // 确保参数类型正确
    const timeSlotId = parseInt(timeSlot.id);
    // 确保userId是整数类型
    const userId = parseInt(userInfo.id);
    
    // 调用预约接口
    wx.request({
      url: `${this.data.baseUrl}/reserve/make`,
      method: 'POST',
      data: {
        userId: userId,
        timeSlotId: timeSlotId,
        userCount: 1 // 默认预约1人
      },
      success: (res) => {
        console.log('预约结果:', res);
        
        if (res.data && res.data.code === 200) {
          wx.showToast({
            title: '预约成功',
            icon: 'success'
          });
          
          // 更新时间段信息
          this.refreshTimeSlots();
          
          // 跳转到我的预约页面
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/my-reservations/index'
            });
          }, 1500);
        } else {
          // 增强错误日志
          console.error('预约失败，错误信息:', res.data);
          console.error('请求参数:', {
            userId: userId,
            timeSlotId: timeSlotId,
            userCount: 1
          });
          
          wx.showToast({
            title: res.data?.msg || '预约失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        console.error('预约请求失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },
  
  // 刷新时间段信息
  refreshTimeSlots: function() {
    if (this.data.currentDate) {
      this.getTimeSlots(this.data.currentDate);
    }
  },
  
  // 获取时间段列表
  getTimeSlots: function(date) {
    this.setData({
      timeSlotsLoading: true
    });
    
    wx.request({
      url: `${this.data.baseUrl}/reserve/timeslots`,
      method: 'GET',
      data: {
        exhibitionId: this.data.exhibitionId,
        date: date
      },
      success: (res) => {
        console.log('时间段数据:', res);
        
        if (res.data && res.data.code === 200) {
          const timeSlots = res.data.data.map(slot => ({
            ...slot,
            isFull: slot.availableSlots <= slot.bookedSlots,
            isPast: this.isTimePast(date, slot.startTime),
          }));
          
          this.setData({
            timeSlots: timeSlots,
            timeSlotsLoading: false
          });
        } else {
          this.setData({
            timeSlots: [],
            timeSlotsLoading: false
          });
          
          wx.showToast({
            title: res.data?.msg || '获取时间段失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('获取时间段失败:', err);
        this.setData({
          timeSlots: [],
          timeSlotsLoading: false
        });
        
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },
  
  // 判断时间是否已过
  isTimePast: function(date, time) {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const targetTime = new Date(date);
    targetTime.setHours(hours, minutes);
    return now > targetTime;
  },

  // 评论相关方法
  
  // 获取评论列表
  getComments(refresh = false) {
    if (!this.data.baseUrl || !this.data.exhibitionId) {
      console.log('无法获取评论数据，baseUrl或exhibitionId未定义')
      this.setData({
        comments: [],
        commentsLoading: false
      });
      return;
    }
    
    // 设置加载状态
    this.setData({
      commentsLoading: true
    });
    
    // 获取用户信息并更新到data中
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({ userInfo })
    console.log('当前登录用户ID:', userInfo ? userInfo.id : '未登录', '类型:', typeof (userInfo ? userInfo.id : null))
    
    wx.request({
      url: `${this.data.baseUrl}/feedBack/listFeedBackByUser`,
      method: 'POST',
      data: {
        cateId: this.data.exhibitionId
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        console.log('评论列表响应:', res.data)
        
        if (res.statusCode === 200 && res.data && res.data.code === 200 && res.data.data && res.data.data.list) {
          const comments = res.data.data.list
          
          // 输出每条评论的用户ID，便于调试
          comments.forEach(comment => {
            console.log('评论ID:', comment.id, '用户ID:', comment.userId, '类型:', typeof comment.userId)
            // 为了方便前端比较，将userId统一转为字符串
            comment.userId = comment.userId ? String(comment.userId) : null
          })
          
          // 获取用户登录信息
          if (userInfo && userInfo.id) {
            // 转为字符串便于比较
            userInfo.id = String(userInfo.id)
            this.setData({ userInfo })
            
            // 获取用户点赞状态
            this.getUserLikedComments(userInfo.id, comments)
          } else {
            // 未登录，所有评论都标记为未点赞
            comments.forEach(comment => {
              comment.isLiked = false
            })
            
            this.setData({
              comments,
              commentsLoading: false
            })
          }
        } else {
          console.log('获取评论失败')
          this.setData({
            comments: [],
            commentsLoading: false
          })
        }
      },
      fail: (err) => {
        console.error('获取评论列表失败:', err)
        this.setData({
          comments: [],
          commentsLoading: false
        })
        
        wx.showToast({
          title: '网络错误，无法获取评论',
          icon: 'none'
        });
      }
    })
  },
  
  // 获取用户点赞的评论
  getUserLikedComments(userId, comments) {
    console.log('正在获取用户点赞状态, 请求URL:', `${this.data.baseUrl}/feedBack/getUserLikedComments`)
    console.log('参数:', { userId: userId })
    
    wx.request({
      url: `${this.data.baseUrl}/feedBack/getUserLikedComments`,
      method: 'POST',
      data: {
        userId: userId
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        console.log('用户点赞评论列表响应:', {
          statusCode: res.statusCode,
          data: res.data,
          url: `${this.data.baseUrl}/feedBack/getUserLikedComments`,
          params: { userId }
        })
        
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          const likedCommentIds = res.data.data || []
          
          // 更新评论点赞状态
          comments.forEach(comment => {
            comment.isLiked = likedCommentIds.includes(comment.id)
          })
        } else {
          console.error('获取用户点赞列表失败:', res.statusCode, res.data)
          // 标记所有评论为未点赞
          comments.forEach(comment => {
            comment.isLiked = false
          })
        }
        
        this.setData({
          comments,
          commentsLoading: false
        })
      },
      fail: (err) => {
        console.error('获取用户点赞评论失败:', err)
        
        // 标记所有评论为未点赞
        comments.forEach(comment => {
          comment.isLiked = false
        })
        
        this.setData({
          comments,
          commentsLoading: false
        })
      }
    })
  },
  
  // 评论输入框内容变化
  onCommentInput(e) {
    this.setData({
      commentText: e.detail.value
    });
  },
  
  // 提交评论
  onCommentSubmit() {
    // 检查登录状态
    const app = getApp()
    if (!app.globalData.isLogin) {
      // 未登录，先跳转到登录页
      wx.navigateTo({
        url: `/pages/login/index?redirect=/pages/exhibition-detail/index?id=${this.data.exhibitionId}`
      })
      return
    }
    
    // 检查评论内容
    if (!this.data.commentText.trim()) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none'
      })
      return
    }
    
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    // 显示加载提示
    wx.showLoading({
      title: '提交中...'
    })
    
    // 发送请求
    wx.request({
      url: `${this.data.baseUrl}/feedBack/addFeedBack`,
      method: 'POST',
      data: {
        userId: String(userInfo.id),
        cateId: this.data.exhibitionId,
        feedContent: this.data.commentText,
        userName: userInfo.username || userInfo.nickName || '博物馆游客'
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        wx.hideLoading()
        
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          // 清空输入框
          this.setData({
            commentText: ''
          })
          
          // 显示成功提示
          wx.showToast({
            title: '评论成功',
            icon: 'success'
          })
          
          // 重新获取评论列表
          setTimeout(() => {
            this.getComments(true)
          }, 500)
        } else {
          // 显示错误信息
          wx.showToast({
            title: res.data?.msg || '评论失败，请稍后重试',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('评论请求失败:', err)
        
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      }
    })
  },
  
  // 点赞评论
  onCommentLikeTap(e) {
    const { id } = e.currentTarget.dataset
    
    // 检查登录状态
    const app = getApp()
    if (!app.globalData.isLogin) {
      // 未登录，先跳转到登录页
      wx.navigateTo({
        url: `/pages/login/index?redirect=/pages/exhibition-detail/index?id=${this.data.exhibitionId}`
      })
      return
    }
    
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    // 显示加载提示
    wx.showLoading({
      title: '处理中...'
    })
    
    console.log('发送点赞请求:', {
      url: `${this.data.baseUrl}/feedBack/toggleLikeFeedBack`,
      userId: String(userInfo.id),
      feedbackId: id
    })
    
    // 发送请求
    wx.request({
      url: `${this.data.baseUrl}/feedBack/toggleLikeFeedBack`,
      method: 'POST',
      data: {
        userId: String(userInfo.id),
        feedbackId: id
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        wx.hideLoading()
        
        console.log('点赞操作响应:', {
          statusCode: res.statusCode,
          data: res.data,
          url: `${this.data.baseUrl}/feedBack/toggleLikeFeedBack`
        })
        
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          const result = res.data.data || {}
          const isLiked = result.isLiked
          
          // 更新本地评论数据
          const comments = this.data.comments.map(item => {
            if (item.id === id) {
              // 更新点赞状态
              const newLikeCount = isLiked ? 
                (item.likeCount || 0) + 1 : 
                Math.max(0, (item.likeCount || 0) - 1)
                
              return {
                ...item,
                isLiked: isLiked,
                likeCount: newLikeCount
              }
            }
            return item
          })
          
          this.setData({
            comments
          })
          
          // 显示成功提示
          wx.showToast({
            title: result.message || (isLiked ? '点赞成功' : '取消点赞成功'),
            icon: 'success'
          })
        } else {
          // 显示错误信息
          console.error('点赞操作失败:', res.statusCode, res.data)
          wx.showToast({
            title: res.data?.msg || '操作失败，请稍后重试',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('点赞请求失败:', err)
        
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      }
    })
  },
  
  // 删除评论
  onCommentDeleteTap(e) {
    const { id } = e.currentTarget.dataset
    
    // 确认是否删除
    wx.showModal({
      title: '提示',
      content: '确定要删除这条评论吗？',
      success: (res) => {
        if (res.confirm) {
          this.deleteComment(id)
        }
      }
    })
  },
  
  // 执行删除评论的请求
  deleteComment(feedbackId) {
    // 检查登录状态
    const app = getApp()
    if (!app.globalData.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    // 显示加载提示
    wx.showLoading({
      title: '删除中...'
    })
    
    // 发送请求
    wx.request({
      url: `${this.data.baseUrl}/feedBack/delFeedBack`,
      method: 'POST',
      data: {
        id: feedbackId,
        userId: String(userInfo.id) // 传入用户ID用于权限验证
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        wx.hideLoading()
        
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          // 删除成功，从本地评论数组中移除
          const newComments = this.data.comments.filter(item => item.id !== feedbackId)
          
          this.setData({
            comments: newComments
          })
          
          // 显示成功提示
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        } else {
          // 显示错误信息
          wx.showToast({
            title: res.data?.msg || '删除失败，请稍后重试',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('删除评论请求失败:', err)
        
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      }
    })
  },
  
  // 检查登录状态
  checkLoginStatus(redirect = false) {
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({
      userInfo: userInfo
    });
    
    // 判断是否登录
    if (app.globalData.isLogin && userInfo) {
      return true;
    }
    
    // 未登录，显示隐私协议
    if (redirect) {
      // 使用app的统一登录流程
      return app.checkLoginAndShowPrivacy(this, '/pages/exhibition-detail/index?id=' + this.data.exhibitionId);
    }
    
    return false;
  },
  
  // 隐私协议相关
  onPrivacyAgree() {
    this.setData({ showPrivacyModal: false, showPhoneModal: true });
  },
  
  onPrivacyReject() {
    this.setData({ showPrivacyModal: false });
    wx.showToast({
      title: '需要同意隐私协议才能继续',
      icon: 'none'
    });
  },
  
  // 手机号授权相关
  onPhoneConfirm() {
    this.setData({ showPhoneModal: false });
    // 跳转到登录页
    wx.navigateTo({
      url: '/pages/login/index?redirect=' + encodeURIComponent('/pages/exhibition-detail/index?id=' + this.data.exhibitionId)
    });
  },
  
  onPhoneReject() {
    this.setData({ showPhoneModal: false });
    wx.showToast({
      title: '需要授权手机号才能继续',
      icon: 'none'
    });
  },
  
  onUseOtherPhone() {
    this.setData({ showPhoneModal: false });
    // 跳转到登录页
    wx.navigateTo({
      url: '/pages/login/index?redirect=' + encodeURIComponent('/pages/exhibition-detail/index?id=' + this.data.exhibitionId)
    });
  },
  
  // 添加记录浏览历史的方法
  recordViewHistory(exhibitionId, title, picUrl) {
    // 从本地存储中获取现有的浏览历史
    let historyData = wx.getStorageSync('viewHistory') || []
    
    // 当前时间格式化（YYYY-MM-DD HH:MM）
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')
    const viewTime = `${year}-${month}-${day} ${hour}:${minute}`
    
    // 构建历史记录对象
    const historyItem = {
      id: exhibitionId,
      type: 'exhibition',
      title: title,
      colPic: picUrl || '',
      desc: this.data.exhibition.location || '临展馆',
      viewTime: viewTime
    }
    
    // 检查历史记录中是否已存在该项目
    const existingIndex = historyData.findIndex(item => item.id === historyItem.id && item.type === historyItem.type)
    
    if (existingIndex !== -1) {
      // 如果已存在，删除旧记录
      historyData.splice(existingIndex, 1)
    }
    
    // 将新记录添加到列表开头
    historyData.unshift(historyItem)
    
    // 限制历史记录数量，最多保存50条
    if (historyData.length > 50) {
      historyData = historyData.slice(0, 50)
    }
    
    // 保存到本地存储
    wx.setStorageSync('viewHistory', historyData)
  },
  
}); 
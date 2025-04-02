const app = getApp()

Page({
  data: {
    reserveList: [], // 我的预约列表
    pageNum: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    baseUrl: '', // 存储基础URL
    showPrivacyModal: false,
    showPhoneModal: false,
    phoneNumber: '138****1234', // 示例手机号
    userInfo: {}, // 用户信息
    userId: '' // 用户ID
  },

  onLoad() {
    // 获取全局baseUrl
    const baseUrl = app.globalData.baseUrl
    this.setData({
      baseUrl: baseUrl
    })
    
    // 获取用户信息
    this.getUserInfo()
  },
  
  onShow() {
    // 每次页面显示时刷新数据
    this.getUserInfo()
  },
  
  // 获取用户信息
  getUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || {}
    const userId = wx.getStorageSync('userId') || ''
    
    this.setData({
      userInfo: userInfo,
      userId: userId
    }, () => {
      // 在设置完用户信息后获取预约列表
      if (userId) {
        this.getReservationList()
      } else {
        console.log('用户未登录或用户ID不存在')
        // 可以在这里处理未登录状态
      }
    })
  },

  // 获取预约列表
  getReservationList() {
    // 检查登录状态
    if (!this.checkLogin()) return;
    
    const baseUrl = app.globalData.baseUrl;
    const userId = this.data.userId;
    
    if (!userId) {
      console.log('用户ID不存在，无法获取预约列表');
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ loading: true });
    
    console.log('获取用户预约列表, 用户ID:', userId);
    
    // 使用POST请求和/reserveDetail/listDetailReserve端点
    wx.request({
      url: `${baseUrl}/reserveDetail/listDetailReserve`,
      method: 'POST',
      data: {
        userId: userId,
        pagenum: this.data.pageNum,
        pagesize: this.data.pageSize
      },
      header: {
        'Content-Type': 'application/json',
        'Authorization': wx.getStorageSync('token') || ''
      },
      success: (res) => {
        console.log('预约列表API结果:', res.data);
        
        if (res.data && res.data.code === 200) {
          const list = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.list || []);
          
          // 处理预约数据
          const processedList = this.processReservationData(list);
          
          this.setData({
            reserveList: processedList,
            total: res.data.data.total || 0,
            loading: false
          });
        } else {
          console.log('API返回错误');
          this.setData({
            reserveList: [],
            loading: false
          });
          
          wx.showToast({
            title: '获取预约列表失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.log('预约列表请求失败:', err);
        this.setData({
          reserveList: [],
          loading: false
        });
        
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      }
    });
  },
  
  // 处理预约数据
  processReservationData(list) {
    const now = new Date();
    
    return list.map(item => {
      // 计算预约状态
      const reserveDate = new Date(item.resDate.replace(/-/g, '/'));
      const [startHour, startMinute] = (item.resTime || '').split(':').map(Number);
      const reserveTime = new Date(reserveDate);
      reserveTime.setHours(startHour || 0, startMinute || 0);
      
      let status = 'upcoming';
      let statusClass = 'active';
      
      if (item.vldStat === '0') {
        status = 'cancelled';
        statusClass = 'canceled';
      } else if (item.vldStat === '2') {
        status = 'completed';
        statusClass = 'active';
      } else if (now > reserveTime) {
        status = 'expired';
        statusClass = 'expired';
      }
      
      // 获取展览信息
      const exhibitionName = item.cateTitle || '未知展览';
      
      return {
        ...item,
        // 确保字段映射正确
        id: item.id || '',
        exhibitionId: item.resId || '',
        exhibitionName: exhibitionName,
        date: item.resDate || '',
        timeSlot: item.resTime || '',
        code: item.id || '', // 使用预约ID作为预约码
        status: status,
        statusClass: statusClass
      };
    });
  },
  
  // 获取状态样式类
  getStatusClass(vldStat, resDate) {
    if (vldStat !== '1') return 'canceled'
    
    const now = new Date()
    const reserveDate = new Date(resDate)
    
    // 只比较年月日，忽略时间部分
    const reserveDateOnly = new Date(reserveDate.getFullYear(), reserveDate.getMonth(), reserveDate.getDate())
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    return reserveDateOnly >= nowDateOnly ? 'active' : 'expired'
  },
  
  // 对预约列表进行排序
  sortReservations(list) {
    const now = new Date()
    
    return list.sort((a, b) => {
      // 首先按有效状态排序（有效的排在前面）
      if (a.vldStat !== b.vldStat) {
        return b.vldStat.localeCompare(a.vldStat)
      }
      
      // 然后按日期排序
      const dateA = new Date(a.resDate)
      const dateB = new Date(b.resDate)
      
      // 计算与当前日期的时间差
      const diffA = dateA - now
      const diffB = dateB - now
      
      // 未来的日期排在前面，过去的日期排在后面
      if (diffA >= 0 && diffB < 0) return -1
      if (diffA < 0 && diffB >= 0) return 1
      
      // 如果都是未来日期，近期的排在前面
      if (diffA >= 0 && diffB >= 0) return diffA - diffB
      
      // 如果都是过去日期，近期的排在前面
      return diffB - diffA
    })
  },
  
  // 取消预约
  onCancelTap(e) {
    const { id } = e.currentTarget.dataset
    const item = this.data.reserveList.find(item => item.id === id)
    
    // 确认取消
    wx.showModal({
      title: '确认取消',
      content: `您确定要取消"${item.exhibitionName}"的预约吗？`,
      success: (res) => {
        if (res.confirm) {
          this.cancelReservation(item)
        }
      }
    })
  },
  
  // 提交取消预约请求
  cancelReservation(item) {
    wx.showLoading({ title: '取消中...' })
    
    console.log('取消预约数据:', JSON.stringify({
      id: item.id,
      vldStat: '0'
    }));
    
    // 使用更安全的API端点 - 专用取消预约接口
    wx.request({
      url: `${this.data.baseUrl}/reserveDetail/updateStatusOnly`,
      method: 'POST',
      data: {
        id: item.id,
        vldStat: '0' // 设置为无效
      },
      header: {
        'Content-Type': 'application/json',
        'Authorization': wx.getStorageSync('token') || ''
      },
      success: (res) => {
        console.log('取消预约响应:', res.data);
        if (res.data.code === 200) {
          wx.showToast({
            title: '取消成功',
            icon: 'success'
          })
          // 刷新列表
          setTimeout(() => {
            this.getReservationList()
          }, 1500)
        } else {
          wx.showToast({
            title: res.data.msg || '取消失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('取消预约请求失败:', err);
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
  
  // 获取状态文本
  getStatusText(vldStat, resDate) {
    if (vldStat !== '1') return '已取消'
    
    const now = new Date()
    const reserveDate = new Date(resDate)
    
    // 只比较年月日，忽略时间部分
    const reserveDateOnly = new Date(reserveDate.getFullYear(), reserveDate.getMonth(), reserveDate.getDate())
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    return reserveDateOnly >= nowDateOnly ? '已预约' : '已过期'
  },
  
  // 检查是否可以取消
  canCancel(vldStat, resDate) {
    console.log("检查是否可取消:", vldStat, resDate); // 调试日志
    
    if (vldStat !== '1') return false
    
    const now = new Date()
    const reserveDate = new Date(resDate)
    
    // 只比较年月日，忽略时间部分
    const reserveDateOnly = new Date(reserveDate.getFullYear(), reserveDate.getMonth(), reserveDate.getDate())
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    const canCancel = reserveDateOnly >= nowDateOnly;
    console.log("是否可取消结果:", canCancel); // 调试日志
    
    // 只有未过期的有效预约可以取消
    return canCancel
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      pageNum: 1,
      reserveList: []
    })
    this.getReservationList()
    wx.stopPullDownRefresh()
  },
  
  // 上拉加载更多
  onReachBottom() {
    if (this.data.reserveList.length < this.data.total) {
      this.setData({
        pageNum: this.data.pageNum + 1
      })
      this.getReservationList()
    }
  },

  // 检查登录状态
  checkLogin() {
    const token = wx.getStorageSync('token');
    const userId = this.data.userId;
    
    if (!token || !userId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      
      // 可以选择跳转到登录页面
      // wx.navigateTo({
      //   url: '/pages/login/index'
      // });
      
      return false;
    }
    
    return true;
  }
}) 
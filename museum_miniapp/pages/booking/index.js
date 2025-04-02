const app = getApp()

Page({
  data: {
    reserveList: [], // 预约列表
    pageNum: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    baseUrl: '', // 存储基础URL
    showPrivacyModal: false,
    showPhoneModal: false,
    phoneNumber: '',
    today: '', // 当前日期
    
    // 新增参数处理相关字段
    type: '', // 预约类型：exhibition, collection
    exhibitionId: null, // 展览ID
    collectionId: null, // 藏品ID
    date: '', // 预约日期
    startTime: '', // 开始时间
    endTime: '', // 结束时间
    
    // 预约确认相关
    showConfirmView: false, // 是否显示确认视图
    selectedItem: null, // 选中的预约项目
    
    // 添加时间段和场次映射
    timeSessionMap: {
      '8:30~11:00': '第一场',
      '14:30~17:00': '第二场'
    }
  },

  onLoad(options) {
    console.log('booking页面onLoad, 参数:', options)
    
    // 获取全局baseUrl
    const baseUrl = app.globalData.baseUrl
    
    // 获取今天的日期，格式为YYYY-MM-DD
    const today = this.getTodayString()
    
    // 处理URL参数
    const type = options.type || ''
    const exhibitionId = options.exhibitionId || options.id || null
    const collectionId = options.collId || null
    const date = options.date || ''
    const startTime = options.startTime || ''
    const endTime = options.endTime || ''
    
    this.setData({
      baseUrl: baseUrl,
      today: today,
      type: type,
      exhibitionId: exhibitionId,
      collectionId: collectionId,
      date: date,
      startTime: startTime,
      endTime: endTime
    })
    
    // 如果有具体的展览ID和时间，说明是从展览详情页来的，直接进入确认预约流程
    if (exhibitionId && date && startTime && endTime) {
      this.loadExhibitionDetails(exhibitionId, date, startTime, endTime)
    } 
    // 如果有展览ID但没有时间信息，获取该展览的可预约场次
    else if (exhibitionId) {
      this.loadExhibitionSessions(exhibitionId)
    }
    // 如果有藏品ID，获取与该藏品相关的预约场次
    else if (collectionId) {
      this.loadCollectionSessions(collectionId)
    }
    // 没有特定参数，获取所有预约场次
    else {
      this.getReserveList()
    }
  },
  
  // 加载特定展览的详情用于确认预约
  loadExhibitionDetails(exhibitionId, date, startTime, endTime) {
    wx.showLoading({ title: '加载展览信息...' })
    
    wx.request({
      url: `${this.data.baseUrl}/exhibition/detail/${exhibitionId}`,
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.code === 200) {
          const exhibition = res.data.data
          
          // 创建预约确认对象
          const confirmItem = {
            exhibitionId: exhibitionId,
            title: exhibition.title,
            date: date,
            startTime: startTime,
            endTime: endTime,
            timeSlot: `${startTime}-${endTime}`
          }
          
          this.setData({
            selectedItem: confirmItem,
            showConfirmView: true
          })
        } else {
          wx.showToast({
            title: '获取展览信息失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },
  
  // 加载展览的可预约场次
  loadExhibitionSessions(exhibitionId) {
    this.setData({ loading: true })
    
    wx.request({
      url: `${this.data.baseUrl}/reserve/listMsReserve`,
      method: 'POST',
      data: {
        exhibitionId: exhibitionId,
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize
      },
      success: (res) => {
        if (res.data && res.data.code === 200) {
          const list = res.data.data.list || []
          const total = res.data.data.total || 0
          
          // 处理列表数据
          const processedList = list.map(item => {
            item.isExpired = this.isExpired(item.resDate)
            return item
          })
          
          this.setData({
            reserveList: processedList,
            total: total
          })
        } else {
          wx.showToast({
            title: res.data?.msg || '获取预约场次失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },
  
  // 加载藏品相关的预约场次
  loadCollectionSessions(collectionId) {
    this.setData({ loading: true })
    
    wx.request({
      url: `${this.data.baseUrl}/reserve/listMsReserve`,
      method: 'POST',
      data: {
        cateId: collectionId,
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize
      },
      success: (res) => {
        if (res.data && res.data.code === 200) {
          const list = res.data.data.list || []
          const total = res.data.data.total || 0
          
          // 处理列表数据
          const processedList = list.map(item => {
            item.isExpired = this.isExpired(item.resDate)
            return item
          })
          
          this.setData({
            reserveList: processedList,
            total: total
          })
        } else {
          wx.showToast({
            title: res.data?.msg || '获取预约场次失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },

  // 获取当前日期的字符串表示 (YYYY-MM-DD)
  getTodayString() {
    const today = new Date()
    return today.getFullYear() + '-' + 
           String(today.getMonth() + 1).padStart(2, '0') + '-' + 
           String(today.getDate()).padStart(2, '0')
  },
  
  // 比较两个日期字符串的大小
  compareDates(dateStr1, dateStr2) {
    // 将日期字符串转换为Date对象
    const date1 = new Date(dateStr1.replace(/-/g, '/'))
    const date2 = new Date(dateStr2.replace(/-/g, '/'))
    
    // 比较日期
    return date1.getTime() - date2.getTime()
  },
  
  // 判断预约是否已过期
  isExpired(resDate) {
    if (!resDate) return false
    // 比较预约日期与今天的日期
    return this.compareDates(resDate, this.data.today) < 0
  },

  // 获取预约列表
  getReserveList() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    wx.showLoading({ title: '加载中...' })

    wx.request({
      url: `${this.data.baseUrl}/reserve/listMsReserve`,
      method: 'POST',
      data: {
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize,
        name: ''
      },
      success: (res) => {
        if (res.data.code === 200) {
          const list = res.data.data.list || []
          const total = res.data.data.total || 0
          
          // 处理列表数据，添加过期标志
          const processedList = list.map(item => {
            // 添加过期标志
            item.isExpired = this.isExpired(item.resDate)
            return item
          })
          
          this.setData({
            reserveList: processedList,
            total: total
          })
        } else {
          wx.showToast({
            title: res.data.msg || '获取预约列表失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({ loading: false })
        wx.hideLoading()
      }
    })
  },

  // 处理预约点击
  onReserveTap(e) {
    const { id } = e.currentTarget.dataset;
    const item = this.data.reserveList.find(item => item.id === id);
    
    // 使用全局统一登录方法
    const app = getApp();
    if (!app.checkLoginAndShowPrivacy(this, '/pages/booking/index')) {
      return;
    }
    
    // 检查是否已过期
    if (item.isExpired) {
      wx.showToast({
        title: '该预约已过期',
        icon: 'none'
      });
      return;
    }
    
    // 检查是否已满
    if (item.resdSum >= item.resSum) {
      wx.showToast({
        title: '预约已满',
        icon: 'none'
      });
      return;
    }
    
    // 确认预约
    wx.showModal({
      title: '确认预约',
      content: `您确定要预约"${item.title}"吗？`,
      success: (res) => {
        if (res.confirm) {
          this.submitReservation(item);
        }
      }
    });
  },
  
  // 提交预约
  submitReservation(item) {
    const userInfo = wx.getStorageSync('userInfo')
    
    wx.showLoading({ title: '提交中...' })
    
    // 根据时间自动判断场次
    let resSession = this.data.timeSessionMap[item.resTime] || '';
    if (!resSession) {
      // 如果没有找到对应的场次，根据时间判断
      const timeStr = item.resTime || '';
      if (timeStr.includes('8:30') || timeStr.includes('9:') || 
          timeStr.includes('10:') || timeStr.includes('11:00') || 
          timeStr.startsWith('8') || timeStr.includes('上午')) {
        resSession = '第一场';
      } else if (timeStr.includes('14:30') || timeStr.includes('15:') || 
                timeStr.includes('16:') || timeStr.includes('17:00') || 
                timeStr.includes('下午')) {
        resSession = '第二场';
      } else {
        // 默认设为第一场
        resSession = '第一场';
      }
    }
    
    // 创建预约数据对象，打印便于调试
    const reserveData = {
      userId: userInfo.id,
      userName: userInfo.username,
      resId: "", // 初始化为空，将在下面赋值
      exhibitionId: parseInt(item.exhibitionId || item.id), // 确保使用展览ID
      exhibitionTitle: item.title,
      cateId: parseInt(this.data.collectionId || 0), // 确保是数字类型
      cateTitle: item.cateName || item.title,
      resDate: item.resDate,
      resTime: item.resTime,
      resSession: resSession // 使用自动设置的场次
    };
    
    console.log('提交预约数据:', JSON.stringify(reserveData));
    
    // 先查询该展览ID下是否有预约记录
    wx.request({
      url: `${this.data.baseUrl}/reserve/listMsReserve`,
      method: 'POST',
      data: {
        exhibitionId: reserveData.exhibitionId,
        pageNum: 1,
        pageSize: 10
      },
      success: (res) => {
        // 处理查询结果
        console.log('查询预约记录结果:', res.data);
        
        if (res.data.code === 200 && res.data.data && res.data.data.list && res.data.data.list.length > 0) {
          // 如果找到预约记录，使用第一条记录的ID作为resId
          reserveData.resId = res.data.data.list[0].id.toString();
        } else {
          // 没有找到预约记录，使用展览ID作为临时标识
          reserveData.resId = reserveData.exhibitionId.toString();
        }
        
        console.log('提交预约数据:', JSON.stringify(reserveData));
        
        // 提交预约详情
        wx.request({
          url: `${this.data.baseUrl}/reserveDetail/addDetail`,
          method: 'POST',
          data: reserveData,
          success: (res) => {
            if (res.data.code === 200) {
              wx.showToast({
                title: '预约成功',
                icon: 'success'
              })
              // 刷新列表
              setTimeout(() => {
                this.getReserveList()
              }, 1500)
            } else {
              // 判断是否是重复预约的错误消息
              if (res.data.msg && res.data.msg.includes('您已预约过该展览的相同日期和时间段')) {
                wx.showModal({
                  title: '重复预约',
                  content: res.data.msg,
                  confirmText: '我知道了',
                  showCancel: false
                })
              } else {
                wx.showToast({
                  title: res.data.msg || '预约失败',
                  icon: 'none'
                })
              }
            }
          },
          fail: () => {
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
      fail: () => {
        wx.showToast({
          title: '获取预约记录失败',
          icon: 'none'
        })
        wx.hideLoading()
      }
    })
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      pageNum: 1,
      reserveList: []
    })
    this.getReserveList()
    wx.stopPullDownRefresh()
  },
  
  // 上拉加载更多
  onReachBottom() {
    if (this.data.reserveList.length < this.data.total) {
      this.setData({
        pageNum: this.data.pageNum + 1
      })
      this.getReserveList()
    }
  },
  
  // 同意隐私协议
  onPrivacyAgree() {
    this.setData({
      showPrivacyModal: false,
      showPhoneModal: true
    });
  },
  
  // 拒绝隐私协议
  onPrivacyReject() {
    this.setData({
      showPrivacyModal: false
    });
    
    wx.showToast({
      title: '您需要同意隐私协议才能继续',
      icon: 'none'
    });
  },
  
  // 确认手机号授权
  onPhoneConfirm(e) {
    const { phoneNumber } = e.detail;
    
    this.setData({
      showPhoneModal: false,
      phoneNumber: phoneNumber
    });
    
    console.log('获取到手机号:', phoneNumber);
    
    // 跳转到登录页面
    wx.navigateTo({
      url: '/pages/login/index'
    });
  },
  
  // 拒绝手机号授权
  onPhoneReject() {
    this.setData({
      showPhoneModal: false
    });
    
    wx.showToast({
      title: '您需要授权手机号才能继续',
      icon: 'none'
    });
  },
  
  // 使用其他手机号
  onUseOtherPhone() {
    this.setData({
      showPhoneModal: false
    });
    
    // 跳转到登录页面
    wx.navigateTo({
      url: '/pages/login/index'
    });
  },
  
  // 取消确认预约
  cancelConfirm() {
    this.setData({
      showConfirmView: false,
      selectedItem: null
    });
    
    // 根据来源参数，返回上一页或显示预约列表
    if (this.data.exhibitionId) {
      wx.navigateBack();
    } else {
      this.getReserveList();
    }
  },
  
  // 确认预约
  submitConfirm() {
    const userInfo = wx.getStorageSync('userInfo');
    
    if (!userInfo || !userInfo.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    const selectedItem = this.data.selectedItem;
    if (!selectedItem) {
      wx.showToast({
        title: '请先选择预约项目',
        icon: 'none'
      });
      return;
    }
    
    // 根据时间设置场次
    let resSession = this.data.timeSessionMap[selectedItem.timeSlot] || '';
    if (!resSession) {
      // 根据时间段判断场次
      if (selectedItem.startTime.includes('8:') || selectedItem.startTime.includes('9:') || 
          selectedItem.startTime.includes('10:') || selectedItem.startTime == '11:00') {
        resSession = '第一场';
      } else {
        resSession = '第二场';
      }
    }
    
    const reserveData = {
      userId: userInfo.id,
      userName: userInfo.username,
      exhibitionId: parseInt(selectedItem.exhibitionId),
      exhibitionTitle: selectedItem.title,
      cateId: parseInt(this.data.collectionId || 0),
      cateTitle: selectedItem.title,
      resDate: selectedItem.date,
      resTime: selectedItem.timeSlot,
      resSession: resSession
    };
    
    console.log('确认预约数据:', JSON.stringify(reserveData));
    
    wx.showLoading({ title: '提交预约...' });
    
    wx.request({
      url: `${this.data.baseUrl}/reserveDetail/addDetail`,
      method: 'POST',
      data: reserveData,
      success: (res) => {
        console.log('预约响应:', res.data);
        if (res.data.code === 200) {
          wx.showToast({
            title: '预约成功',
            icon: 'success'
          });
          
          // 预约成功后，跳转到"我的预约"页面
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/my-reservations/index'
            });
          }, 1500);
        } else {
          // 判断是否是重复预约的错误消息
          if (res.data.msg && res.data.msg.includes('您已预约过该展览的相同日期和时间段')) {
            wx.showModal({
              title: '重复预约',
              content: res.data.msg,
              confirmText: '我知道了',
              showCancel: false
            })
          } else {
            wx.showToast({
              title: res.data.msg || '预约失败',
              icon: 'none'
            });
          }
        }
      },
      fail: (err) => {
        console.error('预约请求失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  }
}) 
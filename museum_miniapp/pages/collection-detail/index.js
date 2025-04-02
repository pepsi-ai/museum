const app = getApp()

Page({
  data: {
    baseUrl: '',
    collectionId: null,
    collectionDetail: {},
    isLiked: false,
    currentTab: 'intro', // 'intro' 或 'history'
    isFixed: false, // 底部预约按钮是否固定
    comments: [],
    userInfo: null, // 存储用户信息
    reserveInfo: {
      resSum: 0,
      resdSum: 0
    },
    showPrivacyModal: false,
    showPhoneModal: false,
    phoneNumber: '',
    apiAvailable: true,
    hasError: false, // 标记是否有错误
    reserveList: [],
    commentText: '', // 评论输入框内容
  },

  onLoad(options) {
    // 获取页面参数
    const collectionId = options.id
    if (!collectionId) {
      wx.navigateBack()
      return
    }
    
    // 保存藏品ID
    this.setData({ collectionId })
    
    // 获取全局baseUrl
    const baseUrl = getApp().globalData.baseUrl
    this.setData({ 
      baseUrl: baseUrl,
      apiAvailable: getApp().globalData.apiAvailable
    })
    
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({ userInfo })
    
    // 获取藏品详情
    this.getCollectionDetail()
    
    // 获取是否已收藏
    this.checkIfLiked()
    
    // 获取评论
    this.getComments()
  },
  
  onShow() {
    // 每次显示页面时都重新检查登录状态和收藏状态
    this.checkIfLiked()
  },
  
  // 获取藏品详情
  getCollectionDetail() {
    console.log('获取藏品详情, ID:', this.data.collectionId)
    
    if (!this.data.collectionId) {
      this.setData({
        hasError: true
      })
      wx.showToast({
        title: '藏品ID无效',
        icon: 'none'
      })
      return
    }
    
    // 检查API是否可用
    if (!this.data.apiAvailable) {
      console.log('API不可用，无法获取藏品详情')
      this.setData({
        hasError: true
      })
      return
    }
    
    if (!this.data.baseUrl) {
      console.log('baseUrl未定义，无法获取藏品详情')
      this.setData({
        hasError: true
      })
      return
    }
    
    wx.showLoading({
      title: '加载中...'
    })
    
    // 使用POST方法请求藏品详情，只传递id参数
    wx.request({
      url: `${this.data.baseUrl}/collect/getdata`,
      method: 'POST',
      data: {
        id: Number(this.data.collectionId) // 确保ID是数字类型
      },
      header: {
        'content-type': 'application/json' // 确保content-type正确
      },
      success: (res) => {
        wx.hideLoading()
        console.log('藏品详情API响应:', res.data)
        
        if (res.data && res.data.code === 200 && res.data.data) {
          let collectionData;
          
          // 检查接口返回数据结构
          if (res.data.data.list && res.data.data.list.length > 0) {
            // 如果是列表格式 (通过测试发现，正确的格式是list)
            collectionData = res.data.data.list[0];
          } else if (res.data.data.records && res.data.data.records.length > 0) {
            // 如果是分页记录格式
            collectionData = res.data.data.records[0];
          } else if (typeof res.data.data === 'object' && !Array.isArray(res.data.data)) {
            // 如果是单个对象格式
            collectionData = res.data.data;
          } else {
            // 未识别的格式
            console.error('API返回的数据格式无法识别', res.data.data)
            this.setData({
              hasError: true
            })
            wx.showToast({
              title: '数据格式错误',
              icon: 'none'
            })
            return;
          }
          
          // 确保数据字段名称映射正确，适配WXML
          const processedData = {
            ...collectionData,
            name: collectionData.title || collectionData.name || '',
            picturePath: collectionData.colPic || collectionData.picturePath || '',
            dynasty: collectionData.origin || collectionData.dynasty || '未知',
            description: collectionData.desColl || collectionData.description || ''
          }
          
          console.log('处理后的藏品数据:', processedData);
          
          this.setData({
            collectionDetail: processedData,
            hasError: false
          })
          
          // 获取相关展览
          this.getRelatedExhibitions(this.data.collectionId)
          
          // 上报浏览记录
          this.recordViewHistory(this.data.collectionId, processedData.name)
          
          // 检查是否已收藏
          this.checkIfLiked()
          
          // 获取评论
          this.getComments()
          
          // 获取预约列表
          this.getReserveList()
        } else {
          console.error('API返回失败', res.data)
          this.setData({
            hasError: true
          })
          wx.showToast({
            title: '获取藏品详情失败',
            icon: 'none'
          })
          
          // 尝试备选API方式
          this.tryAlternativeApiCall();
        }
      },
      fail: (err) => {
        console.error('API请求失败:', err)
        wx.hideLoading()
        this.setData({
          hasError: true
        })
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
        
        // 尝试备选API方式
        this.tryAlternativeApiCall();
      }
    })
  },
  
  // 尝试备选API调用方式
  tryAlternativeApiCall() {
    console.log('尝试备选API调用方式获取藏品数据')
    
    wx.showLoading({
      title: '重新加载...'
    })
    
    // 尝试使用POST方式请求
    wx.request({
      url: `${this.data.baseUrl}/collectApi/getById`,
      method: 'POST',
      data: {
        id: Number(this.data.collectionId)
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        wx.hideLoading()
        console.log('备选API响应:', res.data)
        
        if (res.data && res.data.code === 200 && res.data.data) {
          const collectionData = res.data.data;
          
          // 确保数据字段名称映射正确，适配WXML
          const processedData = {
            ...collectionData,
            name: collectionData.title || collectionData.name || '',
            picturePath: collectionData.colPic || collectionData.picturePath || '',
            dynasty: collectionData.origin || collectionData.dynasty || '未知',
            description: collectionData.desColl || collectionData.description || ''
          }
          
          console.log('备选API处理后的藏品数据:', processedData);
          
          this.setData({
            collectionDetail: processedData,
            hasError: false
          })
          
          // 获取其他相关数据
          this.getRelatedExhibitions(this.data.collectionId)
          this.recordViewHistory(this.data.collectionId, processedData.name)
          this.checkIfLiked()
          this.getComments()
          this.getReserveList()
        } else {
          console.error('备选API请求失败:', res.data)
          // 保持hasError状态
        }
      },
      fail: (err) => {
        console.error('备选API请求失败:', err)
        wx.hideLoading()
        // 已经显示了错误提示，这里不重复显示
      }
    })
  },
  
  // 获取相关展览
  getRelatedExhibitions(collectionId) {
    console.log('获取相关展览，藏品ID:', collectionId)
    const baseUrl = getApp().globalData.baseUrl || ''
    
    this.setData({ exhibitionsLoading: true })
    
    wx.request({
      url: `${baseUrl}/collection/exhibitions/${collectionId}`,
      method: 'GET',
      header: {
        'content-type': 'application/json' // 确保content-type正确
      },
      success: (res) => {
        console.log('相关展览API响应:', res.data)
        
        if (res.data && res.data.code === 200) {
          const exhibitions = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.list || [])
          
          // 处理展览数据
          const processedExhibitions = exhibitions.map(item => {
            return {
              ...item,
              // 确保字段映射正确
              title: item.title || '',
              colPic: item.colPic || item.picturePath || '',
              startDate: item.startDate || '',
              endDate: item.endDate || '',
              location: item.location || ''
            }
          })
          
          // 更新关联展览
          this.setData({
            relatedExhibitions: processedExhibitions,
            exhibitionsLoading: false
          })
        } else {
          console.log('相关展览API返回失败')
          
          this.setData({
            relatedExhibitions: [],
            exhibitionsLoading: false
          })
        }
      },
      fail: (err) => {
        console.log('相关展览API请求失败:', err)
        
        this.setData({
          relatedExhibitions: [],
          exhibitionsLoading: false
        })
      }
    })
  },
  
  // 保存浏览历史记录
  recordViewHistory(collectionId, title) {
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
      id: collectionId,
      type: 'collection',
      title: title,
      colPic: this.data.collectionDetail?.colPic || '',
      desc: this.data.collectionDetail?.dynasty || this.data.collectionDetail?.origin || '',
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
  
  // 格式化HTML文本为纯文本
  formatDesc(htmlText) {
    if (!htmlText) return ''
    
    // 移除HTML标签，提取纯文本
    let plainText = htmlText.replace(/<[^>]+>/g, '')
    
    // 替换多个空格和换行为单个空格
    plainText = plainText.replace(/\s+/g, ' ')
    
    // 限制字数
    if (plainText.length > 50) {
      plainText = plainText.substring(0, 50) + '...'
    }
    
    return plainText
  },
  
  // 获取预约列表
  getReserveList() {
    if (!this.data.apiAvailable || this.data.hasError || !this.data.baseUrl || !this.data.collectionId) {
      console.log('无法获取预约列表')
      this.setData({
        reserveList: []
      })
      return
    }
    
    wx.request({
      url: `${this.data.baseUrl}/reserve/listMsReserve`,
      method: 'POST',
      data: {
        cateId: this.data.collectionId
      },
      header: {
        'content-type': 'application/json' // 确保content-type正确
      },
      success: (res) => {
        console.log('预约列表响应:', res.data)
        
        if (res.statusCode === 200 && res.data && res.data.code === 200 && res.data.data && res.data.data.list) {
          let reserveList = res.data.data.list || []
          
          // 获取当前日期
          const todayStr = this.getTodayString()
          console.log('当前日期:', todayStr)
          
          // 过滤掉过期的预约场次
          reserveList = reserveList.filter(item => {
            // 确保有日期字段
            if (!item.resDate) return false
            
            // 比较日期大小，只保留当天及以后的预约
            return this.compareDates(item.resDate, todayStr) >= 0
          })
          
          // 按日期排序（从近到远）
          reserveList.sort((a, b) => this.compareDates(a.resDate, b.resDate))
          
          console.log('过滤并排序后的预约列表:', reserveList)
          
          // 计算总的预约情况（仅未过期的）
          let totalResSum = 0
          let totalResdSum = 0
          
          reserveList.forEach(item => {
            totalResSum += item.resSum || 0
            totalResdSum += item.resdSum || 0
          })
          
          this.setData({
            reserveList,
            reserveInfo: {
              resSum: totalResSum,
              resdSum: totalResdSum
            }
          })
        } else {
          console.log('获取预约列表失败')
          this.setData({
            reserveList: [],
            reserveInfo: {
              resSum: 0,
              resdSum: 0
            }
          })
        }
      },
      fail: (err) => {
        console.error('获取预约列表失败:', err)
        this.setData({
          reserveList: [],
          reserveInfo: {
            resSum: 0,
            resdSum: 0
          }
        })
      }
    })
  },
  
  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentTab: tab
    })
  },
  
  // 处理滚动事件，决定底部按钮是否固定
  onScroll(e) {
    // 滚动位置超过一定值时固定底部按钮
    const isFixed = e.detail.scrollTop > 100
    
    if (this.data.isFixed !== isFixed) {
      this.setData({
        isFixed
      })
    }
  },
  
  // 处理图片加载错误
  onImageError() {
    console.log('藏品图片加载失败，尝试获取备用图片')
    
    // 获取当前藏品ID
    const collId = this.data.collectionId
    
    // 尝试使用备用API获取图片
    wx.showLoading({ title: '重新加载图片...' })
    
    wx.request({
      url: `${this.data.baseUrl}/collect/getBackupImage`,
      method: 'POST',
      data: {
        id: collId
      },
      header: {
        'content-type': 'application/json' // 确保content-type正确
      },
      success: (res) => {
        if (res.data.code === 200 && res.data.data) {
          // 使用备用图片
          const updatedDetail = { ...this.data.collectionDetail }
          updatedDetail.colPic = res.data.data
          
          this.setData({
            collectionDetail: updatedDetail
          })
          
          console.log('已加载备用图片:', res.data.data)
        } else {
          // 使用本地默认图片
          this.useDefaultImage()
        }
      },
      fail: () => {
        // 使用本地默认图片
        this.useDefaultImage()
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },
  
  // 使用默认图片
  useDefaultImage() {
    console.log('备用图片获取失败，使用默认图片')
    
    // 复制当前藏品详情数据
    const updatedDetail = { ...this.data.collectionDetail }
    
    // 设置为空，触发加载中图片显示
    updatedDetail.colPic = ''
    
    this.setData({
      collectionDetail: updatedDetail
    })
    
    wx.showToast({
      title: '图片加载失败',
      icon: 'none'
    })
  },
  
  // 检查是否已收藏
  checkIfLiked() {
    if (!this.data.apiAvailable) {
      console.log('API不可用，无法检查收藏状态')
      return
    }
    
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.id) {
      console.log('用户未登录，无法检查收藏状态')
      return
    }
    
    if (!this.data.baseUrl) {
      console.log('baseUrl未定义，无法检查收藏状态')
      return
    }
    
    console.log('检查藏品收藏状态:', {
      userId: userInfo.id,
      collId: this.data.collectionId,
      url: `${this.data.baseUrl}/like/listUserLikes`
    })
    
    wx.request({
      url: `${this.data.baseUrl}/like/listUserLikes`,
      method: 'POST',
      data: {
        userId: String(userInfo.id), // 将userId转为字符串
        collType: 'COLL' // 藏品类型
      },
      header: {
        'content-type': 'application/json' // 确保content-type正确
      },
      success: (res) => {
        console.log('收藏列表响应:', {
          statusCode: res.statusCode,
          data: res.data
        })
        
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          const likeList = res.data.data || []
          const collId = Number(this.data.collectionId)
          const isLiked = likeList.includes(collId)
          
          console.log('收藏状态检查:', {
            collId: collId,
            likeList: likeList,
            isLiked: isLiked
          })
          
          this.setData({
            isLiked
          })
        } else {
          console.error('获取收藏列表失败:', res.data || res.statusCode)
        }
      },
      fail: (err) => {
        console.error('收藏列表请求失败:', err)
        
        // 如果API不可用，尝试使用GET请求
        this.tryFallbackRequest()
      }
    })
  },
  
  // 尝试使用备用GET请求获取收藏状态
  tryFallbackRequest() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.id) return
    
    console.log('尝试使用GET请求获取收藏状态')
    
    wx.request({
      url: `${this.data.baseUrl}/like/listUserLikes`,
      method: 'GET',
      data: {
        userId: userInfo.id,
        collType: 'COLL'
      },
      success: (res) => {
        console.log('GET方式收藏列表响应:', res)
        
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          const likeList = res.data.data || []
          const isLiked = likeList.includes(Number(this.data.collectionId))
          
          this.setData({
            isLiked
          })
        } else {
          console.error('GET方式获取收藏列表失败:', res.data || res.statusCode)
        }
      },
      fail: (err) => {
        console.error('GET方式收藏列表请求失败:', err)
      }
    })
  },
  
  // 收藏/取消收藏
  onLikeTap() {
    // 检查登录状态
    const app = getApp()
    if (!app.globalData.isLogin) {
      // 未登录，先跳转到登录页
      wx.navigateTo({
        url: `/pages/login/index?redirect=/pages/collection-detail/index?id=${this.data.collectionId}`
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
      title: this.data.isLiked ? '取消收藏中...' : '收藏中...'
    })
    
    // 根据当前收藏状态决定接口
    const url = this.data.isLiked ? 
      `${this.data.baseUrl}/like/delLikeColl` : 
      `${this.data.baseUrl}/like/addLikeColl`
    
    // 发送请求
    wx.request({
      url: url,
      method: 'POST',
      data: {
        userId: String(userInfo.id), // 将userId转为字符串
        collId: Number(this.data.collectionId)
      },
      header: {
        'content-type': 'application/json' // 确保content-type正确
      },
      success: (res) => {
        wx.hideLoading()
        
        // 打印完整响应以便调试
        console.log('收藏操作响应:', {
          statusCode: res.statusCode,
          data: res.data,
          url: url,
          params: {
            userId: String(userInfo.id),
            collId: Number(this.data.collectionId)
          }
        })
        
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          // 更新收藏状态
          this.setData({
            isLiked: !this.data.isLiked
          })
          
          // 显示成功提示
          wx.showToast({
            title: this.data.isLiked ? '收藏成功' : '取消收藏成功',
            icon: 'success'
          })
        } else {
          // 显示错误信息
          console.error('收藏操作失败:', res.data || res.statusCode)
          wx.showToast({
            title: res.data?.msg || '操作失败，请稍后重试',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('收藏请求失败:', err)
        
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      }
    })
  },
  
  // 获取评论列表
  getComments() {
    // 如果API不可用或hasError为true，不获取评论
    if (!this.data.apiAvailable || this.data.hasError || !this.data.baseUrl) {
      console.log('无法获取评论数据')
      this.setData({
        comments: [] // 设置为空数组
      })
      return
    }
    
    // 获取用户信息并更新到data中
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({ userInfo })
    console.log('当前登录用户ID:', userInfo ? userInfo.id : '未登录', '类型:', typeof (userInfo ? userInfo.id : null))
    
    wx.request({
      url: `${this.data.baseUrl}/feedBack/listFeedBackByUser`,
      method: 'POST',
      data: {
        cateId: this.data.collectionId
      },
      header: {
        'content-type': 'application/json' // 确保content-type正确
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
              comments
            })
          }
        } else {
          console.log('获取评论失败')
          this.setData({
            comments: [] // 设置为空数组
          })
        }
      },
      fail: (err) => {
        console.error('获取评论列表失败:', err)
        this.setData({
          comments: [] // 设置为空数组
        })
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
          comments
        })
      },
      fail: (err) => {
        console.error('获取用户点赞评论失败:', err)
        
        // 标记所有评论为未点赞
        comments.forEach(comment => {
          comment.isLiked = false
        })
        
        this.setData({
          comments
        })
      }
    })
  },
  
  // 评论输入框内容变化
  onCommentInput(e) {
    this.setData({
      commentText: e.detail.value
    })
  },
  
  // 提交评论
  onCommentSubmit() {
    // 检查登录状态
    const app = getApp()
    if (!app.globalData.isLogin) {
      // 未登录，先跳转到登录页
      wx.navigateTo({
        url: `/pages/login/index?redirect=/pages/collection-detail/index?id=${this.data.collectionId}`
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
        cateId: this.data.collectionId,
        feedContent: this.data.commentText,
        userName: userInfo.username || userInfo.nickName || '博物馆游客'
      },
      header: {
        'content-type': 'application/json' // 确保content-type正确
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
            this.getComments()
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
        url: `/pages/login/index?redirect=/pages/collection-detail/index?id=${this.data.collectionId}`
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
  
  // 预约按钮点击处理
  onReserveTap() {
    console.log('点击预约按钮')
    
    // 使用全局统一登录方法
    const app = getApp()
    if (!app.checkLoginAndShowPrivacy(this, `/pages/collection-detail/index?id=${this.data.collectionId}`)) {
      return
    }
    
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.id) {
      wx.showToast({
        title: '用户信息获取失败',
        icon: 'none'
      })
      return
    }
    
    // 如果有错误或数据不可用，不允许预约
    if (this.data.hasError) {
      wx.showToast({
        title: '藏品信息加载失败，请稍后再试',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    // 如果API不可用，显示提示
    if (!this.data.apiAvailable) {
      wx.showToast({
        title: '系统维护中，暂时无法预约',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    // 检查baseUrl
    if (!this.data.baseUrl) {
      console.error('baseUrl未定义，无法进行预约操作')
      wx.showToast({
        title: '预约功能暂不可用，请稍后重试',
        icon: 'none'
      })
      return
    }
    
    // 检查是否有可预约的场次
    if (!this.data.reserveList || this.data.reserveList.length === 0) {
      wx.showToast({
        title: '暂无可预约场次',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    // 跳转到预约页面，带上藏品ID参数
    wx.navigateTo({
      url: `/pages/booking/index?collId=${this.data.collectionId}`
    })
  },
  
  // 隐私协议同意
  onPrivacyAgree() {
    this.setData({
      showPrivacyModal: false,
      showPhoneModal: true
    })
  },
  
  // 隐私协议拒绝
  onPrivacyReject() {
    this.setData({
      showPrivacyModal: false
    })
    
    wx.showToast({
      title: '需要同意隐私协议才能继续',
      icon: 'none'
    })
  },
  
  // 手机号授权确认
  onPhoneConfirm() {
    this.setData({
      showPhoneModal: false
    })
    
    // 跳转到登录页面
    wx.navigateTo({
      url: `/pages/login/index?redirect=/pages/collection-detail/index?id=${this.data.collectionId}`
    })
  },
  
  // 手机号授权拒绝
  onPhoneReject() {
    this.setData({
      showPhoneModal: false
    })
    
    wx.showToast({
      title: '需要授权手机号才能继续',
      icon: 'none'
    })
  },
  
  // 使用其他手机号
  onUseOtherPhone() {
    this.setData({
      showPhoneModal: false
    })
    
    // 跳转到登录页面
    wx.navigateTo({
      url: `/pages/login/index?redirect=/pages/collection-detail/index?id=${this.data.collectionId}`
    })
  },
  
  // 比较两个日期字符串的大小
  compareDates(dateStr1, dateStr2) {
    // 将日期字符串转换为Date对象
    const date1 = new Date(dateStr1.replace(/-/g, '/'))
    const date2 = new Date(dateStr2.replace(/-/g, '/'))
    
    // 比较日期
    return date1.getTime() - date2.getTime()
  },

  // 获取当前日期的字符串表示 (YYYY-MM-DD)
  getTodayString() {
    const today = new Date()
    return today.getFullYear() + '-' + 
           String(today.getMonth() + 1).padStart(2, '0') + '-' + 
           String(today.getDate()).padStart(2, '0')
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
        'content-type': 'application/json' // 确保content-type正确
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
})
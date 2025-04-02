const app = getApp()

Page({
  data: {
    baseUrl: '',
    todayHistory: [],
    yesterdayHistory: [],
    earlierHistory: [],
    historyList: [],
    loading: true
  },

  onLoad() {
    // 获取baseUrl
    const baseUrl = app.globalData.baseUrl
    this.setData({ baseUrl })
  },
  
  onShow() {
    // 每次进入页面时刷新数据
    this.loadViewHistory()
  },
  
  // 加载浏览历史
  loadViewHistory() {
    // 从本地存储获取浏览历史
    const historyData = wx.getStorageSync('viewHistory') || []
    
    if (historyData.length === 0) {
      this.setData({
        todayHistory: [],
        yesterdayHistory: [],
        earlierHistory: [],
        historyList: [],
        loading: false
      })
      return
    }
    
    // 获取今天和昨天的日期（YYYY-MM-DD格式）
    const today = this.getDateString(new Date())
    const yesterday = this.getDateString(new Date(Date.now() - 24 * 60 * 60 * 1000))
    
    // 分组历史记录
    const todayHistory = []
    const yesterdayHistory = []
    const earlierHistory = []
    
    historyData.forEach(item => {
      // 解析日期字符串（格式：YYYY-MM-DD HH:MM）
      const itemDate = item.viewTime.split(' ')[0]
      
      if (itemDate === today) {
        todayHistory.push(item)
      } else if (itemDate === yesterday) {
        yesterdayHistory.push(item)
      } else {
        earlierHistory.push(item)
      }
    })
    
    // 对历史记录按时间排序（最近的排在前面）
    const sortedHistory = [...historyData].sort((a, b) => {
      return new Date(b.viewTime) - new Date(a.viewTime);
    });
    
    this.setData({
      todayHistory,
      yesterdayHistory,
      earlierHistory,
      historyList: sortedHistory,
      loading: false
    })
  },
  
  // 点击历史记录项
  onItemTap(e) {
    const { id, type } = e.currentTarget.dataset
    
    // 根据类型跳转到相应页面
    if (type === 'collection') {
      wx.navigateTo({
        url: `/pages/collection-detail/index?id=${id}`
      })
    } else if (type === 'exhibition') {
      wx.navigateTo({
        url: `/pages/exhibition-detail/index?id=${id}`
      })
    }
  },
  
  // 删除单个历史记录
  onDeleteItem(e) {
    const { id } = e.currentTarget.dataset
    
    wx.showModal({
      title: '删除记录',
      content: '确定要删除此条浏览记录吗？',
      success: (res) => {
        if (res.confirm) {
          // 从本地存储中删除该条记录
          const historyData = wx.getStorageSync('viewHistory') || []
          const newHistoryData = historyData.filter(item => item.id !== id)
          
          wx.setStorageSync('viewHistory', newHistoryData)
          
          // 重新加载历史记录
          this.loadViewHistory()
          
          wx.showToast({
            title: '已删除',
            icon: 'success'
          })
        }
      }
    })
  },
  
  // 清空所有历史记录
  onClearHistory() {
    wx.showModal({
      title: '清空历史',
      content: '确定要清空所有浏览记录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清空本地存储中的历史记录
          wx.removeStorageSync('viewHistory')
          
          // 重置数据
          this.setData({
            todayHistory: [],
            yesterdayHistory: [],
            earlierHistory: [],
            historyList: [],
            loading: false
          })
          
          wx.showToast({
            title: '已清空',
            icon: 'success'
          })
        }
      }
    })
  },
  
  // 辅助方法：获取日期字符串（YYYY-MM-DD格式）
  getDateString(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
}) 
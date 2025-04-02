const app = getApp()

Page({
  data: {
    selectedType: '',
    content: '',
    contentLength: 0,
    images: [],
    contact: '',
    baseUrl: ''
  },

  onLoad() {
    const baseUrl = app.globalData.baseUrl
    this.setData({ baseUrl })
  },

  // 选择反馈类型
  onTypeSelect(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      selectedType: type
    })
  },

  // 输入反馈内容
  onContentInput(e) {
    const content = e.detail.value
    this.setData({
      content,
      contentLength: content.length
    })
  },

  // 输入联系方式
  onContactInput(e) {
    this.setData({
      contact: e.detail.value
    })
  },

  // 选择图片
  chooseImage() {
    const { images } = this.data
    const count = 4 - images.length
    
    wx.chooseImage({
      count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // 临时路径
        const tempFilePaths = res.tempFilePaths
        
        // 更新图片列表
        this.setData({
          images: [...images, ...tempFilePaths]
        })
      }
    })
  },

  // 预览图片
  previewImage(e) {
    const index = e.currentTarget.dataset.index
    const { images } = this.data
    
    wx.previewImage({
      current: images[index],
      urls: images
    })
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const { images } = this.data
    
    images.splice(index, 1)
    
    this.setData({
      images
    })
  },

  // 提交反馈
  submitFeedback() {
    const { selectedType, content, images, contact } = this.data
    
    // 验证必填项
    if (!selectedType) {
      wx.showToast({
        title: '请选择反馈类型',
        icon: 'none'
      })
      return
    }
    
    if (!content || content.trim() === '') {
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none'
      })
      return
    }
    
    // 显示加载状态
    wx.showLoading({
      title: '提交中...',
      mask: true
    })
    
    // 如果有图片，先上传图片
    if (images.length > 0) {
      this.uploadImages(0, [], (uploadedImages) => {
        this.submitFeedbackData(selectedType, content, uploadedImages, contact)
      })
    } else {
      // 没有图片，直接提交文字内容
      this.submitFeedbackData(selectedType, content, [], contact)
    }
  },
  
  // 上传图片（递归处理多张图片）
  uploadImages(index, uploadedImages, callback) {
    const { images, baseUrl } = this.data
    
    if (index >= images.length) {
      // 所有图片上传完成
      callback(uploadedImages)
      return
    }
    
    // 上传当前图片
    wx.uploadFile({
      url: `${baseUrl}/file/upload`,
      filePath: images[index],
      name: 'file',
      success: (res) => {
        try {
          // 解析返回结果
          const data = JSON.parse(res.data)
          if (data.code === 200 && data.data) {
            // 图片上传成功，记录图片地址
            uploadedImages.push(data.data)
          } else {
            wx.hideLoading()
            wx.showToast({
              title: '图片上传失败',
              icon: 'none'
            })
            return
          }
        } catch (e) {
          wx.hideLoading()
          wx.showToast({
            title: '图片上传失败',
            icon: 'none'
          })
          return
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          title: '图片上传失败',
          icon: 'none'
        })
        return
      },
      complete: () => {
        // 继续上传下一张图片
        this.uploadImages(index + 1, uploadedImages, callback)
      }
    })
  },
  
  // 提交反馈数据
  submitFeedbackData(type, content, images, contact) {
    const { baseUrl } = this.data
    
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo') || {}
    
    wx.request({
      url: `${baseUrl}/feedback/submit`,
      method: 'POST',
      data: {
        userId: userInfo.id || '',
        userName: userInfo.username || '',
        type: type,
        content: content,
        images: images.join(','),
        contact: contact
      },
      success: (res) => {
        wx.hideLoading()
        
        if (res.data && res.data.code === 200) {
          wx.showToast({
            title: '反馈提交成功',
            icon: 'success'
          })
          
          // 提交成功后返回上一页
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        } else {
          wx.showToast({
            title: res.data?.msg || '提交失败，请重试',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          title: '提交失败，请检查网络',
          icon: 'none'
        })
      }
    })
  }
}) 
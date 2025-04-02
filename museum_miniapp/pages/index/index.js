const app = getApp()

Page({
  data: {
    bannerList: [], // 改为空数组，由后端数据填充
    exhibitionList: [], // 改回原变量名称
    searchKeyword: '',
    pageNum: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    baseUrl: '', // 存储基础URL
    showPrivacyModal: false, // 是否显示隐私协议弹窗
    showPhoneModal: false,
    phoneNumber: '',
    bannerLoading: false
  },

  onLoad() {
    // 获取全局baseUrl
    const baseUrl = app.globalData.baseUrl
    this.setData({
      baseUrl: baseUrl
    })
    
    // 获取轮播图数据
    this.getBannerList().then(() => {
      // 获取展览列表
      this.getExhibitionList()
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      pageNum: 1,
      exhibitionList: []
    })
    this.getBannerList()
    this.getExhibitionList()
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.exhibitionList.length < this.data.total) {
      this.setData({
        pageNum: this.data.pageNum + 1
      })
      this.getExhibitionList()
    }
  },

  // 获取轮播图数据（使用展览封面图片）
  getBannerList() {
    const baseUrl = app.globalData.baseUrl
    
    this.setData({ bannerLoading: true })
    
    // 获取展览列表
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${baseUrl}/exhibition/list`,
        method: 'POST',
        data: {
          pageNum: 1,
          pageSize: 5
        },
        success: (res) => {
          console.log('轮播图所需展览列表API结果:', res.data)
          
          if (res.data && res.data.code === 200) {
            const exhibitionList = res.data.data.records || res.data.data.list || res.data.data || []
            
            if (exhibitionList.length === 0) {
              console.log('展览列表为空，无法获取轮播图数据')
              this.setData({
                bannerList: [],
                bannerLoading: false
              })
              resolve()
              return
            }
            
            // 直接使用展览封面图片作为轮播图数据
            const bannerList = exhibitionList.slice(0, 5).map(item => ({
              id: item.id,
              title: item.title || '展览',
              colPic: item.colPic || item.exhibitionPic || '', // 优先使用展览封面图
              startDate: item.startDate || '',
              endDate: item.endDate || '',
              location: item.location || '',
              status: item.status || 'upcoming',
              description: this.formatDesc(item.description || item.desColl || ''),
              type: 'exhibition'
            }))
            
            this.setData({
              bannerList: bannerList,
              bannerLoading: false
            })
            resolve()
          } else {
            console.error('获取展览列表失败:', res.data)
            this.setData({
              bannerList: [],
              bannerLoading: false
            })
            
            wx.showToast({
              title: '获取轮播图数据失败',
              icon: 'none'
            })
            
            resolve()
          }
        },
        fail: (err) => {
          console.error('展览列表请求失败:', err)
          
          this.setData({
            bannerList: [],
            bannerLoading: false
          })
          
          wx.showToast({
            title: '网络错误，无法获取轮播图',
            icon: 'none'
          })
          
          resolve()
        }
      })
    })
  },
  
  // 获取展览藏品作为轮播图数据
  getExhibitionCollections(exhibitionIds, exhibitionList) {
    const baseUrl = app.globalData.baseUrl
    
    return new Promise((resolve, reject) => {
      // 记录已处理的展览数量
      let processedCount = 0
      // 最终的轮播图数据
      let bannerList = []
      
      // 如果展览ID列表为空，直接返回空数组
      if (!exhibitionIds || exhibitionIds.length === 0) {
        resolve([])
        return
      }
      
      // 处理每个展览
      exhibitionIds.forEach((exhibitionId, index) => {
        // 获取展览藏品
        wx.request({
          url: `${baseUrl}/exhibition/collections/${exhibitionId}`,
          method: 'GET',
          success: (res) => {
            console.log(`展览${exhibitionId}藏品列表API结果:`, res.data)
            
            if (res.data && res.data.code === 200) {
              const collections = res.data.data || []
              
              // 如果有藏品，取第一个藏品作为轮播图
              if (collections.length > 0) {
                const collection = collections[0]
                // 相应展览信息
                const exhibition = exhibitionList.find(item => item.id === exhibitionId)
                
                bannerList.push({
                  id: exhibitionId,
                  title: exhibition.title || '展览',
                  colPic: collection.colPic || collection.picturePath,
                  type: 'exhibition'
                })
              }
            }
            
            // 记录已处理完成
            processedCount++
            
            // 如果所有展览都处理完毕，返回结果
            if (processedCount === exhibitionIds.length) {
              console.log('生成轮播图数据:', bannerList)
              resolve(bannerList)
            }
          },
          fail: (err) => {
            console.error(`获取展览${exhibitionId}藏品失败:`, err)
            
            // 记录已处理完成
            processedCount++
            
            // 如果所有展览都处理完毕，返回结果
            if (processedCount === exhibitionIds.length) {
              console.log('生成轮播图数据:', bannerList)
              resolve(bannerList)
            }
          }
        })
      })
    })
  },

  // 设置默认轮播图数据
  setDefaultBanners() {
    const defaultBanners = [
      {
        id: 1,
        title: '青铜器展览',
        colPic: '/images/logo.jpeg'
      },
      {
        id: 2,
        title: '古代陶瓷展',
        colPic: '/images/logo.jpeg'
      }
    ]
    
    console.log('使用默认轮播图数据')
    
    this.setData({
      bannerList: defaultBanners
    })
  },

  // 获取展览列表数据
  getExhibitionList() {
    const baseUrl = app.globalData.baseUrl;
    
    this.setData({ loading: true });
    
    console.log('正在获取首页展览列表...');
    
    // 使用驼峰命名参数格式，更符合Java后端习惯
    const requestData = {
      pageNum: 1,
      pageSize: 4,
      name: this.data.searchKeyword || ''
    };
    
    console.log('请求参数:', requestData);
    
    wx.request({
      url: `${baseUrl}/exhibition/list`,
      method: 'POST',
      data: requestData,
      success: (res) => {
        console.log('首页展览API结果:', res.data);
        
        if (res.data && res.data.code === 200) {
          // 兼容不同的数据结构
          const list = res.data.data.records || res.data.data.list || res.data.data || [];
          const total = res.data.data.total || list.length || 0;
          
          console.log('获取到的展览数据:', list);
          
          if (list.length === 0) {
            console.log('展览列表为空，没有可显示的展览');
            this.setData({
              exhibitionList: [],
              loading: false
            });
            
            // 显示提示信息
            wx.showToast({
              title: '暂无展览数据',
              icon: 'none'
            });
          } else {
            // 收集展览ID列表
            const exhibitionIds = list.map(item => item.id).filter(id => id);
            
            if (exhibitionIds.length > 0) {
              // 获取展览详细信息
              this.getExhibitionDetails(exhibitionIds, list);
            } else {
              // 直接处理展览数据
              const processedList = this.processExhibitionData(list);
              
              this.setData({
                exhibitionList: processedList,
                total: total,
                loading: false
              });
            }
          }
        } else {
          console.error('API返回错误:', res.data);
          this.setData({
            exhibitionList: [],
            loading: false
          });
          
          wx.showToast({
            title: '获取展览列表失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('获取展览列表请求失败:', err);
        this.setData({
          exhibitionList: [],
          loading: false
        });
        
        wx.showToast({
          title: '网络连接错误',
          icon: 'none'
        });
      }
    });
  },
  
  // 获取展览详细信息
  getExhibitionDetails(exhibitionIds, exhibitionList) {
    const baseUrl = app.globalData.baseUrl;
    
    console.log('正在获取展览详细信息...', exhibitionIds);
    
    // 用于存储所有API请求的Promise
    const detailPromises = exhibitionIds.map(id => {
      return new Promise((resolve) => {
        wx.request({
          url: `${baseUrl}/exhibition/detail/${id}`,
          method: 'GET',
          success: (detailRes) => {
            console.log(`展览${id}详情API结果:`, detailRes.data);
            
            if (detailRes.data && detailRes.data.code === 200) {
              resolve(detailRes.data.data);
            } else {
              console.error(`获取展览${id}详情失败:`, detailRes.data);
              resolve(null);
            }
          },
          fail: (err) => {
            console.error(`获取展览${id}详情请求失败:`, err);
            resolve(null);
          }
        });
      });
    });
    
    // 等待所有请求完成
    Promise.all(detailPromises)
      .then(detailsArray => {
        // 过滤掉null结果
        const validDetails = detailsArray.filter(detail => detail !== null);
        
        console.log('获取到的展览详情:', validDetails);
        
        // 将详情数据合并到展览列表中
        const mergedList = exhibitionList.map(exhibition => {
          const detail = validDetails.find(detail => detail.id === exhibition.id);
          if (detail) {
            return {
              ...exhibition,
              description: detail.description || exhibition.description || '',
              location: detail.location || exhibition.location || '',
              // 合并其他可能的详细信息...
            };
          }
          return exhibition;
        });
        
        // 处理合并后的展览数据
        const processedList = this.processExhibitionData(mergedList);
        
        this.setData({
          exhibitionList: processedList,
          total: mergedList.length,
          loading: false
        });
      })
      .catch(error => {
        console.error('处理展览详情时出错:', error);
        
        // 如果出错，仍使用原始数据
        const processedList = this.processExhibitionData(exhibitionList);
        
        this.setData({
          exhibitionList: processedList,
          total: exhibitionList.length,
          loading: false
        });
      });
  },

  // 搜索输入处理
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
  },

  // 搜索确认
  onSearchConfirm() {
    this.setData({
      pageNum: 1,
      exhibitionList: []
    })
    this.getExhibitionList()
  },

  // 预约参观按钮点击
  onBookingTap() {
    // 检查登录状态
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    
    // 如果已登录，直接跳转到藏品页面
    if (token && userInfo) {
      wx.switchTab({
        url: '/pages/collection/index'
      })
      return
    }
    
    // 未登录，显示隐私协议弹窗
    this.setData({
      showPrivacyModal: true
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
    // 关闭手机号授权弹窗
    this.setData({
      showPhoneModal: false
    })
    
    // 这里将来应该获取手机号
    console.log("应通过微信接口获取手机号（功能暂未实现）")
    
    // 跳转到登录页面
    wx.navigateTo({
      url: '/pages/login/index?redirect=/pages/collection/index'
    })
  },

  // 手机号授权拒绝
  onPhoneReject() {
    // 关闭手机号授权弹窗
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
    // 关闭手机号授权弹窗
    this.setData({
      showPhoneModal: false
    })
    
    // 跳转到登录页面
    wx.navigateTo({
      url: '/pages/login/index?redirect=/pages/collection/index'
    })
  },

  // 点击更多展览
  onMoreExhibition() {
    wx.switchTab({
      url: '/pages/exhibition-list/index'
    });
  },

  // 点击展览项
  onExhibitionTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/exhibition-detail/index?id=${id}`
    });
  },
  
  // 点击查看详情按钮
  onViewDetail(e) {
    try {
      // 不需要调用stopPropagation，catchtap已经阻止了冒泡
      const id = e && e.currentTarget ? e.currentTarget.dataset.id : null;
      if (!id) {
        console.error('无法获取展览ID');
        return;
      }
      
      console.log('点击展览预约按钮，跳转到展览详情页，ID:', id);
      
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

  // 底部导航切换
  onTabChange(e) {
    const index = e.detail.index
    const tabBarList = ['index', 'collection', 'user']
    wx.switchTab({
      url: `/pages/${tabBarList[index]}/index`
    })
  },

  // 处理轮播图图片加载错误
  onBannerImageError(e) {
    const { index } = e.currentTarget.dataset
    console.error(`轮播图图片加载失败，索引: ${index}`)
    
    // 获取当前轮播图数据
    const bannerList = [...this.data.bannerList]
    
    // 替换为本地图片
    bannerList[index].colPic = '/images/logo.jpeg'
    
    this.setData({
      bannerList: bannerList
    })
  },

  // 处理展览图片加载错误
  onExhibitionImageError(e) {
    const { index } = e.currentTarget.dataset
    console.error(`展览图片加载失败，索引: ${index}`)
    
    // 获取当前展览列表数据
    const exhibitionList = [...this.data.exhibitionList]
    
    // 替换为本地图片
    exhibitionList[index].colPic = '/images/logo.jpeg'
    
    this.setData({
      exhibitionList: exhibitionList
    })
  },

  // 格式化描述文本
  formatDesc(htmlText) {
    if (!htmlText) return '';
    return htmlText.replace(/<[^>]+>/g, '').substring(0, 50) + '...';
  },

  // 获取当前日期的字符串表示 (YYYY-MM-DD)
  getTodayString() {
    const today = new Date();
    return today.getFullYear() + '-' + 
           String(today.getMonth() + 1).padStart(2, '0') + '-' + 
           String(today.getDate()).padStart(2, '0');
  },
  
  // 添加月份到日期
  addMonths(dateStr, months) {
    try {
      const date = new Date(dateStr.replace(/-/g, '/'));
      date.setMonth(date.getMonth() + months);
      
      return date.getFullYear() + '-' + 
             String(date.getMonth() + 1).padStart(2, '0') + '-' + 
             String(date.getDate()).padStart(2, '0');
    } catch (e) {
      return dateStr;
    }
  },
  
  // 格式化日期
  formatDate(dateStr) {
    if (!dateStr) return '';
    
    // 支持多种日期分隔符
    const formatted = dateStr.replace(/[\.\-\/]/g, '-');
    
    // 如果只有年月日，直接返回
    if (formatted.length <= 10) {
      return formatted;
    }
    
    // 否则只截取年月日部分
    return formatted.substring(0, 10);
  },

  // 处理展览数据（格式化日期等）
  processExhibitionData(data) {
    const today = this.getTodayString();
    const currentDate = new Date(); // 当前时间
    
    return data.map(item => {
      // 使用真实展览数据的字段
      const startDate = item.startDate || today;
      const endDate = item.endDate || this.addMonths(today, 1);
      
      // 计算状态
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
      
      // 处理描述信息，去除HTML标签
      const description = this.formatDesc(item.description || item.desColl || '');
      
      return {
        ...item,
        id: item.id,
        title: item.title || '展览',
        colPic: colPic,
        startDate: this.formatDate(startDate),
        endDate: this.formatDate(endDate),
        location: item.location || '临展馆',
        status: status, // 计算后的状态
        description: description // 确保有描述信息
      };
    });
  },

  // 立即预约按钮点击处理
  onBookingBtnTap(e) {
    console.log('点击立即预约按钮');
    
    // 阻止事件冒泡（如果需要）
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    
    wx.switchTab({
      url: '/pages/exhibition-list/index',
      success: () => {
        console.log('成功跳转到展览列表页面');
      },
      fail: (err) => {
        console.error('跳转到展览列表页面失败:', err);
        wx.showToast({
          title: '页面跳转失败',
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
        // 确保字段映射正确
        id: item.id || item.collectionId,
        name: item.title || item.name || '',
        picturePath: item.colPic || item.picturePath || '',
        dynasty: item.origin || item.dynasty || '未知年代',
        description: item.desColl || item.description || ''
      };
    });
  },
})



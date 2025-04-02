import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useUserStore } from '@/stores/user'

// 是否使用模拟数据（开发环境可设为true，生产环境应设为false）
const useMockData = false

// 模拟数据
const mockData = {
  // 首页模拟数据
  '/home/all-data': {
    carousel: [
      {
        id: 1,
        title: '印象莫奈：光与影的艺术',
        description: '沉浸式体验印象派大师莫奈的艺术世界，感受光与色彩的魅力',
        image: 'https://placehold.co/1200x500?text=印象莫奈'
      },
      {
        id: 2,
        title: '古代中国：文明的印记',
        description: '跨越三千年的文明长河，探索中华文化的璀璨历程',
        image: 'https://placehold.co/1200x500?text=古代中国'
      },
      {
        id: 3,
        title: '当代艺术展：无界之美',
        description: '探索当代艺术家的创新表达，体验跨越国界的艺术视觉盛宴',
        image: 'https://placehold.co/1200x500?text=当代艺术展'
      }
    ],
    statistics: {
      collectionCount: 5280,
      exhibitionCount: 42,
      visitorCount: 1250000,
      eventCount: 126
    },
    hotExhibitions: [
      {
        id: 1,
        title: '印象莫奈：光与影的艺术',
        date: '2024.01.15 - 2024.04.15',
        image: 'https://placehold.co/600x400?text=莫奈展览'
      },
      {
        id: 2,
        title: '古代中国：文明的印记',
        date: '2023.12.01 - 2024.03.01',
        image: 'https://placehold.co/600x400?text=古代中国'
      },
      {
        id: 3,
        title: '当代艺术展：无界之美',
        date: '2024.02.10 - 2024.05.10',
        image: 'https://placehold.co/600x400?text=当代艺术'
      }
    ],
    latestActivities: [
      {
        id: 1,
        title: '博物馆之夜：星空下的艺术之旅',
        date: '2024.03.21 19:00-22:00',
        description: '夜间特别开放，在星空下欣赏艺术品，专业讲解员带你领略夜间博物馆的魅力。',
        image: 'https://placehold.co/800x400?text=博物馆之夜'
      },
      {
        id: 2,
        title: '儿童艺术工坊：探索创意的世界',
        date: '每周六 10:00-12:00',
        description: '专为7-12岁儿童设计的创意工坊，让孩子在艺术创作中探索自我。',
        image: 'https://placehold.co/800x400?text=儿童艺术工坊'
      }
    ],
    visitorReviews: [
      {
        id: 1,
        name: '李明',
        avatar: 'https://placehold.co/100?text=李',
        rating: 5,
        content: '莫奈展览令人叹为观止，灯光效果与画作完美融合，仿佛置身于莫奈的花园中。讲解员知识渊博，让我对印象派有了全新的认识。'
      },
      {
        id: 2,
        name: '张华',
        avatar: 'https://placehold.co/100?text=张',
        rating: 4.5,
        content: '博物馆环境优雅，展品丰富多样。预约系统便捷高效，没有排队等待。唯一不足是餐厅选择较少。'
      },
      {
        id: 3,
        name: '王丽',
        avatar: 'https://placehold.co/100?text=王',
        rating: 5,
        content: '带孩子参加了儿童艺术工坊，活动设计得非常有趣且有教育意义。工作人员耐心细致，孩子玩得很开心，收获满满。'
      }
    ]
  },
  '/home/carousel': [
    {
      id: 1,
      title: '印象莫奈：光与影的艺术',
      description: '沉浸式体验印象派大师莫奈的艺术世界，感受光与色彩的魅力',
      image: 'https://placehold.co/1200x500?text=印象莫奈'
    },
    {
      id: 2,
      title: '古代中国：文明的印记',
      description: '跨越三千年的文明长河，探索中华文化的璀璨历程',
      image: 'https://placehold.co/1200x500?text=古代中国'
    },
    {
      id: 3,
      title: '当代艺术展：无界之美',
      description: '探索当代艺术家的创新表达，体验跨越国界的艺术视觉盛宴',
      image: 'https://placehold.co/1200x500?text=当代艺术展'
    }
  ],
  '/home/statistics': {
    collectionCount: 5280,
    exhibitionCount: 42,
    visitorCount: 1250000,
    eventCount: 126
  },
  '/home/hot-exhibitions': [
    {
      id: 1,
      title: '印象莫奈：光与影的艺术',
      date: '2024.01.15 - 2024.04.15',
      image: 'https://placehold.co/600x400?text=莫奈展览'
    },
    {
      id: 2,
      title: '古代中国：文明的印记',
      date: '2023.12.01 - 2024.03.01',
      image: 'https://placehold.co/600x400?text=古代中国'
    },
    {
      id: 3,
      title: '当代艺术展：无界之美',
      date: '2024.02.10 - 2024.05.10',
      image: 'https://placehold.co/600x400?text=当代艺术'
    }
  ],
  '/home/latest-activities': [
    {
      id: 1,
      title: '博物馆之夜：星空下的艺术之旅',
      date: '2024.03.21 19:00-22:00',
      description: '夜间特别开放，在星空下欣赏艺术品，专业讲解员带你领略夜间博物馆的魅力。',
      image: 'https://placehold.co/800x400?text=博物馆之夜'
    },
    {
      id: 2,
      title: '儿童艺术工坊：探索创意的世界',
      date: '每周六 10:00-12:00',
      description: '专为7-12岁儿童设计的创意工坊，让孩子在艺术创作中探索自我。',
      image: 'https://placehold.co/800x400?text=儿童艺术工坊'
    }
  ],
  '/home/visitor-reviews': [
    {
      id: 1,
      name: '李明',
      avatar: 'https://placehold.co/100?text=李',
      rating: 5,
      content: '莫奈展览令人叹为观止，灯光效果与画作完美融合，仿佛置身于莫奈的花园中。讲解员知识渊博，让我对印象派有了全新的认识。'
    },
    {
      id: 2,
      name: '张华',
      avatar: 'https://placehold.co/100?text=张',
      rating: 4.5,
      content: '博物馆环境优雅，展品丰富多样。预约系统便捷高效，没有排队等待。唯一不足是餐厅选择较少。'
    },
    {
      id: 3,
      name: '王丽',
      avatar: 'https://placehold.co/100?text=王',
      rating: 5,
      content: '带孩子参加了儿童艺术工坊，活动设计得非常有趣且有教育意义。工作人员耐心细致，孩子玩得很开心，收获满满。'
    }
  ],
  // 用户相关模拟数据
  '/user/info': {
    username: '陈思远',
    avatar: 'https://placehold.co/100?text=陈',
    memberLevel: '普通会员',
    phone: '138****8888',
    email: 'chen****@gmail.com',
    isVerified: true
  },
  // 预约记录相关模拟数据
  '/booking/records': {
    list: [
      {
        id: 1,
        title: '印象莫奈：光与影的艺术',
        time: '2024-01-15 14:00',
        people: 2,
        status: '待参观',
        image: 'https://placehold.co/600x400?text=莫奈展览'
      },
      {
        id: 2,
        title: '当代艺术展：无界',
        time: '2023-12-20 10:30',
        people: 1,
        status: '已完成',
        image: 'https://placehold.co/600x400?text=当代艺术'
      },
      {
        id: 3,
        title: '中国古代青铜器展',
        time: '2023-12-05 15:00',
        people: 3,
        status: '已完成',
        image: 'https://placehold.co/600x400?text=青铜器'
      }
    ],
    total: 3
  },
  // 展览相关
  '/exhibition/all': [
    {
      id: 1,
      title: '印象莫奈：光与影的艺术',
      description: '沉浸式体验印象派大师莫奈的艺术世界，感受光与色彩的魅力',
      colPic: 'https://placehold.co/1200x500?text=印象莫奈',
      startDate: '2024-01-15 00:00:00',
      endDate: '2024-04-15 00:00:00',
      location: '东馆1层',
      status: 'ongoing'
    },
    {
      id: 2,
      title: '古代中国：文明的印记',
      description: '跨越三千年的文明长河，探索中华文化的璀璨历程',
      colPic: 'https://placehold.co/1200x500?text=古代中国',
      startDate: '2023-12-01 00:00:00',
      endDate: '2024-03-01 00:00:00',
      location: '东馆2层',
      status: 'ongoing'
    },
    {
      id: 3,
      title: '当代艺术展：无界之美',
      description: '探索当代艺术家的创新表达，体验跨越国界的艺术视觉盛宴',
      colPic: 'https://placehold.co/1200x500?text=当代艺术展',
      startDate: '2024-02-10 00:00:00',
      endDate: '2024-05-10 00:00:00',
      location: '西馆特展区',
      status: 'ongoing'
    }
  ],
  
  '/exhibition/list': {
    total: 3,
    rows: [
      {
        id: 1,
        title: '印象莫奈：光与影的艺术',
        description: '沉浸式体验印象派大师莫奈的艺术世界，感受光与色彩的魅力',
        colPic: 'https://placehold.co/600x400?text=莫奈展览',
        startDate: '2024-01-15 00:00:00',
        endDate: '2024-04-15 00:00:00',
        location: '东馆1层',
        status: 'ongoing'
      },
      {
        id: 2,
        title: '古代中国：文明的印记',
        description: '跨越三千年的文明长河，探索中华文化的璀璨历程',
        colPic: 'https://placehold.co/600x400?text=古代中国',
        startDate: '2023-12-01 00:00:00',
        endDate: '2024-03-01 00:00:00',
        location: '东馆2层',
        status: 'ongoing'
      },
      {
        id: 3,
        title: '当代艺术展：无界之美',
        description: '探索当代艺术家的创新表达，体验跨越国界的艺术视觉盛宴',
        colPic: 'https://placehold.co/600x400?text=当代艺术',
        startDate: '2024-02-10 00:00:00',
        endDate: '2024-05-10 00:00:00',
        location: '西馆特展区',
        status: 'ongoing'
      }
    ],
    pageNum: 1,
    pageSize: 3,
    pages: 1
  },
  
  // 公告相关（作为活动数据）
  '/announcement/list': {
    total: 2,
    rows: [
      {
        id: 1,
        title: '博物馆之夜：星空下的艺术之旅',
        content: '夜间特别开放，在星空下欣赏艺术品，专业讲解员带你领略夜间博物馆的魅力。',
        publishTime: '2024-03-21 19:00:00',
        status: 1
      },
      {
        id: 2,
        title: '儿童艺术工坊：探索创意的世界',
        content: '专为7-12岁儿童设计的创意工坊，让孩子在艺术创作中探索自我。',
        publishTime: '2024-02-15 10:00:00',
        status: 1
      }
    ],
    pageNum: 1,
    pageSize: 2,
    pages: 1
  },
  
  // 反馈相关（作为评价数据）
  '/feedback/list': {
    total: 3,
    rows: [
      {
        id: 1,
        userId: '李明',
        content: '莫奈展览令人叹为观止，灯光效果与画作完美融合，仿佛置身于莫奈的花园中。讲解员知识渊博，让我对印象派有了全新的认识。',
        status: 1,
        createTime: '2024-02-15 14:30:00'
      },
      {
        id: 2,
        userId: '张华',
        content: '博物馆环境优雅，展品丰富多样。预约系统便捷高效，没有排队等待。唯一不足是餐厅选择较少。',
        status: 1,
        createTime: '2024-02-12 10:15:00'
      },
      {
        id: 3,
        userId: '王丽',
        content: '带孩子参加了儿童艺术工坊，活动设计得非常有趣且有教育意义。工作人员耐心细致，孩子玩得很开心，收获满满。',
        status: 1,
        createTime: '2024-02-10 16:45:00'
      }
    ],
    pageNum: 1,
    pageSize: 3,
    pages: 1
  }
}

// 处理模拟响应
const mockResponse = (config) => {
  const { url, method } = config
  
  // 移除baseURL部分，只保留路径
  let path = url
  if (path.startsWith('http')) {
    const urlObj = new URL(path)
    path = urlObj.pathname
  }
  
  // 处理查询参数
  if (path.includes('?')) {
    path = path.split('?')[0]
  }
  
  console.log('请求路径:', path, '是否有模拟数据:', mockData[path] ? '是' : '否')
  
  // 检查是否有匹配的模拟数据
  if (mockData[path]) {
    return [200, { status: 200, message: '操作成功', data: mockData[path] }]
  }
  
  // 没有找到匹配的模拟数据
  return [404, { status: 404, message: '未找到资源', data: null }]
}

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`
    }
    
    console.log('Request Config:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      useMockData
    })
    
    // 如果启用了模拟数据，拦截请求
    if (useMockData) {
      // 调整url，去掉可能重复的/api前缀
      let url = config.url
      if (url.startsWith('/api/')) {
        url = url.substring(4) // 去掉开头的/api/
      }
      config.url = url
      
      // 创建取消令牌源
      const source = axios.CancelToken.source()
      config.cancelToken = source.token
      
      // 取消实际请求，返回模拟数据
      setTimeout(() => {
        const [status, data] = mockResponse(config)
        source.cancel(JSON.stringify({ status, data }))
      }, 300) // 模拟网络延迟
    }
    
    return config
  },
  error => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    console.log('Response:', {
      status: response.status,
      data: response.data,
      config: response.config
    })
    
    const res = response.data
    
    // API文档中定义的响应格式使用code字段为200表示成功
    if (res.code !== undefined && res.code !== 200) {
      ElMessage.error(res.msg || '请求失败')
      
      // 处理401未授权情况
      if (res.code === 401) {
        const userStore = useUserStore()
        userStore.logoutAction()
        router.push('/login')
      }
      
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    
    return res
  },
  error => {
    if (error.message === 'canceled') {
      // 模拟数据的取消请求，返回mock数据
      try {
        const mockRes = JSON.parse(error.response)
        console.log('Mock Response:', mockRes)
        return mockRes
      } catch (e) {
        console.error('Mock Data Parse Error:', e)
      }
    }
    
    // 处理网络错误
    console.error('Response Error:', error.response || error)
    const errorMsg = error.response?.data?.msg || error.message || '服务器错误，请稍后重试'
    ElMessage.error(errorMsg)
    return Promise.reject(error)
  }
)

export default service 
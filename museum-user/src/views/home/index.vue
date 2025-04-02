<template>
  <page-container>
    <div class="home-page" v-loading="loading" element-loading-text="加载中...">
      <!-- Hero轮播图区域 -->
      <div class="hero-carousel">
        <el-carousel :interval="5000" height="500px" indicator-position="inside" arrow="always">
          <el-carousel-item v-for="slide in heroSlides" :key="slide.id">
            <div class="carousel-item">
              <div class="carousel-img-container">
                <img :src="slide.image" :alt="slide.title" class="carousel-img" />
              </div>
              <div class="carousel-content">
                <div class="carousel-info">
                  <h2 class="carousel-title">{{ slide.title }}</h2>
                  <p class="carousel-desc">{{ slide.description }}</p>
                  <el-button type="primary" size="large" class="round-button">立即预约</el-button>
                </div>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>

      <!-- 热门展览区域 -->
      <div class="section-title-container">
        <h2 class="section-title">热门展览</h2>
        <router-link to="/exhibition" class="view-more">
          查看更多 <el-icon><ArrowRight /></el-icon>
        </router-link>
      </div>
      
      <div class="exhibition-cards-container">
        <el-row :gutter="24">
          <el-col :span="8" v-for="exhibition in hotExhibitions" :key="exhibition.id">
            <div class="exhibition-card">
              <div class="exhibition-img-container">
                <img :src="exhibition.image" :alt="exhibition.title" class="exhibition-img" />
              </div>
              <div class="exhibition-info">
                <h3 class="exhibition-title">{{ exhibition.title }}</h3>
                <p class="exhibition-date">{{ exhibition.date }}</p>
                <el-button type="primary" class="round-button full-width">预约参观</el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 最新活动区域 -->
      <div class="section-title-container">
        <h2 class="section-title">最新活动</h2>
      </div>
      
      <div class="activities-container">
        <el-row :gutter="24">
          <el-col :span="12" v-for="activity in activities" :key="activity.id">
            <div class="activity-item">
              <div class="activity-img-container">
                <img :src="activity.image" :alt="activity.title" class="activity-img" />
              </div>
              <div class="activity-info">
                <h3 class="activity-title">{{ activity.title }}</h3>
                <p class="activity-date">{{ activity.date }}</p>
                <p class="activity-desc">{{ activity.description }}</p>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 用户评价区域 -->
      <div class="section-title-container">
        <h2 class="section-title">访客评价</h2>
      </div>
      
      <div class="reviews-container">
        <el-row :gutter="24">
          <el-col :span="8" v-for="review in reviews" :key="review.id">
            <div class="review-card">
              <div class="review-header">
                <el-avatar :size="40" :src="review.avatar" />
                <div class="review-user">
                  <div class="review-name">{{ review.name }}</div>
                  <el-rate
                    v-model="review.rating"
                    disabled
                    show-score
                    text-color="#ff9900"
                  />
                </div>
              </div>
              <div class="review-content">{{ review.content }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </page-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import { Search, ArrowRight } from '@element-plus/icons-vue'
import { 
  getHomeData, 
  getCarouselList, 
  getHotExhibitions, 
  getLatestActivities, 
  getVisitorReviews 
} from '@/api/home'

// 加载状态
const loading = ref(false)

// 轮播图数据（展览数据）
const heroSlides = ref([
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
])

// 热门展览数据
const hotExhibitions = ref([
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
])

// 活动数据
const activities = ref([
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
])

// 用户评价
const reviews = ref([
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
])

// 处理图片URL
const formatImageUrl = (imagePath) => {
  if (!imagePath) return 'https://placehold.co/600x400?text=展览图片'
  
  // 如果是完整的URL，直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // 使用文件访问接口
  const baseUrl = import.meta.env.VITE_APP_BASE_API
  return `${baseUrl}/file/getPic?name=${imagePath}`
}

// 一次性获取所有数据
const fetchAllData = async () => {
  try {
    loading.value = true
    
    // 如果有集成的API，可以使用
    try {
      const res = await getHomeData()
      if (res.status === 200 && res.data) {
        processHomeData(res.data)
      }
    } catch (error) {
      console.log('综合接口不可用，尝试分别获取数据')
      await fetchDataSeparately()
    }
  } catch (error) {
    console.error('获取首页数据失败:', error)
    ElMessage.error('获取首页数据失败')
  } finally {
    loading.value = false
  }
}

// 处理综合接口返回的数据
const processHomeData = (data) => {
  // 如果有相应数据，就进行设置
  if (data) {
    // 可以根据实际API返回结构进行调整
  }
}

// 分开获取各部分数据
const fetchDataSeparately = async () => {
  try {
    loading.value = true
    const promises = []
    
    // 获取轮播图数据（展览数据）
    promises.push(
      getCarouselList().then(res => {
        console.log('轮播图数据响应:', res)
        if (res && res.code === 200 && res.data) {
          // 取前3个展览作为轮播图
          const exhibitions = res.data.slice(0, 3)
          heroSlides.value = exhibitions.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description || '精彩展览，欢迎预约参观',
            image: formatImageUrl(item.colPic)
          }))
          console.log('处理后的轮播图数据:', heroSlides.value)
        }
      }).catch(err => {
        console.log('获取轮播图数据失败，使用默认数据', err)
      })
    )
    
    // 获取热门展览数据
    promises.push(
      getHotExhibitions().then(res => {
        console.log('热门展览数据响应:', res)
        if (res && res.code === 200 && res.data) {
          // 获取展览列表
          const exhibitions = res.data.rows || res.data.list || res.data
          hotExhibitions.value = exhibitions.map(item => ({
            id: item.id,
            title: item.title,
            date: formatDate(item.startDate, item.endDate),
            image: formatImageUrl(item.colPic)
          }))
          console.log('处理后的热门展览数据:', hotExhibitions.value)
        }
      }).catch(err => {
        console.log('获取热门展览数据失败，使用默认数据', err)
      })
    )
    
    // 暂时不获取活动和反馈数据，使用默认值
    
    // 等待所有请求完成
    await Promise.allSettled(promises)
    
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (startDate, endDate) => {
  if (!startDate && !endDate) return '展览进行中'
  
  let formattedDate = ''
  
  if (startDate) {
    const start = startDate.split(' ')[0].replace(/-/g, '.')
    formattedDate += start
  }
  
  if (endDate) {
    const end = endDate.split(' ')[0].replace(/-/g, '.')
    formattedDate += ` - ${end}`
  }
  
  return formattedDate || '展览进行中'
}

// 格式化数字（添加千位分隔符或转换为K/M/+格式）
const formatNumber = (num) => {
  if (num >= 10000) {
    return num >= 1000000 
      ? Math.floor(num / 1000000) + 'M+' 
      : Math.floor(num / 1000) + 'K+'
  }
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 页面加载时获取数据
onMounted(() => {
  // 分开获取各部分数据
  fetchDataSeparately()
})
</script>

<style lang="scss" scoped>
.home-page {
  padding-bottom: 40px;
}

// 轮播图区域
.hero-carousel {
  margin-bottom: 40px;
  
  .carousel-item {
    position: relative;
    height: 100%;
    width: 100%;
    
    .carousel-img-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      
      .carousel-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%);
      }
    }
    
    .carousel-content {
      position: relative;
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 60px;
      color: #fff;
      z-index: 1;
      
      .carousel-info {
        max-width: 550px;
        
        .carousel-title {
          font-size: 36px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        .carousel-desc {
          font-size: 16px;
          margin-bottom: 24px;
          line-height: 1.6;
        }
      }
    }
  }
}

// 通用标题容器
.section-title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 30px 40px 20px;
  
  .section-title {
    font-size: 18px;
    font-weight: bold;
    color: #303133;
    margin: 0;
    position: relative;
    padding-left: 12px;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 18px;
      background-color: #1E4B8C;
      border-radius: 2px;
    }
  }
  
  .view-more {
    color: #1E4B8C;
    text-decoration: none;
    font-size: 14px;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

// 展览卡片容器
.exhibition-cards-container {
  padding: 0 40px;
  margin-bottom: 40px;
}

// 展览卡片样式
.exhibition-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .exhibition-img-container {
    height: 200px;
    overflow: hidden;
    
    .exhibition-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
  }
  
  .exhibition-info {
    padding: 16px;
    
    .exhibition-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 8px;
      color: #303133;
    }
    
    .exhibition-date {
      color: #909399;
      font-size: 14px;
      margin-bottom: 16px;
    }
  }
}

// 活动容器
.activities-container {
  padding: 0 40px;
  margin-bottom: 40px;
}

// 活动项目样式
.activity-item {
  display: flex;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .activity-img-container {
    flex: 0 0 150px;
    height: 120px;
    overflow: hidden;
    
    .activity-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .activity-info {
    flex: 1;
    padding: 16px;
    
    .activity-title {
      font-size: 16px;
      font-weight: bold;
      color: #303133;
      margin-bottom: 6px;
    }
    
    .activity-date {
      color: #909399;
      font-size: 14px;
      margin-bottom: 8px;
    }
    
    .activity-desc {
      color: #606266;
      font-size: 14px;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
  }
}

// 评价容器
.reviews-container {
  padding: 0 40px;
  margin-bottom: 40px;
}

// 评价卡片样式
.review-card {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 20px;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .review-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    
    .review-user {
      margin-left: 15px;
      
      .review-name {
        font-weight: bold;
        margin-bottom: 5px;
        color: #303133;
      }
    }
  }
  
  .review-content {
    color: #606266;
    line-height: 1.6;
    font-size: 14px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
  }
}

// 通用按钮样式
.round-button {
  border-radius: 4px;
  font-size: 14px;
  
  &.full-width {
    width: 100%;
  }
}

// 响应式样式调整
@media (max-width: 768px) {
  .section-title-container {
    margin: 30px 20px 16px;
  }
  
  .exhibition-cards-container,
  .activities-container,
  .reviews-container {
    padding: 0 20px;
  }
  
  .activity-item {
    flex-direction: column;
    
    .activity-img-container {
      flex: none;
      height: 160px;
      width: 100%;
    }
  }
}
</style> 
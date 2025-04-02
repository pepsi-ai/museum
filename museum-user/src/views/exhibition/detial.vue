<template>
  <div class="exhibition-detail">
    <!-- 加载状态 -->
    <div v-if="loading" class="container">
      <div class="loading-card">
        <el-skeleton :rows="10" animated />
      </div>
    </div>

    <!-- 展览内容 -->
    <div v-else-if="exhibition" class="exhibition-content">
      <!-- 展览大图区域 -->
      <div class="exhibition-hero">
        <div class="hero-image">
          <img 
            :src="exhibition.colPic ? getImageUrl(exhibition.colPic) : require('@/assets/museum-hero.png')" 
            :alt="exhibition.title" 
            class="cover-image"
            @error="handleImageError"
          />
          <div class="image-overlay"></div>
        </div>
        
        <!-- 展览标题和状态 -->
        <div class="hero-content">
          <div class="container">
            <div class="tag-container">
              <el-tag 
                type="success" 
                effect="dark"
                class="status-tag"
              >
                进行中
              </el-tag>
              <div class="collection-tag" @click="toggleCollectExhibition">
                <el-icon class="icon-star"><Star /></el-icon>
                <span>{{ isCollected ? '已收藏' : '收藏展览' }}</span>
              </div>
            </div>
            <h1 class="exhibition-title">{{ exhibition.title }}</h1>
            <p class="exhibition-subtitle">{{ exhibition.shortDescription }}</p>
          </div>
        </div>
      </div>
      
      <!-- 内容区域 -->
      <div class="container">
        <div class="main-content">
          <!-- 左侧区域（展览信息、介绍、参观须知） -->
          <div class="content-left">
            <!-- 展览信息区 -->
            <div class="info-card">
              <h2 class="section-title">展览信息</h2>
              <div class="info-list">
                <div class="info-item">
                  <span class="info-label">展览时间：</span>
                  <span>{{ formatDate(exhibition.startDate) }} - {{ formatDate(exhibition.endDate) }}</span>
                </div>
                
                <div class="info-item">
                  <span class="info-label">展览地点：</span>
                  <span>{{ exhibition.location }}</span>
                </div>
              </div>
            </div>
            
            <!-- 展览介绍 -->
            <div class="info-card">
              <h2 class="section-title">展览介绍</h2>
              <div class="description-content">
                {{ exhibition.description }}
              </div>
            </div>
            
            <!-- 参观须知 -->
            <div class="info-card">
              <h2 class="section-title">参观须知</h2>
              <ul class="notice-list">
                <li class="notice-item">
                  <el-icon class="notice-icon"><InfoFilled /></el-icon>
                  <span>请提前 15 分钟到达展厅</span>
                </li>
                <li class="notice-item">
                  <el-icon class="notice-icon"><InfoFilled /></el-icon>
                  <span>展厅内禁止饮食，请勿触摸展品</span>
                </li>
              </ul>
            </div>
          </div>
          
          <!-- 右侧预约区 -->
          <div class="content-right">
            <div class="booking-card">
              <div class="booking-header">
                <h3 class="booking-title">预约参观</h3>
              </div>
              
              <div class="booking-content">
                <!-- 选择日期 -->
                <div class="booking-field">
                  <div class="field-label">选择日期</div>
                  <el-date-picker
                    v-model="selectedDate"
                    type="date"
                    placeholder="请选择日期"
                    class="date-picker"
                    :disabled-date="disabledDate"
                    format="YYYY.MM.DD"
                    value-format="YYYY-MM-DD"
                    @change="handleDateChange"
                  />
                </div>
                
                <!-- 选择时段 -->
                <div class="booking-field">
                  <div class="field-label">选择时段</div>
                  <div class="time-selector">
                    <div 
                      class="time-option time-morning"
                      :class="{'time-active': selectedTimeSlot === 'morning'}"
                      @click="selectedTimeSlot = 'morning'"
                    >
                      <div class="option-label">上午场</div>
                      <div class="option-time">08:30</div>
                    </div>
                    <div 
                      class="time-option time-afternoon"
                      :class="{'time-active': selectedTimeSlot === 'afternoon'}"
                      @click="selectedTimeSlot = 'afternoon'"
                    >
                      <div class="option-label">下午场</div>
                      <div class="option-time">14:30</div>
                    </div>
                  </div>
                </div>

                <!-- 预约人数 -->
                <div class="booking-field">
                  <div class="field-label">预约人数</div>
                  <div class="counter-control">
                    <button 
                      class="counter-btn"
                      @click="decrementVisitors"
                    >
                      <el-icon><Remove /></el-icon>
                    </button>
                    <span class="counter-value">{{ visitorCount }}</span>
                    <button 
                      class="counter-btn"
                      @click="incrementVisitors"
                    >
                      <el-icon><Plus /></el-icon>
                    </button>
                  </div>
                </div>

                <!-- 预约按钮 -->
                <el-button 
                  type="primary" 
                  class="booking-btn"
                  :loading="submitting"
                  @click="submitReservation"
                >
                  立即预约
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 数据为空时显示 -->
    <div v-else class="container">
      <div class="empty-container">
        <el-empty description="展览信息不存在" />
        <div class="empty-action">
          <el-button type="primary" size="large" @click="$router.push('/exhibition')">返回展览列表</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getExhibitionDetail, getImageUrl, createReservation } from '@/api/exhibition'
import { useUserStore } from '@/stores/user'
import { Calendar, Location, InfoFilled, Star, Remove, Plus } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { getReservationTimeSlots } from '@/api/reservation'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const exhibitionId = computed(() => route.params.id)
const loading = ref(true)
const exhibition = ref(null)
const submitting = ref(false)
const imageLoadError = ref(false)
const isCollected = ref(false)

// 数据部分
const timeSlots = ref([])
const isLoadingTimeSlots = ref(false)

// 处理图片加载错误
const handleImageError = (e) => {
  imageLoadError.value = true
  e.target.src = require('@/assets/museum-hero.png') // 使用默认图片
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

// 预约表单
const selectedDate = ref('')
const selectedTimeSlot = ref('morning')
const visitorCount = ref(1)

// 增加人数
const incrementVisitors = () => {
  if (visitorCount.value < 10) {
    visitorCount.value++
  }
}

// 减少人数
const decrementVisitors = () => {
  if (visitorCount.value > 1) {
    visitorCount.value--
  }
}

// 日期限制
const disabledDate = (time) => {
  if (!exhibition.value) return true
  const start = new Date(exhibition.value.startDate)
  const end = new Date(exhibition.value.endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // 检查日期是否在展览时间范围内且不早于今天
  return time.getTime() < Math.max(start.getTime(), today.getTime()) || time.getTime() > end.getTime()
}

// 当选择日期时获取时间段
const handleDateChange = async (date) => {
  if (!date) return
  
  selectedDate.value = date
  isLoadingTimeSlots.value = true
  
  try {
    const response = await getReservationTimeSlots(exhibition.value.id, date)
    if (response.code === 200 && response.data) {
      timeSlots.value = response.data
      // 默认选择上午场次
      if (timeSlots.value.length > 0) {
        const morningSlot = timeSlots.value.find(slot => slot.session === '上午')
        if (morningSlot) {
          selectedTimeSlot.value = 'morning'
        } else if (timeSlots.value.length > 0) {
          selectedTimeSlot.value = 'afternoon'
        }
      }
    } else {
      ElMessage.warning('获取时间段失败')
      timeSlots.value = []
    }
  } catch (error) {
    console.error('获取时间段失败:', error)
    ElMessage.error('网络错误，请稍后重试')
    timeSlots.value = []
  } finally {
    isLoadingTimeSlots.value = false
  }
}

// 获取展览详情
const fetchExhibitionDetail = async () => {
  const id = route.params.id
  if (!id) {
    ElMessage.error('展览ID不存在')
    router.push('/exhibition')
    return
  }
  
  loading.value = true
  try {
    const response = await getExhibitionDetail(id)
    if (response && response.code === 200) {
      exhibition.value = response.data
      
      // 如果没有数据或请求成功但返回空对象，添加默认测试数据
      if (!exhibition.value || Object.keys(exhibition.value).length === 0) {
        exhibition.value = {
          id: id,
          title: '超跑科技展',
          shortDescription: '探索未来汽车科技的无限可能',
          description: '本次展览将为您呈现世界顶级超级跑车的精彩展示，包括最新概念车型和尖端科技成果。通过互动体验区域，您可以近距离感受超跑带来的速度与激情。展览还设有专业讲解环节，深入解析超级跑车的设计理念和技术创新。',
          colPic: 'https://placehold.co/800x400?text=超跑科技展',
          startDate: '2025-03-20 00:00:00',
          endDate: '2025-03-22 00:00:00',
          location: '一号展厅',
          status: 'ongoing',
          type: '科技展览',
          openingHours: '09:00-17:00'
        }
      }
      
      // 获取收藏状态
      checkCollectionStatus()
    } else {
      ElMessage.error(response?.msg || '获取展览详情失败')
    }
  } catch (error) {
    console.error('获取展览详情失败:', error)
    ElMessage.error('获取展览详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 检查收藏状态
const checkCollectionStatus = async () => {
  if (!userStore.token || !exhibition.value?.id) {
    isCollected.value = false
    return
  }
  
  try {
    const response = await request({
      url: '/like/listUserLikes',
      method: 'post',
      data: {
        userId: String(userStore.userId),
        collType: 'EXH'
      }
    })
    
    if (response.code === 200 && response.data) {
      const likedList = response.data || []
      isCollected.value = likedList.includes(Number(exhibition.value.id))
    }
  } catch (error) {
    console.error('获取收藏状态失败:', error)
  }
}

// 收藏/取消收藏展览
const toggleCollectExhibition = async () => {
  if (!userStore.token) {
    ElMessageBox.confirm(
      '收藏需要登录，是否前往登录?',
      '提示',
      {
        confirmButtonText: '前往登录',
        cancelButtonText: '取消',
        type: 'info'
      }
    ).then(() => {
      router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    }).catch(() => {})
    return
  }
  
  const exhibId = exhibition.value.id
  const userId = userStore.userId
  
  if (!exhibId || !userId) {
    ElMessage.error('参数错误')
    return
  }
  
  try {
    // 根据当前收藏状态决定调用添加还是删除API
    const url = isCollected.value ? '/like/delLikeExh' : '/like/addLikeExh'
    
    // 先更新UI状态，提升响应速度
    isCollected.value = !isCollected.value
    
    const response = await request({
      url,
      method: 'post',
      data: {
        userId: String(userId),
        collId: exhibId
      }
    })
    
    if (response.code === 200) {
      ElMessage.success(isCollected.value ? '收藏成功' : '已取消收藏')
    } else {
      // 如果失败，恢复之前的状态
      isCollected.value = !isCollected.value
      ElMessage.error(response.msg || '操作失败')
    }
  } catch (error) {
    // 如果出错，恢复之前的状态
    isCollected.value = !isCollected.value
    console.error('收藏操作失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 提交预约
const submitReservation = async () => {
  if (!selectedDate.value) {
    ElMessage.warning('请选择参观日期')
    return
  }
  
  if (!userStore.token) {
    ElMessageBox.confirm(
      '预约需要登录，是否前往登录?',
      '提示',
      {
        confirmButtonText: '前往登录',
        cancelButtonText: '取消',
        type: 'info'
      }
    ).then(() => {
      router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    }).catch(() => {})
    return
  }
  
  // 获取所选时间段ID
  let timeSlotId = null
  if (timeSlots.value.length > 0) {
    const selectedSlot = timeSlots.value.find(slot => 
      (selectedTimeSlot.value === 'morning' && slot.session === '上午') || 
      (selectedTimeSlot.value === 'afternoon' && slot.session === '下午')
    )
    if (selectedSlot) {
      timeSlotId = selectedSlot.id
    }
  }
  
  if (!timeSlotId) {
    ElMessage.warning('未找到可用的时间段，请选择其他日期')
    return
  }
  
  const submitData = {
    userId: String(userStore.userId),
    timeSlotId: timeSlotId,
    userCount: visitorCount.value
  }
  
  try {
    loading.value = true
    const response = await request({
      url: '/reserve/make',
      method: 'post',
      data: submitData
    })
    
    if (response.code === 200) {
      ElMessage.success('预约成功！')
      // 重置预约表单
      selectedDate.value = ''
      selectedTimeSlot.value = 'morning'
      visitorCount.value = 1
      timeSlots.value = []
    } else {
      ElMessage.error(response.msg || '预约失败，请稍后重试')
    }
  } catch (error) {
    console.error('预约提交失败:', error)
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  fetchExhibitionDetail()
})
</script>

<style scoped>
.exhibition-detail {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.loading-card, .empty-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  padding: 32px;
  margin: 32px 0;
}

.exhibition-content {
  padding-bottom: 40px;
}

/* 展览大图区域 */
.exhibition-hero {
  position: relative;
  margin-bottom: 24px;
}

.hero-image {
  width: 100%;
  height: 400px;
  overflow: hidden;
  position: relative;
  border-radius: 12px;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
}

.hero-content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px 0;
}

.tag-container {
  display: flex;
  align-items: center;
}

.status-tag {
  margin-right: 12px;
}

.collection-tag {
  display: flex;
  align-items: center;
  color: white;
  cursor: pointer;
  transition: color 0.2s;
}

.collection-tag:hover {
  color: #ffc107;
}

.icon-star {
  margin-right: 4px;
}

.exhibition-title {
  font-size: 32px;
  font-weight: bold;
  color: white;
  margin: 12px 0;
}

.exhibition-subtitle {
  color: white;
  font-size: 18px;
}

/* 主内容区域 */
.main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

.info-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.info-label {
  color: #606266;
  display: inline-block;
  width: 96px;
}

.description-content {
  white-space: pre-line;
  color: #606266;
  line-height: 1.6;
  font-size: 14px;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice-item {
  display: flex;
  align-items: center;
  color: #606266;
  font-size: 14px;
}

.notice-icon {
  margin-right: 8px;
  color: #1E3D8F;
}

/* 预约区域 */
.booking-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  position: sticky;
  top: 16px;
}

.booking-header {
  padding: 16px;
  background-color: #1E3D8F;
}

.booking-title {
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.booking-content {
  padding: 20px;
}

.booking-field {
  margin-bottom: 20px;
}

.field-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.date-picker {
  width: 100%;
}

.time-selector {
  display: flex;
}

.time-option {
  flex: 1;
  border: 1px solid #dcdfe6;
  padding: 12px 8px;
  cursor: pointer;
  text-align: center;
}

.time-morning {
  border-radius: 4px 0 0 4px;
}

.time-afternoon {
  border-radius: 0 4px 4px 0;
  border-left: none;
}

.time-active {
  border-color: #1E3D8F;
  background-color: #f0f5ff;
  font-weight: 500;
}

.option-label {
  color: #303133;
  font-size: 14px;
}

.option-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.counter-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px 16px;
}

.counter-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
}

.counter-btn:hover {
  background-color: #e4e7ed;
}

.counter-value {
  font-size: 16px;
  font-weight: 500;
}

.booking-btn {
  width: 100%;
  margin-top: 8px;
  --el-button-bg-color: #1E3D8F !important;
  --el-button-border-color: #1E3D8F !important;
  --el-button-hover-bg-color: #2a5ca0 !important;
  --el-button-hover-border-color: #2a5ca0 !important;
  --el-button-active-bg-color: #153a6b !important;
  --el-button-active-border-color: #153a6b !important;
}

/* 空状态 */
.empty-container {
  text-align: center;
  padding: 40px;
}

.empty-action {
  margin-top: 24px;
}
</style> 
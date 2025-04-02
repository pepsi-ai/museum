<template>
  <div class="exhibition-container">
    <!-- 筛选区域 -->
    <div class="filter-area">
      <div class="filter-container">
        <div class="filter-row">
          <span class="filter-label">预约状态</span>
          <el-select v-model="filterStatus" placeholder="全部状态" class="filter-select">
            <el-option v-for="status in statuses" 
                     :key="status.value" 
                     :label="status.label" 
                     :value="status.value"/>
          </el-select>
        </div>
        <div class="filter-row">
          <span class="filter-label">日期筛选</span>
          <el-date-picker 
            v-model="dateRange" 
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="date-picker"
          />
          <div class="filter-buttons">
            <el-button type="primary" @click="handleFilter" :disabled="loading">筛选</el-button>
            <el-button @click="resetFilter" :disabled="loading">重置</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 预约列表区域 -->
    <div class="exhibition-list-area">
      <div v-loading="loading">
        <div v-if="!loading && filteredReservations.length > 0" class="exhibition-grid">
          <div v-for="reservation in filteredReservations" 
               :key="reservation.id" 
               class="exhibition-card">
            <div class="exhibition-image-container">
              <div class="exhibition-type-tag">{{ reservation.resTyp || '展览预约' }}</div>
            </div>
            <div class="exhibition-content">
              <h3 class="exhibition-title">{{ reservation.title }}</h3>
              <div class="exhibition-info">
                <div class="info-item">
                  <i class="el-icon-time"></i>
                  <span>预约时间：{{ formatDate(reservation.resDate) }}</span>
                </div>
                <div class="info-item">
                  <i class="el-icon-clock"></i>
                  <span>时间段：{{ reservation.resTime }}</span>
                </div>
                <div class="info-item">
                  <i class="el-icon-user"></i>
                  <span>预约人数：{{ reservation.resSum || 0 }}人</span>
                </div>
                <div class="info-item">
                  <i class="el-icon-location"></i>
                  <span>场次：{{ reservation.resSession }}</span>
                </div>
                <div class="exhibition-status">
                  状态：<span :class="'status-' + getStatusClass(reservation)">{{ getStatusText(reservation) }}</span>
                </div>
              </div>
              <div class="button-group">
                <el-button 
                  type="primary" 
                  class="detail-button"
                  @click="goToDetail(reservation.exhibitionId)">
                  查看详情
                </el-button>
              </div>
            </div>
          </div>
        </div>
        <el-pagination
          v-if="total > 0"
          class="pagination"
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
        <el-empty v-else-if="!loading" description="暂无预约数据"></el-empty>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const reservations = ref([])
const filterStatus = ref('all')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const statuses = [
  { label: '全部状态', value: 'all' },
  { label: '未开始', value: 'pending' },
  { label: '进行中', value: 'ongoing' },
  { label: '已完成', value: 'completed' }
]

// 计算筛选后的预约列表
const filteredReservations = computed(() => {
  let result = [...(reservations.value?.list || [])]
  
  // 按状态筛选
  if (filterStatus.value !== 'all') {
    result = result.filter(item => getStatusClass(item) === filterStatus.value)
  }
  
  // 按日期筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const startTime = dateRange.value[0].getTime()
    const endTime = dateRange.value[1].getTime()
    
    result = result.filter(item => {
      const reservationDate = new Date(item.resDate).getTime()
      return reservationDate >= startTime && reservationDate <= endTime
    })
  }
  
  return result
})

// 获取预约数据
const fetchReservations = async () => {
  loading.value = true
  try {
    const response = await request({
      url: '/reserve/listMsReserve',
      method: 'post',
      data: {
        pagenum: currentPage.value,
        pagesize: pageSize.value,
        userId: userStore.userId
      }
    })
    
    if (response && response.code === 200) {
      reservations.value = response.data || {}
      total.value = response.data?.total || 0
      console.log('预约数据:', response.data)
    } else {
      ElMessage.error(response?.msg || '获取预约数据失败')
    }
  } catch (error) {
    console.error('获取预约列表失败:', error)
    ElMessage.error('获取预约数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理页码变化
const handlePageChange = (page) => {
  currentPage.value = page
  fetchReservations()
}

// 处理每页条数变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchReservations()
}

// 获取预约状态样式类
const getStatusClass = (reservation) => {
  const now = new Date().getTime()
  const reservationDate = new Date(reservation.resDate).getTime()
  const reservationEndTime = new Date(reservation.resDate + ' ' + reservation.resTime.split('-')[1]).getTime()
  
  if (reservationDate > now) {
    return 'pending'
  } else if (now >= reservationDate && now <= reservationEndTime) {
    return 'ongoing'
  } else {
    return 'completed'
  }
}

// 状态文本转换
const getStatusText = (reservation) => {
  const statusClass = getStatusClass(reservation)
  const statusMap = {
    'pending': '未开始',
    'ongoing': '进行中',
    'completed': '已完成'
  }
  return statusMap[statusClass] || '未知状态'
}

// 日期格式化
const formatDate = (dateStr) => {
  if (!dateStr) return '未知日期'
  const date = new Date(dateStr)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

// 筛选处理
const handleFilter = () => {
  // 筛选逻辑已通过计算属性实现
  console.log('应用筛选:', {
    status: filterStatus.value,
    dateRange: dateRange.value
  })
}

// 重置筛选条件
const resetFilter = () => {
  filterStatus.value = 'all'
  dateRange.value = []
}

// 查看展览详情
const goToDetail = (id) => {
  router.push(`/exhibition/detial/${id}`)
}

onMounted(() => {
  fetchReservations()
})
</script>

<style lang="scss" scoped>
.exhibition-container {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding-bottom: 40px;
}

.filter-area {
  background-color: #fff;
  padding: 16px 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-container {
  max-width: 1200px;
  margin: 0 auto;
}

.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.filter-label {
  width: 80px;
  font-size: 14px;
  color: #333;
  margin-right: 5px;
}

.filter-select {
  width: 180px;
}

.date-picker {
  width: 250px;
}

.filter-buttons {
  margin-left: 15px;
  display: flex;
  gap: 10px;
}

.exhibition-list-area {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.exhibition-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;
}

@media (min-width: 640px) {
  .exhibition-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .exhibition-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.exhibition-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  }
}

.exhibition-image-container {
  height: 120px;
  position: relative;
  background: linear-gradient(45deg, #1E4C88, #2a5ca0);
  display: flex;
  align-items: center;
  justify-content: center;
}

.exhibition-type-tag {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.exhibition-content {
  padding: 20px;
}

.exhibition-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  line-height: 1.4;
}

.exhibition-info {
  margin-bottom: 15px;
  
  .info-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    color: #666;
    font-size: 14px;
    
    i {
      margin-right: 8px;
      font-size: 16px;
      color: #1E4C88;
    }
  }
}

.status-pending {
  color: #1E4C88;
  font-weight: 500;
}

.status-ongoing {
  color: #52c41a;
  font-weight: 500;
}

.status-completed {
  color: #999;
  font-weight: 500;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 15px;
}

.detail-button {
  width: 100%;
  border-radius: 20px;
  font-size: 14px;
  background-color: #1E4C88;
  border-color: #1E4C88;
  
  &:hover {
    background-color: #2a5ca0;
    border-color: #2a5ca0;
  }
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 
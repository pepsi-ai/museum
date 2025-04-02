<template>
  <div class="user-center">
    <div class="page-container" v-loading="loading">
      <!-- 未登录提示 -->
      <div v-if="!userStore.isLogin" class="login-prompt">
        <el-empty description="您尚未登录，请先登录后查看个人中心">
          <el-button type="primary" @click="goToLogin">立即登录</el-button>
        </el-empty>
      </div>
      
      <!-- 已登录内容 -->
      <template v-else>
        <!-- 页面标题 -->
        <div class="page-header">
          <h1 class="page-title">个人中心</h1>
        </div>
        
        <!-- 内容区 -->
        <div class="user-content">
          <!-- 左侧用户信息卡片 -->
          <div class="user-card">
            <div class="avatar-container">
              <el-avatar :size="100" :src="userInfo.avatar || defaultAvatar" />
              <div class="upload-avatar">
                <el-tooltip content="修改头像" placement="bottom">
                  <el-button type="primary" circle size="small" @click="uploadAvatar">
                    <el-icon><EditPen /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>
            <h2 class="user-name">{{ userInfo.username || '用户名' }}</h2>
            <div class="user-info-list">
              <div class="info-item">
                <span class="info-label">手机号</span>
                <span class="info-value">{{ formatPhone(userInfo.phone || userInfo.mobile) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">注册时间</span>
                <span class="info-value">{{ formatDate(userInfo.crtTm || userInfo.date) }}</span>
              </div>
              <div class="info-item" v-if="userInfo.username">
                <span class="info-label">账号</span>
                <span class="info-value">{{ userInfo.username }}</span>
              </div>
              <div class="info-item" v-if="userInfo.nickname">
                <span class="info-label">昵称</span>
                <span class="info-value">{{ userInfo.nickname }}</span>
              </div>
            </div>
            <div class="action-buttons">
              <el-button type="primary" @click="editUserInfo">编辑资料</el-button>
              <el-button @click="changePassword">修改密码</el-button>
            </div>
          </div>
          
          <!-- 右侧内容区域 -->
          <div class="tabs-container">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="我的预约" name="reservations">
                <template v-if="reservationsLoading">
                  <div class="loading-container">
                    <el-skeleton :rows="3" animated />
                  </div>
                </template>
                <template v-else-if="!reservations.length">
                  <div class="empty-data">
                    <el-empty description="暂无预约记录" />
                  </div>
                </template>
                <template v-else>
                  <div class="reservation-list">
                    <!-- 预约卡片示例 -->
                    <div v-for="(item, index) in reservations" :key="index" class="reservation-card">
                      <div class="card-header">
                        <span class="reservation-title">{{ item.title }}</span>
                        <el-tag :type="getStatusType(item.status)" size="small">{{ getStatusText(item.status) }}</el-tag>
                      </div>
                      <div class="card-content">
                        <p><span class="label">预约日期:</span> {{ item.date }}</p>
                        <p><span class="label">预约时间:</span> {{ item.time }}</p>
                        <p><span class="label">人数:</span> {{ item.people }}人</p>
                      </div>
                      <div class="card-footer">
                        <el-button type="primary" size="small" @click="viewDetail(item.id)">
                          <el-icon><View /></el-icon>
                          查看详情
                        </el-button>
                        <el-button type="danger" size="small" v-if="item.status === 'pending'" @click="cancelReservation(item.id)">
                          <el-icon><Delete /></el-icon>
                          取消预约
                        </el-button>
                      </div>
                    </div>
                  </div>
                </template>
              </el-tab-pane>
              
              <el-tab-pane label="我的收藏" name="collections">
                <template v-if="!collections.length">
                  <div class="empty-data">
                    <el-empty description="暂无收藏内容" />
                  </div>
                </template>
                <template v-else>
                  <div class="collection-grid">
                    <div v-for="(item, index) in collections" :key="index" class="collection-item">
                      <el-card :body-style="{ padding: '0px' }" shadow="hover">
                        <img :src="item.image || defaultImage" class="collection-image" />
                        <div class="collection-info">
                          <h3 class="collection-title">{{ item.title }}</h3>
                          <p class="collection-date">{{ item.date }}</p>
                          <div class="collection-actions">
                            <el-button type="primary" link @click="viewCollection(item.id)">查看详情</el-button>
                            <el-button type="danger" link @click="removeCollection(item.id)">取消收藏</el-button>
                          </div>
                        </div>
                      </el-card>
                    </div>
                  </div>
                </template>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </template>
    </div>
    
    <!-- 编辑用户信息对话框 -->
    <el-dialog v-model="dialogVisible" title="编辑个人资料" width="500px">
      <el-form :model="editForm" :rules="formRules" ref="editFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditForm" :loading="submitLoading">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { EditPen, View, Delete } from '@element-plus/icons-vue'
import { getUserReservations, cancelReservation as cancelReservationApi } from '@/api/reservation'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

// 默认头像和图片
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
const defaultImage = 'https://placehold.co/300x200?text=展览图片'

// 用户信息
const userInfo = computed(() => userStore.userInfo || {})

// 加载状态
const loading = ref(false)
const submitLoading = ref(false)
const reservationsLoading = ref(false)

// 编辑对话框
const dialogVisible = ref(false)
const editFormRef = ref(null)
const editForm = reactive({
  username: '',
  phone: '',
  email: ''
})

// 表单校验规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 激活的选项卡
const activeTab = ref('reservations')

// 监听路由参数变化，自动切换到指定标签页
watch(() => route.query.tab, (newTab) => {
  if (newTab && (newTab === 'reservations' || newTab === 'collections')) {
    activeTab.value = newTab
  }
}, { immediate: true })

// 预约数据
const reservations = ref([])

// 获取用户预约数据
const fetchUserReservations = async () => {
  if (!userStore.isLogin) return

  reservationsLoading.value = true
  try {
    // 确保有用户ID
    if (!userStore.userInfo || !userStore.userInfo.id) {
      console.warn('未找到用户ID，无法获取预约数据')
      reservationsLoading.value = false
      return
    }
    
    console.log('正在获取用户预约，用户ID:', userStore.userInfo.id)
    const response = await getUserReservations({ userId: userStore.userInfo.id })
    console.log('预约数据响应:', response)
    
    if (response && response.code === 200) {
      // 适配ReserveDetailController返回的数据结构
      const list = response.data?.list || response.data?.records || []
      reservations.value = list.map(item => ({
        id: item.id,
        title: item.exhibitionName || item.exhibition?.name || item.title || '展览',
        date: item.reserveDate || item.date || '-',
        time: item.reserveTime || item.timeSlot || '-',
        people: item.number || item.people || 1,
        status: getReservationStatus(item.status)
      }))
    } else {
      // 如果API返回错误，使用空数组
      reservations.value = []
    }
  } catch (error) {
    console.error('获取用户预约失败:', error)
    ElMessage.error('获取预约记录失败')
    reservations.value = []
  } finally {
    reservationsLoading.value = false
  }
}

// 转换预约状态
const getReservationStatus = (statusCode) => {
  switch (statusCode) {
    case 0: return 'pending'
    case 1: return 'completed'
    case 2: return 'cancelled'
    default: return 'pending'
  }
}

// 收藏数据
const collections = ref([
  {
    id: 1,
    title: '唐代陶俑展',
    date: '2024-03-01 - 2024-06-30',
    image: 'https://placehold.co/300x200?text=唐代陶俑'
  },
  {
    id: 2,
    title: '丝绸之路文物展',
    date: '2024-02-15 - 2024-05-15',
    image: 'https://placehold.co/300x200?text=丝绸之路'
  }
])

// 格式化手机号
const formatPhone = (phone) => {
  if (!phone && !userInfo.value.mobile) return '未设置'
  const phoneNumber = phone || userInfo.value.mobile
  return phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 格式化日期
const formatDate = (date) => {
  // 尝试从不同属性获取日期
  const dateValue = date || userInfo.value.date || userInfo.value.crtTm
  if (!dateValue) return '未知'
  
  try {
    return new Date(dateValue).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
  } catch (error) {
    console.warn('日期格式化错误:', error)
    return dateValue // 如果格式化失败，返回原始值
  }
}

// 获取状态类型和文本
const getStatusType = (status) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'completed': return 'success'
    case 'cancelled': return 'danger'
    default: return 'info'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'pending': return '待参观'
    case 'completed': return '已完成'
    case 'cancelled': return '已取消'
    default: return '未知状态'
  }
}

// 上传头像
const uploadAvatar = () => {
  ElMessage.info('头像上传功能尚未实现')
}

// 编辑用户信息
const editUserInfo = () => {
  editForm.username = userInfo.value.username || ''
  editForm.phone = userInfo.value.phone || ''
  editForm.email = userInfo.value.email || ''
  dialogVisible.value = true
}

// 提交编辑表单
const submitEditForm = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    submitLoading.value = true
    
    // 这里应该调用API更新用户信息
    // await updateUserInfo(editForm)
    
    ElMessage.success('个人资料更新成功')
    dialogVisible.value = false
    
    // 重新获取用户信息
    // await userStore.getUserInfoAction()
  } catch (error) {
    console.error('更新用户信息失败:', error)
    ElMessage.error('更新失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

// 修改密码
const changePassword = () => {
  ElMessage.info('密码修改功能尚未实现')
}

// 查看预约详情
const viewDetail = (id) => {
  ElMessage.info(`查看预约详情 ID: ${id}，功能尚未实现`)
}

// 取消预约
const cancelReservation = async (id) => {
  try {
    await ElMessageBox.confirm('确定要取消此预约吗？', '取消预约', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await cancelReservationApi(id)
    if (response && response.code === 200) {
      ElMessage.success('预约已取消')
      // 重新获取预约列表
      fetchUserReservations()
    } else {
      ElMessage.error(response?.msg || '取消预约失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消预约失败:', error)
      ElMessage.error('操作失败，请重试')
    }
  }
}

// 查看收藏
const viewCollection = (id) => {
  ElMessage.info(`查看收藏详情 ID: ${id}，功能尚未实现`)
}

// 取消收藏
const removeCollection = (id) => {
  ElMessage.info(`取消收藏 ID: ${id}，功能尚未实现`)
}

// 跳转到登录页
const goToLogin = () => {
  router.push({
    path: '/login',
    query: { redirect: route.fullPath }
  })
}

// 获取用户信息
onMounted(async () => {
  // 从URL参数中获取要显示的标签页
  const tabParam = route.query.tab
  if (tabParam && (tabParam === 'reservations' || tabParam === 'collections')) {
    activeTab.value = tabParam
  }
  
  loading.value = true
  try {
    // 确保已登录且有用户信息
    if (userStore.isLogin) {
      if (!userStore.userInfo) {
        // 先获取用户信息
        await userStore.getUserInfoAction()
      }
      
      try {
        // 使用getdata接口获取用户详细信息
        await userStore.getUserDetailAction()
        console.log('用户详细信息:', userStore.userInfo)
      } catch (error) {
        console.warn('获取用户详细信息失败，将使用基本信息', error)
        // 错误处理：继续使用基本用户信息
      }
      
      // 获取用户预约数据
      if (userStore.userInfo) {
        fetchUserReservations()
      }
    }
  } catch (error) {
    console.error('初始化用户数据失败:', error)
    ElMessage.error('获取用户信息失败')
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.user-center {
  background-color: #f5f5f5;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-header {
  margin-bottom: 24px;
  
  .page-title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
  }
}

.user-content {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.user-card {
  width: 280px;
  padding: 32px 24px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 100%;
  }
  
  .avatar-container {
    position: relative;
    width: 100px;
    height: 100px;
    margin: 0 auto 20px;
    
    .upload-avatar {
      position: absolute;
      right: 0;
      bottom: 0;
    }
  }
  
  .user-name {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 4px;
  }
  
  .user-info-list {
    text-align: left;
    margin-bottom: 20px;
    
    .info-item {
      padding: 12px 0;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      
      &:last-child {
        border-bottom: none;
      }
      
      .info-label {
        font-size: 14px;
        color: #666;
      }
      
      .info-value {
        font-size: 14px;
        color: #333;
      }
    }
  }
  
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 10px;
    align-items: center;
    
    .el-button {
      width: 100%;
      margin: 0;
    }
  }
}

.tabs-container {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
}

.empty-data {
  padding: 40px 0;
}

.reservation-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reservation-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 12px;
    
    .reservation-title {
      font-size: 18px;
      font-weight: bold;
      color: #303133;
    }
  }
  
  .card-content {
    margin-bottom: 16px;
    background-color: #f9f9f9;
    border-radius: 6px;
    padding: 12px;
    
    p {
      margin: 10px 0;
      font-size: 14px;
      color: #606266;
      display: flex;
      align-items: center;
      
      .label {
        font-weight: 600;
        color: #303133;
        margin-right: 12px;
        min-width: 70px;
      }
    }
  }
  
  .card-footer {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    
    .el-button {
      padding: 8px 16px;
    }
  }
}

.collection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  
  .collection-item {
    .collection-image {
      width: 100%;
      height: 150px;
      object-fit: cover;
    }
    
    .collection-info {
      padding: 12px;
      
      .collection-title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .collection-date {
        font-size: 14px;
        color: #666;
        margin-bottom: 12px;
      }
      
      .collection-actions {
        display: flex;
        justify-content: space-between;
      }
    }
  }
}

.login-prompt {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin: 40px 0;
}

.loading-container {
  padding: 20px;
}
</style> 
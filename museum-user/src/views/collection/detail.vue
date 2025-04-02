<template>
  <div class="collection-detail-container">
    <div v-loading="loading" class="collection-detail-wrapper">
      <template v-if="!loading && artifact">
        <div class="collection-detail">
          <div class="collection-image-section">
            <div class="main-image-container">
              <img :src="getImageUrl(artifact.colPic)" :alt="artifact.title" class="main-image" @error="handleImageError($event)">
            </div>
          </div>
          
          <div class="collection-info-section">
            <h1 class="collection-title">{{ artifact.title }}</h1>
            
            <div class="collection-meta">
              <div class="meta-item">
                <span class="meta-label">年代：</span>
                <span class="meta-value">{{ artifact.origin || '未知' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">基本信息：</span>
                <span class="meta-value">{{ artifact.material || '未知' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">分类：</span>
                <span class="meta-value">{{ categoryName || '未知' }}</span>
              </div>
              <div class="meta-item" v-if="artifact.place">
                <span class="meta-label">所属展厅：</span>
                <span class="meta-value">{{ artifact.place }}</span>
              </div>
            </div>
            
            <div class="collection-description">
              <h2 class="section-title">藏品描述</h2>
              <div class="description-content" v-html="formatDescription(artifact.desColl)"></div>
            </div>
            
            <div class="action-buttons">
              <el-button type="info" class="back-button" @click="goBack">
                返回列表
              </el-button>
            </div>
          </div>
        </div>
      </template>
      
      <el-empty v-else-if="!loading" description="未找到藏品信息"></el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCollectionDetail, getImageUrl } from '@/api/collection'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)
const artifact = ref(null)

// 根据藏品的分类ID获取分类名称
const categoryName = computed(() => {
  if (!artifact.value || !artifact.value.cateId) return '未知'
  
  const categoryMap = {
    1: '器皿',
    2: '兵器',
    3: '工具',
    4: '装饰品',
    5: '礼器',
    6: '乐器'
  }
  
  return categoryMap[artifact.value.cateId] || '未知'
})

// 获取藏品详情数据
const fetchCollectionDetail = async () => {
  const id = route.params.id
  if (!id) {
    ElMessage.error('藏品ID无效')
    return
  }
  
  loading.value = true
  
  try {
    // 根据API文档，获取藏品详情
    console.log('请求藏品详情，ID:', id)
    const response = await getCollectionDetail(id)
    console.log('藏品详情响应:', response)
    
    if (response && response.code === 200) {
      // 获取数据主体
      const list = response.data?.list || []
      
      if (!list || list.length === 0) {
        ElMessage.warning('未找到藏品信息')
        loading.value = false
        return
      }
      
      const responseData = list[0]
      
      // 标准化数据结构
      artifact.value = {
        id: responseData.id || id,
        title: responseData.title || '未命名藏品',
        origin: responseData.origin || '年代不详',
        desColl: responseData.desColl || '暂无描述',
        material: responseData.base || responseData.material || '未知',
        cateId: responseData.cateId || 0,
        place: responseData.displayRoom || responseData.place || '',
        colPic: responseData.colPic || ''
      }
      
      console.log('处理后的藏品数据:', artifact.value)
    } else {
      console.error('获取藏品详情失败:', response)
      ElMessage.error(response?.msg || '获取藏品详情失败')
    }
  } catch (error) {
    console.error('获取藏品详情失败:', error)
    ElMessage.error('获取藏品详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 返回列表页
const goBack = () => {
  // 使用replace避免浏览器历史记录堆积
  if (window.history.length > 1) {
    router.back()
  } else {
    router.replace('/collection')
  }
}

// 处理图片加载错误
const handleImageError = (event) => {
  event.target.src = 'https://placehold.co/600x400?text=图片加载失败'
  console.log('图片加载失败，使用占位图')
}

// 格式化描述文本，处理HTML标签
const formatDescription = (description) => {
  if (!description) return ''
  
  // 如果已经是HTML格式，直接返回
  if (description.includes('<p>')) {
    return description
  }
  
  // 否则添加简单格式
  return `<p>${description}</p>`
}

onMounted(() => {
  fetchCollectionDetail()
})
</script>

<style lang="scss" scoped>
.collection-detail-container {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding: 20px 0 40px;
}

.collection-detail-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.collection-detail {
  display: flex;
  flex-direction: column;
  gap: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 30px;
  
  @media (min-width: 1024px) {
    flex-direction: row;
  }
}

.collection-image-section {
  flex: 1;
}

.main-image-container {
  width: 100%;
  aspect-ratio: 1/1;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 10px;
  background-color: #f0f0f0;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.thumbnails-container {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  margin-top: 15px;
}

.thumbnail-item {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  
  &.active {
    border-color: #1A4FA3;
  }
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.collection-info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.collection-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
  line-height: 1.3;
}

.collection-meta {
  margin-bottom: 30px;
}

.meta-item {
  margin-bottom: 10px;
  font-size: 16px;
  display: flex;
}

.meta-label {
  font-weight: 600;
  color: #666;
  width: 80px;
}

.meta-value {
  flex: 1;
  color: #333;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  position: relative;
  padding-left: 15px;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 20px;
    background-color: #1A4FA3;
    border-radius: 2px;
  }
}

.collection-description, .collection-history {
  margin-bottom: 30px;
}

.description-content, .history-content {
  font-size: 16px;
  line-height: 1.7;
  color: #555;
  white-space: pre-line;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: auto;
}

.action-button, .favorite-button, .back-button {
  padding: 12px 25px;
  border-radius: 30px;
  font-size: 16px;
}

.action-button {
  background-color: #1A4FA3;
  border-color: #1A4FA3;
  
  &:hover {
    background-color: #2a5ca0;
    border-color: #2a5ca0;
  }
}

.favorite-button {
  display: flex;
  align-items: center;
  gap: 5px;
  
  .is-favorite {
    color: #D4AF37;
  }
}

.related-collections {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.related-collections-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.related-collection-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
  }
}

.related-image-container {
  height: 180px;
  overflow: hidden;
}

.related-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
  
  &:hover {
    transform: scale(1.05);
  }
}

.related-info {
  padding: 12px;
}

.related-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.related-era {
  font-size: 14px;
  color: #888;
}
</style> 
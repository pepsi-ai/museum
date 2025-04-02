<template>
  <div class="collection-container">
    <!-- 筛选区域 -->
    <div class="filter-area">
      <div class="filter-container">
        <div class="filter-row">
          <el-select v-model="filterEra" placeholder="年代" class="filter-select">
            <el-option v-for="era in eras" 
                     :key="era.value" 
                     :label="era.label" 
                     :value="era.value"/>
          </el-select>
          
          <el-select v-model="filterMaterial" placeholder="材质" class="filter-select">
            <el-option v-for="material in materials" 
                     :key="material.value" 
                     :label="material.label" 
                     :value="material.value"/>
          </el-select>
          
          <el-select v-model="filterCategory" placeholder="类别" class="filter-select">
            <el-option v-for="category in categories" 
                     :key="category.value" 
                     :label="category.label" 
                     :value="category.value"/>
          </el-select>
          
          <div class="filter-buttons">
            <el-button type="primary" @click="handleFilter" :disabled="loading">筛选</el-button>
            <el-button @click="resetFilter" :disabled="loading">重置</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 藏品列表区域 -->
    <div class="collection-list-area">
      <div v-loading="loading">
        <div v-if="!loading && filteredArtifacts.length > 0" class="collection-grid">
          <div v-for="artifact in filteredArtifacts" 
               :key="artifact.id" 
               class="collection-card"
               @click="goToCollectionDetail(artifact.id)">
            <div class="collection-image-container">
              <img :src="getImageUrl(artifact.colPic)" 
                   :alt="artifact.title" 
                   class="collection-image"
                   @error="handleImageError($event)"/>
            </div>
            <div class="collection-content">
              <h3 class="collection-title">{{ artifact.title }}</h3>
              <p class="collection-era">{{ artifact.origin || '年代不详' }}</p>
              <div class="collection-description" v-html="formatDescription(artifact.desColl)"></div>
              <div class="action-button-container">
                <el-button 
                  type="primary" 
                  class="action-button"
                  @click.stop="goToCollectionDetail(artifact.id)">
                  查看详情
                </el-button>
                <el-button 
                  type="text" 
                  class="favorite-button"
                  @click.stop="toggleFavorite(artifact)">
                  <el-icon :class="{ 'is-favorite': artifact.isFavorite }">
                    <Star />
                  </el-icon>
                  收藏
                </el-button>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-else-if="!loading" description="暂无藏品数据"></el-empty>
      </div>
      
      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        class="pagination"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 36, 48]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Star } from '@element-plus/icons-vue'
import { getCollectionList, getImageUrl, collectArtifact, uncollectArtifact } from '@/api/collection'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const artifacts = ref([])
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const filterEra = ref('')
const filterMaterial = ref('')
const filterCategory = ref('')

// 筛选选项
const eras = [
  { label: '全部年代', value: '' },
  { label: '商周', value: '商周' },
  { label: '秦汉', value: '秦汉' },
  { label: '魏晋南北朝', value: '魏晋南北朝' },
  { label: '隋唐', value: '隋唐' },
  { label: '宋元', value: '宋元' },
  { label: '明清', value: '明清' }
]

const materials = [
  { label: '全部材质', value: '' },
  { label: '青铜', value: '青铜' },
  { label: '陶瓷', value: '陶瓷' },
  { label: '玉器', value: '玉器' },
  { label: '书画', value: '书画' },
  { label: '金银器', value: '金银器' },
  { label: '漆木器', value: '漆木器' }
]

const categories = [
  { label: '全部类别', value: '' },
  { label: '器皿', value: '器皿' },
  { label: '兵器', value: '兵器' },
  { label: '工具', value: '工具' },
  { label: '装饰品', value: '装饰品' },
  { label: '礼器', value: '礼器' },
  { label: '乐器', value: '乐器' }
]

// 计算筛选后的藏品列表
const filteredArtifacts = computed(() => {
  return artifacts.value
})

// 获取藏品数据
const fetchArtifacts = async () => {
  loading.value = true
  
  try {
    // 根据API文档, POST请求, 分页查询藏品列表 /collect/getdata
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      params: {
        // 根据筛选条件添加参数
        origin: filterEra.value,
        material: filterMaterial.value,
        category: filterCategory.value
      }
    }
    
    console.log('请求参数:', params)
    const response = await getCollectionList(params)
    console.log('藏品列表响应:', response)
    
    if (response && response.code === 200) {
      // 按API实际返回格式处理数据
      const responseData = response.data || response
      
      // 判断数据类型并适当处理
      if (responseData.records) {
        // 标准分页格式
        artifacts.value = responseData.records
        total.value = responseData.total || 0
      } else if (responseData.list) {
        // 另一种可能的分页格式
        artifacts.value = responseData.list
        total.value = responseData.total || 0
      } else if (Array.isArray(responseData)) {
        // 直接返回数组
        artifacts.value = responseData
        total.value = responseData.length
      } else if (typeof responseData === 'object') {
        // 可能是单个对象
        artifacts.value = [responseData]
        total.value = 1
      } else {
        // 未知格式，设为空数组
        artifacts.value = []
        total.value = 0
        console.error('未识别的响应数据格式:', responseData)
      }
      
      // 处理收藏状态
      if (artifacts.value && Array.isArray(artifacts.value)) {
        artifacts.value.forEach(item => {
          // 确保每个对象都有必要的属性
          item.isFavorite = item.isFavorite || false
          item.title = item.title || item.colName || '未命名藏品'
          item.origin = item.origin || item.colOrigin || '年代不详'
          item.desColl = item.desColl || item.description || item.colDesc || '暂无描述'
          
          // 确保ID值存在
          if (!item.id && item.colId) {
            item.id = item.colId
          }
        })
      } else {
        artifacts.value = []
        console.error('返回的藏品数据格式不正确')
      }
      
      // 如果没有数据，添加测试数据
      if (artifacts.value.length === 0) {
        addTestData()
      }
    } else {
      console.error('获取藏品数据失败:', response)
      ElMessage.error('获取藏品数据失败')
      addTestData()
    }
  } catch (error) {
    console.error('获取藏品列表失败:', error)
    ElMessage.error('获取藏品数据失败，请稍后重试')
    addTestData()
  } finally {
    loading.value = false
  }
}

// 添加测试数据
const addTestData = () => {
  artifacts.value = [
    {
      id: 1,
      title: '商代青铜四足鼎',
      origin: '商代晚期',
      desColl: '此鼎为商代晚期青铜礼器，器型庄重，纹饰精美，反映了当时高超的青铜铸造工艺。',
      colPic: 'https://placehold.co/600x400?text=商代青铜鼎',
      material: '青铜',
      cateId: 5, // 假设5对应礼器类别
      isFavorite: false
    },
    {
      id: 2,
      title: '汉代玉璧',
      origin: '西汉',
      desColl: '汉代玉璧以其精湛的工艺和深邃的文化内涵著称，是研究汉代玉器艺术的重要实物资料。',
      colPic: 'https://placehold.co/600x400?text=汉代玉璧',
      material: '玉器',
      cateId: 5, // 假设5对应礼器类别
      isFavorite: false
    },
    {
      id: 3,
      title: '唐三彩骆驼',
      origin: '盛唐',
      desColl: '唐三彩骆驼造型生动，釉彩艳丽，展现了盛唐时期陶瓷艺术的最高水平。',
      colPic: 'https://placehold.co/600x400?text=唐三彩骆驼',
      material: '陶瓷',
      cateId: 4, // 假设4对应装饰品类别
      isFavorite: false
    },
    {
      id: 4,
      title: '宋代官窑瓷碗',
      origin: '北宋',
      desColl: '北宋官窑瓷器以其独特的开片纹和典雅的器形闻名，是中国古代瓷器艺术的巅峰之作。',
      colPic: 'https://placehold.co/600x400?text=宋代官窑瓷碗',
      material: '陶瓷',
      cateId: 1, // 假设1对应器皿类别
      isFavorite: false
    },
    {
      id: 5,
      title: '明代青花瓷瓶',
      origin: '明永乐',
      desColl: '永乐青花瓷器以其精细的绘画和纯净的青花发色著称，代表了明代瓷器的最高水平。',
      colPic: 'https://placehold.co/600x400?text=明代青花瓷瓶',
      material: '陶瓷',
      cateId: 1, // 假设1对应器皿类别
      isFavorite: false
    },
    {
      id: 6,
      title: '清代玉如意',
      origin: '清乾隆',
      desColl: '乾隆时期的玉如意工艺精湛，玉质温润，是清代玉器艺术的代表作品。',
      colPic: 'https://placehold.co/600x400?text=清代玉如意',
      material: '玉器',
      cateId: 4, // 假设4对应装饰品类别
      isFavorite: false
    },
    {
      id: 7,
      title: '战国青铜编钟',
      origin: '战国',
      desColl: '战国编钟音律和谐，铸造工艺精良，是中国古代音乐文化的重要见证。',
      colPic: 'https://placehold.co/600x400?text=战国青铜编钟',
      material: '青铜',
      cateId: 6, // 假设6对应乐器类别
      isFavorite: false
    },
    {
      id: 8,
      title: '汉代漆木器',
      origin: '西汉',
      desColl: '汉代漆木器保存完好，漆层莹润，展现了汉代漆器工艺的精湛技术。',
      colPic: 'https://placehold.co/600x400?text=汉代漆木器',
      material: '漆木器',
      cateId: 1, // 假设1对应器皿类别
      isFavorite: false
    }
  ]
  total.value = artifacts.value.length
}

// 筛选处理
const handleFilter = () => {
  currentPage.value = 1
  fetchArtifacts()
}

// 重置筛选条件
const resetFilter = () => {
  filterEra.value = ''
  filterMaterial.value = ''
  filterCategory.value = ''
  currentPage.value = 1
  fetchArtifacts()
}

// 切换收藏状态
const toggleFavorite = async (artifact) => {
  if (!userStore.token) {
    ElMessage.warning('请先登录后再收藏')
    router.push('/login')
    return
  }
  
  try {
    if (artifact.isFavorite) {
      await uncollectArtifact(artifact.id)
      ElMessage.success('已取消收藏')
    } else {
      await collectArtifact(artifact.id)
      ElMessage.success('收藏成功')
    }
    artifact.isFavorite = !artifact.isFavorite
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size
  fetchArtifacts()
}

// 页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchArtifacts()
}

// 查看藏品详情
const goToCollectionDetail = (id) => {
  router.push(`/collection/detail/${id}`)
}

// 处理图片加载错误
const handleImageError = (event) => {
  event.target.src = 'https://placehold.co/600x400?text=图片加载失败'
}

// 格式化描述文本，移除HTML标签
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
  fetchArtifacts()
})
</script>

<style lang="scss" scoped>
.collection-container {
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
  flex-wrap: wrap;
  gap: 15px;
}

.filter-select {
  width: 180px;
}

.filter-buttons {
  display: flex;
  gap: 10px;
}

.collection-list-area {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.collection-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;
}

@media (min-width: 640px) {
  .collection-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .collection-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.collection-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  }
}

.collection-image-container {
  height: 200px;
  position: relative;
  overflow: hidden;
  background-color: #f0f0f0;
}

.collection-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
  
  &:hover {
    transform: scale(1.05);
  }
}

.collection-content {
  padding: 16px;
}

.collection-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.collection-era {
  font-size: 14px;
  color: #888;
  margin-bottom: 8px;
}

.collection-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 42px;
}

.action-button-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.action-button {
  border-radius: 20px;
  font-size: 14px;
  padding: 6px 15px;
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
  color: #666;
  
  &:hover {
    color: #D4AF37;
  }
  
  .is-favorite {
    color: #D4AF37;
  }
}

.pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}
</style> 
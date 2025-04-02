<template>
  <div class="reservation-detail">
    <el-card shadow="hover" class="detail-card" v-loading="loading">
      <div slot="header" class="clearfix">
        <span class="label">预约详情</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="goBack"
        >返回</el-button>
      </div>
      
      <!-- 预约基本信息 -->
      <div class="title-info">
        <div class="info-item">
          <span class="label">展览名称:</span>
          <span class="value">{{ reservation.title }}</span>
        </div>
        <div class="info-item">
          <span class="label">预约类型:</span>
          <span class="value">{{ reservation.resTyp }}</span>
        </div>
        <div class="info-item" v-if="reservation.cateName && reservation.cateName !== 'null'">
          <span class="label">藏品名称:</span>
          <span class="value">{{ reservation.cateName }}</span>
        </div>
        
      </div>
      
      <div v-if="reservation.exhibition" class="section-title">展览信息</div>
      <div v-if="reservation.exhibition" class="exhibition-info">
        <div class="info-item">
          <span class="label">展览名称:</span>
          <span class="value">{{ reservation.exhibition.title }}</span>
        </div>
        <div class="info-item" v-if="reservation.exhibition.type">
          <span class="label">展览类型:</span>
          <span class="value">{{ reservation.exhibition.type }}</span>
        </div>
        <div class="info-item" v-if="reservation.exhibition.location">
          <span class="label">展览地点:</span>
          <span class="value">{{ reservation.exhibition.location }}</span>
        </div>
        <div class="info-item" v-if="reservation.exhibition.startTime && reservation.exhibition.endTime">
          <span class="label">展览时间:</span>
          <span class="value">{{ reservation.exhibition.startTime }} 至 {{ reservation.exhibition.endTime }}</span>
        </div>
        <div class="info-item">
          <span class="label">展览状态:</span>
          <span class="value">
            <el-tag :type="getExhibitionStatusType(reservation.exhibition.status)">
              {{ getExhibitionStatusText(reservation.exhibition.status) }}
            </el-tag>
          </span>
        </div>
        <div class="info-item" v-if="reservation.exhibition.description">
          <span class="label">展览描述:</span>
          <div class="value-html" v-html="reservation.exhibition.description"></div>
        </div>
      </div>
      
      <div v-if="reservation.collection" class="section-title">藏品详情</div>
      <div v-if="reservation.collection" class="collection-info">
        <div class="info-item">
          <span class="label">藏品名称:</span>
          <span class="value">{{ reservation.collection.title }}</span>
        </div>
        <div class="info-item" v-if="reservation.collection.category">
          <span class="label">藏品分类:</span>
          <span class="value">{{ reservation.collection.category }}</span>
        </div>
        <div class="info-item" v-if="reservation.collection.age">
          <span class="label">藏品年代:</span>
          <span class="value">{{ reservation.collection.age }}</span>
        </div>
        <div class="info-item" v-if="reservation.collection.material">
          <span class="label">藏品材质:</span>
          <span class="value">{{ reservation.collection.material }}</span>
        </div>
        <div class="info-item" v-if="reservation.collection.desColl">
          <span class="label">藏品描述:</span>
          <div class="value-html" v-html="reservation.collection.desColl"></div>
        </div>
      </div>
      
      <div v-if="exhibitionCollections && exhibitionCollections.length > 0" class="section-title">展览包含的藏品</div>
      <div v-else-if="collectionLoading" class="section-title">正在加载展览藏品...</div>
      <div v-else-if="reservation.exhibition" class="section-title">展览包含的藏品 <span class="no-data">(暂无关联藏品)</span></div>
      
      <el-table
        v-if="exhibitionCollections && exhibitionCollections.length > 0"
        :data="exhibitionCollections"
        style="width: 100%"
        border
        v-loading="collectionLoading"
      >
        <el-table-column label="藏品图片" width="120">
          <template slot-scope="scope">
            <div class="collection-image" v-if="scope.row.colPic">
              <el-image 
                :src="getImageUrl(scope.row.colPic)" 
                :preview-src-list="[getImageUrl(scope.row.colPic)]"
                fit="cover"
                style="width: 80px; height: 80px; border-radius: 4px;"
              >
                <div slot="error" class="image-error">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
            </div>
            <div v-else class="image-placeholder">
              <i class="el-icon-picture-outline"></i>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="藏品名称" min-width="120"></el-table-column>
        <el-table-column prop="origin" label="来源" min-width="120"></el-table-column>
        <el-table-column label="介绍" min-width="180">
          <template slot-scope="scope">
            <div v-if="scope.row.desColl" class="collection-description">
              {{ formatDescription(scope.row.desColl) }}
              <el-link type="primary" @click="viewFullDescription(scope.row)" class="more-link">
                详情
              </el-link>
            </div>
            <span v-else class="no-data">暂无介绍</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="viewCollectionDetail(scope.row.id)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="section-title">预约时间段</div>
      <el-table
        :data="timeSlots"
        style="width: 100%"
        border
        v-if="timeSlots && timeSlots.length > 0"
      >
        <el-table-column prop="resDate" label="预约日期" min-width="120"></el-table-column>
        <el-table-column prop="resTime" label="预约时间段" min-width="120"></el-table-column>
        <el-table-column prop="resSession" label="预约场次" min-width="100"></el-table-column>
        <el-table-column prop="availableSlots" label="可预约人数" min-width="100"></el-table-column>
        <el-table-column prop="bookedSlots" label="已预约人数" min-width="100"></el-table-column>
        <el-table-column label="状态" min-width="100">
          <template v-slot:default="scope">
            <el-tag :type="getTimeStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-empty description="暂无时间段信息" v-else></el-empty>
      
      <div class="section-title">预约描述</div>
      <div v-html="reservation.resDes" class="description-content"></div>
    </el-card>
  </div>
</template>

<script>
import { getReserveInfo } from '@/api/reservation'

export default {
  name: 'ViewReservationDetail',
  data() {
    return {
      reservation: {},
      timeSlots: [],
      loading: false,
      exhibitionCollections: [],
      dialogVisible: false,
      currentCollection: null,
      collectionLoading: false,
      baseUrl: process.env.VUE_APP_BASE_API
    }
  },
  created() {
    const id = this.$route.params.id
    if (id) {
      this.fetchReservationDetail(id)
    }
  },
  methods: {
    async fetchReservationDetail(id) {
      this.loading = true
      try {
        const res = await getReserveInfo(id)
        if (res.code === 200 && res.data) {
          this.reservation = res.data
          
          if (this.reservation.reserveTimes && this.reservation.reserveTimes.length > 0) {
            this.timeSlots = this.reservation.reserveTimes
          }
          
          if (this.reservation.exhibitionData && this.reservation.exhibitionData.collections) {
            this.collectionLoading = true
            setTimeout(() => {
              this.exhibitionCollections = this.reservation.exhibitionData.collections
              
              console.log("获取到 " + this.exhibitionCollections.length + " 个藏品信息");
              if(this.exhibitionCollections.length > 0) {
                console.log("第一个藏品: ", this.exhibitionCollections[0]);
              }
              
              this.collectionLoading = false
            }, 500);
          } else {
            console.log("未找到展览关联的藏品信息");
          }
        } else {
          this.$message.error('获取预约详情失败')
        }
      } catch (error) {
        console.error('获取预约详情出错', error)
        this.$message.error('获取预约详情出错')
      } finally {
        this.loading = false
      }
    },
    
    viewCollectionDetail(id) {
      this.$router.push(`/collectionDetail/${id}`)
    },
    
    getStatusText(status) {
      const statusMap = {
        0: '已取消',
        1: '即将开始',
        2: '进行中',
        3: '已结束'
      }
      return statusMap[status] || '未知状态'
    },
    getStatusType(status) {
      const statusTypeMap = {
        0: 'info',
        1: 'warning',
        2: 'success',
        3: 'info'
      }
      return statusTypeMap[status] || 'info'
    },
    getTimeStatusType(status) {
      const statusTypeMap = {
        '即将开始': 'warning',
        '进行中': 'success',
        '已结束': 'info',
        '已取消': 'danger'
      }
      return statusTypeMap[status] || 'info'
    },
    getExhibitionStatusText(status) {
      const statusMap = {
        'upcoming': '即将开始',
        'ongoing': '进行中',
        'ended': '已结束',
        'unknown': '未知状态'
      }
      return statusMap[status] || '未知状态(' + status + ')';
    },
    getExhibitionStatusType(status) {
      const statusTypeMap = {
        'upcoming': 'warning',
        'ongoing': 'success',
        'ended': 'info',
        'unknown': 'info'
      }
      return statusTypeMap[status] || 'info';
    },
    goBack() {
      this.$router.push('/ReservationList')
    },
    formatDescription(text) {
      if (!text) return '';
      const plainText = text.replace(/<[^>]+>/g, '');
      return plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText;
    },
    viewFullDescription(collection) {
      this.currentCollection = collection;
      this.$alert(
        `<div class="collection-full-description">${collection.desColl}</div>`, 
        collection.title, 
        {
          dangerouslyUseHTMLString: true,
          customClass: 'collection-description-dialog'
        }
      );
    },
    getImageUrl(path) {
      if (!path) return '';
      
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
      }
      
      return this.$picBaseUrl + path;
    }
  }
}
</script>

<style scoped>
.reservation-detail {
  padding: 20px;
}
.detail-card {
  margin-bottom: 20px;
}
.title-info, .exhibition-info, .collection-info {
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 15px;
}
.info-item {
  line-height: 30px;
  margin-bottom: 12px;
}
.label {
  font-weight: bold;
  margin-right: 10px;
  color: #606266;
  display: inline-block;
  min-width: 80px;
}
.value {
  color: #303133;
}
.value-html {
  padding: 10px;
  margin-top: 8px;
  background-color: #f8f8f8;
  border-radius: 4px;
  line-height: 1.6;
}
.section-title {
  font-size: 16px;
  font-weight: bold;
  margin: 20px 0 10px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}
.description-content {
  padding: 10px;
  min-height: 100px;
  background-color: #f8f8f8;
  border-radius: 4px;
}
.no-data {
  color: #909399;
  font-size: 14px;
}
.collection-image {
  display: flex;
  justify-content: center;
  align-items: center;
}
.image-placeholder, .image-error {
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 24px;
  border-radius: 4px;
}
.collection-description {
  line-height: 1.5;
  position: relative;
}
.more-link {
  margin-left: 5px;
  font-size: 12px;
}
</style>

<style>
.collection-description-dialog {
  max-width: 700px;
  max-height: 80vh;
}
.collection-full-description {
  max-height: 60vh;
  overflow-y: auto;
  line-height: 1.6;
}
</style> 
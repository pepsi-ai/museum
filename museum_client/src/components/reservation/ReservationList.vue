<template>
<div>
  <!--面包屑导航-->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>预约管理</el-breadcrumb-item>
    <el-breadcrumb-item>已发布预约列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!--藏品列表区域-->
  <el-card>
    <el-row :gutter="20">
      <el-col :span="8">
        <el-input placeholder="请输入名称" v-model="queryInfo.name">
          <el-button slot="append" icon="el-icon-search" @click="getReserveList"></el-button>
        </el-input>
      </el-col>
    </el-row>
    <!--用户表格区域-->
    <el-table
        border
        :data="reserveList"
        stripe>
      <el-table-column type="index"></el-table-column>
      <el-table-column prop="title" label="展览名称" :formatter="stateFormat"></el-table-column>
      <el-table-column prop="resTyp" label="预约类型"></el-table-column>
      <el-table-column label="藏品" min-width="120">
        <template slot-scope="scope">
          <div class="collection-gallery">
            <!-- 直接显示所有藏品图片，不使用弹出框 -->
            <div v-if="scope.row.exhibitionCollections && scope.row.exhibitionCollections.length > 0" class="collections-direct-view">
              <div v-for="(item, idx) in scope.row.exhibitionCollections.slice(0, 2)" :key="idx" class="collection-image-item">
                <el-image 
                  :src="item.colPic" 
                  fit="cover"
                  style="width: 60px; height: 60px; border-radius: 4px; margin: 2px;"
                  @click="viewCollectionDetail(item.id)"
                >
                  <div slot="error" class="image-error">
                    <i class="el-icon-picture-outline"></i>
                  </div>
                </el-image>
              </div>
              <div v-if="scope.row.exhibitionCollections.length > 2" class="more-collections-badge">
                <el-tag size="mini" type="info">+{{ scope.row.exhibitionCollections.length - 2 }}</el-tag>
              </div>
            </div>
            
            <!-- 如果没有集合但有单个藏品 -->
            <div v-else-if="scope.row.collection && scope.row.collection.colPic" class="single-collection-image">
              <el-image 
                :src="getImageUrl(scope.row.collection.colPic)" 
                fit="cover"
                style="width: 60px; height: 60px; border-radius: 4px;"
                @click="viewCollectionDetail(scope.row.cateId)"
              >
                <div slot="error" class="image-error">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="resSum" label="可预约人数"></el-table-column>
      <el-table-column prop="resdSum" label="已预约人数" :formatter="stateFormat"></el-table-column>
      <el-table-column prop="resDate" label="预约日期">
        <template slot-scope="scope">
          <span v-if="!scope.row.hasMultipleTimes">{{ scope.row.resDate }}</span>
          <div v-else-if="scope.row.reserveTimes && scope.row.reserveTimes.length > 0">
            <div v-for="(time, index) in scope.row.reserveTimes" :key="index">
              {{ time.resDate }}
            </div>
          </div>
          <span v-else>{{ scope.row.resDate }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="resTime"
        label="预约时间段"
        min-width="150">
        <template slot-scope="scope">
          <span v-if="!scope.row.hasMultipleTimes">{{ scope.row.resTime }}</span>
          <div v-else-if="scope.row.reserveTimes && scope.row.reserveTimes.length > 0">
            <div v-for="(time, index) in scope.row.reserveTimes" :key="index">
              {{ time.resTime }}
            </div>
          </div>
          <span v-else>{{ scope.row.resTime }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="resSession"
        label="预约场次"
        min-width="100">
        <template slot-scope="scope">
          <span v-if="!scope.row.hasMultipleTimes">{{ scope.row.resSession }}</span>
          <div v-else-if="scope.row.reserveTimes && scope.row.reserveTimes.length > 0">
            <div v-for="(time, index) in scope.row.reserveTimes" :key="index">
              {{ time.resSession }}
            </div>
          </div>
          <span v-else>{{ scope.row.resSession }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="resDes" label="说明" :formatter="stateFormat"></el-table-column>
      <el-table-column label="操作" width="180">
        <template v-slot:default="scope">
          <el-tooltip effect="dark" content="查看预约" placement="top" :enterable="false">
            <el-button type="success" icon="el-icon-view" size="mini"
                      @click="viewReservationDetails(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editReservation(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteReservation(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!--分页区域-->
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
    </el-pagination>
  </el-card>
  <!--编辑藏品信息对话框-->
  <el-dialog
      @close="editDialogClose"
      title="编辑藏品信息"
      :visible.sync="editDialogVisible"
      width="50%">
    <el-form
        label-width="120px"
        :model="updateMsReserve"
        ref="ruleForm">
      <el-form-item label="预约标题" prop="title">
        <el-input v-model="updateMsReserve.title"></el-input>
      </el-form-item>
      <el-form-item label="预约类型" prop="origin">
        <el-select v-model="updateMsReserve.resTyp" placeholder="请选择">
          <el-option label="展览预约" value="展览预约"/>
          <el-option label="解说预约" value="解说预约"/>
        </el-select>
      </el-form-item>
      <el-form-item label="可预约人数" prop="base">
        <el-input v-model="updateMsReserve.resSum" type="number"></el-input>
      </el-form-item>
      <el-form-item label="预约日期" prop="base">
        <el-date-picker v-model="updateMsReserve.resDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="预约时间段" prop="origin">
        <el-select v-model="updateMsReserve.resTime" placeholder="请选择">
          <el-option label="8:30~11:00" value="8:30~11:00"/>
          <el-option label="14:30~17:00" value="14:30~17:00"/>
        </el-select>
      </el-form-item>
      <el-form-item label="预约场次" prop="origin">
        <el-select v-model="updateMsReserve.resSession" placeholder="请选择">
          <el-option label="第一场" value="第一场"/>
          <el-option label="第二场" value="第二场"/>
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="updateMsReserve.status" placeholder="请选择">
          <el-option label="即将开始" :value="1"/>
          <el-option label="进行中" :value="2"/>
          <el-option label="已结束" :value="3"/>
          <el-option label="已取消" :value="0"/>
        </el-select>
      </el-form-item>
      <el-form-item label="说明" prop="describe">
        <div>
          <quill-editor v-model="updateMsReserve.resDes" :options="editorOption"></quill-editor>
        </div>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editMsReserve">确 定</el-button>
      </span>
  </el-dialog>
  <!-- 添加查看预约详情对话框 -->
  <el-dialog
      title="预约详情"
      :visible.sync="viewDialogVisible"
      width="50%">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="展览名称">{{ viewReserve.title }}</el-descriptions-item>
      <el-descriptions-item label="预约类型">{{ viewReserve.resTyp }}</el-descriptions-item>
      <el-descriptions-item label="藏品名称">{{ viewReserve.cateName }}</el-descriptions-item>
      <el-descriptions-item label="可预约人数">{{ viewReserve.resSum }}</el-descriptions-item>
      <el-descriptions-item label="已预约人数">{{ viewReserve.resdSum }}</el-descriptions-item>
      <el-descriptions-item label="预约日期">{{ viewReserve.resDate }}</el-descriptions-item>
      <el-descriptions-item label="预约时间段">{{ viewReserve.resTime }}</el-descriptions-item>
      <el-descriptions-item label="预约场次">{{ viewReserve.resSession }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="getStatusType(viewReserve.status)" effect="light">
          {{ getStatusText(viewReserve.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="说明">
        <div v-html="viewReserve.resDes"></div>
      </el-descriptions-item>
    </el-descriptions>
    <span slot="footer" class="dialog-footer">
      <el-button @click="viewDialogVisible = false">关闭</el-button>
    </span>
  </el-dialog>
</div>
</template>

<script>
import Vue from 'vue';
import VueQuillEditor from 'vue-quill-editor';
// 导入所需样式
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
import { listMsReserve, getReserveList } from '../../api/reservation'
Vue.use(VueQuillEditor)
export default {
  name: "ReservationList",
  data() {
    return {
      // 获取藏品信息参数
      queryInfo: {
        name: '',
        pagenum: 1,
        pagesize: 5
      },
      editorOption: {
        placeholder: '请输入公告内容'
      },
      // 藏品列表
      reserveList: [],
      // 藏品总数
      total: 0,
      // 图片显示基准地址
      baseUrl: this.$picBaseUrl,
      editDialogVisible: false,
      updateMsReserve: {},
      // 查看预约详情相关
      viewDialogVisible: false,
      viewReserve: {},
      // 状态映射表
      statusMap: {
        0: { text: '已取消', type: 'danger' },
        1: { text: '即将开始', type: 'primary' },
        2: { text: '进行中', type: 'success' },
        3: { text: '已结束', type: 'info' }
      }
    }
  },
  created() {
    this.getReserveList()
  },
  methods: {
    async getReserveList() {
      try {
        // 打印请求参数
        console.log('获取预约列表的请求参数:', JSON.stringify(this.queryInfo));
        
        const res = await this.$http.post('/reserve/getList', this.queryInfo);
        
        // 输出API调用结果
        console.log('API返回结果状态:', res.data.code, '信息:', res.data.message);
        
        if (res.data.code !== 200) {
          this.$message.error(res.data.msg || '获取预约列表失败');
          this.reserveList = [];
          this.total = 0;
          return;
        }
        
        // 正确处理返回数据
        if (res.data.data && res.data.data.list) {
          this.reserveList = res.data.data.list;
          this.total = res.data.data.total;
          
          // 详细调试信息
          console.log('API返回的完整预约列表数据:', JSON.stringify(res.data.data));
          
          // 检查第一条记录的数据结构
          if (this.reserveList.length > 0) {
            const firstItem = this.reserveList[0];
            console.log('第一条预约记录详情:', firstItem);
            
            // 检查藏品信息
            if (firstItem.collection) {
              console.log('藏品信息存在:', firstItem.collection);
              console.log('藏品图片路径:', firstItem.collection.colPic);
              if (firstItem.collection.colPic) {
                const imageUrl = this.getImageUrl(firstItem.collection.colPic);
                console.log('处理后的图片URL:', imageUrl);
              }
            } else {
              console.warn('预约记录没有关联藏品信息，检查cateId是否存在:', firstItem.cateId);
              if (firstItem.cateId) {
                console.log('藏品ID存在但未获取到藏品信息，可能是后端未正确关联');
              }
            }
          }
          
          // 调用调试方法检查所有预约记录的藏品信息
          this.logCollectionInfo();
          
          // 为每个有cateId但没有collection的预约记录获取藏品信息
          this.fetchCollectionForReservations();
        } else {
          console.warn('返回数据格式不正确:', res.data);
          this.reserveList = [];
          this.total = 0;
        }
      } catch (error) {
        console.error('获取预约列表出错:', error);
        this.$message.error('获取预约列表失败，请检查网络连接或联系管理员');
        this.reserveList = [];
        this.total = 0;
      }
    },
    // 格式化表格消息内容
    stateFormat(row, column, cellValue) {
      // console.log(row , column , cellValue)
      if (!cellValue) return "";
      
      // 如果是HTML内容，移除HTML标签
      if (typeof cellValue === 'string' && cellValue.includes('<')) {
        return cellValue.replace(/<[^>]+>/g, '').slice(0, 20) + (cellValue.length > 20 ? "..." : "");
      }
      
      if (typeof cellValue === 'string' && cellValue.length > 20) {
        return cellValue.slice(0, 20) + "...";
      }
      return cellValue;
    },
    // 根据状态值获取状态文本
    getStatusText(status) {
      // 如果status是字符串类型，转换为数字
      if (typeof status === 'string') {
        status = parseInt(status);
      }
      return this.statusMap[status] ? this.statusMap[status].text : '未知状态(' + status + ')';
    },
    
    // 根据状态值获取标签类型
    getStatusType(status) {
      // 如果status是字符串类型，转换为数字
      if (typeof status === 'string') {
        status = parseInt(status);
      }
      return this.statusMap[status] ? this.statusMap[status].type : 'info';
    },
    // 监听分页 pageSize 变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getReserveList()
    },
    // 监听分页 pageNum 变化
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getReserveList()
    },
    // 监听添加用户对话框关闭
    editDialogClose() {
      // 重置表单数据
      if (this.$refs.editInfoRef) {
        this.$refs.editInfoRef.resetFields()
      }
    },
    // 检查并输出藏品信息的调试方法
    logCollectionInfo() {
      console.log('当前预约列表:', this.reserveList);
      
      if (!this.reserveList || this.reserveList.length === 0) {
        console.warn('预约列表为空');
        return;
      }
      
      let hasAnyCollection = false;
      
      this.reserveList.forEach((reserve, index) => {
        if (reserve.collection) {
          hasAnyCollection = true;
          console.log(`预约 ${index+1} (ID=${reserve.id}) 有藏品信息:`, {
            id: reserve.collection.id,
            title: reserve.collection.title,
            colPic: reserve.collection.colPic,
            origin: reserve.collection.origin
          });
        } else {
          console.log(`预约 ${index+1} (ID=${reserve.id}) 没有藏品信息`);
        }
      });
      
      if (!hasAnyCollection) {
        console.warn('所有预约记录都没有藏品信息！');
      }
    },
    // 删除藏品
    deleteReservation(row) {
      this.$confirm('确认要删除这个预约吗? 如果有多个时间段，将删除全部关联预约。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 使用新的删除API
        this.$http.get(`/reserve/delMsReserve/${row.id}`).then(res => {
          if (res.data.code === 200) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getReserveList();
          } else {
            this.$message.error(res.data.msg || '删除失败');
          }
        }).catch((error) => {
          console.error('删除预约出错', error);
          this.$message.error('删除预约时出现错误');
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    // 显示编辑藏品信息对话框
    showEditDialog(row) {
      this.updateMsReserve = JSON.parse(JSON.stringify(row))
      this.editDialogVisible = true
    },
    // 更新藏品信息
    async editMsReserve() {
      if(this.updateMsReserve.resSum < this.updateMsReserve.resdSum) return this.$message.error('可预约数不能小于预约数！')
      const {data: res} = await this.$http.post('/reserve/editMsReserve', this.updateMsReserve)
      if (res.code !== 200) return this.$message.error(res.msg)
      else {
        this.editDialogVisible = false
        await this.getReserveList()
        return this.$message.success('成功')
      }
    },
    // 查看预约详情
    viewReservationDetails(row) {
      // 跳转到详情页而不是显示弹窗
      this.$router.push(`/viewReservationDetail/${row.id}`)
    },
    // 编辑预约
    editReservation(row) {
      this.$router.push(`/editReservation/${row.id}`)
    },
    // 查看藏品详情
    viewCollectionDetail(cateId) {
      if (cateId) {
        this.$router.push(`/collectionDetail/${cateId}`);
      } else {
        this.$message.warning('未找到关联藏品信息');
      }
    },
    // 处理图片URL
    getImageUrl(path) {
      if (!path) return '';
      
      // 如果路径已经是完整URL（以http或https开头）
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
      }
      
      // 打印当前处理的图片路径以便调试
      console.log('正在处理图片路径:', path, '基础URL:', this.$picBaseUrl);
      
      // 使用Vue实例中配置的图片基准地址
      const fullPath = this.$picBaseUrl + path;
      console.log('完整图片地址:', fullPath);
      return fullPath;
    },
    // 为预约列表中的每个项目获取藏品信息
    async fetchCollectionForReservations() {
      try {
        console.log('开始获取预约关联的藏品信息...');
        
        // 遍历所有预约记录
        for (let i = 0; i < this.reserveList.length; i++) {
          const reserve = this.reserveList[i];
          
          // 优先获取展览关联的所有藏品
          if (reserve.exhibitionId) {
            await this.getExhibitionCollections(reserve, i);
          } 
          // 如果没有展览ID但有藏品ID，则单独获取藏品信息
          else if (reserve.cateId && !reserve.collection) {
            await this.getSingleCollection(reserve, i);
          }
        }
        
        // 输出获取藏品后的预约列表
        this.logCollectionInfo();
      } catch (error) {
        console.error('获取藏品信息过程中出错:', error);
      }
    },
    
    // 获取展览关联的所有藏品
    async getExhibitionCollections(reserve, index) {
      try {
        console.log(`获取展览ID ${reserve.exhibitionId} 关联的藏品集合...`);
        const res = await this.$http.get(`/exhibition/collections/${reserve.exhibitionId}`);
        
        if (res.data.code === 200 && res.data.data && res.data.data.length > 0) {
          console.log(`成功获取到展览关联的藏品集合，共 ${res.data.data.length} 个`);
          
          // 存储展览藏品集合
          this.$set(this.reserveList[index], 'exhibitionCollections', res.data.data);
          
          // 处理所有藏品的图片路径
          this.reserveList[index].exhibitionCollections.forEach(collection => {
            if (collection.colPic) {
              collection.colPic = this.getImageUrl(collection.colPic);
            }
          });
          
          // 如果有cateId，从集合中找到对应的藏品作为主藏品
          if (reserve.cateId) {
            const mainCollection = res.data.data.find(c => c.id === reserve.cateId);
            if (mainCollection) {
              this.$set(this.reserveList[index], 'collection', mainCollection);
              console.log(`找到主藏品: ${mainCollection.title}`);
            }
          } 
          // 否则使用第一个藏品作为主藏品
          else if (res.data.data.length > 0) {
            this.$set(this.reserveList[index], 'collection', res.data.data[0]);
            console.log(`未指定主藏品，使用第一个藏品: ${res.data.data[0].title}`);
          }
          
          return true;
        } else {
          console.warn(`展览ID ${reserve.exhibitionId} 没有关联藏品或获取失败`);
          return false;
        }
      } catch (error) {
        console.error(`获取展览藏品集合出错，展览ID: ${reserve.exhibitionId}`, error);
        return false;
      }
    },
    
    // 获取单个藏品信息
    async getSingleCollection(reserve, index) {
      console.log(`为预约ID ${reserve.id} (展览:${reserve.title}) 获取单个藏品信息，藏品ID: ${reserve.cateId}`);
      
      try {
        const res = await this.$http.get(`/collection/detail/${reserve.cateId}`);
        
        if (res.data.code === 200 && res.data.data) {
          console.log(`成功获取到藏品信息:`, res.data.data);
          
          // 更新预约记录中的藏品信息
          this.$set(this.reserveList[index], 'collection', res.data.data);
          
          // 处理藏品图片路径
          if (res.data.data.colPic) {
            this.reserveList[index].collection.colPic = this.getImageUrl(res.data.data.colPic);
          }
          
          return true;
        } else {
          console.warn(`获取藏品信息失败，ID: ${reserve.cateId}`, res.data);
          return false;
        }
      } catch (error) {
        console.error(`获取藏品信息出错，ID: ${reserve.cateId}`, error);
        return false;
      }
    }
  }
}
</script>

<style lang="less" scoped>
.col-pic {
  width: 50px;
  height: 50px;
  border-radius: 5px;
}

.collection-info {
  display: flex;
  align-items: center;
}

.collection-image {
  margin-right: 10px;
}

.image-error {
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 20px;
  border-radius: 4px;
}

.multiple-time-badge {
  margin-left: 5px;
  font-size: 12px;
  color: #409EFF;
  background-color: #ecf5ff;
  padding: 2px 5px;
  border-radius: 4px;
}

.time-slot-item {
  margin-bottom: 5px;
  line-height: 1.5;
  font-size: 14px;
}

.bold-text {
  font-weight: bold;
}

.no-data {
  color: #909399;
  font-size: 14px;
}

.exhibition-collections-info {
  margin-left: 10px;
}

.collections-preview {
  padding: 10px;
}

.collections-grid {
  display: flex;
  flex-wrap: wrap;
}

.collection-preview-item {
  width: 20%;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.collection-preview-title {
  margin-top: 5px;
  text-align: center;
}

.collection-gallery {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.collections-direct-view {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  overflow: visible;
}

.collection-image-item {
  flex: 0 0 auto;
}

.single-collection-image {
  width: 60px;
  height: 60px;
}

.image-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 20px;
}

.more-collections-badge {
  margin-left: 5px;
  font-size: 12px;
  color: #409EFF;
  background-color: #ecf5ff;
  padding: 2px 5px;
  border-radius: 4px;
}
</style>
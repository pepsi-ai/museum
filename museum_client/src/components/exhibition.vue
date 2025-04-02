<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>展览管理</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="addExhibition">添加展览</el-button>
      </div>
      
      <!-- 搜索区域 -->
      <el-row :gutter="20" class="search-row">
        <el-col :span="7">
          <el-input placeholder="请输入展览标题" v-model="queryInfo.name" clearable @clear="getExhibitionList">
            <el-button slot="append" icon="el-icon-search" @click="getExhibitionList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="getExhibitionList">查询</el-button>
          <el-button type="info" @click="resetQuery">重置</el-button>
        </el-col>
      </el-row>
      
      <!-- 展览列表 -->
      <el-table :data="exhibitionList" border stripe style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="#" width="50"></el-table-column>
        <el-table-column prop="title" label="展览标题" width="180"></el-table-column>
        <el-table-column prop="startDate" label="开始日期" width="120"></el-table-column>
        <el-table-column prop="endDate" label="结束日期" width="120"></el-table-column>
        <el-table-column prop="location" label="展览地点" width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.status === 'ongoing'">进行中</el-tag>
            <el-tag type="warning" v-else-if="scope.row.status === 'upcoming'">即将开始</el-tag>
            <el-tag type="info" v-else>已结束</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="crtTm" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="editExhibition(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeExhibition(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页区域 -->
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
    
    <!-- 添加/编辑展览对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%" @close="dialogClosed">
      <el-form :model="exhibitionForm" :rules="exhibitionFormRules" ref="exhibitionFormRef" label-width="100px">
        <el-form-item label="展览标题" prop="title">
          <el-input v-model="exhibitionForm.title"></el-input>
        </el-form-item>
        <el-form-item label="展览描述" prop="description">
          <el-input type="textarea" v-model="exhibitionForm.description" :rows="4"></el-input>
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="exhibitionForm.startDate"
            type="date"
            placeholder="选择开始日期"
            value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="exhibitionForm.endDate"
            type="date"
            placeholder="选择结束日期"
            value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="展览地点" prop="location">
          <el-input v-model="exhibitionForm.location"></el-input>
        </el-form-item>
        <el-form-item label="展览图片" prop="colPic">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :headers="headers"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload">
            <img v-if="exhibitionForm.colPic" :src="getImageUrl(exhibitionForm.colPic)" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="关联藏品" prop="collectionIds">
          <el-select
            v-model="exhibitionForm.collectionIds"
            multiple
            filterable
            placeholder="请选择关联藏品">
            <el-option
              v-for="item in collectionOptions"
              :key="item.id"
              :label="item.title"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询参数
      queryInfo: {
        name: '',
        pagenum: 1,
        pagesize: 10
      },
      exhibitionList: [],
      total: 0,
      loading: false,
      
      // 对话框相关
      dialogVisible: false,
      dialogTitle: '添加展览',
      exhibitionForm: {
        id: null,
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        status: 'upcoming',
        colPic: '',
        collectionIds: []
      },
      exhibitionFormRules: {
        title: [
          { required: true, message: '请输入展览标题', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入展览描述', trigger: 'blur' }
        ],
        startDate: [
          { required: true, message: '请选择开始日期', trigger: 'change' }
        ],
        endDate: [
          { required: true, message: '请选择结束日期', trigger: 'change' }
        ],
        location: [
          { required: true, message: '请输入展览地点', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择展览状态', trigger: 'change' }
        ]
      },
      
      // 上传相关
      uploadUrl: "http://127.0.0.1:8090/api/file/uploadFile",
      headers: {
        Authorization: window.sessionStorage.getItem('token')
      },
      
      // 藏品选项
      collectionOptions: []
    }
  },
  created() {
    this.getExhibitionList()
    this.getCollectionOptions()
  },
  methods: {
    // 获取展览列表
    async getExhibitionList() {
      this.loading = true
      try {
        const { data: res } = await this.$http.post('/exhibition/list', this.queryInfo)
        if (res.code !== 200) return this.$message.error('获取展览列表失败！')
        this.exhibitionList = res.data.list
        this.total = res.data.total
      } catch (error) {
        console.error('获取展览列表失败', error)
        this.$message.error('获取展览列表失败！')
      } finally {
        this.loading = false
      }
    },
    
    // 重置查询条件
    resetQuery() {
      this.queryInfo.name = ''
      this.getExhibitionList()
    },
    
    // 处理页码变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getExhibitionList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getExhibitionList()
    },
    
    // 获取藏品选项
    async getCollectionOptions() {
      try {
        const { data: res } = await this.$http.get('/exhibition/collections')
        if (res.code !== 200) return this.$message.error('获取藏品列表失败！')
        this.collectionOptions = res.data
      } catch (error) {
        console.error('获取藏品列表失败', error)
        this.$message.error('获取藏品列表失败！')
      }
    },
    
    // 添加展览
    addExhibition() {
      this.dialogTitle = '添加展览'
      this.exhibitionForm = {
        id: null,
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        status: 'upcoming',
        colPic: '',
        collectionIds: []
      }
      this.dialogVisible = true
    },
    
    // 编辑展览
    async editExhibition(row) {
      this.dialogTitle = '编辑展览'
      // 获取展览详情
      try {
        const { data: res } = await this.$http.get(`/exhibition/detail/${row.id}`)
        if (res.code !== 200) return this.$message.error('获取展览详情失败！')
        
        this.exhibitionForm = { ...res.data }
        // 确保collectionIds是数组
        if (!this.exhibitionForm.collectionIds) {
          this.exhibitionForm.collectionIds = []
        }
        
        this.dialogVisible = true
      } catch (error) {
        console.error('获取展览详情失败', error)
        this.$message.error('获取展览详情失败！')
      }
    },
    
    // 删除展览
    async removeExhibition(id) {
      // 先获取展览详情，检查状态
      try {
        const { data: detailRes } = await this.$http.get(`/exhibition/detail/${id}`)
        
        // 检查是否为已结束展览
        if (detailRes.data && detailRes.data.status === 'finished') {
          this.$confirm('已结束的展览可能包含历史记录，确认要删除吗?', '删除提示', {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(async () => {
            // 用户确认后，尝试用另一种方式删除
            try {
              // 使用POST方法，而不是GET
              const { data: res } = await this.$http.post('/exhibition/delete', { id })
              if (res.code !== 200) {
                this.$message.error('删除已结束展览失败，可能有数据依赖！')
                return
              }
              this.$message.success('删除展览成功！')
              this.getExhibitionList()
            } catch (error) {
              console.error('删除已结束展览失败', error)
              this.$message.error('系统限制：已结束展览不允许删除，请联系管理员或技术支持！')
            }
          }).catch(() => {
            this.$message.info('已取消删除')
          })
          return
        }
        
        // 非已结束展览，正常确认删除流程
        const confirmResult = await this.$confirm('此操作将永久删除该展览, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        
        // 使用GET请求删除非已结束的展览
        const { data: res } = await this.$http.get(`/exhibition/delete/${id}`)
        if (res.code !== 200) return this.$message.error('删除展览失败！')
        this.$message.success('删除展览成功！')
        this.getExhibitionList()
        
      } catch (error) {
        console.error('删除展览失败', error)
        this.$message.error(`删除展览失败！错误原因：${error.message || '服务器内部错误'}`)
      }
    },
    
    // 对话框关闭事件
    dialogClosed() {
      this.$refs.exhibitionFormRef.resetFields()
    },
    
    // 提交表单
    submitForm() {
      this.$refs.exhibitionFormRef.validate(async valid => {
        if (!valid) return
        
        try {
          const url = this.exhibitionForm.id ? '/exhibition/update' : '/exhibition/add'
          const { data: res } = await this.$http.post(url, this.exhibitionForm)
          
          if (res.code !== 200) {
            return this.$message.error(this.exhibitionForm.id ? '更新展览失败！' : '添加展览失败！')
          }
          
          this.$message.success(this.exhibitionForm.id ? '更新展览成功！' : '添加展览成功！')
          this.dialogVisible = false
          this.getExhibitionList()
        } catch (error) {
          console.error(this.exhibitionForm.id ? '更新展览失败' : '添加展览失败', error)
          this.$message.error(this.exhibitionForm.id ? '更新展览失败！' : '添加展览失败！')
        }
      })
    },
    
    // 图片上传成功处理
    handleAvatarSuccess(res, file) {
      if (res.code !== 200) {
        return this.$message.error('上传图片失败！')
      }
      this.exhibitionForm.colPic = res.data
      this.$message.success('上传图片成功！')
    },
    
    // 图片上传前的验证
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2
      
      if (!isJPG) {
        this.$message.error('上传图片只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!')
      }
      
      return isJPG && isLt2M
    },
    
    // 获取图片URL
    getImageUrl(path) {
      if (!path) return ''
      if (path.startsWith('http')) return path
      return `http://127.0.0.1:8090/api/file/getPic?name=${path}`
    }
  }
}
</script>

<style scoped>
.search-row {
  margin-bottom: 20px;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style> 
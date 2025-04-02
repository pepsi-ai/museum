<template>
<div>
  <!--面包屑导航-->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>展品管理</el-breadcrumb-item>
    <el-breadcrumb-item>添加展品</el-breadcrumb-item>
  </el-breadcrumb>
  <!--表单区域-->
  <el-card>
    <el-alert title="添加展品信息" type="info" center show-icon :closable="false"></el-alert>
    <el-form
        label-width="80px"
        :model="colInfo"
        :rules="rules"
        ref="ruleForm">
      <el-form-item label="藏品名称" prop="title">
        <el-input v-model="colInfo.title"></el-input>
      </el-form-item>
      <el-form-item label="藏品来源" prop="origin">
        <el-input v-model="colInfo.origin"></el-input>
      </el-form-item>
      <el-form-item label="藏品分类">
        <el-select v-model="colInfo.cateId" placeholder="请选择">
          <el-option
              v-for="item in cateList"
              :key="item.id"
              :label="item.dicValue"
              :value="item.dicValue">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属展厅">
        <el-select v-model="colInfo.displayRoom" placeholder="请选择">
          <el-option
              v-for="item in displayRoom"
              :key="item.id"
              :label="item.dicValue"
              :value="item.dicValue">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="基本信息" prop="base">
        <el-input v-model="colInfo.base"></el-input>
      </el-form-item>
      <el-form-item label="图片" prop="col_pic">
        <el-upload
            name="file"
            :headers="headerObj"
            :action="uploadUrl"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-success="uploadSuccess"
            list-type="picture">
          <el-button size="small" type="primary">点击上传</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item label="藏品描述" prop="describe">
        <quill-editor v-model="colInfo.desColl" :options="editorOption"></quill-editor>
      </el-form-item>
      <el-form-item class="btn">
        <el-button type="primary" @click="addCol">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
  <!--图片预览区域-->
  <el-dialog
      title="图片预览"
      :visible.sync="dialogVisible"
      width="50%">
    <img :src="baseUrl+previewPath" alt="" style="width: 100%;">
  </el-dialog>
</div>
</template>

<script>
export default {
  name: "addcol",
  data() {
    return {
      // 藏品分类
      cateList: [],
      displayRoom: [],
      // 藏品信息
      colInfo: {
        title: '',
        origin: '',
        cateId: '',
        colPic: '',
        base: '',
        desColl: '',
        displayRoom: ''
      },
      editorOption: {
        placeholder: '请输入内容'
      },
      // 添加藏品表单验证规则
      rules: {
        title: [
          { required: true, message: '请输入藏品名称', trigger: 'blur' },
          { min: 1, max: 200, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        ],
        origin: [
          { required: true, message: '请输入藏品来源', trigger: 'blur' },
          { min: 1, max: 200, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        ],
        base: [
          { required: true, message: '请输入藏品基本信息', trigger: 'blur' },
          { min: 1, max: 300, message: '长度在 1 到 30 个字符', trigger: 'blur' }
        ],
        colPic: [
          { required: true, message: '图片不能为空'},
        ],
        desColl: [
          { required: true, message: '请输入藏品描述', trigger: 'blur' },
          { min: 1, max: 8000, message: '长度在 1 到 800 个字符', trigger: 'blur' }
        ]
      },
      // 上传图片地址
      uploadUrl: this.$uploadUrl,
      baseUrl: this.$picBaseUrl,
      // 上传图片请求头 token
      headerObj: {Authorization: window.sessionStorage.getItem('token')},
      // 预览图片地址
      previewPath: '',
      // 控制图片预览显示隐藏
      dialogVisible: false,
    }
  },
  created() {
    this.listDicCateId()
    this.listDicDisplayRoom()
  },
  methods: {
    // 图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data
      this.dialogVisible = true
    },
    // 图片移除操作
    handleRemove() {
      // 暂未处理
    },
    // 图片上传成功时的钩子
    uploadSuccess(response) {
      console.log(response)
      this.colInfo.colPic = response.data
    },
    async listDicCateId() {
      const {data: res} = await this.$http.post('/dic/listDicByTyp', {dicTyp : '藏品分类'})
      if (res.code !== 200) return this.$message.error('获取藏品分类失败')
      this.cateList = res.data
    },
    async listDicDisplayRoom() {
      const {data: res} = await this.$http.post('/dic/listDicByTyp', {dicTyp : '展厅类别'})
      if (res.code !== 200) return this.$message.error('获取展厅类别失败')
      this.displayRoom = res.data
    },
    // 添加藏品
    addCol() {
      this.$refs.ruleForm.validate( async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项！')
        
        // 检查图片是否上传
        if (!this.colInfo.colPic) {
          return this.$message.error('请上传藏品图片')
        }
        
        try {
          // 发送请求添加藏品
          const {data: res} = await this.$http.post('/collect/addColl', this.colInfo)
          
          if (res.code !== 200) {
            return this.$message.error(res.msg || '添加藏品失败')
          }
          
          // 添加成功
          this.$message.success('添加藏品成功！')
          
          // 重置表单
          this.resetForm()
        } catch (error) {
          console.error('添加藏品请求失败:', error)
          this.$message.error('添加藏品失败，请稍后重试')
        }
      })
    },
    // 重置表单
    resetForm() {
      this.$refs.ruleForm.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>

.el-form {
  width: 80%;
  padding: 20px 20px;
}

.btn {
  display: flex;
  justify-content: end;
}

</style>

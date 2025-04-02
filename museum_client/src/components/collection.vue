<template>
<div>
  <!--面包屑导航-->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>展品管理</el-breadcrumb-item>
    <el-breadcrumb-item>展品列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!--藏品列表区域-->
  <el-card>
    <!--用户表格区域-->
    <el-row :gutter="20">
      <el-col :span="8">
        <el-input placeholder="请输入名称" v-model="queryInfo.name">
          <el-button slot="append" icon="el-icon-search" @click="getColList"></el-button>
        </el-input>
      </el-col>
    </el-row>
    <el-table
        border
        :data="colList"
        stripe>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="藏品" align="center">
          <template v-slot:default="scope">
            <el-image
                :preview-src-list="[baseUrl+scope.row.colPic]"
                :src="baseUrl+scope.row.colPic"
                class="col-pic">
            </el-image>
          </template>
      </el-table-column>
      <el-table-column prop="title" label="名称" :formatter="stateFormat"></el-table-column>
      <el-table-column prop="origin" label="来源"></el-table-column>
      <el-table-column prop="cateId" label="分类"></el-table-column>
      <el-table-column prop="displayRoom" label="所属展厅"></el-table-column>
      <el-table-column prop="viewCnt" label="浏览次数"></el-table-column>
      <el-table-column prop="base" label="基本信息" :formatter="stateFormat"></el-table-column>
      <el-table-column prop="desColl" label="描述" :formatter="stateFormat"></el-table-column>
      <el-table-column label="操作">
        <template v-slot:default="scope">
          <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="showEditDialog(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCol(scope.row.id)"></el-button>
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
    <el-form :model="updateColInfo" ref="editInfoRef" label-width="70px">
      <el-form-item label="藏品名称">
        <el-input v-model="updateColInfo.title"></el-input>
      </el-form-item>
      <el-form-item label="来源">
        <el-input v-model="updateColInfo.origin" ></el-input>
      </el-form-item>
      <el-form-item label="分类">
        <el-select v-model="updateColInfo.cateId" placeholder="请选择">
          <el-option
              v-for="item in typs"
              :key="item.id"
              :label="item.dicValue"
              :value="item.dicValue">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属展厅">
        <el-select v-model="updateColInfo.displayRoom" placeholder="请选择">
          <el-option
              v-for="item in displayRoom"
              :key="item.id"
              :label="item.dicValue"
              :value="item.dicValue">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="基本信息">
        <el-input v-model="updateColInfo.base"></el-input>
      </el-form-item>
      <el-form-item label="描述">
        <quill-editor v-model="updateColInfo.desColl" :options="editorOption"></quill-editor>
      </el-form-item>

    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editColInfo">确 定</el-button>
      </span>
  </el-dialog>


</div>
</template>

<script>
export default {
  name: "collection",
  data() {
    return {
      editorOption: {
        placeholder: '请输入内容'
      },
      // 获取藏品信息参数
      queryInfo: {
        name: '',
        pagenum: 1,
        pagesize: 5
      },
      typs: [],
      displayRoom: [],
      // 藏品列表
      colList: [],
      // 藏品总数
      total: 0,
      // 图片显示基准地址
      baseUrl: this.$picBaseUrl,
      editDialogVisible: false,
      updateColInfo: {
        id: null,
        title: '',
        origin: '',
        base: '',
        desColl: '',
        cateId: '',
        displayRoom: ''
      }
    }
  },
  created() {
    this.getColList()
    this.listDicCateId()
    this.listDicDisplayRoom()
  },
  methods: {
    async getColList() {
      const {data: res} = await this.$http.post('/collect/getdata', this.queryInfo)
      if (res.code !== 200) return this.$message.error('获取藏品信息失败')
      this.colList = res.data.list
      this.total = res.data.total
    },
    async listDicCateId() {
      const {data: res} = await this.$http.post('/dic/listDicByTyp', {dicTyp : '藏品分类'})
      if (res.code !== 200) return this.$message.error('获取藏品分类失败')
      this.typs = res.data
    },
    async listDicDisplayRoom() {
      const {data: res} = await this.$http.post('/dic/listDicByTyp', {dicTyp : '展厅类别'})
      if (res.code !== 200) return this.$message.error('获取展厅类别失败')
      this.displayRoom = res.data
    },
    // 格式化表格消息内容
    stateFormat(row, column, cellValue) {
      // console.log(row , column , cellValue)
      if (!cellValue) return "";
      
      // 如果是HTML内容，先移除HTML标签
      let textContent = cellValue;
      if (typeof cellValue === 'string' && cellValue.includes('<')) {
        textContent = cellValue.replace(/<[^>]+>/g, "");
      }
      
      if (textContent.length > 20) {
        //最长固定显示20个字符
        return textContent.slice(0, 20) + "...";
      }
      return textContent;
    },
    // 监听分页 pageSize 变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getColList()
    },
    // 监听分页 pageNum 变化
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getColList()
    },
    // 监听添加用户对话框关闭
    editDialogClose() {
      // 重置表单数据
      this.$refs.editInfoRef.resetFields()
    },
    // 删除藏品
    async deleteCol(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该藏品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const {data: res} = await this.$http.post('/collect/delColl', {id: id})
      if (res.code !== 200) return this.$message.error('删除藏品失败')
      this.$message.success('删除藏品成功')
      await this.getColList()
    },
    // 显示编辑藏品信息对话框
    showEditDialog(val) {
      this.updateColInfo = val
      this.editDialogVisible = true
    },
    // 更新藏品信息
    async editColInfo() {
      await this.$http.post('/collect/editCollInfo', this.updateColInfo)
      this.editDialogVisible = false
      await this.getColList()
      this.$message.success('更新藏品信息成功')
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

</style>

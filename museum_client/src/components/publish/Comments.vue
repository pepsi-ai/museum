<template>
<div>
  <!--面包屑导航-->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>公告管理</el-breadcrumb-item>
    <el-breadcrumb-item>用户留言</el-breadcrumb-item>
  </el-breadcrumb>
  <el-card>
    <el-row :gutter="20">
      <el-col :span="8">
        <el-input placeholder="请输入名称" v-model="queryInfo.name">
          <el-button slot="append" icon="el-icon-search" @click="getOverview"></el-button>
        </el-input>
      </el-col>
    </el-row>
    <!--用户表格区域-->
    <el-table
        border
        :data="feedbackData"
        stripe>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="用户ID" prop="userId"></el-table-column>
      <el-table-column label="用户名" prop="userName"></el-table-column>
      <el-table-column label="反馈内容" prop="feedContent"></el-table-column>
      <el-table-column label="提交时间" prop="fedDateTime"></el-table-column>
      <el-table-column label="是否显示">
        <template v-slot:default="scope">
          <span v-if="scope.row.isShow === '0'" style="color: red">否</span>
          <span v-if="scope.row.isShow === '1'">是</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template v-slot:default="scope">
          <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="announcementInfo =scope.row;editDialogVisible=true"></el-button>
          </el-tooltip>
          <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteComm(scope.row.id)"></el-button>
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
  <div>
    <!--编辑藏品信息对话框-->
    <el-dialog
        title="编辑留言信息"
        :visible.sync="editDialogVisible"
        width="50%">
      <el-card>
        <el-form :model="announcementInfo" ref="ruleForm" label-width="80px">
          <el-form-item label="用户名" prop="title">
            <el-input v-model="announcementInfo.userName" disabled></el-input>
          </el-form-item>
          <el-form-item label="用户ID" prop="title">
            <el-input v-model="announcementInfo.userId" disabled></el-input>
          </el-form-item>
          <el-form-item label="留言内容" prop="describe">
            <el-input v-model="announcementInfo.feedContent" type="textarea" :rows="5" disabled></el-input>
          </el-form-item>
          <el-form-item label="是否显示" prop="origin">
            <el-select v-model="announcementInfo.isShow" placeholder="请选择">
              <el-option label="是" value="1"/>
              <el-option label="否" value="0"/>
            </el-select>
          </el-form-item>
        </el-form>
      </el-card>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editColInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</div>
</template>

<script>
export default {
  name: "Comments",
  data() {
    return {
      queryInfo: {
        name: '',
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      announcementInfo: {},
      editDialogVisible: false,
      feedbackData: []
    }
  },
  created() {
    this.getOverview()
  },
  methods: {
    // 获取留言信息
    async getOverview() {
      const {data: res} = await this.$http.post('/feedBack/listFeedBackByUser', this.queryInfo)
      if (res.code !== 200) return this.$message.error(res.msg)
      this.feedbackData = res.data.list
      this.total = res.data.total
    },
    async editColInfo() {
      const {data: res} = await this.$http.post('/feedBack/editFeedBack', this.announcementInfo)
      if (res.code !== 200) {
        return this.$message.error(res.msg)
      }else {
        this.editDialogVisible = false
        await this.getOverview()
      }
    },
    async deleteComm(id) {
      const {data: res} = await this.$http.post('/feedBack/delFeedBack', {id: id})
      if (res.code !== 200) {
        return this.$message.error(res.msg)
      }else {
        await this.getOverview()
      }
    },
    // 监听分页 pageSize 变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOverview()
    },
    // 监听分页 pageNum 变化
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOverview()
    }
  }
}
</script>

<style lang="less" scoped>
.el-card {
  margin: 10px 0;
}

h4 {
  display: inline-block;
  margin-right: 10px;
  cursor: pointer;
}

span {
  font-size: 12px;
}

p {
  font-size: 14px;
}

</style>

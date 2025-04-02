<template>
<div>
  <!--面包屑导航-->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>公告管理</el-breadcrumb-item>
    <el-breadcrumb-item>公告列表</el-breadcrumb-item>
  </el-breadcrumb>
  <el-card>
    <el-row :gutter="20">
      <el-col :span="8">
        <el-input placeholder="请输入内容" v-model="queryInfo.name">
          <el-button slot="append" icon="el-icon-search" @click="getAnnouncementList"></el-button>
        </el-input>
      </el-col>
    </el-row>
    <!--用户表格区域-->
    <el-table
        border
        :data="announcementList"
        stripe>
      <el-table-column type="index"></el-table-column>
      <el-table-column prop="title" label="标题"></el-table-column>
      <el-table-column prop="date" label="发布时间"></el-table-column>
      <el-table-column label="是否置顶">
        <template v-slot:default="scope">
          <span v-if="scope.row.isTop === '1'" style="color: red">是</span>
          <span v-if="scope.row.isTop === '0'">否</span>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="内容详情">
        <template v-slot:default="scope">
          <p v-html="scope.row.contentText"></p>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template v-slot:default="scope">
          <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="editDialogVisible=true;announcementInfo=JSON.parse(JSON.stringify(scope.row));"></el-button>
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
  <div>
    <!--编辑藏品信息对话框-->
    <el-dialog
        title="编辑藏品信息"
        :visible.sync="editDialogVisible"
        width="50%">
      <el-card>
        <el-form :model="announcementInfo" :rules="rules" ref="ruleForm" label-width="80px">
          <el-form-item label="标题" prop="title">
            <el-input v-model="announcementInfo.title"></el-input>
          </el-form-item>
          <el-form-item label="公告内容" prop="content">
            <div>
              <quill-editor v-model="announcementInfo.contentText" :options="editorOption"></quill-editor>
            </div>
          </el-form-item>
          <el-form-item label="是否置顶" prop="origin">
            <el-select v-model="announcementInfo.isTop" placeholder="请选择">
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
  name: "announcement",
  data() {
    return {
      queryInfo: {
        name: '',
        pagenum: 1,
        pagesize: 5
      },
      announcementList: [],
      announcementInfo: {},
      editDialogVisible: false,
      editorOption: {
        placeholder: '请输入公告内容'
      },
      total: 0,
      rules: {
        title: [
          { required: true, message: '标题不能为空', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '内容不能为空', trigger: 'blur' },
        ]
      }
    }
  },
  created() {
    this.getAnnouncementList()
  },
  methods: {
    async getAnnouncementList() {
      const {data: res} = await this.$http.post('/announcement/listMsAnnouncement', this.queryInfo)
      if (res.code !== 200) return this.$message.error(res.msg)
      this.announcementList = res.data.list
      this.total = res.data.total
    },
    async editColInfo() {
      const {data: res} = await this.$http.post('/announcement/editMsAnnouncement', this.announcementInfo)
      if (res.code !== 200) {
        return this.$message.error(res.msg)
      }else {
        this.editDialogVisible = false
        await this.getAnnouncementList()
      }
    },
    // 监听分页 pageSize 变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getAnnouncementList()
    },
    // 监听分页 pageNum 变化
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getAnnouncementList()
    },
    async deleteCol(id) {
      const {data: res} = await this.$http.post('/announcement/delMsAnnouncement', {id: id})
      if (res.code !== 200) {
        return this.$message.error(res.msg)
      }else {
        this.editDialogVisible = false
        await this.getAnnouncementList()
      }
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

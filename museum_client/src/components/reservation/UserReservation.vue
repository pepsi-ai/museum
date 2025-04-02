<template>
<div>
  <!--面包屑导航-->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>预约管理</el-breadcrumb-item>
    <el-breadcrumb-item>用户预约列表</el-breadcrumb-item>
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
      <el-table-column prop="userId" label="用户ID" :formatter="stateFormat"></el-table-column>
      <el-table-column prop="userName" label="用户名"></el-table-column>
      <el-table-column prop="cateTitle" label="展品名称"></el-table-column>
      <el-table-column prop="resType" label="预约类型" :formatter="stateFormat"></el-table-column>
      <el-table-column prop="resDate" label="预约日期" :formatter="stateFormat"></el-table-column>
      <el-table-column prop="resTime" label="预约时间段" :formatter="stateFormat"></el-table-column>
      <el-table-column prop="resSession" label="预约场次" :formatter="stateFormat"></el-table-column>
      <el-table-column label="是否有效">
        <template v-slot:default="scope">
          <span v-if="scope.row.vldStat === '1'">有效</span>
          <span v-if="scope.row.vldStat === '0'" style="color: red">已失效</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template v-slot:default="scope">
          <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="showEditDialog(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="delMsReserve(scope.row.id)"></el-button>
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
      <el-form-item label="用户ID" prop="title">
        <el-input v-model="updateMsReserve.userId" disabled></el-input>
      </el-form-item>
      <el-form-item label="用户名" prop="title">
        <el-input v-model="updateMsReserve.userName" disabled></el-input>
      </el-form-item>
      <el-form-item label="展品名称" prop="title">
        <el-input v-model="updateMsReserve.cateTitle" disabled></el-input>
      </el-form-item>
      <el-form-item label="预约类型" prop="origin">
        <el-select v-model="updateMsReserve.resType" placeholder="请选择" disabled>
          <el-option label="展览预约" value="展览预约"/>
          <el-option label="解说预约" value="解说预约"/>
        </el-select>
      </el-form-item>
      <el-form-item label="预约日期" prop="base">
        <el-date-picker v-model="updateMsReserve.resDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd" disabled>
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
          <el-option label="第三场" value="第三场"/>
        </el-select>
      </el-form-item>
      <el-form-item label="是否有效" prop="origin">
        <el-select v-model="updateMsReserve.vldStat" placeholder="请选择">
          <el-option label="有效" value="1"/>
          <el-option label="失效" value="0"/>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editMsReserve">确 定</el-button>
      </span>
  </el-dialog>


</div>
</template>

<script>
export default {
  name: "UserReservation",
  data() {
    return {
      // 获取藏品信息参数
      queryInfo: {
        name: '',
        pagenum: 1,
        pagesize: 5
      },
      // 藏品列表
      reserveList: [],
      // 藏品总数
      total: 0,
      // 图片显示基准地址
      baseUrl: this.$picBaseUrl,
      editDialogVisible: false,
      updateMsReserve: {}
    }
  },
  created() {
    this.getReserveList()
  },
  methods: {
    async getReserveList() {
      const {data: res} = await this.$http.post('/reserveDetail/listDetailReserve', this.queryInfo)
      if (res.code !== 200) return this.$message.error(res.msg)
      this.reserveList = res.data.list
      this.total = res.total
    },
    // 格式化表格消息内容
    stateFormat(row, column, cellValue) {
      // console.log(row , column , cellValue)
      if (!cellValue) return "";
      if (cellValue.length > 20) {
        //最长固定显示4个字符
        return cellValue.slice(0, 20) + "...";
      }
      return cellValue;
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
      this.$refs.editInfoRef.resetFields()
    },
    // 删除藏品
    async delMsReserve(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该预约记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const {data: res} = await this.$http.post('/reserveDetail/delDetail', {id: id})
      if (res.code !== 200) return this.$message.error(res.msg)
      this.$message.success('删除成功')
      await this.getReserveList()
    },
    // 显示编辑藏品信息对话框
    showEditDialog(row) {
      this.updateMsReserve = row
      this.editDialogVisible = true
    },
    // 更新藏品信息
    async editMsReserve() {
      const {data: res} = await this.$http.post('/reserveDetail/editDetail', this.updateMsReserve)
      if (res.code !== 200) return this.$message.error(res.msg)
      else {
        this.editDialogVisible = false
        await this.getReserveList()
        return this.$message.success('成功')
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

</style>

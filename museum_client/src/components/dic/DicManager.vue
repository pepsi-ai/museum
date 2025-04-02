<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统管理</el-breadcrumb-item>
      <el-breadcrumb-item>字典值管理</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
      <!--搜索和用户添加区域-->
      <el-row :gutter="20">
        <el-col :span="4">
          <el-select v-model="queryInfo.name" placeholder="请选择" @change="listDicByTyp">
            <el-option
                v-for="item in dicTyps"
                :key="item"
                :label="item"
                :value="item">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="listDicTyp">刷新</el-button>
        </el-col>
        <el-col :span="4">
          <el-button type="warning" @click="dialogVisible = true">添加字典值</el-button>
        </el-col>
      </el-row>
      <!--用户表格区域-->
      <el-table
          border
          ref="refsTable"
          :data="dicList"
          @selection-change="handleSelectionChange"
          stripe>
        <el-table-column
            type="selection"
            width="55">
        </el-table-column>
        <el-table-column prop="dicTyp" label="字典类型"></el-table-column>
        <el-table-column prop="dicValue" label="属性值"></el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="scope">
            <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="delDic(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--添加用户对话框-->
    <el-dialog
        title="添加字典值"
        :visible.sync="dialogVisible"
        width="50%">
      <el-form :model="dicInf" ref="userInfoRef" label-width="70px">
        <el-form-item label="类型" prop="username">
          <el-input v-model="dicInf.dicTyp"></el-input>
        </el-form-item>
        <el-form-item label="属性值" prop="password">
          <el-input v-model="dicInf.dicValue"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addDic">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "DicManager",
  data() {
    return {
      // 用户列表
      dicList: [],
      dicTyps: [],
      // 获取用户列表查询参数
      queryInfo: {
        name: '',
        pagenum: 1,
        pagesize: 5,
      },
      // 用户数据总条数
      total: 0,
      // 控制添加用户对话框显示和隐藏
      dialogVisible: false,
      // 用户信息
      dicInf: {
        dicTyp: '',
        dicDesc: '',
        dicValue: ''
      },
      updateUserInfo: {
        id: null,
        username: '',
        nickname: '',
        mobile: '',
        state: 0
      }
    }
  },
  created() {
    this.listDicTyp()
  },
  methods: {
    // 获取用户列表
    async listDicTyp() {
      const {data: res} = await this.$http.post('/dic/listDicTyp', this.queryInfo)
      if (res.code !== 200) return this.$message.error('获取用户列表失败')
      this.dicTyps = res.data
      if(this.dicTyps.length > 0) {
        this.queryInfo.name = this.dicTyps[0]
        await this.listDicByTyp()
      }
    },
    async listDicByTyp() {
      const {data: res} = await this.$http.post('/dic/listDicByTyp', {dicTyp : this.queryInfo.name})
      if (res.code !== 200) return this.$message.error('获取用户列表失败')
      this.dicList = res.data
    },
    // 监听分页 pageSize 变化
    handleSelectionChange(val) {
      if (val.length > 1) {
        //移除上一次选中行数据
        val.shift();
        //修改选中图标为未选中状态
        this.$refs.refsTable.clearSelection();
        //将当前选中行改为选中状态
        this.$refs.refsTable.toggleRowSelection(val[0]);
      }
      if(val && val.length===0) {
        this.dicInf = { dicTyp: '', dicDesc: '', dicValue: ''}
        return
      }
      this.dicInf = val[0]
    },
    // 添加字典值
    async addDic() {
      const {data: res} = await this.$http.post('/dic/addDic', this.dicInf)
      if (res.code !== 200) return this.$message.error(res.msg)
      this.$message.success('添加字典值成功')
      this.dialogVisible = false
      await this.listDicByTyp()
    },
    // 删除字典值
    async delDic(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该字典值, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const {data: res} = await this.$http.post('/dic/delDic', {id: id} )
      if (res.code !== 200) return this.$message.error('删除字典值失败')
      this.$message.success('删除用户成功')
      await this.listDicByTyp()
    }
  }
}
</script>
<style lang="less" scoped>
/**找到表头那一行，然后把里面的复选框隐藏掉**/
::v-deep .el-table__header-wrapper .el-table__header .el-checkbox {
  display: none;
}
</style>

<template>
<div>
  <!--面包屑导航-->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>预约管理</el-breadcrumb-item>
    <el-breadcrumb-item>添加预约</el-breadcrumb-item>
  </el-breadcrumb>
  <!--表单区域-->
  <el-card>
    <el-alert title="添加预约信息" type="info" center show-icon :closable="false"></el-alert>
    <el-form
        label-width="120px"
        :model="msReserve"
        ref="ruleForm">
      <el-form-item label="预约标题" prop="title">
        <el-input v-model="msReserve.title"></el-input>
      </el-form-item>
      <el-form-item label="预约类型" prop="origin">
        <el-select v-model="msReserve.resTyp" placeholder="请选择">
          <el-option label="展览预约" value="展览预约"/>
          <el-option label="解说预约" value="解说预约"/>
        </el-select>
      </el-form-item>
      <el-form-item label="选择展览" prop="exhibitionId">
        <el-select v-model="msReserve.exhibitionId" placeholder="请选择展览">
          <el-option
              v-for="item in exhibitionList"
              :key="item.id"
              :label="item.title"
              :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="可预约人数" prop="base">
        <el-input v-model="msReserve.resSum" type="number"></el-input>
      </el-form-item>
      <el-form-item label="预约日期" prop="resDates">
        <el-date-picker 
          v-model="msReserve.resDates" 
          type="dates" 
          format="yyyy-MM-dd" 
          value-format="yyyy-MM-dd"
          placeholder="选择多个日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="预约时间段" prop="resTimes">
        <el-select v-model="msReserve.resTimes" multiple placeholder="请选择多个时间段">
          <el-option label="8:30~11:00" value="8:30~11:00"/>
          <el-option label="14:30~17:00" value="14:30~17:00"/>
        </el-select>
      </el-form-item>
      <el-form-item label="预约场次" prop="resSessions">
        <el-select v-model="msReserve.resSessions" multiple placeholder="请选择多个场次">
          <el-option label="第一场" value="第一场"/>
          <el-option label="第二场" value="第二场"/>
        </el-select>
      </el-form-item>
      <el-form-item label="说明" prop="describe">
        <div>
          <quill-editor v-model="msReserve.resDes" :options="editorOption"></quill-editor>
        </div>
      </el-form-item>
      <el-form-item class="btn">
        <el-button type="primary" @click="addReserve">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</div>
</template>

<script>
import Vue from 'vue';
import VueQuillEditor from 'vue-quill-editor';
// 导入所需样式
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
Vue.use(VueQuillEditor)
export default {
  name: "addReservation",
  data() {
    return {
      // 展览列表
      exhibitionList: [],
      // 预约信息
      msReserve: {
        title: '',
        resTyp: '',
        exhibitionId: null, // 展览ID
        cateIds: [], // 添加cateIds字段
        resSum: '',
        // 原始单选字段
        resDate: '',
        resTime: '',
        resSession: '',
        // 新增多选字段
        resDates: [], // 多个日期
        resTimes: [], // 多个时间段
        resSessions: [], // 多个场次
        resDes: '',
        resdSum: 0
      },
      editorOption: {
        placeholder: '请输入预约说明内容'
      }
    }
  },
  created() {
    this.getExhibitionList()
  },
  methods: {
    // 获取展览列表
    async getExhibitionList() {
      try {
        const {data: res} = await this.$http.get('/exhibition/all')
        if (res.code !== 200) return this.$message.error('获取展览列表失败')
        this.exhibitionList = res.data
      } catch (error) {
        console.error('获取展览列表失败', error)
        this.$message.error('获取展览列表失败')
      }
    },
    // 添加预约
    async addReserve() {
      // 表单验证
      if (!this.msReserve.title) {
        return this.$message.error('请输入预约标题')
      }
      if (!this.msReserve.resTyp) {
        return this.$message.error('请选择预约类型')
      }
      if (!this.msReserve.exhibitionId) {
        return this.$message.error('请选择展览')
      }
      if (!this.msReserve.resSum) {
        return this.$message.error('请输入可预约人数')
      }
      if (!this.msReserve.resDates || this.msReserve.resDates.length === 0) {
        return this.$message.error('请选择至少一个预约日期')
      }
      if (!this.msReserve.resTimes || this.msReserve.resTimes.length === 0) {
        return this.$message.error('请选择至少一个预约时间段')
      }
      if (!this.msReserve.resSessions || this.msReserve.resSessions.length === 0) {
        return this.$message.error('请选择至少一个预约场次')
      }

      try {
        // 创建一个包含cateIds的请求对象
        const requestData = { ...this.msReserve }
        
        // 为了兼容后端，暂时保留原来的单一字段，使用多选的第一个值
        requestData.resDate = this.msReserve.resDates[0]
        requestData.resTime = this.msReserve.resTimes[0]
        requestData.resSession = this.msReserve.resSessions[0]
        
        // 设置字段表示有多个时间段
        requestData.hasMultipleTimes = true
        
        // 后端需要cateIds数组，我们将展览ID放入其中
        requestData.cateIds = [this.msReserve.exhibitionId]
        
        // 添加多选日期、时间段、场次数据
        requestData.reserveTimes = []
        
        // 生成所有的组合
        this.msReserve.resDates.forEach(date => {
          this.msReserve.resTimes.forEach((time, index) => {
            // 根据时间段自动选择对应的场次
            const session = time.startsWith('8:30') ? '第一场' : '第二场';
            requestData.reserveTimes.push({
              resDate: date,
              resTime: time,
              resSession: session,
              availableSlots: requestData.resSum
            });
          });
        });
        
        console.log('提交的预约数据:', requestData)
        
        const {data: res} = await this.$http.post('/reserve/addMsReserve', requestData)
        if (res.code !== 200) {
          return this.$message.error(res.msg || '添加预约失败')
        } else {
          this.$message.success('添加预约成功！')
          this.resetForm()
        }
      } catch (error) {
        console.error('添加预约失败', error)
        this.$message.error('添加预约失败')
      }
    },
    // 重置表单
    resetForm() {
      this.$refs.ruleForm.resetFields()
      this.msReserve = {
        title: '',
        resTyp: '',
        exhibitionId: null,
        cateIds: [], // 重置cateIds
        resSum: '',
        resDate: '',
        resTime: '',
        resSession: '',
        resDates: [],
        resTimes: [],
        resSessions: [],
        resDes: '',
        resdSum: 0
      }
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

/* 为多选下拉框添加样式 */
.el-select {
  width: 100%;
}

/* 日期选择器样式 */
.el-date-picker {
  width: 100%;
}
</style>

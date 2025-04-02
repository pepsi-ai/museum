<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>预约管理</el-breadcrumb-item>
      <el-breadcrumb-item>编辑预约</el-breadcrumb-item>
    </el-breadcrumb>
    
    <el-card class="edit-card">
      <el-alert title="编辑预约信息" type="info" center show-icon :closable="false"></el-alert>
      
      <el-form ref="form" :model="form" label-width="120px" class="mt-20">
        <el-form-item label="预约标题" prop="title">
          <el-input v-model="form.title"></el-input>
        </el-form-item>
        
        <el-form-item label="预约类型" prop="resTyp">
          <el-select v-model="form.resTyp" placeholder="请选择预约类型">
            <el-option label="展览预约" value="展览预约"></el-option>
            <el-option label="解说预约" value="解说预约"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="藏品名称" prop="cateName">
          <el-input v-model="form.cateName" disabled></el-input>
        </el-form-item>
        
        <el-form-item label="预约状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option :value="0" label="已取消"></el-option>
            <el-option :value="1" label="即将开始"></el-option>
            <el-option :value="2" label="进行中"></el-option>
            <el-option :value="3" label="已结束"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="预约描述" prop="resDes">
          <el-input type="textarea" v-model="form.resDes" :rows="4"></el-input>
        </el-form-item>
        
        <div v-if="form.hasMultipleTimes && timeSlots.length > 0" class="time-slots-section">
          <div class="section-title">预约时间段列表</div>
          <el-table :data="timeSlots" border style="width: 100%">
            <el-table-column prop="resDate" label="日期" width="120"></el-table-column>
            <el-table-column prop="resTime" label="时间段" width="120"></el-table-column>
            <el-table-column prop="resSession" label="场次" width="120"></el-table-column>
            <el-table-column prop="availableSlots" label="可预约人数" width="100"></el-table-column>
            <el-table-column prop="bookedSlots" label="已预约人数" width="100"></el-table-column>
            <el-table-column label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
          <div class="tips">注意：编辑提交后将修改所有关联预约的公共信息，时间段列表仅供查看。</div>
        </div>
        
        <el-form-item class="mt-20">
          <el-button type="primary" @click="submitForm">保存修改</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getReserveInfo } from '@/api/reservation'

export default {
  name: 'EditReservation',
  data() {
    return {
      form: {
        id: null,
        title: '',
        resTyp: '',
        cateName: '',
        cateId: null,
        resDes: '',
        status: 1,
        hasMultipleTimes: false,
        groupId: ''
      },
      timeSlots: [],
      loading: false
    }
  },
  created() {
    // 从路由获取预约ID
    const id = this.$route.params.id
    if (id) {
      this.fetchReservationDetail(id)
    } else {
      this.$message.error('未找到预约ID')
      this.goBack()
    }
  },
  methods: {
    // 获取预约详情
    async fetchReservationDetail(id) {
      this.loading = true
      try {
        const res = await getReserveInfo(id)
        if (res.code === 200 && res.data) {
          // 设置表单数据
          const data = res.data
          this.form = {
            id: data.id,
            title: data.title,
            resTyp: data.resTyp,
            cateName: data.cateName,
            cateId: data.cateId,
            resDes: data.resDes,
            status: data.status,
            hasMultipleTimes: data.hasMultipleTimes,
            groupId: data.groupId
          }
          
          // 如果有时间段信息，加载时间段
          if (data.reserveTimes && data.reserveTimes.length > 0) {
            this.timeSlots = data.reserveTimes
          }
        } else {
          this.$message.error('获取预约详情失败')
          this.goBack()
        }
      } catch (error) {
        console.error('获取预约详情出错', error)
        this.$message.error('获取预约详情出错')
        this.goBack()
      } finally {
        this.loading = false
      }
    },
    // 获取状态类型
    getStatusType(status) {
      const statusTypeMap = {
        '即将开始': 'warning',
        '进行中': 'success',
        '已结束': 'info',
        '已取消': 'danger'
      }
      return statusTypeMap[status] || 'info'
    },
    // 提交表单
    submitForm() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            const { data: res } = await this.$http.post('/reserve/editMsReserve', this.form)
            if (res.code !== 200) {
              return this.$message.error('保存修改失败：' + res.msg)
            }
            
            this.$message.success('保存修改成功')
            this.goBack()
          } catch (error) {
            console.error('保存修改失败', error)
            this.$message.error('保存修改失败，请检查网络连接')
          }
        } else {
          this.$message.error('请填写必要的表单项')
          return false
        }
      })
    },
    // 返回列表页
    goBack() {
      this.$router.push('/ReservationList')
    }
  }
}
</script>

<style scoped>
.edit-card {
  margin: 20px 0;
}
.mt-20 {
  margin-top: 20px;
}
.time-slots-section {
  margin: 20px 0;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  background-color: #f8f8f8;
}
.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
}
.tips {
  margin-top: 10px;
  color: #e6a23c;
  font-size: 12px;
}
</style> 
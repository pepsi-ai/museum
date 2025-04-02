<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>首页</el-breadcrumb-item>
      <el-breadcrumb-item>信息总览</el-breadcrumb-item>
    </el-breadcrumb>
    <!--4盒子 头部区域-->
    <div class="index-head-box">
      <div class="head-item"  v-for="(item, i) in headTitleList" :key="i">
        <div class="title">{{item}}</div>
        <div v-if="i === 0" >
          <div v-if="collectionData&&collectionData.length>0" class="item1">
            <div v-for="(item,i) in collectionData" :key="i" class="item1-i" :class="styleList[i % 4]">
              <span>{{item.title}}</span>
              <span>{{item.origin}}</span>
            </div>
          </div>
          <div v-else style="padding: 10%">
            <el-skeleton :rows="4" animated />
          </div>
        </div>
        <div v-if="i === 1">
          <div v-if="collectionData&&collectionData.length>0" class="item2">
            <el-carousel height="200px" indicator-position="none">
              <el-carousel-item v-for="(item,i) in collectionData" :key="i">
                <img :src="picBaseUrl+item.colPic" alt="">
              </el-carousel-item>
            </el-carousel>
          </div>
          <div v-else style="padding: 10%">
            <el-skeleton :rows="4" animated />
          </div>
        </div>
        <div v-if="i === 2" class="item3">
          <div v-if="announcementList&&announcementList.length>0">
            <div class="item3-date" >{{announcementList[0].title}}</div>
            <div class="item3-text" style="height: 150px;overflow-y: auto">
              <p v-html="announcementList[0].contentText"></p>
            </div>
          </div>
          <div v-else style="padding: 8%">
            <el-skeleton :rows="4" animated />
          </div>
        </div>
      </div>
    </div>
    <!--表格与柱形图区域-->
    <div class="index-content-box">
      <div class="index-content-box-left">
        <div class="title">用户反馈信息</div>
        <div class="table-box" v-if="feedbackData">
          <el-table
              :data="feedbackData"
              height="270"
              border
              stripe>
            <el-table-column label="用户名ID" prop="userId"></el-table-column>
            <el-table-column label="用户名" prop="userName"></el-table-column>
            <el-table-column label="反馈内容" prop="feedContent"></el-table-column>
            <el-table-column label="提交时间" prop="fedDateTime"></el-table-column>
          </el-table>
        </div>
      </div>
      <div class="index-content-box-right">
        <div class="title">藏品浏览次数</div>
        <div class="column-title-box">
        </div>
        <div class="column-box">
          <div ref="chart1"  style="height: 370px;height: 300px"></div>
        </div>
      </div>
    </div>

  </div>
</template>
<script>
import * as echarts from "echarts"
export default {
  name: "Index2",
  data() {
    return {
      queryInfo: {
        name: '',
        pagenum: 1,
        pagesize: 8,
      },
      feedbackData: [],
      collectionData:[],
      announcementList:[],
      colListTop: [],
      picBaseUrl: this.$picBaseUrl,
      headTitleList: ['藏品浏览（TOP10）','藏品轮播图','公告栏(最新公告信息)'],
      // 头部盒子1内部样式列表
      styleList: ["item1-red",'item1-blue','item1-yellow','item1-pink'],
      // 控制柱形图显示与隐藏
      showChart1: true,
      chart1: null,
    }
  },
  created() {
    this.getColListTop()
    this.getAnnouncementList()
    this.getFeedBackview()
  },
  updated() {
  },
  mounted() {
    this.chart1 = echarts.init(this.$refs.chart1)
  },
  methods: {
    async getAnnouncementList() {
      const {data: res} = await this.$http.post('/announcement/listMsAnnouncementTop', this.queryInfo)
      if (res.code !== 200) return this.$message.error(res.msg)
      this.announcementList = res.data.list
      this.total = res.data.total
    },
    async getColListTop() {
      const that = this
      const {data: res} = await this.$http.post('/collect/getdataTop', this.queryInfo)
      if (res.code !== 200) return this.$message.error('获取藏品信息失败')
      else{
        this.collectionData = res.data.list
        const title = []
        const view = []
        for(let i=0;i<this.collectionData.length;i++) {
          const c = this.collectionData[i]
          title.push(c.title)
          view.push(c.viewCnt)
        }
        const option = {
          xAxis: {
            type: 'category',
            data: title,
            axisLabel: {
              interval:0,//代表显示所有x轴标签显示
              rotate:45, //代表逆时针旋转45度
            }
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: view,
            type: 'bar',
            label: {
              show: true,
              position: 'top'
            }
          }]
        }
        this.chart1.setOption(option)
      }
    },
    async getFeedBackview() {
      const {data: res} = await this.$http.post('/feedBack/listFeedBackByUser', this.queryInfo)
      if (res.code !== 200) return this.$message.error(res.msg)
      this.feedbackData = res.data.list
      this.total = res.data.total
    }
  }
}
</script>

<style scoped>
.index-head-box {
  box-sizing: border-box;
  width: 100%;
  height: 250px;
  /*background-color: #889;*/
  padding: 5px;
  display: flex;
  margin-top: 15px;
}

.head-item {
  box-sizing: border-box;
  width: 33%;
  height: 100%;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  margin: 0 5px;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 1px 5px rgba(55, 122, 255, 0.3);
}

.item1 {
  box-sizing: border-box;
  margin-right: 5px;
  padding: 3px 0 3px 5px;
  background-color: #fff;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  overflow-y: scroll;
  height: 200px;
  border-bottom: 5px solid #fff;
}
.item1-i {
  background-color: #ccc;
  height: 60px;
  border-radius: 5px;
  /*overflow-y: auto;*/
  margin: 3px;
  padding: 5px;
  /*border: 1px solid #ccc;*/
  display: flex;
  width: calc(50% - 10px);
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  box-shadow: 0 0 2px rgba(0, 150, 255, 0.5);
  /*文字不换行*/
  white-space: nowrap;
  overflow: hidden;
  text-overflow:ellipsis;
  font-size: 12px;
}
.item2 {
  box-sizing: border-box;
  width: 100%;
  height: 200px;
  background-color: #fff;
  /*margin: 0 auto;*/
  overflow: hidden;
  text-align: center;
  padding: 0 10px;
}

.item2 img {
  box-sizing: border-box;
  height: 90%;
  /*margin: 10px 10px;*/
  margin: 10px auto;
  /*border-radius: 5px;*/
}

.item3 {
  box-sizing: border-box;
  padding: 10px;
}
.item3-text {
  font-size: 14px;
  color: #333;
}
.item3-date {
  font-size: 12px;
  color: #777;
  line-height: 24px;
}

/*盒子1：内部元素循环添加样式*/
.item1-red {
  background-color: #dff0d8;
  color: #3c763d;
}
.item1-blue {
  background-color: #d9edf7;
  color: #31708f;
}
.item1-yellow {
  background-color: #fcf8e3;
  color: #8a6d38;
}
.item1-pink {
  background-color: #f2dede;
  color: #a94442;
}

.title {
  height: 40px;
  line-height: 40px;
  text-align: center;
  overflow: hidden;
  background-color: #fff;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 14px;
  color: #444;
}

/*表格与折线图区域*/
.index-content-box {
  box-sizing: border-box;
  width: 100%;
  height: 400px;
  /*background-color: #999;*/
  margin: 15px 0 50px 0;
  padding: 10px;
  display: flex;
  /*box-shadow: 0 1px 5px rgba(55, 122, 255, 0.3);*/
}

.index-content-box-left {
  box-shadow: 0 1px 5px rgba(55, 122, 255, 0.3);
  width: 50%;
  height: 100%;
  background-color: #fff;
  border-bottom-left-radius: 5px;
  border-top-left-radius: 5px;
  overflow: hidden;
}
.table-box {
  border-right: 1px solid #eff0f2;
  padding: 0 10px;
  height: 300px;
  overflow: hidden;
  /*overflow-y: scroll;*/
}

.index-content-box-right {
  border-bottom-right-radius: 5px;
  border-top-right-radius: 5px;
  box-shadow: 0 1px 5px rgba(55, 122, 255, 0.3);
  width: 50%;
  height: 100%;
  background-color: #fff;
  overflow: hidden;
}

.column-title-box {
  margin: 5px 0 0 20px;
  /*border-left: 1px solid #999999;*/
}

.column-box {
  /*border-left: 1px solid #999999;*/
  height: 270px;
  width: 500px;
  overflow: hidden;
  background-color: #fff;
  margin: 0 auto;
}

.column-title {
  display: inline-block;
  border: 1px solid #97a8be;
  cursor: pointer;
  background-color: #ecf5ff;
  color: #777;
  padding: 3px;
  margin-top: 2px;
  border-radius: 3px;
  margin-right: 5px;
  font-size: 14px;
}

.column-title:hover {
  background-color: rgba(58, 125, 255, 0.77);
  color: #fff;
}
.column-title-active {
  background-color: rgba(58, 125, 255, 0.77);
  color: #fff;
}

</style>

import request from '@/utils/request'

// 获取首页统计数据
export function getStatistics() {
  return request({
    url: '/home/statistics',
    method: 'get'
  })
}

// 获取首页轮播图数据（从展览接口获取）
export function getCarouselList() {
  return request({
    url: '/exhibition/all',
    method: 'get'
  })
}

// 获取热门展览（从展览接口获取）
export function getHotExhibitions() {
  return request({
    url: '/exhibition/list',
    method: 'post',
    data: {
      pageNum: 1,
      pageSize: 3
    }
  })
}

// 获取最新活动
export function getLatestActivities() {
  return request({
    url: '/announcement/list',
    method: 'post',
    data: {
      pageNum: 1,
      pageSize: 2
    }
  })
}

// 获取用户评价
export function getVisitorReviews() {
  return request({
    url: '/feedback/list',
    method: 'post',
    data: {
      pageNum: 1,
      pageSize: 3
    }
  })
}

// 获取最近展览列表
export function getRecentExhibitions() {
  return request({
    url: '/home/recent-exhibitions',
    method: 'get'
  })
}

// 获取最近活动列表
export function getRecentEvents() {
  return request({
    url: '/home/recent-events',
    method: 'get'
  })
}

// 获取首页所有数据（综合接口）
export function getHomeData() {
  return request({
    url: '/home/all-data',
    method: 'get'
  })
} 
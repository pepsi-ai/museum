import request from '@/utils/request'

// 获取活动列表
export function getEventList(params) {
  return request({
    url: '/event/list',
    method: 'get',
    params
  })
}

// 获取活动详情
export function getEventDetail(id) {
  return request({
    url: `/event/${id}`,
    method: 'get'
  })
}

// 添加活动
export function addEvent(data) {
  return request({
    url: '/event',
    method: 'post',
    data
  })
}

// 更新活动
export function updateEvent(id, data) {
  return request({
    url: `/event/${id}`,
    method: 'put',
    data
  })
}

// 删除活动
export function deleteEvent(id) {
  return request({
    url: `/event/${id}`,
    method: 'delete'
  })
}

// 获取活动报名列表
export function getEventRegistrations(id) {
  return request({
    url: `/event/${id}/registrations`,
    method: 'get'
  })
}

// 审核活动报名
export function reviewEventRegistration(id, registrationId, data) {
  return request({
    url: `/event/${id}/registrations/${registrationId}/review`,
    method: 'put',
    data
  })
} 
import request from '@/utils/request'

/**
 * 获取用户预约列表
 * @param {Object} params 查询参数，包含userId
 * @returns {Promise} 返回请求结果
 */
export function getUserReservations(params) {
  return request({
    url: '/reserveDetail/listDetailReserve',
    method: 'post',
    data: params
  })
}

/**
 * 创建预约
 * @param {Object} data 预约数据
 * @returns {Promise} 返回请求结果
 */
export function createReservation(data) {
  return request({
    url: '/reserve/make',
    method: 'post',
    data
  })
}

/**
 * 取消预约
 * @param {Number} id 预约ID
 * @returns {Promise} 返回请求结果
 */
export function cancelReservation(id) {
  return request({
    url: `/reserve/delMsReserve/${id}`,
    method: 'get'
  })
}

/**
 * 获取预约详情
 * @param {Number} id 预约ID
 * @returns {Promise} 返回请求结果
 */
export function getReservationDetail(id) {
  return request({
    url: `/reserve/getInfo/${id}`,
    method: 'get'
  })
}

/**
 * 获取可预约时间段
 * @param {Number} exhibitionId 展览ID
 * @param {String} date 日期
 * @returns {Promise} 返回请求结果
 */
export function getReservationTimeSlots(exhibitionId, date) {
  return request({
    url: '/reserve/timeslots',
    method: 'get',
    params: {
      exhibitionId,
      date
    }
  })
} 
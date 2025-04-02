import request from '@/utils/request'

// 获取预约记录列表
export function getBookingRecords(params) {
  return request({
    url: '/booking/records',
    method: 'get',
    params
  })
}

// 取消预约
export function cancelBooking(id) {
  return request({
    url: `/booking/records/${id}/cancel`,
    method: 'post'
  })
}

// 获取电子票
export function getTicket(id) {
  return request({
    url: `/booking/records/${id}/ticket`,
    method: 'get',
    responseType: 'blob'
  })
}

// 创建预约
export function createBooking(data) {
  return request({
    url: '/booking/records',
    method: 'post',
    data
  })
}

// 获取可预约时间段
export function getAvailableTimeSlots(exhibitionId, date) {
  return request({
    url: '/booking/time-slots',
    method: 'get',
    params: {
      exhibitionId,
      date
    }
  })
}

// 检查预约人数限制
export function checkBookingLimit(exhibitionId, date, timeSlot) {
  return request({
    url: '/booking/check-limit',
    method: 'get',
    params: {
      exhibitionId,
      date,
      timeSlot
    }
  })
} 
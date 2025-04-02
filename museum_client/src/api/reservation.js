import {get, post} from '../util/request'

// 获取预约列表
export function listMsReserve(data) {
  return post('/reserve/listMsReserve', data)
}

// 获取带有藏品信息的预约列表
export function getReserveList(data) {
  return post('/reserve/getList', data)
}

// 添加获取预约详情的方法
export function getReserveInfo(id) {
  return get(`/reserve/getInfo/${id}`)
} 
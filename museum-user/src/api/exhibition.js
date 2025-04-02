import request from '@/utils/request'

// 获取展览列表
export function getExhibitionList(params) {
  return request({
    url: '/exhibition/list',
    method: 'post',
    data: params
  })
}

// 获取所有展览
export function getAllExhibitions() {
  return request({
    url: '/exhibition/all',
    method: 'get'
  })
}

// 获取展览详情
export function getExhibitionDetail(id) {
  return request({
    url: `/exhibition/detail/${id}`,
    method: 'get'
  })
}

// 添加展览
export function addExhibition(data) {
  return request({
    url: '/exhibition/add',
    method: 'post',
    data
  })
}

// 更新展览
export function updateExhibition(data) {
  return request({
    url: '/exhibition/update',
    method: 'post',
    data
  })
}

// 删除展览
export function deleteExhibition(id) {
  return request({
    url: '/exhibition/delete',
    method: 'post',
    data: { id }
  })
}

// 获取展览藏品列表
export function getExhibitionCollections(id) {
  return request({
    url: `/exhibition/collections/${id}`,
    method: 'get'
  })
}

// 获取所有藏品
export function getAllCollections() {
  return request({
    url: '/exhibition/collections',
    method: 'get'
  })
}

// 获取图片URL
export function getImageUrl(imgPath) {
  if (!imgPath) return 'https://placehold.co/600x400?text=展览图片'
  
  // 如果图片路径已经是完整URL，则直接返回
  if (imgPath.startsWith('http')) {
    return imgPath
  }
  
  const baseApiUrl = import.meta.env.VITE_APP_BASE_API || ''
  
  // 如果图片是上传的（包含时间戳格式的文件名）
  if (imgPath.match(/\d{8}_\d{6}/)) {
    return `${baseApiUrl}/file/getPic?name=${encodeURIComponent(imgPath)}`
  }
  
  // 对于其他图片，使用常规路径
  return `${baseApiUrl}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`
}

// 创建展览预约
export function createReservation(data) {
  return request({
    url: '/reservation/create',
    method: 'post',
    data
  })
}

// 获取用户的展览预约记录
export function getUserReservations(params) {
  return request({
    url: '/reservation/user',
    method: 'get',
    params
  })
}

// 取消预约
export function cancelReservation(id) {
  return request({
    url: `/reservation/cancel/${id}`,
    method: 'post'
  })
} 
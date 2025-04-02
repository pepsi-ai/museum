import request from '@/utils/request'

/**
 * 获取藏品列表
 * @param {Object} params 查询参数
 * @returns {Promise} 返回请求结果
 */
export function getCollectionList(params) {
  return request({
    url: '/collect/getdata',
    method: 'post',
    data: params
  })
}

/**
 * 获取藏品详情
 * @param {Number|String} id 藏品ID
 * @returns {Promise} 返回请求结果
 */
export function getCollectionDetail(id) {
  return request({
    url: `/collect/getdata`,
    method: 'post',
    data: { id: id }
  })
}

/**
 * 获取图片完整URL
 * @param {String} url 图片相对路径
 * @returns {String} 完整URL
 */
export function getImageUrl(url) {
  if (!url) {
    return 'https://placehold.co/600x400?text=无图片'
  }
  
  // 如果已经是完整URL，直接返回
  if (url.startsWith('http')) {
    return url
  }
  
  // 如果是Base64图片数据
  if (url.startsWith('data:image')) {
    return url
  }
  
  const baseApiUrl = import.meta.env.VITE_APP_BASE_API || ''
  
  // 处理上传的图片文件（格式如：20230412_123456.jpg）
  if (url.match(/\d{8}_\d{6}/)) {
    return `${baseApiUrl}/file/getPic?name=${encodeURIComponent(url)}`
  }
  
  // 处理相对路径，确保路径格式正确
  return `${baseApiUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

// 获取所有藏品分类
export function getAllCategories() {
  return request({
    url: '/collection/categories',
    method: 'get'
  })
}

// 获取所有藏品材质
export function getAllMaterials() {
  return request({
    url: '/collection/materials',
    method: 'get'
  })
}

// 获取所有藏品年代
export function getAllEras() {
  return request({
    url: '/collection/eras',
    method: 'get'
  })
}

/**
 * 收藏藏品
 * @param {Number|String} id 藏品ID
 * @returns {Promise} 返回请求结果
 */
export function collectArtifact(id) {
  return request({
    url: '/collection/collect',
    method: 'post',
    data: { collId: id }
  })
}

/**
 * 取消收藏藏品
 * @param {Number|String} id 藏品ID
 * @returns {Promise} 返回请求结果
 */
export function uncollectArtifact(id) {
  return request({
    url: '/collection/uncollect',
    method: 'post',
    data: { collId: id }
  })
}

// 获取用户收藏的藏品
export function getUserCollections() {
  return request({
    url: '/collection/user-collections',
    method: 'get'
  })
}

// 添加藏品
export function addCollection(data) {
  return request({
    url: '/collection',
    method: 'post',
    data
  })
}

// 更新藏品
export function updateCollection(id, data) {
  return request({
    url: `/collection/${id}`,
    method: 'put',
    data
  })
}

// 删除藏品
export function deleteCollection(id) {
  return request({
    url: `/collection/${id}`,
    method: 'delete'
  })
}

// 上传藏品图片
export function uploadCollectionImage(data) {
  return request({
    url: '/collection/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取收藏列表
 * @param {Object} params 查询参数
 * @returns {Promise} 返回请求结果
 */
export function getCollectList(params) {
  return request({
    url: '/collection/collectList',
    method: 'post',
    data: params
  })
} 
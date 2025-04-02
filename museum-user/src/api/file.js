import request from '@/utils/request'

// 上传文件
export function uploadFile(data) {
  return request({
    url: '/file/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除文件
export function deleteFile(id) {
  return request({
    url: `/file/${id}`,
    method: 'delete'
  })
}

// 获取文件列表
export function getFileList(params) {
  return request({
    url: '/file/list',
    method: 'get',
    params
  })
} 
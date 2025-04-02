import request from '@/utils/request'

// 用户登录
export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

// 用户注册
export function register(data) {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

// 获取用户详细信息（包含手机号和注册时间）
export function getUserDetailInfo(userId) {
  return request({
    url: '/user/getdata',
    method: 'post',
    data: { 
      name: "",
      current: 1,
      size: 1,
      id: userId
    }
  })
}

// 编辑用户信息
export function editUserInfo(data) {
  return request({
    url: '/user/editUserInfo',
    method: 'post',
    data
  })
}

// 修改用户信息
export function updateUserInfo(data) {
  return request({
    url: '/user/update',
    method: 'post',
    data
  })
}

// 修改密码
export function updatePassword(data) {
  return request({
    url: '/user/password',
    method: 'post',
    data
  })
}

// 重置密码
export function resetPassword(data) {
  return request({
    url: '/user/reset-password',
    method: 'post',
    data
  })
}

// 退出登录
export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

// 获取用户列表（管理员功能）
export function getUserList(data) {
  return request({
    url: '/user/getdata',
    method: 'post',
    data
  })
}

// 删除用户（管理员功能）
export function deleteUser(id) {
  return request({
    url: '/user/deluser',
    method: 'post',
    data: { id }
  })
}

// 实名认证
export function verifyIdentity(data) {
  return request({
    url: '/user/verify',
    method: 'post',
    data
  })
}

// 上传头像
export function uploadAvatar(data) {
  return request({
    url: '/user/avatar',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
} 
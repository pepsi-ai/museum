// 存储token的key
const TokenKey = 'token'

// 获取token
export function getToken() {
  return localStorage.getItem(TokenKey)
}

// 设置token
export function setToken(token) {
  return localStorage.setItem(TokenKey, token)
}

// 删除token
export function removeToken() {
  return localStorage.removeItem(TokenKey)
}

// 存储用户信息的key
const UserInfoKey = 'userInfo'

// 获取用户信息
export function getUserInfo() {
  const userInfo = localStorage.getItem(UserInfoKey)
  return userInfo ? JSON.parse(userInfo) : {}
}

// 设置用户信息
export function setUserInfo(userInfo) {
  return localStorage.setItem(UserInfoKey, JSON.stringify(userInfo))
}

// 删除用户信息
export function removeUserInfo() {
  return localStorage.removeItem(UserInfoKey)
} 
import { useUserStore } from '@/stores/user'

/**
 * 检查用户是否有权限
 * @param {String|Array} permission 权限标识
 * @returns {Boolean} 是否有权限
 */
export function hasPermission(permission) {
  const userStore = useUserStore()
  const { permissions } = userStore.userInfo
  
  if (!permissions || permissions.length === 0) {
    return false
  }
  
  // 超级管理员拥有所有权限
  if (permissions.includes('*')) {
    return true
  }
  
  if (typeof permission === 'string') {
    return permissions.includes(permission)
  }
  
  if (Array.isArray(permission)) {
    return permission.some(item => permissions.includes(item))
  }
  
  return false
}

/**
 * 检查用户是否有角色
 * @param {String|Array} role 角色标识
 * @returns {Boolean} 是否有角色
 */
export function hasRole(role) {
  const userStore = useUserStore()
  const { roles } = userStore.userInfo
  
  if (!roles || roles.length === 0) {
    return false
  }
  
  // 超级管理员拥有所有角色
  if (roles.includes('admin')) {
    return true
  }
  
  if (typeof role === 'string') {
    return roles.includes(role)
  }
  
  if (Array.isArray(role)) {
    return role.some(item => roles.includes(item))
  }
  
  return false
} 
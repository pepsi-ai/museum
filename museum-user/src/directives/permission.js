import { hasPermission, hasRole } from '@/utils/permission'

/**
 * 权限指令
 * v-permission="'user:add'"
 * v-permission="['user:add', 'user:edit']"
 */
export const permission = {
  mounted(el, binding) {
    const { value } = binding
    if (value && value.length > 0) {
      const hasAuth = hasPermission(value)
      if (!hasAuth) {
        el.parentNode?.removeChild(el)
      }
    }
  }
}

/**
 * 角色指令
 * v-role="'admin'"
 * v-role="['admin', 'editor']"
 */
export const role = {
  mounted(el, binding) {
    const { value } = binding
    if (value && value.length > 0) {
      const hasAuth = hasRole(value)
      if (!hasAuth) {
        el.parentNode?.removeChild(el)
      }
    }
  }
}

// 注册所有指令
export default {
  install(app) {
    app.directive('permission', permission)
    app.directive('role', role)
  }
}
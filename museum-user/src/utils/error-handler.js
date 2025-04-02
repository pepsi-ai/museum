import { ElMessage, ElNotification } from 'element-plus'

/**
 * 全局错误处理函数
 * @param {Error} error - 捕获的错误对象
 * @param {Vue} vm - Vue实例（可选）
 * @param {String} info - Vue 特定的错误信息，比如错误是在哪个生命周期钩子中被捕获的（可选）
 */
const errorHandler = (error, vm, info) => {
  // 忽略ResizeObserver相关错误
  if (error && error.message && error.message.includes('ResizeObserver')) {
    console.warn('ResizeObserver错误被忽略:', error.message)
    return
  }
  
  // 处理其他类型的错误
  console.error('应用错误:', error)
  
  // 在生产环境中，可以把错误信息发送到服务器
  if (process.env.NODE_ENV === 'production') {
    // TODO: 发送错误到服务器
  } else {
    // 在开发环境中显示通知
    ElNotification({
      title: '错误',
      message: `${error.message || '未知错误'} ${info ? `(在 ${info} 中)` : ''}`,
      type: 'error',
      duration: 5000
    })
  }
}

/**
 * 设置全局错误处理
 * @param {Vue} app - Vue 3 应用实例
 */
export const setupErrorHandler = (app) => {
  // 设置Vue全局错误处理
  app.config.errorHandler = errorHandler
  
  // 设置全局Promise未捕获错误处理
  window.addEventListener('unhandledrejection', event => {
    // 忽略ResizeObserver相关错误
    if (event.reason && event.reason.message && event.reason.message.includes('ResizeObserver')) {
      console.warn('ResizeObserver Promise错误被忽略:', event.reason.message)
      event.preventDefault()
      return
    }
    
    console.error('未处理的Promise拒绝:', event.reason)
    
    // 在生产环境中，可以把错误信息发送到服务器
    if (process.env.NODE_ENV === 'production') {
      // TODO: 发送错误到服务器
    }
  })
  
  // 设置全局JS错误处理
  window.onerror = (message, source, lineno, colno, error) => {
    // 忽略ResizeObserver相关错误
    if (message && message.toString().includes('ResizeObserver')) {
      console.warn('ResizeObserver JS错误被忽略:', message)
      return true // 阻止默认处理
    }
    
    console.error('全局JS错误:', { message, source, lineno, colno, error })
    
    // 在生产环境中，可以把错误信息发送到服务器
    if (process.env.NODE_ENV === 'production') {
      // TODO: 发送错误到服务器
    }
    
    return false // 允许默认处理
  }
} 
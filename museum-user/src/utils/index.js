/**
 * 格式化时间
 * @param {Date} time 时间对象
 * @param {String} format 格式化模式
 * @returns {String} 格式化后的时间字符串
 */
export function formatDate(time, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!time) return ''
  
  const date = new Date(time)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()
  
  const formatObj = {
    YYYY: year,
    MM: month.toString().padStart(2, '0'),
    DD: day.toString().padStart(2, '0'),
    HH: hours.toString().padStart(2, '0'),
    mm: minutes.toString().padStart(2, '0'),
    ss: seconds.toString().padStart(2, '0')
  }
  
  return format.replace(/(YYYY|MM|DD|HH|mm|ss)/g, (match) => formatObj[match])
}

/**
 * 防抖函数
 * @param {Function} fn 需要防抖的函数
 * @param {Number} delay 延迟时间
 * @returns {Function} 防抖后的函数
 */
export function debounce(fn, delay = 300) {
  let timer = null
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param {Function} fn 需要节流的函数
 * @param {Number} delay 延迟时间
 * @returns {Function} 节流后的函数
 */
export function throttle(fn, delay = 300) {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

/**
 * 深拷贝
 * @param {Object|Array} obj 需要拷贝的对象或数组
 * @returns {Object|Array} 拷贝后的对象或数组
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  
  const copy = Array.isArray(obj) ? [] : {}
  
  Object.keys(obj).forEach(key => {
    copy[key] = deepClone(obj[key])
  })
  
  return copy
}

/**
 * 获取页面标题
 * @param {String} pageTitle 页面标题
 * @returns {String} 完整的页面标题
 */
export function getPageTitle(pageTitle) {
  const appTitle = import.meta.env.VITE_APP_TITLE || '博物馆管理系统'
  if (pageTitle) {
    return `${pageTitle} - ${appTitle}`
  }
  return appTitle
} 
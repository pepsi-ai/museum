/**
 * 系统配置
 */
export default {
  /**
   * 网站标题
   */
  title: import.meta.env.VITE_APP_TITLE,
  
  /**
   * 是否显示设置
   */
  showSettings: true,
  
  /**
   * 是否固定头部
   */
  fixedHeader: true,
  
  /**
   * 是否显示侧边栏Logo
   */
  sidebarLogo: true,
  
  /**
   * 是否显示标签栏
   */
  tagsView: true,
  
  /**
   * 上传文件大小限制（MB）
   */
  uploadSizeLimit: 5,
  
  /**
   * 上传文件允许的类型
   */
  uploadAllowTypes: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
  
  /**
   * 表格默认分页大小
   */
  defaultPageSize: 10,
  
  /**
   * 表格可选分页大小
   */
  pageSizes: [10, 20, 30, 50]
} 
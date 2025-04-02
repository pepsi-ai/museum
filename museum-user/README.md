# 博物馆管理系统 - 前端

## 项目介绍

博物馆管理系统的前端部分，基于Vue 3、Vite、Element Plus等技术栈开发。

## 功能特性

- 用户认证：登录、注销、修改密码等
- 藏品管理：藏品添加、编辑、查询、删除等
- 展览管理：展览添加、编辑、查询、删除等
- 活动管理：活动添加、编辑、查询、删除等
- 统计分析：数据统计、图表展示等

## 技术栈

- Vue 3：渐进式JavaScript框架
- Vite：下一代前端构建工具
- Vue Router：路由管理
- Pinia：状态管理
- Element Plus：基于Vue 3的UI组件库
- Axios：HTTP客户端
- Sass：CSS预处理器

## 开发环境

- Node.js >= 16.0.0
- npm >= 8.0.0

## 目录结构

```
museum-user
├── public            # 静态资源
├── src               # 源代码
│   ├── api           # API接口
│   ├── assets        # 静态资源
│   ├── components    # 公共组件
│   ├── config        # 全局配置
│   ├── directives    # 自定义指令
│   ├── hooks         # 自定义钩子
│   ├── layout        # 布局组件
│   ├── router        # 路由
│   ├── stores        # 状态管理
│   ├── styles        # 全局样式
│   ├── utils         # 工具函数
│   ├── views         # 页面
│   ├── App.vue       # 根组件
│   └── main.js       # 入口文件
├── .env              # 环境变量
├── .env.production   # 生产环境变量
├── vite.config.js    # Vite配置
└── package.json      # 项目依赖
```

## 安装与运行

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 开发规范

- 代码格式化：使用ESLint + Prettier
- 组件命名：使用Pascal命名法（如UserList.vue）
- CSS类命名：使用kebab-case（如user-list）
- Git提交信息：遵循Angular规范

## 浏览器支持

- Chrome
- Firefox
- Safari
- Edge

## 许可证

[MIT](LICENSE)

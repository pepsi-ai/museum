# 博物馆管理系统后端API文档

## 一、系统概述

本系统是博物馆管理后端系统，基于Spring Boot和MyBatis-Plus开发，提供用户管理、展览管理、藏品管理、预约管理等功能。

## 二、接口基础信息

### Base URL

- 开发环境: `http://localhost:8090/api`
- 测试环境: `http://test-server:8090/api`
- 生产环境: `http://server:8090/api`

所有API请求都应该使用上述基础URL加上各接口的路径。例如，用户登录的完整URL为：`http://server:8090/api/user/login`

### 鉴权方式

系统采用基于token的鉴权方式，登录成功后返回的token需要在后续请求的Header中携带：

Authorization: Bearer {token}

## 三、技术栈

- Java 8
- Spring Boot 2.6.14
- MySQL数据库
- MyBatis-Plus 3.4.3
- Knife4j（API文档）
- Lombok
- Hutool工具包

## 四、接口列表
## 0.JsonResult - 常规接口响应结构
java
{
    "code": 200,      // 状态码，200成功，其他为失败
    "msg": "成功",     // 响应消息
    "data": {}        // 响应数据
}

3. 更正分页响应结构：
markdown
### PageResult - 分页查询响应结构
java
{
    "total": 100,     // 总条数
    "pages": 10,      // 总页码数
    "list": []        // 当前页数据
}


markdown
| 接口路径 | 请求方式 | 功能描述 |
|--------|---------|--------|
| /file/uploadFile | POST | 上传文件 |


### 1. 用户管理接口（UserController）

| 接口路径 | 请求方式 | 功能描述 | 请求参数 | 响应结果 |
|--------|---------|--------|--------|--------|
| /user/getdata | POST | 获取用户列表（分页） | PageQuery对象 | 用户列表分页数据 |
| /user/login | POST | 用户登录 | MsUser对象(username, password) | 登录用户信息 |
| /user/register | POST | 用户注册 | MsUser对象 | 注册结果 |
| /user/editUserInfo | POST | 编辑用户信息 | MsUser对象 | 编辑结果 |
| /user/deluser | POST | 删除用户 | MsUser对象(id) | 删除结果 |

### 2. 展览管理接口（ExhibitionController）

| 接口路径 | 请求方式 | 功能描述 | 请求参数 | 响应结果 |
|--------|---------|--------|--------|--------|
| /exhibition/list | POST | 分页查询展览列表 | PageQuery对象 | 展览列表分页数据 |
| /exhibition/all | GET | 获取所有展览列表 | 无 | 所有展览列表 |
| /exhibition/detail/{id} | GET | 获取展览详情 | 路径参数:id | 展览详情 |
| /exhibition/add | POST | 添加展览 | MsExhibition对象 | 添加结果 |
| /exhibition/update | POST | 更新展览信息 | MsExhibition对象 | 更新结果 |
| /exhibition/delete | POST | 删除展览 | Map<String,Integer>(id) | 删除结果 |
| /exhibition/collections | GET | 获取所有藏品（用于展览选择） | 无 | 所有藏品列表 |
| /exhibition/collections/{exhibitionId} | GET | 获取展览关联的藏品 | 路径参数:exhibitionId | 关联藏品列表 |

### 3. 藏品管理接口（CollectionController）

| 接口路径 | 请求方式 | 功能描述 | 请求参数 | 响应结果 |
|--------|---------|--------|--------|--------|
| /collection/list | POST | 分页查询藏品列表 | PageQuery对象 | 藏品列表分页数据 |
| /collection/getInfo/{id} | GET | 获取藏品详情 | 路径参数:id | 藏品详情 |
| /collection/add | POST | 添加藏品 | MsCollection对象 | 添加结果 |
| /collection/update | POST | 更新藏品信息 | MsCollection对象 | 更新结果 |
| /collection/delete | POST | 删除藏品 | Map<String,Integer>(id) | 删除结果 |

### 4. 预约管理接口（ReserveController）

| 接口路径 | 请求方式 | 功能描述 | 请求参数 | 响应结果 |
|--------|---------|--------|--------|--------|
| /reserve/listMsReserve | POST | 获取预约列表 | ReserveQuery对象 | 预约列表分页数据 |
| /reserve/addMsReserve | POST | 添加预约 | MsReserve对象 | 添加结果 |
| /reserve/editMsReserve | POST | 编辑预约信息 | MsReserve对象 | 编辑结果 |
| /reserve/delMsReserve/{id} | GET | 删除预约 | 路径参数:id | 删除结果 |
| /reserve/timeslots | GET | 获取可预约时间段 | 无 | 可预约时间段列表 |
| /reserve/getInfo/{id} | GET | 获取预约详情 | 路径参数:id | 预约详情 |
| /reserve/getList | POST | 获取预约列表（筛选） | 筛选条件 | 预约列表 |
| /reserve/refreshBookedSlots | GET | 刷新已预约名额 | 无 | 刷新结果 |
| /reserve/getUserReserve | POST | 获取用户预约记录 | 用户ID | 用户预约记录 |
| /reserve/make | POST | 创建预约 | 预约信息 | 创建结果 |

### 5. 反馈管理接口（FeedBackController）

| 接口路径 | 请求方式 | 功能描述 | 请求参数 | 响应结果 |
|--------|---------|--------|--------|--------|
| /feedback/list | POST | 分页查询反馈列表 | PageQuery对象 | 反馈列表分页数据 |
| /feedback/add | POST | 添加反馈 | 反馈信息 | 添加结果 |
| /feedback/getInfo/{id} | GET | 获取反馈详情 | 路径参数:id | 反馈详情 |
| /feedback/update | POST | 更新反馈 | 反馈信息 | 更新结果 |
| /feedback/delete | POST | 删除反馈 | 反馈ID | 删除结果 |

### 6. 公告管理接口（AnnouncementController）

| 接口路径 | 请求方式 | 功能描述 | 请求参数 | 响应结果 |
|--------|---------|--------|--------|--------|
| /announcement/list | POST | 分页查询公告列表 | PageQuery对象 | 公告列表分页数据 |
| /announcement/add | POST | 添加公告 | 公告信息 | 添加结果 |
| /announcement/getInfo/{id} | GET | 获取公告详情 | 路径参数:id | 公告详情 |
| /announcement/update | POST | 更新公告 | 公告信息 | 更新结果 |
| /announcement/delete | POST | 删除公告 | 公告ID | 删除结果 |

### 7. 管理员接口（AdminController）

| 接口路径 | 请求方式 | 功能描述 | 请求参数 | 响应结果 |
|--------|---------|--------|--------|--------|
| /admin/login | POST | 管理员登录 | 登录信息 | 登录结果 |
| /admin/list | POST | 分页查询管理员列表 | PageQuery对象 | 管理员列表分页数据 |
| /admin/add | POST | 添加管理员 | 管理员信息 | 添加结果 |
| /admin/update | POST | 更新管理员信息 | 管理员信息 | 更新结果 |
| /admin/delete | POST | 删除管理员 | 管理员ID | 删除结果 |

### 8. 文件管理接口（FileController）

| 接口路径 | 请求方式 | 功能描述 | 请求参数 | 响应结果 |
|--------|---------|--------|--------|--------|
| /file/upload | POST | 上传文件 | MultipartFile文件 | 上传结果及文件路径 |
| /file/download | GET | 下载文件 | 文件路径 | 文件流 |

### 9. 字典管理接口（DicController）

| 接口路径 | 请求方式 | 功能描述 | 请求参数 | 响应结果 |
|--------|---------|--------|--------|--------|
| /dic/list | POST | 分页查询字典列表 | PageQuery对象 | 字典列表分页数据 |
| /dic/getByType | GET | 根据类型获取字典 | 字典类型 | 字典数据 |
| /dic/add | POST | 添加字典 | 字典信息 | 添加结果 |
| /dic/update | POST | 更新字典 | 字典信息 | 更新结果 |
| /dic/delete | POST | 删除字典 | 字典ID | 删除结果 |

### 10. 点赞管理接口（LikeController）

| 接口路径 | 请求方式 | 功能描述 | 请求参数 | 响应结果 |
|--------|---------|--------|--------|--------|
| /like/add | POST | 添加点赞 | 点赞信息 | 添加结果 |
| /like/cancel | POST | 取消点赞 | 点赞ID | 取消结果 |
| /like/list | POST | 查询点赞列表 | 查询条件 | 点赞列表 |
| /like/count | GET | 获取点赞数量 | 内容ID,类型 | 点赞数量 |

## 五、主要数据模型

### 1. 用户(MsUser)

用户实体类，包含用户基本信息
- id: 用户ID
- username: 用户名
- password: 密码
- nickname: 昵称
- avatar: 头像
- phone: 手机号
- email: 邮箱
- status: 状态
- createTime: 创建时间

### 2. 展览(MsExhibition)

展览信息实体类
- id: 展览ID
- title: 展览标题
- description: 展览描述
- startDate: 开始日期
- endDate: 结束日期
- location: 展览地点
- status: 展览状态（upcoming/ongoing/ended）
- colPic: 展览主图路径
- crtTm: 创建时间
- collectionIds: 关联的藏品ID列表

### 3. 藏品(MsCollection)

藏品信息实体类
- id: 藏品ID
- title: 藏品标题
- origin: 来源
- cateId: 分类ID
- desColl: 藏品描述
- colPic: 藏品图片路径
- base: 藏品基座
- displayRoom: 展示厅
- crtTm: 创建时间
- viewCnt: 浏览次数

### 4. 预约(MsReserve)

预约信息实体类
- id: 预约ID
- title: 预约标题
- exhibitionId: 关联展览ID
- description: 预约描述
- resDate: 预约日期
- resTime: 预约时间
- totalSlots: 总名额
- bookedSlots: 已预约名额
- status: 状态
- crtTm: 创建时间

### 5. 预约时间段(MsReserveTimes)

预约时间段实体类
- id: 时间段ID
- reserveId: 关联预约ID
- resDate: 预约日期
- resTime: 预约时间
- resSession: 场次
- totalSlots: 总名额
- bookedSlots: 已预约名额
- status: 状态

### 6. 公告(MsAnnouncement)

公告实体类
- id: 公告ID
- title: 公告标题
- content: 公告内容
- publishTime: 发布时间
- status: 状态

### 7. 反馈(MsFeedback)

反馈实体类
- id: 反馈ID
- userId: 用户ID
- content: 反馈内容
- contactInfo: 联系方式
- status: 处理状态
- reply: 回复内容
- createTime: 创建时间

## 六、响应结构

系统使用统一的响应结构：

### 1. JsonResult - 常规接口响应结构

```java
{
    "status": 200,      // 状态码，200成功，其他为失败
    "message": "成功",   // 响应消息
    "data": {}          // 响应数据
}
```

### 2. PageResult - 分页查询响应结构

```java
{
    "total": 100,       // 总记录数
    "rows": [],         // 当前页数据
    "pageNum": 1,       // 当前页码
    "pageSize": 10,     // 每页大小
    "pages": 10         // 总页数
}
```

## 七、系统特性

1. 跨域支持：部分接口通过@CrossOrigin注解支持跨域请求
2. 接口文档：集成Knife4j提供API文档，访问路径：/doc.html
3. 分页查询：支持按条件分页查询数据
4. 统一异常处理：全局异常处理确保接口响应一致性
5. 文件上传：支持图片等文件上传功能
6. 数据库连接池：使用高性能连接池
7. SQL监控：使用p6spy进行SQL监控

## 八、部署说明

1. 系统打包为WAR包，部署名称为back_server
2. 可部署在Tomcat等Servlet容器中运行
3. 数据库配置在application.yml中，使用MySQL数据库
4. 文件上传配置：默认上传目录为项目根目录下的upload文件夹
5. 日志配置：使用Spring Boot默认日志配置 
/*
 Navicat Premium Dump SQL

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80040 (8.0.40)
 Source Host           : localhost:3306
 Source Schema         : museum_db

 Target Server Type    : MySQL
 Target Server Version : 80040 (8.0.40)
 File Encoding         : 65001

 Date: 24/03/2025 09:56:44
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for ms_admin
-- ----------------------------
DROP TABLE IF EXISTS `ms_admin`;
CREATE TABLE `ms_admin`  (
  `id` int NOT NULL COMMENT '管理员id',
  `username` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '用户名',
  `password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '密码',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '管理员' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of ms_admin
-- ----------------------------
INSERT INTO `ms_admin` VALUES (1, 'admin', '123456');

-- ----------------------------
-- Table structure for ms_announcement
-- ----------------------------
DROP TABLE IF EXISTS `ms_announcement`;
CREATE TABLE `ms_announcement`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '公告id',
  `title` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '主题',
  `content_text` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL COMMENT '内容',
  `date` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '时间',
  `is_top` varchar(5) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '是否置顶',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 24 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '公告' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of ms_announcement
-- ----------------------------
INSERT INTO `ms_announcement` VALUES (8, '测试', '<p>测试公告是否正常</p>', '2025/02/09 22:41:17', '0');
INSERT INTO `ms_announcement` VALUES (23, '欢迎来到线上博物馆', '', '2025/02/09 22:41:34', '1');

-- ----------------------------
-- Table structure for ms_cate
-- ----------------------------
DROP TABLE IF EXISTS `ms_cate`;
CREATE TABLE `ms_cate`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '分类id',
  `catename` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '分类名称',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 19 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '藏品分类' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of ms_cate
-- ----------------------------
INSERT INTO `ms_cate` VALUES (4, '石刻');
INSERT INTO `ms_cate` VALUES (5, '壁画');
INSERT INTO `ms_cate` VALUES (6, '石器');
INSERT INTO `ms_cate` VALUES (7, '玉器');
INSERT INTO `ms_cate` VALUES (8, '陶器');
INSERT INTO `ms_cate` VALUES (9, '铜器');
INSERT INTO `ms_cate` VALUES (10, '铁器');
INSERT INTO `ms_cate` VALUES (11, '瓷器');
INSERT INTO `ms_cate` VALUES (12, '骨角牙器');
INSERT INTO `ms_cate` VALUES (13, '书法');
INSERT INTO `ms_cate` VALUES (14, '绘画');
INSERT INTO `ms_cate` VALUES (15, '油画');
INSERT INTO `ms_cate` VALUES (17, '金银器');
INSERT INTO `ms_cate` VALUES (18, '明星藏品');

-- ----------------------------
-- Table structure for ms_collection
-- ----------------------------
DROP TABLE IF EXISTS `ms_collection`;
CREATE TABLE `ms_collection`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '藏品id',
  `title` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '主题',
  `origin` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '起源时期',
  `cate_id` varchar(11) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '分类id',
  `des_coll` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '介绍',
  `col_pic` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '图片',
  `base` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '基础信息',
  `view_cnt` int NULL DEFAULT NULL COMMENT '查看次数',
  `display_room` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '所属展厅',
  `crt_tm` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '发布时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 128 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '藏品' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of ms_collection
-- ----------------------------
INSERT INTO `ms_collection` VALUES (124, '兽面纹铜方鼎', '西周', '铜器', '<p>“兽面纹铜方鼎”是一种古代青铜器。它以方形的鼎为基本造型，表面装饰有兽面纹。这种纹饰通常以对称的夔龙为基础，形成类似兽面的图案，具有神秘和威严的风格，反映了商周时期人们的宗教信仰和审美观念。铜方鼎不仅是用于烹饪或祭祀的器具，还具有重要的礼仪和象征意义，其规格和使用场合往往与使用者的身份地位密切相关。</p>', '20250306_2039034.jpg', '商周时期青铜文化的典型代表，反映了当时高超的青铜铸造技术和深厚的文化内涵，是研究古代社会历史、宗教、艺术的重要实物资料。', 131, '展厅一', '2025/03/07 18:44:36');
INSERT INTO `ms_collection` VALUES (125, '酱褐釉网格纹四系瓷罐', '东汉', '瓷器', '<p>酱褐釉网格纹四系瓷罐是一种古代陶瓷器物。它以酱褐色的釉面为特色，呈现出古朴沉稳的色泽。罐体表面装饰有网格纹，这种几何图案由纵横交错的线条构成，具有装饰性和可能的文化寓意。此外，瓷罐肩部或上腹部设有四个系，用于系绳，兼具实用性和美观性，体现了古代陶瓷工艺在功能与审美上的巧妙结合。</p>', '20250306_20413569.jpg', '酱褐釉网格纹四系瓷罐是东汉时期陶瓷艺术的杰出代表，具有重要的历史、艺术和科学价值。', 6, '展厅二', '2025/03/07 18:44:49');
INSERT INTO `ms_collection` VALUES (126, '青瓷双耳簋', '西周', '瓷器', '<p>“青瓷双耳簋”是一种古代陶瓷制品，其表面施以青色釉，呈现出清新素雅的色泽。它因有两个耳状附着物而得名“双耳”，这种设计既方便使用，又具有装饰性。簋本身是一种古代的食器，主要用于盛放食物，在祭祀和宴飨等场合中具有重要用途，是古代饮食文化的重要组成部分。</p>', '20250306_20441843.jpg', '青瓷双耳簋是一种模仿古代青铜簋制作的陶瓷器', 3, '展厅二', '2025/03/07 18:45:01');
INSERT INTO `ms_collection` VALUES (127, '“子申父己”铜鼎', '商代', '铜器', '<p>“子申父己”铜鼎是一件珍贵的青铜器，其名称来源于器物上的铭文“子申父己”，这可能是器主的名字或与器主相关的称谓。这种铜鼎主要用于古代贵族的祭祀活动，是重要的礼仪用器。它的出土不仅反映了当时社会的礼仪制度，还体现了高超的青铜铸造工艺，具有重要的历史和艺术价值。</p>', '20250306_20501496.jpg', '“子申父己”铜鼎是商代晚期青铜文化的杰出代表，其精美的工艺和独特的纹饰体现了商代高度发达的青铜铸造技术和社会文化特征。', 3, '展厅一', '2025/03/07 18:45:12');

-- ----------------------------
-- Table structure for ms_dic
-- ----------------------------
DROP TABLE IF EXISTS `ms_dic`;
CREATE TABLE `ms_dic`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `dic_typ` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `dic_desc` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `dic_value` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '注册时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 49 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '字典值' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of ms_dic
-- ----------------------------
INSERT INTO `ms_dic` VALUES (25, '展厅类别', '', '展厅一');
INSERT INTO `ms_dic` VALUES (26, '展厅类别', '', '展厅二');
INSERT INTO `ms_dic` VALUES (28, '展厅类别', '', '展厅三');
INSERT INTO `ms_dic` VALUES (29, '藏品分类', '石刻', '石刻');
INSERT INTO `ms_dic` VALUES (30, '藏品分类', '壁画', '壁画');
INSERT INTO `ms_dic` VALUES (31, '藏品分类', '石器', '石器');
INSERT INTO `ms_dic` VALUES (32, '藏品分类', '玉器', '玉器');
INSERT INTO `ms_dic` VALUES (33, '藏品分类', '陶器', '陶器');
INSERT INTO `ms_dic` VALUES (34, '藏品分类', '铜器', '铜器');
INSERT INTO `ms_dic` VALUES (35, '藏品分类', '铁器', '铁器');
INSERT INTO `ms_dic` VALUES (36, '藏品分类', '瓷器', '瓷器');
INSERT INTO `ms_dic` VALUES (37, '藏品分类', '骨角牙器', '骨角牙器');
INSERT INTO `ms_dic` VALUES (38, '藏品分类', '书法', '书法');
INSERT INTO `ms_dic` VALUES (39, '藏品分类', '绘画', '绘画');
INSERT INTO `ms_dic` VALUES (40, '藏品分类', '油画', '油画');
INSERT INTO `ms_dic` VALUES (41, '藏品分类', '金银器', '金银器');
INSERT INTO `ms_dic` VALUES (42, '藏品分类', '明星藏品', '明星藏品');
INSERT INTO `ms_dic` VALUES (43, '藏品分类', '', '青铜器');
INSERT INTO `ms_dic` VALUES (44, '展厅类别', '', '展厅四');
INSERT INTO `ms_dic` VALUES (45, '预约类型', '', '解说预约');
INSERT INTO `ms_dic` VALUES (46, '预约类型', '', '展览预约');
INSERT INTO `ms_dic` VALUES (47, '预约场次', '上午场', '第一场');
INSERT INTO `ms_dic` VALUES (48, '预约场次', '下午场', '第二场');

-- ----------------------------
-- Table structure for ms_exhibition
-- ----------------------------
DROP TABLE IF EXISTS `ms_exhibition`;
CREATE TABLE `ms_exhibition`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '展览标题',
  `description` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL COMMENT '展览描述',
  `start_date` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '开始日期',
  `end_date` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '结束日期',
  `location` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '展览地点',
  `status` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT 'upcoming' COMMENT '展览状态：upcoming(即将开始), ongoing(进行中), ended(已结束)',
  `col_pic` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '展览主图路径',
  `crt_tm` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '展览信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of ms_exhibition
-- ----------------------------
INSERT INTO `ms_exhibition` VALUES (13, '一号厅', '红红火火恍恍惚惚', '2025-03-24', '2026-03-24', '一号厅', 'upcoming', '20250324_09381944.jpeg', '2025/03/24 09:38:23');
INSERT INTO `ms_exhibition` VALUES (14, '二号厅', '测试', '2025-03-24', '2026-03-24', '二号厅', 'upcoming', '20250324_0940064.jpeg', '2025/03/24 09:40:10');

-- ----------------------------
-- Table structure for ms_exhibition_collection
-- ----------------------------
DROP TABLE IF EXISTS `ms_exhibition_collection`;
CREATE TABLE `ms_exhibition_collection`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `exhibition_id` int NOT NULL COMMENT '展览ID',
  `collection_id` int NOT NULL COMMENT '藏品ID',
  `crt_tm` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_exhibition_collection`(`exhibition_id` ASC, `collection_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 49 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '展览藏品关系表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of ms_exhibition_collection
-- ----------------------------
INSERT INTO `ms_exhibition_collection` VALUES (27, 8, 124, '2025/03/14 20:09:16');
INSERT INTO `ms_exhibition_collection` VALUES (28, 8, 125, '2025/03/14 20:09:16');
INSERT INTO `ms_exhibition_collection` VALUES (43, 13, 124, '2025/03/24 09:38:23');
INSERT INTO `ms_exhibition_collection` VALUES (44, 13, 125, '2025/03/24 09:38:23');
INSERT INTO `ms_exhibition_collection` VALUES (45, 13, 126, '2025/03/24 09:38:23');
INSERT INTO `ms_exhibition_collection` VALUES (46, 13, 127, '2025/03/24 09:38:23');
INSERT INTO `ms_exhibition_collection` VALUES (47, 14, 124, '2025/03/24 09:40:10');
INSERT INTO `ms_exhibition_collection` VALUES (48, 14, 125, '2025/03/24 09:40:10');

-- ----------------------------
-- Table structure for ms_feedback
-- ----------------------------
DROP TABLE IF EXISTS `ms_feedback`;
CREATE TABLE `ms_feedback`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '留言id',
  `user_id` int NULL DEFAULT NULL COMMENT '留言用户id',
  `feed_content` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL COMMENT '留言内容',
  `user_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '留言用户昵称',
  `fed_date_time` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '留言时间',
  `is_show` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '是否展示',
  `cate_id` int NULL DEFAULT NULL COMMENT '类别id',
  `like_count` int NULL DEFAULT 0 COMMENT '评论点赞数量',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 57 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '留言信息' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of ms_feedback
-- ----------------------------
INSERT INTO `ms_feedback` VALUES (51, 25, '哈哈哈哈哈哈', 'bjl', '2025/03/07 18:01:11', '1', 127, 0);
INSERT INTO `ms_feedback` VALUES (52, 2, '非常棒', 'bjl', '2025/03/11 14:10:15', '1', 124, 3);
INSERT INTO `ms_feedback` VALUES (53, 2, '你哈哈哈哈哈哈', 'bjl', '2025/03/11 15:26:39', '1', 124, 1);
INSERT INTO `ms_feedback` VALUES (54, 2, 'nice', 'bjl', '2025/03/11 15:26:59', '1', 124, 1);
INSERT INTO `ms_feedback` VALUES (56, 2, 'nice', 'bjl', '2025/03/11 15:32:56', '1', 124, 1);

-- ----------------------------
-- Table structure for ms_feedback_like
-- ----------------------------
DROP TABLE IF EXISTS `ms_feedback_like`;
CREATE TABLE `ms_feedback_like`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID',
  `feedback_id` int NOT NULL COMMENT '评论ID',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_feedback`(`user_id` ASC, `feedback_id` ASC) USING BTREE COMMENT '确保用户不能重复点赞同一评论'
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '评论点赞关系表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ms_feedback_like
-- ----------------------------
INSERT INTO `ms_feedback_like` VALUES (4, '2', 52, '2025-03-11 15:40:36');
INSERT INTO `ms_feedback_like` VALUES (5, '2', 53, '2025-03-11 15:40:43');
INSERT INTO `ms_feedback_like` VALUES (6, '2', 54, '2025-03-11 15:40:44');
INSERT INTO `ms_feedback_like` VALUES (7, '2', 55, '2025-03-11 15:41:51');
INSERT INTO `ms_feedback_like` VALUES (8, '2', 56, '2025-03-11 15:41:53');

-- ----------------------------
-- Table structure for ms_like
-- ----------------------------
DROP TABLE IF EXISTS `ms_like`;
CREATE TABLE `ms_like`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID',
  `coll_id` int NOT NULL COMMENT '收藏的藏品/展览ID',
  `coll_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '收藏类型：COLL(藏品)/EXH(展览)',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_like`(`user_id` ASC, `coll_id` ASC, `coll_type` ASC) USING BTREE COMMENT '确保同一用户不会重复收藏同一个藏品/展览',
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_coll_id`(`coll_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 31 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户收藏表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ms_like
-- ----------------------------
INSERT INTO `ms_like` VALUES (16, '2', 9, 'EXH', '2025-03-18 15:22:53');
INSERT INTO `ms_like` VALUES (18, '2', 124, 'COLL', '2025-03-19 20:08:24');
INSERT INTO `ms_like` VALUES (24, '2', 11, 'COLL', '2025-03-20 19:01:11');
INSERT INTO `ms_like` VALUES (30, '2', 11, 'EXH', '2025-03-20 19:43:47');

-- ----------------------------
-- Table structure for ms_reserve
-- ----------------------------
DROP TABLE IF EXISTS `ms_reserve`;
CREATE TABLE `ms_reserve`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '预约id',
  `title` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '主题',
  `res_typ` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '预约类型',
  `cate_id` int NULL DEFAULT NULL COMMENT '分类id',
  `cate_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '分类名称',
  `res_sum` int NULL DEFAULT NULL COMMENT '可预约数量',
  `res_date` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '日期',
  `res_time` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '时间',
  `res_session` varchar(11) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '预约场次',
  `res_des` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL COMMENT '描述',
  `resd_sum` int NULL DEFAULT NULL COMMENT '已预约人数',
  `crt_tm` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `exhibition_id` int NULL DEFAULT NULL COMMENT '关联的展览ID',
  `has_multiple_times` tinyint(1) NULL DEFAULT 0 COMMENT '是否有多个时间段 0-否 1-是',
  `status` int NULL DEFAULT 1 COMMENT '预约状态：0-已取消，1-即将开始，2-进行中，3-已结束',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_exhibition_id`(`exhibition_id` ASC) USING BTREE,
  CONSTRAINT `fk_exhibition_id` FOREIGN KEY (`exhibition_id`) REFERENCES `ms_exhibition` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_reserve_exhibition` FOREIGN KEY (`exhibition_id`) REFERENCES `ms_exhibition` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 221 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '预约列表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of ms_reserve
-- ----------------------------
INSERT INTO `ms_reserve` VALUES (219, '二号厅', '展览预约', NULL, NULL, 0, '2025-03-24~2025-03-27', '14:30~17:00~8:30~11:00', '第一场~第二场', '<p>红红火火恍恍惚惚</p>', 0, '2025/03/24 09:41:47', 14, 1, 2);
INSERT INTO `ms_reserve` VALUES (220, '一号厅', '展览预约', NULL, NULL, 45, '2025-03-24~2025-03-27', '14:30~17:00~8:30~11:00', '第一场~第二场', '', 0, '2025/03/24 09:42:19', 13, 1, 2);

-- ----------------------------
-- Table structure for ms_reserve_detial
-- ----------------------------
DROP TABLE IF EXISTS `ms_reserve_detial`;
CREATE TABLE `ms_reserve_detial`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'id',
  `user_id` int NULL DEFAULT NULL COMMENT '用户id',
  `user_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '起源时期',
  `res_id` int NULL DEFAULT NULL COMMENT '预约id',
  `exhibition_id` int NULL DEFAULT NULL COMMENT '关联的展览ID',
  `exhibition_title` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '展览标题',
  `res_date` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '预约日期',
  `res_time` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '基础信息',
  `vld_stat` int NULL DEFAULT 1 COMMENT '预约状态',
  `cate_title` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL COMMENT '分类主题',
  `cate_id` int NULL DEFAULT NULL COMMENT '类id',
  `res_type` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '预约类型',
  `res_session` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '预约场次',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 108 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '预约详情' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of ms_reserve_detial
-- ----------------------------

-- ----------------------------
-- Table structure for ms_reserve_times
-- ----------------------------
DROP TABLE IF EXISTS `ms_reserve_times`;
CREATE TABLE `ms_reserve_times`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `reserve_id` int NOT NULL COMMENT '关联的预约ID',
  `res_date` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '预约日期',
  `res_time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '预约时间段',
  `res_session` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '第一场' COMMENT '场次信息(默认：第一场[上午]、第二场[下午])',
  `available_slots` int NULL DEFAULT 0 COMMENT '可用名额数',
  `booked_slots` int NULL DEFAULT 0 COMMENT '已预约名额数',
  `is_published` tinyint(1) NULL DEFAULT 1 COMMENT '是否已发布(1-已发布,0-未发布)',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '即将开始' COMMENT '预约状态：已结束、进行中、即将开始',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_reserve_date_time`(`reserve_id` ASC, `res_date` ASC, `res_time` ASC) USING BTREE,
  INDEX `idx_reserve_id`(`reserve_id` ASC) USING BTREE,
  INDEX `idx_res_date`(`res_date` ASC) USING BTREE,
  INDEX `idx_reserve_date_time`(`reserve_id` ASC, `res_date` ASC, `res_time` ASC) USING BTREE,
  CONSTRAINT `fk_reserve_id` FOREIGN KEY (`reserve_id`) REFERENCES `ms_reserve` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 220 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '预约时间表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ms_reserve_times
-- ----------------------------
INSERT INTO `ms_reserve_times` VALUES (204, 219, '2025-03-24', '8:30~11:00', '第一场', 45, 0, 1, '2025-03-24 09:40:55', '2025-03-24 09:40:55', '进行中');
INSERT INTO `ms_reserve_times` VALUES (205, 219, '2025-03-24', '14:30~17:00', '第二场', 45, 0, 1, '2025-03-24 09:40:55', '2025-03-24 09:40:55', '进行中');
INSERT INTO `ms_reserve_times` VALUES (206, 219, '2025-03-25', '8:30~11:00', '第一场', 45, 0, 1, '2025-03-24 09:40:55', '2025-03-24 09:40:55', '即将开始');
INSERT INTO `ms_reserve_times` VALUES (207, 219, '2025-03-25', '14:30~17:00', '第二场', 45, 0, 1, '2025-03-24 09:40:55', '2025-03-24 09:40:55', '即将开始');
INSERT INTO `ms_reserve_times` VALUES (208, 219, '2025-03-26', '8:30~11:00', '第一场', 45, 0, 1, '2025-03-24 09:40:55', '2025-03-24 09:40:55', '即将开始');
INSERT INTO `ms_reserve_times` VALUES (209, 219, '2025-03-26', '14:30~17:00', '第二场', 45, 0, 1, '2025-03-24 09:40:55', '2025-03-24 09:40:55', '即将开始');
INSERT INTO `ms_reserve_times` VALUES (210, 219, '2025-03-27', '8:30~11:00', '第一场', 45, 0, 1, '2025-03-24 09:40:55', '2025-03-24 09:40:55', '即将开始');
INSERT INTO `ms_reserve_times` VALUES (211, 219, '2025-03-27', '14:30~17:00', '第二场', 45, 0, 1, '2025-03-24 09:40:55', '2025-03-24 09:40:55', '即将开始');
INSERT INTO `ms_reserve_times` VALUES (212, 220, '2025-03-24', '8:30~11:00', '第一场', 45, 0, 1, '2025-03-24 09:42:20', '2025-03-24 09:42:20', '进行中');
INSERT INTO `ms_reserve_times` VALUES (213, 220, '2025-03-24', '14:30~17:00', '第二场', 45, 0, 1, '2025-03-24 09:42:20', '2025-03-24 09:42:20', '进行中');
INSERT INTO `ms_reserve_times` VALUES (214, 220, '2025-03-25', '8:30~11:00', '第一场', 45, 0, 1, '2025-03-24 09:42:20', '2025-03-24 09:42:20', '即将开始');
INSERT INTO `ms_reserve_times` VALUES (215, 220, '2025-03-25', '14:30~17:00', '第二场', 45, 0, 1, '2025-03-24 09:42:20', '2025-03-24 09:42:20', '即将开始');
INSERT INTO `ms_reserve_times` VALUES (216, 220, '2025-03-26', '8:30~11:00', '第一场', 45, 0, 1, '2025-03-24 09:42:20', '2025-03-24 09:42:20', '即将开始');
INSERT INTO `ms_reserve_times` VALUES (217, 220, '2025-03-26', '14:30~17:00', '第二场', 45, 0, 1, '2025-03-24 09:42:20', '2025-03-24 09:42:20', '即将开始');
INSERT INTO `ms_reserve_times` VALUES (218, 220, '2025-03-27', '8:30~11:00', '第一场', 45, 0, 1, '2025-03-24 09:42:20', '2025-03-24 09:42:20', '即将开始');
INSERT INTO `ms_reserve_times` VALUES (219, 220, '2025-03-27', '14:30~17:00', '第二场', 45, 0, 1, '2025-03-24 09:42:20', '2025-03-24 09:42:20', '即将开始');

-- ----------------------------
-- Table structure for ms_slideshow
-- ----------------------------
DROP TABLE IF EXISTS `ms_slideshow`;
CREATE TABLE `ms_slideshow`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '文件id',
  `pic_src` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '路径',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '上传文件' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of ms_slideshow
-- ----------------------------
INSERT INTO `ms_slideshow` VALUES (1, '/uploads/col_pic-1681623225501.jpg');
INSERT INTO `ms_slideshow` VALUES (2, '/uploads/col_pic-1681623348646.jpg');
INSERT INTO `ms_slideshow` VALUES (3, '/uploads/col_pic-1681623438892.jpg');

-- ----------------------------
-- Table structure for ms_user
-- ----------------------------
DROP TABLE IF EXISTS `ms_user`;
CREATE TABLE `ms_user`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `username` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '用户名',
  `password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '密码',
  `date` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '注册时间',
  `address` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '地址',
  `mobile` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '电话号',
  `state` int NOT NULL COMMENT '用户状态，默认 0 正常',
  `nickname` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '昵称',
  `id_card` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '身份号',
  `head_img` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL COMMENT '封面',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 26 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '用户' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of ms_user
-- ----------------------------
INSERT INTO `ms_user` VALUES (1, 'admin', '123456', '2023/12/21', NULL, '13108962745', 1, '用户1', '111111111111111111', NULL);
INSERT INTO `ms_user` VALUES (2, 'bjl', 'zxcvbnm.123', '2025/03/16', NULL, '1234568945', 0, '白诗阔落', '222222222222222222', NULL);

-- ----------------------------
-- Procedure structure for update_exhibition_status
-- ----------------------------
DROP PROCEDURE IF EXISTS `update_exhibition_status`;
delimiter ;;
CREATE PROCEDURE `update_exhibition_status`()
BEGIN
    -- 更新"已结束"状态：结束时间早于当前时间
    UPDATE ms_exhibition 
    SET status = 'ended'
    WHERE STR_TO_DATE(end_date, '%Y-%m-%d') < CURDATE();
    
    -- 更新"进行中"状态：当前时间在开始和结束时间之间
    UPDATE ms_exhibition 
    SET status = 'ongoing'
    WHERE STR_TO_DATE(start_date, '%Y-%m-%d') <= CURDATE()
    AND STR_TO_DATE(end_date, '%Y-%m-%d') >= CURDATE();
    
    -- 更新"即将开始"状态：开始时间晚于当前时间
    UPDATE ms_exhibition 
    SET status = 'upcoming'
    WHERE STR_TO_DATE(start_date, '%Y-%m-%d') > CURDATE();
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for update_reservation_status
-- ----------------------------
DROP PROCEDURE IF EXISTS `update_reservation_status`;
delimiter ;;
CREATE PROCEDURE `update_reservation_status`()
BEGIN
    -- 更新"已结束"状态：结束时间早于当前时间
    UPDATE ms_reserve_times 
    SET status = '已结束'
    WHERE STR_TO_DATE(CONCAT(res_date, ' ', SUBSTRING_INDEX(res_time, '~', -1)), '%Y-%m-%d %H:%i') < NOW();
    
    -- 更新"进行中"状态：当前时间在开始和结束时间之间
    UPDATE ms_reserve_times 
    SET status = '进行中'
    WHERE STR_TO_DATE(CONCAT(res_date, ' ', SUBSTRING_INDEX(res_time, '~', 1)), '%Y-%m-%d %H:%i') <= NOW()
    AND STR_TO_DATE(CONCAT(res_date, ' ', SUBSTRING_INDEX(res_time, '~', -1)), '%Y-%m-%d %H:%i') >= NOW();
    
    -- 更新"即将开始"状态：开始时间晚于当前时间
    UPDATE ms_reserve_times 
    SET status = '即将开始'
    WHERE STR_TO_DATE(CONCAT(res_date, ' ', SUBSTRING_INDEX(res_time, '~', 1)), '%Y-%m-%d %H:%i') > NOW();
END
;;
delimiter ;

-- ----------------------------
-- Event structure for event_update_exhibition_status
-- ----------------------------
DROP EVENT IF EXISTS `event_update_exhibition_status`;
delimiter ;;
CREATE EVENT `event_update_exhibition_status`
ON SCHEDULE
EVERY '1' DAY STARTS '2025-03-20 00:00:00'
DO CALL update_exhibition_status()
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table ms_reserve_detial
-- ----------------------------
DROP TRIGGER IF EXISTS `update_reserve_after_detail_change`;
delimiter ;;
CREATE TRIGGER `update_reserve_after_detail_change` AFTER INSERT ON `ms_reserve_detial` FOR EACH ROW BEGIN
    UPDATE ms_reserve
    SET resd_sum = (
        SELECT COUNT(*) 
        FROM ms_reserve_detial 
        WHERE res_id = NEW.res_id AND vld_stat = '1'
    )
    WHERE id = NEW.res_id;
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table ms_reserve_detial
-- ----------------------------
DROP TRIGGER IF EXISTS `update_reserve_after_detail_update`;
delimiter ;;
CREATE TRIGGER `update_reserve_after_detail_update` AFTER UPDATE ON `ms_reserve_detial` FOR EACH ROW BEGIN
    IF OLD.vld_stat != NEW.vld_stat THEN
        UPDATE ms_reserve
        SET resd_sum = (
            SELECT COUNT(*) 
            FROM ms_reserve_detial 
            WHERE res_id = NEW.res_id AND vld_stat = '1'
        )
        WHERE id = NEW.res_id;
    END IF;
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;

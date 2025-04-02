CREATE TABLE ms_like (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(50) NOT NULL COMMENT '用户ID',
    coll_id INT NOT NULL COMMENT '收藏的藏品/展览ID',
    coll_type VARCHAR(20) NOT NULL COMMENT '收藏类型：COLL(藏品)/EXH(展览)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    INDEX idx_user_id (user_id),
    INDEX idx_coll_id (coll_id),
    UNIQUE INDEX unique_like (user_id, coll_id, coll_type) COMMENT '确保同一用户不会重复收藏同一个藏品/展览'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏表'; 
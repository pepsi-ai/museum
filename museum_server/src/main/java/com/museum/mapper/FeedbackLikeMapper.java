package com.museum.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.museum.damain.po.FeedbackLike;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 评论点赞关系Mapper
 */
@Mapper
public interface FeedbackLikeMapper extends BaseMapper<FeedbackLike> {
    
    /**
     * 查询用户是否点赞了某条评论
     * @param userId 用户ID
     * @param feedbackId 评论ID
     * @return 点赞关系, 如果不存在则返回null
     */
    FeedbackLike selectByUserIdAndFeedbackId(@Param("userId") String userId, @Param("feedbackId") Integer feedbackId);
    
    /**
     * 查询用户点赞的所有评论ID
     * @param userId 用户ID
     * @return 评论ID列表
     */
    List<Integer> selectLikedFeedbackIds(@Param("userId") String userId);
} 
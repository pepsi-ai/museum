package com.museum.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.museum.damain.po.FeedBack;
import com.museum.damain.po.FeedbackLike;
import com.museum.mapper.FeedbackLikeMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.Date;
import java.util.List;

/**
 * 评论点赞关系服务实现类
 */
@Service
public class FeedbackLikeService extends ServiceImpl<FeedbackLikeMapper, FeedbackLike> {
    
    @Resource
    private FeedbackLikeMapper feedbackLikeMapper;
    
    @Resource
    private FeedBackService feedBackService;
    
    /**
     * 点赞或取消点赞
     * @param userId 用户ID
     * @param feedbackId 评论ID
     * @return 操作后的点赞状态: true-已点赞, false-已取消点赞
     */
    @Transactional
    public boolean toggleLike(String userId, Integer feedbackId) {
        // 查询点赞记录是否存在
        FeedbackLike like = feedbackLikeMapper.selectByUserIdAndFeedbackId(userId, feedbackId);
        
        // 获取评论信息
        FeedBack feedBack = feedBackService.getById(feedbackId);
        if (feedBack == null) {
            return false;
        }
        
        // 获取当前点赞数
        Integer likeCount = feedBack.getLikeCount();
        if (likeCount == null) {
            likeCount = 0;
        }
        
        if (like == null) {
            // 未点赞，添加点赞
            FeedbackLike newLike = new FeedbackLike();
            newLike.setUserId(userId);
            newLike.setFeedbackId(feedbackId);
            newLike.setCreateTime(new Date());
            save(newLike);
            
            // 更新评论点赞数 +1
            feedBack.setLikeCount(likeCount + 1);
            feedBackService.updateById(feedBack);
            
            return true;
        } else {
            // 已点赞，取消点赞
            removeById(like.getId());
            
            // 更新评论点赞数 -1，确保不小于0
            feedBack.setLikeCount(Math.max(0, likeCount - 1));
            feedBackService.updateById(feedBack);
            
            return false;
        }
    }
    
    /**
     * 检查用户是否点赞了指定评论
     * @param userId 用户ID
     * @param feedbackId 评论ID
     * @return 是否已点赞
     */
    public boolean isLiked(String userId, Integer feedbackId) {
        FeedbackLike like = feedbackLikeMapper.selectByUserIdAndFeedbackId(userId, feedbackId);
        return like != null;
    }
    
    /**
     * 查询用户点赞的所有评论ID
     * @param userId 用户ID
     * @return 评论ID列表
     */
    public List<Integer> getLikedFeedbackIds(String userId) {
        return feedbackLikeMapper.selectLikedFeedbackIds(userId);
    }
} 
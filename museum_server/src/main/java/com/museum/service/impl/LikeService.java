package com.museum.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.museum.config.PageResult;
import com.museum.damain.po.MsCollection;
import com.museum.damain.po.MsLike;
import com.museum.damain.po.MsReserve;
import com.museum.damain.po.MsExhibition;
import com.museum.mapper.LikeMapper;
import com.museum.mapper.ExhibitionMapper;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.Date;
import java.util.List;

/**
 * 用户收藏Service实现类
 */
@Service
public class LikeService extends ServiceImpl<LikeMapper, MsLike> {
    
    @Resource
    private LikeMapper likeMapper;
    
    @Resource
    private ExhibitionMapper exhibitionMapper;
    
    /**
     * 添加藏品收藏
     */
    public boolean addLikeColl(String userId, Integer collId) {
        // 检查是否已经收藏
        boolean exists = lambdaQuery()
                .eq(MsLike::getUserId, userId)
                .eq(MsLike::getCollId, collId)
                .eq(MsLike::getCollType, "COLL")
                .count() > 0;
        
        if (exists) {
            // 已收藏，不需要再添加
            return true;
        }
        
        // 添加收藏记录
        MsLike like = new MsLike();
        like.setUserId(userId);
        like.setCollId(collId);
        like.setCollType("COLL");
        like.setCreateTime(new Date());
        
        return save(like);
    }
    
    /**
     * 取消藏品收藏
     */
    public boolean delLikeColl(String userId, Integer collId) {
        return lambdaUpdate()
                .eq(MsLike::getUserId, userId)
                .eq(MsLike::getCollId, collId)
                .eq(MsLike::getCollType, "COLL")
                .remove();
    }
    
    /**
     * 添加展览收藏
     */
    public boolean addLikeExh(String userId, Integer collId) {
        // 检查是否已经收藏
        boolean exists = lambdaQuery()
                .eq(MsLike::getUserId, userId)
                .eq(MsLike::getCollId, collId)
                .eq(MsLike::getCollType, "EXH")
                .count() > 0;
        
        if (exists) {
            // 已收藏，不需要再添加
            return true;
        }
        
        // 添加收藏记录
        MsLike like = new MsLike();
        like.setUserId(userId);
        like.setCollId(collId);
        like.setCollType("EXH");
        like.setCreateTime(new Date());
        
        return save(like);
    }
    
    /**
     * 取消展览收藏
     */
    public boolean delLikeExh(String userId, Integer collId) {
        return lambdaUpdate()
                .eq(MsLike::getUserId, userId)
                .eq(MsLike::getCollId, collId)
                .eq(MsLike::getCollType, "EXH")
                .remove();
    }
    
    /**
     * 获取用户收藏列表
     */
    public List<Integer> listUserLikes(String userId, String collType) {
        return likeMapper.selectUserLikeIds(userId, collType);
    }
    
    /**
     * 分页获取用户的藏品收藏列表
     */
    public PageResult<MsCollection> listLikeColl(String userId, int pageNum, int pageSize) {
        Page<MsCollection> page = new Page<>(pageNum, pageSize);
        Page<MsCollection> collectionPage = likeMapper.selectCollectionList(userId, page);
        
        PageResult<MsCollection> pageResult = new PageResult<>();
        pageResult.setList(collectionPage.getRecords());
        pageResult.setTotal(collectionPage.getTotal());
        
        return pageResult;
    }
    
    /**
     * 分页获取用户的展览收藏列表
     */
    public PageResult<MsExhibition> listLikeExh(String userId, int pageNum, int pageSize) {
        Page<MsExhibition> page = new Page<>(pageNum, pageSize);
        
        // 获取用户收藏的展览ID列表
        List<Integer> exhibitionIds = likeMapper.selectUserLikeIds(userId, "EXH");
        
        if (exhibitionIds == null || exhibitionIds.isEmpty()) {
            return new PageResult<>();
        }
        
        // 查询展览详情
        QueryWrapper<MsExhibition> queryWrapper = new QueryWrapper<>();
        queryWrapper.in("id", exhibitionIds);
        queryWrapper.orderByDesc("id");  // 按ID倒序排序，最新收藏的在前面
        
        Page<MsExhibition> exhibitionPage = exhibitionMapper.selectPage(page, queryWrapper);
        
        PageResult<MsExhibition> pageResult = new PageResult<>();
        pageResult.setList(exhibitionPage.getRecords());
        pageResult.setTotal(exhibitionPage.getTotal());
        
        return pageResult;
    }
} 
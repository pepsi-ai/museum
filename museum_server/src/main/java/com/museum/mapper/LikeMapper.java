package com.museum.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.museum.damain.po.MsCollection;
import com.museum.damain.po.MsLike;
import com.museum.damain.po.MsReserve;
import com.museum.damain.po.MsExhibition;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 用户收藏Mapper接口
 */
@Mapper
public interface LikeMapper extends BaseMapper<MsLike> {
    
    /**
     * 查询用户收藏的藏品列表
     * @param userId 用户ID
     * @param page 分页对象
     * @return 藏品列表
     */
    Page<MsCollection> selectCollectionList(@Param("userId") String userId, Page<MsCollection> page);
    
    /**
     * 查询用户收藏的展览列表
     * @param userId 用户ID
     * @param page 分页对象
     * @return 展览列表
     */
    Page<MsExhibition> selectExhibitionList(@Param("userId") String userId, Page<MsExhibition> page);
    
    /**
     * 查询用户收藏的所有ID列表
     * @param userId 用户ID
     * @param collType 收藏类型
     * @return 收藏ID列表
     */
    List<Integer> selectUserLikeIds(@Param("userId") String userId, @Param("collType") String collType);
} 
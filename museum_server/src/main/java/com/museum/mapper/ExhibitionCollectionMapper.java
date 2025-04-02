package com.museum.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.museum.damain.po.MsExhibitionCollection;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ExhibitionCollectionMapper extends BaseMapper<MsExhibitionCollection> {
    
    /**
     * 批量插入展览藏品关系
     * @param list 关系列表
     * @return 影响行数
     */
    int batchInsert(@Param("list") List<MsExhibitionCollection> list);
    
    /**
     * 根据展览ID删除关联关系
     * @param exhibitionId 展览ID
     * @return 影响行数
     */
    int deleteByExhibitionId(@Param("exhibitionId") Integer exhibitionId);
    
    /**
     * 根据展览ID查询关联的藏品ID列表
     * @param exhibitionId 展览ID
     * @return 藏品ID列表
     */
    List<Integer> selectCollectionIdsByExhibitionId(@Param("exhibitionId") Integer exhibitionId);
} 
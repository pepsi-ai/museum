package com.museum.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.museum.damain.po.MsExhibition;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ExhibitionMapper extends BaseMapper<MsExhibition> {
    
    /**
     * 获取展览详情，包含关联的藏品信息
     * @param id 展览ID
     * @return 展览信息
     */
    MsExhibition getExhibitionWithCollections(@Param("id") Integer id);
    
    /**
     * 获取所有展览列表
     * @return 展览列表
     */
    List<MsExhibition> getAllExhibitions();
} 
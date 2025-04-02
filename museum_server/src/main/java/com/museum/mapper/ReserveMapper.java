package com.museum.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.museum.damain.po.MsCollection;
import com.museum.damain.po.MsReserve;
import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * <p>
 *  Mapper 接口
 * </p>
 *
 *@since 2023-12-19
 */
public interface ReserveMapper extends BaseMapper<MsReserve> {
    
    /**
     * 根据groupId查询预约
     * @param groupId 组ID
     * @return 预约列表
     */
    List<MsReserve> selectByGroupId(@Param("groupId") String groupId);
    
    /**
     * 根据标题模糊查询预约
     * @param title 标题
     * @return 预约列表
     */
    List<MsReserve> selectByTitle(@Param("title") String title);
    
    /**
     * 根据展览ID查询预约
     * @param exhibitionId 展览ID
     * @return 预约列表
     */
    List<MsReserve> selectByExhibitionId(@Param("exhibitionId") Integer exhibitionId);
}

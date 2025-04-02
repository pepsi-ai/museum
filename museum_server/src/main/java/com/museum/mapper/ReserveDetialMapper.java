package com.museum.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.museum.damain.po.MsReserveDetial;
import org.apache.ibatis.annotations.Param;


public interface ReserveDetialMapper extends BaseMapper<MsReserveDetial> {
    
    /**
     * 自定义插入方法，绕过MyBatis-Plus的自动生成SQL
     * @param detial 预约详情对象
     * @return 影响行数
     */
    int insertDetail(MsReserveDetial detial);
    
    /**
     * 自定义更新方法，绕过MyBatis-Plus的自动生成SQL
     * @param detial 预约详情对象
     * @return 影响行数
     */
    int updateDetail(MsReserveDetial detial);
    
    /**
     * 安全插入方法，显式指定字段而不是使用对象，避免resdSum字段问题
     * @return 影响行数
     */
    int insertSafe(@Param("userId") String userId, @Param("userName") String userName, 
                  @Param("resId") String resId, @Param("cateId") Integer cateId, 
                  @Param("cateTitle") String cateTitle, @Param("resType") String resType, 
                  @Param("resDate") String resDate, @Param("resTime") String resTime, 
                  @Param("vldStat") String vldStat, @Param("resSession") String resSession);
}

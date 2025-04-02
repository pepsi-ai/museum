package com.museum.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.museum.damain.po.MsReserveDetial;
import com.museum.damain.po.MsReserveTimes;
import com.museum.mapper.ReserveDetialMapper;
import com.museum.mapper.ReserveTimesMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.Date;
import java.util.List;

/**
 * <p>
 *  预约时间服务实现类
 * </p>
 *
 * @since 2025-03-20
 */
@Service
public class ReserveTimesService extends ServiceImpl<ReserveTimesMapper, MsReserveTimes> implements IService<MsReserveTimes> {

    @Resource
    private ReserveDetialMapper reserveDetialMapper;

    /**
     * 根据预约ID获取预约时间段列表
     * @param reserveId 预约ID
     * @return 预约时间段列表
     */
    public List<MsReserveTimes> getTimesByReserveId(Integer reserveId) {
        QueryWrapper<MsReserveTimes> queryWrapper = new QueryWrapper<>();
        queryWrapper.lambda().eq(MsReserveTimes::getReserveId, reserveId);
        return list(queryWrapper);
    }
    
    /**
     * 批量保存预约时间段
     * @param reserveId 预约ID
     * @param timesList 预约时间段列表
     */
    public void batchSaveReserveTimes(Integer reserveId, List<MsReserveTimes> timesList) {
        if (reserveId == null || timesList == null || timesList.isEmpty()) {
            return;
        }
        
        // 删除旧的时间段记录
        QueryWrapper<MsReserveTimes> deleteWrapper = new QueryWrapper<>();
        deleteWrapper.eq("reserve_id", reserveId);
        remove(deleteWrapper);
        
        // 保存新的时间段记录
        for (MsReserveTimes times : timesList) {
            times.setReserveId(reserveId);
            save(times);
        }
    }
    
    /**
     * 更新指定展览和日期时间的预约人数
     * @param reserveId 预约ID
     * @param resDate 预约日期
     * @param resTime 预约时间
     * @return 更新的记录数
     */
    @Transactional
    public boolean updateBookedSlotsByReserveId(Integer reserveId, String resDate, String resTime) {
        try {
            System.out.println("开始更新预约人数 - 预约ID: " + reserveId + 
                           ", 日期: " + resDate + 
                           ", 时间: " + resTime);
            
            // 查找对应的时间段记录
            QueryWrapper<MsReserveTimes> timesQuery = new QueryWrapper<>();
            timesQuery.eq("reserve_id", reserveId)
                    .eq("res_date", resDate)
                    .eq("res_time", resTime);
            
            MsReserveTimes timeSlot = getOne(timesQuery);
            if (timeSlot == null) {
                System.out.println("未找到对应的时间段记录 - 预约ID: " + reserveId + 
                               ", 日期: " + resDate + 
                               ", 时间: " + resTime);
                return false;
            }
            
            // 查询该时间段实际预约人数
            QueryWrapper<MsReserveDetial> countQuery = new QueryWrapper<>();
            countQuery.eq("res_id", reserveId.toString())
                    .eq("res_date", resDate)
                    .eq("res_time", resTime)
                    .eq("vld_stat", "1");
            
            int bookedCount = (int) reserveDetialMapper.selectCount(countQuery);
            
            // 使用原生SQL进行更新，确保数据能直接更新到数据库
            String updateSql = "UPDATE ms_reserve_times SET booked_slots = " + bookedCount + 
                              ", update_time = NOW() WHERE id = " + timeSlot.getId();
            boolean result = baseMapper.update(null, new UpdateWrapper<MsReserveTimes>()
                    .setSql(updateSql)) > 0;
            
            if (!result) {
                // 如果SQL更新失败，尝试直接使用实体类更新
                timeSlot.setBookedSlots(bookedCount);
                timeSlot.setUpdateTime(new Date());
                result = updateById(timeSlot);
            }
            
            System.out.println("直接更新预约人数 - ID: " + timeSlot.getId() + 
                           ", 日期: " + resDate + 
                           ", 时间: " + resTime +
                           ", 人数: " + bookedCount + 
                           ", 结果: " + (result ? "成功" : "失败"));
            
            return result;
        } catch (Exception e) {
            System.err.println("更新预约人数时出错: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * 直接根据预约详情ID更新对应时间段的预约人数
     * @param detailId 预约详情ID
     * @return 是否更新成功
     */
    @Transactional
    public boolean updateBookedSlotsByDetailId(Integer detailId) {
        try {
            System.out.println("根据预约详情ID更新预约人数 - 详情ID: " + detailId);
            
            // 获取预约详情记录
            MsReserveDetial detail = reserveDetialMapper.selectById(detailId);
            if (detail == null) {
                System.out.println("未找到预约详情记录 - ID: " + detailId);
                return false;
            }
            
            // 查找对应的时间段记录
            Integer reserveId = null;
            try {
                reserveId = Integer.parseInt(detail.getResId());
            } catch (NumberFormatException e) {
                System.err.println("无法解析预约ID: " + detail.getResId());
                return false;
            }
            
            return updateBookedSlotsByReserveId(reserveId, detail.getResDate(), detail.getResTime());
        } catch (Exception e) {
            System.err.println("根据详情ID更新预约人数时出错: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * 刷新所有时间段的预约人数
     * @return 更新的记录数
     */
    @Transactional
    public int refreshAllBookedSlots() {
        int updateCount = 0;
        try {
            // 获取所有时间段
            List<MsReserveTimes> allTimeSlots = list();
            
            for (MsReserveTimes timeSlot : allTimeSlots) {
                // 查询实际预约人数
                QueryWrapper<MsReserveDetial> countQuery = new QueryWrapper<>();
                countQuery.eq("res_id", timeSlot.getReserveId().toString())
                        .eq("res_date", timeSlot.getResDate())
                        .eq("res_time", timeSlot.getResTime())
                        .eq("vld_stat", "1");
                
                int bookedCount = (int) reserveDetialMapper.selectCount(countQuery);
                
                // 直接使用SQL更新，确保数据更新到数据库
                if (timeSlot.getBookedSlots() != bookedCount) {
                    String updateSql = "UPDATE ms_reserve_times SET booked_slots = " + bookedCount + 
                                     ", update_time = NOW() WHERE id = " + timeSlot.getId();
                    boolean result = baseMapper.update(null, new UpdateWrapper<MsReserveTimes>()
                            .setSql(updateSql)) > 0;
                    
                    if (result) {
                        updateCount++;
                        System.out.println("刷新预约人数 - ID: " + timeSlot.getId() + 
                                       ", 预约ID: " + timeSlot.getReserveId() + 
                                       ", 日期: " + timeSlot.getResDate() + 
                                       ", 时间: " + timeSlot.getResTime() + 
                                       ", 人数: " + bookedCount);
                    }
                }
            }
            
            System.out.println("刷新预约人数完成，共更新 " + updateCount + " 条记录");
            return updateCount;
        } catch (Exception e) {
            System.err.println("刷新所有预约人数时出错: " + e.getMessage());
            e.printStackTrace();
            return 0;
        }
    }
} 
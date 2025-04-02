package com.museum.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.conditions.query.LambdaQueryChainWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.museum.config.ExcepUtil;
import com.museum.config.PageResult;
import com.museum.damain.dto.ReserveQuery;
import com.museum.damain.po.MsCollection;
import com.museum.damain.po.MsReserve;
import com.museum.damain.po.MsReserveDetial;
import com.museum.damain.po.MsReserveTimes;
import com.museum.mapper.CollectionMapper;
import com.museum.mapper.ReserveDetialMapper;
import com.museum.mapper.ReserveMapper;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.Date;
import java.util.List;

/**
 * <p>
 *  服务实现类
 * </p>
 * @since 2023-22-29
 */
@Service
public class ReserveDetailService extends ServiceImpl<ReserveDetialMapper, MsReserveDetial> implements IService<MsReserveDetial> {

    @Resource
    ReserveMapper reserveMapper;
    @Resource
    CollectionMapper collectionMapper;
    @Resource
    ReserveService reserveService;
    @Resource
    ReserveTimesService reserveTimesService;

    /**
     * 获取用户预约列表
     * @return
     */
    public PageResult<MsReserveDetial> listMsReserveDetail(ReserveQuery pageQuery) {
        LambdaQueryChainWrapper<MsReserveDetial> lambdaQueryChainWrapper = lambdaQuery();
        if(null != pageQuery.getCateId()) {
            lambdaQueryChainWrapper.eq(MsReserveDetial::getCateId, pageQuery.getCateId());
        }
        if(null != pageQuery.getUserId()) {
            lambdaQueryChainWrapper.eq(MsReserveDetial::getUserId, pageQuery.getUserId());
        }
        Page<MsReserveDetial> page = lambdaQueryChainWrapper.page(pageQuery.toMpPage());
        return PageResult.of(page, page.getRecords());
    }

    /**
     * 编辑预约详情
     * @param detial
     */
    public void editDetail(MsReserveDetial detial) throws Exception {
        // 如果只提供了ID和vldStat，简单更新有效状态
        if (detial.getId() != null && detial.getVldStat() != null 
            && (detial.getUserId() == null || detial.getUserId().isEmpty())
            && (detial.getResId() == null || detial.getResId().isEmpty())
            && (detial.getCateId() == null)) {
            
            System.out.println("只更新预约状态，ID: " + detial.getId() + ", 状态: " + detial.getVldStat());
            
            // 获取原始记录
            MsReserveDetial original = getById(detial.getId());
            if (original == null) {
                ExcepUtil.throwErr("找不到ID为" + detial.getId() + "的预约记录");
            }
            
            // 使用专用方法只更新vldStat字段
            baseMapper.updateStatusOnly(detial.getId(), detial.getVldStat());
            System.out.println("成功更新预约状态");
            
            // 更新预约人数统计
            updateMsReserveResdSum(original);
            
            // 更新ms_reserve_times表中的booked_slots
            try {
                if (original.getResId() != null && !original.getResId().isEmpty()) {
                    Integer reserveId = Integer.parseInt(original.getResId());
                    reserveTimesService.updateBookedSlotsByReserveId(reserveId, original.getResDate(), original.getResTime());
                }
            } catch (Exception e) {
                System.err.println("更新预约时间段人数失败: " + e.getMessage());
                e.printStackTrace();
            }
            
            return;
        }
        
        // 检查是否已有其他有效预约在相同日期和时间 - 更精确的查重逻辑
        QueryWrapper<MsReserveDetial> queryWrapper = new QueryWrapper<>();
        queryWrapper.lambda()
                .eq(MsReserveDetial::getUserId, detial.getUserId())
                .eq(MsReserveDetial::getExhibitionId, detial.getExhibitionId() != null ? detial.getExhibitionId() : 0)
                .eq(MsReserveDetial::getResDate, detial.getResDate())
                .eq(MsReserveDetial::getResTime, detial.getResTime())
                .eq(MsReserveDetial::getVldStat, "1");
        
        // 排除当前记录
        if (detial.getId() != null) {
            queryWrapper.lambda().ne(MsReserveDetial::getId, detial.getId());
        }
        
        List<MsReserveDetial> msReserveDetials = baseMapper.selectList(queryWrapper);
        if(!msReserveDetials.isEmpty() && "1".equals(detial.getVldStat())) {
            ExcepUtil.throwErr("您已预约过该展览的相同日期和时间段，请选择其他日期或时间段");
        }
        
        // 获取原始记录用于后续更新
        MsReserveDetial original = null;
        if (detial.getId() != null) {
            original = getById(detial.getId());
        }
        
        // 保存或更新预约详情
        saveOrUpdate(detial);
        
        // 更新预约人数统计
        updateMsReserveResdSum(detial);
        
        // 更新ms_reserve_times表中的booked_slots
        try {
            if (detial.getResId() != null && !detial.getResId().isEmpty()) {
                Integer reserveId = Integer.parseInt(detial.getResId());
                reserveTimesService.updateBookedSlotsByReserveId(reserveId, detial.getResDate(), detial.getResTime());
            }
            
            // 如果原记录存在且日期或时间有变化，也更新原记录对应的时间段
            if (original != null && original.getResId() != null && !original.getResId().isEmpty() &&
                    (original.getResDate() != null && !original.getResDate().equals(detial.getResDate()) ||
                     original.getResTime() != null && !original.getResTime().equals(detial.getResTime()))) {
                Integer originalReserveId = Integer.parseInt(original.getResId());
                reserveTimesService.updateBookedSlotsByReserveId(originalReserveId, original.getResDate(), original.getResTime());
            }
        } catch (Exception e) {
            System.err.println("更新预约时间段人数失败: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 添加预约详情
     * @param detial
     */
    public void addDetail(MsReserveDetial detial) throws Exception {
        System.out.println("====== 预约详情创建 - 开始 ======");
        System.out.println("用户ID: " + detial.getUserId());
        System.out.println("传入的ID (resId): " + detial.getResId());
        System.out.println("展览ID: " + detial.getExhibitionId());
        System.out.println("展览标题: " + detial.getExhibitionTitle());
        System.out.println("展品ID: " + detial.getCateId());
        System.out.println("日期: " + detial.getResDate());
        System.out.println("时间段: " + detial.getResTime());
        
        // 自动设置场次
        if (detial.getResSession() == null || detial.getResSession().isEmpty()) {
            String resSession = reserveService.determineSession(detial.getResTime());
            detial.setResSession(resSession);
            System.out.println("自动设置预约场次: " + resSession);
        }
        
        // 检查是否已存在相同日期和时间的预约 - 更精确的查重逻辑
        QueryWrapper<MsReserveDetial> queryWrapper = new QueryWrapper<>();
        queryWrapper.lambda()
                .eq(MsReserveDetial::getUserId, detial.getUserId())
                .eq(MsReserveDetial::getExhibitionId, detial.getExhibitionId())
                .eq(MsReserveDetial::getResDate, detial.getResDate())
                .eq(MsReserveDetial::getResTime, detial.getResTime())
                .eq(MsReserveDetial::getVldStat, "1");
                 
        List<MsReserveDetial> existingReservations = baseMapper.selectList(queryWrapper);
        if(!existingReservations.isEmpty()) {
            ExcepUtil.throwErr("您已预约过该展览的相同日期和时间段，请选择其他日期或时间段");
        }
        
        // 首先尝试直接通过ID查找预约记录
        MsReserve msReserve = null;
        try {
            if (detial.getResId() != null) {
                msReserve = reserveMapper.selectById(detial.getResId());
                if (msReserve != null) {
                    System.out.println("通过ID直接找到预约记录: " + msReserve.getId());
                }
            }
        } catch (Exception e) {
            System.err.println("通过ID查找预约时出错: " + e.getMessage());
        }
        
        // 如果直接查找失败，尝试通过展览ID查找
        if (msReserve == null && detial.getExhibitionId() != null) {
            try {
                QueryWrapper<MsReserve> exhibitionQuery = new QueryWrapper<>();
                exhibitionQuery.eq("exhibition_id", detial.getExhibitionId());
                
                // 如果有日期和时间，添加到查询条件
                if (detial.getResDate() != null && !detial.getResDate().isEmpty()) {
                    exhibitionQuery.eq("res_date", detial.getResDate());
                }
                if (detial.getResTime() != null && !detial.getResTime().isEmpty()) {
                    exhibitionQuery.eq("res_time", detial.getResTime());
                }
                
                msReserve = reserveMapper.selectOne(exhibitionQuery);
                if (msReserve != null) {
                    System.out.println("通过展览ID找到预约记录: " + msReserve.getId() + 
                                      ", 展览ID: " + msReserve.getExhibitionId());
                    
                    // 更新预约详情的预约ID为找到的记录ID
                    detial.setResId(String.valueOf(msReserve.getId()));
                } else {
                    System.out.println("通过展览ID未找到预约记录，尝试创建新预约记录");
                }
            } catch (Exception e) {
                System.err.println("通过展览ID查找预约时出错: " + e.getMessage());
            }
        }
        
        // 如果还是找不到预约记录，尝试创建新记录
        if (msReserve == null && detial.getExhibitionId() != null) {
            try {
                // 创建新的预约主记录
                msReserve = new MsReserve();
                msReserve.setExhibitionId(detial.getExhibitionId());
                msReserve.setTitle(detial.getExhibitionTitle() != null ? 
                              detial.getExhibitionTitle() : detial.getCateTitle());
                msReserve.setResDate(detial.getResDate());
                msReserve.setResTime(detial.getResTime());
                msReserve.setResTyp("展览预约");
                msReserve.setResSum(45); // 默认45个名额
                msReserve.setResdSum(0);
                
                // 保存新创建的预约主记录
                reserveMapper.insert(msReserve);
                
                System.out.println("已创建新预约记录，ID: " + msReserve.getId() + 
                                   ", 展览ID: " + msReserve.getExhibitionId());
                
                // 设置detial使用新创建的记录ID
                detial.setResId(String.valueOf(msReserve.getId()));
            } catch (Exception e) {
                System.err.println("创建新预约记录时出错: " + e.getMessage());
                ExcepUtil.throwErr("创建预约记录失败: " + e.getMessage());
            }
        }
        
        if (msReserve == null) {
            ExcepUtil.throwErr("未找到对应的预约记录，也无法创建新记录。展览ID: " + detial.getExhibitionId());
        }
        
        // 设置预约详情的基本信息
        detial.setResType(msReserve.getResTyp());
        
        // 如果前端传递了日期和时间，优先使用前端传递的值
        if (detial.getResDate() == null || detial.getResDate().isEmpty()) {
            detial.setResDate(msReserve.getResDate());
        }
        if (detial.getResTime() == null || detial.getResTime().isEmpty()) {
            detial.setResTime(msReserve.getResTime());
        }
        
        // 场次优先使用自动设置的值，如果前面已经设置过，就不要覆盖
        if (detial.getResSession() == null || detial.getResSession().isEmpty()) {
            // 如果主记录有场次信息，使用主记录的场次
            if (msReserve.getResSession() != null && !msReserve.getResSession().isEmpty()) {
                detial.setResSession(msReserve.getResSession());
                System.out.println("使用主记录的场次: " + msReserve.getResSession());
            } else {
                // 如果主记录没有场次，根据时间自动设置
                String resSession = reserveService.determineSession(detial.getResTime());
                detial.setResSession(resSession);
                System.out.println("再次自动设置场次: " + resSession);
            }
        }
        
        // 保存预约详情
        save(detial);
        System.out.println("预约详情保存成功，ID: " + detial.getId());
        
        // 更新ms_reserve_times表中的booked_slots
        try {
            Integer reserveId = msReserve.getId();
            boolean updated = reserveTimesService.updateBookedSlotsByReserveId(reserveId, detial.getResDate(), detial.getResTime());
            
            if (!updated) {
                System.out.println("未找到对应的时间段记录，尝试创建新记录");
                
                // 如果没有找到时间段记录，尝试创建一个
                MsReserveTimes newTimeSlot = new MsReserveTimes();
                newTimeSlot.setReserveId(reserveId);
                newTimeSlot.setResDate(detial.getResDate());
                newTimeSlot.setResTime(detial.getResTime());
                newTimeSlot.setResSession(detial.getResSession());
                newTimeSlot.setAvailableSlots(msReserve.getResSum() != null ? msReserve.getResSum() : 45);
                newTimeSlot.setBookedSlots(1); // 初始值为1
                newTimeSlot.setIsPublished(true);
                newTimeSlot.setCreateTime(new Date());
                newTimeSlot.setUpdateTime(new Date());
                newTimeSlot.setStatus("即将开始");
                
                reserveTimesService.save(newTimeSlot);
                System.out.println("创建新的时间段记录，ID: " + newTimeSlot.getId());
            }
        } catch (Exception e) {
            System.err.println("更新时间段预约人数时出错: " + e.getMessage());
            e.printStackTrace();
        }
        
        // 更新主记录的预约人数统计
        updateMsReserveResdSum(detial);
        
        System.out.println("====== 预约详情创建 - 完成 ======");
    }

    /**
     * 更新实际预约人数
     */
    public void updateMsReserveResdSum(MsReserveDetial detial) {
        try {
            // 1. 更新主表预约人数
            MsReserve msReserve = reserveMapper.selectById(detial.getResId());
            if (msReserve == null) {
                System.err.println("无法找到主预约记录: " + detial.getResId());
                return;
            }
            
            // 查询该预约ID下有效的预约详情数量
            QueryWrapper<MsReserveDetial> detialQueryWrapper = new QueryWrapper<>();
            detialQueryWrapper.lambda()
                    .eq(MsReserveDetial::getResId, detial.getResId())
                    .eq(MsReserveDetial::getVldStat, "1");
            List<MsReserveDetial> reserveDetials = baseMapper.selectList(detialQueryWrapper);
            int validCount = reserveDetials.size();
            
            // 更新主预约记录的预约人数
            msReserve.setResdSum(validCount);
            reserveMapper.updateById(msReserve);
            System.out.println("已更新主表预约人数: resId=" + detial.getResId() + ", 人数=" + validCount);
            
            // 2. 更新预约时间段表的已预约人数
            // 2.1 查找对应的时间段记录
            QueryWrapper<MsReserveTimes> timesQueryWrapper = new QueryWrapper<>();
            timesQueryWrapper.lambda()
                    .eq(MsReserveTimes::getReserveId, detial.getResId())
                    .eq(MsReserveTimes::getResDate, detial.getResDate())
                    .eq(MsReserveTimes::getResTime, detial.getResTime());
            
            MsReserveTimes reserveTimes = reserveTimesService.getOne(timesQueryWrapper);
            if (reserveTimes != null) {
                // 2.2 更新时间段记录的已预约人数和场次信息
                reserveTimes.setBookedSlots(validCount);
                
                // 确保场次信息正确
                if (reserveTimes.getResSession() == null || !reserveTimes.getResSession().equals(detial.getResSession())) {
                    reserveTimes.setResSession(detial.getResSession());
                    System.out.println("更正场次信息: " + reserveTimes.getResTime() + " -> " + detial.getResSession());
                }
                
                reserveTimesService.updateById(reserveTimes);
                System.out.println("已更新时间段表预约人数: id=" + reserveTimes.getId() + 
                                  ", 日期=" + reserveTimes.getResDate() + 
                                  ", 时间=" + reserveTimes.getResTime() + 
                                  ", 场次=" + reserveTimes.getResSession() + 
                                  ", 人数=" + validCount);
            } else {
                System.err.println("未找到对应时间段记录: resId=" + detial.getResId() + 
                                  ", 日期=" + detial.getResDate() + 
                                  ", 时间=" + detial.getResTime());
            }
        } catch (Exception e) {
            System.err.println("更新预约人数出错: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 删除预约详情记录
     * @param id 预约详情ID
     * @throws Exception 
     */
    public void delDetail(Integer id) throws Exception {
        // 先查询预约详情
        MsReserveDetial reserveDetial = getById(id);
        if (reserveDetial == null) {
            ExcepUtil.throwErr("预约详情不存在");
        }
        
        // 获取预约记录ID
        String resId = reserveDetial.getResId();
        
        // 删除预约详情
        removeById(id);
        System.out.println("已删除预约详情，ID: " + id);
        
        try {
            // 更新预约人数计数
            if (resId != null && !resId.isEmpty()) {
                // 查询当前有效预约人数
                QueryWrapper<MsReserveDetial> detialQueryWrapper = new QueryWrapper<>();
                detialQueryWrapper.lambda()
                        .eq(MsReserveDetial::getResId, resId)
                        .eq(MsReserveDetial::getVldStat, "1");
                
                List<MsReserveDetial> reserveDetials = baseMapper.selectList(detialQueryWrapper);
                Integer validCount = reserveDetials.size();
                
                // 更新主记录的预约人数
                MsReserve msReserve = reserveMapper.selectById(resId);
                if (msReserve != null) {
                    msReserve.setResdSum(validCount);
                    reserveMapper.updateById(msReserve);
                    System.out.println("更新预约记录的预约人数为: " + validCount);
                }
            }
        } catch (Exception e) {
            System.err.println("更新预约人数时出错: " + e.getMessage());
            // 不抛出异常，继续执行
        }
    }
}

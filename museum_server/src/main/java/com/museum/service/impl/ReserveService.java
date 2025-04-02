package com.museum.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.conditions.query.LambdaQueryChainWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.museum.config.ExcepUtil;
import com.museum.config.PageResult;
import com.museum.damain.dto.ReserveQuery;
import com.museum.damain.po.FeedBack;
import com.museum.damain.po.MsCollection;
import com.museum.damain.po.MsReserve;
import com.museum.damain.po.MsReserveDetial;
import com.museum.damain.po.MsReserveTimes;
import com.museum.damain.query.PageQuery;
import com.museum.mapper.CollectionMapper;
import com.museum.mapper.ReserveDetialMapper;
import com.museum.mapper.ReserveMapper;
import com.museum.utils.SpringUtil;
import com.museum.utils.StringUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

/**
 * <p>
 *  服务实现类
 * </p>
 * @since 2023-22-29
 */
@Service
public class ReserveService extends ServiceImpl<ReserveMapper, MsReserve> implements IService<MsReserve> {
    @Resource
    private ReserveDetialMapper reserveDetialMapper;
    @Resource
    CollectionMapper collectionMapper;
    @Resource
    private ReserveTimesService reserveTimesService;
    
    // 预约场次和时间段常量定义
    public static final String SESSION_MORNING = "第一场";
    public static final String SESSION_AFTERNOON = "第二场";
    public static final String TIME_MORNING = "8:30~11:00";
    public static final String TIME_AFTERNOON = "14:30~17:00";
    
    /**
     * 修复所有时间段记录的场次信息
     * 确保所有上午时间段为"第一场"，下午时间段为"第二场"
     */
    public void fixAllTimeSlotSessions() {
        System.out.println("开始修复所有时间段记录的场次信息...");
        
        try {
            // 获取所有时间段记录
            List<MsReserveTimes> allTimeSlots = reserveTimesService.list();
            int fixCount = 0;
            
            for (MsReserveTimes timeSlot : allTimeSlots) {
                String expectedSession = determineSession(timeSlot.getResTime());
                
                // 如果场次信息不正确，更新它
                if (!expectedSession.equals(timeSlot.getResSession())) {
                    System.out.println("修正场次信息: ID=" + timeSlot.getId() + 
                                      ", 时间=" + timeSlot.getResTime() + 
                                      ", 场次从 [" + timeSlot.getResSession() + "] 更正为 [" + expectedSession + "]");
                    
                    timeSlot.setResSession(expectedSession);
                    reserveTimesService.updateById(timeSlot);
                    fixCount++;
                }
            }
            
            System.out.println("场次信息修复完成，共修复 " + fixCount + " 条记录");
        } catch (Exception e) {
            System.err.println("修复场次信息时出错: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * 根据时间段自动设置场次
     * @param resTime 时间段字符串
     * @return 对应的场次
     */
    public String determineSession(String resTime) {
        if (resTime == null || resTime.isEmpty()) {
            return SESSION_MORNING; // 默认为第一场
        }
        
        // 检查时间段格式，判断上午/下午
        if (resTime.contains("8:30") || resTime.contains("8：30") || 
            resTime.contains("9:") || resTime.contains("10:") || 
            resTime.contains("11:00") || resTime.startsWith("8") || 
            resTime.contains("上午") || resTime.contains("早上") || 
            resTime.contains("早场")) {
            return SESSION_MORNING;
        } else if (resTime.contains("14:30") || resTime.contains("14：30") || 
                  resTime.contains("15:") || resTime.contains("16:") || 
                  resTime.contains("17:00") || resTime.contains("下午") || 
                  resTime.contains("晚上") || resTime.contains("晚场")) {
            return SESSION_AFTERNOON;
        }
        
        // 无法确定时，根据时间数字判断
        try {
            // 提取时间段的第一个数字
            String timeStart = resTime.split("[~-]")[0].trim();
            int hour = Integer.parseInt(timeStart.split(":")[0]);
            if (hour < 12) {
                return SESSION_MORNING;
            } else {
                return SESSION_AFTERNOON;
            }
        } catch (Exception e) {
            System.out.println("无法解析时间段: " + resTime + ", 使用默认场次");
            return SESSION_MORNING; // 默认为第一场
        }
    }
    
    /**
     * 获取展品列表
     * @return
     */
    public PageResult<MsReserve> listMsReserve(ReserveQuery pageQuery) {
        try {
            System.out.println("开始执行listMsReserve方法，参数: " + pageQuery);
            
            // 获取符合条件的预约记录
            List<MsReserve> allRecords = new ArrayList<>();
            
            // 检查查询条件
            if (pageQuery.getName() != null && !pageQuery.getName().isEmpty()) {
                // 使用XML中定义的方法进行查询
                allRecords = baseMapper.selectByTitle(pageQuery.getName());
                System.out.println("按标题查询，返回记录数: " + (allRecords != null ? allRecords.size() : 0));
            } else if (pageQuery.getCateId() != null) {
                // 按藏品ID查询
                QueryWrapper<MsReserve> queryWrapper = new QueryWrapper<>();
                queryWrapper.eq("cate_id", pageQuery.getCateId());
                allRecords = baseMapper.selectList(queryWrapper);
                System.out.println("按藏品ID查询，返回记录数: " + (allRecords != null ? allRecords.size() : 0));
            } else {
                // 无条件查询所有
                QueryWrapper<MsReserve> queryWrapper = new QueryWrapper<>();
                // 限制最大记录数，避免数据过多
                queryWrapper.last("LIMIT 1000");
                allRecords = baseMapper.selectList(queryWrapper);
                System.out.println("查询所有记录，返回记录数: " + (allRecords != null ? allRecords.size() : 0));
            }
            
            System.out.println("查询结果总数：" + allRecords.size());
            if (allRecords == null) {
                System.out.println("查询结果为空，创建空列表");
                allRecords = new ArrayList<>();
            }
            
            // 获取所有预约ID
            List<Integer> reserveIds = allRecords.stream()
                .map(MsReserve::getId)
                .collect(Collectors.toList());
            
            // 查询所有预约关联的时间段信息
            Map<Integer, List<MsReserveTimes>> reserveTimesMap = new HashMap<>();
            if (!reserveIds.isEmpty()) {
                QueryWrapper<MsReserveTimes> timesQuery = new QueryWrapper<>();
                timesQuery.in("reserve_id", reserveIds);
                List<MsReserveTimes> allTimes = reserveTimesService.list(timesQuery);
                
                // 按预约ID分组
                for (MsReserveTimes time : allTimes) {
                    if (!reserveTimesMap.containsKey(time.getReserveId())) {
                        reserveTimesMap.put(time.getReserveId(), new ArrayList<>());
                    }
                    reserveTimesMap.get(time.getReserveId()).add(time);
                }
            }
            
            // 为每个预约记录设置关联的时间段信息
            for (MsReserve reserve : allRecords) {
                List<MsReserveTimes> times = reserveTimesMap.get(reserve.getId());
                if (times != null && !times.isEmpty()) {
                    List<Map<String, Object>> timesList = new ArrayList<>();
                    for (MsReserveTimes time : times) {
                        Map<String, Object> timeMap = new HashMap<>();
                        timeMap.put("id", time.getId());
                        timeMap.put("resDate", time.getResDate());
                        timeMap.put("resTime", time.getResTime());
                        timeMap.put("resSession", time.getResSession());
                        timeMap.put("availableSlots", time.getAvailableSlots());
                        timeMap.put("bookedSlots", time.getBookedSlots());
                        timeMap.put("status", time.getStatus());
                        timesList.add(timeMap);
                    }
                    reserve.setReserveTimes(timesList);
                    reserve.setHasMultipleTimes(true);
                }
            }
            
            System.out.println("分组处理后，展示记录数: " + allRecords.size());
            
            // 确保pagenum和pagesize有效
            if (pageQuery.getPagenum() <= 0) {
                pageQuery.setPagenum(1);
            }
            if (pageQuery.getPagesize() <= 0) {
                pageQuery.setPagesize(10);
            }
            
            // 手动分页
            int start = (pageQuery.getPagenum() - 1) * pageQuery.getPagesize();
            int end = Math.min(start + pageQuery.getPagesize(), allRecords.size());
            
            List<MsReserve> pagedRecords = start < allRecords.size() ? 
                    allRecords.subList(start, end) : new ArrayList<>();
            
            System.out.println("分页后，返回记录数: " + pagedRecords.size());
            
            // 创建Page对象
            Page<MsReserve> page = new Page<>(pageQuery.getPagenum(), pageQuery.getPagesize());
            page.setTotal(allRecords.size());
            page.setRecords(pagedRecords);
            
            return PageResult.of(page, pagedRecords);
        } catch (Exception e) {
            // 记录异常并返回空结果
            e.printStackTrace();
            System.err.println("获取预约列表时发生错误: " + e.getMessage());
            
            // 创建空Page对象
            Page<MsReserve> emptyPage = new Page<>(pageQuery.getPagenum(), pageQuery.getPagesize());
            emptyPage.setTotal(0);
            emptyPage.setRecords(new ArrayList<>());
            
            return PageResult.of(emptyPage, new ArrayList<>());
        }
    }

    public PageResult<MsReserve> listTop(PageQuery pageQuery) {
        if("近期解说".equals(pageQuery.getMenuName())) {
            Page<MsReserve> page = lambdaQuery().orderByDesc(MsReserve::getCrtTm).page(pageQuery.toMpPage());
            return PageResult.of(page, page.getRecords());
        } else if("热门解说".equals(pageQuery.getMenuName())) {
            Page<MsReserve> page = lambdaQuery().orderByDesc(MsReserve::getResdSum).page(pageQuery.toMpPage());
            return PageResult.of(page, page.getRecords());
        }
        return null;
    }

    /**
     * 编辑预约信息
     * @param msReserve
     */
    public void editMsReserve(MsReserve msReserve) {
        // 确保状态字段不为空
        if (msReserve.getStatus() == null) {
            msReserve.setStatus(1); // 默认为"即将开始"
        }
        
        // 如果是编辑请求且未提供hasMultipleTimes字段，需要判断是否有多个时间段
        if (msReserve.getId() != null && msReserve.getHasMultipleTimes() == null) {
            // 查询该预约是否有多个时间段
            QueryWrapper<MsReserveTimes> timesQuery = new QueryWrapper<>();
            timesQuery.eq("reserve_id", msReserve.getId());
            timesQuery.last("LIMIT 2"); // 只需要判断是否有多于1条记录
            
            List<MsReserveTimes> timesList = reserveTimesService.list(timesQuery);
            msReserve.setHasMultipleTimes(timesList != null && timesList.size() > 1);
            
            System.out.println("检测到预约ID: " + msReserve.getId() + " 是否有多个时间段: " + msReserve.getHasMultipleTimes());
        }
        
        msReserve.setCrtTm(StringUtils.getNowDateTIme());
        
        // 单记录更新
        updateById(msReserve);
        System.out.println("更新预约记录成功，ID: " + msReserve.getId() + ", 多时间段标志: " + msReserve.getHasMultipleTimes());
        
        // 处理时间段记录
        if (msReserve.getReserveTimes() != null && !msReserve.getReserveTimes().isEmpty()) {
            saveReserveTimes(msReserve.getId(), msReserve.getReserveTimes());
        }
    }

    /**
     * 添加预约
     * @param reserve
     */
    public void addMsReserve(MsReserve reserve) throws Exception {
        System.out.println("开始添加预约: " + reserve.getTitle());
        
        // 检查是否包含多个时间段
        boolean hasMultipleTimes = reserve.getReserveTimes() != null && !reserve.getReserveTimes().isEmpty() 
                                  && reserve.getReserveTimes().size() > 1;
        
        // 如果有多个时间段，合并日期、时间和场次信息
        if (hasMultipleTimes) {
            System.out.println("处理多时间段预约，共 " + reserve.getReserveTimes().size() + " 个时间段");
            
            // 收集所有日期、时间和场次
            Set<String> dates = new HashSet<>();
            Set<String> times = new HashSet<>();
            Set<String> sessions = new HashSet<>();
            
            for (Map<String, Object> timeSlot : reserve.getReserveTimes()) {
                String date = (String) timeSlot.get("resDate");
                String time = (String) timeSlot.get("resTime");
                String session = (String) timeSlot.get("resSession");
                
                if (date != null && !date.isEmpty()) {
                    dates.add(date);
                }
                
                if (time != null && !time.isEmpty()) {
                    times.add(time);
                }
                
                // 自动设置场次（如果为空）
                if (session == null || session.isEmpty()) {
                    session = determineSession(time);
                    timeSlot.put("resSession", session);
                }
                
                if (session != null && !session.isEmpty()) {
                    sessions.add(session);
                }
            }
            
            // 合并日期（如：3.20~3.22）
            if (!dates.isEmpty()) {
                List<String> sortedDates = new ArrayList<>(dates);
                Collections.sort(sortedDates);
                
                if (sortedDates.size() == 1) {
                    reserve.setResDate(sortedDates.get(0));
                } else {
                    reserve.setResDate(sortedDates.get(0) + "~" + sortedDates.get(sortedDates.size() - 1));
                }
                
                System.out.println("合并后的日期: " + reserve.getResDate());
            }
            
            // 合并时间段（如：8:30-11:00~14:30-17:00）
            if (!times.isEmpty()) {
                List<String> sortedTimes = new ArrayList<>(times);
                Collections.sort(sortedTimes);
                
                if (sortedTimes.size() == 1) {
                    reserve.setResTime(sortedTimes.get(0));
                } else {
                    reserve.setResTime(String.join("~", sortedTimes));
                }
                
                System.out.println("合并后的时间段: " + reserve.getResTime());
            }
            
            // 合并场次（如：第一场~第二场）
            if (!sessions.isEmpty()) {
                List<String> sortedSessions = new ArrayList<>(sessions);
                Collections.sort(sortedSessions);
                
                if (sortedSessions.size() == 1) {
                    reserve.setResSession(sortedSessions.get(0));
                } else {
                    reserve.setResSession(String.join("~", sortedSessions));
                }
                
                System.out.println("合并后的场次: " + reserve.getResSession());
            }
            
            // 设置为多时间段预约
            reserve.setHasMultipleTimes(true);
        } else {
            // 单个时间段的情况，设置预约场次
            if (reserve.getResSession() == null || reserve.getResSession().isEmpty()) {
                reserve.setResSession(determineSession(reserve.getResTime()));
                System.out.println("自动设置预约场次: " + reserve.getResSession());
            } else {
                System.out.println("使用提供的预约场次: " + reserve.getResSession());
            }
            
            reserve.setHasMultipleTimes(false);
        }
        
        // 判断是否已有相同日期和时间的预约
        QueryWrapper<MsReserve> queryWrapper = new QueryWrapper<>();
        queryWrapper.lambda()
                .eq(reserve.getResDate() != null, MsReserve::getResDate, reserve.getResDate())
                .eq(reserve.getResTime() != null, MsReserve::getResTime, reserve.getResTime());
                
        if (reserve.getExhibitionId() != null) {
            queryWrapper.lambda().eq(MsReserve::getExhibitionId, reserve.getExhibitionId());
        }

        MsReserve existingReserve = getOne(queryWrapper, false);
        if (existingReserve != null) {
            System.out.println("已存在相同展览、日期和时间的预约，ID: " + existingReserve.getId());
            
            // 更新多时间段标志
            if (hasMultipleTimes && !existingReserve.getHasMultipleTimes()) {
                existingReserve.setHasMultipleTimes(true);
                updateById(existingReserve);
                System.out.println("更新预约记录为多时间段预约");
            }
            
            // 返回已存在预约的ID
            reserve.setId(existingReserve.getId());
            
            // 如果是多时间段预约，仍然需要处理时间段信息
            if (hasMultipleTimes) {
                saveReserveTimes(existingReserve.getId(), reserve.getReserveTimes());
            }
            
            return;
        }

        // 设置创建时间
        reserve.setCrtTm(StringUtils.getNowDateTIme());
        
        // 保存主预约记录
        save(reserve);
        System.out.println("预约记录保存成功，ID: " + reserve.getId() + 
                         ", 是否多时间段: " + reserve.getHasMultipleTimes());
        
        // 保存预约时间段信息
        if (reserve.getReserveTimes() != null && !reserve.getReserveTimes().isEmpty()) {
            saveReserveTimes(reserve.getId(), reserve.getReserveTimes());
        } else {
            // 若没有传入多个时间段，则创建一个默认的时间段记录
            MsReserveTimes times = new MsReserveTimes();
            times.setReserveId(reserve.getId());
            times.setResDate(reserve.getResDate());
            times.setResTime(reserve.getResTime());
            times.setResSession(reserve.getResSession()); // 使用已设置的场次
            times.setAvailableSlots(reserve.getResSum());
            times.setBookedSlots(0);
            times.setIsPublished(true);
            times.setCreateTime(new Date());
            times.setUpdateTime(new Date());
            times.setStatus("即将开始");
            
            reserveTimesService.save(times);
            System.out.println("已保存默认预约时间段记录，场次: " + times.getResSession());
        }
    }

    /**
     * 根据日期和时间判断预约状态
     * @param resDate 预约日期
     * @param resTime 预约时间段
     * @return 状态对象，包含数字状态码和文本状态
     */
    private Map<String, Object> determineStatus(String resDate, String resTime) {
        Map<String, Object> result = new HashMap<>();
        try {
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            Date reserveDate = dateFormat.parse(resDate);
            Date today = new Date();
            
            // 提取时间段的结束时间
            String endTime = "17:00"; // 默认结束时间
            if (resTime != null) {
                String[] parts = resTime.split("[~-]");
                if (parts.length > 1) {
                    endTime = parts[1].trim();
                }
            }
            
            // 组合日期和时间
            SimpleDateFormat dateTimeFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm");
            Date reserveEndTime = dateTimeFormat.parse(resDate + " " + endTime);
            
            // 判断状态
            if (today.before(reserveDate)) {
                // 如果今天在预约日期之前
                result.put("code", 1);
                result.put("text", "即将开始");
            } else if (today.after(reserveEndTime)) {
                // 如果今天在预约结束时间之后
                result.put("code", 3);
                result.put("text", "已结束");
            } else {
                // 如果今天是预约当天且在结束时间之前
                result.put("code", 2);
                result.put("text", "进行中");
            }
        } catch (Exception e) {
            // 解析出错时使用默认值
            result.put("code", 1);
            result.put("text", "即将开始");
            System.err.println("判断预约状态时出错: " + e.getMessage());
        }
        return result;
    }

    /**
     * 根据日期范围判断主记录状态
     * @param reserveId 预约ID
     * @return 状态码
     */
    private Integer determineMainRecordStatus(Integer reserveId) {
        try {
            // 查询该预约ID下的所有时间段
            QueryWrapper<MsReserveTimes> timesQuery = new QueryWrapper<>();
            timesQuery.eq("reserve_id", reserveId);
            List<MsReserveTimes> timeSlots = reserveTimesService.list(timesQuery);
            
            if (timeSlots == null || timeSlots.isEmpty()) {
                System.out.println("预约ID " + reserveId + " 没有关联的时间段记录，使用默认状态");
                return 1; // 默认为即将开始
            }
            
            // 获取当前日期（不含时间）
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            Date today = dateFormat.parse(dateFormat.format(new Date()));
            
            // 找出最早和最晚的预约日期
            Date earliestDate = null;
            Date latestDate = null;
            
            for (MsReserveTimes slot : timeSlots) {
                if (slot.getResDate() == null) continue;
                
                Date slotDate = dateFormat.parse(slot.getResDate());
                
                if (earliestDate == null || slotDate.before(earliestDate)) {
                    earliestDate = slotDate;
                }
                if (latestDate == null || slotDate.after(latestDate)) {
                    latestDate = slotDate;
                }
            }
            
            if (earliestDate == null || latestDate == null) {
                System.out.println("预约ID " + reserveId + " 的时间段日期无效，使用默认状态");
                return 1;
            }
            
            // 判断状态
            if (today.before(earliestDate)) {
                // 当前日期在最早预约日期之前
                return 1; // 即将开始
            } else if (today.after(latestDate)) {
                // 当前日期在最晚预约日期之后
                return 3; // 已结束
            } else {
                // 当前日期在预约日期范围内
                return 2; // 进行中
            }
            
        } catch (Exception e) {
            System.err.println("判断主记录状态时出错: " + e.getMessage());
            return 1; // 发生错误时使用默认状态
        }
    }

    // 保存预约时间段记录
    private void saveReserveTimes(Integer reserveId, List<Map<String, Object>> reserveTimes) {
        // 检查参数有效性
        if (reserveId == null || reserveTimes == null || reserveTimes.isEmpty()) {
            System.out.println("警告: 无效的预约时间段参数");
            return;
        }
        
        try {
            System.out.println("开始处理 " + reserveTimes.size() + " 个预约时间段");
            
            List<MsReserveTimes> timesList = new ArrayList<>();
            Set<String> uniqueTimeSlots = new HashSet<>();
            
            for (Map<String, Object> timeMap : reserveTimes) {
                String resDate = (String) timeMap.get("resDate");
                String resTime = (String) timeMap.get("resTime");
                String resSession = (String) timeMap.get("resSession");
                
                // 跳过无效的时间段数据
                if (resDate == null || resTime == null) {
                    System.out.println("警告: 跳过无效的时间段数据: " + timeMap);
                    continue;
                }
                
                // 自动设置场次（如果为空）
                if (resSession == null || resSession.isEmpty()) {
                    resSession = determineSession(resTime);
                    System.out.println("时间段自动设置场次: " + resTime + " → " + resSession);
                }
                
                // 检查是否重复，使用日期+时间作为唯一标识
                String timeSlotKey = resDate + "-" + resTime;
                if (!uniqueTimeSlots.add(timeSlotKey)) {
                    System.out.println("警告: 跳过重复的时间段: " + timeSlotKey);
                    continue;
                }
                
                // 判断单个时间段的状态
                Map<String, Object> status = determineStatus(resDate, resTime);
                String statusText = (String) status.get("text");
                
                MsReserveTimes times = new MsReserveTimes();
                times.setReserveId(reserveId);
                times.setResDate(resDate);
                times.setResTime(resTime);
                times.setResSession(resSession);
                times.setStatus(statusText);
                
                // 安全地转换availableSlots - 处理不同类型的情况
                Object availableSlotsObj = timeMap.getOrDefault("availableSlots", 0);
                if (availableSlotsObj instanceof Integer) {
                    times.setAvailableSlots((Integer) availableSlotsObj);
                } else if (availableSlotsObj instanceof String) {
                    try {
                        times.setAvailableSlots(Integer.parseInt((String) availableSlotsObj));
                    } catch (NumberFormatException e) {
                        // 如果字符串无法转换为整数，使用默认值
                        times.setAvailableSlots(0);
                        System.out.println("警告: 无法将值 '" + availableSlotsObj + "' 转换为整数, 使用默认值0");
                    }
                } else if (availableSlotsObj instanceof Number) {
                    times.setAvailableSlots(((Number) availableSlotsObj).intValue());
                } else {
                    // 如果是其他类型，使用默认值
                    times.setAvailableSlots(0);
                    System.out.println("警告: 未知类型的availableSlots值: " + 
                        (availableSlotsObj != null ? availableSlotsObj.getClass().getName() : "null") + 
                        ", 使用默认值0");
                }
                
                times.setBookedSlots(0);
                times.setIsPublished(true);
                times.setCreateTime(new Date());
                times.setUpdateTime(new Date());
                
                timesList.add(times);
                System.out.println("添加时间段: " + timeSlotKey + ", 状态: " + statusText);
            }
            
            if (!timesList.isEmpty()) {
                System.out.println("准备保存 " + timesList.size() + " 个预约时间段");
                reserveTimesService.batchSaveReserveTimes(reserveId, timesList);
                
                // 根据日期范围更新主记录状态
                Integer mainStatus = determineMainRecordStatus(reserveId);
                MsReserve mainRecord = getById(reserveId);
                if (mainRecord != null && !mainRecord.getStatus().equals(mainStatus)) {
                    mainRecord.setStatus(mainStatus);
                    updateById(mainRecord);
                    System.out.println("更新主记录状态: " + getStatusText(mainStatus));
                }
                
                System.out.println("成功保存 " + timesList.size() + " 个预约时间段");
            } else {
                System.out.println("警告: 没有有效的预约时间段需要保存");
            }
        } catch (Exception e) {
            System.err.println("保存预约时间段时发生错误: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 删除预约记录
     */
    public void delMsReserve(Integer id) throws Exception {
        MsReserve msReserve = baseMapper.selectById(id);
        if(msReserve == null) {
            throw new Exception("找不到原始记录，删除失败！");
        }
        QueryWrapper<MsReserveDetial> detialQueryWrapper = new QueryWrapper<>();
        detialQueryWrapper.lambda().eq(MsReserveDetial::getResId, id).eq(MsReserveDetial::getVldStat,"1");
        List<MsReserveDetial> data = reserveDetialMapper.selectList(detialQueryWrapper);
        if(!data.isEmpty()) {
            ExcepUtil.throwErr("该预约下存在有效的预约记录，无法删除！");
        }
        
        // 删除关联的预约时间记录
        if (reserveTimesService != null) {
            QueryWrapper<MsReserveTimes> timesWrapper = new QueryWrapper<>();
            timesWrapper.eq("reserve_id", id);
            reserveTimesService.remove(timesWrapper);
        }
        
        // 删除主记录
        removeById(id);
    }

    public List<MsReserveDetial> getUserReserve(Integer userId, Integer resId) {
        QueryWrapper<MsReserveDetial> detialQueryWrapper = new QueryWrapper<>();
        if(null != userId) {
            detialQueryWrapper.lambda().eq(MsReserveDetial::getUserId, userId);
        }
        if(null != resId) {
            detialQueryWrapper.lambda().eq(MsReserveDetial::getResId, resId);
        }
        List<MsReserveDetial> detials = reserveDetialMapper.selectList(detialQueryWrapper);
        return detials;
    }
    
    /**
     * 获取展览的可预约时间段和剩余名额
     * @param exhibitionId 展览ID
     * @param date 预约日期（可选）
     * @return 时间段列表
     */
    public List<Map<String, Object>> getReserveTimeSlots(Integer exhibitionId, String date) {
        // 如果未指定日期，使用当前日期
        if (date == null || date.isEmpty()) {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            date = sdf.format(new Date());
        }
        
        System.out.println("获取时间段 - 展览ID: " + exhibitionId + ", 日期: " + date);
        
        List<Map<String, Object>> resultTimeSlots = new ArrayList<>();
        Map<String, Map<String, Object>> uniqueTimeSlots = new HashMap<>(); // 用于去重
        
        // 首先尝试从ms_reserve_times表获取数据
        try {
            // 查询ms_reserve_times表中的数据
            QueryWrapper<MsReserveTimes> timesQuery = new QueryWrapper<>();
            timesQuery.lambda()
                    .eq(MsReserveTimes::getResDate, date)
                    .eq(MsReserveTimes::getIsPublished, true)
                    .orderByAsc(MsReserveTimes::getResTime);
            
            // 如果指定了展览ID，添加展览ID条件
            if (exhibitionId != null) {
                // 先获取该展览的所有预约记录ID
                QueryWrapper<MsReserve> reserveQuery = new QueryWrapper<>();
                reserveQuery.lambda().eq(MsReserve::getExhibitionId, exhibitionId);
                List<MsReserve> reserves = baseMapper.selectList(reserveQuery);
                if (!reserves.isEmpty()) {
                    List<Integer> reserveIds = reserves.stream()
                            .map(MsReserve::getId)
                            .collect(Collectors.toList());
                    timesQuery.lambda().in(MsReserveTimes::getReserveId, reserveIds);
                }
            }
            
            List<MsReserveTimes> reserveTimes = reserveTimesService.list(timesQuery);
            
            System.out.println("ms_reserve_times表查询结果数量: " + (reserveTimes != null ? reserveTimes.size() : 0));
            
            if (reserveTimes != null && !reserveTimes.isEmpty()) {
                // 更新每个时间段的预约人数
                for (MsReserveTimes timeSlot : reserveTimes) {
                    // 生成唯一键：时间段+场次
                    String timeKey = timeSlot.getResTime() + "_" + timeSlot.getResSession();
                    
                    // 如果已存在相同时间段，合并数据
                    if (uniqueTimeSlots.containsKey(timeKey)) {
                        Map<String, Object> existingSlot = uniqueTimeSlots.get(timeKey);
                        // 合并可用名额和已预约人数
                        int totalSlots = (int) existingSlot.get("totalSlots") + timeSlot.getAvailableSlots();
                        int bookedSlots = (int) existingSlot.get("bookedSlots") + timeSlot.getBookedSlots();
                        existingSlot.put("totalSlots", totalSlots);
                        existingSlot.put("bookedSlots", bookedSlots);
                        existingSlot.put("availableSlots", totalSlots - bookedSlots);
                    } else {
                        // 创建新的时间段记录
                        Map<String, Object> timeSlotMap = new HashMap<>();
                        timeSlotMap.put("id", timeSlot.getId());
                        timeSlotMap.put("reserveId", timeSlot.getReserveId());
                        
                        // 分解时间段格式
                        String[] timeParts = new String[2];
                        if (timeSlot.getResTime() != null && timeSlot.getResTime().contains("~")) {
                            timeParts = timeSlot.getResTime().split("~");
                        } else if (timeSlot.getResTime() != null && timeSlot.getResTime().contains("-")) {
                            timeParts = timeSlot.getResTime().split("-");
                        } else {
                            timeParts[0] = timeSlot.getResTime();
                            timeParts[1] = "";
                        }
                        
                        timeSlotMap.put("startTime", timeParts[0].trim());
                        timeSlotMap.put("endTime", timeParts.length > 1 ? timeParts[1].trim() : "");
                        timeSlotMap.put("totalSlots", timeSlot.getAvailableSlots());
                        timeSlotMap.put("bookedSlots", timeSlot.getBookedSlots());
                        timeSlotMap.put("availableSlots", timeSlot.getAvailableSlots() - timeSlot.getBookedSlots());
                        timeSlotMap.put("session", timeSlot.getResSession());
                        timeSlotMap.put("date", timeSlot.getResDate());
                        timeSlotMap.put("timeSlot", timeSlot.getResTime());
                        timeSlotMap.put("isPublished", timeSlot.getIsPublished());
                        timeSlotMap.put("status", timeSlot.getStatus());
                        
                        uniqueTimeSlots.put(timeKey, timeSlotMap);
                    }
                }
                
                // 将去重后的时间段转换为列表
                resultTimeSlots = new ArrayList<>(uniqueTimeSlots.values());
                
                // 按时间排序
                resultTimeSlots.sort((a, b) -> {
                    String timeA = (String) a.get("startTime");
                    String timeB = (String) b.get("startTime");
                    return timeA.compareTo(timeB);
                });
                
                System.out.println("返回去重后的时间段数据: " + resultTimeSlots.size() + " 条");
                return resultTimeSlots;
            }
        } catch (Exception e) {
            System.err.println("从ms_reserve_times表获取数据失败: " + e.getMessage());
            e.printStackTrace();
        }
        
        // 如果ms_reserve_times表中没有数据，返回标准时间段
        return getStandardTimeSlots(date);
    }
    
    /**
     * 获取标准时间段
     * @param date 日期
     * @return 标准时间段列表
     */
    private List<Map<String, Object>> getStandardTimeSlots(String date) {
        List<Map<String, Object>> standardTimeSlots = new ArrayList<>();
        
        // 上午场次
        Map<String, Object> morningSlot = new HashMap<>();
        morningSlot.put("startTime", "8:30");
        morningSlot.put("endTime", "11:00");
        morningSlot.put("totalSlots", 45);
        morningSlot.put("bookedSlots", 0);
        morningSlot.put("availableSlots", 45);
        morningSlot.put("session", SESSION_MORNING);
        morningSlot.put("date", date);
        morningSlot.put("timeSlot", TIME_MORNING);
        morningSlot.put("isPublished", true);
        morningSlot.put("status", "即将开始");
        
        // 下午场次
        Map<String, Object> afternoonSlot = new HashMap<>();
        afternoonSlot.put("startTime", "14:30");
        afternoonSlot.put("endTime", "17:00");
        afternoonSlot.put("totalSlots", 45);
        afternoonSlot.put("bookedSlots", 0);
        afternoonSlot.put("availableSlots", 45);
        afternoonSlot.put("session", SESSION_AFTERNOON);
        afternoonSlot.put("date", date);
        afternoonSlot.put("timeSlot", TIME_AFTERNOON);
        afternoonSlot.put("isPublished", true);
        afternoonSlot.put("status", "即将开始");
        
        standardTimeSlots.add(morningSlot);
        standardTimeSlots.add(afternoonSlot);
        
        return standardTimeSlots;
    }

    /**
     * 获取预约时间服务
     * @return 预约时间服务
     */
    public ReserveTimesService getReserveTimesService() {
        return reserveTimesService;
    }

    /**
     * 获取状态文本
     */
    private String getStatusText(Integer status) {
        if (status == null) return "即将开始";
        
        switch (status) {
            case 0: return "已取消";
            case 1: return "即将开始";
            case 2: return "进行中";
            case 3: return "已结束";
            default: return "未知状态";
        }
    }

    /**
     * 用户预约
     * @param userId 用户ID
     * @param timeSlotId 时间段ID
     * @param userCount 预约人数
     * @return 预约结果
     */
    public Map<String, Object> makeReservation(Integer userId, Integer timeSlotId, Integer userCount) throws Exception {
        Map<String, Object> result = new HashMap<>();
        
        // 1. 获取时间段信息
        MsReserveTimes timeSlot = reserveTimesService.getById(timeSlotId);
        if (timeSlot == null) {
            throw new Exception("预约时间段不存在");
        }
        
        // 2. 检查是否还有剩余名额
        int availableSlots = timeSlot.getAvailableSlots() - timeSlot.getBookedSlots();
        if (availableSlots < userCount) {
            throw new Exception("预约名额不足，剩余" + availableSlots + "个名额");
        }
        
        // 3. 获取主预约记录
        MsReserve mainReserve = getById(timeSlot.getReserveId());
        if (mainReserve == null) {
            throw new Exception("预约记录不存在");
        }
        
        // 4. 创建预约详情记录
        MsReserveDetial detail = new MsReserveDetial();
        detail.setUserId(userId.toString()); // 转换为String
        detail.setResId(timeSlot.getReserveId().toString()); // 转换为String
        detail.setResDate(timeSlot.getResDate());
        detail.setResTime(timeSlot.getResTime());
        detail.setResSession(timeSlot.getResSession());
        detail.setVldStat("1"); // 有效状态
        detail.setResType("展览预约"); // 设置预约类型
        detail.setExhibitionId(mainReserve.getExhibitionId()); // 设置展览ID
        detail.setExhibitionTitle(mainReserve.getTitle()); // 设置展览标题
        
        // 5. 保存预约详情
        reserveDetialMapper.insert(detail);
        
        // 6. 更新时间段已预约人数
        timeSlot.setBookedSlots(timeSlot.getBookedSlots() + userCount);
        reserveTimesService.updateById(timeSlot);
        
        // 7. 更新主记录预约总人数
        mainReserve.setResdSum(mainReserve.getResdSum() + userCount);
        updateById(mainReserve);
        
        // 8. 返回预约结果
        result.put("success", true);
        result.put("message", "预约成功");
        result.put("reservationId", detail.getId());
        result.put("remainingSlots", timeSlot.getAvailableSlots() - timeSlot.getBookedSlots());
        
        return result;
    }
}

package com.museum.controller;


import com.museum.config.JsonResult;
import com.museum.config.PageResult;
import com.museum.damain.dto.ReserveQuery;
import com.museum.damain.po.MsCollection;
import com.museum.damain.po.MsExhibition;
import com.museum.damain.po.MsReserve;
import com.museum.damain.po.MsReserveTimes;
import com.museum.damain.query.PageQuery;
import com.museum.mapper.CollectionMapper;
import com.museum.mapper.ExhibitionCollectionMapper;
import com.museum.service.impl.CollectionService;
import com.museum.service.impl.ExhibitionService;
import com.museum.service.impl.ReserveService;
import com.museum.service.impl.ReserveTimesService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.museum.config.Result;


@RestController
@RequestMapping("/reserve")
@RequiredArgsConstructor
public class ReserveController {

    @Resource
    ReserveService reserveService;

    @Resource
    private ReserveTimesService reserveTimesService;
    
    @Resource
    private ExhibitionService exhibitionService;
    
    @Resource
    private CollectionService collectionService;
    
    @Resource
    private CollectionMapper collectionMapper;
    
    @Resource
    private ExhibitionCollectionMapper exhibitionCollectionMapper;

    @PostMapping("/listMsReserve")
    public JsonResult listMsReserve(@RequestBody ReserveQuery pageQuery) {
        try {
            // 打印请求信息，方便调试
            System.out.println("接收到listMsReserve请求，参数：" + pageQuery);
            
            // 检查参数是否合法
            if (pageQuery == null) {
                System.out.println("警告：接收到空的查询参数");
                pageQuery = new ReserveQuery();
                pageQuery.setPagenum(1);
                pageQuery.setPagesize(10);
            }
            
        PageResult<MsReserve> result = reserveService.listMsReserve(pageQuery);
        return JsonResult.result(result);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("处理listMsReserve请求时发生错误: " + e.getMessage());
            return JsonResult.failResult("获取预约列表失败：" + e.getMessage());
        }
    }

    @PostMapping("/addMsReserve")
    public JsonResult addMsReserve(@RequestBody MsReserve msReserve) {
        try {
            // 检查是否包含多个预约时间段
            boolean hasMultipleTimes = msReserve.getReserveTimes() != null && !msReserve.getReserveTimes().isEmpty();
            if (hasMultipleTimes) {
                System.out.println("正在处理多时段预约，共 " + msReserve.getReserveTimes().size() + " 个时间段");
                // 打印时间段详情，帮助调试
                for (int i = 0; i < msReserve.getReserveTimes().size(); i++) {
                    Map<String, Object> timeSlot = msReserve.getReserveTimes().get(i);
                    System.out.println("时间段 #" + (i+1) + ": " + 
                        "日期=" + timeSlot.get("resDate") + ", " +
                        "时间=" + timeSlot.get("resTime") + ", " +
                        "场次=" + timeSlot.get("resSession") + ", " +
                        "名额=" + timeSlot.get("availableSlots"));
                }
            } else {
                System.out.println("处理单时段预约: " + msReserve.getResDate() + " " + msReserve.getResTime());
            }
            
            // 验证必要字段
            if (msReserve.getTitle() == null || msReserve.getTitle().trim().isEmpty()) {
                return JsonResult.failResult("预约标题不能为空");
            }
            if (msReserve.getExhibitionId() == null) {
                return JsonResult.failResult("必须选择一个展览");
            }
            
            // 添加预约信息
            reserveService.addMsReserve(msReserve);
            
            return JsonResult.result("预约添加成功！" + (hasMultipleTimes ? "已处理多个时间段预约" : ""));
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("添加预约失败: " + e.getMessage());
            return JsonResult.failResult("添加预约失败: " + e.getMessage());
        }
    }

    @PostMapping("/editMsReserve")
    public JsonResult editMsReserve(@RequestBody MsReserve msReserve) {
        try {
            reserveService.editMsReserve(msReserve);
            return JsonResult.result("成功！");
        }catch (Exception e){
            return JsonResult.failResult(e.getMessage());
        }
    }

    /**
     * 删除预约
     * @param id
     * @return
     */
    @GetMapping("/delMsReserve/{id}")
    public JsonResult delMsReserve(@PathVariable Integer id) {
        try {
            // 首先获取要删除的预约记录
            MsReserve msReserve = reserveService.getById(id);
            if (msReserve == null) {
                return new JsonResult(JsonResult.CODE_FAIL, "预约不存在，删除失败", null);
            }
            
            // 删除预约记录
            reserveService.delMsReserve(id);
            
            return new JsonResult(JsonResult.CODE_SUCCESS, "删除成功", null);
        } catch (Exception e) {
            e.printStackTrace();
            return new JsonResult(JsonResult.CODE_FAIL, e.getMessage(), null);
        }
    }
    
    /**
     * 获取展览的可预约时间段
     * @param exhibitionId 展览ID
     * @param date 预约日期（可选）
     * @return 可预约时间段列表
     */
    @GetMapping("/timeslots")
    public JsonResult getReserveTimeSlots(
            @RequestParam Integer exhibitionId, 
            @RequestParam(required = false) String date) {
        try {
            List<Map<String, Object>> timeSlots = reserveService.getReserveTimeSlots(exhibitionId, date);
            return JsonResult.result(timeSlots);
        } catch (Exception e) {
            return JsonResult.failResult(e.getMessage());
        }
    }

    /**
     * 获取预约详情
     * @param id
     * @return
     */
    @GetMapping("/getInfo/{id}")
    public JsonResult getReserveInfo(@PathVariable Integer id) {
        try {
            MsReserve primaryReserve = reserveService.getById(id);
            if (primaryReserve == null) {
                return new JsonResult(JsonResult.CODE_FAIL, "预约不存在", null);
            }
            
            // 查询该预约关联的所有时间段
            QueryWrapper<MsReserveTimes> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("reserve_id", id);
            List<MsReserveTimes> reserveTimes = reserveTimesService.list(queryWrapper);
            
            if (!reserveTimes.isEmpty()) {
                // 有关联的预约时间段，处理为一条记录及其时间段信息
                primaryReserve.setHasMultipleTimes(true);
                
                List<Map<String, Object>> timesList = new ArrayList<>();
                for (MsReserveTimes record : reserveTimes) {
                    Map<String, Object> timeInfo = new HashMap<>();
                    timeInfo.put("id", record.getId());
                    timeInfo.put("resDate", record.getResDate());
                    timeInfo.put("resTime", record.getResTime());
                    timeInfo.put("resSession", record.getResSession());
                    timeInfo.put("availableSlots", record.getAvailableSlots());
                    timeInfo.put("bookedSlots", record.getBookedSlots());
                    timeInfo.put("status", record.getStatus());
                    timesList.add(timeInfo);
                }
                primaryReserve.setReserveTimes(timesList);
            }
            
            // 获取展览信息
            if (primaryReserve.getExhibitionId() != null) {
                MsExhibition exhibition = exhibitionService.getExhibitionDetail(primaryReserve.getExhibitionId());
                if (exhibition != null) {
                    primaryReserve.setExhibition(exhibition);
                    
                    // 获取展览关联的藏品信息
                    List<MsCollection> collections = exhibitionService.getCollectionsByExhibitionId(primaryReserve.getExhibitionId());
                    
                    // 添加调试日志
                    System.out.println("预约 ID: " + id + " 获取到 " + 
                        (collections != null ? collections.size() : 0) + " 个展览关联藏品");
                    
                    if (collections != null && !collections.isEmpty()) {
                        // 打印第一个藏品信息，便于调试
                        MsCollection firstCollection = collections.get(0);
                        System.out.println("第一个藏品信息: ID=" + firstCollection.getId() + 
                                         ", 名称=" + firstCollection.getTitle() + 
                                         ", 图片=" + firstCollection.getColPic() + 
                                         ", 来源=" + firstCollection.getOrigin());
                        
                        Map<String, Object> exhibitionData = new HashMap<>();
                        exhibitionData.put("exhibition", exhibition);
                        exhibitionData.put("collections", collections);
                        primaryReserve.setExhibitionData(exhibitionData);
                    }
                }
            }
            
            // 获取藏品信息
            if (primaryReserve.getCateId() != null) {
                MsCollection msCollection = collectionMapper.selectById(primaryReserve.getCateId());
                
                // 添加调试日志
                if (msCollection != null) {
                    System.out.println("预约关联藏品: ID=" + msCollection.getId() + 
                                     ", 名称=" + msCollection.getTitle() + 
                                     ", 图片=" + msCollection.getColPic() + 
                                     ", 来源=" + msCollection.getOrigin());
                    
                    primaryReserve.setCollection(msCollection);
                    
                    // 处理藏品图片路径
                    if (msCollection.getColPic() != null && !msCollection.getColPic().isEmpty() 
                        && !msCollection.getColPic().startsWith("http://") && !msCollection.getColPic().startsWith("https://")) {
                        // 确保图片路径可用
                        if (!msCollection.getColPic().startsWith("/")) {
                            msCollection.setColPic("/" + msCollection.getColPic());
                        }
                    }
                    
                    System.out.println("为预约ID: " + primaryReserve.getId() + 
                                       " 添加藏品信息: ID=" + msCollection.getId() + 
                                       ", 名称=" + msCollection.getTitle() + 
                                       ", 图片=" + msCollection.getColPic());
                }
            }
            
            return new JsonResult(JsonResult.CODE_SUCCESS, JsonResult.MSG_SUCCESS, primaryReserve);
        } catch (Exception e) {
            e.printStackTrace();
            return new JsonResult(JsonResult.CODE_FAIL, "获取预约详情失败: " + e.getMessage(), null);
        }
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

    @PostMapping("/getList")
    public JsonResult getReserveList(@RequestBody ReserveQuery pageQuery) {
        PageResult<MsReserve> pages = reserveService.listMsReserve(pageQuery);
        
        // 遍历结果，为每个预约添加藏品信息
        List<MsReserve> reserveList = pages.getList();
        if (reserveList != null && !reserveList.isEmpty()) {
            for (MsReserve reserve : reserveList) {
                // 如果有关联藏品ID，获取藏品信息
                if (reserve.getCateId() != null) {
                    MsCollection collection = collectionMapper.selectById(reserve.getCateId());
                    if (collection != null) {
                        // 将藏品信息添加到预约对象中
                        reserve.setCollection(collection);
                        
                        // 处理藏品图片路径
                        if (collection.getColPic() != null && !collection.getColPic().isEmpty() 
                            && !collection.getColPic().startsWith("http://") && !collection.getColPic().startsWith("https://")) {
                            // 确保图片路径可用
                            if (!collection.getColPic().startsWith("/")) {
                                collection.setColPic("/" + collection.getColPic());
                            }
                        }
                        
                        System.out.println("为预约ID: " + reserve.getId() + 
                                           " 添加藏品信息: ID=" + collection.getId() + 
                                           ", 名称=" + collection.getTitle() + 
                                           ", 图片=" + collection.getColPic());
                    }
                }
            }
        }
        
        return JsonResult.result(pages);
    }

    @GetMapping("/refreshBookedSlots")
    public JsonResult refreshBookedSlots(
            @RequestParam(required = false) Integer reserveId, 
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String time) {
        try {
            if (reserveId != null && date != null && time != null) {
                // 更新指定预约的时间段
                boolean success = reserveTimesService.updateBookedSlotsByReserveId(reserveId, date, time);
                return new JsonResult(JsonResult.CODE_SUCCESS, 
                                     "更新预约人数" + (success ? "成功" : "失败"), 
                                     success);
            } else {
                // 更新所有时间段
                int count = reserveTimesService.refreshAllBookedSlots();
                return new JsonResult(JsonResult.CODE_SUCCESS, 
                                     "成功更新 " + count + " 个时间段的预约人数", 
                                     count);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new JsonResult(JsonResult.CODE_FAIL, 
                                 "更新预约人数失败: " + e.getMessage(), 
                                 null);
        }
    }

    @PostMapping("/getUserReserve")
    public JsonResult getUserReserve(@RequestBody ReserveQuery pageQuery) {
        try {
            PageResult<MsReserve> result = reserveService.listMsReserve(pageQuery);
            return JsonResult.result(result);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("处理getUserReserve请求时发生错误: " + e.getMessage());
            return JsonResult.failResult("获取用户预约列表失败：" + e.getMessage());
        }
    }

    /**
     * 用户预约接口
     */
    @PostMapping("/make")
    public Result<?> makeReservation(@RequestBody Map<String, Object> params) {
        try {
            // 参数验证
            Object userIdObj = params.get("userId");
            Object timeSlotIdObj = params.get("timeSlotId");
            Object userCountObj = params.getOrDefault("userCount", 1);
            
            Integer userId = (userIdObj instanceof Number) ? ((Number) userIdObj).intValue() : null;
            Integer timeSlotId = (timeSlotIdObj instanceof Number) ? ((Number) timeSlotIdObj).intValue() : null;
            Integer userCount = (userCountObj instanceof Number) ? ((Number) userCountObj).intValue() : 1;
            
            if (userId == null || timeSlotId == null) {
                return Result.error("缺少必要参数");
            }
            
            // 调用预约服务
            Map<String, Object> result = reserveService.makeReservation(userId, timeSlotId, userCount);
            return Result.success(result);
            
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}

package com.museum.damain.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.util.Date;

@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("ms_reserve_times")
/**
 * 预约时间表实体类
 * 
 * 注意：数据库表中存在唯一约束 uk_reserve_date_time，组合了reserve_id, res_date, res_time字段
 * 在批量保存时需要注意避免重复插入相同的组合，否则会引发唯一约束冲突错误
 */
public class MsReserveTimes implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;
    
    private Integer reserveId; // 关联的预约ID
    private String resDate; // 预约日期
    private String resTime; // 预约时间段
    private String resSession; // 场次信息
    private Integer availableSlots; // 可用名额数
    private Integer bookedSlots; // 已预约名额数
    private Boolean isPublished; // 是否已发布
    private Date createTime; // 创建时间
    private Date updateTime; // 更新时间
    private String status; // 预约状态：已结束、进行中、即将开始
    
    // 临时字段，用于前端传递
    @TableField(exist = false)
    private Integer resSum; // 可预约人数
} 
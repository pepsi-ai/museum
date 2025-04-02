package com.museum.damain.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("ms_reserve")
/**
 * 预约实体类
 */
public class MsReserve implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;
    
    private Integer exhibitionId; // 关联的展览ID
    private String title;
    private String resTyp;
    private Integer cateId;
    private String cateName;
    private Integer resSum = 0; // 默认值
    private String resDate;
    private String resTime;
    private String resSession;
    private String resDes;
    private Integer resdSum = 0; // 默认值
    private String crtTm;
    private Integer status = 1; // 预约状态：0-已取消，1-即将开始，2-进行中，3-已结束，默认为1
    
    @TableField("has_multiple_times")
    private Boolean hasMultipleTimes = false; // 是否有多个时间段：0表示没有，1表示有
    
    @TableField(exist = false)
    private Integer[] cateIds;
    
    @TableField(exist = false)
    private MsExhibition exhibition; // 关联的展览信息
    
    @TableField(exist = false)
    private List<Map<String, Object>> reserveTimes; // 多个预约时间段信息
    
    @TableField(exist = false)
    private MsCollection collection; // 关联的藏品信息
    
    @TableField(exist = false)
    private Map<String, Object> exhibitionData; // 展览和展品关联数据
}

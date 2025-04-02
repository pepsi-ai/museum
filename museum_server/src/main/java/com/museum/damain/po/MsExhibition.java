package com.museum.damain.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;

@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("ms_exhibition")
/**
 * 展览实体类
 */
public class MsExhibition implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;
    
    private String title;        // 展览标题
    private String description;  // 展览描述
    private String startDate;    // 开始日期
    private String endDate;      // 结束日期
    private String location;     // 展览地点
    private String status;       // 展览状态：upcoming(即将开始), ongoing(进行中), ended(已结束)
    private String colPic;       // 展览主图路径
    private String crtTm;        // 创建时间
    
    @TableField(exist = false)
    private Integer[] collectionIds; // 关联的藏品ID列表
} 
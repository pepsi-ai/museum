package com.museum.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.museum.config.PageResult;
import com.museum.damain.po.MsCollection;
import com.museum.damain.po.MsExhibition;
import com.museum.damain.po.MsExhibitionCollection;
import com.museum.damain.po.MsReserve;
import com.museum.damain.query.PageQuery;
import com.museum.mapper.CollectionMapper;
import com.museum.mapper.ExhibitionCollectionMapper;
import com.museum.mapper.ExhibitionMapper;
import com.museum.mapper.ReserveMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
public class ExhibitionService {

    @Resource
    private ExhibitionMapper exhibitionMapper;
    
    @Resource
    private ExhibitionCollectionMapper exhibitionCollectionMapper;
    
    @Resource
    private CollectionMapper collectionMapper;
    
    @Resource
    private ReserveMapper reserveMapper;
    
    /**
     * 分页查询展览列表
     * @param pageQuery 分页查询参数
     * @return 分页结果
     */
    public PageResult<MsExhibition> listExhibitions(PageQuery pageQuery) {
        Page<MsExhibition> page = new Page<>(pageQuery.getPagenum(), pageQuery.getPagesize());
        
        QueryWrapper<MsExhibition> queryWrapper = new QueryWrapper<>();
        // 如果有标题查询条件
        if (pageQuery.getName() != null && !pageQuery.getName().isEmpty()) {
            queryWrapper.like("title", pageQuery.getName());
        }
        
        // 按ID倒序排序
        queryWrapper.orderByDesc("id");
        
        Page<MsExhibition> resultPage = exhibitionMapper.selectPage(page, queryWrapper);
        
        return PageResult.of(resultPage);
    }
    
    /**
     * 获取所有展览列表
     * @return 展览列表
     */
    public List<MsExhibition> getAllExhibitions() {
        return exhibitionMapper.getAllExhibitions();
    }
    
    /**
     * 获取展览详情
     * @param id 展览ID
     * @return 展览详情
     */
    public MsExhibition getExhibitionDetail(Integer id) {
        MsExhibition exhibition = exhibitionMapper.selectById(id);
        if (exhibition != null) {
            // 获取关联的藏品ID列表
            List<Integer> collectionIds = exhibitionCollectionMapper.selectCollectionIdsByExhibitionId(id);
            exhibition.setCollectionIds(collectionIds.toArray(new Integer[0]));
        }
        return exhibition;
    }
    
    /**
     * 添加展览
     * @param exhibition 展览信息
     */
    @Transactional
    public void addExhibition(MsExhibition exhibition) {
        // 设置创建时间
        exhibition.setCrtTm(new SimpleDateFormat("yyyy/MM/dd HH:mm:ss").format(new Date()));
        
        // 保存展览基本信息
        exhibitionMapper.insert(exhibition);
        
        // 保存展览藏品关系
        saveExhibitionCollections(exhibition);
    }
    
    /**
     * 更新展览
     * @param exhibition 展览信息
     */
    @Transactional
    public void updateExhibition(MsExhibition exhibition) {
        // 更新展览基本信息
        exhibitionMapper.updateById(exhibition);
        
        // 删除旧的关联关系
        exhibitionCollectionMapper.deleteByExhibitionId(exhibition.getId());
        
        // 保存新的关联关系
        saveExhibitionCollections(exhibition);
    }
    
    /**
     * 删除展览
     * @param id 展览ID
     */
    @Transactional
    public void deleteExhibition(Integer id) {
        // 获取展览信息，检查状态
        MsExhibition exhibition = exhibitionMapper.selectById(id);
        if (exhibition == null) {
            throw new RuntimeException("展览不存在");
        }
        
        // 检查已结束展览是否有关联预约记录
        if ("finished".equals(exhibition.getStatus())) {
            // 查询是否有关联的预约记录
            QueryWrapper<MsReserve> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("exhibition_id", id);
            int count = reserveMapper.selectCount(queryWrapper);
            
            if (count > 0) {
                throw new RuntimeException("已结束的展览存在关联的预约记录，无法删除");
            }
        }
        
        // 删除关联关系
        exhibitionCollectionMapper.deleteByExhibitionId(id);
        
        // 删除展览
        exhibitionMapper.deleteById(id);
    }
    
    /**
     * 保存展览藏品关系
     * @param exhibition 展览信息
     */
    private void saveExhibitionCollections(MsExhibition exhibition) {
        if (exhibition.getCollectionIds() != null && exhibition.getCollectionIds().length > 0) {
            List<MsExhibitionCollection> relations = new ArrayList<>();
            String crtTm = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss").format(new Date());
            
            for (Integer collectionId : exhibition.getCollectionIds()) {
                MsExhibitionCollection relation = new MsExhibitionCollection();
                relation.setExhibitionId(exhibition.getId());
                relation.setCollectionId(collectionId);
                relation.setCrtTm(crtTm);
                relations.add(relation);
            }
            
            exhibitionCollectionMapper.batchInsert(relations);
        }
    }
    
    /**
     * 根据展览ID获取关联的藏品列表
     * @param exhibitionId 展览ID
     * @return 藏品列表
     */
    public List<MsCollection> getCollectionsByExhibitionId(Integer exhibitionId) {
        // 获取关联的藏品ID列表
        List<Integer> collectionIds = exhibitionCollectionMapper.selectCollectionIdsByExhibitionId(exhibitionId);
        
        // 如果没有关联藏品，返回空列表
        if (collectionIds == null || collectionIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        // 查询藏品详情
        QueryWrapper<MsCollection> queryWrapper = new QueryWrapper<>();
        queryWrapper.in("id", collectionIds);
        
        List<MsCollection> collections = collectionMapper.selectList(queryWrapper);
        
        // 打印日志，方便调试
        System.out.println("展览ID: " + exhibitionId + " 关联的藏品数量: " + 
                          (collections != null ? collections.size() : 0));
        
        if (collections != null && !collections.isEmpty()) {
            // 处理每个藏品的图片路径
            for (MsCollection collection : collections) {
                // 检查藏品图片路径是否存在且不包含基础URL
                if (collection.getColPic() != null && !collection.getColPic().isEmpty() 
                    && !collection.getColPic().startsWith("http://") && !collection.getColPic().startsWith("https://")) {
                    // 确保图片路径可用
                    if (!collection.getColPic().startsWith("/")) {
                        collection.setColPic("/" + collection.getColPic());
                    }
                }
                
                System.out.println("藏品ID: " + collection.getId() + 
                                 ", 名称: " + collection.getTitle() + 
                                 ", 图片: " + (collection.getColPic() != null ? collection.getColPic() : "无") +
                                 ", 来源: " + collection.getOrigin() +
                                 ", 介绍长度: " + (collection.getDesColl() != null ? collection.getDesColl().length() : 0));
            }
        }
        
        return collections;
    }
} 
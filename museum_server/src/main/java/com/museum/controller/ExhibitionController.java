package com.museum.controller;

import com.museum.config.JsonResult;
import com.museum.config.PageResult;
import com.museum.damain.po.MsCollection;
import com.museum.damain.po.MsExhibition;
import com.museum.damain.query.PageQuery;
import com.museum.service.impl.CollectionService;
import com.museum.service.impl.ExhibitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/exhibition")
@RequiredArgsConstructor
@CrossOrigin // 添加跨域支持
public class ExhibitionController {
    
    @Resource
    private ExhibitionService exhibitionService;
    
    @Resource
    private CollectionService collectionService;
    
    /**
     * 分页查询展览列表
     * @param pageQuery 分页查询参数
     * @return 分页结果
     */
    @PostMapping("/list")
    public JsonResult listExhibitions(@RequestBody PageQuery pageQuery) {
        PageResult<MsExhibition> pageResult = exhibitionService.listExhibitions(pageQuery);
        return JsonResult.resultPage(pageResult);
    }
    
    /**
     * 获取所有展览列表
     * @return 展览列表
     */
    @GetMapping("/all")
    public JsonResult getAllExhibitions() {
        List<MsExhibition> exhibitions = exhibitionService.getAllExhibitions();
        return JsonResult.result(exhibitions);
    }
    
    /**
     * 获取展览详情
     * @param id 展览ID
     * @return 展览详情
     */
    @GetMapping("/detail/{id}")
    public JsonResult getExhibitionDetail(@PathVariable Integer id) {
        MsExhibition exhibition = exhibitionService.getExhibitionDetail(id);
        return JsonResult.result(exhibition);
    }
    
    /**
     * 添加展览
     * @param exhibition 展览信息
     * @return 结果
     */
    @PostMapping("/add")
    public JsonResult addExhibition(@RequestBody MsExhibition exhibition) {
        exhibitionService.addExhibition(exhibition);
        return JsonResult.result(null);
    }
    
    /**
     * 更新展览
     * @param exhibition 展览信息
     * @return 结果
     */
    @PostMapping("/update")
    public JsonResult updateExhibition(@RequestBody MsExhibition exhibition) {
        exhibitionService.updateExhibition(exhibition);
        return JsonResult.result(null);
    }
    
    /**
     * 删除展览
     * @param params 包含展览ID的参数
     * @return 结果
     */
    @PostMapping("/delete")
    public JsonResult deleteExhibition(@RequestBody Map<String, Integer> params) {
        Integer id = params.get("id");
        exhibitionService.deleteExhibition(id);
        return JsonResult.result(null);
    }
    
    /**
     * 获取所有藏品列表，用于展览添加/编辑时选择
     * @return 藏品列表
     */
    @GetMapping("/collections")
    public JsonResult getAllCollections() {
        List<MsCollection> collections = collectionService.getAllCollections();
        return JsonResult.result(collections);
    }
    
    /**
     * 根据展览ID获取相关藏品
     * @param exhibitionId 展览ID
     * @return 相关藏品列表
     */
    @GetMapping("/collections/{exhibitionId}")
    public JsonResult getCollectionsByExhibitionId(@PathVariable Integer exhibitionId) {
        List<MsCollection> collections = exhibitionService.getCollectionsByExhibitionId(exhibitionId);
        return JsonResult.result(collections);
    }
} 
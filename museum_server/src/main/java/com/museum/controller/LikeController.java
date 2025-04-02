package com.museum.controller;

import com.museum.config.JsonResult;
import com.museum.config.PageResult;
import com.museum.damain.po.MsCollection;
import com.museum.damain.po.MsExhibition;
import com.museum.damain.po.MsReserve;
import com.museum.service.impl.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;

/**
 * 用户收藏控制器
 */
@RestController
@RequestMapping("/like")
@RequiredArgsConstructor
@CrossOrigin // 添加跨域支持
public class LikeController {

    @Resource
    private LikeService likeService;
    
    /**
     * 添加藏品收藏
     */
    @PostMapping("/addLikeColl")
    public JsonResult addLikeColl(@RequestBody Map<String, Object> params) {
        try {
            String userId = (String) params.get("userId");
            Integer collId = Integer.valueOf(params.get("collId").toString());
            
            if (userId == null || collId == null) {
                return JsonResult.failResult("参数错误");
            }
            
            boolean result = likeService.addLikeColl(userId, collId);
            return result ? JsonResult.result("收藏成功") : JsonResult.failResult("收藏失败");
        } catch (Exception e) {
            return JsonResult.failResult(e.getMessage());
        }
    }
    
    /**
     * 取消藏品收藏
     */
    @PostMapping("/delLikeColl")
    public JsonResult delLikeColl(@RequestBody Map<String, Object> params) {
        try {
            String userId = (String) params.get("userId");
            Integer collId = Integer.valueOf(params.get("collId").toString());
            
            if (userId == null || collId == null) {
                return JsonResult.failResult("参数错误");
            }
            
            boolean result = likeService.delLikeColl(userId, collId);
            return result ? JsonResult.result("取消收藏成功") : JsonResult.failResult("取消收藏失败");
        } catch (Exception e) {
            return JsonResult.failResult(e.getMessage());
        }
    }
    
    /**
     * 添加展览收藏
     */
    @PostMapping("/addLikeExh")
    public JsonResult addLikeExh(@RequestBody Map<String, Object> params) {
        try {
            String userId = (String) params.get("userId");
            Integer collId = Integer.valueOf(params.get("collId").toString());
            
            if (userId == null || collId == null) {
                return JsonResult.failResult("参数错误");
            }
            
            boolean result = likeService.addLikeExh(userId, collId);
            return result ? JsonResult.result("收藏成功") : JsonResult.failResult("收藏失败");
        } catch (Exception e) {
            return JsonResult.failResult(e.getMessage());
        }
    }
    
    /**
     * 取消展览收藏
     */
    @PostMapping("/delLikeExh")
    public JsonResult delLikeExh(@RequestBody Map<String, Object> params) {
        try {
            String userId = (String) params.get("userId");
            Integer collId = Integer.valueOf(params.get("collId").toString());
            
            if (userId == null || collId == null) {
                return JsonResult.failResult("参数错误");
            }
            
            boolean result = likeService.delLikeExh(userId, collId);
            return result ? JsonResult.result("取消收藏成功") : JsonResult.failResult("取消收藏失败");
        } catch (Exception e) {
            return JsonResult.failResult(e.getMessage());
        }
    }
    
    /**
     * 获取用户收藏ID列表
     */
    @PostMapping("/listUserLikes")
    public JsonResult listUserLikes(@RequestBody Map<String, Object> params) {
        try {
            String userId = (String) params.get("userId");
            String collType = (String) params.get("collType");
            
            if (userId == null || collType == null) {
                return JsonResult.failResult("参数错误");
            }
            
            List<Integer> likes = likeService.listUserLikes(userId, collType);
            return JsonResult.result(likes);
        } catch (Exception e) {
            return JsonResult.failResult(e.getMessage());
        }
    }
    
    /**
     * 获取用户收藏ID列表 - 添加兼容GET请求的方法
     */
    @GetMapping("/listUserLikes")
    public JsonResult listUserLikesGet(@RequestParam String userId, @RequestParam String collType) {
        try {
            if (userId == null || collType == null) {
                return JsonResult.failResult("参数错误");
            }
            
            List<Integer> likes = likeService.listUserLikes(userId, collType);
            return JsonResult.result(likes);
        } catch (Exception e) {
            return JsonResult.failResult(e.getMessage());
        }
    }
    
    /**
     * 分页获取用户的藏品收藏列表
     */
    @PostMapping("/listLikeColl")
    public JsonResult listLikeColl(@RequestBody Map<String, Object> params) {
        try {
            String userId = (String) params.get("userId");
            Integer pageNum = Integer.valueOf(params.get("pageNum").toString());
            Integer pageSize = Integer.valueOf(params.get("pageSize").toString());
            
            if (userId == null || pageNum == null || pageSize == null) {
                return JsonResult.failResult("参数错误");
            }
            
            PageResult<MsCollection> pageResult = likeService.listLikeColl(userId, pageNum, pageSize);
            return JsonResult.result(pageResult);
        } catch (Exception e) {
            return JsonResult.failResult(e.getMessage());
        }
    }
    
    /**
     * 分页获取用户的展览收藏列表
     */
    @PostMapping("/listLikeExh")
    public JsonResult listLikeExh(@RequestBody Map<String, Object> params) {
        try {
            String userId = (String) params.get("userId");
            Integer pageNum = Integer.valueOf(params.get("pageNum").toString());
            Integer pageSize = Integer.valueOf(params.get("pageSize").toString());
            
            if (userId == null || pageNum == null || pageSize == null) {
                return JsonResult.failResult("参数错误");
            }
            
            PageResult<MsExhibition> pageResult = likeService.listLikeExh(userId, pageNum, pageSize);
            return JsonResult.result(pageResult);
        } catch (Exception e) {
            return JsonResult.failResult(e.getMessage());
        }
    }
} 
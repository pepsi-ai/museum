package com.museum.controller;


import com.museum.config.JsonResult;
import com.museum.config.PageResult;
import com.museum.damain.dto.FeedBackQuery;
import com.museum.damain.po.FeedBack;
import com.museum.service.impl.FeedBackService;
import com.museum.service.impl.FeedbackLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * <p>
 *  前端控制器
 * </p>
 *
 * @since 2023-12-19
 */
@RestController
@RequestMapping("/feedBack")
@RequiredArgsConstructor
@CrossOrigin // 添加跨域支持
public class FeedBackController {

    @Resource
    FeedBackService feedBackService;
    
    @Resource
    FeedbackLikeService feedbackLikeService;

    @PostMapping("/listFeedBackByUser")
    public JsonResult listFeedBackByUser(@RequestBody FeedBackQuery pageQuery) {
        return JsonResult.result(feedBackService.listFeedBackByUser(pageQuery));
    }

    @PostMapping("/listAllFeedBack")
    public JsonResult listAllFeedBack(@RequestBody FeedBackQuery pageQuery) {
        try {
            PageResult<FeedBack> data = feedBackService.listAllFeedBack(pageQuery);
            return JsonResult.result(data);
        }catch (Exception e){
            return JsonResult.failResult(e.getMessage());
        }
    }

    @PostMapping("/delFeedBack")
    public JsonResult delDic(@RequestBody FeedBack feedBack) {
        try {
            // 检查必要参数
            if (feedBack.getId() == null || feedBack.getUserId() == null) {
                return JsonResult.failResult("参数错误");
            }
            
            feedBackService.delFeedBack(feedBack.getId(), feedBack.getUserId());
            return JsonResult.result("成功！");
        }catch (Exception e){
            return JsonResult.failResult(e.getMessage());
        }
    }
    @PostMapping("/addFeedBack")
    public JsonResult addFeedBack(@RequestBody FeedBack feedBack) {
        try {
            feedBackService.addFeedBack(feedBack);
            return JsonResult.result("成功！");
        }catch (Exception e){
            return JsonResult.failResult(e.getMessage());
        }
    }

    @PostMapping("/editFeedBack")
    public JsonResult editFeedBack(@RequestBody FeedBack feedBack) {
        try {
            feedBackService.editFeedBack(feedBack);
            return JsonResult.result("成功！");
        }catch (Exception e){
            return JsonResult.failResult(e.getMessage());
        }
    }
    
    /**
     * 点赞或取消点赞评论
     */
    @PostMapping("/toggleLikeFeedBack")
    public JsonResult toggleLikeFeedBack(@RequestBody Map<String, Object> params) {
        try {
            String userId = (String) params.get("userId");
            Integer feedbackId = Integer.valueOf(params.get("feedbackId").toString());
            
            if (userId == null || feedbackId == null) {
                return JsonResult.failResult("参数错误");
            }
            
            boolean isLiked = feedbackLikeService.toggleLike(userId, feedbackId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("isLiked", isLiked);
            result.put("message", isLiked ? "点赞成功" : "取消点赞成功");
            
            return JsonResult.result(result);
        } catch (Exception e) {
            return JsonResult.failResult(e.getMessage());
        }
    }
    
    /**
     * 获取用户对评论的点赞状态
     */
    @PostMapping("/checkUserLikeStatus")
    public JsonResult checkUserLikeStatus(@RequestBody Map<String, Object> params) {
        try {
            String userId = (String) params.get("userId");
            Integer feedbackId = Integer.valueOf(params.get("feedbackId").toString());
            
            if (userId == null || feedbackId == null) {
                return JsonResult.failResult("参数错误");
            }
            
            boolean isLiked = feedbackLikeService.isLiked(userId, feedbackId);
            return JsonResult.result(isLiked);
        } catch (Exception e) {
            return JsonResult.failResult(e.getMessage());
        }
    }
    
    /**
     * 获取用户点赞的所有评论ID
     */
    @PostMapping("/getUserLikedComments")
    public JsonResult getUserLikedComments(@RequestBody Map<String, Object> params) {
        try {
            System.out.println("获取用户点赞评论请求参数: " + params);
            
            String userId = (String) params.get("userId");
            
            if (userId == null) {
                return JsonResult.failResult("参数错误");
            }
            
            List<Integer> likedIds = feedbackLikeService.getLikedFeedbackIds(userId);
            System.out.println("用户 " + userId + " 点赞的评论ID: " + likedIds);
            return JsonResult.result(likedIds);
        } catch (Exception e) {
            System.err.println("获取用户点赞评论时出错: " + e.getMessage());
            e.printStackTrace();
            return JsonResult.failResult(e.getMessage());
        }
    }
}

package com.museum.service.impl;

import com.baomidou.mybatisplus.extension.conditions.query.LambdaQueryChainWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.museum.config.PageResult;
import com.museum.damain.dto.FeedBackQuery;
import com.museum.damain.po.FeedBack;
import com.museum.damain.query.PageQuery;
import com.museum.mapper.FeedBackMapper;
import com.museum.utils.StringUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @since 2023-12-19
 */
@Service
public class FeedBackService extends ServiceImpl<FeedBackMapper, FeedBack> implements IService<FeedBack> {
    @Resource
    DicService dicService;

    /**
     * 获取留言信息列表。自动过滤敏感词
     * @return
     */
    public PageResult<FeedBack> listFeedBackByUser(FeedBackQuery pageQuery) {
        LambdaQueryChainWrapper<FeedBack> lambdaQueryChainWrapper = lambdaQuery().like(FeedBack::getFeedContent, pageQuery.getName());
        if(StringUtils.isNotBlank(pageQuery.getUserName())) {
            lambdaQueryChainWrapper.like(FeedBack::getUserName, pageQuery.getUserName());
        }
        if(null != pageQuery.getUserId()) {
            lambdaQueryChainWrapper.eq(FeedBack::getUserId, pageQuery.getUserId());
        }
        if(null != pageQuery.getCateId()) {
            lambdaQueryChainWrapper.eq(FeedBack::getCateId, pageQuery.getCateId());
        }
        List<String> keyWords = dicService.listDicValueByTyp("敏感词");
        if(!keyWords.isEmpty()) {
            for(String key: keyWords) {
                lambdaQueryChainWrapper.notLike(FeedBack::getFeedContent, key);
            }
        }
        Page<FeedBack> page = lambdaQueryChainWrapper.page(pageQuery.toMpPage());
        return PageResult.of(page, page.getRecords());
    }

    /**
     * 获取留言信息列表。不过滤敏感词
     * @return
     */
    public PageResult<FeedBack> listAllFeedBack(PageQuery pageQuery) {
        LambdaQueryChainWrapper<FeedBack> lambdaQueryChainWrapper = lambdaQuery().like(FeedBack::getFeedContent, pageQuery.getName());
        Page<FeedBack> page = lambdaQueryChainWrapper.page(pageQuery.toMpPage());
        return PageResult.of(page, page.getRecords());
    }

    /**
     * 添加用户留言
     * @return
     */
    public void addFeedBack(FeedBack feedBack) throws Exception {
        feedBack.setFedDateTime(StringUtils.getNowDateTIme());
        feedBack.setIsShow("1");
        feedBack.setLikeCount(0); // 初始化点赞数为0
        
        // 检查是否包含敏感词，在保存前进行检查
        List<String> keyWords = dicService.listDicValueByTyp("敏感词");
        if (!keyWords.isEmpty()) {
            String content = feedBack.getFeedContent().toLowerCase();
            
            // 直接检查评论内容是否包含敏感词
            boolean containsSensitiveWord = false;
            for (String key : keyWords) {
                if (content.contains(key.toLowerCase())) {
                    containsSensitiveWord = true;
                    break;
                }
            }
            
            // 如果包含敏感词，标记为不显示
            if (containsSensitiveWord) {
                feedBack.setIsShow("0");
            }
        }
        
        // 保存评论，无需再进行二次查询和更新
        save(feedBack);
    }

    /**
     * 删除用户留言
     * @return
     */
    public void delFeedBack(Integer id, Integer userId) throws Exception {
        // 检查评论是否存在
        FeedBack feedBack = getById(id);
        if (feedBack == null) {
            throw new Exception("评论不存在或已被删除");
        }
        
        // 检查是否是用户自己的评论
        if (!feedBack.getUserId().equals(userId)) {
            throw new Exception("您只能删除自己的评论");
        }
        
        // 执行删除
        removeById(id);
    }

    /**
     * 编辑用户留言
     * @return
     */
    public void editFeedBack(FeedBack feedBack) {
        saveOrUpdate(feedBack);
    }
}

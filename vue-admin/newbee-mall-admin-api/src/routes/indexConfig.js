const express = require('express');
const router = express.Router();
const indexConfigController = require('../controllers/indexConfigController');
const { adminAuth } = require('../middleware/auth');

// 需要认证的路由
router.use(adminAuth);

// 获取首页配置列表
router.get('/', indexConfigController.getIndexConfigList);

// 添加首页配置
router.post('/', indexConfigController.addIndexConfig);

// 修改首页配置
router.put('/', indexConfigController.updateIndexConfig);

// 删除首页配置
router.delete('/', indexConfigController.deleteIndexConfig);

// 获取首页配置详情
router.get('/:id', indexConfigController.getIndexConfigDetail);

module.exports = router; 
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { adminAuth } = require('../middleware/auth');

// 需要认证的路由
router.use(adminAuth);

// 获取分类列表
router.get('/', categoryController.getCategoryList);

// 添加分类
router.post('/', categoryController.addCategory);

// 修改分类
router.put('/', categoryController.updateCategory);

// 删除分类
router.delete('/', categoryController.deleteCategory);

// 获取分类详情
router.get('/:id', categoryController.getCategoryDetail);

// 获取分类选择数据
router.get('/options/:level', categoryController.getCategoryOptions);

module.exports = router; 
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { adminAuth } = require('../middleware/auth');

// 需要认证的路由
router.use(adminAuth);

// 获取用户列表
router.get('/', userController.getUserList);

// 禁用/解禁用户
router.put('/lock', userController.lockUser);

// 获取用户详情
router.get('/:id', userController.getUserDetail);

module.exports = router; 
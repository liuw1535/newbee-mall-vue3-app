const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');

// 管理员登录
router.post('/login', adminController.login);

// 需要认证的路由
router.use(adminAuth);

// 管理员退出登录
router.post('/logout', adminController.logout);

// 获取管理员个人信息
router.get('/profile', adminController.getProfile);

// 修改管理员密码
router.put('/password', adminController.updatePassword);

// 修改管理员信息
router.put('/name', adminController.updateProfile);

module.exports = router; 
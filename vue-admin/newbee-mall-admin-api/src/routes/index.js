const express = require('express');
const router = express.Router();

const adminRoutes = require('./admin');
const carouselRoutes = require('./carousel');
const categoryRoutes = require('./category');
const goodsRoutes = require('./goods');
const indexConfigRoutes = require('./indexConfig');
const orderRoutes = require('./order');
const userRoutes = require('./user');
const uploadRoutes = require('./upload');

// 管理员相关路由
router.use('/admin', adminRoutes);

// 轮播图相关路由
router.use('/carousels', carouselRoutes);

// 商品分类相关路由
router.use('/categories', categoryRoutes);

// 商品相关路由
router.use('/goods', goodsRoutes);

// 首页配置相关路由
router.use('/indexConfigs', indexConfigRoutes);

// 订单相关路由
router.use('/orders', orderRoutes);

// 用户相关路由
router.use('/users', userRoutes);

// 上传相关路由
router.use('/upload', uploadRoutes);

module.exports = router; 
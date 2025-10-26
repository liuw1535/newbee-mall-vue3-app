const express = require('express');
const router = express.Router();
const carouselController = require('../controllers/carouselController');
const { adminAuth } = require('../middleware/auth');

// 需要认证的路由
router.use(adminAuth);

// 获取轮播图列表
router.get('/', carouselController.getCarouselList);

// 添加轮播图
router.post('/', carouselController.addCarousel);

// 修改轮播图
router.put('/', carouselController.updateCarousel);

// 删除轮播图
router.delete('/', carouselController.deleteCarousel);

// 获取轮播图详情
router.get('/:id', carouselController.getCarouselDetail);

module.exports = router; 
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { adminAuth } = require('../middleware/auth');

// 需要认证的路由
router.use(adminAuth);

// 获取订单列表
router.get('/', orderController.getOrderList);

// 修改订单状态
router.put('/status', orderController.updateOrderStatus);

// 配货完成
router.put('/checkDone', orderController.checkDone);

// 出库
router.put('/checkOut', orderController.checkOut);

// 关闭订单
router.put('/close', orderController.closeOrder);

// 获取订单详情
router.get('/:id', orderController.getOrderDetail);

module.exports = router; 
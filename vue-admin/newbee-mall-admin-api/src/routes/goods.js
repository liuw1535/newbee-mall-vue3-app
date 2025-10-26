const express = require('express');
const router = express.Router();
const goodsController = require('../controllers/goodsController');
const { adminAuth } = require('../middleware/auth');

// 需要认证的路由
router.use(adminAuth);

// 获取商品列表
router.get('/', goodsController.getGoodsList);

// 添加商品
router.post('/', goodsController.addGoods);

// 修改商品
router.put('/', goodsController.updateGoods);

// 批量修改销售状态
router.put('/status', goodsController.updateSellStatus);

// 获取商品详情
router.get('/:id', goodsController.getGoodsDetail);

module.exports = router; 
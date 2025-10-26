const GoodsInfo = require('../models/GoodsInfo');
const { success, fail } = require('../utils/util');
const { Op } = require('sequelize');

/**
 * 获取商品列表
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const getGoodsList = async (req, res) => {
  try {
    const { pageNumber = 1, pageSize = 10, goodsName, goodsSellStatus } = req.query;
    
    const where = {};
    
    if (goodsName) {
      where.goodsName = {
        [Op.like]: `%${goodsName}%`
      };
    }
    
    if (goodsSellStatus !== undefined && goodsSellStatus !== null && goodsSellStatus !== '') {
      where.goodsSellStatus = parseInt(goodsSellStatus);
    }

    const offset = (pageNumber - 1) * pageSize;
    const limit = parseInt(pageSize);

    const { count, rows } = await GoodsInfo.findAndCountAll({
      where,
      order: [
        ['goodsId', 'DESC']
      ],
      offset,
      limit
    });

    res.json(success('获取成功', {
      list: rows,
      totalCount: count,
      pageNumber: parseInt(pageNumber),
      pageSize: limit,
      totalPage: Math.ceil(count / limit)
    }));
  } catch (error) {
    console.error('获取商品列表错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 添加商品
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const addGoods = async (req, res) => {
  try {
    const {
      goodsName,
      goodsIntro,
      goodsCategoryId,
      goodsCoverImg,
      goodsCarousel,
      goodsDetailContent,
      originalPrice,
      sellingPrice,
      stockNum,
      tag,
      goodsSellStatus
    } = req.body;
    const adminUserId = req.adminUserId;

    if (!goodsName || !goodsIntro || !goodsCategoryId) {
      return res.status(400).json(fail('商品名称、简介和分类不能为空'));
    }

    await GoodsInfo.create({
      goodsName,
      goodsIntro,
      goodsCategoryId,
      goodsCoverImg: goodsCoverImg || '/admin/dist/img/no-img.png',
      goodsCarousel: goodsCarousel || '/admin/dist/img/no-img.png',
      goodsDetailContent: goodsDetailContent || '',
      originalPrice: originalPrice || 0,
      sellingPrice: sellingPrice || 0,
      stockNum: stockNum || 0,
      tag: tag || '',
      goodsSellStatus: goodsSellStatus === undefined ? 0 : goodsSellStatus,
      createUser: adminUserId,
      updateUser: adminUserId
    });

    res.json(success('添加成功'));
  } catch (error) {
    console.error('添加商品错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 修改商品
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const updateGoods = async (req, res) => {
  try {
    const {
      goodsId,
      goodsName,
      goodsIntro,
      goodsCategoryId,
      goodsCoverImg,
      goodsCarousel,
      goodsDetailContent,
      originalPrice,
      sellingPrice,
      stockNum,
      tag,
      goodsSellStatus
    } = req.body;
    const adminUserId = req.adminUserId;

    if (!goodsId || !goodsName || !goodsIntro || !goodsCategoryId) {
      return res.status(400).json(fail('商品ID、名称、简介和分类不能为空'));
    }

    const goods = await GoodsInfo.findByPk(goodsId);

    if (!goods) {
      return res.status(404).json(fail('商品不存在'));
    }

    await goods.update({
      goodsName,
      goodsIntro,
      goodsCategoryId,
      goodsCoverImg: goodsCoverImg || goods.goodsCoverImg,
      goodsCarousel: goodsCarousel || goods.goodsCarousel,
      goodsDetailContent: goodsDetailContent || goods.goodsDetailContent,
      originalPrice: originalPrice !== undefined ? originalPrice : goods.originalPrice,
      sellingPrice: sellingPrice !== undefined ? sellingPrice : goods.sellingPrice,
      stockNum: stockNum !== undefined ? stockNum : goods.stockNum,
      tag: tag !== undefined ? tag : goods.tag,
      goodsSellStatus: goodsSellStatus !== undefined ? goodsSellStatus : goods.goodsSellStatus,
      updateUser: adminUserId,
      updateTime: new Date()
    });

    res.json(success('修改成功'));
  } catch (error) {
    console.error('修改商品错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 获取商品详情
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const getGoodsDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(fail('商品ID不能为空'));
    }

    const goods = await GoodsInfo.findByPk(id);

    if (!goods) {
      return res.status(404).json(fail('商品不存在'));
    }

    res.json(success('获取成功', goods));
  } catch (error) {
    console.error('获取商品详情错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 批量修改销售状态
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const updateSellStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    const adminUserId = req.adminUserId;

    if (!ids || !ids.length || status === undefined) {
      return res.status(400).json(fail('参数错误'));
    }

    await GoodsInfo.update({
      goodsSellStatus: status,
      updateUser: adminUserId,
      updateTime: new Date()
    }, {
      where: {
        goodsId: {
          [Op.in]: ids
        }
      }
    });

    res.json(success(status === 0 ? '上架成功' : '下架成功'));
  } catch (error) {
    console.error('修改销售状态错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

module.exports = {
  getGoodsList,
  addGoods,
  updateGoods,
  getGoodsDetail,
  updateSellStatus
};

const Carousel = require('../models/Carousel');
const { success, fail } = require('../utils/util');
const { Op } = require('sequelize');

/**
 * 获取轮播图列表
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const getCarouselList = async (req, res) => {
  try {
    const { pageNumber = 1, pageSize = 10 } = req.query;
    
    const offset = (pageNumber - 1) * pageSize;
    const limit = parseInt(pageSize);

    const { count, rows } = await Carousel.findAndCountAll({
      where: {
        isDeleted: 0
      },
      order: [
        ['carouselRank', 'DESC']
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
    console.error('获取轮播图列表错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 添加轮播图
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const addCarousel = async (req, res) => {
  try {
    const { carouselUrl, redirectUrl, carouselRank } = req.body;
    const adminUserId = req.adminUserId;

    if (!carouselUrl) {
      return res.status(400).json(fail('轮播图URL不能为空'));
    }

    await Carousel.create({
      carouselUrl,
      redirectUrl: redirectUrl || '##',
      carouselRank: carouselRank || 0,
      createUser: adminUserId,
      updateUser: adminUserId
    });

    res.json(success('添加成功'));
  } catch (error) {
    console.error('添加轮播图错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 修改轮播图
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const updateCarousel = async (req, res) => {
  try {
    const { carouselId, carouselUrl, redirectUrl, carouselRank } = req.body;
    const adminUserId = req.adminUserId;

    if (!carouselId) {
      return res.status(400).json(fail('轮播图ID不能为空'));
    }

    if (!carouselUrl) {
      return res.status(400).json(fail('轮播图URL不能为空'));
    }

    const carousel = await Carousel.findByPk(carouselId);

    if (!carousel) {
      return res.status(404).json(fail('轮播图不存在'));
    }

    if (carousel.isDeleted) {
      return res.status(400).json(fail('轮播图已删除'));
    }

    await carousel.update({
      carouselUrl,
      redirectUrl: redirectUrl || '##',
      carouselRank: carouselRank || 0,
      updateUser: adminUserId,
      updateTime: new Date()
    });

    res.json(success('修改成功'));
  } catch (error) {
    console.error('修改轮播图错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 删除轮播图
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const deleteCarousel = async (req, res) => {
  try {
    const { ids } = req.body;
    const adminUserId = req.adminUserId;

    if (!ids || !ids.length) {
      return res.status(400).json(fail('请选择要删除的轮播图'));
    }

    await Carousel.update({
      isDeleted: 1,
      updateUser: adminUserId,
      updateTime: new Date()
    }, {
      where: {
        carouselId: {
          [Op.in]: ids
        }
      }
    });

    res.json(success('删除成功'));
  } catch (error) {
    console.error('删除轮播图错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 获取轮播图详情
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const getCarouselDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(fail('轮播图ID不能为空'));
    }

    const carousel = await Carousel.findOne({
      where: {
        carouselId: id,
        isDeleted: 0
      }
    });

    if (!carousel) {
      return res.status(404).json(fail('轮播图不存在'));
    }

    res.json(success('获取成功', carousel));
  } catch (error) {
    console.error('获取轮播图详情错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

module.exports = {
  getCarouselList,
  addCarousel,
  updateCarousel,
  deleteCarousel,
  getCarouselDetail
}; 
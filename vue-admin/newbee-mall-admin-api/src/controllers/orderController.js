const Order = require('../models/Order');
const { success, fail } = require('../utils/util');
const { Op } = require('sequelize');

/**
 * 获取订单列表
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const getOrderList = async (req, res) => {
  try {
    const { pageNumber = 1, pageSize = 10, orderNo, orderStatus } = req.query;
    
    const where = {
      isDeleted: 0
    };
    
    if (orderNo) {
      where.orderNo = {
        [Op.like]: `%${orderNo}%`
      };
    }
    
    if (orderStatus !== undefined && orderStatus !== null) {
      where.orderStatus = orderStatus;
    }

    const offset = (pageNumber - 1) * pageSize;
    const limit = parseInt(pageSize);

    const { count, rows } = await Order.findAndCountAll({
      where,
      order: [
        ['createTime', 'DESC']
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
    console.error('获取订单列表错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 获取订单详情
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(fail('订单ID不能为空'));
    }

    const order = await Order.findOne({
      where: {
        orderId: id,
        isDeleted: 0
      }
    });

    if (!order) {
      return res.status(404).json(fail('订单不存在'));
    }

    res.json(success('获取成功', order));
  } catch (error) {
    console.error('获取订单详情错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 修改订单状态
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus } = req.body;

    if (!orderId || orderStatus === undefined) {
      return res.status(400).json(fail('订单ID和状态不能为空'));
    }

    const order = await Order.findOne({
      where: {
        orderId,
        isDeleted: 0
      }
    });

    if (!order) {
      return res.status(404).json(fail('订单不存在'));
    }

    // 检查订单状态变更是否合法
    if (orderStatus < 0 && order.orderStatus < 0) {
      return res.status(400).json(fail('订单状态已关闭，无法再次关闭'));
    }

    if (orderStatus < 0 && order.orderStatus > 3) {
      return res.status(400).json(fail('订单已出库或交易完成，无法关闭'));
    }

    if (orderStatus === 3 && order.orderStatus !== 2) {
      return res.status(400).json(fail('订单未配货完成，无法出库'));
    }

    if (orderStatus === 4 && order.orderStatus !== 3) {
      return res.status(400).json(fail('订单未出库，无法完成交易'));
    }

    await order.update({
      orderStatus,
      updateTime: new Date()
    });

    res.json(success('修改成功'));
  } catch (error) {
    console.error('修改订单状态错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 配货完成
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const checkDone = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !ids.length) {
      return res.status(400).json(fail('请选择要操作的订单'));
    }

    const orders = await Order.findAll({
      where: {
        orderId: {
          [Op.in]: ids
        },
        isDeleted: 0
      }
    });

    if (orders.length !== ids.length) {
      return res.status(404).json(fail('存在不存在的订单'));
    }

    // 检查订单状态是否允许配货完成
    for (const order of orders) {
      if (order.orderStatus !== 1) {
        return res.status(400).json(fail(`订单号 ${order.orderNo} 的状态不是已支付，无法配货完成`));
      }
    }

    await Order.update({
      orderStatus: 2,
      updateTime: new Date()
    }, {
      where: {
        orderId: {
          [Op.in]: ids
        }
      }
    });

    res.json(success('配货完成'));
  } catch (error) {
    console.error('配货完成错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 出库
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const checkOut = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !ids.length) {
      return res.status(400).json(fail('请选择要操作的订单'));
    }

    const orders = await Order.findAll({
      where: {
        orderId: {
          [Op.in]: ids
        },
        isDeleted: 0
      }
    });

    if (orders.length !== ids.length) {
      return res.status(404).json(fail('存在不存在的订单'));
    }

    // 检查订单状态是否允许出库
    for (const order of orders) {
      if (order.orderStatus !== 2) {
        return res.status(400).json(fail(`订单号 ${order.orderNo} 的状态不是配货完成，无法出库`));
      }
    }

    await Order.update({
      orderStatus: 3,
      updateTime: new Date()
    }, {
      where: {
        orderId: {
          [Op.in]: ids
        }
      }
    });

    res.json(success('出库成功'));
  } catch (error) {
    console.error('出库错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 关闭订单
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const closeOrder = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !ids.length) {
      return res.status(400).json(fail('请选择要操作的订单'));
    }

    const orders = await Order.findAll({
      where: {
        orderId: {
          [Op.in]: ids
        },
        isDeleted: 0
      }
    });

    if (orders.length !== ids.length) {
      return res.status(404).json(fail('存在不存在的订单'));
    }

    // 检查订单状态是否允许关闭
    for (const order of orders) {
      if (order.orderStatus < 0) {
        return res.status(400).json(fail(`订单号 ${order.orderNo} 已关闭，无法再次关闭`));
      }
      if (order.orderStatus > 3) {
        return res.status(400).json(fail(`订单号 ${order.orderNo} 已出库或交易完成，无法关闭`));
      }
    }

    await Order.update({
      orderStatus: -3, // 商家关闭
      updateTime: new Date()
    }, {
      where: {
        orderId: {
          [Op.in]: ids
        }
      }
    });

    res.json(success('关闭成功'));
  } catch (error) {
    console.error('关闭订单错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

module.exports = {
  getOrderList,
  getOrderDetail,
  updateOrderStatus,
  checkDone,
  checkOut,
  closeOrder
}; 
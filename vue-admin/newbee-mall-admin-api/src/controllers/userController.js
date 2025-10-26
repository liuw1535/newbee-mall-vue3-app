const User = require('../models/User');
const { success, fail } = require('../utils/util');
const { Op } = require('sequelize');

/**
 * 获取用户列表
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const getUserList = async (req, res) => {
  try {
    const { pageNumber = 1, pageSize = 10, loginName, lockedFlag } = req.query;
    
    const where = {
      isDeleted: 0
    };
    
    if (loginName) {
      where.loginName = {
        [Op.like]: `%${loginName}%`
      };
    }
    
    if (lockedFlag !== undefined && lockedFlag !== null && lockedFlag !== '') {
      where.lockedFlag = parseInt(lockedFlag);
    }

    const offset = (pageNumber - 1) * pageSize;
    const limit = parseInt(pageSize);

    const { count, rows } = await User.findAndCountAll({
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
    console.error('获取用户列表错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 获取用户详情
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const getUserDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(fail('用户ID不能为空'));
    }

    const user = await User.findOne({
      where: {
        userId: id,
        isDeleted: 0
      }
    });

    if (!user) {
      return res.status(404).json(fail('用户不存在'));
    }

    res.json(success('获取成功', user));
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 禁用用户
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const lockUser = async (req, res) => {
  try {
    const { ids, lockStatus } = req.body;

    if (!ids || !ids.length || lockStatus === undefined) {
      return res.status(400).json(fail('参数错误'));
    }

    await User.update({
      lockedFlag: lockStatus
    }, {
      where: {
        userId: {
          [Op.in]: ids
        },
        isDeleted: 0
      }
    });

    res.json(success(lockStatus === 0 ? '解禁成功' : '禁用成功'));
  } catch (error) {
    console.error('禁用用户错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

module.exports = {
  getUserList,
  getUserDetail,
  lockUser
};

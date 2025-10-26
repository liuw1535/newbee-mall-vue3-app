const { fail } = require('../utils/util');
const AdminUserToken = require('../models/AdminUserToken');
const { Op } = require('sequelize');

/**
 * 管理员身份验证中间件
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 * @param {function} next 下一个中间件
 */
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('X-Access-Token');
    
    if (!token) {
      return res.status(401).json(fail('未登录，请先登录', 401));
    }

    const now = new Date();
    const tokenData = await AdminUserToken.findOne({
      where: {
        token,
        expireTime: {
          [Op.gt]: now
        }
      }
    });

    if (!tokenData) {
      return res.status(401).json(fail('token已过期，请重新登录', 401));
    }

    // 将管理员ID添加到请求对象
    req.adminUserId = tokenData.adminUserId;
    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    res.status(500).json(fail('服务器内部错误', 500));
  }
};

module.exports = {
  adminAuth
}; 
const AdminUser = require('../models/AdminUser');
const AdminUserToken = require('../models/AdminUserToken');
const { md5, generateToken, getExpireTime, success, fail } = require('../utils/util');

/**
 * 管理员登录
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const login = async (req, res) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res.status(400).json(fail('用户名和密码不能为空'));
    }

    // 查找管理员
    const adminUser = await AdminUser.findOne({
      where: {
        loginUserName: userName,
        loginPassword: md5(password)
      }
    });

    if (!adminUser) {
      return res.status(400).json(fail('用户名或密码错误'));
    }

    if (adminUser.locked) {
      return res.status(403).json(fail('用户已被锁定'));
    }

    // 生成token
    const token = generateToken();
    const expireTime = getExpireTime(48); // 48小时过期

    // 更新或创建token
    await AdminUserToken.upsert({
      adminUserId: adminUser.adminUserId,
      token,
      updateTime: new Date(),
      expireTime
    });

    // 返回成功响应
    res.json(success('登录成功', {
      token,
      userInfo: {
        nickName: adminUser.nickName,
        loginUserName: adminUser.loginUserName
      }
    }));
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 管理员退出登录
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const logout = async (req, res) => {
  try {
    const token = req.header('X-Access-Token');
    
    if (token) {
      // 查找并删除token
      await AdminUserToken.destroy({
        where: {
          token
        }
      });
    }
    
    res.json(success('退出成功'));
  } catch (error) {
    console.error('退出登录错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 获取管理员个人信息
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const getProfile = async (req, res) => {
  try {
    const adminUserId = req.adminUserId;

    const adminUser = await AdminUser.findByPk(adminUserId, {
      attributes: ['adminUserId', 'loginUserName', 'nickName']
    });

    if (!adminUser) {
      return res.status(404).json(fail('管理员不存在'));
    }

    res.json(success('获取成功', adminUser));
  } catch (error) {
    console.error('获取个人信息错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 修改管理员密码
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const updatePassword = async (req, res) => {
  try {
    const adminUserId = req.adminUserId;
    const { originalPassword, newPassword } = req.body;

    if (!originalPassword || !newPassword) {
      return res.status(400).json(fail('原密码和新密码不能为空'));
    }

    const adminUser = await AdminUser.findByPk(adminUserId);

    if (!adminUser) {
      return res.status(404).json(fail('管理员不存在'));
    }

    if (adminUser.loginPassword !== md5(originalPassword)) {
      return res.status(400).json(fail('原密码错误'));
    }

    // 更新密码
    await adminUser.update({
      loginPassword: md5(newPassword)
    });

    res.json(success('密码修改成功'));
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 修改管理员信息
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const updateProfile = async (req, res) => {
  try {
    const adminUserId = req.adminUserId;
    const { nickName } = req.body;

    if (!nickName) {
      return res.status(400).json(fail('昵称不能为空'));
    }

    const adminUser = await AdminUser.findByPk(adminUserId);

    if (!adminUser) {
      return res.status(404).json(fail('管理员不存在'));
    }

    // 更新昵称
    await adminUser.update({
      nickName
    });

    res.json(success('信息修改成功'));
  } catch (error) {
    console.error('修改信息错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

module.exports = {
  login,
  logout,
  getProfile,
  updatePassword,
  updateProfile
}; 
const IndexConfig = require('../models/IndexConfig');
const { success, fail } = require('../utils/util');
const { Op } = require('sequelize');

/**
 * 获取首页配置列表
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const getIndexConfigList = async (req, res) => {
  try {
    const { pageNumber = 1, pageSize = 10, configType } = req.query;
    
    const where = {
      isDeleted: 0
    };

    if (configType) {
      where.configType = configType;
    }

    const offset = (pageNumber - 1) * pageSize;
    const limit = parseInt(pageSize);

    const { count, rows } = await IndexConfig.findAndCountAll({
      where,
      order: [
        ['configRank', 'DESC']
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
    console.error('获取首页配置列表错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 添加首页配置
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const addIndexConfig = async (req, res) => {
  try {
    const { configName, configType, goodsId, redirectUrl, configRank } = req.body;
    const adminUserId = req.adminUserId;

    if (!configName || !configType || !goodsId) {
      return res.status(400).json(fail('配置名称、类型和商品ID不能为空'));
    }

    await IndexConfig.create({
      configName,
      configType,
      goodsId,
      redirectUrl: redirectUrl || '##',
      configRank: configRank || 0,
      createUser: adminUserId,
      updateUser: adminUserId
    });

    res.json(success('添加成功'));
  } catch (error) {
    console.error('添加首页配置错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 修改首页配置
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const updateIndexConfig = async (req, res) => {
  try {
    const { configId, configName, configType, goodsId, redirectUrl, configRank } = req.body;
    const adminUserId = req.adminUserId;

    if (!configId || !configName || !configType || !goodsId) {
      return res.status(400).json(fail('配置ID、名称、类型和商品ID不能为空'));
    }

    const indexConfig = await IndexConfig.findByPk(configId);

    if (!indexConfig) {
      return res.status(404).json(fail('配置不存在'));
    }

    if (indexConfig.isDeleted) {
      return res.status(400).json(fail('配置已删除'));
    }

    await indexConfig.update({
      configName,
      configType,
      goodsId,
      redirectUrl: redirectUrl || '##',
      configRank: configRank || 0,
      updateUser: adminUserId,
      updateTime: new Date()
    });

    res.json(success('修改成功'));
  } catch (error) {
    console.error('修改首页配置错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 删除首页配置
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const deleteIndexConfig = async (req, res) => {
  try {
    const { ids } = req.body;
    const adminUserId = req.adminUserId;

    if (!ids || !ids.length) {
      return res.status(400).json(fail('请选择要删除的配置'));
    }

    await IndexConfig.update({
      isDeleted: 1,
      updateUser: adminUserId,
      updateTime: new Date()
    }, {
      where: {
        configId: {
          [Op.in]: ids
        }
      }
    });

    res.json(success('删除成功'));
  } catch (error) {
    console.error('删除首页配置错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 获取首页配置详情
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const getIndexConfigDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(fail('配置ID不能为空'));
    }

    const indexConfig = await IndexConfig.findOne({
      where: {
        configId: id,
        isDeleted: 0
      }
    });

    if (!indexConfig) {
      return res.status(404).json(fail('配置不存在'));
    }

    res.json(success('获取成功', indexConfig));
  } catch (error) {
    console.error('获取首页配置详情错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

module.exports = {
  getIndexConfigList,
  addIndexConfig,
  updateIndexConfig,
  deleteIndexConfig,
  getIndexConfigDetail
}; 
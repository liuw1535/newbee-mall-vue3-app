const GoodsCategory = require('../models/GoodsCategory');
const { success, fail } = require('../utils/util');
const { Op } = require('sequelize');

/**
 * 获取分类列表
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const getCategoryList = async (req, res) => {
  try {
    const { pageNumber = 1, pageSize = 10, categoryLevel, parentId } = req.query;
    
    const where = {
      isDeleted: 0
    };

    if (categoryLevel) {
      where.categoryLevel = categoryLevel;
    }

    if (parentId) {
      where.parentId = parentId;
    }

    const offset = (pageNumber - 1) * pageSize;
    const limit = parseInt(pageSize);

    const { count, rows } = await GoodsCategory.findAndCountAll({
      where,
      order: [
        ['categoryRank', 'DESC']
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
    console.error('获取分类列表错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 添加分类
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const addCategory = async (req, res) => {
  try {
    const { categoryLevel, parentId, categoryName, categoryRank } = req.body;
    const adminUserId = req.adminUserId;

    if (!categoryLevel || !categoryName) {
      return res.status(400).json(fail('分类级别和名称不能为空'));
    }

    // 检查同级别下是否有同名分类
    const existCategory = await GoodsCategory.findOne({
      where: {
        categoryLevel,
        categoryName,
        parentId: parentId || 0,
        isDeleted: 0
      }
    });

    if (existCategory) {
      return res.status(400).json(fail('已存在同名分类'));
    }

    await GoodsCategory.create({
      categoryLevel,
      parentId: parentId || 0,
      categoryName,
      categoryRank: categoryRank || 0,
      createUser: adminUserId,
      updateUser: adminUserId
    });

    res.json(success('添加成功'));
  } catch (error) {
    console.error('添加分类错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 修改分类
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const updateCategory = async (req, res) => {
  try {
    const { categoryId, categoryName, categoryRank } = req.body;
    const adminUserId = req.adminUserId;

    if (!categoryId || !categoryName) {
      return res.status(400).json(fail('分类ID和名称不能为空'));
    }

    const category = await GoodsCategory.findByPk(categoryId);

    if (!category) {
      return res.status(404).json(fail('分类不存在'));
    }

    if (category.isDeleted) {
      return res.status(400).json(fail('分类已删除'));
    }

    // 检查同级别下是否有同名分类
    const existCategory = await GoodsCategory.findOne({
      where: {
        categoryLevel: category.categoryLevel,
        categoryName,
        parentId: category.parentId,
        isDeleted: 0,
        categoryId: {
          [Op.ne]: categoryId
        }
      }
    });

    if (existCategory) {
      return res.status(400).json(fail('已存在同名分类'));
    }

    await category.update({
      categoryName,
      categoryRank: categoryRank || category.categoryRank,
      updateUser: adminUserId,
      updateTime: new Date()
    });

    res.json(success('修改成功'));
  } catch (error) {
    console.error('修改分类错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 删除分类
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const deleteCategory = async (req, res) => {
  try {
    const { ids } = req.body;
    const adminUserId = req.adminUserId;

    if (!ids || !ids.length) {
      return res.status(400).json(fail('请选择要删除的分类'));
    }

    // 检查是否有子分类
    for (const id of ids) {
      const hasChildren = await GoodsCategory.findOne({
        where: {
          parentId: id,
          isDeleted: 0
        }
      });

      if (hasChildren) {
        return res.status(400).json(fail('存在子分类，无法删除'));
      }
    }

    await GoodsCategory.update({
      isDeleted: 1,
      updateUser: adminUserId,
      updateTime: new Date()
    }, {
      where: {
        categoryId: {
          [Op.in]: ids
        }
      }
    });

    res.json(success('删除成功'));
  } catch (error) {
    console.error('删除分类错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 获取分类详情
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const getCategoryDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(fail('分类ID不能为空'));
    }

    const category = await GoodsCategory.findOne({
      where: {
        categoryId: id,
        isDeleted: 0
      }
    });

    if (!category) {
      return res.status(404).json(fail('分类不存在'));
    }

    res.json(success('获取成功', category));
  } catch (error) {
    console.error('获取分类详情错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

/**
 * 获取分类选择数据
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const getCategoryOptions = async (req, res) => {
  try {
    const { level } = req.query;

    if (!level) {
      return res.status(400).json(fail('分类级别不能为空'));
    }

    const categories = await GoodsCategory.findAll({
      where: {
        categoryLevel: level,
        isDeleted: 0
      },
      order: [
        ['categoryRank', 'DESC']
      ]
    });

    res.json(success('获取成功', categories));
  } catch (error) {
    console.error('获取分类选择数据错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

module.exports = {
  getCategoryList,
  addCategory,
  updateCategory,
  deleteCategory,
  getCategoryDetail,
  getCategoryOptions
}; 
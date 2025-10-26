const path = require('path');
const fs = require('fs');
const { success, fail } = require('../utils/util');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * 上传文件
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
const upload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(fail('请选择要上传的文件'));
    }

    // 生成文件访问URL
    const fileUrl = `/uploads/${req.file.filename}`;

    res.json(success('上传成功', {
      fileUrl
    }));
  } catch (error) {
    console.error('上传文件错误:', error);
    res.status(500).json(fail('服务器内部错误'));
  }
};

module.exports = {
  upload
}; 
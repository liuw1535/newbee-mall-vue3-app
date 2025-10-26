const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const sequelize = require('./config/db');

// 加载环境变量
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/goods-img', express.static(path.join(__dirname, '../uploads')));
// 兼容前端直接用 /images/xxx.png 访问 OSS 图片的场景
app.use('/images', (req, res) => {
  // 自动重定向到 OSS 公网图片地址
  const ossBase = 'https://newbee-mall.oss-cn-beijing.aliyuncs.com/images';
  res.redirect(ossBase + req.path);
});




// API路由
app.use('/api', routes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    data: null
  });
});

// 数据库连接测试
sequelize.authenticate()
  .then(() => {
    console.log('数据库连接成功');
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
  });

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 
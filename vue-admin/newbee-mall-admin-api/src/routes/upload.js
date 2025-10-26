const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const uploadController = require('../controllers/uploadController');
const { adminAuth } = require('../middleware/auth');

// 配置文件存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

// 文件过滤
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && allowedTypes.test(ext)) {
    return cb(null, true);
  }
  
  cb(new Error('只允许上传图片文件'));
};

// 配置上传中间件
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// 需要认证的路由
router.use(adminAuth);

// 上传文件
router.post('/', upload.single('file'), uploadController.upload);

module.exports = router; 
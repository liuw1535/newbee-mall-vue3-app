# NewBee Mall Admin API 测试指南

## 一、后端逻辑分析

### 1. 项目结构
```
newbee-mall-admin-api/
├── src/
│   ├── app.js              # 应用主入口
│   ├── config/             # 配置文件
│   │   └── db.js          # 数据库配置
│   ├── controllers/        # 控制器层
│   ├── models/            # 数据模型层
│   ├── routes/            # 路由层
│   ├── middleware/        # 中间件
│   └── utils/             # 工具函数
└── uploads/               # 上传文件目录
```

### 2. 主要技术栈
- Express.js - Web框架
- Sequelize - ORM框架
- MySQL - 数据库
- JWT - 身份认证
- Multer - 文件上传

### 3. API 基础路径
所有API路径都以 `/api` 为前缀，例如：`http://localhost:3001/api/admin/login`

## 二、启动后端服务

### 1. 安装依赖
```bash
cd newbee-mall-admin-api
npm install
```

### 2. 启动服务
```bash
# 生产模式
npm start

# 开发模式（支持热重载）
npm run dev
```

服务将在 `http://localhost:3001` 启动

## 三、API 测试方法

### 1. 使用工具
推荐使用以下工具进行API测试：
- Postman
- Insomnia
- VSCode REST Client 插件
- curl 命令行工具

### 2. 测试流程

#### 步骤1：管理员登录
首先需要登录获取token，后续所有需要认证的接口都需要在请求头中携带此token。

**请求示例：**
```bash
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "admin",
    "password": "123456"
  }'
```

**响应示例：**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "userInfo": {
      "nickName": "十三",
      "loginUserName": "admin"
    }
  }
}
```

#### 步骤2：使用Token访问其他接口
获取token后，在请求头中添加 `X-Access-Token` 字段：

```bash
curl -X GET http://localhost:3001/api/admin/profile \
  -H "X-Access-Token: your-token-here"
```

## 四、主要API接口测试

### 1. 管理员相关接口

#### 登录
- **URL**: `POST /api/admin/login`
- **Body**: 
  ```json
  {
    "userName": "admin",
    "password": "123456"
  }
  ```

#### 获取个人信息
- **URL**: `GET /api/admin/profile`
- **Headers**: `X-Access-Token: your-token`

#### 修改密码
- **URL**: `PUT /api/admin/password`
- **Headers**: `X-Access-Token: your-token`
- **Body**:
  ```json
  {
    "originalPassword": "123456",
    "newPassword": "newpassword"
  }
  ```

### 2. 商品分类接口

#### 获取分类列表
- **URL**: `GET /api/categories?pageNumber=1&pageSize=10&categoryLevel=1&parentId=0`
- **Headers**: `X-Access-Token: your-token`

#### 创建分类
- **URL**: `POST /api/categories`
- **Headers**: `X-Access-Token: your-token`
- **Body**:
  ```json
  {
    "categoryLevel": 1,
    "parentId": 0,
    "categoryName": "测试分类",
    "categoryRank": 1
  }
  ```

### 3. 商品管理接口

#### 获取商品列表
- **URL**: `GET /api/goods/list?pageNumber=1&pageSize=10`
- **Headers**: `X-Access-Token: your-token`

#### 创建商品
- **URL**: `POST /api/goods`
- **Headers**: `X-Access-Token: your-token`
- **Body**:
  ```json
  {
    "goodsName": "测试商品",
    "goodsIntro": "商品简介",
    "goodsCategoryId": 45,
    "goodsCoverImg": "/upload/test.jpg",
    "goodsCarousel": "/upload/test.jpg",
    "goodsDetailContent": "商品详情",
    "originalPrice": 100,
    "sellingPrice": 80,
    "stockNum": 100,
    "tag": "热销",
    "goodsSellStatus": 0
  }
  ```

### 4. 轮播图管理接口

#### 获取轮播图列表
- **URL**: `GET /api/carousels?pageNumber=1&pageSize=10`
- **Headers**: `X-Access-Token: your-token`

#### 创建轮播图
- **URL**: `POST /api/carousels`
- **Headers**: `X-Access-Token: your-token`
- **Body**:
  ```json
  {
    "carouselUrl": "/upload/banner.jpg",
    "redirectUrl": "http://example.com",
    "carouselRank": 100
  }
  ```

### 5. 用户管理接口

#### 获取用户列表
- **URL**: `GET /api/users?pageNumber=1&pageSize=10`
- **Headers**: `X-Access-Token: your-token`

#### 锁定/解锁用户
- **URL**: `PUT /api/users/:userId/lock/:lockStatus`
- **Headers**: `X-Access-Token: your-token`
- **Params**: 
  - `userId`: 用户ID
  - `lockStatus`: 0-解锁, 1-锁定

### 6. 订单管理接口

#### 获取订单列表
- **URL**: `GET /api/orders?pageNumber=1&pageSize=10&orderStatus=0`
- **Headers**: `X-Access-Token: your-token`

#### 修改订单状态
- **URL**: `PUT /api/orders/:orderId/status`
- **Headers**: `X-Access-Token: your-token`
- **Body**:
  ```json
  {
    "orderStatus": 1
  }
  ```

### 7. 文件上传接口

#### 上传文件
- **URL**: `POST /api/upload/file`
- **Headers**: `X-Access-Token: your-token`
- **Body**: FormData
  - `file`: 文件

**curl示例：**
```bash
curl -X POST http://localhost:3001/api/upload/file \
  -H "X-Access-Token: your-token" \
  -F "file=@/path/to/your/file.jpg"
```

## 五、测试数据

### 默认管理员账号
- 用户名：admin
- 密码：123456

### 其他测试账号（从数据库中可见）
- 用户名：newbee-admin1，密码：123456
- 用户名：newbee-admin2，密码：123456

## 六、常见问题

### 1. 数据库连接失败
检查 `.env` 文件中的数据库配置：
```
DB_HOST=sillytavern.ip-ddns.com
DB_USER=liuw
DB_PASSWORD=3481@wangQ
DB_NAME=newbee_mall_db_v2
```

### 2. Token过期
Token有效期为48小时，过期后需要重新登录获取新的token。

### 3. 文件上传失败
- 确保 `uploads` 目录存在且有写入权限
- 检查文件大小是否超过限制
- 确保文件类型符合要求

## 七、响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

## 八、使用 Postman 测试

### 1. 导入环境变量
创建一个新的环境，设置以下变量：
- `baseUrl`: http://localhost:3001/api
- `token`: (登录后自动设置)

### 2. 登录请求配置
- Method: POST
- URL: {{baseUrl}}/admin/login
- Body (JSON):
  ```json
  {
    "userName": "admin",
    "password": "123456"
  }
  ```
- Tests脚本（自动保存token）:
  ```javascript
  if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.data.token);
  }
  ```

### 3. 其他请求配置
- Headers: 
  - Key: `X-Access-Token`
  - Value: `{{token}}`

## 九、批量测试脚本

创建一个简单的测试脚本 `test-api.js`：

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
let token = '';

// 登录
async function login() {
  try {
    const response = await axios.post(`${API_BASE}/admin/login`, {
      userName: 'admin',
      password: '123456'
    });
    token = response.data.data.token;
    console.log('登录成功，token:', token);
    return token;
  } catch (error) {
    console.error('登录失败:', error.response?.data || error.message);
  }
}

// 测试获取个人信息
async function testProfile() {
  try {
    const response = await axios.get(`${API_BASE}/admin/profile`, {
      headers: { 'X-Access-Token': token }
    });
    console.log('个人信息:', response.data);
  } catch (error) {
    console.error('获取个人信息失败:', error.response?.data || error.message);
  }
}

// 测试获取商品列表
async function testGoods() {
  try {
    const response = await axios.get(`${API_BASE}/goods/list?pageNumber=1&pageSize=10`, {
      headers: { 'X-Access-Token': token }
    });
    console.log('商品列表:', response.data);
  } catch (error) {
    console.error('获取商品列表失败:', error.response?.data || error.message);
  }
}

// 运行测试
async function runTests() {
  await login();
  if (token) {
    await testProfile();
    await testGoods();
  }
}

runTests();
```

运行测试：
```bash
npm install axios
node test-api.js
```

## 十、总结

通过以上方法，您可以全面测试NewBee Mall Admin API的所有功能。建议：
1. 先测试登录接口，确保能获取到token
2. 使用token测试其他需要认证的接口
3. 注意检查响应状态码和数据格式
4. 测试异常情况，如错误的参数、无效的token等

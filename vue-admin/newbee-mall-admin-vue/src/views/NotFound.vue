<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1 class="error-code">404</h1>
      <h2 class="error-message">页面不存在</h2>
      <p class="error-description">抱歉，您访问的页面不存在或已被删除</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.not-found-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.not-found-content {
  text-align: center;
  
  .error-code {
    font-size: 120px;
    font-weight: bold;
    color: #409eff;
    margin: 0;
    line-height: 1;
  }
  
  .error-message {
    font-size: 32px;
    color: #333;
    margin: 20px 0;
  }
  
  .error-description {
    font-size: 16px;
    color: #666;
    margin-bottom: 30px;
  }
}
</style>

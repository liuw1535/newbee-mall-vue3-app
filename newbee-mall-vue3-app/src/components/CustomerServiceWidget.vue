<template>
  <div class="customer-service-widget">
    <!-- 悬浮客服按钮，仅在在线客服页面外显示 -->
    <div 
      v-if="!hideBtn && isLogin"
      class="service-float-btn"
      @mousedown="onBtnMouseDown"
      @touchstart="onBtnTouchStart"
      @click="onBtnClick"
      :style="{ right: btnPos.right + 'px', bottom: btnPos.bottom + 'px' }"
    >
      <van-icon name="chat-o" />
      <span class="btn-text">联系客服</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getLocal } from '@/common/js/utils'

const router = useRouter()
const route = useRoute()

// 判断是否在在线客服页面
const hideBtn = computed(() => ['/customer-service', '/help-center'].includes(route.path))
// 判断是否已登录
const isLogin = computed(() => !!getLocal('token'))

// 悬浮按钮位置
const btnPos = ref({ right: 32, bottom: 32 })
let dragging = false
let startX = 0, startY = 0, startRight = 0, startBottom = 0
let lastMove = 0

// 防止鼠标拖动时页面被选中
const onBtnMouseDown = (e) => {
  dragging = true
  startX = e.clientX
  startY = e.clientY
  startRight = btnPos.value.right
  startBottom = btnPos.value.bottom
  document.body.style.userSelect = 'none' // 禁止选中
  document.addEventListener('mousemove', onBtnMouseMove)
  document.addEventListener('mouseup', onBtnMouseUp)
}
const onBtnMouseMove = (e) => {
  if (!dragging) return
  // 立即响应，无节流
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  let newRight = startRight - dx
  let newBottom = startBottom - dy
  newRight = Math.max(0, Math.min(window.innerWidth - 56, newRight))
  newBottom = Math.max(0, Math.min(window.innerHeight - 56, newBottom))
  btnPos.value = { right: newRight, bottom: newBottom }
}
const onBtnMouseUp = () => {
  dragging = false
  document.body.style.userSelect = '' // 恢复选中
  document.removeEventListener('mousemove', onBtnMouseMove)
  document.removeEventListener('mouseup', onBtnMouseUp)
}

// 手机端 touch 拖动
const onBtnTouchStart = (e) => {
  if (e.touches.length !== 1) return
  dragging = true
  startX = e.touches[0].clientX
  startY = e.touches[0].clientY
  startRight = btnPos.value.right
  startBottom = btnPos.value.bottom
  document.body.style.userSelect = 'none'
  document.addEventListener('touchmove', onBtnTouchMove, { passive: false })
  document.addEventListener('touchend', onBtnTouchEnd)
}
const onBtnTouchMove = (e) => {
  if (!dragging || e.touches.length !== 1) return
  e.preventDefault() // 防止页面滚动
  // 立即响应，无节流
  const dx = e.touches[0].clientX - startX
  const dy = e.touches[0].clientY - startY
  let newRight = startRight - dx
  let newBottom = startBottom - dy
  newRight = Math.max(0, Math.min(window.innerWidth - 56, newRight))
  newBottom = Math.max(0, Math.min(window.innerHeight - 56, newBottom))
  btnPos.value = { right: newRight, bottom: newBottom }
}
const onBtnTouchEnd = () => {
  dragging = false
  document.body.style.userSelect = ''
  document.removeEventListener('touchmove', onBtnTouchMove)
  document.removeEventListener('touchend', onBtnTouchEnd)
}

// 悬浮按钮点击跳转
const onBtnClick = () => {
  router.push('/customer-service')
}
</script>

<style lang="less" scoped>
.customer-service-widget {
  .service-float-btn {
    position: fixed;
    right: 32px;
    bottom: 32px;
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #1baeae, #0dc3c3);
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #fff;
    box-shadow: 0 4px 16px rgba(27, 174, 174, 0.25);
    z-index: 9999;
    cursor: pointer;
    transition: all 0.3s;
    .van-icon {
      font-size: 24px;
      margin-bottom: 2px;
    }
    .btn-text {
      font-size: 12px;
      font-weight: bold;
    }
    &:hover {
      filter: brightness(1.1);
      box-shadow: 0 6px 24px rgba(27, 174, 174, 0.35);
    }
  }
}
</style> 
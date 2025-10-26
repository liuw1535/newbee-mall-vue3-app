<template>
    <div class="customer-service">
      <div class="top-info">
        <!-- 客服信息卡片 -->
        <div class="service-info">
          <div class="service-avatar">
            <img src="https://tse4-mm.cn.bing.net/th/id/OIP-C.-TjOpyljf88qHUgFxU_fQQHaHR?rs=1&pid=ImgDetMain&cb=idpwebp2&o=7&rm=3" alt="客服头像">
          </div>
          <div class="service-details">
            <h3>在线客服  <span class="status online">在线</span></h3>
            
            <p class="response-time">平均响应时间：十秒</p>
          </div>
        </div>
        <!-- 常见问题 -->
        <div class="quick-questions">
          <h4>常见问题</h4>
          <div class="question-list">
            <van-button 
              v-for="question in quickQuestions" 
              :key="question.id"
              size="small" 
              plain 
              @click="selectQuickQuestion(question)"
              class="question-btn"
            >
              {{ question.text }}
            </van-button>
          </div>
          <div class="help-center-link">
            <van-button 
              size="small" 
              type="primary" 
              plain 
              @click="goToHelpCenter"
              class="help-btn"
            >
              <van-icon name="question-o" />
              更多帮助
            </van-button>
          </div>
        </div>
      </div>
      <!-- 聊天界面 -->
      <div class="chat-container" ref="chatContainer">
        <div class="chat-messages" ref="chatMessagesRef">
          <div 
            v-for="(message, index) in chatMessages" 
            :key="index"
            :class="['message', message.type]"
          >
            <div class="message-avatar">
              <img 
                :src="message.type === 'user' ? userAvatar : serviceAvatar" 
                :alt="message.type === 'user' ? '用户' : '客服'"
              >
            </div>
            <div class="message-content">
              <div class="message-text">{{ message.text }}</div>
              <div class="message-time">{{ formatTime(message.time) }}</div>
            </div>
          </div>
        </div>
      </div>
      <!-- 输入框 -->
      <div class="chat-input">
        <van-field
          v-model="inputMessage"
          placeholder="请输入您的问题..."
          @keyup.enter="sendMessage"
          
          class="message-input"
        >
          <template #button>
            <van-button 
              size="small" 
              type="primary" 
              @click="sendMessage"
              :disabled="!inputMessage.trim()"
            >
              发送
            </van-button>
          </template>
        </van-field>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, nextTick, computed } from 'vue'
  import sHeader from '@/components/SimpleHeader.vue'
  import { showToast } from 'vant'
  import { useRouter } from 'vue-router'
  import axios from 'axios'
  import { chatWithRealService } from '@/service/customerService'
  
  const chatContainer = ref(null)
  const chatMessagesRef = ref(null)
  const inputMessage = ref('')
  const router = useRouter()
  
  // 头像
  const userAvatar = 'https://img2.baidu.com/it/u=1229714504,1626351580&fm=253&fmt=auto&app=138&f=JPEG?w=513&h=513'
  const serviceAvatar = 'https://tse4-mm.cn.bing.net/th/id/OIP-C.-TjOpyljf88qHUgFxU_fQQHaHR?rs=1&pid=ImgDetMain&cb=idpwebp2&o=7&rm=3'
  
  // 快捷问题
  const quickQuestions = ref([
    { id: 1, text: '如何修改收货地址？' },
    { id: 2, text: '订单什么时候发货？' },
    { id: 3, text: '如何申请退款？' },
    { id: 4, text: '商品有质量问题怎么办？' },
    { id: 5, text: '支持哪些支付方式？' },
    { id: 6, text: '运费怎么计算？' }
  ])
  
  // 预设回复
  const presetReplies = {
    '如何修改收货地址？': '您可以在"我的"页面点击"地址管理"，然后编辑或新增收货地址。',
    '订单什么时候发货？': '正常情况下，我们会在您下单后24小时内发货，节假日可能会有所延迟。',
    '如何申请退款？': '您可以在"我的订单"中找到对应订单，点击"申请退款"按钮进行退款申请。',
    '商品有质量问题怎么办？': '如果商品有质量问题，请在收到商品后7天内联系客服，我们会为您处理退换货。',
    '支持哪些支付方式？': '我们支持支付宝、微信支付等多种支付方式，您可以在下单时选择。',
    '运费怎么计算？': '全场满50元包邮，不满50元收取5元运费。'
  }
  
  // 欢迎消息
  const welcomeMessage = {
    type: 'service',
    text: '您好！欢迎咨询新蜂商城客服，请问有什么可以帮助您的吗？',
    time: new Date()
  }
  
  // 聊天消息
  const chatMessages = ref([welcomeMessage])
  // OpenAI格式上下文
  const messages = ref([
    { role: 'system', content: '你是新蜂商城的智能客服，请用简洁、友好的语气回答用户问题，并且回答的条理清晰，适当换行，可视化友好' }
  ])
  
  // 选择快捷问题
  const selectQuickQuestion = (question) => {
    inputMessage.value = question.text
    sendMessage()
  }
  
  // 发送消息
  const sendMessage = async () => {
    if (!inputMessage.value.trim()) return
  
    // 添加用户消息到本地和messages数组
    const userMessage = {
      type: 'user',
      text: inputMessage.value,
      time: new Date()
    }
    chatMessages.value.push(userMessage)
    messages.value.push({ role: 'user', content: inputMessage.value })
  
    const userQuestion = inputMessage.value
    inputMessage.value = ''
  
    await nextTick()
    scrollToBottom()
  
    // loading消息
    const loadingMsg = {
      type: 'service',
      text: '正在为您查询，请稍候...',
      time: new Date()
    }
    chatMessages.value.push(loadingMsg)
    await nextTick()
    scrollToBottom()
  
    // 请求真实客服
    try {
      console.log('发送消息到AI客服:', messages.value)
      const res = await chatWithRealService(messages.value)
      console.log('AI接口完整返回：', res)
      // 兼容不同返回结构
      let reply = ''
      if (res.data?.choices?.[0]?.message?.content) {
        reply = res.data.choices[0].message.content
      } else if (res.choices?.[0]?.message?.content) {
        reply = res.choices[0].message.content
      } else {
        reply = '客服暂时无法回复，请稍后再试。'
      }
      // 移除loading
      chatMessages.value.pop()
      // 添加客服回复
      chatMessages.value.push({
        type: 'service',
        text: reply,
        time: new Date()
      })
      // 添加到messages
      messages.value.push({ role: 'assistant', content: reply })
      await nextTick()
      scrollToBottom()
    } catch (e) {
      console.error('AI客服接口错误:', e)
      chatMessages.value.pop()
      // catch里也尝试解析AI接口返回内容
      let reply = ''
      if (e.response && e.response.data && e.response.data.choices && e.response.data.choices[0]?.message?.content) {
        reply = e.response.data.choices[0].message.content
      } else if (e.choices && e.choices[0]?.message?.content) {
        reply = e.choices[0].message.content
      } else {
        // 如果AI接口失败，降级到本地回复
        reply = getReply(userQuestion)
        showToast('已切换到本地客服模式')
      }
      chatMessages.value.push({
        type: 'service',
        text: reply,
        time: new Date()
      })
      messages.value.push({ role: 'assistant', content: reply })
      await nextTick()
      scrollToBottom()
    }
  }
  
  // 获取回复（与悬浮客服组件保持一致的逻辑）
  const getReply = (question) => {
    // 检查是否有预设回复
    for (const [key, value] of Object.entries(presetReplies)) {
      if (question.includes(key) || key.includes(question)) {
        return value
      }
    }
  
    // 智能回复
    if (question.includes('地址') || question.includes('收货')) {
      return '您可以在"我的"页面点击"地址管理"，然后编辑或新增收货地址。'
    } else if (question.includes('发货') || question.includes('物流') || question.includes('配送')) {
      return '正常情况下，我们会在您下单后24小时内发货，节假日可能会有所延迟。您可以在订单详情中查看物流信息。'
    } else if (question.includes('退款') || question.includes('退货') || question.includes('退换')) {
      return '您可以在"我的订单"中找到对应订单，点击"申请退款"按钮进行退款申请。如果商品有质量问题，请在收到商品后7天内联系我们。'
    } else if (question.includes('支付') || question.includes('付款')) {
      return '我们支持支付宝、微信支付等多种支付方式，您可以在下单时选择。'
    } else if (question.includes('运费') || question.includes('邮费')) {
      return '全场满50元包邮，不满50元收取10元运费。'
    } else if (question.includes('商品') || question.includes('产品')) {
      return '关于商品的具体信息，我可以为您详细介绍。请问您想了解哪个方面呢？'
    } else if (question.includes('优惠') || question.includes('折扣') || question.includes('活动')) {
      return '我们经常有各种优惠活动，建议您关注我们的促销页面获取最新优惠信息。'
    } else if (question.includes('账号') || question.includes('登录') || question.includes('注册')) {
      return '如果您在账号登录或注册方面遇到问题，请检查网络连接或联系技术支持。'
    } else {
      return '感谢您的咨询！如果还有其他问题，请随时联系我们。您也可以查看帮助中心获取更多信息。'
    }
  }
  
  // 滚动到底部
  const scrollToBottom = () => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  }
  
  // 格式化时间
  const formatTime = (time) => {
    const date = new Date(time)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }
  
  const goToCustomerService = () => {
    router.push({ path: '/customer-service' })
  }
  
  const goToHelpCenter = () => {
    router.push({ path: '/help-center' })
  }
  
  onMounted(() => {
    nextTick(() => {
      scrollToBottom()
    })
  })
  </script>
  
  <style lang="less" scoped>
  @import '../common/style/mixin';
  .customer-service {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f5f5;
  
    .top-info {
      background: #fff;
      border-radius: 0 0 12px 12px;
      margin: 10px 10px 0 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      padding: 10px 0 0 0;
      .service-info {
        display: flex;
        align-items: center;
        padding: 10px 20px 0 20px;
        .service-avatar {
          width: 60px;
          height: 60px;
          margin-right: 15px;
          img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
          }
        }
        .service-details {
          flex: 1;
          h3 {
            margin: 0 0 5px 0;
            font-size: 18px;
            color: #333;
          }
          .status {
            margin: 5px 0;
            font-size: 14px;
            &.online {
              color: #52c41a;
            }
          }
          .response-time {
            margin: 5px 0 0 0;
            font-size: 12px;
            color: #4582ad;
          }
        }
      }
      .quick-questions {
        background: none;
        margin: 0;
        padding: 10px 20px 10px 20px;
        border-radius: 0;
        box-shadow: none;
        h4 {
          margin: 0 0 10px 0;
          font-size: 16px;
          color: #333;
        }
        .question-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          .question-btn {
            font-size: 12px;
            border-radius: 15px;
            border-color: #1baeae;
            color: #1baeae;
            &:hover {
              background: #1baeae;
              color: #fff;
            }
          }
        }
        .help-center-link {
          margin-top: 10px;
          text-align: right;
          .help-btn {
            font-size: 12px;
            border-radius: 15px;
            border-color: #1baeae;
            color: #1baeae;
            &:hover {
              background: #1baeae;
              color: #fff;
            }
          }
        }
      }
    }
    .chat-container {
      flex: 1;
      background: #fff;
      margin: 10px 10px 0 10px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 15px;
        .message {
          display: flex;
          margin-bottom: 15px;
          align-items: flex-start;
          &.user {
            flex-direction: row-reverse;
            .message-content {
              margin-left: 0;
              margin-right: 10px;
              background: #1baeae;
              color: #fff;
              .message-time {
                text-align: right;
                color: rgba(255, 255, 255, 0.8);
              }
            }
          }
          &.service {
            .message-content {
              margin-left: 10px;
              margin-right: 0;
              background: #f0f0f0;
              color: #333;
            }
          }
          .message-avatar {
            width: 40px;
            height: 40px;
            flex-shrink: 0;
            img {
              width: 100%;
              height: 100%;
              border-radius: 50%;
            }
          }
          .message-content {
            max-width: 70%;
            padding: 10px 12px;
            border-radius: 18px;
            word-wrap: break-word;
            .message-text {
              font-size: 14px;
              line-height: 1.4;
              margin-bottom: 5px;
            }
            .message-time {
              font-size: 11px;
              opacity: 0.7;
            }
          }
        }
      }
    }
    .chat-input {
      background: #fff;
      margin: 0 10px 10px 10px;
      border-radius: 0 0 8px 8px;
      padding: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      .message-input {
        .van-field__body {
          display: flex;
          align-items: center;
        }
        .van-button {
          margin-left: 10px;
          background: #1baeae;
          border-color: #1baeae;
        }
      }
    }
  }
  </style>
  
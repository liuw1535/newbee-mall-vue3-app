<template>
  <div class="help-center">
    <s-header :name="'帮助中心'"></s-header>
    
    <!-- 搜索框 -->
    <div class="search-section">
      <van-search
        v-model="searchKeyword"
        placeholder="搜索问题"
        @search="searchQuestions"
        class="search-input"
      />
    </div>

    <!-- 分类导航 -->
    <div class="category-nav">
      <van-tabs v-model="activeCategory" @click-tab="onCategoryChange">
        <van-tab 
          v-for="category in categories" 
          :key="category.id"
          :title="category.name"
          :name="category.id"
        >
          <div class="category-content">
            <van-collapse v-model="activeNames" accordion>
              <van-collapse-item 
                v-for="question in category.questions" 
                :key="question.id"
                :title="question.title"
                :name="question.id"
              >
                <div class="question-content" v-html="question.content"></div>
              </van-collapse-item>
            </van-collapse>
          </div>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 联系客服 -->
    <div class="contact-section">
      <van-button 
        type="primary" 
        block 
        @click="goToCustomerService"
        class="contact-btn"
      >
        <van-icon name="chat-o" />
        联系在线客服
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import sHeader from '@/components/SimpleHeader.vue'
import { showToast } from 'vant'

const router = useRouter()
const searchKeyword = ref('')
const activeCategory = ref('1')
const activeNames = ref(['1'])

// 帮助分类
const categories = ref([
  {
    id: '1',
    name: '购物指南',
    questions: [
      {
        id: '1-1',
        title: '如何注册账号？',
        content: '点击首页右上角的"登录"按钮，选择"注册"选项，填写手机号和验证码即可完成注册。'
      },
      {
        id: '1-2',
        title: '如何搜索商品？',
        content: '在首页搜索框中输入商品名称、品牌或关键词，点击搜索即可找到相关商品。'
      },
      {
        id: '1-3',
        title: '如何加入购物车？',
        content: '在商品详情页面，选择商品规格和数量，点击"加入购物车"按钮即可。'
      },
      {
        id: '1-4',
        title: '如何下单购买？',
        content: '在购物车中选择要购买的商品，点击"结算"，填写收货地址和支付方式即可完成下单。'
      }
    ]
  },
  {
    id: '2',
    name: '支付问题',
    questions: [
      {
        id: '2-1',
        title: '支持哪些支付方式？',
        content: '我们支持支付宝、微信支付、银行卡等多种支付方式，您可以在下单时选择。'
      },
      {
        id: '2-2',
        title: '支付失败怎么办？',
        content: '请检查网络连接和支付账户余额，如果问题持续存在，请联系客服处理。'
      },
      {
        id: '2-3',
        title: '如何申请退款？',
        content: '在"我的订单"中找到对应订单，点击"申请退款"按钮，填写退款原因即可。'
      },
      {
        id: '2-4',
        title: '退款多久到账？',
        content: '退款会在3-5个工作日内原路返回到您的支付账户。'
      }
    ]
  },
  {
    id: '3',
    name: '物流配送',
    questions: [
      {
        id: '3-1',
        title: '多久发货？',
        content: '正常情况下，我们会在您下单后24小时内发货，节假日可能会有所延迟。'
      },
      {
        id: '3-2',
        title: '如何查看物流？',
        content: '在"我的订单"中点击订单详情，即可查看物流信息和配送状态。'
      },
      {
        id: '3-3',
        title: '运费怎么计算？',
        content: '全场满50元包邮，不满50元收取5元运费。'
      },
      {
        id: '3-4',
        title: '支持哪些快递？',
        content: '我们主要使用顺丰、圆通、中通等知名快递公司，确保商品安全送达。'
      }
    ]
  },
  {
    id: '4',
    name: '售后服务',
    questions: [
      {
        id: '4-1',
        title: '退换货政策是什么？',
        content: '我们支持7天无理由退换货，商品有质量问题15天内可退换。'
      },
      {
        id: '4-2',
        title: '如何申请退换货？',
        content: '在订单详情页面点击"申请退换货"，选择退换货原因和商品即可。'
      },
      {
        id: '4-3',
        title: '退换货运费谁承担？',
        content: '商品质量问题由我们承担运费，无理由退换货由买家承担运费。'
      },
      {
        id: '4-4',
        title: '商品有质量问题怎么办？',
        content: '请拍照留存证据，联系客服处理，我们会为您安排退换货。'
      }
    ]
  }
])

// 搜索问题
const searchQuestions = () => {
  if (!searchKeyword.value.trim()) {
    showToast('请输入搜索关键词')
    return
  }
  
  // 这里可以实现搜索逻辑
  showToast(`搜索：${searchKeyword.value}`)
}

// 切换分类
const onCategoryChange = (tab) => {
  activeCategory.value = tab.name
  activeNames.value = [categories.value.find(c => c.id === tab.name)?.questions[0]?.id || '1']
}

// 跳转到客服页面
const goToCustomerService = () => {
  router.push('/customer-service')
}
</script>

<style lang="less" scoped>
@import '../common/style/mixin';

.help-center {
  min-height: 100vh;
  background: #f5f5f5;

  .search-section {
    background: #fff;
    padding: 10px;
    margin-bottom: 10px;

    .search-input {
      .van-search__content {
        background: #f5f5f5;
        border-radius: 20px;
      }
    }
  }

  .category-nav {
    background: #fff;
    margin-bottom: 20px;

    .van-tabs__wrap {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .van-tab--active {
      color: #1baeae;
    }

    .van-tabs__line {
      background: #1baeae;
    }

    .category-content {
      padding: 15px;

      .van-collapse-item {
        .van-collapse-item__title {
          font-size: 14px;
          color: #333;
        }

        .question-content {
          font-size: 13px;
          color: #666;
          line-height: 1.6;
          padding: 10px 0;
        }
      }
    }
  }

  .contact-section {
    padding: 20px;
    background: #fff;

    .contact-btn {
      background: linear-gradient(135deg, #1baeae, #0dc3c3);
      border: none;
      border-radius: 25px;
      height: 50px;
      font-size: 16px;

      .van-icon {
        margin-right: 8px;
      }
    }
  }
}
</style> 
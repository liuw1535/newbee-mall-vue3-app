<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12">
        <el-card>
          <template #header>
            <span>个人信息</span>
          </template>
          <el-form :model="userInfo" label-width="100px">
            <el-form-item label="登录名">
              <el-input v-model="userInfo.loginUserName" disabled />
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="nickName" placeholder="请输入昵称" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="updateNickName">更新昵称</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12">
        <el-card>
          <template #header>
            <span>修改密码</span>
          </template>
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
          >
            <el-form-item label="原密码" prop="originalPassword">
              <el-input
                v-model="passwordForm.originalPassword"
                type="password"
                placeholder="请输入原密码"
                show-password
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码"
                show-password
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="updatePassword">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { updateProfile, updatePassword as updatePwd } from '@/utils/api'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const nickName = ref('')
const passwordFormRef = ref()

// 密码表单
const passwordForm = reactive({
  originalPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 验证确认密码
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

// 密码表单验证规则
const passwordRules = {
  originalPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 更新昵称
const updateNickName = async () => {
  if (!nickName.value.trim()) {
    ElMessage.warning('昵称不能为空')
    return
  }
  
  try {
    const res = await updateProfile({ nickName: nickName.value })
    if (res.code === 200) {
      ElMessage.success('昵称更新成功')
      // 重新获取用户信息
      await userStore.getUserInfo()
      nickName.value = userStore.userInfo.nickName
    }
  } catch (error) {
    console.error('更新昵称失败:', error)
  }
}

// 修改密码
const updatePassword = () => {
  passwordFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        const res = await updatePwd({
          originalPassword: passwordForm.originalPassword,
          newPassword: passwordForm.newPassword
        })
        if (res.code === 200) {
          ElMessage.success('密码修改成功，请重新登录')
          // 清除登录状态并跳转到登录页
          userStore.clearLoginStatus()
          setTimeout(() => {
            window.location.href = '/login'
          }, 1000)
        }
      } catch (error) {
        console.error('修改密码失败:', error)
      }
    }
  })
}

onMounted(() => {
  nickName.value = userInfo.value.nickName || ''
})
</script>

<style lang="scss" scoped>
.profile-container {
  .el-col {
    margin-bottom: 20px;
  }
}
</style>

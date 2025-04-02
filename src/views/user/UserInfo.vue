<script setup>
import { ref } from 'vue'
import useUserInfoStore from '@/stores/userInfo.js'
import { userNameUpdateService, resetPasswordService } from '@/api/user.js'
import { ElMessage } from 'element-plus'
import { useTokenStore } from '@/stores/token.js'
import { View, Hide } from '@element-plus/icons-vue'

const userInfoStore = useUserInfoStore()
const tokenStore = useTokenStore()
const userFormRef = ref(null)
const userInfo = ref({ ...userInfoStore.info })

// Password visibility toggles
const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Only keep password reset toggle
const enablePasswordReset = ref(false)

// Loading state
const loading = ref(false)

// Password reset fields
const passwordInfo = ref({
  old_pwd: '',
  new_pwd: '',
  re_pwd: ''
})

const rules = {
  userName: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 16, message: '昵称长度为2~16位', trigger: 'blur' }
  ],
  old_pwd: [
    { 
      required: true, 
      message: '请输入旧密码', 
      trigger: 'blur', 
      validator: (rule, value) => enablePasswordReset.value ? !!value : true 
    }
  ],
  new_pwd: [
    { 
      required: true, 
      message: '请输入新密码', 
      trigger: 'blur', 
      validator: (rule, value) => enablePasswordReset.value ? !!value : true 
    },
    { 
      min: 6, 
      message: '密码长度至少6位', 
      trigger: 'blur', 
      validator: (rule, value) => enablePasswordReset.value ? value.length >= 6 : true 
    }
  ],
  re_pwd: [
    { 
      required: true, 
      message: '请确认新密码', 
      trigger: 'blur', 
      validator: (rule, value) => enablePasswordReset.value ? !!value : true 
    },
    {
      validator: (rule, value, callback) => {
        if (enablePasswordReset.value && value !== passwordInfo.value.new_pwd) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const updateUserInfo = async () => {
  if (loading.value) return
  
  try {
    await userFormRef.value.validate()
    loading.value = true
    
    const hasNicknameChange = userInfo.value.userName !== userInfoStore.info.userName
    const hasPasswordChange = enablePasswordReset.value
    
    if (!hasNicknameChange && !hasPasswordChange) {
      ElMessage.info('没有修改任何信息')
      return
    }

    // 昵称修改 - 直接传递字符串而不是对象
    if (hasNicknameChange) {
      const result = await userNameUpdateService(userInfo.value.userName)
        .catch(err => {
          throw new Error(err.response?.data?.msg || '昵称更新失败')
        })
      
      if (result.code === 0) {
        ElMessage.success(result.msg || '昵称更新成功')
        // 只更新store中的userName，保留其他信息
        userInfoStore.setInfo({
          ...userInfoStore.info,
          userName: userInfo.value.userName
        })
      } else {
        throw new Error(result.msg || '昵称更新失败')
      }
    }

    // 如果有密码修改
    if (hasPasswordChange) {
      const passwordResult = await resetPasswordService(passwordInfo.value)
        .catch(err => {
          throw new Error(err.response?.data?.msg || '密码重置失败')
        })
      
      if (passwordResult.code === 0) {
        ElMessage.success(passwordResult.msg || '密码重置成功')
        tokenStore.removeToken()
        userInfoStore.removeInfo()
        window.location.href = '/'
      } else {
        throw new Error(passwordResult.msg || '密码重置失败')
      }
    }

  } catch (error) {
    ElMessage.error(error.message)
    console.error('API Error:', error)
    
    // 恢复原来的昵称显示
    userInfo.value.userName = userInfoStore.info.userName
  } finally {
    loading.value = false
  }
}

</script>


<template>
  <el-card class="page-container shadow">
    <template #header>
      <div class="header">
        <span class="header-title">📋基本资料</span>
      </div>
    </template>

    <el-divider></el-divider>

    <el-form 
      ref="userFormRef" 
      :model="{ ...userInfo, ...passwordInfo }" 
      :rules="rules" 
      label-width="120px" 
      size="large"
    >
      <el-form-item label="用户ID">
        <el-input v-model="userInfo.userId" disabled class="readonly-input"></el-input>
      </el-form-item>
      <el-form-item label="用户昵称" prop="userName">
        <el-input 
          v-model="userInfo.userName" 
          placeholder="请输入您的昵称"
          :disabled="loading"
        ></el-input>
      </el-form-item>

      <!-- Password Reset Module -->
      <div class="password-section">
        <el-checkbox 
          v-model="enablePasswordReset" 
          label="重置密码"
          :disabled="loading"
        />
        <div v-if="enablePasswordReset" class="edit-fields">
          <el-form-item label="旧密码" prop="old_pwd">
            <el-input 
              v-model="passwordInfo.old_pwd" 
              :type="showOldPassword ? 'text' : 'password'" 
              placeholder="请输入旧密码"
              :disabled="loading"
            >
              <template #suffix>
                <el-icon 
                  class="password-icon" 
                  @click="showOldPassword = !showOldPassword"
                >
                  <component :is="showOldPassword ? View : Hide" />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="新密码" prop="new_pwd">
            <el-input 
              v-model="passwordInfo.new_pwd" 
              :type="showNewPassword ? 'text' : 'password'" 
              placeholder="请输入新密码"
              :disabled="loading"
            >
              <template #suffix>
                <el-icon 
                  class="password-icon" 
                  @click="showNewPassword = !showNewPassword"
                >
                  <component :is="showNewPassword ? View : Hide" />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="re_pwd">
            <el-input 
              v-model="passwordInfo.re_pwd" 
              :type="showConfirmPassword ? 'text' : 'password'" 
              placeholder="请确认新密码"
              :disabled="loading"
            >
              <template #suffix>
                <el-icon 
                  class="password-icon" 
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <component :is="showConfirmPassword ? View : Hide" />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
        </div>
      </div>

      <!-- Centered Submit Button -->
      <el-form-item class="submit-button">
        <el-button 
          type="primary" 
          @click="updateUserInfo"
          :loading="loading"
        >
          {{ loading ? '提交中...' : '提交修改' }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped>
.page-container {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  border-radius: 12px;
  background-color: #fff;
}

.shadow {
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: bold;
  color: #333;
}

.readonly-input {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.password-section {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #fafafa;
}

.edit-fields {
  margin-top: 10px;
}

.submit-button {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 20px;
}

.password-icon {
  cursor: pointer;
  color: #c0c4cc;
  transition: color 0.2s;
}

.password-icon:hover {
  color: #909399;
}
</style>
<script setup>
import { ref } from 'vue';
import useUserInfoStore from '@/stores/userInfo.js';
import { userInfoUpdateService, resetPasswordService } from '@/api/user.js';
import { ElMessage } from 'element-plus';
import { useTokenStore } from '@/stores/token.js';

const userInfoStore = useUserInfoStore();
const tokenStore = useTokenStore();
const userFormRef = ref(null);
const originalUserInfo = ref({ ...userInfoStore.info }); // Store original data
const userInfo = ref({
  ...userInfoStore.info,
  profession: userInfoStore.info.profession || [],
  hobby: userInfoStore.info.hobby || [],
  skill: userInfoStore.info.skill || []
});

// Checkboxes for enabling each module
const enableInfoEdit = ref(false);
const enablePasswordReset = ref(false);

// Password reset fields
const passwordInfo = ref({
  old_pwd: '',
  new_pwd: '',
  re_pwd: ''
});

const attributeLabels = {
  A: "前端(A)", B: "后端(B)", C: "测试(C)", D: "运维(D)", E: "产品(E)",
  F: "唱歌(F)", G: "跳舞(G)", H: "写作(H)", I: "跑步(I)",
  J: "C++(J)", K: "Python(K)", L: "Java(L)", M: "Go(M)"
};

const professionOptions = ref([
  { label: "前端(A)", value: "A" },
  { label: "后端(B)", value: "B" },
  { label: "测试(C)", value: "C" },
  { label: "运维(D)", value: "D" },
  { label: "产品(E)", value: "E" }
]);

const hobbyOptions = ref([
  { label: "唱歌(F)", value: "F" },
  { label: "跳舞(G)", value: "G" },
  { label: "写作(H)", value: "H" },
  { label: "跑步(I)", value: "I" }
]);

const skillOptions = ref([
  { label: "C++(J)", value: "J" },
  { label: "Python(K)", value: "K" },
  { label: "Java(L)", value: "L" },
  { label: "Go(M)", value: "M" }
]);

// Format attributes for display
const formatAttributes = (attributes) => {
  if (!attributes) return '';
  return attributes.replace(/[()]/g, "").split(",").map(value => attributeLabels[value] || value).join(", ");
};

const rules = {
  userName: [
    { required: true, message: '请输入昵称', trigger: 'blur', validator: (rule, value) => enableInfoEdit.value ? !!value : true },
    { min: 2, max: 16, message: '昵称长度为2~16位', trigger: 'blur', validator: (rule, value) => enableInfoEdit.value ? value.length >= 2 && value.length <= 16 : true }
  ],
  profession: [
    { required: true, message: '请选择至少一个职业', trigger: 'change', validator: (rule, value) => enableInfoEdit.value ? value.length > 0 : true }
  ],
  hobby: [
    { required: true, message: '请选择至少一个爱好', trigger: 'change', validator: (rule, value) => enableInfoEdit.value ? value.length > 0 : true }
  ],
  skill: [
    { required: true, message: '请选择至少一个技能', trigger: 'change', validator: (rule, value) => enableInfoEdit.value ? value.length > 0 : true }
  ],
  old_pwd: [
    { required: true, message: '请输入旧密码', trigger: 'blur', validator: (rule, value) => enablePasswordReset.value ? !!value : true }
  ],
  new_pwd: [
    { required: true, message: '请输入新密码', trigger: 'blur', validator: (rule, value) => enablePasswordReset.value ? !!value : true },
    { min: 6, message: '密码长度至少6位', trigger: 'blur', validator: (rule, value) => enablePasswordReset.value ? value.length >= 6 : true }
  ],
  re_pwd: [
    { required: true, message: '请确认新密码', trigger: 'blur', validator: (rule, value) => enablePasswordReset.value ? !!value : true },
    {
      validator: (rule, value, callback) => {
        if (enablePasswordReset.value && value !== passwordInfo.value.new_pwd) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

const updateUserInfo = async () => {
  if (!enableInfoEdit.value && !enablePasswordReset.value) {
    ElMessage.info('请勾选“编辑基本信息”或“重置密码”以启用修改');
    return;
  }

  userFormRef.value.validate(async (valid) => {
    if (!valid) return;

    try {
      // Update basic info if enabled
      if (enableInfoEdit.value) {
        const selectedAttributes = [
          ...userInfo.value.profession,
          ...userInfo.value.hobby,
          ...userInfo.value.skill
        ];

        if (selectedAttributes.length === 0) {
          ElMessage.error('请至少选择一个职业、一个爱好和一个技能！');
          return;
        }

        let payload = {
          ...userInfo.value,
          attributes: `(${selectedAttributes.join(",")})`
        };

        let result = await userInfoUpdateService(payload);
        if (result.code === 0) {
          ElMessage.success(result.msg || '基本资料更新成功');
          userInfoStore.setInfo(userInfo.value);
          originalUserInfo.value = { ...userInfo.value }; // Update original after success
        } else {
          ElMessage.error(result.msg || '基本资料更新失败');
          return;
        }
      }

      // Update password if enabled
      if (enablePasswordReset.value) {
        let passwordResult = await resetPasswordService(passwordInfo.value);
        if (passwordResult.code === 0) {
          ElMessage.success(passwordResult.msg || '密码重置成功');
          tokenStore.removeToken();
          userInfoStore.removeInfo();
          window.location.href = '/'; // Redirect to login page
        } else {
          ElMessage.error(passwordResult.msg || '密码重置失败');
        }
      }
    } catch (error) {
      ElMessage.error('操作失败，请检查网络或服务！');
    }
  });
};
</script>

<template>
  <el-card class="page-container shadow">
    <template #header>
      <div class="header">
        <span class="header-title">📋基本资料</span>
      </div>
    </template>

    <el-divider></el-divider>

    <el-form ref="userFormRef" :model="{ ...userInfo, ...passwordInfo }" :rules="rules" label-width="120px" size="large">
      <el-form-item label="用户ID">
        <el-input v-model="userInfo.userId" disabled class="readonly-input"></el-input>
      </el-form-item>
      <el-form-item label="用户昵称">
          <el-input :value="originalUserInfo.userName" disabled class="readonly-input"></el-input>
      </el-form-item>
      <el-form-item label="属性">
          <el-input :value="formatAttributes(originalUserInfo.attributes)" disabled class="readonly-input"></el-input>
      </el-form-item>

      <!-- Basic Info Module -->
      <div class="info-section">
        <el-checkbox v-model="enableInfoEdit" label="修改信息" />
        <div v-if="enableInfoEdit" class="edit-fields">
          <h3>修改后</h3>
          <el-form-item label="用户昵称" prop="userName">
            <el-input v-model="userInfo.userName" placeholder="请输入您的昵称"></el-input>
          </el-form-item>
          <el-form-item label="职业" prop="profession">
            <el-select v-model="userInfo.profession" multiple placeholder="选择职业类别" class="select-input">
              <el-option v-for="item in professionOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="爱好" prop="hobby">
            <el-select v-model="userInfo.hobby" multiple placeholder="选择爱好" class="select-input">
              <el-option v-for="item in hobbyOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="技能" prop="skill">
            <el-select v-model="userInfo.skill" multiple placeholder="选择技能" class="select-input">
              <el-option v-for="item in skillOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
      </div>

      <!-- Password Reset Module -->
      <div class="password-section">
        <el-checkbox v-model="enablePasswordReset" label="重置密码" />
        <div v-if="enablePasswordReset" class="edit-fields">
          <h3>修改后</h3>
          <el-form-item label="旧密码" prop="old_pwd">
            <el-input v-model="passwordInfo.old_pwd" type="password" placeholder="请输入旧密码"></el-input>
          </el-form-item>
          <el-form-item label="新密码" prop="new_pwd">
            <el-input v-model="passwordInfo.new_pwd" type="password" placeholder="请输入新密码"></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="re_pwd">
            <el-input v-model="passwordInfo.re_pwd" type="password" placeholder="请确认新密码"></el-input>
          </el-form-item>
        </div>
      </div>

      <!-- Centered Submit Button -->
      <el-form-item class="submit-button">
        <el-button type="primary" @click="updateUserInfo">提交修改</el-button>
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

.select-input {
  width: 100%;
  padding: 8px;
  margin: 5px 0;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.before-edit {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f0f0;
  border-radius: 6px;
}

.info-section,
.password-section {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #fafafa;
}

.before-edit h3,
.edit-fields h3 {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #666;
}

.edit-fields {
  margin-top: 10px;
}

.submit-button {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 20px;
  margin-left: 20%;
}
</style>
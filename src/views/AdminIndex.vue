<script setup>
import { SwitchButton, Warning, Delete, Edit, Check, Close } from "@element-plus/icons-vue";
import { 
  setupService, 
  revokeService, 
  ulListService, 
  userAttributesUpdateService,
  findRegistersService
} from '@/api/user.js';
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { useTokenStore } from "@/stores/token.js";
import useUserInfoStore from "@/stores/userInfo.js";
import avatar from "@/assets/admin.png";
import { ref, computed, onMounted } from "vue";
import {
  professionOptions,
  hobbyOptions,
  skillOptions,
  attributeLabels
} from '@/constants/attributeOptions.js';

const router = useRouter();
const tokenStore = useTokenStore();
const UserInfoStore = useUserInfoStore();
const loading = ref(false);
const pendingLoading = ref(false);
const userList = ref([]);
const pendingUsers = ref([]);
const dialogVisible = ref(false);
const dialogType = ref(''); // 'edit' or 'approve'
const currentUser = ref(null);
const editedAttributes = ref({
  profession: [],
  hobby: [],
  skill: []
});

// 获取用户列表
const getUserList = async () => {
  loading.value = true;
  try {
    const response = await ulListService();
    if (response.code === 0) {
      userList.value = response.data;
    } else {
      ElMessage.error("获取用户列表失败：" + response.message);
    }
  } catch (error) {
    ElMessage.error("获取用户列表失败，请检查后端服务！");
  } finally {
    loading.value = false;
  }
};

// 获取待审批用户列表
const getPendingUsers = async () => {
  pendingLoading.value = true;
  try {
    const response = await findRegistersService();
    if (response.code === 0) {
      pendingUsers.value = response.data;
    } else {
      ElMessage.error("获取待审批用户列表失败：" + response.message);
    }
  } catch (error) {
    ElMessage.error("获取待审批用户列表失败，请检查后端服务！");
  } finally {
    pendingLoading.value = false;
  }
};

// 格式化属性显示
const userListFormatted = computed(() => {
  return userList.value.map(user => ({
    ...user,
    attributesLabel: user.attributes.replace(/[()]/g, "").split(",")
      .map(value => attributeLabels[value] || value)
      .join(", ")
  }));
});

// 打开对话框
const openDialog = (user, type) => {
  currentUser.value = user;
  dialogType.value = type;
  
  if (type === 'edit') {
    const attributes = user.attributes.replace(/[()]/g, "").split(",");
    editedAttributes.value = {
      profession: attributes.filter(attr => professionOptions.some(opt => opt.value === attr)),
      hobby: attributes.filter(attr => hobbyOptions.some(opt => opt.value === attr)),
      skill: attributes.filter(attr => skillOptions.some(opt => opt.value === attr))
    };
  } else {
    editedAttributes.value = { profession: [], hobby: [], skill: [] };
  }
  dialogVisible.value = true;
};

// 验证和获取属性
const validateAndGetAttributes = () => {
  const { profession, hobby, skill } = editedAttributes.value;
  if (!profession.length || !hobby.length || !skill.length) {
    ElMessage.error('请至少选择一个职业、一个爱好和一个技能！');
    return null;
  }
  return `(${[...profession, ...hobby, ...skill].join(",")})`;
};

// 更新或批准用户属性
const saveUserAttributes = async () => {
  try {
    const attributes = validateAndGetAttributes();
    if (!attributes) return;

    const userId = currentUser.value.userId;
    const result = await userAttributesUpdateService(userId, attributes);

    if (result.code === 0) {
      ElMessage.success(dialogType.value === 'edit' ? '属性更新成功' : '用户已批准并设置属性');
      dialogVisible.value = false;
      dialogType.value === 'edit' ? getUserList() : (getPendingUsers(), getUserList());
    } else {
      throw new Error(result.msg || '操作失败');
    }
  } catch (error) {
    ElMessage.error(error.message || '操作失败，请稍后重试');
  }
};

// 拒绝用户
const rejectUser = async (userId) => {
  try {
    await ElMessageBox.confirm('确定要拒绝该用户的注册请求吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    const result = await userAttributesUpdateService(userId, "reject");
    if (result.code === 0) {
      ElMessage.success('用户已拒绝');
      getPendingUsers();
    } else {
      throw new Error(result.msg || '拒绝失败');
    }
  } catch (error) {
    ElMessage.error(error.message || '拒绝用户失败');
  }
};

//撤销用户
const handleRevoke = async (userId) => {
  ElMessageBox.confirm("确定要撤销该用户权限吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        const response = await revokeService(userId);
        if (response.code === 0) {
          ElMessage.success("用户撤销成功！");
          userList.value = userList.value.filter(user => user.userId !== userId);
        } else {
          ElMessage.error("撤销失败：" + response.message);
        }
      } catch (error) {
        ElMessage.error("撤销请求失败，请检查后端服务！");
      }
    })
    .catch(() => {
      ElMessage.info("取消了撤销操作");
    });
};

// 系统初始化
const handleSetup = () => {
  ElMessageBox.confirm('此操作将重置系统，确定继续吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    setupService().then(response => {
      if (response.code === 0) {
        ElMessage.success('系统初始化成功');
        getUserList();
        getPendingUsers();
      } else {
        ElMessage.error(response.msg || '初始化失败');
      }
    });
  }).catch(() => {});
};

// 退出登录
const handleLogout = () => {
  tokenStore.removeToken();
  UserInfoStore.removeInfo();
  router.push('/');
};

// 处理下拉菜单命令
const handleCommand = (command) => {
  const actions = {
    setup: handleSetup,
    logout: handleLogout
  };
  actions[command]?.();
};

// 初始化
onMounted(() => {
  getUserList();
  getPendingUsers();
});
</script>

<template>
  <el-container class="userIndex-container">
    <el-header class="header">
      <h1 class="header-title">🔗HR-ABE 数据共享系统</h1>
      <el-dropdown placement="bottom-end" @command="handleCommand">
        <span class="el-dropdown__box">
          <el-avatar :src="avatar" />
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="setup" :icon="Warning" class="danger-item">系统初始化</el-dropdown-item>
            <el-dropdown-item command="logout" :icon="SwitchButton">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-header>

    <el-main class="content">
      <el-card class="user-card">
        <h2 class="user-list-title">📑 已注册用户列表</h2>
        <el-table
          v-loading="loading"
          :data="userListFormatted"
          class="user-table"
          max-height="400px"
          border
          style="width: 100%; table-layout: fixed;"
        >
          <el-table-column type="index" label="编号" align="center" width="80" :index="index => index + 1"></el-table-column>
          <el-table-column prop="userId" label="用户ID" align="center"></el-table-column>
          <el-table-column prop="attributesLabel" label="属性" align="center"></el-table-column>
          <el-table-column label="操作" align="center" width="200">
            <template #default="scope">
              <el-button type="primary" size="small" @click="openDialog(scope.row, 'edit')">
                <el-icon><Edit /></el-icon> 修改属性
              </el-button>
              <el-button type="danger" size="small" @click="handleRevoke(scope.row.userId)">
                <el-icon><Delete /></el-icon> 撤销
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card class="pending-card" style="margin-top: 20px;">
        <h2 class="pending-list-title">⏳ 注册请求列表</h2>
        <el-table
          v-loading="pendingLoading"
          :data="pendingUsers"
          class="pending-table"
          max-height="300px"
          border
          style="width: 100%;"
        >
          <el-table-column type="index" label="编号" align="center" width="80" :index="index => index + 1"></el-table-column>
          <el-table-column prop="userId" label="用户ID" align="center"></el-table-column>
          <el-table-column prop="userName" label="用户名" align="center"></el-table-column>
          <el-table-column label="操作" align="center" width="250">
            <template #default="scope">
              <el-button type="success" size="small" @click="openDialog(scope.row, 'approve')">
                <el-icon><Check /></el-icon> 批准
              </el-button>
              <el-button type="danger" size="small" @click="rejectUser(scope.row.userId)">
                <el-icon><Close /></el-icon> 拒绝
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-main>

    <!-- 统一属性编辑对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogType === 'edit' ? '修改用户属性' : '批准用户并设置属性'" 
      width="50%"
    >
      <el-form label-width="120px">
        <el-form-item label="职业" required>
          <el-select v-model="editedAttributes.profession" multiple placeholder="选择职业类别" style="width: 100%">
            <el-option v-for="item in professionOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="爱好" required>
          <el-select v-model="editedAttributes.hobby" multiple placeholder="选择爱好" style="width: 100%">
            <el-option v-for="item in hobbyOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="技能" required>
          <el-select v-model="editedAttributes.skill" multiple placeholder="选择技能" style="width: 100%">
            <el-option v-for="item in skillOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveUserAttributes">
            {{ '确认' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </el-container>
</template>

<style lang="scss" scoped>
/* 样式部分保持不变，与之前相同 */
.userIndex-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

/* 确保内容区域可以滚动 */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  overflow-y: auto;
  width: 100%;
}

/* 调整卡片高度和间距 */
.user-card, .pending-card {
  width: 90%;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.user-card {
  background-color: #f7f7f7;
}

.pending-card {
  background-color: #f7f7f7;
  margin-top: 20px;
}

.user-list-title, .pending-list-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
}

.user-list-title {
  color: #333;
}

.user-table, .pending-table {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  /* 新增滚动条样式 */
  :deep(.el-table__body-wrapper) {
    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
      &:hover {
        background: #a8a8a8;
      }
    }
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }
  }
}

.el-table th,
.el-table td {
  word-break: break-word;
}

.el-table__cell {
  padding: 8px;
}

.el-button {
  border-radius: 4px;
  padding: 8px 15px;
  margin: 0 5px;
  
  &--primary {
    background-color: #409eff;
    border-color: #409eff;
    
    &:hover {
      background-color: #66b1ff;
      border-color: #66b1ff;
    }
  }
  
  &--danger {
    background-color: #f56c6c;
    border-color: #f56c6c;
    
    &:hover {
      background-color: #e54d4d;
      border-color: #e54d4d;
    }
  }
  
  &--success {
    background-color: #67c23a;
    border-color: #67c23a;
    
    &:hover {
      background-color: #85ce61;
      border-color: #85ce61;
    }
  }
}

.el-button:focus {
  box-shadow: none;
}

.danger-item {
  background: #ff4d4f !important;
  color: white !important;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
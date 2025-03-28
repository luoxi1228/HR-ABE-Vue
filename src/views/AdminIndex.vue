<script setup>
import { SwitchButton, Warning, Delete } from "@element-plus/icons-vue";
import { setupService, revokeService, ulListService } from '@/api/user.js';
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { useTokenStore } from "@/stores/token.js";
import useUserInfoStore from "@/stores/userInfo.js";
import avatar from "@/assets/admin.png";
import { ref, computed } from "vue";

const router = useRouter();
const tokenStore = useTokenStore();
const UserInfoStore = useUserInfoStore();
const loading = ref(false);
const attributeLabels = { A: "前端(A)", B: "后端(B)", C: "测试(C)", D: "运维(D)", E: "产品(E)", F: "唱歌(F)", G: "跳舞(G)", H: "写作(H)", I: "跑步(I)", J: "C++(J)", K: "Python(K)", L: "Java(L)", M: "Go(M)" };
const userList = ref([]);

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

const userListFormatted = computed(() => {
  return userList.value.map(user => ({
    ...user,
    attributesLabel: user.attributes.replace(/[()]/g, "").split(",").map(value => attributeLabels[value] || value).join(", ")
  }));
});

const handleCommand = (command) => {
  switch (command) {
    case "logout":
      confirmLogout();
      break;
    case "setup":
      handleSetup();
      break;
    default:
      ElMessage.warning("未知命令");
  }
};

const confirmLogout = () => {
  ElMessageBox.confirm("您确认要退出吗?", "温馨提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      tokenStore.removeToken();
      UserInfoStore.removeInfo();
      router.push("/");
      ElMessage.success("退出登录成功");
    })
    .catch(() => {
      ElMessage.info("用户取消了退出登录");
    });
};

const handleSetup = async () => {
  ElMessageBox.confirm("确定要初始化系统吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "error",
  })
    .then(async () => {
      try {
        const response = await setupService();
        if (response.code === 0) {
          ElMessage.success("系统初始化成功！");
        } else {
          ElMessage.error("初始化失败：" + response.message);
        }
      } catch (error) {
        ElMessage.error("初始化请求失败，请检查后端服务！");
      }
    })
    .catch(() => {
      ElMessage.info("取消了系统初始化");
    });
};

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

getUserList();
</script>

<template>
  <el-container class="userIndex-container">
    <el-header class="header">
      <h1 class="header-title">HR-ABE</h1>
      <el-dropdown placement="bottom-end" @command="handleCommand">
        <span class="el-dropdown__box">
          <el-avatar :src="avatar" />
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="setup" :icon="Warning" class="danger-item">
              系统初始化
            </el-dropdown-item>
            <el-dropdown-item command="logout" :icon="SwitchButton">
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-header>

    <el-main class="content">
      <el-card class="user-card">
        <h2 class="user-list-title">📑用户列表</h2>
        <el-table
          v-loading="loading"
          :data="userListFormatted"
          class="user-table"
          max-height="400"
          border
          style="width: 100%; table-layout: fixed;"
        >
          <el-table-column prop="userId" label="用户ID" align="center"></el-table-column>
          <el-table-column prop="attributesLabel" label="属性" align="center"></el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button type="danger" size="small" @click="handleRevoke(scope.row.userId)">
                <el-icon><Delete /></el-icon> 撤销
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-main>
  </el-container>
</template>

<style lang="scss" scoped>
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

.content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start; /* 对齐顶部 */
  width: 100%;
  overflow: hidden; /* 防止内容溢出 */
}

.user-card {
  width: 90%; /* 卡片宽度为90% */
  padding: 20px;
  background-color: #f7f7f7;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.user-list-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
  color: #333;
}

.user-table {
  width: 100%; /* 表格宽度为100% */
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 确保表格列均分宽度 */
.el-table th,
.el-table td {
  width: 33.33%; /* 均分三列 */
  word-break: break-word; /* 内容过长时换行 */
}

/* 自定义单元格样式 */
.el-table__cell {
  padding: 8px;
}

/* 按钮样式 */
.el-button {
  border-radius: 4px;
  padding: 8px 15px;
  background-color: #f56c6c;
  color: white;
  border-color: #f56c6c;
}

.el-button:hover {
  background-color: #e54d4d;
  border-color: #e54d4d;
}

.el-button:focus {
  box-shadow: none;
}

.danger-item {
  background: #ff4d4f !important;
  color: white !important;
}
</style>
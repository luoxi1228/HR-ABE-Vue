<script setup>
import {
  Management,
  Promotion,
  UserFilled,
  SwitchButton,
  CaretBottom,
  Delete
} from "@element-plus/icons-vue";
import avatar from "@/assets/user.png";
import { userInfoService, userLogoutService } from "@/api/user.js"; // 导入新增的API
import { ElMessage, ElMessageBox } from "element-plus";
import useUserInfoStore from "@/stores/userInfo.js";
import { useTokenStore } from "@/stores/token.js";
import { useRouter } from "vue-router";

const tokenStore = useTokenStore();
const UserInfoStore = useUserInfoStore();
const router = useRouter();

// 获取用户信息
const getUserInfo = async () => {
  try {
    let result = await userInfoService();
    UserInfoStore.setInfo(result.data);
  } catch (error) {
    ElMessage.error("获取用户信息失败，请检查后端服务！");
  }
};
getUserInfo();

// 用户注销函数
const handleUserDeactivate = async () => {
  try {
    await ElMessageBox.confirm("此操作将永久注销您的账户，所有数据将被删除，是否继续？", "警告", {
      confirmButtonText: "确认注销",
      cancelButtonText: "取消",
      type: "error",
      distinguishCancelAndClose: true,
      confirmButtonClass: "el-button--danger"
    });
    
    // 执行注销
    const result = await userLogoutService();
    if (result.code === 0) {
      ElMessage.success("账户注销成功");
      tokenStore.removeToken();
      UserInfoStore.removeInfo();
      router.push("/");
    } else {
      ElMessage.error(result.msg || "注销失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("注销过程中出错");
    }
  }
};

// 处理下拉菜单命令
const handleCommand = (command) => {
  if (command === "logout") {
    ElMessageBox.confirm("您确认要退出吗?", "温馨提示", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(async () => {
        tokenStore.removeToken();
        UserInfoStore.removeInfo();
        router.push("/");
        ElMessage({
          type: "success",
          message: "退出登录成功",
        });
      })
      .catch(() => {
        ElMessage({
          type: "info",
          message: "用户取消了退出登录",
        });
      });
  } else {
    router.push(command);
  }
};
</script>

<template>
  <el-container class="userIndex-container">
    <el-header class="el-header">
      <div class="header-title">🔗HR-ABE 数据共享系统</div>

      <el-menu
        mode="horizontal"
        active-text-color="#409EFF"
        background-color="transparent"
        text-color="#333"
        router
        class="nav-menu"
      >
        <el-menu-item index="/file/fileUp">
          <el-icon><Management /></el-icon>
          <span>数据上传</span>
        </el-menu-item>
        <el-menu-item index="/file/fileDown">
          <el-icon><Promotion /></el-icon>
          <span>数据获取</span>
        </el-menu-item>
        <el-menu-item index="/user/info">
          <el-icon><UserFilled /></el-icon>
          <span>个人信息</span>
        </el-menu-item>
      </el-menu>

      <div class="user-section">
        <div class="user-info">
          <div class="user-id">
            ID: <strong>{{ UserInfoStore.info.userId }}</strong>
          </div>
          <div class="user-name">
            用户名: <strong>{{ UserInfoStore.info.userName }}</strong>
          </div>
        </div>

        <el-dropdown placement="bottom-end" @command="handleCommand">
          <span class="el-dropdown__box">
            <el-avatar :src=" avatar"/>
            <el-icon><CaretBottom /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleUserDeactivate" :icon="Delete" style="color: #F56C6C;">
                 注销账户
              </el-dropdown-item>
              <el-dropdown-item command="logout" :icon="SwitchButton">
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-main>
      <router-view></router-view>
    </el-main>

    <el-footer>HR-ABE</el-footer>
  </el-container>
</template>

<style lang="scss" scoped>
.userIndex-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f4f7f9; /* Matches the blue-gray background */
}

.el-header {
  background-color: #fff; /* Keep header white for contrast */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .header-title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    white-space: nowrap;
  }

  .nav-menu {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    border-bottom: none;

    .el-menu-item {
      transition: color 0.3s ease;
      &:hover {
        background-color: #f5f5f5;
        color: #409EFF;
      }
    }
  }

  .user-section {
    display: flex;
    align-items: center;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    margin-right: 20px;
  }

  .user-id {
    font-size: 18px;
    font-weight: bold;
  }

  .user-name {
    font-size: 14px;
    color: #666;
  }

  .el-dropdown__box {
    display: flex;
    align-items: center;

    .el-icon {
      color: #666;
      margin-left: 10px;
      transition: color 0.3s ease;
    }

    .el-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
    }

    &:hover .el-icon {
      color: #409EFF;
    }
  }
}

.el-main {
  flex: 1;
  padding: 20px;
  background-color: #f4f7f9; /* Ensure main area matches */
}

.el-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  background-color: #f4f7f9; /* Match the blue-gray background */
}

.el-dropdown-menu {
  .el-dropdown-menu__item:first-child {
    &:hover {
      background-color: #fff6f6;
      color: #F56C6C;
    }
  }
}
</style>
<script setup>
import {
  Management,
  Promotion,
  UserFilled,
  User,
  Crop,
  EditPen,
  SwitchButton,
  CaretBottom,
} from "@element-plus/icons-vue";
import avatar from "@/assets/default.png";
import { userInfoService } from "@/api/user.js";
import { ElMessage, ElMessageBox } from "element-plus";
import useUserInfoStore from "@/stores/userInfo.js";
import { useTokenStore } from "@/stores/token.js";
const tokenStore = useTokenStore();

const UserInfoStore = useUserInfoStore();
const getUserInfo = async () => {
  let result = await userInfoService();
  UserInfoStore.setInfo(result.data);
};

getUserInfo();

import { useRouter } from "vue-router";
const router = useRouter();
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
    router.push(`/user/${command}`);
  }
};
</script>

<template>
  <el-container class="userIndex-container">
    <el-aside width="240px" class="el-aside">
      <div class="el-aside__logo"></div>
      <el-menu
        active-text-color="#ffd04b"
        background-color="#1e1e1e"
        text-color="#fff"
        router
      >
        <el-menu-item index="/file/fileUp">
          <el-icon><Management /></el-icon>
          <span>数据上传</span>
        </el-menu-item>
        <el-menu-item index="/file/fileDown">
          <el-icon><Promotion /></el-icon>
          <span>数据获取</span>
        </el-menu-item>
        <el-sub-menu>
          <template #title>
            <el-icon><UserFilled /></el-icon>
            <span>个人中心</span>
          </template>
          <el-menu-item index="/user/info">
            <el-icon><User /></el-icon>
            <span>基本资料</span>
          </el-menu-item>
          <el-menu-item index="/user/avatar">
            <el-icon><Crop /></el-icon>
            <span>更换头像</span>
          </el-menu-item>
          <el-menu-item index="/user/resetPwd">
            <el-icon><EditPen /></el-icon>
            <span>重置密码</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header>
        <div class="user-info">
          <div class="user-id">
            用户ID: <strong>{{ UserInfoStore.info.userId }}</strong>
          </div>
          <div class="user-name">
            用户名称: <strong>{{ UserInfoStore.info.userName }}</strong>
          </div>
        </div>
        <el-dropdown placement="bottom-end" @command="handleCommand">
          <span class="el-dropdown__box">
            <el-avatar
              :src="
                UserInfoStore.info.userPic ? UserInfoStore.info.userPic : avatar
              "
            />
            <el-icon><CaretBottom /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="info" :icon="User"
                >基本资料</el-dropdown-item
              >
              <el-dropdown-item command="avatar" :icon="Crop"
                >更换头像</el-dropdown-item
              >
              <el-dropdown-item command="resetPwd" :icon="EditPen"
                >重置密码</el-dropdown-item
              >
              <el-dropdown-item command="logout" :icon="SwitchButton"
                >退出登录</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>

      <el-main>
        <router-view></router-view>
      </el-main>

      <el-footer>HR-ABE</el-footer>
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.userIndex-container {
  height: 100vh;

  .el-aside {
    background-color: #1e1e1e;
    color: #fff;

    &__logo {
      height: 120px;
      background: url("@/assets/logo1.png") no-repeat center / 220px auto;
    }

    .el-menu {
      border-right: none;
      .el-menu-item {
        transition: background-color 0.3s ease, color 0.3s ease;
        &:hover {
          background-color: #333;
          color: #ffd04b;
        }
      }
    }
  }

  .el-header {
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

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
        color: #ffd04b;
      }
    }
  }

  .el-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #666;
    background-color: #f7f7f7;
  }
}
.user-info {
  display: flex;
  flex-direction: column;
}

.user-id {
  font-size: 18px;
  font-weight: bold;
}

.user-name {
  font-size: 14px;
  color: #666;
}
</style>

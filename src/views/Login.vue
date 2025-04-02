<script setup>
import { ref } from 'vue'
import { User, Lock, View, Hide } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useTokenStore } from '@/stores/token.js'
import { 
  userRegisterService,
  userLoginService,
  adminLoginService,
    userRegisterStatusService 
} from '@/api/user.js'

const isRegister = ref(false)
const isAdminLogin = ref(false)
const showPassword = ref(false)
const showRePassword = ref(false)
const router = useRouter()
const tokenStore = useTokenStore()

const togglePasswordVisibility = (field) => {
    if (field === 'password') {
        showPassword.value = !showPassword.value
    } else if (field === 'rePassword') {
        showRePassword.value = !showRePassword.value
    }
}

// 用户注册数据
const registerData = ref({
    userId: '',
    userName: '',
    password: '',
    rePassword: ''
})

// 管理员登录数据
const adminLoginData = ref({
    adminId: '',
    password: ''
})

// 密码校验规则
const checkRePassword = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('确认密码不能为空'))
    } else if (value !== registerData.value.password) {
        callback(new Error('两次输入的密码不一致'))
    } else {
        callback()
    }
}

const rules = {
    userId: [
        { required: true, message: '请输入用户ID', trigger: 'blur' },
        { pattern: /^H\d{6}$/, message: '用户ID必须以H开头并跟随6位数字', trigger: 'blur' }
    ],
    userName: [
        { required: true, message: '请输入昵称', trigger: 'blur' },
        { min: 2, max: 16, message: '昵称长度为2~16位', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 16, message: '密码长度为6~16位', trigger: 'blur' }
    ],
    rePassword: [
        { validator: checkRePassword, trigger: 'blur' }
    ],
    adminId: [
        { required: true, message: '请输入管理员账号', trigger: 'blur' }
    ]
}

// 跳转到管理员登录页面
const goToAdminLogin = () => {
    isAdminLogin.value = true
    isRegister.value = false
    clearRegisterData()
}

// 跳转到用户登录页面
const goToUserLogin = () => {
    isAdminLogin.value = false
    isRegister.value = false
    clearRegisterData()
}

// 调用注册接口
const register = async () => {
    let result = await userRegisterService({
        userId: registerData.value.userId,
        userName: registerData.value.userName,
        password: registerData.value.password
    });
    
    if (result.code === 0) {
        // 创建一个持续显示的loading消息
        const loadingMessage = ElMessage({
            message: '注册申请已提交，等待管理员审批...',
            type: 'info',
            duration: 0, // 设置为0表示不会自动关闭
            showClose: true // 显示关闭按钮
        });
        
        // 轮询检查状态
        const checkStatus = async () => {
            try {
                const statusResult = await userRegisterStatusService(registerData.value.userId);
                
                if (statusResult.code === 0) {
                    loadingMessage.close(); // 关闭loading消息
                    ElMessage.success('注册成功，已通过管理员审批');
                    goToUserLogin();
                } else if (statusResult.code === 1) {
                    // 等待3秒后再次检查
                    setTimeout(checkStatus, 3000);
                } else {
                    loadingMessage.close(); // 关闭loading消息
                    ElMessage.error(statusResult.message || '注册审批出现问题');
                }
            } catch (error) {
                loadingMessage.close(); // 关闭loading消息
                ElMessage.error('检查注册状态时出错');
            }
        };
        
        // 开始轮询
        checkStatus();
    } else {
        ElMessage.error(result.message || '注册失败');
    }
}

// 用户登录函数
const login = async () => {
    let result = await userLoginService(registerData.value)
    if (result.code === 0) {
        ElMessage.success(result.message ? result.message : '登录成功')
        tokenStore.setToken(result.data)
        router.push('/userIndex')
    } else {
        ElMessage.error(result.message ? result.message : '登录失败')
    }
}

// 管理员登录函数
const adminLogin = async () => {
    let result = await adminLoginService(adminLoginData.value)
    if (result.code === 0) {
        ElMessage.success(result.message ? result.message : '登录成功')
        tokenStore.setToken(result.data)
        router.push('/adminIndex')
    } else {
        ElMessage.error(result.message ? result.message : '登录失败')
    }
}

// 清空注册数据
const clearRegisterData = () => {
    registerData.value = {
        userId: '',
        userName: '',
        password: '',
        rePassword: ''
    }
    adminLoginData.value = {
        adminId: '',
        password: ''
    }
}
</script>

<template>
    <el-row class="login-page">
        <el-col :span="12" class="bg"></el-col>
        <el-col :span="6" :offset="3" class="form">
            <!-- 注册表单 -->
            <el-form ref="form" size="large" autocomplete="off" v-if="isRegister" :model="registerData" :rules="rules">
                <el-form-item>
                    <h1>注册</h1>
                </el-form-item>
                <el-form-item prop="userId">
                    <el-input :prefix-icon="User" placeholder="请输入用户ID (如: H123456)" v-model="registerData.userId"></el-input>
                </el-form-item>
                <el-form-item prop="userName">
                    <el-input :prefix-icon="User" placeholder="请输入昵称" v-model="registerData.userName"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input 
                        :prefix-icon="Lock" 
                        :type="showPassword ? 'text' : 'password'" 
                        placeholder="请输入密码" 
                        v-model="registerData.password"
                    >
                        <template #suffix>
                            <el-icon @click="togglePasswordVisibility('password')" style="cursor: pointer;">
                                <component :is="showPassword ? Hide : View"></component>
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="rePassword">
                    <el-input 
                        :prefix-icon="Lock" 
                        :type="showRePassword ? 'text' : 'password'" 
                        placeholder="请再次输入密码" 
                        v-model="registerData.rePassword"
                    >
                        <template #suffix>
                            <el-icon @click="togglePasswordVisibility('rePassword')" style="cursor: pointer;">
                                <component :is="showRePassword ? Hide : View"></component>
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button class="button" type="primary" auto-insert-space @click="register">
                        注册
                    </el-button>
                </el-form-item>
                <el-form-item class="flex">
                    <el-link type="info" :underline="false" @click="goToUserLogin">
                        ← 返回
                    </el-link>
                </el-form-item>
            </el-form>
            
            <!-- 用户登录表单 -->
            <el-form ref="form" size="large" autocomplete="off" v-if="!isRegister && !isAdminLogin" :model="registerData" :rules="rules">
                <el-form-item>
                    <h1>用户登录</h1>
                </el-form-item>
                <el-form-item prop="userId">
                    <el-input :prefix-icon="User" placeholder="请输入用户ID" v-model="registerData.userId"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input 
                        :prefix-icon="Lock" 
                        :type="showPassword ? 'text' : 'password'" 
                        placeholder="请输入密码" 
                        v-model="registerData.password"
                    >
                        <template #suffix>
                            <el-icon @click="togglePasswordVisibility('password')" style="cursor: pointer;">
                                <component :is="showPassword ? Hide : View"></component>
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item class="flex">
                    <div class="flex">
                        <el-checkbox>记住我</el-checkbox>
                        <el-link type="primary" :underline="false">忘记密码？</el-link>
                    </div>
                </el-form-item>
                <el-form-item>
                    <el-button class="button" type="primary" auto-insert-space @click="login">登录</el-button>
                </el-form-item>
                <el-form-item class="link-group">
                    <el-link type="info" :underline="false" @click="isRegister = true;clearRegisterData()">
                        注册 →
                    </el-link>
                    <el-link type="info" :underline="false" @click="goToAdminLogin">
                        管理员登录 →
                    </el-link>
                </el-form-item>
            </el-form>

            <!-- 管理员登录表单 -->
            <el-form ref="form" size="large" autocomplete="off" v-if="isAdminLogin" :model="adminLoginData" :rules="rules">
                <el-form-item>
                    <h1>管理员登录</h1>
                </el-form-item>
                <el-form-item prop="adminId">
                    <el-input :prefix-icon="User" placeholder="请输入管理员账户" v-model="adminLoginData.adminId"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input name="password" :prefix-icon="Lock" type="password" placeholder="请输入密码" v-model="adminLoginData.password"></el-input>
                </el-form-item>
                <el-form-item class="flex">
                    <div class="flex">
                        <el-checkbox>记住我</el-checkbox>
                        <el-link type="primary" :underline="false">忘记密码？</el-link>
                    </div>
                </el-form-item>
                <el-form-item>
                    <el-button class="button" type="primary" auto-insert-space @click="adminLogin">登录</el-button>
                </el-form-item>
                <el-form-item class="flex">
                    <el-link type="info" :underline="false" @click="goToUserLogin">
                        ← 返回
                    </el-link>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<style lang="scss" scoped>
.login-page {
    height: 100vh;
    background-color: #fff;

    .bg {
        background: url('@/assets/logo1.png') no-repeat 60% center / 500px auto,
            url('@/assets/login_bg.jpg') no-repeat center / cover;
        border-radius: 0 20px 20px 0;
    }

    .form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        user-select: none;

        .button {
            width: 100%;
        }

        .flex {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .link-group {
            display: flex;
            justify-content: space-between;
            width: 100%;
            margin-top: 10px;
        }

        .link-group :first-child {
            margin-right: auto;
        }

        .link-group :last-child {
            margin-left: auto;
        }
    }
}
</style>
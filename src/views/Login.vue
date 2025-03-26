<script setup>
import { ref } from 'vue'
import { User, Lock, View, Hide } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const isRegister = ref(false)
const isAdminLogin = ref(false)

const showPassword = ref(false) // 是否显示密码
const showRePassword = ref(false) // 是否显示确认密码

const togglePasswordVisibility = (field) => {
    if (field === 'password') {
        showPassword.value = !showPassword.value
    } else if (field === 'rePassword') {
        showRePassword.value = !showRePassword.value
    }
}

// 分类属性数据
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

// 用户注册数据
const registerData = ref({
    userId: '',
    userName: '',
    password: '',
    rePassword: '',
    profession: [],
    hobby: [],
    skill: []
})
//管理员登录数据
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
    profession: [
        { required: true, message: '请选择至少一个职业', trigger: 'change' }
    ],
    hobby: [
        { required: true, message: '请选择至少一个爱好', trigger: 'change' }
    ],
    skill: [
        { required: true, message: '请选择至少一个技能', trigger: 'change' }
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
import { userRegisterService } from '@/api/user.js'
const register = async () => {
    const selectedAttributes = [
        ...registerData.value.profession,
        ...registerData.value.hobby,
        ...registerData.value.skill
    ]

    if (selectedAttributes.length === 0) {
        ElMessage.error('请至少选择一个职业、一个爱好和一个技能！')
        return
    }

    let payload = {
        ...registerData.value,
        attributes: `(${selectedAttributes.join(",")})`
    }

    let result = await userRegisterService(payload)
    if (result.code === 0) {
        ElMessage.success(result.msg ? result.msg : '注册成功')
        goToUserLogin()
    } else {
        ElMessage.error(result.msg ? result.msg : '注册失败')
    }
}

//用户登录函数
import{useTokenStore} from '@/stores/token.js'
import { userLoginService } from '@/api/user.js'
import { useRouter } from 'vue-router'
const router = useRouter()
const tokenStore = useTokenStore()
const login = async () => {
    let result = await userLoginService(registerData.value)
    if (result.code === 0) {
        // 登录成功
        ElMessage.success(result.msg ? result.msg : '登录成功')
        // 保存token
        tokenStore.setToken(result.data)
        // 跳转到首页
        router.push('/userIndex')
    } else {
        // 登录失败
        ElMessage.error(result.msg ? result.msg : '登录失败')
    }
}

//管理员登录函数
import {adminLoginService} from '@/api/user.js'
const adminLogin = async () => {
    let result = await adminLoginService(adminLoginData.value)
    if (result.code === 0) {
        // 登录成功
        ElMessage.success(result.msg ? result.msg : '登录成功')
        // 保存token
        tokenStore.setToken(result.data)
        // 跳转到首页
        router.push('/adminIndex')
    } else {
        // 登录失败
        ElMessage.error(result.msg ? result.msg : '登录失败')
    }
}

// 清空注册数据
const clearRegisterData = () => {
    registerData.value = {
        userId: '',
        userName: '',
        password: '',
        rePassword: '',
        profession: [],
        hobby: [],
        skill: []
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

                <!-- 选择职业 -->
                <el-form-item prop="profession">
                    <span>选择职业：</span>
                    <el-checkbox-group v-model="registerData.profession">
                        <el-checkbox v-for="item in professionOptions" :key="item.value" :label="item.value">
                            {{ item.label }}
                        </el-checkbox>
                    </el-checkbox-group>
                </el-form-item>

                <!-- 选择爱好 -->
                <el-form-item prop="hobby">
                    <span>选择爱好：</span>
                    <el-checkbox-group v-model="registerData.hobby">
                        <el-checkbox v-for="item in hobbyOptions" :key="item.value" :label="item.value">
                            {{ item.label }}
                        </el-checkbox>
                    </el-checkbox-group>
                </el-form-item>

                <!-- 选择技能 -->
                <el-form-item prop="skill">
                    <span>选择技能：</span>
                    <el-checkbox-group v-model="registerData.skill">
                        <el-checkbox v-for="item in skillOptions" :key="item.value" :label="item.value">
                            {{ item.label }}
                        </el-checkbox>
                    </el-checkbox-group>
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
                    <!-- <el-input name="password" :prefix-icon="Lock" type="password" placeholder="请输入密码" v-model="registerData.password"></el-input> -->
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
                <el-form-item prop="adminPassword">
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

        /* 让 "注册" 靠左，"管理员登录" 靠右 */
        .link-group :first-child {
            margin-right: auto;
        }

        .link-group :last-child {
            margin-left: auto;
        }
    }
}
</style>

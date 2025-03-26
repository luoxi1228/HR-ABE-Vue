<script setup>
import { ref } from 'vue';
import useUserInfoStore from '@/stores/userInfo.js';
import { userInfoUpdateService } from '@/api/user.js';
import { ElMessage } from 'element-plus';

const userInfoStore = useUserInfoStore();
const userFormRef = ref(null);
const userInfo = ref({ ...userInfoStore.info });

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

const rules = {
    userName: [
        { required: true, message: '请输入昵称', trigger: 'blur' },
        { min: 2, max: 16, message: '昵称长度为2~16位', trigger: 'blur' }
    ],
    profession: [{ required: true, message: '请选择至少一个职业', trigger: 'change' }],
    hobby: [{ required: true, message: '请选择至少一个爱好', trigger: 'change' }],
    skill: [{ required: true, message: '请选择至少一个技能', trigger: 'change' }]
};

const updateUserInfo = async () => {
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
        ElMessage.success(result.msg || '更新成功');
        userInfoStore.setInfo(userInfo.value);
    } else {
        ElMessage.error(result.msg || '更新失败');
    }
};
</script>

<template>
    <el-card class="page-container shadow">
        <template #header>
            <div class="header">
                <span class="header-title">基本资料</span>
            </div>
        </template>

        <el-divider></el-divider>

        <el-form ref="userFormRef" :model="userInfo" :rules="rules" label-width="120px" size="large">
            <el-form-item label="用户ID">
                <el-input v-model="userInfo.userId" disabled class="readonly-input"></el-input>
            </el-form-item>

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

            <el-form-item style="display: flex; justify-content: center; width: 100%;">
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
</style>

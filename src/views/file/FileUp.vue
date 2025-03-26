<script setup>
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { uploadFileService, deleteFileService, getFileService } from '@/api/file.js';

// 文件列表
const fileList = ref([]);
const searchQuery = ref('');

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

// 搜索框过滤文件列表
const filteredFileList = computed(() => {
  return fileList.value.filter(file =>
    file.userId.includes(searchQuery.value) ||
    file.fileName.includes(searchQuery.value) ||
    file.fileType.includes(searchQuery.value)
  );
});

// 获取文件列表
const getFileList = async () => {
  try {
    const result = await getFileService();
    fileList.value = result.data;
  } catch (error) {
    ElMessage.error('获取文件列表失败');
  }
};
getFileList();

// 删除文件
const deleteFile = async (fileName) => {
  const result = await deleteFileService(fileName);
  if (result.code === 0) {
    ElMessage.success(result.msg || '删除成功');
    await getFileList();
  } else {
    ElMessage.error(result.msg || '删除失败');
  }
};

const handleDelete = async (index) => {
  const file = filteredFileList.value[index];
  if (!file) return;
  try {
    await deleteFile(file.fileName);
  } catch (error) {
    ElMessage.error('删除失败');
  }
};

// 弹窗控制
const dialogVisible = ref(false);

// 上传相关
const selectedFile = ref(null);
const password = ref('');
const policy = ref('');
const passwordVisible = ref(false);

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
};

const handleFileChange = (file) => {
  selectedFile.value = file.raw;
};

// 生成访问策略
const selectedProfession = ref([]);
const selectedHobby = ref([]);
const selectedSkills = ref([]);
const professionThreshold = ref(0);
const hobbyThreshold = ref(0);
const skillsThreshold = ref(0);
const finalThreshold = ref(0);

const generatePolicy = () => {
  const parts = [];
  
  // 处理职业类别
  if (selectedProfession.value.length > 0) {
    if (selectedProfession.value.length === 1 && professionThreshold.value === 1) {
      parts.push(selectedProfession.value[0]);
    } else {
      parts.push(`(${selectedProfession.value.join(',')},${professionThreshold.value})`);
    }
  }

  // 处理爱好类别
  if (selectedHobby.value.length > 0) {
    if (selectedHobby.value.length === 1 && hobbyThreshold.value === 1) {
      parts.push(selectedHobby.value[0]);
    } else {
      parts.push(`(${selectedHobby.value.join(',')},${hobbyThreshold.value})`);
    }
  }

  // 处理技能类别
  if (selectedSkills.value.length > 0) {
    if (selectedSkills.value.length === 1 && skillsThreshold.value === 1) {
      parts.push(selectedSkills.value[0]);
    } else {
      parts.push(`(${selectedSkills.value.join(',')},${skillsThreshold.value})`);
    }
  }

  // 合成最终策略
  policy.value = parts.length > 0 ? `(${parts.join(',')},${finalThreshold.value})` : '';
};

// 阈值范围限制
watch([selectedProfession, selectedHobby, selectedSkills], () => {
  professionThreshold.value = Math.min(Math.max(professionThreshold.value, 0), selectedProfession.value.length);
  hobbyThreshold.value = Math.min(Math.max(hobbyThreshold.value, 0), selectedHobby.value.length);
  skillsThreshold.value = Math.min(Math.max(skillsThreshold.value, 0), selectedSkills.value.length);
  finalThreshold.value = Math.min(Math.max(finalThreshold.value, 0), 3);
}, { immediate: true });

// 重置上传弹窗
const resetUploadDialog = () => {
  selectedFile.value = null;
  password.value = '';
  policy.value = '';
  selectedProfession.value = [];
  selectedHobby.value = [];
  selectedSkills.value = [];
  professionThreshold.value = 0;
  hobbyThreshold.value = 0;
  skillsThreshold.value = 0;
  finalThreshold.value = 0;
};

// 上传文件
const handleUpload = async () => {
  if (!selectedFile.value) return ElMessage.warning('请选择要上传的文件');
  if (!password.value) return ElMessage.warning('请输入加密密码');
  if (!policy.value) return ElMessage.warning('请输入访问策略');

  try {
    const result = await uploadFileService(selectedFile.value, password.value, policy.value);
    if (result.code === 0) {
      ElMessage.success('文件上传成功');
      dialogVisible.value = false;
      await getFileList();
      resetUploadDialog();
    } else {
      ElMessage.error(result.msg || '上传失败');
    }
  } catch (error) {
    console.error('上传错误:', error);
    ElMessage.error('上传失败');
  }
};
</script>

<template>
  <div class="file-upload-page">
    <h1 class="page-title">💻我的分享文件</h1>

    <el-input v-model="searchQuery" placeholder="🔍 搜索文件名、文件类型" class="search-input" clearable>
      <template #prefix>
        <el-icon><search /></el-icon>
      </template>
    </el-input>

    <div class="table-container">
      <el-table :data="filteredFileList" class="custom-table">
        <el-table-column label="#" width="50">
          <template #default="scope">
            <span class="row-index">{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fileName" label="文件名" />
        <el-table-column prop="fileType" label="类型" />
        <el-table-column prop="fileSize" label="大小" />
        <el-table-column prop="time" label="上传时间" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button @click="handleDelete(scope.$index)" type="danger" size="small">
              🗑 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="upload-button-container">
      <el-button type="primary" @click="dialogVisible = true" class="wide-upload-button">
        ⬆️ 上传文件
      </el-button>
    </div>

    <el-dialog v-model="dialogVisible" title="📤 上传文件" width="500px">
      <el-upload class="upload-demo" :auto-upload="false" :show-file-list="true" :on-change="handleFileChange">
        <el-button type="success">📁 选择文件</el-button>
      </el-upload>

      <el-input v-model="password" :type="passwordVisible ? 'text' : 'password'" placeholder="🔑 输入加密密码" class="input-box">
        <template #suffix>
          <el-icon @click="togglePasswordVisibility" class="eye-icon">
            <span v-if="passwordVisible">👁</span>
            <span v-else>👁‍🗨</span>
          </el-icon>
        </template>
      </el-input>

      <div class="select-group">
        <el-select v-model="selectedProfession" multiple placeholder="选择职业类别">
          <el-option v-for="option in professionOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
        <el-input v-model="professionThreshold" placeholder="职业类别阈值" type="number" class="threshold-input" :min="0" :max="selectedProfession.length" />

        <el-select v-model="selectedHobby" multiple placeholder="选择爱好">
          <el-option v-for="option in hobbyOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
        <el-input v-model="hobbyThreshold" placeholder="爱好类别阈值" type="number" class="threshold-input" :min="0" :max="selectedHobby.length" />

        <el-select v-model="selectedSkills" multiple placeholder="选择技能">
          <el-option v-for="option in skillOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
        <el-input v-model="skillsThreshold" placeholder="技能类别阈值" type="number" class="threshold-input" :min="0" :max="selectedSkills.length" />

        <el-input v-model="finalThreshold" placeholder="最终访问阈值" type="number" class="threshold-input" :min="0" :max="3" />
      </div>

      <el-button @click="generatePolicy" type="primary">生成访问策略</el-button>
      <el-input v-model="policy" placeholder="生成的访问策略" readonly class="input-box" />

      <template #footer>
        <el-button @click="dialogVisible = false">❌ 取消</el-button>
        <el-button type="primary" @click="handleUpload">✅ 确认上传</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.file-upload-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
  background-color: #f4f7f9;
  min-height: 100vh;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.search-input {
  width: 400px;
  margin-bottom: 15px;
  border-radius: 10px;
  padding: 8px;
  border: 1px solid #ddd;
}

.table-container {
  width: 100%;
  max-width: 800px;
  background: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.custom-table {
  border-radius: 8px;
  overflow: hidden;
}

.row-index {
  font-weight: bold;
  color: #3498db;
}

.upload-button-container {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.wide-upload-button {
  width: 200px;
  height: 45px;
  font-size: 16px;
  border-radius: 8px;
}

.input-box {
  width: 100%;
  margin: 10px 0;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.threshold-input {
  width: 100px;
  margin: 10px 0;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.select-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}
</style>
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { downloadFileService, getAllService } from '@/api/file.js';

const fileList = ref([]);
const searchQuery = ref('');

// 搜索框过滤文件列表
const filteredFileList = computed(() => {
  return fileList.value.filter(file => {
    return file.userId.includes(searchQuery.value) || 
           file.fileName.includes(searchQuery.value) || 
           file.fileType.includes(searchQuery.value);
  });
});

// 获取文件列表
const getAllList = async () => {
  let result = await getAllService();
  fileList.value = result.data;
};

// WebSocket 相关
const webSocket = ref(null);
const showProgress = ref(false);
const messages = ref([]); // 存储消息列表
const isLoading = ref(false);

// 连接 WebSocket 服务
const connectWebSocket = () => {
  webSocket.value = new WebSocket('ws://localhost:8080/ws');

  webSocket.value.onmessage = (event) => {
    const data = JSON.parse(event.data);
    messages.value.push({
      step: data.step,
      success: data.success,
      message: data.message,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  webSocket.value.onopen = () => console.log("WebSocket 连接成功");
  webSocket.value.onclose = () => console.log("WebSocket 连接关闭");
  webSocket.value.onerror = (error) => console.error("WebSocket 错误:", error);
};

// 文件下载处理
const handleGetFile = async (fileName) => {
  showProgress.value = true;
  messages.value = [];
  isLoading.value = true;

  try {
    await downloadFileService(fileName);
  } catch (error) {
    messages.value.push({
      step: 'error',
      success: false,
      message: `下载失败: ${error.message}`,
      timestamp: new Date().toLocaleTimeString()
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  getAllList();
  connectWebSocket();
});

onUnmounted(() => {
  if (webSocket.value) webSocket.value.close();
});
</script>

<template>
  <div class="file-upload-page">
    <h1 class="page-title">📂文件分享库</h1>

    <!-- 搜索框 -->
    <el-input v-model="searchQuery" placeholder="🔍 搜索文件名、文件类型" class="search-input" clearable>
      <template #prefix>
        <el-icon><search /></el-icon>
      </template>
    </el-input>

    <!-- 文件列表 -->
    <el-table :data="filteredFileList" class="custom-table" border stripe>
      <el-table-column type="index" label="#" width="50" />
      <el-table-column prop="userId" label="分享者ID" width="120" />
      <el-table-column prop="fileName" label="文件名" />
      <el-table-column prop="fileType" label="类型" width="100" />
      <el-table-column prop="fileSize" label="大小" width="100" />
      <el-table-column prop="time" label="上传时间" width="180" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button @click="handleGetFile(scope.row.fileName)" type="primary" size="small">
            📥 获取
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 进度弹窗 -->
    <el-dialog v-model="showProgress" title="文件下载进度" width="500px" :close-on-click-modal="false">
      <el-card class="progress-card">
        <el-scrollbar max-height="300px">
          <el-timeline>
            <el-timeline-item
              v-for="(msg, index) in messages"
              :key="index"
              :type="msg.success ? 'success' : 'danger'"
              :timestamp="msg.timestamp"
            >
              <span :class="msg.success ? 'success-text' : 'error-text'">
                {{ msg.message }}
              </span>
            </el-timeline-item>
          </el-timeline>
        </el-scrollbar>
      </el-card>
      <template #footer>
        <el-button type="primary" @click="showProgress = false" :disabled="isLoading">
          关闭
        </el-button>
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

.custom-table {
  width: 90%;
  max-width: 1000px;
  background: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

.progress-card {
  background: #f9f9f9;
  padding: 10px;
  border-radius: 8px;
}

.success-text {
  color: #67c23a;
}

.error-text {
  color: #f56c6c;
}

.el-table .el-button {
  font-size: 14px;
  height: 35px;
  line-height: 35px;
  border-radius: 8px;
  padding: 0 15px;
}

.el-dialog__header {
  background-color: #f4f7f9;
  border-bottom: 1px solid #ddd;
}

.el-dialog__footer {
  padding: 20px;
  text-align: center;
}
</style>

import request from '@/utils/request.js'
import { useTokenStore } from '@/stores/token.js'


//文件列表查询
export const getFileService = async () => {
    //const tokenStore = useTokenStore()

    // return request.get('/user/userMessage', {
    //     headers: { 'Authorization': tokenStore.token }
    // })

    return request.get('user/userMessage')
}

//文件删除
export const deleteFileService = async (fileName) => {
    return request.post('/user/deleteMessage', null, {
        params: { fileName }
    });
};

//文件上传
export const uploadFileService = async (file, password, policy) => {
    const formData = new FormData();
    formData.append("file", file); // 追加文件
    formData.append("password", password); // 追加密码
    formData.append("policy", policy); // 追加策略

    return request.post('/user/uploadFile', formData, {
        headers: {
            'Content-Type': 'multipart/form-data' // 重要！指定为文件上传类型
        }
    });
};

//所有文件查询
export const getAllService = async () => {
    return request.get('user/allMessage')
};

// 文件下载
export const downloadFileService = async (fileName) => {
    return request.get('user/downloadFile', {
        params: { fileName },
        responseType: 'blob' // 处理文件流
    }).then(response => {
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
};

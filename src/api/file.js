import request from '@/utils/request.js'
import { useTokenStore } from '@/stores/token.js'


//文件列表查询
export const getFileService = async () => {

    return request.get('user/userMessage')
}

//文件删除
export const deleteFileService = async (fileName) => {
    return request.post('/user/deleteMessage', null, {
        params: { fileName }
    });
};

//文件上传
export const uploadFileService = async (file, policy) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("policy", policy);

    return request.post('/user/uploadFile', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 增加超时时间
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

//定制请求的实例

//导入axios  npm install axios
import axios from 'axios';

import { ElMessage } from 'element-plus'
//定义一个变量,记录公共的前缀  ,  baseURL
//const baseURL = 'http://localhost:8080';
const baseURL = '/api';
const instance = axios.create({ baseURL })

import {useTokenStore} from '@/stores/token.js'
//添加请求拦截器
instance.interceptors.request.use(
    (config)=>{
        //请求前的回调
        //添加token
        const tokenStore = useTokenStore();
        //判断有没有token
        if(tokenStore.token){
            config.headers.Authorization = tokenStore.token
        }
        return config;
    },
    (err)=>{
        //请求错误的回调
        Promise.reject(err)
    }
)

import router from '@/router';
//添加响应拦截器
instance.interceptors.response.use(
    result => {
        // 处理成功响应
        if (result.config.responseType === 'blob') {
            return result.data;
        }
        
        // 允许 code 为 0 或 1 的响应通过
        if (result.data.code === 0 || result.data.code === 1|| result.data.code === 2) {
            return result.data;
        }
        
        // 其他 code 视为错误
        ElMessage.error(result.data.msg || '服务异常');
        return Promise.reject(result.data);
    },
    err => {
        // 增强错误处理
        if (!err.response) {
            // 处理网络错误或请求被取消的情况
            if (err.code === 'ECONNABORTED') {
                ElMessage.error('请求超时，请检查网络连接');
            } else {
                ElMessage.error('网络连接异常，请检查服务器状态');
            }
            return Promise.reject(err);
        }
        
        // 处理有响应的错误
        switch (err.response.status) {
            case 401:
                ElMessage.error('请先登录');
                router.push('/');
                break;
            case 500:
                //ElMessage.error('服务器内部错误');
                break;
            default:
                ElMessage.error(`服务异常: ${err.response.status}`);
        }
        return Promise.reject(err);
    }
);

export default instance;
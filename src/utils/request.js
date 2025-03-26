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
        // 如果是 blob 类型，直接返回响应数据
        if (result.config.responseType === 'blob') {
            return result.data;
        }
        // 否则按 JSON 处理
        if (result.data.code === 0) {
            return result.data;
        }
        ElMessage.error(result.data.msg || '服务异常');
        return Promise.reject(result.data);
    },
    err => {
        if(err.response.status===401){
            ElMessage.error('请先登录')
              router.push('/')
        }else{
            ElMessage.error('服务异常')
        }
        return Promise.reject(err);//异步的状态转化成失败的状态
    }
)

export default instance;
//导入request.js请求工具
import request from '@/utils/request.js'

//提供调用注册接口的函数
export const userRegisterService = (registerData) => {
    return request.post('/user/register', registerData, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};


//提供调用登录接口的函数
export const userLoginService = (loginData)=>{
    const params = new URLSearchParams();
    for(let key in loginData){
        params.append(key,loginData[key])
    }
    return request.post('/user/login',params)
}

//提供管理员登录接口的函数
export const adminLoginService = (loginData)=>{
    const params = new URLSearchParams();
    for(let key in loginData){
        params.append(key,loginData[key])
    }
    return request.post('/admin/login',params)
}

//获取用户详细信息
export const userInfoService = ()=>{
    return request.get('/user/userInfo')
}

//修改个人信息
export const userInfoUpdateService = (userInfoData)=>{
   return request.put('/user/update',userInfoData)
}

//管理员初始化
export const setupService = () => {
    return request.get('/admin/setup');
};

//获取用户列表
export const ulListService = () => {
    return request.get('/admin/ulList');
}

//撤销用户
export const revokeService = (userId) => {
    return request.post('/admin/revoke', null, {
        params: { userId }
    });
}

//修改密码
export const resetPasswordService = (passwordData) => {
    return request.patch('/user/updatePwd', passwordData, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

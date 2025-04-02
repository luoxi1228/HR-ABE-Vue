//导入request.js请求工具
import request from '@/utils/request.js'
import axios from 'axios'

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

//修改个人属性
export const userAttributesUpdateService = (userId, attributes) => {
    return request.put('/admin/updateAtt', null, {
      params: {  // 使用 params 传递 URL 参数
        userId,
        attributes
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  }

//修改名称
export const userNameUpdateService = (userName) => {
    return request({
      url: '/user/updateName',
      method: 'PATCH',
      params: { userName }, // 关键修改
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  }
//修改密码
export const resetPasswordService = (passwordData) => {
    return request.patch('/user/updatePwd', passwordData, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

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



//查看用户是否被撤销
export const ulUserService = async () => {
   return request.get('/user/ulUser');
};

//用户注销
export const userLogoutService = async () => {
    return request.post('/user/logout');
};


// 用户注册状态
export const userRegisterStatusService = async (userId) => {
    return request.get('/user/registerStatus', {
        params: { userId }
    });
};

//请求注册的用户列表
export const findRegistersService = async () => {
    return request.get('/admin/findRegisters');
};




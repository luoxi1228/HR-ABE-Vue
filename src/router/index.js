import { createRouter, createWebHistory } from 'vue-router'

//导入组件
import LoginVue from '@/views/Login.vue'
import UserIndexVue from '@/views/UserIndex.vue'
import FileUpVue from '@/views/file/FileUp.vue'
import FiledownVue from '@/views/file/FileDown.vue'
import UserAvatarVue from '@/views/user/UserAvatar.vue'
import UserInfoVue from '@/views/user/UserInfo.vue'
import ResetPwdVue from '@/views/user/UserResetPassword.vue'

//定义路由关系
const routes = [
    { path: '/', component: LoginVue },
    { 
        path: '/userIndex', 
        component: UserIndexVue,
        children: [
            {path:"/file/fileUp",component:FileUpVue},
            {path:"/file/fileDown",component:FiledownVue},
            {path:"/user/avatar",component:UserAvatarVue},
            {path:"/user/info",component:UserInfoVue},
            {path:"/user/resetPwd",component:ResetPwdVue}
        ]
     }
]

//创建路由器
const router = createRouter({
    history: createWebHistory(),
    routes: routes
})

//导出路由
export default router

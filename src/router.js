import { createRouter, createWebHashHistory } from 'vue-router'
import layout from './layout.vue'

import editor from './editor/index.vue'

const routes = [
  {
    path: '',
    component: layout,
    redirect: '/editor',
    children: [
      {
        name: 'editor',
        path: '/editor',
        component: editor
      }
    ]
  }
]

// 如果是其他没有匹配到的路径，重定向到首页
routes.push({ path: '/:pathMatch(.*)*', redirect: '/' })

const router = createRouter({ history: createWebHashHistory(), routes })

export default router

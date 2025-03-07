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

const router = createRouter({ history: createWebHashHistory(), routes })

export default router

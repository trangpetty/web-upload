import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import ReportForm from '@/components/ReportForm.vue'
import ResultView from '@/components/ResultView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/upload'
  },
  {
    path: '/upload',
    name: 'upload',
    component:() => import('@/components/ReportForm.vue')
  },
  {
    path: '/result',
    name: 'result',
    component: ResultView
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

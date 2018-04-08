import Vue from 'vue'
import VueRouter from 'vue-router'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import VueI18n from 'vue-i18n'

import enMessage from './lang/en'
import zhMessage from './lang/zh'

import navbar from './components/navbar'
import sidebar from './components/sidebar'
import App from './App'

import templates from './templates'

Vue.use(VueRouter)
Vue.use(BootstrapVue)
Vue.use(VueI18n)

const router = new VueRouter({
  routes: [
    {
      path: '/',
      redirect: `/${Object.keys(templates)[0]}`
    },
    {
      path: '/:template',
      component: App
    }
  ]
})

let locale = window.localStorage.getItem('lang')
if (!locale) {
  locale = navigator.language.startsWith('zh') ? 'zh' : 'en'
}
const i18n = new VueI18n({
  locale: locale,
  messages: {
    en: enMessage,
    zh: zhMessage
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#root',
  components: {
    navbar,
    sidebar,
    App
  },
  router,
  i18n
})

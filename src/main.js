import Vue from 'vue'
import VueRouter from 'vue-router'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import navbar from './components/navbar'
import sidebar from './components/sidebar'
import App from './App'

import templateList from './templateList'

Vue.use(VueRouter)
Vue.use(BootstrapVue)

const router = new VueRouter({
  routes: [
    {
      path: '/',
      redirect: `/${Object.keys(templateList)[0]}`
    },
    {
      path: '/:id',
      component: App
    }
  ]
})

/* eslint-disable no-new */
new Vue({
  el: '#root',
  components: {
    navbar,
    sidebar,
    App
  },
  router
})

import Vue from 'vue'
import VueRouter from 'vue-router'
import UserGroupManagement from '../components/UserGroupManagement'
import About from '../components/About'

Vue.use(VueRouter);

export default new VueRouter({
  routes: [
    {
      path: '/',
    component: UserGroupManagement,
    name: 'Home'
    },
    {
      path: '/about',
    component: About,
    name: 'About'
    }
  ]
});

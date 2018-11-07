import Vue from 'vue'
import VueRouter from 'vue-router'
import UserGroupManagement from '../components/UserGroupManagement'
import About from '../components/About'
import SiteCollectionAdmins from '../components/SiteCollectionAdmins'

Vue.use(VueRouter);

export default new VueRouter({
  routes: [
    {
    path: '',
    component: UserGroupManagement,
    name: 'Home',
    props: (function (route){
      var props = {

      };
      if(route.query.hasOwnProperty('url')){
        props.initialSiteCollectionUrl = route.query.url;
      }
      if(route.query.hasOwnProperty('loginname')){
        props.initialSelectedItem = route.query.loginname;
      }
      if(route.query.hasOwnProperty('type')){
        props.initialType = route.query.type;
      }

      return props;
    })
    },
    {
      path: '/about',
    component: About,
    name: 'About'
  },
  {
    path: '/sca',
    component: SiteCollectionAdmins,
    name: 'Site Collection Admins'
  }
  ]
});

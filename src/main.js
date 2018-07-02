import Vue from 'vue'
import App from './App.vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'
import './css/style.css'
import 'babel-polyfill'
// index.js or main.js

import VueRouter from 'vue-router'
import Router from './Router'
import lodash from 'lodash';
Object.defineProperty(Vue.prototype, '$lodash', { value: lodash  });

Vue.use(Vuetify);
Vue.use(VueRouter);

new Vue({
  el: '#app',
  router: Router,
  render: function(createElement){
    return createElement(App);
  }
});

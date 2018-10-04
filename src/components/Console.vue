<template>
  <v-card class="flexcard" :min-height="maximize ? '800px' : '480px'">
    <v-card-title primary-title>
      <h3 class="grey--text text--darken-2">Console</h3>
      <v-btn flat class="resize-btn" small right @click="resize"><div v-if="!maximize" class="maximize">
        <svg role="img" class="text-xs-right icon-size">
          <use xlink:href="src/assets/svg-sprite-av-symbol.svg#ic_web_asset_24px" />
        </svg></div>
        <div v-if="maximize">
          <svg class="icon-size" viewBox="0 0 24 24">
            <path fill="#000000" d="M4,8H8V4H20V16H16V20H4V8M16,8V14H18V6H10V8H16M6,12V18H14V12H6Z" />
          </svg>
        </div>
      </v-btn>
    </v-card-title>
    <v-card-text class="grow">
      <v-container fluid>
        <v-layout >
          <v-flex xs12 align-end flexbox>
            <div class="console blue-grey darken-4" @scroll="onScroll" ref="consoleMessages" :style="{height: maximize ? '400px' : '200px', position: 'relative'}">
              <v-list dark class="blue-grey darken-4">
                <template v-for="(item, index) in messages">
                  <v-list-tile-content :class="{'block-flex': isIE}">
                    <div class="message" v-if="item.type != 'notification' && item.type != 'table'">
                      [{{item.hasOwnProperty('date') ? item.date.getHours().toString().padStart(2, '0') : ''}}:{{item.date.getMinutes().toString().padStart(2, '0') }}:{{item.date.getSeconds().toString().padStart(2, '0')}}]
                      <span :class="getClassObject(item)">{{item.verb}}</span>
                      <span class="purple--text text--accent-1">{{item.text}}</span>
                      <span>{{item.preposition ? item.preposition : "from"}}</span>
                      <span class="cyan--text text--accent-1">{{item.target}}</span>
                      <span v-if="item.url"> @ </span>
                      <span v-if="item.url" class="pink--text text--lighten-4">{{item.url}}</span>
                      <span class="blinking-cursor" v-if="(isLoading || isSaving) && index == messages.length - 1">|</span>
                    </div>
                    <span class="message" v-if="item.type == 'notification'"> {{item.text}} </span>
                    <v-container fluid :style="{padding: '0px'}"v-if="item.type == 'table'" >
                      <v-layout>
                        <v-flex xs8></v-flex>
                        <v-flex xs4>
                          <v-text-field
                          v-model="item.search"
                          append-icon="search"
                          label="Search"
                          single-line
                          hide-details
                          @keyup="filter(item.search, item)"
                          @input="filter(item.search, item)"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                    <v-layout>
                      <v-flex xs12 >
                    <v-data-table  dark hide-actions :total-items="item.rows.length" :search="item.search" :headers="item.headers" :items="item.search.length == 0 ? item.rows : item.filteredItems" :pagination.sync="item.pagination">
                      <template slot="headers" slot-scope="props">
                        <tr class="blue-grey darken-4">
                          <th
                          v-for="header in props.headers"
                          :key="header.text"
                          :class="['column sortable', item.pagination.descending ? 'desc' : 'asc', header.value === item.pagination.sortBy ? 'active' : '']"
                          @click="changeSort(header.value, item.pagination, item)"
                          >
                          <svg role="img" :style="{visibility: item.pagination.sortBy == header.value ? 'visible' : 'hidden', fill: 'rgba(255,255,255,0.7)'}" :class="['sortIcon',  item.pagination.descending ? 'desc' : 'asc']" >
                            <use xlink:href="src/assets/svg-sprite-navigation-symbol.svg#ic_arrow_upward_24px" />
                          </svg>
                          {{ header.text }}
                        </th>
                      </tr>
                    </template>
                    <template slot="items" slot-scope="props">
                      <tr class="blue-grey darken-4">
                        <td>{{props.item.operation}}</td>
                        <td>{{props.item.url}}</td>
                        <td>{{props.item.target}}</td>
                        <td>
                        <v-progress-linear :indeterminate="true" v-if="props.item.status == 'pending'"></v-progress-linear>
                          <span v-if="props.item.status != 'pending' && props.item.status !='error'" :class="{'green--text': props.item.status == 'done','text--darken-1': props.item.status == 'done', 'font-weight-black': props.item.status == 'done', 'text-uppercase': props.item.status == 'done'}">{{props.item.status}}</span>
                          <span v-if="props.item.status == 'error'">
                            <v-btn small flat outline color="error" class="errorBtn" @click="props.item.error.expanded = !props.item.error.expanded">{{props.item.error.expanded ? '-' : '+'}} Error: {{props.item.error.title}}</v-btn>
                            <div v-if="props.item.error.expanded" class="red--text text--accent-1">{{props.item.error.message}}</div>
                          </span>
                        </td>
                      </tr>
                    </template>
                  </v-data-table>
              </v-flex>
                </v-layout>
                  </v-container>
                  <div v-if="item.hasError" class="message red--text text--accent-1">Error: {{item.message}}</div>
                </v-list-tile-content>
              </template>
              <span class="blinking-cursor" v-if="!isLoading && !isSaving && messages.length > 0 && isSiteCollectionSelected && isItemSelected">|</span>
            </v-list>
            <span class="message" v-if="!isSiteCollectionSelected && !isLoading && !isSaving"> To start, please select a site collection. <span class="blinking-cursor">|</span></span>
            <span class="message" v-if="!isItemSelected && isSiteCollectionSelected && !isLoading && !isSaving"> Please select a {{type.user ? 'group' : 'user'}}. <span class="blinking-cursor">|</span></span>
            <transition name="fade" v-if="!isIE">
            <div
            :style="{position: 'sticky', bottom: '20px'}" v-if="!isBottomScroll">
            <v-btn
             color="pink"
             dark
             small
             absolute
             right
             @click="goToEnd"
             class="goToEndBtn"
            >Go to End</v-btn>
          </div>
        </transition>
          </div>
          <transition name="fade" >
          <div
          :style="{position: 'relative'}"
           v-if="isIE && !isBottomScroll">
          <v-btn
           color="pink"
           dark
           small
           absolute
           :style="{right: '30px', top: '-40px'}"
           @click="goToEnd"
           class="goToEndBtn"
          >Go to End</v-btn>
        </div>
      </transition>
        </v-flex>
      </v-layout>
    </v-container>
    <v-container fluid>
      <v-layout >
        <v-flex xs12 align-end flexbox>
          <v-progress-linear :indeterminate="(isLoading || isSaving) && (saveProgress == 100 || saveProgress == 0)" v-model="saveProgress" :color="saveProgress >= 100 ? 'success' : 'info'"></v-progress-linear>
        </v-flex>
      </v-layout>
    </v-container>
  </v-card-text>
  <v-card-actions>
    <v-btn flat color="pink" @click="clear" :disabled="isSaving || messages.length == 0">Clear</v-btn>
  </v-card-actions>
</v-card>

</template>

<script>

export default {
  props: {
    isSaving: {
      type: Boolean,
      default: false
    },
    maximize: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isItemSelected: {
      type: Boolean,
      default: false
    },
    isSiteCollectionSelected: {
      type: Boolean,
      default: false
    },
    saveProgress: {
      type: Number,
      default: 0
    },
    messages: {
      type: Array,
      default: []
    },
    type: {
      type: Object,
      default: function(){
        return {users: true, groups: false}
      }
    }
  },
  data: function() {
    return {
      isBottomScroll: true
    };
  },
  computed: {
    isIE: function(){
      return (navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true ); //IF IE > 10
    }
  },
  watch: {
    messages: function(newMessages, oldMessages) {
      (function(that) {
        setTimeout(function() {
          var elem = that.$refs.consoleMessages;
          elem.scrollTop = elem.scrollHeight;
        }, 100);
      })(this)
    }
  },
  methods: {
    onScroll: function(){
      var elem = this.$refs.consoleMessages;
      this.isBottomScroll = elem.scrollHeight - elem.scrollTop - elem.clientHeight < (this.isIE ? 20 : 40);
    },
    goToEnd: function(){
      this.$refs.consoleMessages.scrollTop = this.$refs.consoleMessages.scrollHeight;
    },
    resize: function(){
      this.$emit('resize');
      (function(that){
        setTimeout(function(){
          that.onScroll();
        },100);
      })(this);
    },
    clear: function() {
      this.$emit('clear-console');
      (function(that){
        setTimeout(function(){
          that.onScroll();
        },100);
      })(this);
    },
    getClassObject: function(item) {
      return {
        'green--text text--accent-3': item.type == 'success',
        'red--text text--lighten-1': item.type == 'error',
        'yellow--text text--lighten-2': item.type == 'warning',
        'blue--text text--lighten-4': item.type == 'info'
      }
    },
    filter: function(search, item) {
      item.filteredItems = this.$lodash.filter(item.rows, function(o){
        var match = false;
        var i;
        var key;
        for(i = 0; i < item.headers.length; i++){
          match = o[item.headers[i].value].toLowerCase().indexOf(search.toLowerCase()) > -1;
          if(match){
            break;
          }
        }
        //search error object if no match (could be looking for error specific messages)
        if(!match && o.status == 'error') {
          for(key in o.error){
            if(typeof o.error[key] == 'string'){
              match = o.error[key].toLowerCase().indexOf(search.toLowerCase()) > -1;
              if(match){
                break;
              }
          }
        }
      }
        return match;
      });
    },
    changeSort: function (column, pagination, item) {
      if (pagination.sortBy === column) {
        pagination.descending = !pagination.descending
      } else {
        pagination.sortBy = column
        pagination.descending = false
      }
      item.rows = item.rows.sort(function(a,b){
          if(pagination.descending){
            if(b[column].toLowerCase() < a[column].toLowerCase()){
              return 1;
            } else if (b[column].toLowerCase() > a[column].toLowerCase()) {
              return -1;
            } else {
               return 0;
            }
          } else {
              if(a[column].toLowerCase() < b[column].toLowerCase()){
                return 1;
              } else if (a[column].toLowerCase() > b[column].toLowerCase()) {
                return -1;
              } else {
                 return 0;
              }
          }
      });
    }
  }
}

</script>
<style scoped>
.console {
  box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
  padding: 1em;
  color: #CFD8DC;
  resize: vertical;
  overflow-y: auto;
  font-family:Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New;
}

.console table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 8px;
}

.console .v-divider {
  margin: 8px 0 8px 0;
}

.console td, .console th {
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, .2);
}

.console td {
  padding-left: 50px !important;
  vertical-align: top;
}

.console th {
  text-align: left;
}

.errorBtn {
  margin: 0 0 8px 0;
  display: block;
  word-wrap: break-word;
}
.console .message{
  display: block;
  word-wrap: break-word;
  width: 100%;
}

.blinking-cursor {
  font-weight: 100;
  font-size: 1.2em;
  color: #CFD8DC;
  -webkit-animation: .8s blinker linear infinite;
  -moz-animation: .8s blinker linear infinite;
  -ms-animation: .8s blinker linear infinite;
  -o-animation: .8s blinker linear infinite;
  animation: .8 sblinker linear infinite;
}

svg.icon-size {
  width: 24px;
  height: 24px;
}

.loading-icon {
  width: 20px;
  margin-bottom: -5px;
}

.resize-btn {
  width: 16px !important;
  height: 16px;
  padding: 0 !important;
  margin: 0;
  min-width: 16px;
  position: absolute;
}

.sortIcon {
  height: 15px;
  transition: transform .3s;
}

.sortIcon.desc {
  transform: rotate(180deg);
}

@keyframes blinker {
  0% { opacity: 0.0; }
  49% { opacity: 0.0; }
  50% { opacity: 1.0; }
}

@-moz-keyframes blinker {
  0% { opacity: 0.0; }
  49% { opacity: 0.0; }
  50% { opacity: 1.0; }
}

@-webkit-keyframes blinker {
  0% { opacity: 0.0; }
  49% { opacity: 0.0; }
  50% { opacity: 1.0; }
}

@-ms-keyframes blinker {
  0% { opacity: 0.0; }
  49% { opacity: 0.0; }
  50% { opacity: 1.0; }
}

@-o-keyframes blinker {
  0% { opacity: 0.0; }
  49% { opacity: 0.0; }
  50% { opacity: 1.0; }
}

.block-flex {
  display: block;
}
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to {
  opacity: 1;
}

.fade-enter {
  opacity: 0;
}
/* Enter and leave animations can use different */
/* durations and timing functions.              */
.fade-enter-active {
  transition: all .5s;
}
.fade-leave-active {
  transition: all .5s;
}

.goToEndBtn {
  opacity: 0.2;
}

.goToEndBtn:hover {
  opacity: 1;
}
</style>

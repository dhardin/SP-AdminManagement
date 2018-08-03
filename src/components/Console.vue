<template>
<v-card class="flexcard" :min-height="maximize ? '800px' : '480px'">
    <v-card-title primary-title>
        <h3 class="grey--text text--darken-2">Console</h3>
        <v-btn flat class="resize-btn" small right @click="resize"><div v-if="!maximize" class="maximize">
          <svg role="img" class="text-xs-right icon-size">
          <use xlink:href="src/assets/svg-sprite-av-symbol.svg#ic_web_asset_24px" />
        </svg></div>
        <div v-if="maximize">
          <svg style="width:20px;height:20px" viewBox="0 0 24 24">
              <path fill="#000000" d="M4,8H8V4H20V16H16V20H4V8M16,8V14H18V6H10V8H16M6,12V18H14V12H6Z" />
          </svg>
      </div>
      </v-btn>
    </v-card-title>
    <v-card-text class="grow">
        <v-container fluid>
            <v-layout >
                <v-flex xs12 align-end flexbox>
                    <div class="console blue-grey darken-4" ref="consoleMessages" :style="{height: maximize ? '400px' : '200px'}">
                        <v-list dark class="blue-grey darken-4">
                            <template v-for="(item, index) in messages">
                                <v-list-tile-content>
                                    <div class="message" v-if="item.type != 'notification'">
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
                                    <div v-if="item.hasError" class="red--text text--accent-1">Error: {{item.message}}</div>
                                </v-list-tile-content>
                            </template>
                            <span class="blinking-cursor" v-if="!isLoading && !isSaving && messages.length > 0 && isSiteCollectionSelected && isItemSelected">|</span>
                        </v-list>
                        <span class="message" v-if="!isSiteCollectionSelected && !isLoading && !isSaving"> To start, please select a site collection. <span class="blinking-cursor">|</span></span>
                          <span class="message" v-if="!isItemSelected && isSiteCollectionSelected && !isLoading && !isSaving"> Please select a {{type.user ? 'group' : 'user'}}. <span class="blinking-cursor">|</span></span>
                    </div>
                </v-flex>
            </v-layout>
        </v-container>
        <v-container fluid>
            <v-layout >
                <v-flex xs12 align-end flexbox>
                    <v-progress-linear v-model="saveProgress" :color="saveProgress >= 100 ? 'success' : 'info'"></v-progress-linear>
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
        };
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
        resize: function(){
          this.$emit('resize');
        },
        clear: function() {
            this.$emit('clear-console');
        },
        getClassObject: function(item) {
            return {
                'green--text text--accent-3': item.type == 'success',
                'red--text text--lighten-1': item.type == 'error',
                'yellow--text text--lighten-2': item.type == 'warning',
                'blue--text text--lighten-4': item.type == 'info'
            }
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

.console .message {
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

svg.icon-size{
  width: 16px;
  height: 16px;
}

.resize-btn {
  width: 16px !important;
  height: 16px;
  padding: 0 !important;
  margin: 0;
  min-width: 16px;
  position: absolute;
}

@keyframes blinker{
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

</style>

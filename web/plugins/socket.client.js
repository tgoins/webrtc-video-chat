import Vue from 'vue'
import VueSocketIO from 'vue-socket.io-extended'
import io from 'socket.io-client'

const socketServer = 'https://192.168.1.13:3002'

export default function() {
  Vue.use(VueSocketIO, io(socketServer))
}

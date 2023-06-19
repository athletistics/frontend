<template>
  <div class="min-h-screen flex flex-col justify-between">
    <Nav></Nav>
    <div class="container mx-auto grow p-4 xl:max-w-7xl">
      <router-view></router-view>
    </div>
    <footer class="container mx-auto mt-4 max-w-7xl">
      <div class="w-100 p-7 border-t-2 text-center">
        <p>© 2023 - Nicolas Baeriswyl</p>
        <p>Made with ☕️ by <a href="https://baeriswyl.dev" target="_blank">baeriswyl.dev</a></p>
        <p class="uppercase text-sm mt-4 !text-gray-300 font-bold">Version 0.0.0 (early access)</p>
      </div>
    </footer>
  </div>
</template>

<script>
import {defineComponent} from "vue";
import Nav from './components/Nav.vue'
import Const from './plugins/Constants.ts'
import store from './store'
import axios from "axios";
export default defineComponent({
  components: {Nav},
  mounted() {
    axios.request({
      url: "/verify?secondsAgo=100",
      method: 'get',
      baseURL: Const.TOTP_API_URL,
      headers: {
        'Authorization': 'Bearer ' + store.state.token
      }
    }).then(() => {
      store.commit("set2FaValidated", true)
    }).catch(() => {
      store.commit("set2FaValidated", false)
    })
  }
})
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

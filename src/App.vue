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
        <p class="uppercase text-sm mt-4 !text-gray-300 font-bold">Version 0.3.0 (early alpha)</p>
        <img class="max-w-full mx-auto" style="width: 200px" src="/src/assets/strava/api_logo_cptblWith_strava_horiz_light.svg"/>
      </div>
    </footer>
  </div>
  <Toast />
  <Toasts/> <!-- Legacy toast service, filed for removal -->
</template>

<script lang="ts">
import {defineComponent} from "vue";
import Nav from './components/Nav.vue'
import {mapStores} from "pinia";
import {useMyUserStore} from "./stores/user";
import {useAuthStore} from "./stores/auth";
import Toasts from "./components/Toasts.vue";
import {useDataStore} from "./stores/data";

export default defineComponent({
  components: {Toasts, Nav},
  setup() {
    const authStore = useAuthStore()
    const userStore = useMyUserStore()
    const dataStore = useDataStore()

    return {authStore, userStore, dataStore}
  },
  mounted() {
    this.userStore.updateFromServer()
    this.dataStore.updateAll()
  },
  computed: {
    ...mapStores(useMyUserStore, useAuthStore)
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

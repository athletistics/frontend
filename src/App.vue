<template>
  <div class="min-h-screen flex flex-col justify-between">
    <NavBar />
    <div class="container mx-auto grow p-4 xl:max-w-7xl">
      <router-view></router-view>
    </div>
    <footer class="container mx-auto mt-4 max-w-7xl">
      <div class="w-100 p-7 border-t-2 text-center">
        <p>© 2023 - Nicolas Baeriswyl</p>
        <p>Made with ☕️ by <a href="https://baeriswyl.dev" target="_blank">baeriswyl.dev</a></p>
        <p class="uppercase text-sm mt-4 !text-gray-300 font-bold">Version 1.1.1 (alpha)</p>
        <img class="max-w-full mx-auto" style="width: 200px" src="/src/assets/strava/api_logo_cptblWith_strava_horiz_light.svg"/>
      </div>
    </footer>
  </div>
  <Toast position="bottom-right"/>
  <Toasts/> <!-- TODO: Legacy toast service, filed for removal -->
</template>

<script lang="ts">
import {mapStores} from "pinia";
import {defineComponent} from "vue";

import NavBar from './components/NavBar.vue'
import Toasts from "./components/Toasts.vue";
import {useAuthStore} from "./stores/auth";
import {useDataStore} from "./stores/data";
import {useMyUserStore} from "./stores/user";

export default defineComponent({
  components: {Toasts, NavBar},
  setup() {
    const authStore = useAuthStore()
    const userStore = useMyUserStore()
    const dataStore = useDataStore()

    return {authStore, userStore, dataStore}
  },
  computed: {
    ...mapStores(useMyUserStore, useAuthStore)
  },
  mounted() {
    this.userStore.updateFromServer()
    this.dataStore.updateAll()
  },
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

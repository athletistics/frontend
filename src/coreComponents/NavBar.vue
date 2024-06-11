<template>
  <nav id="nav" class="relative w-full shadow-xl flex max-md:flex-col md:px-10 text-lg items-center z-50">
    <div class="max-md:w-full flex items-center max-md:px-5">
      <router-link to="/">
        <div id="logo" class="text-3xl font-black mr-5 py-3 text-black">Athletistics</div>
      </router-link>
      <div class="md:hidden flex-1"></div>
      <div class="md:hidden cursor-pointer" @click="toggleNav()">
        <font-awesome-icon icon="fa-xmark" size="2x" class="main-transition translate-x-full w-9" :class="xClasses"/>
        <font-awesome-icon icon="fa-bars" size="2x" class="main-transition w-9" :class="hamClasses"/>
      </div>
    </div>
    <ul
v-if="authStore.token && $route.name !== 'index'" :class="navClasses" class="flex flex-1 bg-white md:flex-row flex-col
          max-md:w-full max-md:text-center max-md:absolute max-md:top-full max-md:shadow-lg main-transition" @click="closeNav()">
      <li>
        <router-link class="router-link" to="/home">{{ $t('page.home.title') }}</router-link>
      </li>
      <li v-if="clubVisible">
        <router-link class="router-link" to="/club">{{ $t('page.club.title.club') }}</router-link>
      </li>
      <li v-if="athletesVisible">
        <router-link class="router-link" to="/athletes">{{ $t('page.athletes.title') }}</router-link>
      </li>
      <li v-if="eventsVisible">
        <router-link class="router-link" to="/events">{{ $t('page.event.title') }}</router-link>
      </li>
      <li v-if="resultsVisible">
        <router-link class="router-link" to="/results">{{ $t('page.results.title') }}</router-link>
      </li>
      <li>
        <router-link class="router-link" to="/references">{{ $t('page.references.title') }}</router-link>
      </li>
      <li class="flex-1"></li>
      <li class="md:hidden">
        <hr>
      </li>
      <li v-if="elevateVisible">
        <router-link class="router-link" to="/elevate"><span class="md:hidden">{{ $t('page.elevate.title.nav') }}</span>
          <font-awesome-icon class="ml-2" icon="fa-solid fa-lock-open"/>
        </router-link>
      </li>
      <li>
        <router-link to="/me" class="router-link w-full">{{ $t('page.me.title.account') }}</router-link>
      </li>
      <li>
        <a href="#" class="router-link w-full" @click="logout()"><span
            class="md:hidden">{{ $t('comp.nav.logout') }}</span>
          <font-awesome-icon class="ml-2" icon="fa-solid fa-arrow-right-from-bracket"/>
        </a>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts">
import {OidcClient} from "oidc-client-ts";
import {defineComponent} from "vue";

import authConfig from "@/plugins/AuthConfig";
import Const from "@/plugins/Constants";
import {useAuthStore} from "@/stores/auth";
import {useMyUserStore} from "@/stores/user";

export default defineComponent({
  name: "NavBar",
  setup() {
    const authStore = useAuthStore()
    const userStore = useMyUserStore()

    return {authStore, userStore}
  },
  data() {
    return {
      navVisibility: false as boolean
    }
  },
  computed: {
    elevateVisible() {
      return !this.authStore.is2FaOk && (this.userStore.hasRole(Const.ROLE_COACH) || this.userStore.hasRole(Const.ROLE_HEAD_COACH))
    },
    clubVisible() {
      return this.isElevatedCoach
    },
    athletesVisible() {
      return this.isElevatedCoach
    },
    eventsVisible() {
      return this.isElevatedCoach
    },
    resultsVisible() {
      return this.isElevatedCoach
    },
    isElevatedCoach() {
      return this.authStore.is2FaOk && (this.userStore.hasRole(Const.ROLE_COACH) || this.userStore.hasRole(Const.ROLE_HEAD_COACH))
    },
    navClasses(): string {
      if (this.navVisibility) return 'max-md:visible'
      return 'max-md:invisible max-md:opacity-0'
    },
    xClasses(): string {
      return this.navVisibility ? 'opacity-100' : 'opacity-0'
    },
    hamClasses(): string {
      return this.navVisibility ? 'opacity-0' : 'opacity-100'
    }
  },
  methods: {
    logout() {
      const client = new OidcClient(authConfig)
      void client.createSignoutRequest({extraQueryParams: {client_id: authConfig.client_id}}).then((req) => {
        this.authStore.$reset()
        this.userStore.$reset()
        window.location.href = req.url;
      })
    },
    toggleNav() {
      this.navVisibility = !this.navVisibility
    },
    closeNav() {
      this.navVisibility = false
    }
  }
})
</script>

<style scoped>

</style>
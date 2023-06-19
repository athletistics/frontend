<template>
  <nav class="relative w-full shadow-xl flex max-md:flex-col md:px-10 text-lg items-center">
    <div class="max-md:w-full flex items-center max-md:px-5">
      <router-link to="/">
        <div id="logo" class="text-3xl font-black mr-5 py-3 text-black">Athletistics</div>
      </router-link>
      <div class="md:hidden flex-1"></div>
      <div class="md:hidden cursor-pointer" v-on:click="toggleNav()">
        <font-awesome-icon icon="fa-xmark" size="2x" class="main-transition translate-x-full w-9" :class="xClasses"/>
        <font-awesome-icon icon="fa-bars" size="2x" class="main-transition w-9" :class="hamClasses"/>
      </div>
    </div>
    <ul v-on:click="closeNav()" v-if="token && $route.name !== 'index'" :class="navClasses" class="flex flex-1 bg-white md:flex-row flex-col
          max-md:w-full max-md:text-center max-md:absolute max-md:top-full max-md:shadow-lg main-transition">
      <li>
        <router-link class="router-link" to="/home">Home</router-link>
      </li>
      <li v-if="clubVisible">
        <router-link class="router-link" to="/club">Club</router-link>
      </li>
      <li v-if="athletesVisible">
        <router-link class="router-link" to="/athletes">Athletes</router-link>
      </li>
      <li v-if="eventsVisible">
        <router-link class="router-link" to="/events">Events</router-link>
      </li>
      <li v-if="resultsVisible">
        <router-link class="router-link" to="/results">Results</router-link>
      </li>
      <li class="flex-1"></li>
      <li class="md:hidden"><hr></li>
      <li v-if="elevateVisible">
        <router-link class="router-link" to="/elevate"><span class="md:hidden">Elevate</span><font-awesome-icon class="ml-2" icon="fa-solid fa-lock-open"/></router-link>
      </li>
      <li><router-link to="/me" class="router-link w-full">My Account</router-link></li>
      <li>
        <a href="#" class="router-link w-full" v-on:click="logout()"><span class="md:hidden">Logout</span>
          <font-awesome-icon class="ml-2" icon="fa-solid fa-arrow-right-from-bracket"/>
        </a>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {mapGetters} from "vuex";
import Const from "../plugins/Constants.ts";

export default defineComponent({
  name: "Nav",
  data() {
    return {
      navVisibility: false as boolean
    }
  },
  methods: {
    logout() {
      this.$store.commit('resetUserData')
      this.$router.push('/')
    },
    toggleNav() {
      this.navVisibility = !this.navVisibility
    },
    closeNav(){
      this.navVisibility = false
    }
  },
  computed: {
    elevateVisible(){
      return !this.is2FaOk && (this.hasRole(Const.ROLE_COACH) || this.hasRole(Const.ROLE_HEAD_COACH))
    },
    clubVisible(){
      return this.isElevatedCoach
    },
    athletesVisible(){
      return this.isElevatedCoach
    },
    eventsVisible(){
      return this.isElevatedCoach || this.hasRole(Const.ROLE_ATHLETE)
    },
    resultsVisible(){
      return this.isElevatedCoach || this.hasRole(Const.ROLE_ATHLETE)
    },
    isElevatedCoach(){
      return this.is2FaOk && (this.hasRole(Const.ROLE_COACH) || this.hasRole(Const.ROLE_HEAD_COACH))
    },
    ...mapGetters({
      user: 'getUser',
      token: 'getToken',
      hasRole: 'hasRole',
      is2FaOk: "is2FaOk"
    }),
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
  }
})
</script>

<style scoped>

</style>
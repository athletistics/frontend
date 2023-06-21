<template>

  <div class="shadow-2xl rounded-md max-w-md p-5 mx-auto grid gap-5 mt-10 text-center">
    <h1 v-if="state===stateDefault">Hi!</h1>
    <h1 v-else>Welcome back!</h1>
    <p>Good to see you</p>
    <hr>
    <form class="space-y-4 with-label">
      <p v-if="state===stateExpired">Your session has expired, please log in again.</p>
      <div>
        <button v-if="state!==stateOK" type="button" class="bg-primary text-white" v-on:click="login">Login</button>
        <button v-else type="button" class="bg-primary text-white" v-on:click="$router.push('/home')">Home</button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import axios from "axios";
import Const from './../plugins/Constants'
import {defineComponent} from "vue";
import authConfig from "../plugins/AuthConfig.ts";
import {OidcClient} from "oidc-client-ts";
import {mapGetters} from "vuex";

const stateDefault = 0
const stateLoading = 1
const stateOK = 2
const stateExpired = 3

export default defineComponent({
  name: "Landing",
  data() {
    return {
      state: 0,
    }
  },
  setup() {
    return {
      stateDefault, stateLoading, stateOK, stateExpired
    }
  },
  methods: {
    login: function () {
      let client = new OidcClient(authConfig)
      client.createSigninRequest({state: {bar: 15}}).then(function (req) {
        window.location = req.url;
      })
    }
  },
  computed: {
    ...mapGetters({
      token: 'getToken'
    }),
  },
  mounted() {
    if (!this.token) {
      return
    }
    this.state = stateLoading

    axios.request({
      url: "/me/auth",
      method: 'get',
      baseURL: Const.API_URL,
      headers: {
        'Authorization': 'Bearer ' + this.token
      }
    }).then(() => {
      this.state = stateOK
    }).catch(() => {
      this.state = stateExpired
    })
  }
})
</script>

<style scoped>

</style>
<template>

  <div class="shadow-2xl rounded-md max-w-md p-5 mx-auto grid gap-5 mt-10 text-center">
    <h1 v-if="state===stateDefault">{{ $t('page.landing.title')}}</h1>
    <h1 v-else>{{$t('page.landing.titleWelcomeBack')}}</h1>
    <p>{{$t('page.landing.message')}}</p>
    <hr>
    <form class="space-y-4 with-label">
      <p v-if="state===stateExpired">{{$t('page.landing.messageExpired')}}</p>
      <div>
        <button v-if="state!==stateOK" type="button" class="bg-primary text-white" v-on:click="login">{{$t('page.landing.btnLogin')}}</button>
        <button v-else type="button" class="bg-primary text-white" v-on:click="$router.push('/home')">{{$t('page.landing.btnHome')}}</button>
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
import {useAuthStore} from "../stores/auth.ts";

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
    const authStore = useAuthStore()

    return {
      authStore, stateDefault, stateLoading, stateOK, stateExpired
    }
  },
  methods: {
    login: function () {
      let client = new OidcClient(authConfig)
      client.createSigninRequest({state: {bar: 15}}).then(function (req) {
        window.location.href = req.url;
      })
    }
  },
  mounted() {
    if (!this.authStore.token) {
      return
    }
    this.state = stateLoading

    axios.request({
      url: "/me/auth",
      method: 'get',
      baseURL: Const.API_URL,
      headers: {
        'Authorization': 'Bearer ' + this.authStore.token
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
<template>

  <div class="shadow-2xl rounded-md max-w-md p-5 mx-auto grid gap-5 mt-10 text-center">
    <h1 v-if="state===stateDefault">{{ $t('page.landing.title') }}</h1>
    <h1 v-else>{{ $t('page.landing.titleWelcomeBack') }}</h1>
    <p>{{ $t('page.landing.message') }}</p>
    <hr>
    <form class="space-y-4 with-label">
      <p v-if="state===stateExpired">{{ $t('page.landing.messageExpired') }}</p>
      <div>
        <LoadingBtn v-if="state!==stateOK" full visual-type="primary" @click="login">{{ $t('page.landing.btnLogin') }}
        </LoadingBtn>
        <LoadingBtn v-else full visual-type="primary" @click="$router.push('/home')">{{ $t('page.landing.btnHome') }}
        </LoadingBtn>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import axios from "axios";
import {defineComponent} from "vue";
import {CreateSigninRequestArgs, OidcClient} from "oidc-client-ts";

import {useAuthStore} from "@/stores/auth";
import {useOidcStateStore} from "@/stores/oidcState";

import Const from '@/plugins/Constants'
import authConfig from "@/plugins/AuthConfig";

import LoadingBtn from "@/components/button/LoadingBtn.vue";

const stateDefault = 0
const stateLoading = 1
const stateOK = 2
const stateExpired = 3

export default defineComponent({
  name: "Landing",
  components: {LoadingBtn},
  data() {
    return {
      state: 0,
    }
  },
  setup() {
    const authStore = useAuthStore()
    const oidcStateStore = useOidcStateStore()

    return {
      authStore, oidcStateStore, stateDefault, stateLoading, stateOK, stateExpired
    }
  },
  methods: {
    login: function () {
      this.oidcStateStore.createState()
      const options: CreateSigninRequestArgs = {state: this.oidcStateStore.state}
      const client = new OidcClient(authConfig)
      client.createSigninRequest(options).then(function (req) {
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
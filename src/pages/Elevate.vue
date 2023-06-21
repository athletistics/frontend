<template>

  <div v-if="ready">
  <div class="shadow-2xl rounded-md max-w-md p-5 mx-auto grid gap-5 mt-10 text-center" v-if="!shouldCreate">
    <h1>Elevate privileges</h1>
    <p>Get full access to your Athletistics account by verifying your 2FA.</p>
    <hr>
    <form class="space-y-4 with-label">
      <div>
        <label>2FA Authentication code</label>
        <input type="text" v-model="code"/>
      </div>
      <div>
        <div v-if="warning" class="text-rose-600">{{ warning }}</div>
        <button type="button" class="bg-primary text-white" v-on:click="verify"
                :disabled="code.length !== Constants.TOTP_CODE_LENGTH">Verify</button>
      </div>
    </form>
  </div>

  <div class="shadow-2xl rounded-md max-w-md p-5 mx-auto grid gap-5 mt-10 text-center" v-if="shouldCreate">
    <h1>Setup 2FA</h1>
    <p>Setup a second factor, allowing you to get full access to your account. Use your authenticator app to scan the QR
      code, or to manually add the secret.</p>
    <hr>
    <img class="mx-auto" :src="qrCode">
    <form class="space-y-4 with-label">
      <div>
        <label>Secret</label>
        <input type="text" v-model="secret" disabled/>
      </div>
    </form>
    <hr>
    <form class="space-y-4 with-label">
      <p>Once added to your authenticator app, enter a generated code down below.</p>
      <div>
        <label>Device name</label>
        <input type="text" v-model="deviceName"/>
      </div>
      <div>
        <label>2FA Verification code</label>
        <input type="text" v-model="code"/>
      </div>
      <div>
        <div v-if="warning" class="text-rose-600">{{ warning }}</div>
        <button type="button" class="bg-primary text-white" v-on:click="confirm"
                :disabled="deviceName.length === 0 || code.length !== Constants.TOTP_CODE_LENGTH">Confirm</button>
      </div>
    </form>
  </div>
  </div>
  <div v-else>
    <div class="shadow-2xl rounded-md max-w-md p-5 mx-auto grid gap-5 mt-10 text-center">
      <h2>Privilege elevation is currently not available</h2>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import axios from "axios";
import Const from "../plugins/Constants.ts";
import {useAuthStore} from "../stores/auth.ts";

export default defineComponent({
  setup() {
    const authStore = useAuthStore()
    return {authStore}
  },
  name: "Elevate",
  data() {
    return {
      code: "",
      deviceName: "",
      secret: "",
      qrCode: "",
      warning: "",
      ready: true
    }
  },
  computed: {
    Constants(): any {
      return Const
    },
    shouldCreate() {
      return !this.authStore.has2Fa
    },
  },
  methods: {
    confirm() {
      axios.request({
        url: "/",
        method: 'post',
        baseURL: Const.TOTP_API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        },
        data: {
          code: this.code,
          deviceName: this.deviceName
        }
      }).then(() => {
        this.authStore.set2FaValidated(true)
        this.authStore.setHas2Fa(true)
        this.$router.push('/home')
      }).catch(error => {
        this.warning = error.response.data.message
      })
    },
    verify() {
      axios.request({
        url: "/verify",
        method: 'post',
        baseURL: Const.TOTP_API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        },
        data: {
          code: this.code,
        }
      }).then(() => {
        this.authStore.set2FaValidated(true)
        this.$router.push('/home')
      }).catch(error => {
        this.warning = error.response.data.message
      })
    }
  },
  mounted() {
    axios.request({
      url: "/",
      method: 'get',
      baseURL: Const.TOTP_API_URL,
      headers: {
        'Authorization': 'Bearer ' + this.authStore.token
      }
    }).then(response => {
      console.log(response)
      this.secret = response.data.secret
      this.qrCode = response.data.qrCode
    }).catch(() => {
      this.ready = false
    })
  }
})
</script>

<style scoped>

</style>
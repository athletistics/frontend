<template>

  <div v-if="ready">
  <div class="shadow-2xl rounded-md max-w-md p-5 mx-auto grid gap-5 mt-10 text-center" v-if="!shouldCreate">
    <h1>{{$t('page.elevate.title.elevate')}}</h1>
    <p>{{$t('page.elevate.desc.elevate')}}</p>
    <hr>
    <form class="space-y-4 with-label">
      <div>
        <label>{{$t('page.elevate.code')}}</label>
        <input type="text" v-model="code"/>
      </div>
      <div>
        <div v-if="warning" class="text-rose-600">{{ warning }}</div>
        <button type="button" class="bg-primary text-white" v-on:click="verify"
                :disabled="code.length !== Constants.TOTP_CODE_LENGTH">{{$t('glob.btn.verify')}}</button>
      </div>
    </form>
  </div>

  <div class="shadow-2xl rounded-md max-w-md p-5 mx-auto grid gap-5 mt-10 text-center" v-if="shouldCreate">
    <h1>{{$t('page.elevate.title.setup')}}</h1>
    <p>{{$t('page.elevate.desc.setup')}}</p>
    <hr>
    <img class="mx-auto" :src="qrCode">
    <form class="space-y-4 with-label">
      <div>
        <label>{{$t('page.elevate.secret')}}</label>
        <input type="text" v-model="secret" disabled/>
      </div>
    </form>
    <hr>
    <form class="space-y-4 with-label">
      <p>{{$t('page.elevate.desc.verify')}}</p>
      <div>
        <label>{{$t('page.elevate.device')}}</label>
        <input type="text" v-model="deviceName"/>
      </div>
      <div>
        <label>{{$t('page.elevate.code')}}</label>
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
      <h2>{{$t('page.elevate.title.unavailable')}}</h2>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import axios from "axios";
import Const from "../plugins/Constants";
import {useAuthStore} from "../stores/auth";

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
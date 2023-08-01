<template>

  <div v-if="ready">
    <div class="shadow-2xl rounded-md max-w-md p-5 mx-auto grid gap-5 mt-10 text-center" v-if="!shouldCreate">
      <h1>{{ $t('page.elevate.title.elevate') }}</h1>
      <p>{{ $t('page.elevate.desc.elevate') }}</p>
      <hr>
      <form class="space-y-4 with-label" v-on:submit.prevent="verify">
        <div>
          <label>{{ $t('page.elevate.code') }}</label>
          <input type="text" v-model="code"/>
        </div>
        <div>
          <LoadingBtn :type="'submit'" :loading="state" :disabled="code.length !== Constants.TOTP_CODE_LENGTH" full visual-type="primary">{{ $t('glob.btn.verify') }}</LoadingBtn>
        </div>
      </form>
    </div>

    <div class="shadow-2xl rounded-md max-w-md p-5 mx-auto grid gap-5 mt-10 text-center" v-if="shouldCreate">
      <h1>{{ $t('page.elevate.title.setup') }}</h1>
      <p>{{ $t('page.elevate.desc.setup') }}</p>
      <hr>
      <img class="mx-auto" :src="qrCode">
      <form class="space-y-4 with-label">
        <div>
          <label>{{ $t('page.elevate.secret') }}</label>
          <input type="text" v-model="secret" disabled/>
        </div>
      </form>
      <hr>
      <form class="space-y-4 with-label" v-on:submit.prevent="confirm">
        <p>{{ $t('page.elevate.desc.verify') }}</p>
        <div>
          <label>{{ $t('page.elevate.device') }}</label>
          <input type="text" v-model="deviceName"/>
        </div>
        <div>
          <label>{{ $t('page.elevate.code') }}</label>
          <input type="text" v-model="code"/>
        </div>
        <div>
          <LoadingBtn :type="'submit'" full visual-type="primary"
                      :loading="state"
                      :disabled="deviceName.length === 0 || code.length !== Constants.TOTP_CODE_LENGTH"  >{{ $t('glob.btn.verify') }}</LoadingBtn>
        </div>
      </form>
    </div>
  </div>
  <div v-else>
    <div class="shadow-2xl rounded-md max-w-md p-5 mx-auto grid gap-5 mt-10 text-center">
      <h2>{{ $t('page.elevate.title.unavailable') }}</h2>
    </div>
  </div>
</template>

<script lang="ts">
import axios from "axios";
import {defineComponent} from "vue";

import {useAuthStore} from "@/stores/auth";
import {useToastStore} from "@/stores/toast";

import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import Const from "@/plugins/Constants";

import LoadingBtn from "@/components/button/LoadingBtn.vue";

export default defineComponent({
  components: {LoadingBtn},
  setup() {
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    return {authStore, toastStore}
  },
  name: "Elevate",
  data() {
    return {
      code: "",
      deviceName: "",
      secret: "",
      qrCode: "",
      ready: true,
      state: {state: NaN} as LoadingState
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
      this.state.state = LoadingStates.Loading
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
        this.state.state = LoadingStates.Loaded
        this.authStore.set2FaValidated(true)
        this.authStore.setHas2Fa(true)
        this.$router.push('/home')
      }).catch(error => {
        this.state.state = LoadingStates.Error
        this.code = ""
        this.toastStore.addErrorToast(error.response.data.message)
      })
    },
    verify() {
      this.state.state = LoadingStates.Loading
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
        this.state.state = LoadingStates.Loaded
        this.authStore.set2FaValidated(true)
        this.$router.push('/home')
      }).catch(error => {
        this.state.state = LoadingStates.Error
        this.code = ""
        this.toastStore.addErrorToast(error.response.data.message)
      })
    }
  },
  mounted() {
    if (!this.shouldCreate) return
    axios.request({
      url: "/",
      method: 'get',
      baseURL: Const.TOTP_API_URL,
      headers: {
        'Authorization': 'Bearer ' + this.authStore.token
      }
    }).then(response => {
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
<template>

  <div v-if="ready">
    <div v-if="!shouldCreate" class="shadow-2xl rounded-md max-w-md p-5 mx-auto grid gap-5 mt-10 text-center">
      <h1>{{ $t('page.elevate.title.elevate') }}</h1>
      <p>{{ $t('page.elevate.desc.elevate') }}</p>
      <hr>
      <form class="space-y-4 with-label" @submit.prevent="verify">
        <div>
          <label>{{ $t('page.elevate.code') }}</label>
          <input v-model="code" type="text"/>
        </div>
        <div>
          <LoadingBtn :type="'submit'" :loading="state" :disabled="code.length !== Constants.TOTP_CODE_LENGTH" full visual-type="primary">{{ $t('glob.btn.verify') }}</LoadingBtn>
        </div>
      </form>
    </div>

    <div v-if="shouldCreate" class="shadow-2xl rounded-md max-w-md p-5 mx-auto grid gap-5 mt-10 text-center">
      <h1>{{ $t('page.elevate.title.setup') }}</h1>
      <p>{{ $t('page.elevate.desc.setup') }}</p>
      <hr>
      <img class="mx-auto" :src="qrCode">
      <form class="space-y-4 with-label">
        <div>
          <label>{{ $t('page.elevate.secret') }}</label>
          <input v-model="secret" type="text" disabled/>
        </div>
      </form>
      <hr>
      <form class="space-y-4 with-label" @submit.prevent="confirm">
        <p>{{ $t('page.elevate.desc.verify') }}</p>
        <div>
          <label>{{ $t('page.elevate.device') }}</label>
          <input v-model="deviceName" type="text"/>
        </div>
        <div>
          <label>{{ $t('page.elevate.code') }}</label>
          <input v-model="code" type="text"/>
        </div>
        <div>
          <LoadingBtn
:type="'submit'" full visual-type="primary"
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
import axios, {AxiosError, AxiosResponse} from "axios";
import {useToast} from "primevue/usetoast";
import {defineComponent} from "vue";

import LoadingBtn from "@/coreComponents/button/LoadingBtn.vue";
import Const from "@/plugins/Constants";
import {fromAxiosError} from "@/plugins/ToastWriter";
import {useAuthStore} from "@/stores/auth";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";

export default defineComponent({
  name: "Elevate",
  components: {LoadingBtn},
  setup() {
    const authStore = useAuthStore()
    const toast = useToast()
    return {authStore, toast}
  },
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
  mounted() {
    if (!this.shouldCreate) return
    axios.request({
      url: "/",
      method: 'get',
      baseURL: Const.TOTP_API_URL,
      headers: {
        'Authorization': 'Bearer ' + this.authStore.token
      }
    }).then((response: AxiosResponse<{secret: string, qrCode: string}, any>) => {
      this.secret = response.data.secret
      this.qrCode = response.data.qrCode
    }).catch(() => {
      this.ready = false
    })
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
        void this.$router.push('/home')
      }).catch((error: AxiosError) => {
        this.state.state = LoadingStates.Error
        this.code = ""
        this.toast.add(fromAxiosError(error))
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
        void this.$router.push('/home')
      }).catch((error: AxiosError) => {
        this.state.state = LoadingStates.Error
        this.code = ""
        this.toast.add(fromAxiosError(error))
      })
    }
  }
})
</script>

<style scoped>

</style>
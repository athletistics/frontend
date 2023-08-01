<template>
  <LoadingBtn :loading="state" @click="getCode">{{$t('comp.shareUser.share')}}</LoadingBtn>
  <Teleport to="body">
    <Modal ref="modal">
      <form class="with-label grid gap-4 max-w-full overflow-hidden">
        <h3>{{ $t('comp.shareUser.title.code') }}</h3>

        <div>
          <label>{{ $t('comp.shareUser.description') }}</label>
          <input disabled v-model="code.code">
        </div>

        <div class="grid grid-cols-2 gap-4">
        <LoadingBtn outlined @click="close">{{ $t('glob.btn.close') }}</LoadingBtn>
        <LoadingBtn outlined @click="copyCode">{{ $t('glob.btn.copy') }}</LoadingBtn>
        </div>
      </form>
    </Modal>
  </Teleport>
</template>

<script lang="ts">
import axios from "axios";
import {defineComponent, PropType} from 'vue'

import {useAuthStore} from "@/stores/auth";
import {useToastStore} from "@/stores/toast";

import Const from "@/plugins/Constants";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import Modal from "@/components/modals/Modal.vue";
import LoadingBtn from "@/components/button/LoadingBtn.vue";

export default defineComponent({
  name: "UserCreateShare",
  components: {LoadingBtn, Modal},
  props: {
    user: {type: String as PropType<string>, required: true}
  },
  setup() {
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    return {authStore, toastStore}
  },
  data() {
    return {
      state: {state: NaN} as LoadingState,
      code: {} as { code: string }
    }
  },
  methods: {
    getCode() {
      this.state.state = LoadingStates.Loading

      axios.request({
        url: 'users/share?userId=' + this.user, method: 'get', baseURL: Const.API_URL,
        headers: {'Authorization': 'Bearer ' + this.authStore.token}
      }).then(response => {
        this.code = response.data
        this.state.state = LoadingStates.Loaded;
        (this.$refs.modal as any).setVisibility(true)
      }).catch(error => {
        this.toastStore.addToastFromAxiosError(error)
        this.state.state = LoadingStates.Error
      })
    },
    close() {
      (this.$refs.modal as any).setVisibility(false)
    },
    copyCode() {
      navigator.clipboard.writeText(this.code.code)
      this.toastStore.addSuccessToast()
    }
  }
})
</script>

<style scoped>

</style>
<template>
  <Modal ref="modal">
    <form v-if="!userAdded" class="with-label grid gap-4">
      <h3>{{ $t('comp.shareUser.title.add') }}</h3>

      <div>
        <label>{{ $t('comp.shareUser.descriptionAdd') }}</label>
        <input v-model="code" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx">
      </div>

      <div class="grid grid-cols-2 gap-4">
        <LoadingBtn @click="setVisibility(false)" outlined>{{ $t('glob.btn.close') }}</LoadingBtn>
        <LoadingBtn @click="redeem" :loading="state" outlined visual-type="primary">{{
            $t('glob.btn.save')
          }}
        </LoadingBtn>
      </div>
    </form>

    <div v-else class="grid gap-4">
      <h3>{{ $t('comp.shareUser.title.success') }}</h3>

      <LabeledText label="glob.user.firstName" :text="user.firstName"/>
      <LabeledText label="glob.user.lastName" :text="user.lastName"/>
      <LabeledText label="glob.user.birthdate"
                   :text="user.birthDate ? $d(new Date(user.birthDate)) : undefined"/>

      <LoadingBtn @click="setVisibility(false)" outlined>{{ $t('glob.btn.close') }}</LoadingBtn>
    </div>
  </Modal>
</template>

<script lang="ts">
import axios from "axios";
import {defineComponent} from 'vue'

import {useAuthStore} from "@/stores/auth";
import {useToastStore} from "@/stores/toast";

import Const from "@/plugins/Constants";
import User from "@/types/User";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import Modal from "@/components/dialogs/Modal.vue";
import LoadingBtn from "@/components/button/LoadingBtn.vue";
import LabeledText from "@/components/LabeledText.vue";

export default defineComponent({
  name: "UserRedeemShareCodeModal",
  components: {LabeledText, LoadingBtn, Modal},
  emits: ['created'],
  setup() {
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    return {authStore, toastStore}
  },
  data() {
    return {
      userAdded: false as boolean,
      code: "" as string,
      user: {} as User,
      state: {state: NaN} as LoadingState
    }
  },
  methods: {
    setVisibility(visible: boolean) {
      (this.$refs.modal as any).setVisibility(visible)
      this.code = ""
      this.user = {} as User
      this.userAdded = false
    },
    redeem() {
      this.state.state = LoadingStates.Loading

      axios.request({
        url: 'users/share?code=' + this.code, method: 'post', baseURL: Const.API_URL,
        headers: {'Authorization': 'Bearer ' + this.authStore.token}
      }).then(response => {
        this.user = response.data
        this.state.state = LoadingStates.Loaded;
        this.$emit('created')
        this.userAdded = true
      }).catch(error => {
        this.toastStore.addToastFromAxiosError(error)
        this.state.state = LoadingStates.Error
      })
    }
  }
})
</script>

<style scoped>

</style>
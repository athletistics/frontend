<template>
  <TitleWithBtnPlus :btn-visible="canManageUsers()" @btn-click="setVisibility(true)">{{ $t('page.athletes.title') }}
  </TitleWithBtnPlus>
  <UserList :state="athletesState" :users="athletes"/>

  <div class="py-4"></div>

  <TitleWithBtnPlus :btn-visible="canManageUsers()" @btn-click="setExternalVisibility(true)">
    {{ $t('page.athletes.titleExternal') }}
  </TitleWithBtnPlus>
  <UserList :state="externalAthletesState" :users="externalAthletes"/>

  <DialogUserCreate ref="modal" @success="loadAthletes"/>

  <UserRedeemShareCodeModal ref="externalModal" @created="loadAthletes"/>
</template>

<script lang="ts">
import axios from "axios";
import {defineComponent} from "vue";

import {useAuthStore} from "@/stores/auth";
import {useToastStore} from "@/stores/toast";
import {useDataStore} from "@/stores/data";
import {useMyUserStore} from "@/stores/user";

import User from "@/types/User";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import Const from "@/plugins/Constants"
import {canManageUsers} from "@/plugins/AccessControl";

import Modal from "@/components/dialogs/Modal.vue";
import Switch from "@/components/form/Switch.vue";
import UserList from "@/components/user/UserList.vue";
import LoadingBtn from "@/components/button/LoadingBtn.vue";
import TitleWithBtnPlus from "@/components/title/TitleWithBtnPlus.vue";
import UserRedeemShareCodeModal from "@/components/user/UserRedeemShareCodeModal.vue";
import DialogUserCreate from "@/components/dialogs/user/DialogUserCreate.vue";

export default defineComponent({
  components: {DialogUserCreate, UserRedeemShareCodeModal, Switch, LoadingBtn, TitleWithBtnPlus, UserList, Modal},
  setup: function () {
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    const dataStore = useDataStore()
    const userStore = useMyUserStore()

    return {authStore, toastStore, dataStore, userStore}
  },
  data() {
    return {
      athletes: [] as User[],
      externalAthletes: [] as User[],
      athletesState: NaN as LoadingStates,
      externalAthletesState: NaN as LoadingStates,
      newAthlete: {} as User,
      createState: {state: NaN} as LoadingState
    }
  },
  mounted() {
    this.loadAthletes()
  },
  methods: {
    canManageUsers,
    setVisibility(visible: boolean) {
      (this.$refs.modal as any).setVisibility(visible)

      if (!visible) this.newAthlete = {} as User
    },
    setExternalVisibility(visible: boolean) {
      (this.$refs.externalModal as any).setVisibility(visible)
    },
    loadAthletes() {
      this.athletesState = LoadingStates.Loading
      this.externalAthletesState = LoadingStates.Loading
      this.athletes = [] as User[]
      this.externalAthletes = [] as User[]

      axios.request({
        url: "/users?separated=true", method: 'get',
        baseURL: Const.API_URL,
        headers: {'Authorization': 'Bearer ' + this.authStore.token}
      }).then(response => {
        this.athletes = response.data.owned
        this.externalAthletes = response.data.shared

        this.athletesState = this.athletes?.length ? LoadingStates.Loaded : LoadingStates.Empty
        this.externalAthletesState = this.externalAthletes?.length ? LoadingStates.Loaded : LoadingStates.Empty
      }).catch(error => {
        this.toastStore.addToastFromAxiosError(error)
        this.athletesState = LoadingStates.Error
        this.externalAthletesState = LoadingStates.Error
      })
    },
  }
})
</script>

<style scoped>

</style>
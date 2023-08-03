<template>
  <TitleWithBtnPlus :btn-visible="canManageUsers()" @btn-click="($refs.modal as any).setVisibility(true)">
    {{ $t('page.athletes.title') }}
  </TitleWithBtnPlus>
  <UserList :state="athletesState" :users="athletes"/>

  <div class="py-4"></div>

  <TitleWithBtnPlus :btn-visible="canManageUsers()" @btn-click="($refs.externalModal as any).setVisibility(true)">
    {{ $t('page.athletes.titleExternal') }}
  </TitleWithBtnPlus>
  <UserList :state="externalAthletesState" :users="externalAthletes"/>

  <DialogUserCreate ref="modal" @success="loadAthletes"/>

  <UserRedeemShareCodeModal ref="externalModal" @created="loadAthletes"/>
</template>

<script setup lang="ts">
import axios from "axios";
import {onMounted, ref} from "vue";
import {useToast} from "primevue/usetoast";

import {useAuthStore} from "@/stores/auth";

import User from "@/types/User";
import {LoadingStates} from "@/types/LoadingStates";
import Const from "@/plugins/Constants"
import {canManageUsers} from "@/plugins/AccessControl";

import UserList from "@/components/user/UserList.vue";
import TitleWithBtnPlus from "@/components/title/TitleWithBtnPlus.vue";
import UserRedeemShareCodeModal from "@/components/dialogs/user/DialogUserRedeemShareCode.vue";
import DialogUserCreate from "@/components/dialogs/user/DialogUserCreate.vue";
import {fromAxiosError} from "@/plugins/ToastWriter";

const toast = useToast()
const authStore = useAuthStore()

const athletes = ref<User[]>([])
const externalAthletes = ref<User[]>([])
const athletesState = ref<LoadingStates>(NaN)
const externalAthletesState = ref<LoadingStates>(NaN)
const loadAthletes = () => {
  athletesState.value = LoadingStates.Loading
  externalAthletesState.value = LoadingStates.Loading

  axios.request({
    url: "/users?separated=true", method: 'get',
    baseURL: Const.API_URL,
    headers: {'Authorization': 'Bearer ' + authStore.token}
  }).then(response => {
    athletes.value = response.data.owned
    externalAthletes.value = response.data.shared

    athletesState.value = athletes.value?.length ? LoadingStates.Loaded : LoadingStates.Empty
    externalAthletesState.value = externalAthletes.value?.length ? LoadingStates.Loaded : LoadingStates.Empty
  }).catch(error => {
    toast.add(fromAxiosError(error))
    athletesState.value = LoadingStates.Error
    externalAthletesState.value = LoadingStates.Error
  })
}

onMounted(() => {
  loadAthletes()
})
</script>

<style scoped>

</style>
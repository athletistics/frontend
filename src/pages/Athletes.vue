<template>
  <TitleWithBtnPlus :btn-visible="canManageUsers()" @btn-click="($refs.modal as any).setVisibility(true)">
    {{ $t('page.athletes.title') }}
  </TitleWithBtnPlus>

  <SelectChips v-model="selectedTeams" :options="teams" option-label="name" option-value="id"></SelectChips>

  <UserList :state="athletesState" :users="visibleAthletes"/>

  <div class="py-4"></div>

  <TitleWithBtnPlus :btn-visible="canManageUsers()" @btn-click="($refs.externalModal as any).setVisibility(true)">
    {{ $t('page.athletes.titleExternal') }}
  </TitleWithBtnPlus>
  <UserList :state="externalAthletesState" :users="externalAthletes"/>

  <DialogUserCreate ref="modal" @success="loadAthletes"/>

  <UserRedeemShareCodeModal ref="externalModal" @created="loadAthletes"/>
</template>

<script setup lang="ts">
import axios, {AxiosError, AxiosResponse} from "axios";
import {useToast} from "primevue/usetoast";
import {computed, onMounted, ref} from "vue";

import DialogUserCreate from "@/components/user/DialogUserCreate.vue";
import UserRedeemShareCodeModal from "@/components/user/DialogUserRedeemShareCode.vue";
import UserList from "@/components/user/UserList.vue";
import SelectChips from "@/coreComponents/button/SelectChips.vue";
import TitleWithBtnPlus from "@/coreComponents/title/TitleWithBtnPlus.vue";
import {canManageUsers} from "@/plugins/AccessControl";
import Const from "@/plugins/Constants"
import {sortUser} from "@/plugins/Helper";
import {fromAxiosError} from "@/plugins/ToastWriter";
import {useAuthStore} from "@/stores/auth";
import {useMyUserStore} from "@/stores/user";
import {LoadingStates} from "@/types/LoadingStates";
import Team from "@/types/Team";
import User from "@/types/User";

const toast = useToast()
const userStore = useMyUserStore()
const authStore = useAuthStore()

const athletes = ref<User[]>([])
const externalAthletes = ref<User[]>([])
const athletesState = ref<LoadingStates>(NaN)
const externalAthletesState = ref<LoadingStates>(NaN)
const selectedTeams = ref<string[]>([])

const teams = computed(() => {
  const teamSet = new Map<String, Team>()
  athletes.value?.forEach((a: User): void => {
    a.teams?.forEach((t: Team): void => {
      if (t.clubId === userStore.user.clubId) teamSet.set(t.id, t)
    })
  })

  const result = Array.from(teamSet.values())
  for (let i = 0; i < 10; i++) {
    result.push(...Array.from(teamSet.values()))
  }

  return Array.from(teamSet.values()).sort((a: Team, b: Team): number => a.name.localeCompare(b.name))
})

const visibleAthletes = computed((): User[] => {
  if (!selectedTeams.value.length) return athletes.value

  return athletes.value.filter((a) => {
    return a.teams?.some((t) => selectedTeams.value.some((id) => t.id === id))
  })
})

const loadAthletes = () : void => {
  athletesState.value = LoadingStates.Loading
  externalAthletesState.value = LoadingStates.Loading

  axios.request({
    url: "/users?separated=true", method: 'get',
    baseURL: Const.API_URL,
    headers: {'Authorization': 'Bearer ' + authStore.token}
  }).then((response: AxiosResponse<{ owned: User[], shared: User[] }, any>) => {
    athletes.value = response.data.owned.sort(sortUser)
    externalAthletes.value = response.data.shared.sort(sortUser)

    athletesState.value = athletes.value?.length ? LoadingStates.Loaded : LoadingStates.Empty
    externalAthletesState.value = externalAthletes.value?.length ? LoadingStates.Loaded : LoadingStates.Empty
  }).catch((error: AxiosError) => {
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
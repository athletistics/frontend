<template>
  <div v-if="emergencyVisible">
    <h1>{{ $t('page.home.title') }}</h1>

    <SelectChips v-model="selectedTeams" :options="teams" option-label="name" option-value="id"></SelectChips>

    <SimpleTable
        :headers="['glob.user.firstName', 'glob.user.lastName', 'glob.user.primaryPhone']" :state="state"
        :i18n="true">
      <SimpleTableRow v-for="a in visibleAthletes">
        <SimpleTableCell>{{ a.firstName }}</SimpleTableCell>
        <SimpleTableCell>{{ a.lastName }}</SimpleTableCell>
        <SimpleTableCell><a :href="toPhoneLink(a.primaryPhone)">{{ a.primaryPhone }}</a></SimpleTableCell>
      </SimpleTableRow>
    </SimpleTable>
  </div>
  <h1 v-else>Hello {{ userStore.user.firstName }}!</h1>

</template>

<script setup lang="ts">

import axios, {AxiosError, AxiosResponse} from "axios";
import {useToast} from "primevue/usetoast";
import {computed, onMounted, ref} from "vue";

import SelectChips from "@/coreComponents/button/SelectChips.vue";
import SimpleTable from "@/coreComponents/list/SimpleTable.vue";
import SimpleTableCell from "@/coreComponents/list/SimpleTableCell.vue";
import SimpleTableRow from "@/coreComponents/list/SimpleTableRow.vue";
import Const from "@/plugins/Constants";
import {sortUser} from "@/plugins/Helper";
import {fromAxiosError} from "@/plugins/ToastWriter";
import {useAuthStore} from "@/stores/auth";
import {useMyUserStore} from "@/stores/user";
import {LoadingStates} from "@/types/LoadingStates";
import Team from "@/types/Team";
import User from "@/types/User";

const authStore = useAuthStore()
const toast = useToast()
const userStore = useMyUserStore()

const athletes = ref<User[]>([])
const state = ref<LoadingStates>(NaN)
const selectedTeams = ref<string[]>([])

const emergencyVisible = computed(() => {
  return userStore.hasRole("coach")
})

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

const toPhoneLink = (number: string): string => {
  return "tel:" + number.replace(/\s/g, "");
}

onMounted(() => {
  if (!emergencyVisible.value) return

  // load emergency data
  state.value = LoadingStates.Loading
  axios.request({
    url: "/users/emergency",
    method: 'get',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    }
  }).then((response: AxiosResponse<User[], any>) => {
    athletes.value = response.data?.sort(sortUser)
    state.value = response.data ? LoadingStates.Loaded : LoadingStates.Empty
    console.log('loaded')
  }).catch((error: AxiosError) => {
    toast.add(fromAxiosError(error))
    state.value = LoadingStates.Error
  })
})
</script>

<style scoped>

</style>
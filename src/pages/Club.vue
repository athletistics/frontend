<template>
  <div v-if="club?.sport" class="flex items-baseline">
    <h1 class="mr-2">{{ club.name }}</h1>
    <h4>{{ $t('data.' + club.sport.i18nName) }}</h4>
  </div>

  <div class="py-5">&nbsp;</div>

  <TitleWithBtnPlus :btn-visible="canManageTeam()" @btn-click="($refs.createTeam as any).setVisibility(true)">
    {{ $t('page.club.title.teams') }}
  </TitleWithBtnPlus>

  <SimpleList :state="teamsState">
    <SimpleListEntry v-for="t in teams" :to="'/team/'+t.id">{{ t.name }}</SimpleListEntry>
  </SimpleList>

  <div class="py-5">&nbsp;</div>

  <TitleWithBtnPlus
:btn-visible="canManageDiscipline()"
                    @btn-click="($refs.createDiscipline as any).setVisibility(true)">{{
      $t('page.club.title.disciplines')
    }}
  </TitleWithBtnPlus>

  <SimpleList :state="disciplineStateObj.state">
    <SimpleListEntry v-for="d in dataStore.disciplines.filter(d => !d.isOfficial)">{{ d.customName }}
    </SimpleListEntry>
  </SimpleList>

  <DialogTeamCreate ref="createTeam" @success="loadTeams"/>

  <DialogDisciplineCreate ref="createDiscipline" @success="loadDisciplines"/>

</template>

<script setup lang="ts">
import axios, {AxiosResponse} from "axios";
import {onMounted, reactive, ref} from "vue";

import DialogDisciplineCreate from "@/components/club/DialogDisciplineCreate.vue";
import DialogTeamCreate from "@/components/club/DialogTeamCreate.vue";
import SimpleList from "@/coreComponents/list/SimpleList.vue";
import SimpleListEntry from "@/coreComponents/list/SimpleListEntry.vue";
import TitleWithBtnPlus from "@/coreComponents/title/TitleWithBtnPlus.vue";
import {canManageDiscipline, canManageTeam} from "@/plugins/AccessControl";
import Const from "@/plugins/Constants"
import {useAuthStore} from "@/stores/auth";
import {useDataStore} from "@/stores/data";
import {useMyUserStore} from "@/stores/user";
import Club from "@/types/Club";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import Team from "@/types/Team";

const authStore = useAuthStore()
const userStore = useMyUserStore()
const dataStore = useDataStore()


const disciplineStateObj = reactive<LoadingState>({state: NaN})
const loadDisciplines = () : void=> {
  dataStore.updateDisciplines(disciplineStateObj)
}


const teams = ref<Team[]>()
const teamsState = ref<LoadingStates>()
const loadTeams = () : void => {
  teamsState.value = LoadingStates.Loading
  axios.request({
    url: "/club/" + userStore.user.clubId + "/teams",
    method: 'get',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    }
  }).then((response: AxiosResponse<Team[], any>) => {
    teamsState.value = response.data.length ? LoadingStates.Loaded : LoadingStates.Empty
    teams.value = response.data
  }).catch(() => {
    teamsState.value = LoadingStates.Error
  })
}


const club = ref<Club>()
onMounted(() => {
  axios.request({
    url: "/club/" + userStore.user.clubId,
    method: 'get',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    }
  }).then((response: AxiosResponse<Club, any>) => {
    club.value = response.data
  }).catch(() => console.log('unable to load clubs'))

  loadTeams()
})
</script>

<style scoped>

</style>
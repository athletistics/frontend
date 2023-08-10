<template>
  <div v-if="club?.sport" class="flex items-baseline">
    <h1 class="mr-2">{{ club.name }}</h1>
    <h4>{{ $t('data.' + club.sport.i18nName) }}</h4>
  </div>

  <div class="py-5">&nbsp;</div>

  <TitleWithBtnPlus @btn-click="($refs.createTeam as any).setVisibility(true)" :btn-visible="canManageTeam()">
    {{ $t('page.club.title.teams') }}
  </TitleWithBtnPlus>

  <SimpleList :state="teamsState">
    <SimpleListEntry v-for="t in teams" :to="'/team/'+t.id">{{ t.name }}</SimpleListEntry>
  </SimpleList>

  <div class="py-5">&nbsp;</div>

  <TitleWithBtnPlus @btn-click="($refs.createDiscipline as any).setVisibility(true)"
                    :btn-visible="canManageDiscipline()">{{
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
import {onMounted, reactive, ref} from "vue";
import axios from "axios";

import {useAuthStore} from "@/stores/auth";
import {useDataStore} from "@/stores/data";
import {useMyUserStore} from "@/stores/user";

import Club from "@/types/Club";
import Team from "@/types/Team";
import LoadingState from "@/types/LoadingState";
import Const from "@/plugins/Constants"
import {LoadingStates} from "@/types/LoadingStates";
import {canManageDiscipline, canManageTeam} from "@/plugins/AccessControl";

import SimpleList from "@/components/list/SimpleList.vue";
import SimpleListEntry from "@/components/list/SimpleListEntry.vue";
import TitleWithBtnPlus from "@/components/title/TitleWithBtnPlus.vue";
import DialogTeamCreate from "@/components/dialogs/club/DialogTeamCreate.vue";
import DialogDisciplineCreate from "@/components/dialogs/club/DialogDisciplineCreate.vue";

const authStore = useAuthStore()
const userStore = useMyUserStore()
const dataStore = useDataStore()


const disciplineStateObj = reactive<LoadingState>({state: NaN})
const loadDisciplines = () => {
  dataStore.updateDisciplines(disciplineStateObj)
}


const teams = ref<Team[]>()
const teamsState = ref<LoadingStates>()
const loadTeams = () => {
  teamsState.value = LoadingStates.Loading
  axios.request({
    url: "/club/" + userStore.user.clubId + "/teams",
    method: 'get',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    }
  }).then(response => {
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
  }).then(response => {
    club.value = response.data
  })

  loadTeams()
})
</script>

<style scoped>

</style>
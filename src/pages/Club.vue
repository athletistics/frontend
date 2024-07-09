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
    <SimpleListEntry v-for="d in dataStore.disciplines.filter(d => !d.isOfficial)">
      <div class="flex">
        <span class="flex-grow content-center">{{ d.customName }}</span>
        <div v-if="userStore.hasRole(Const.ROLE_COACH)" class="flex items-center">
          <ButtonIcon
              severity="secondary" icon="pi pi-pencil" :loading="loadingStatesModify.get(d.id)"
              @click="modifyDiscipline(d.id)"/>
          <ButtonIcon
              severity="danger" icon="pi pi-trash" :loading="loadingStatesDelete.get(d.id)"
              @click="deleteDiscipline(d.id, false)"/>
        </div>
      </div>
    </SimpleListEntry>
  </SimpleList>

  <DialogTeamCreate ref="createTeam" @success="loadTeams"/>

  <DialogDisciplineCreate ref="createDiscipline" @success="loadDisciplines"/>

  <ConfirmDialog>
    <template #message>
      <div>
        <p v-html="t('glob.discipline.deleteCaution.content',[selectedDiscipline?.customName])"></p>
        <p class="mt-2">{{ t('glob.discipline.deleteCaution.contentConfirm') }}</p>
        <InputText
            v-model="disciplineConfirmation" class="mt-2 w-full"
            :placeholder="selectedDiscipline?.customName"/>
      </div>
    </template>
  </ConfirmDialog>

</template>

<script setup lang="ts">
import axios, {AxiosError, AxiosResponse} from "axios";
import ConfirmDialog from "primevue/confirmdialog";
import {useConfirm} from "primevue/useconfirm";
import {useToast} from "primevue/usetoast";
import {onMounted, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";

import DialogDisciplineCreate from "@/components/club/DialogDisciplineCreate.vue";
import DialogTeamCreate from "@/components/club/DialogTeamCreate.vue";
import ButtonIcon from "@/coreComponents/button/ButtonIcon.vue";
import SimpleList from "@/coreComponents/list/SimpleList.vue";
import SimpleListEntry from "@/coreComponents/list/SimpleListEntry.vue";
import TitleWithBtnPlus from "@/coreComponents/title/TitleWithBtnPlus.vue";
import {canManageDiscipline, canManageTeam} from "@/plugins/AccessControl";
import Const from "@/plugins/Constants"
import {fromAxiosError} from "@/plugins/ToastWriter";
import {useAuthStore} from "@/stores/auth";
import {useDataStore} from "@/stores/data";
import {useMyUserStore} from "@/stores/user";
import Club from "@/types/Club";
import Discipline from "@/types/Discipline";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import Team from "@/types/Team";

const authStore = useAuthStore()
const userStore = useMyUserStore()
const dataStore = useDataStore()
const toast = useToast()
const confirm = useConfirm()
const {t} = useI18n()

const selectedDiscipline = ref<Discipline>()
const disciplineConfirmation = ref<string>()

const loadingStatesDelete = ref<Map<string, boolean>>(new Map())
const loadingStatesModify = ref<Map<string, boolean>>(new Map())

const modifyDiscipline = (id: string): void => {
  loadingStatesModify.value.set(id, true)
}

const deleteDiscipline = (id: string, force: boolean): void => {
  loadingStatesDelete.value.set(id, true)
  axios.request({
    url: '/disciplines/' + id + (force ? '?force=true' : ''),
    method: 'delete',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    }
  }).then(() => {
    loadDisciplines()
    toast.add({summary: 'Success', life: 2000, severity: "success"})
  }).catch((error: AxiosError<ServerMessage.Error, any>) => {
    if (error.response?.data.subCode == 3000) {
      requestDeleteConfirmation(id)
    } else {
      toast.add(fromAxiosError(error))
      loadingStatesDelete.value.set(id, false)
    }
  })
}

const requestDeleteConfirmation = (id: string): void => {
  selectedDiscipline.value = dataStore.getDisciplineById(id)
  if (!selectedDiscipline.value) return
  confirm.require({
    header: 'Caution!!',
    icon: 'pi pi-trash',
    acceptClass: 'p-button-danger rounded-full',
    acceptLabel: t('glob.discipline.deleteCaution.accept'),
    rejectClass: 'p-button-secondary p-button-outlined rounded-full',
    rejectLabel: t('glob.discipline.deleteCaution.reject'),
    accept: () => {
      if (disciplineConfirmation.value && disciplineConfirmation.value === selectedDiscipline.value?.customName) {
        deleteDiscipline(id, true)
      } else {
        toast.add({severity: 'error', summary: 'Error', detail: t('glob.discipline.deleteCaution.error'), life: 3000})
      }
    },
    reject: () => loadingStatesDelete.value.set(id, false),
  })
}


const disciplineStateObj = reactive<LoadingState>({state: NaN})
const loadDisciplines = (): void => {
  dataStore.updateDisciplines(disciplineStateObj)
}

const teams = ref<Team[]>()
const teamsState = ref<LoadingStates>()
const loadTeams = (): void => {
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
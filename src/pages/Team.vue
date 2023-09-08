<template>
  <h1>{{ team?.name }}&nbsp;</h1>


  <div v-if="canManageTeam() && !editMode" class="grid md:grid-cols-3 grid-cols-2 gap-4">
    <LoadingBtn full outlined visual-type="primary" @click="showAddPart( false)">{{
        $t('page.team.addPart')
      }}
    </LoadingBtn>
    <LoadingBtn full outlined visual-type="primary" @click="showAddPart( true)">{{
        $t('page.team.addCoach')
      }}
    </LoadingBtn>
    <LoadingBtn class="md:col-span-1 col-span-2" full outlined visual-type="error" @click="setSelectable(true)">
      {{ $t('page.team.selectForRemoval') }}
    </LoadingBtn>
  </div>

  <div v-if="canManageTeam() && editMode" class="grid md:grid-cols-2 gap-4">
    <LoadingBtn full outlined visual-type="error" :loading="removeState" @click="removeFromTeam()">{{
        $t('page.team.removePart')
      }}
    </LoadingBtn>
    <LoadingBtn full outlined @click="setSelectable(false)">
      {{ $t('glob.btn.cancel') }}
    </LoadingBtn>
  </div>


  <h2>{{ $t('page.team.title.coaches') }}</h2>
  <SimpleList :state="state">
    <SimpleListEntry v-for="p in participantCoaches" :to="'/athletes/' + p.id" :enabled="!editMode">
      <input v-if="editMode" :id="p.id" v-model="usersToRemove" class="mr-2" :value="p.id" type="checkbox">
      <label class="w-full" :for="p.id">{{ p.lastName }} {{ p.firstName }}</label>
    </SimpleListEntry>
  </SimpleList>

  <h2>{{ $t('page.team.title.athletes') }}</h2>
  <SimpleList :state="state">
    <SimpleListEntry v-for="p in participantAthletes" :to="'/athletes/' + p.id" :enabled="!editMode">
      <input v-if="editMode" :id="p.id" v-model="usersToRemove" class="mr-2" :value="p.id" type="checkbox">
      <label class="w-full" :for="p.id">{{ p.lastName }} {{ p.firstName }}</label>
    </SimpleListEntry>
  </SimpleList>

  <div class="py-5"></div>

  <TitleWithBtnPlus :btn-visible="canManageActivities()" @btn-click="setActivityModalVisibility(true)">
    {{ $t('page.team.activities') }}
  </TitleWithBtnPlus>

  <SimpleTable
      i18n :state="stateActivities"
      :headers="['page.activity.weekday', 'page.activity.startTime', 'page.activity.duration', 'page.activity.startDate', 'page.activity.endDate', 'page.activity.place']">
    <SimpleTableRow v-for="a in activities" clickable @click="$router.push('/activity/' + a.id)">
      <SimpleTableCell>{{ $t('glob.weekday[' + a.weekday + ']') }}</SimpleTableCell>
      <SimpleTableCell>{{ a.startTime }}</SimpleTableCell>
      <SimpleTableCell>{{ a.duration }}</SimpleTableCell>
      <SimpleTableCell>{{ $d(a.startDate) }}</SimpleTableCell>
      <SimpleTableCell>{{ $d(a.endDate) }}</SimpleTableCell>
      <SimpleTableCell>{{ a.place }}</SimpleTableCell>
    </SimpleTableRow>
  </SimpleTable>

  <DialogTeamAddPart
      ref="dialogAddPart" :as-coach="asCoach"
      :athletes="participantAthletes" :coaches="participantCoaches" @success="getParticipants"/>

  <ActivityModal ref="activity" @success="getActivities"/>

</template>

<script setup lang="ts">
import axios, {AxiosError, AxiosResponse} from "axios";
import {useToast} from "primevue/usetoast";
import {onMounted, reactive, ref} from "vue";
import {useRoute} from "vue-router";

import DialogTeamAddPart from "@/components/dialogs/club/DialogTeamAddPart.vue";
import ActivityModal from "@/components/dialogs/nds/DialogActivity.vue";
import {canManageActivities, canManageTeam} from "@/plugins/AccessControl";
import {routeParamToString, sortUser} from "@/plugins/Helper";
import {fromAxiosError} from "@/plugins/ToastWriter";
import {useAuthStore} from "@/stores/auth";
import IntDialog from "@/types/IntDialog";
import {LoadingStates} from "@/types/LoadingStates";
import {Nds} from "@/types/Nds";

import LoadingBtn from "../components/button/LoadingBtn.vue";
import SimpleList from "../components/list/SimpleList.vue";
import SimpleListEntry from "../components/list/SimpleListEntry.vue";
import SimpleTable from "../components/list/SimpleTable.vue";
import SimpleTableCell from "../components/list/SimpleTableCell.vue";
import SimpleTableRow from "../components/list/SimpleTableRow.vue";
import TitleWithBtnPlus from "../components/title/TitleWithBtnPlus.vue";
import Const from "../plugins/Constants"
import LoadingState from "../types/LoadingState";
import Team from "../types/Team";
import User from "../types/User";

// Data loading
const authStore = useAuthStore()
const toast = useToast()
const route = useRoute()

// Manage participant addition dialog visibility
const asCoach = ref<boolean>(false)
const dialogAddPart = ref<IntDialog | null>(null)
const showAddPart = (val: boolean): void => {
  asCoach.value = val;
  dialogAddPart.value?.setVisibility(true)
}

// Manage activity creation dialog visibility
const activity = ref<IntDialog | null>(null)
const setActivityModalVisibility = (visible: boolean): void => {
  activity.value?.setVisibility(visible)
}

// Manage removal of athletes/coaches from the team
const editMode = ref(false)
const usersToRemove = ref<string[]>([])
const removeState = reactive<LoadingState>({state: NaN})
const removeFromTeam = (): void => {
  removeState.state = LoadingStates.Loading
  axios.request({
    url: "/teams/" + routeParamToString(route.params.id) + "/participants",
    method: 'delete',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    },
    data: usersToRemove.value.map(id => {
      return {userId: id}
    })
  }).then(() => {
    removeState.state = LoadingStates.Loaded
    editMode.value = false
    getParticipants()
    usersToRemove.value = []
  }).catch((error: AxiosError) => {
    removeState.state = LoadingStates.Error
    toast.add(fromAxiosError(error))
  })
}


const setSelectable = (selectable: boolean): void => {
  editMode.value = selectable
  usersToRemove.value = []
}


const state = ref<LoadingStates>()
const participantCoaches = ref<User[]>()
const participantAthletes = ref<User[]>()
const getParticipants = (): void => {
  participantAthletes.value = [] as User[]
  participantCoaches.value = [] as User[]
  state.value = LoadingStates.Loading

  axios.request({
    url: "/teams/" + routeParamToString(route.params.id) + "/participants",
    method: 'get',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    }
  }).then((response: AxiosResponse<{ athletes: User[], coaches: User[] }, any>) => {
    state.value = response.data.athletes.length ? LoadingStates.Loaded : LoadingStates.Empty
    participantAthletes.value = response.data.athletes.sort(sortUser)
    participantCoaches.value = response.data.coaches.sort(sortUser)
  }).catch(() => {
    state.value = LoadingStates.Error
  })
}


const stateActivities = ref<LoadingStates>()
const activities = ref<Nds.Activity[]>()
const getActivities = (): void => {
  stateActivities.value = LoadingStates.Loading
  axios.request({
    url: "/nds/activities?teamId=" + routeParamToString(route.params.id),
    method: 'get',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    }
  }).then((response: AxiosResponse<Nds.Activity[], any>) => {
    activities.value = response.data
    stateActivities.value = response.data?.length ? LoadingStates.Loaded : LoadingStates.Empty
  }).catch(() => {
    stateActivities.value = LoadingStates.Error
  })
}

const team = ref<Team>()
onMounted(() => {
  axios.request({
    url: "/teams/" + routeParamToString(route.params.id),
    method: 'get',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    }
  }).then((response: AxiosResponse<Team, any>) => {
    team.value = response.data
  }).catch(() => console.log('error'))

  getActivities()
  getParticipants()
})
</script>

<style scoped>

</style>
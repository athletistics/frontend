<template>
  <h1>{{ $t('page.activity.title.default') }}</h1>

  <div class="white-rounded p-4 space-y-4">
    <div class="grid lg:grid-cols-3 sm:grid-cols-2 gap-4">
      <LabeledText label="page.activity.startDate" :state="stateActivity">{{ $d(activity.startDate) }}</LabeledText>
      <LabeledText label="page.activity.endDate" :state="stateActivity">{{ $d(activity.endDate) }}</LabeledText>
      <LabeledText label="page.activity.weekday" :state="stateActivity">{{
          $t('glob.weekday[' + activity.weekday + ']')
        }}
      </LabeledText>
      <LabeledText label="page.activity.startTime" :state="stateActivity">{{ activity.startTime }}</LabeledText>
      <LabeledText label="page.activity.duration" :state="stateActivity">{{ activity.duration }} min</LabeledText>
      <LabeledText label="page.activity.place" :state="stateActivity">{{ activity.place }}</LabeledText>
    </div>
    <LoadingBtn :loading="stateCSV" full visual-type="primary" @click="getCSVs">{{
        $t('page.activity.export')
      }}
    </LoadingBtn>
  </div>

  <div class="py-5">&nbsp;</div>

  <TitleWithBtnPlus
      :btn-visible="canManageActivityInstances()"
      @btn-click="($refs.instance as any).setVisibility(true)">
    {{ $t('page.activity.title.instances') }}
  </TitleWithBtnPlus>

  <SimpleTable
      :state="stateInstances" i18n
      :headers="['page.activity.date', 'page.activity.startTime', 'page.activity.duration', 'page.activity.type', 'page.activity.place', '']">
    <SimpleTableRow v-for="i in instances" clickable>
      <SimpleTableCell @click="c(i)">{{ i.date ? $d(i.date) : "" }}</SimpleTableCell>
      <SimpleTableCell @click="c(i)">{{ i.startTime }}</SimpleTableCell>
      <SimpleTableCell @click="c(i)">{{ i.duration ? i.duration + ' min' : '' }}</SimpleTableCell>
      <SimpleTableCell @click="c(i)">{{
          $t('data.' + i.ndsActivityType?.i18nName)
        }}
      </SimpleTableCell>
      <SimpleTableCell @click="c(i)">{{ i.place }}</SimpleTableCell>
      <SimpleTableCell class="!py-0">
        <BtnMenu ref="btnMenu">
          <BtnMenuEntry class="text-red-600" @click="deleteInstance(i.id)">Delete</BtnMenuEntry>
        </BtnMenu>
      </SimpleTableCell>
    </SimpleTableRow>
  </SimpleTable>

  <DialogAttendance ref="attendanceDialog" :users="users"/>
  <DialogInstance ref="instance" @success="getInstances"/>

</template>

<script setup lang="ts">
import axios, {AxiosError, AxiosResponse} from "axios";
import {useToast} from "primevue/usetoast";
import {onMounted, reactive, ref} from 'vue'
import {useI18n} from "vue-i18n";
import {useRoute} from "vue-router";

import DialogAttendance from "@/components/nds/DialogAttendance.vue";
import DialogInstance from "@/components/nds/DialogInstance.vue";
import BtnMenu from "@/coreComponents/button/BtnMenu.vue";
import BtnMenuEntry from "@/coreComponents/button/BtnMenuEntry.vue";
import LoadingBtn from "@/coreComponents/button/LoadingBtn.vue";
import LabeledText from "@/coreComponents/LabeledText.vue";
import SimpleTable from "@/coreComponents/list/SimpleTable.vue";
import SimpleTableCell from "@/coreComponents/list/SimpleTableCell.vue";
import SimpleTableRow from "@/coreComponents/list/SimpleTableRow.vue";
import TitleWithBtnPlus from "@/coreComponents/title/TitleWithBtnPlus.vue";
import {canManageActivityInstances} from "@/plugins/AccessControl";
import Const from "@/plugins/Constants";
import {routeParamToString, sortUser} from "@/plugins/Helper";
import {fromAxiosError, successToast} from "@/plugins/ToastWriter";
import {useAuthStore} from "@/stores/auth";
import IntDialog from "@/types/IntDialog";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import {Nds} from "@/types/Nds";
import User from "@/types/User";

const authStore = useAuthStore()
const toast = useToast()
const route = useRoute()
const {t} = useI18n()


const attendanceDialog = ref<IntDialog>()
const c = (i: Nds.ActivityInstance): void => {
  attendanceDialog.value?.setVisibility(true, i)
}


//---------------------------------
// download attendance as csv files
//---------------------------------
const fileName = (suffix: string): string => {
  if (!activity.value) return `Unknown-Activity-${suffix}.csv`
  const teamName = activity.value.team.name.replace(/[^0-9a-zA-Z]/g, '')
  const activityName = t('glob.weekday[' + activity.value.weekday + ']') + activity.value.place.replace(/[^0-9a-zA-Z]/g, '')

  return `${teamName}-Activity-${activityName}-${suffix}.csv`
}

const download = (data: string, fileNameSuffix: string): void => {
  // prepend a BOM so that excel can correctly interpret the charset
  // https://stackoverflow.com/questions/17879198/adding-utf-8-bom-to-string-blob
  const blob = new Blob(["\ufeff", data])
  const href = window.URL.createObjectURL(blob);

  const anchorElement = document.createElement('a');
  anchorElement.href = href;
  anchorElement.download = fileName(fileNameSuffix)

  document.body.appendChild(anchorElement);
  anchorElement.click();

  document.body.removeChild(anchorElement);
  window.URL.revokeObjectURL(href);
}


const stateCSV = reactive<LoadingState>({state: NaN})
const getCSVs = (): void => {
  const routeId = routeParamToString(route.params.id)
  stateCSV.state = LoadingStates.Loading
  axios.request({
    url: "/nds/activities/" + routeId + "/export/users",
    method: 'get', baseURL: Const.API_URL, headers: {'Authorization': 'Bearer ' + authStore.token}
  }).then((response: AxiosResponse<string, any>) => {
    download(response.data, "Persons")
    stateCSV.state = LoadingStates.Loaded
  }).catch(() => stateCSV.state = LoadingStates.Error)

  axios.request({
    url: "/nds/activities/" + routeId + "/export/attendances",
    method: 'get', baseURL: Const.API_URL, headers: {'Authorization': 'Bearer ' + authStore.token}
  }).then((response: AxiosResponse<string, any>) => {
    download(response.data, "Attendances")
    stateCSV.state = LoadingStates.Loaded
  }).catch(() => stateCSV.state = LoadingStates.Error)

  axios.request({
    url: "/nds/activities/" + routeId + "/export/instances",
    method: 'get', baseURL: Const.API_URL, headers: {'Authorization': 'Bearer ' + authStore.token}
  }).then((response: AxiosResponse<string, any>) => {
    download(response.data, "Instances")
    stateCSV.state = LoadingStates.Loaded
  }).catch(() => stateCSV.state = LoadingStates.Error)
}

// -----------------
// load the activity
// -----------------
const activity = ref<Nds.Activity>({} as Nds.Activity)
const stateActivity = ref<LoadingStates>(LoadingStates.Loading)
const getActivity = (): void => {
  stateActivity.value = LoadingStates.Loading
  axios.request({
    url: "/nds/activities/" + routeParamToString(route.params.id),
    method: 'get',
    baseURL: Const.API_URL,
    headers: {'Authorization': 'Bearer ' + authStore.token}
  }).then((response: AxiosResponse<Nds.Activity, any>) => {
    activity.value = response.data
    stateActivity.value = response.data ? LoadingStates.Loaded : LoadingStates.Empty
    getUsers(activity.value.team.id)
  }).catch(() => {
    stateActivity.value = LoadingStates.Error
  })
}

// -------------------
// manage the instance
// -------------------
const instances = ref<Nds.ActivityInstance[]>()
const stateInstances = ref<LoadingStates>(LoadingStates.Loading)

const getInstances = (): void => {
  instances.value = []
  stateInstances.value = LoadingStates.Loading
  axios.request({
    url: "/nds/activities/" + routeParamToString(route.params.id) + "/instances",
    method: 'get',
    baseURL: Const.API_URL,
    headers: {'Authorization': 'Bearer ' + authStore.token}
  }).then((response: AxiosResponse<Nds.ActivityInstance[], any>) => {
    instances.value = response.data
    stateInstances.value = response.data?.length ? LoadingStates.Loaded : LoadingStates.Empty
  }).catch(() => {
    stateInstances.value = LoadingStates.Error
  })
}
const deleteInstance = (id: string): void => {
  axios.request({
    url: "/nds/activities/" + routeParamToString(route.params.id) + "/instances/" + id,
    method: 'delete',
    baseURL: Const.API_URL,
    headers: {'Authorization': 'Bearer ' + authStore.token}
  }).then(() => {
    toast.add(successToast())
    getInstances()
  }).catch((e: AxiosError) => {
    toast.add(fromAxiosError(e))
  })
}


const users = reactive<{ coaches: User[], athletes: User[] }>({coaches: [], athletes: []})
const getUsers = (teamId: string): void => {
  users.athletes = []
  users.coaches = []

  axios.request({
    url: "/teams/" + teamId + "/participants",
    method: 'get',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    }
  }).then((response: AxiosResponse<{ coaches: User[], athletes: User[] }, any>) => {
    users.athletes = response.data.athletes.sort(sortUser)
    users.coaches = response.data.coaches.sort(sortUser)
  }).catch(() => {

  })
}


onMounted(() => {
  getActivity()
  getInstances()
})
</script>

<style scoped>

</style>
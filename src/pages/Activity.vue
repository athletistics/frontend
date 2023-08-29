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

  <TitleWithBtnPlus :btn-visible="canManageActivityInstances()" @btn-click="($refs.instance as any).setVisibility(true)">
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

  <AttendanceModal ref="attendance" :users="users"/>
  <DialogInstance ref="instance" @success="getInstances"/>

</template>

<script lang="ts">
import axios, {AxiosError, AxiosResponse} from "axios";
import {defineComponent} from 'vue'

import BtnMenu from "@/components/button/BtnMenu.vue";
import BtnMenuEntry from "@/components/button/BtnMenuEntry.vue";
import LoadingBtn from "@/components/button/LoadingBtn.vue";
import AttendanceModal from "@/components/dialogs/nds/DialogAttendance.vue";
import DialogInstance from "@/components/dialogs/nds/DialogInstance.vue";
import LabeledText from "@/components/LabeledText.vue";
import SimpleTable from "@/components/list/SimpleTable.vue";
import SimpleTableCell from "@/components/list/SimpleTableCell.vue";
import SimpleTableRow from "@/components/list/SimpleTableRow.vue";
import TitleWithBtnPlus from "@/components/title/TitleWithBtnPlus.vue";
import {canManageActivityInstances} from "@/plugins/AccessControl";
import Const from "@/plugins/Constants";
import {routeParamToString} from "@/plugins/Helper";
import {useAuthStore} from "@/stores/auth";
import {useDataStore} from "@/stores/data";
import {useToastStore} from "@/stores/toast";
import IntDialog from "@/types/IntDialog";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import {Nds} from "@/types/Nds";
import User from "@/types/User";

export default defineComponent({
  name: "Activity",
  components: {
    BtnMenuEntry,
    BtnMenu,
    DialogInstance,
    AttendanceModal,
    LoadingBtn,
    SimpleTableCell,
    SimpleTableRow,
    SimpleTable,
    LabeledText,
    TitleWithBtnPlus
  },
  setup() {
    const dataStore = useDataStore()
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    return {dataStore, authStore, toastStore}
  },
  data() {
    return {
      activity: {} as Nds.Activity,
      users: {} as { coaches: User[], athletes: User[] },
      stateActivity: LoadingStates.Loading as LoadingStates,
      instances: [] as Nds.ActivityInstance[],
      stateInstances: LoadingStates.Loading as LoadingStates,
      stateCSV: {state: NaN} as LoadingState
    }
  },
  mounted() {
    this.getActivity()
    this.getInstances()
  },
  methods: {
    canManageActivityInstances,
    c(i: Nds.ActivityInstance) {
      (this.$refs.attendance as IntDialog).setVisibility(true, i)
    },
    fileName(suffix: string): string {
      const teamName = this.activity.team.name.replace(/[^0-9a-zA-Z]/g, '')
      const activityName = this.$t('glob.weekday[' + this.activity.weekday + ']') + this.activity.place.replace(/[^0-9a-zA-Z]/g, '')

      return `${teamName}-Activity-${activityName}-${suffix}.csv`
    },
    download(data: string, fileNameSuffix: string) {
      // prepend a BOM so that excel can correcly interpret the charset
      // https://stackoverflow.com/questions/17879198/adding-utf-8-bom-to-string-blob
      const blob = new Blob(["\ufeff", data])
      const href = window.URL.createObjectURL(blob);

      const anchorElement = document.createElement('a');
      anchorElement.href = href;
      anchorElement.download = this.fileName(fileNameSuffix)

      document.body.appendChild(anchorElement);
      anchorElement.click();

      document.body.removeChild(anchorElement);
      window.URL.revokeObjectURL(href);
    },
    getCSVs() {
      const routeId = routeParamToString(this.$route.params.id)
      this.stateCSV.state = LoadingStates.Loading
      axios.request({
        url: "/nds/activities/" + routeId + "/export/users",
        method: 'get', baseURL: Const.API_URL, headers: {'Authorization': 'Bearer ' + this.authStore.token}
      }).then((response: AxiosResponse<string, any>) => {
        this.download(response.data, "Persons")
        this.stateCSV.state = LoadingStates.Loaded
      }).catch(() => this.stateCSV.state = LoadingStates.Error)

      axios.request({
        url: "/nds/activities/" + routeId + "/export/attendances",
        method: 'get', baseURL: Const.API_URL, headers: {'Authorization': 'Bearer ' + this.authStore.token}
      }).then((response: AxiosResponse<string, any>) => {
        this.download(response.data, "Attendances")
        this.stateCSV.state = LoadingStates.Loaded
      }).catch(() => this.stateCSV.state = LoadingStates.Error)

      axios.request({
        url: "/nds/activities/" + routeId + "/export/instances",
        method: 'get', baseURL: Const.API_URL, headers: {'Authorization': 'Bearer ' + this.authStore.token}
      }).then((response: AxiosResponse<string, any>) => {
        this.download(response.data, "Instances")
        this.stateCSV.state = LoadingStates.Loaded
      }).catch(() => this.stateCSV.state = LoadingStates.Error)
    },
    getActivity() {
      this.stateActivity = LoadingStates.Loading
      axios.request({
        url: "/nds/activities/" + routeParamToString(this.$route.params.id),
        method: 'get',
        baseURL: Const.API_URL,
        headers: {'Authorization': 'Bearer ' + this.authStore.token}
      }).then((response: AxiosResponse<Nds.Activity, any>) => {
        this.activity = response.data
        this.stateActivity = response.data ? LoadingStates.Loaded : LoadingStates.Empty
        this.getUsers(this.activity.team.id)
      }).catch(() => {
        this.stateActivity = LoadingStates.Error
      })
    },
    getInstances() {
      this.instances = [] as Nds.ActivityInstance[]
      this.stateInstances = LoadingStates.Loading
      axios.request({
        url: "/nds/activities/" + routeParamToString(this.$route.params.id) + "/instances",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {'Authorization': 'Bearer ' + this.authStore.token}
      }).then((response: AxiosResponse<Nds.ActivityInstance[], any>) => {
        this.instances = response.data
        this.stateInstances = response.data?.length ? LoadingStates.Loaded : LoadingStates.Empty
      }).catch(() => {
        this.stateInstances = LoadingStates.Error
      })
    },
    deleteInstance(id: string) {
      axios.request({
        url: "/nds/activities/" + routeParamToString(this.$route.params.id) + "/instances/" + id,
        method: 'delete',
        baseURL: Const.API_URL,
        headers: {'Authorization': 'Bearer ' + this.authStore.token}
      }).then(() => {
        this.toastStore.addSuccessToast()
        this.getInstances()
      }).catch((e: AxiosError) => {
        this.toastStore.addToastFromAxiosError(e)
      })
    },
    getUsers(teamId: string) {
      this.users = {} as { coaches: User[], athletes: User[] }

      axios.request({
        url: "/teams/" + teamId + "/participants",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        }
      }).then((response: AxiosResponse<{coaches: User[], athletes: User[]}, any>) => {
        this.users = response.data
      }).catch(() => {

      })
    }
  }
})
</script>

<style scoped>

</style>
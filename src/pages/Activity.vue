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
    <LoadingBtn full visual-type="primary">{{ $t('page.activity.export') }}</LoadingBtn>
  </div>

  <div class="my-5">&nbsp;</div>

  <TitleWithBtnPlus @btn-click="$refs.instance.setVisibility(true)" :btn-visible="canManageActivityInstances()">
    {{ $t('page.activity.title.instances') }}
  </TitleWithBtnPlus>

  <SimpleTable
      :state="stateInstances" i18n
      :headers="['page.activity.date', 'page.activity.startTime', 'page.activity.duration', 'page.activity.type', 'page.activity.place', '']">
    <SimpleTableRow clickable v-for="i in instances" @click="$refs.attendance.setVisibility(true, i)">
      <SimpleTableCell>{{ i.date ? $d(i.date) : "" }}</SimpleTableCell>
      <SimpleTableCell>{{ i.startTime }}</SimpleTableCell>
      <SimpleTableCell>{{ i.duration }} min</SimpleTableCell>
      <SimpleTableCell>{{ $t('data.' + i.ndsActivityType?.i18nName) }}</SimpleTableCell>
      <SimpleTableCell>{{ i.place }}</SimpleTableCell>
      <SimpleTableCell class="!py-0">
        <button @click.stop="openInstanceContext"
                class="rounded-full hover:bg-slate-100 active:bg-slate-200 h-8 w-8 flex items-center main-transition duration-75">
          <font-awesome-icon icon="fa-ellipsis-vertical" class="mx-auto" size="1x"/>
        </button>
      </SimpleTableCell>
    </SimpleTableRow>
  </SimpleTable>

  <AttendanceModal ref="attendance" :users="dataStore.users"/>
  <InstanceModal ref="instance"/>

</template>

<script lang="ts">
import {defineComponent} from 'vue'
import TitleWithBtnPlus from "../components/title/TitleWithBtnPlus.vue";
import LabeledText from "../components/LabeledText.vue";
import {LoadingStates} from "../types/LoadingStates";
import SimpleTable from "../components/list/SimpleTable.vue";
import SimpleTableRow from "../components/list/SimpleTableRow.vue";
import SimpleTableCell from "../components/list/SimpleTableCell.vue";
import LoadingBtn from "../components/button/LoadingBtn.vue";
import AttendanceModal from "../components/nds/AttendanceModal.vue";
import {useDataStore} from "../stores/data";
import InstanceModal from "../components/nds/InstanceModal.vue";
import axios from "axios";
import Const from "../plugins/Constants";
import {useAuthStore} from "../stores/auth";
import {canManageActivityInstances} from "../plugins/AccessControl";

export default defineComponent({
  name: "Activity",
  components: {
    InstanceModal,
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
    return {dataStore, authStore}
  },
  data() {
    return {
      activity: {} as Nds.Activity,
      stateActivity: LoadingStates.Loading as LoadingStates,
      instances: [] as Nds.ActivityInstance[],
      stateInstances: LoadingStates.Loading as LoadingStates,
    }
  },
  methods: {
    canManageActivityInstances,
    openInstanceContext() {
      console.log("click")
    },
    getActivity() {
      this.stateActivity = LoadingStates.Loading
      axios.request({
        url: "/nds/activities/" + this.$route.params.id,
        method: 'get',
        baseURL: Const.API_URL,
        headers: {'Authorization': 'Bearer ' + this.authStore.token}
      }).then(response => {
        this.activity = response.data
        this.stateActivity = response.data ? LoadingStates.Loaded : LoadingStates.Empty
      }).catch(e => {
        this.stateActivity = LoadingStates.Error
      })
    },
    getInstances() {
      this.stateInstances = LoadingStates.Loading
      axios.request({
        url: "/nds/activities/" + this.$route.params.id + "/instances",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {'Authorization': 'Bearer ' + this.authStore.token}
      }).then(response => {
        this.instances = response.data
        this.stateInstances = response.data?.length ? LoadingStates.Loaded : LoadingStates.Empty
      }).catch(e => {
        this.stateInstances = LoadingStates.Error
      })
    },
    getUsers() {

    }
  },
  mounted() {
    this.getActivity()
    this.getInstances()
  }
})
</script>

<style scoped>

</style>
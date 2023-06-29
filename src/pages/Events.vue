<template>
  <TitleWithBtnPlus :btn-visible="canManageEvents()" @btn-click="setModalVisibility(true)">{{$t('page.event.title')}}</TitleWithBtnPlus>

  <SimpleTable :headers="headers" :i18n="true" :state="state.state">
    <SimpleTableRow v-for="e in dataStore.events" :clickable="true" @click="toEvent(e.id)">
      <SimpleTableCell>{{e.name}}</SimpleTableCell>
      <SimpleTableCell>{{e.place}}</SimpleTableCell>
      <SimpleTableCell>{{$d(new Date(e.date))}}</SimpleTableCell>
      <SimpleTableCell>{{$t('data.' +dataStore.getEventTypeById(e.eventTypeId)?.i18nName)}}</SimpleTableCell>
      <SimpleTableCell>{{ e.isOutdoor ? $t('glob.event.outdoor') : $t('glob.event.indoor')}}</SimpleTableCell>
    </SimpleTableRow>
  </SimpleTable>

  <Modal ref="modal">
    <h3>{{$t('page.event.createTitle')}}</h3>
    <hr>

    <div>
      <label>{{$t('glob.event.name')}}</label>
      <input v-model="newEvent.name" required>
    </div>

    <div>
      <label>{{$t('glob.event.place')}}</label>
      <input v-model="newEvent.place" required>
    </div>

    <div>
      <label>{{$t('glob.event.date')}}</label>
      <input v-model="newEvent.webDate" type="date" required>
    </div>

    <div>
      <label>{{$t('glob.event.type')}}</label>
      <select v-model="newEvent.eventTypeId" required>
        <option v-for="e in dataStore.eventTypes" :value="e.id">{{$t('data.' + e.i18nName)}}</option>
      </select>
    </div>

    <div>
      <label>{{ $t('glob.event.locality') }}</label>
      <select v-model="newEvent.isOutdoor" required>
        <option :value="true">{{ $t('glob.event.outdoor') }}</option>
        <option :value="false">{{ $t('glob.event.indoor') }}</option>
      </select>
    </div>

    <div class="inline-flex">
      <input id="homologated" :value="1" type="checkbox" v-model="homologated">
      <label for="homologated">{{$t('glob.event.homologated')}}</label>
    </div>

    <hr>
    <div class="grid sm:grid-cols-2 gap-4">
      <button type="button" v-on:click="createEvent()" class="btn btn-block btn-primary">{{$t('glob.btn.add')}}</button>
      <button type="button" v-on:click="setModalVisibility(false)" class="btn btn-block">{{$t('glob.btn.cancel')}}</button>
    </div>
  </Modal>
</template>

<script lang="ts">
import Event from "../types/Event"
import {defineComponent} from "vue";
import axios from "axios";
import Const from "../plugins/Constants";
import {useToastStore} from "../stores/toast";
import {useAuthStore} from "../stores/auth";
import Modal from "../components/modals/Modal.vue";
import moment from "moment";
import TitleWithBtnPlus from "../components/title/TitleWithBtnPlus.vue";
import SimpleTable from "../components/list/SimpleTable.vue";
import SimpleTableRow from "../components/list/SimpleTableRow.vue";
import SimpleTableCell from "../components/list/SimpleTableCell.vue";
import {useDataStore} from "../stores/data";
import {LoadingStates} from "../types/LoadingStates";
import {canManageEvents} from "../plugins/AccessControl";
import LoadingState from "../types/LoadingState";

export default defineComponent({
  name: "Events",
  components: {SimpleTableCell, SimpleTableRow, SimpleTable, TitleWithBtnPlus, Modal},
  setup() {
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    const dataStore = useDataStore()

    return {authStore, toastStore, dataStore}
  },
  data() {
    return {
      headers: ['glob.event.name', 'glob.event.place', 'glob.event.date', 'glob.event.type', ''] as string[],
      events: [] as Event[],
      newEvent: {} as Event,
      homologated: [] as number[],
      state: {state: NaN} as LoadingState
    }
  },
  methods: {
    canManageEvents,
    setModalVisibility(visible: boolean) {
      (this.$refs.modal as any).setVisibility(visible)
      this.newEvent = {} as Event
      this.newEvent.isOutdoor = true
    },
    toEvent(id: string){
      this.$router.push("/events/" + id)
    },
    createEvent() {
      this.newEvent.isHomologated = this.homologated.length > 0
      this.newEvent.date = moment(this.newEvent.webDate).format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS) + "Z"

      axios.request({
        url: "/events",
        method: 'post',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        },
        data: this.newEvent
      }).then(() => {
        this.toastStore.addSuccessToast()
        this.dataStore.updateEvents(this.state)
        this.setModalVisibility(false)
      }).catch(error => this.toastStore.addToastFromAxiosError(error))
    },
  }
})

</script>

<style scoped>

</style>
<template>
  <TitleWithBtnPlus :btn-visible="canManageEvents()" @btn-click="setModalVisibility(true)">
    {{ $t('page.event.title') }}
  </TitleWithBtnPlus>

  <SimpleTable :headers="headers" :i18n="true" :state="state.state">
    <SimpleTableRow v-for="e in dataStore.events" :clickable="true" @click="toEvent(e.id)">
      <SimpleTableCell>{{ e.name }}</SimpleTableCell>
      <SimpleTableCell>{{ e.place }}</SimpleTableCell>
      <SimpleTableCell>{{ $d(new Date(e.date)) }}</SimpleTableCell>
      <SimpleTableCell>{{ $t('data.' + dataStore.getEventTypeById(e.eventTypeId)?.i18nName) }}</SimpleTableCell>
      <SimpleTableCell>{{ e.isOutdoor ? $t('glob.event.outdoor') : $t('glob.event.indoor') }}</SimpleTableCell>
    </SimpleTableRow>
  </SimpleTable>

  <Modal ref="modal">
    <form class="space-y-4 with-label">
      <h3>{{ $t('page.event.createTitle') }}</h3>
      <hr>

      <div>
        <label>{{ $t('glob.event.name') }}</label>
        <input v-model="newEvent.name" required>
      </div>

      <div>
        <label>{{ $t('glob.event.place') }}</label>
        <input v-model="newEvent.place" required>
      </div>

      <div>
        <label>{{ $t('glob.event.date') }}</label>
        <input v-model="newEvent.date" type="date" required>
      </div>

      <div>
        <label>{{ $t('glob.event.type') }}</label>
        <select v-model="newEvent.eventTypeId" required>
          <option v-for="e in dataStore.eventTypes" :value="e.id">{{ $t('data.' + e.i18nName) }}</option>
        </select>
      </div>

      <div>
        <label>{{ $t('glob.event.season') }}</label>
        <select v-model="newEvent.isOutdoor" required>
          <option :value="true">{{ $t('glob.event.outdoor') }}</option>
          <option :value="false">{{ $t('glob.event.indoor') }}</option>
        </select>
      </div>

      <div class="inline-flex">
        <input id="homologated" :value="1" type="checkbox" v-model="homologated">
        <label for="homologated">{{ $t('glob.event.homologated') }}</label>
      </div>

      <hr>
      <div class="grid sm:grid-cols-2 gap-4">
        <LoadingBtn full outlined visual-type="primary" :loading="createState" @click="createEvent()">
          {{ $t('glob.btn.add') }}
        </LoadingBtn>
        <LoadingBtn full outlined @click="setModalVisibility(false)">{{ $t('glob.btn.cancel') }}</LoadingBtn>
      </div>
    </form>
  </Modal>
</template>

<script lang="ts">
import axios from "axios";
import {defineComponent} from "vue";

import {useAuthStore} from "@/stores/auth";
import {useDataStore} from "@/stores/data";
import {useToastStore} from "@/stores/toast";

import Event from "@/types/Event"
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import {canManageEvents} from "@/plugins/AccessControl";
import Const from "@/plugins/Constants";

import Modal from "@/components/modals/Modal.vue";
import LoadingBtn from "@/components/button/LoadingBtn.vue";
import SimpleTable from "@/components/list/SimpleTable.vue";
import SimpleTableRow from "@/components/list/SimpleTableRow.vue";
import SimpleTableCell from "@/components/list/SimpleTableCell.vue";
import TitleWithBtnPlus from "@/components/title/TitleWithBtnPlus.vue";

export default defineComponent({
  name: "Events",
  components: {LoadingBtn, SimpleTableCell, SimpleTableRow, SimpleTable, TitleWithBtnPlus, Modal},
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
      state: {state: NaN} as LoadingState,
      createState: {state: NaN} as LoadingState
    }
  },
  methods: {
    canManageEvents,
    setModalVisibility(visible: boolean) {
      (this.$refs.modal as any).setVisibility(visible)
      this.newEvent = {} as Event
      this.newEvent.isOutdoor = true
    },
    toEvent(id: string) {
      this.$router.push("/events/" + id)
    },
    createEvent() {
      this.createState.state = LoadingStates.Loading
      this.newEvent.isHomologated = this.homologated.length > 0

      axios.request({
        url: "/events",
        method: 'post',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        },
        data: this.newEvent
      }).then(() => {
        this.createState.state = LoadingStates.Loaded
        this.toastStore.addSuccessToast()
        this.dataStore.updateEvents(this.state)
        this.setModalVisibility(false)
      }).catch(error => {
        this.createState.state = LoadingStates.Error
        this.toastStore.addToastFromAxiosError(error)
      })
    },
  }
})

</script>

<style scoped>

</style>
<template>
  <TitleWithBtnPlus :btn-visible="canManageEvents()" @btn-click="($refs.dialog as any).setVisibility(true)">
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

  <DialogEventCreate ref="dialog" @success="eventCreated"/>

</template>

<script setup lang="ts">
import {reactive} from "vue";

import {useDataStore} from "@/stores/data";

import LoadingState from "@/types/LoadingState";
import {canManageEvents} from "@/plugins/AccessControl";

import SimpleTable from "@/components/list/SimpleTable.vue";
import SimpleTableRow from "@/components/list/SimpleTableRow.vue";
import SimpleTableCell from "@/components/list/SimpleTableCell.vue";
import TitleWithBtnPlus from "@/components/title/TitleWithBtnPlus.vue";
import DialogEventCreate from "@/components/dialogs/events/DialogEventCreate.vue";
import {useRouter} from "vue-router";

const router = useRouter()
const dataStore = useDataStore()
const headers = ['glob.event.name', 'glob.event.place', 'glob.event.date', 'glob.event.type', '']


const state = reactive<LoadingState>({state: NaN})
const toEvent = (id: string) => {
  router.push("/events/" + id)
}

const eventCreated = () => {
  dataStore.updateEvents(state)
}

</script>

<style scoped>

</style>
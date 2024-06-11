<template>
  <h1>{{ event?.name }}</h1>

  <div class="p-4 white-rounded grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <LabeledText :state="eventState" label="glob.event.name" :text="event?.name"/>
    <LabeledText :state="eventState" label="glob.event.place" :text="event?.place"/>
    <LabeledText :state="eventState" label="glob.event.date" :text="event ? $d(new Date(event.date)) : undefined"/>
    <LabeledText :state="eventState" label="glob.event.type" :text="eventType"/>
    <LabeledText :state="eventState" label="glob.event.homologation" :text="homologation"/>
    <LabeledText :state="eventState" label="glob.event.season" :text="season"/>
  </div>

  <div class="py-5">&nbsp;</div>

  <TitleWithBtnPlus :btn-visible="canManageResults()" @btn-click="setModalVisibility(true)">
    {{ $t('page.results.title') }}
  </TitleWithBtnPlus>

  <ResultTable :results="results" :state="resultsState" :show-event="false" @updated="loadResults"/>

  <Paginator
      :rows="rows" :total-records="records" :rows-per-page-options="[10, 25, 50]"
      class="white-rounded mt-4" :pt="customStyle" @page="loadResults"></Paginator>

  <ModalResult ref="modal" :is-personal="false" :event="event" @created="loadResults"/>
</template>

<script setup lang="ts">
import axios, {AxiosError, AxiosResponse} from "axios";
import {PageState} from "primevue/paginator";
import {computed, onMounted, ref} from 'vue'
import {useI18n} from "vue-i18n";
import {useRoute} from "vue-router";

import ModalResult from "@/components/results/DialogResult.vue";
import ResultTable from "@/components/results/ResultTable.vue";
import LabeledText from "@/coreComponents/LabeledText.vue";
import TitleWithBtnPlus from "@/coreComponents/title/TitleWithBtnPlus.vue";
import {canManageResults} from "@/plugins/AccessControl";
import Const from "@/plugins/Constants";
import {routeParamToString} from "@/plugins/Helper";
import {useAuthStore} from "@/stores/auth";
import {useDataStore} from "@/stores/data";
import {useToastStore} from "@/stores/toast";
import IntDialog from "@/types/IntDialog";
import {LoadingStates} from "@/types/LoadingStates";
import Paginated from "@/types/Paginated";

// DOM references
const modal = ref<IntDialog>()

// stores
const authStore = useAuthStore()
const toastStore = useToastStore()
const dataStore = useDataStore()
const {t} = useI18n()
const route = useRoute()

// pagination
const customStyle = {
  root: {style: {'background-color': 'transparent'}},
  firstPageButton: {class: ['min-w-8', 'h-8']},
  previousPageButton: {class: ['min-w-8', 'h-8']},
  nextPageButton: {class: ['min-w-8', 'h-8']},
  lastPageButton: {class: ['min-w-8', 'h-8']},
  pageButton: {class: ['min-w-8', 'h-8']}
}
const rows = ref<number>(10)
const records = ref<number>(25)

// data
const results = ref<Result.Data[]>([])
const resultsState = ref<LoadingStates>(NaN)

const eventType = computed(() => {
  if (!event.value) return undefined
  const type = dataStore.getEventTypeById(event.value.eventTypeId)
  return type ? t('data.' + type.i18nName) : type
})

const homologation = computed(() => {
  if (!event.value) return undefined
  return event.value.isHomologated ? t('glob.event.homologated') : t('glob.event.notHomologated')
})

const season = computed(() => {
  if (!event.value) return undefined
  return event.value.isOutdoor ? t('glob.event.outdoor') : t('glob.event.indoor')
})

const eventState = computed(() => {
  return event.value ? LoadingStates.Loaded : LoadingStates.Loading
})

const event = computed(() => {
  return dataStore.getEventById(route.params.id.toString())
})

onMounted(() => {
  loadResults()
})

const setModalVisibility = (visible: boolean): void => {
  modal.value?.setVisibility(visible)
}

const loadResults = (e?: PageState): void =>  {
  // prepare pagination parameters
  let suffix = `&page_index=0&page_size=${rows.value}`
  if (e) suffix = `&page_index=${e.page}&page_size=${e.rows}`
  if (e) rows.value = e.rows

  resultsState.value = LoadingStates.Loading
  axios.request({
    url: "/results?eventId=" + routeParamToString(route.params.id) + suffix,
    method: 'get',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    }
  }).then((response: AxiosResponse<Paginated<Result.Data>, any>) => {
    results.value = response.data.data
    resultsState.value = response.data?.data.length ? LoadingStates.Loaded : LoadingStates.Empty

    records.value = response.data.count
  }).catch((response: AxiosError) => {
    resultsState.value = LoadingStates.Error
    toastStore.addToastFromAxiosError(response)
  })
}
</script>

<style scoped>

</style>
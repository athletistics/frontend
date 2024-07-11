<template>
  <TitleWithBtnPlus :btn-visible="canManageResults()" @btn-click="setModalVisibility(true)">
    {{ $t('page.results.title') }}
  </TitleWithBtnPlus>

  <ResultTable :results="results" :state="resultsState" :rows="rows" @updated="loadResults"/>

  <Paginator
      :rows="rows" :total-records="records" :rows-per-page-options="[10, 25, 50]"
      class="white-rounded mt-4" :pt="customStyle" @page="loadResults"></Paginator>

  <DialogResult ref="modal" :is-personal="false" @created="loadResults"/>
</template>

<script setup lang="ts">
import axios, {AxiosError, AxiosResponse} from "axios";
import {PageState} from "primevue/paginator";
import {useToast} from "primevue/usetoast";
import {onMounted, ref} from "vue";

import DialogResult from "@/components/results/DialogResult.vue";
import ResultTable from "@/components/results/ResultTable.vue";
import TitleWithBtnPlus from "@/coreComponents/title/TitleWithBtnPlus.vue";
import {canManageResults} from "@/plugins/AccessControl";
import Const from "@/plugins/Constants";
import {fromAxiosError} from "@/plugins/ToastWriter";
import {useAuthStore} from "@/stores/auth";
import IntDialog from "@/types/IntDialog";
import {LoadingStates} from "@/types/LoadingStates";
import Paginated from "@/types/Paginated";

// constants
const customStyle = {
  root: {style: {'background-color': 'transparent'}},
  firstPageButton: {class: ['min-w-8', 'h-8']},
  previousPageButton: {class: ['min-w-8', 'h-8']},
  nextPageButton: {class: ['min-w-8', 'h-8']},
  lastPageButton: {class: ['min-w-8', 'h-8']},
  pageButton: {class: ['min-w-8', 'h-8']}
}

// page references
const modal = ref<IntDialog>()

// utilities
const authStore = useAuthStore()
const toast = useToast()

// data
const rows = ref<number>(10)
const records = ref<number>(25)
const results = ref<Result.Data[]>([])
const resultsState = ref<LoadingStates>(NaN)

const setModalVisibility = (visible: boolean): void => {
  modal.value?.setVisibility(visible)
}

const loadResults = (event?: PageState): void => {
  // prepare pagination parameters
  let suffix = `?page_index=0&page_size=${rows.value}`
  if (event) suffix = `?page_index=${event.page}&page_size=${event.rows}`
  if (event) rows.value = event.rows

  resultsState.value = LoadingStates.Loading
  axios.request({
    url: "/results" + suffix,
    method: 'get',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    }
  }).then((response: AxiosResponse<Paginated<Result.Data>, any>) => {
    results.value = response.data.data
    resultsState.value = response.data.data ? LoadingStates.Loaded : LoadingStates.Empty

    records.value = response.data.count
  }).catch((response: AxiosError) => {
    resultsState.value = LoadingStates.Error
    toast.add(fromAxiosError(response))
  })
}

onMounted(() => {
  loadResults()
})
</script>

<style scoped>

</style>
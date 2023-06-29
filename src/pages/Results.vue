<template>
  <TitleWithBtnPlus :btn-visible="canManageResults()" @btn-click="setModalVisibility(true)">{{$t('page.results.title')}}</TitleWithBtnPlus>

  <ResultTable :results="results" :state="resultsState"></ResultTable>

  <ModalResult ref="modal" :is-personal="false" @created="loadResults"></ModalResult>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useAuthStore} from "../stores/auth";
import {useToastStore} from "../stores/toast";
import ModalResult from "../components/modals/ModalResult.vue";
import axios from "axios";
import Const from "../plugins/Constants";
import ResultTable from "../components/results/ResultTable.vue";
import {LoadingStates} from "../types/LoadingStates";
import TitleWithBtnPlus from "../components/title/TitleWithBtnPlus.vue";
import {canManageResults} from "../plugins/AccessControl";

export default defineComponent({
  name: "Events",
  components: {TitleWithBtnPlus, ResultTable, ModalResult},
  setup() {
    const authStore = useAuthStore()
    const toastStore = useToastStore()

    return {authStore, toastStore}
  },
  data() {
    return {
      results: [] as Result.Data[],
      resultsState: NaN as LoadingStates
    }
  },
  methods: {
    canManageResults,
    setModalVisibility(visible: boolean) {
      (this.$refs.modal as any).setVisibility(visible)
    },
    loadResults() {
      this.resultsState = LoadingStates.Loading
      axios.request({
        url: "/results",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        }
      }).then(response => {
        this.results = response.data
        this.resultsState = response.data ? LoadingStates.Loaded : LoadingStates.Empty
      }).catch(response => {
        this.resultsState = LoadingStates.Error
        this.toastStore.addToastFromAxiosError(response)
      })
    }
  },
  mounted() {
    this.loadResults()
  }
})
</script>

<style scoped>

</style>
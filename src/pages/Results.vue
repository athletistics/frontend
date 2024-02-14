<template>
  <TitleWithBtnPlus :btn-visible="canManageResults()" @btn-click="setModalVisibility(true)">{{$t('page.results.title')}}</TitleWithBtnPlus>

  <ResultTable :results="results" :state="resultsState" @updated="loadResults"/>

  <DialogResult ref="modal" :is-personal="false" @created="loadResults"/>
</template>

<script lang="ts">
import axios, {AxiosError, AxiosResponse} from "axios";
import {defineComponent} from "vue";

import DialogResult from "@/components/results/DialogResult.vue";
import ResultTable from "@/components/results/ResultTable.vue";
import TitleWithBtnPlus from "@/coreComponents/title/TitleWithBtnPlus.vue";
import {canManageResults} from "@/plugins/AccessControl";
import Const from "@/plugins/Constants";
import {useAuthStore} from "@/stores/auth";
import {useToastStore} from "@/stores/toast";
import IntDialog from "@/types/IntDialog";
import {LoadingStates} from "@/types/LoadingStates";

export default defineComponent({
  name: "Results",
  components: {TitleWithBtnPlus, ResultTable, DialogResult},
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
  mounted() {
    this.loadResults()
  },
  methods: {
    canManageResults,
    setModalVisibility(visible: boolean) {
      (this.$refs.modal as IntDialog).setVisibility(visible)
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
      }).then((response: AxiosResponse<Result.Data[], any>) => {
        this.results = response.data
        this.resultsState = response.data ? LoadingStates.Loaded : LoadingStates.Empty
      }).catch((response: AxiosError) => {
        this.resultsState = LoadingStates.Error
        this.toastStore.addToastFromAxiosError(response)
      })
    }
  }
})
</script>

<style scoped>

</style>
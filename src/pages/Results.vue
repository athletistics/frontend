<template>
  <h1>{{$t('page.results.title')}}</h1>
  <button v-on:click="setModalVisibility(true)" class="btn btn-block btn-primary">{{$t('page.results.btn.create')}}</button>

  <ResultList :results="results" :state="resultsState"></ResultList>

  <ModalResult ref="modal" :is-personal="false" @created="loadResults"></ModalResult>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useAuthStore} from "../stores/auth";
import {useToastStore} from "../stores/toast";
import ModalResult from "../components/modals/ModalResult.vue";
import axios from "axios";
import Const from "../plugins/Constants";
import ResultList from "../components/results/ResultList.vue";
import {LoadingStates} from "../types/LoadingStates";

export default defineComponent({
  name: "Events",
  components: {ResultList, ModalResult},
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
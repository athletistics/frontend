<template>
  <h1>{{ $t('page.me.title.account') }}</h1>

  <p>{{ data }}</p>

  <hr>

  <h1>{{ $t('page.me.title.bestResults') }}</h1>
  <div class="grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
    <ResultCard v-for="b in bests" :result="b" :with-users="false"></ResultCard>
  </div>

  <hr>

  <h1>{{ $t('page.me.title.results') }}</h1>
  <button v-on:click="setModalVisibility(true)" class="btn btn-block btn-primary">
    {{ $t('page.me.btn.createTrainingResult') }}
  </button>
  <ResultList :results="results" :show-user="false" :state="resultsState"></ResultList>


  <ModalResult ref="modal"></ModalResult>

</template>

<script lang="ts">
import {defineComponent} from "vue";
import axios from "axios";
import Const from "../plugins/Constants.ts";
import {useAuthStore} from "../stores/auth.ts";
import {useToastStore} from "../stores/toast.ts";
import {useDataStore} from "../stores/data.ts";
import ModalResult from "../components/modals/ModalResult.vue";
import ResultCard from "../components/results/ResultCard.vue";
import ResultList from "../components/results/ResultList.vue";
import {LoadingStates} from "../types/LoadingStates.ts";

export default defineComponent({
  name: "Me",
  components: {ResultList, ModalResult, ResultCard},
  setup() {
    const authStore = useAuthStore()
    const dataStore = useDataStore()
    const toastStore = useToastStore()

    return {authStore, toastStore, dataStore}
  },
  data() {
    return {
      data: {},
      bests: [] as Result.Data[],
      results: [] as Result.Data[],
      resultsState: {} as LoadingStates
    }
  },
  methods: {
    setModalVisibility(visible: boolean) {
      (this.$refs.modal as any).setVisibility(visible)
    },
    getResults() {
      this.resultsState = LoadingStates.Loading
      axios.request({
        url: "/me/results",
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
    },
    getBests() {
      axios.request({
        url: "/me/results/best",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        }
      }).then(response => {
        this.bests = response.data
      }).catch(response => this.toastStore.addToastFromAxiosError(response))
    }
  },
  mounted() {
    if (!this.authStore.token) {
      this.$router.push('/')
    }

    this.getBests()
    this.getResults()

    axios.request({
      url: "/me",
      method: 'get',
      baseURL: Const.API_URL,
      headers: {
        'Authorization': 'Bearer ' + this.authStore.token
      }
    }).then(response => {
      this.data = response.data
    }).catch(response => this.toastStore.addToastFromAxiosError(response))
  }
})
</script>

<style scoped>

</style>
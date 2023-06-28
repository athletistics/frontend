<template>
  <h1>{{ $t(`page.${pref}.title.account`) }}</h1>

  <p>{{ data }}</p>

  <hr>

  <h1>{{ $t(`page.${pref}.title.bestResults`) }}</h1>
  <div class="grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
    <ResultCard v-for="b in bests" :result="b" :with-users="false"></ResultCard>
  </div>

  <hr>

  <ResultEvolution/>

  <hr>

  <h1>{{ $t(`page.${pref}.title.results`) }}</h1>
  <button v-on:click="setModalVisibility(true)" class="btn btn-block btn-primary">
    {{ $t(`page.${pref}.btn.createTrainingResult`) }}
  </button>
  <ResultList :results="results" :show-user="false" :state="resultsState"></ResultList>


  <ModalResult ref="modal" :is-personal="isMe"></ModalResult>

</template>

<script lang="ts">
import {defineComponent} from "vue";
import axios from "axios";
import Const from "../plugins/Constants";
import {useAuthStore} from "../stores/auth";
import {useToastStore} from "../stores/toast";
import {useDataStore} from "../stores/data";
import ModalResult from "../components/modals/ModalResult.vue";
import ResultCard from "../components/results/ResultCard.vue";
import ResultList from "../components/results/ResultList.vue";
import {LoadingStates} from "../types/LoadingStates";
import ResultEvolution from "../components/results/ResultEvolution.vue";

export default defineComponent({
  name: "Athlete",
  components: {ResultEvolution, ResultList, ModalResult, ResultCard},
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
      resultsState: NaN as LoadingStates
    }
  },
  computed: {
    pref() {
      return this.$route.params.id ? 'user' : 'me'
    },
    isMe() {
      return !this.$route.params.id
    },
    userId() {
      return this.$route.params.id
    }
  },
  methods: {
    setModalVisibility(visible: boolean) {
      (this.$refs.modal as any).setVisibility(visible)
    },
    getResults() {
      const url = this.isMe ? "/me/results" : `/results?userId=${this.userId}`

      this.resultsState = LoadingStates.Loading
      axios.request({
        url,
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
      const url = this.isMe ? "/me/results/best" : `/results/best?userId=${this.userId}`

      axios.request({
        url,
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        }
      }).then(response => {
        this.bests = response.data
      }).catch(response => this.toastStore.addToastFromAxiosError(response))
    },
    getUser() {
      const url = this.isMe ? "/me" : `/users/${this.userId}`

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
  },
  mounted() {
    if (!this.authStore.token) {
      this.$router.push('/')
    }

    this.getBests()
    this.getResults()
    this.getUser()
  }
})
</script>

<style scoped>

</style>
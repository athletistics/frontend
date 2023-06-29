<template>
  <h1>{{ $t(`page.${pref}.title.account`) }}</h1>

  <div class="p-4 white-rounded grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <LabeledText :state="dataState" label="glob.user.firstName" :text="data.firstName"/>
    <LabeledText :state="dataState" label="glob.user.lastName" :text="data.lastName"/>
    <LabeledText :state="dataState" label="glob.user.birthdate"
                 :text="data.birthDate ? $d(new Date(data.birthDate)) : undefined"/>
    <LabeledText :state="dataState" label="glob.user.prefLang"
                 :text="dataStore.getLanguageById(data.languageId)?.short"/>
    <LabeledText :state="dataState" label="glob.user.gender" :text="$t('data.gender['+(data.genderId-1)+']')"/>
    <LabeledText :state="dataState" label="glob.user.oasi" :text="data.oasi"/>
    <LabeledText :state="dataState" label="glob.user.address" :text="data.address"/>
    <LabeledText :state="dataState" label="glob.user.place" :text="`${data.place?.postCode} ${data.place?.place}`"/>
    <LabeledText :state="dataState" label="glob.user.state" :text="data.place?.state?.name"/>
    <LabeledText :state="dataState" label="glob.user.country" :text="data.place?.state?.country?.name"/>
    <LabeledText :state="dataState" label="glob.user.primaryMail" :text="data.primaryMail"/>
    <LabeledText :state="dataState" label="glob.user.primaryPhone" :text="data.primaryPhone"/>
    <LabeledText :state="dataState" label="glob.user.nationality" :text="data.nationality?.name"/>
  </div>

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
import ResultList from "../components/results/ResultTable.vue";
import {LoadingStates} from "../types/LoadingStates";
import ResultEvolution from "../components/results/ResultEvolution.vue";
import User from "../types/User";
import LabeledText from "../components/LabeledText.vue";

export default defineComponent({
  name: "Athlete",
  components: {LabeledText, ResultEvolution, ResultList, ModalResult, ResultCard},
  setup() {
    const authStore = useAuthStore()
    const dataStore = useDataStore()
    const toastStore = useToastStore()

    return {authStore, toastStore, dataStore}
  },
  data() {
    return {
      data: {} as User,
      dataState: NaN as LoadingStates,
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
      this.dataState = LoadingStates.Loading

      axios.request({
        url,
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        }
      }).then(response => {
        this.data = response.data
        this.dataState = LoadingStates.Loaded
      }).catch(response => {
        this.toastStore.addToastFromAxiosError(response)
        this.dataState = LoadingStates.Error
      })
    }
  },
  mounted() {
    if (!this.authStore.token) {
      // this.$router.push('/')
    }

    this.getBests()
    this.getResults()
    this.getUser()
  }
})
</script>

<style scoped>

</style>
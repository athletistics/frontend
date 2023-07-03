<template>
  <h1 v-if="resultsState!==LoadingStates.Loaded || pref ==  'me'">{{ $t(`page.${pref}.title.account`) }}</h1>
  <h1 v-else>{{ data.firstName }} {{ data.lastName }}</h1>

  <div class="p-4 white-rounded grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <LabeledText :state="dataState" label="glob.user.firstName" :text="data.firstName"/>
    <LabeledText :state="dataState" label="glob.user.lastName" :text="data.lastName"/>
    <LabeledText :state="dataState" label="glob.user.birthdate"
                 :text="data.birthDate ? $d(new Date(data.birthDate)) : undefined"/>
    <LabeledText :state="dataState" label="glob.user.prefLang"
                 :text="dataStore.getLanguageById(data.languageId)?.short"/>
    <LabeledText :state="dataState" label="glob.user.gender"
                 :text="data.genderId ? $t('data.gender['+(data.genderId-1)+']') : undefined"/>
    <LabeledText :state="dataState" label="glob.user.oasi" :text="data.oasi"/>
    <LabeledText :state="dataState" label="glob.user.address" :text="data.address"/>
    <LabeledText :state="dataState" label="glob.user.city" :text="`${data.postCode} ${data.city}`"/>
    <LabeledText :state="dataState" label="glob.user.country" :text="data.country?.name"/>
    <LabeledText :state="dataState" label="glob.user.primaryMail">
      <a :href="'mailto:' + data.primaryMail">{{ data.primaryMail }}</a>
    </LabeledText>
    <LabeledText :state="dataState" label="glob.user.primaryPhone">
      <a :href="'tel:'+data.primaryPhone">{{ data.primaryPhone }}</a>
    </LabeledText>
    <LabeledText :state="dataState" label="glob.user.nationality" :text="data.nationality?.name"/>
  </div>

  <div v-if="bests?.length">
    <div class="my-5">&nbsp;</div>

    <h1>{{ $t(`page.${pref}.title.bestResults`) }}</h1>
    <div class="grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
      <ResultCard v-for="b in bests" :result="b" :with-users="false"></ResultCard>
    </div>
  </div>

  <div class="my-5">&nbsp;</div>
  <ResultEvolution ref="evolutionChart"/>

  <div class="my-5">&nbsp;</div>
  <ResultLimitComparison :results="bests" />

  <div class="my-5">&nbsp;</div>
  <TitleWithBtnPlus @btn-click="setModalVisibility(true)" :btn-visible="canManageResults() || !$route.params.id">
    {{ $t(`page.${pref}.title.results`) }}
  </TitleWithBtnPlus>

  <ResultList :results="results" :show-user="false" :state="resultsState"></ResultList>

  <ModalResult ref="modal" :is-personal="isMe" :user="data"></ModalResult>

</template>

<script lang="ts">
import {defineComponent} from "vue";
import axios from "axios";
import User from "../types/User";
import Const from "../plugins/Constants";
import {useAuthStore} from "../stores/auth";
import {useDataStore} from "../stores/data";
import {useToastStore} from "../stores/toast";
import {LoadingStates} from "../types/LoadingStates";

import LabeledText from "../components/LabeledText.vue";
import ResultCard from "../components/results/ResultCard.vue";
import ModalResult from "../components/modals/ModalResult.vue";
import ResultList from "../components/results/ResultTable.vue";
import ResultEvolution from "../components/results/ResultEvolution.vue";
import TitleWithBtnPlus from "../components/title/TitleWithBtnPlus.vue";
import {canManageResults} from "../plugins/AccessControl";
import ResultLimitComparison from "../components/results/ResultLimitComparison.vue";

export default defineComponent({
  name: "Athlete",
  components: {
    ResultLimitComparison,
    TitleWithBtnPlus, LabeledText, ResultEvolution, ResultList, ModalResult, ResultCard},
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
    LoadingStates() {
      return LoadingStates
    },
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
    canManageResults,
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
        this.resultsState = response.data?.length ? LoadingStates.Loaded : LoadingStates.Empty
        if (!response.data?.length) return

        this.results = response.data

        // load data into evolution chart, whith user's name as a label
        const name = response.data[0]?.userLastName + " " + response.data[0]?.userFirstName
        const chart = this.$refs.evolutionChart as typeof ResultEvolution

        chart.dataMap.set(name, response.data)
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
    },
    loadData() {
      this.getBests()
      this.getResults()
      this.getUser()
    }
  },
  watch: {
    "$route.params.id"(val) {
      (this.$refs.evolutionChart as any).resetData()
      this.loadData()
    }
  },
  mounted() {
    this.loadData()
  }
})
</script>

<style scoped>

</style>
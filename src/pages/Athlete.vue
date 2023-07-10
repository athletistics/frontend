<template>
  <h1 v-if="resultsState!==LoadingStates.Loaded || pref ==  'me'">{{ $t(`page.${pref}.title.account`) }}</h1>
  <h1 v-else>{{ data.firstName }} {{ data.lastName }}</h1>

  <div class="white-rounded divide-y">
    <div class="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      <LabeledText :state="dataState" label="glob.user.loginState">{{ $t('glob.user.state.' + data.userState) }}
      </LabeledText>
      <LoadingBtn v-if="data.id && !data.withLogin" disabled>{{ $t("page.user.createLogin") }}</LoadingBtn>
      <LoadingBtn v-if="data.userState==USER_STATE_INITIAL" disabled>{{ $t("page.user.sendInit") }}</LoadingBtn>


      <LoadingBtn v-if="isMe && !userStore.hasStravaToken" style="background-color: #FC4C02" class="!p-0"
                  @click="redirectToStrava" :loading="stravaState">
        <img src="../assets/strava/btn_strava_connectwith_orange.svg" class="inline">
      </LoadingBtn>
      <LabeledText v-if="isMe && userStore.hasStravaToken" :state="dataState" label="page.user.strava">
        {{ $t('page.user.stravaActive') }}, <a @click="revokeStrava" class="cursor-pointer"
                                               style="color: #FC4C02">{{ $t('page.user.disconnectStrava') }}</a>
      </LabeledText>
    </div>

    <div class="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3" v-if="authStore.is2FaOk">
      <LoadingBtn v-if="canManageUsers() && externalIds.length < dataStore.externalIdTypes.length"
                  @click="setExternalIdModalVisibility(true)">{{ $t('page.user.addExternalId') }}
      </LoadingBtn>
      <LabeledText v-for="e in externalIds" i18n
                   :label="'data.' + dataStore.getExternalIdTypeById(e.externalIdTypeId)?.i18nName">{{ e.externalId }}
      </LabeledText>
    </div>
  </div>

  <div v-if="bests?.length">
    <div class="py-5">&nbsp;</div>

    <h1>{{ $t(`page.${pref}.title.bestResults`) }}</h1>
    <div class="grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
      <ResultCard v-for="b in bests" :result="b" :with-users="false"></ResultCard>
    </div>
  </div>

  <ResultEvolution ref="evolutionChart"/>

  <ResultLimitComparison :results="bests"/>

  <div class="py-5">&nbsp;</div>
  <TitleWithBtnPlus @btn-click="setModalVisibility(true)" :btn-visible="canManageResults() || !$route.params.id">
    {{ $t(`page.${pref}.title.results`) }}
  </TitleWithBtnPlus>

  <ResultList :results="results" :show-user="false" :state="resultsState"></ResultList>

  <ModalResult ref="modal" :is-personal="isMe" :user="data"></ModalResult>
  <ExternalIdModal :internal-id="userId" :existing-ids="externalIds" @created="getExternalIds()" ref="externalIdModal"/>

</template>

<script lang="ts">
import {defineComponent} from "vue";
import axios from "axios";
import User, {USER_STATE_INITIAL,} from "../types/User";
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
import {canManageResults, canManageUsers} from "../plugins/AccessControl";
import ResultLimitComparison from "../components/results/ResultLimitComparison.vue";
import LoadingBtn from "../components/button/LoadingBtn.vue";
import {useMyUserStore} from "../stores/user";
import ExternalIdModal from "../components/user/ExternalIdModal.vue";
import Const from '../plugins/Constants'
import LoadingState from "../types/LoadingState";

export default defineComponent({
  name: "Athlete",
  components: {
    ExternalIdModal,
    LoadingBtn,
    ResultLimitComparison,
    TitleWithBtnPlus, LabeledText, ResultEvolution, ResultList, ModalResult, ResultCard
  },
  setup() {
    const authStore = useAuthStore()
    const dataStore = useDataStore()
    const toastStore = useToastStore()
    const userStore = useMyUserStore()
    const stravaConnectLink = `${Const.STRAVA_AUTHORIZE}?client_id=${Const.STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${Const.STRAVA_REDIRECT}/me?${Const.STRAVA_REDIRECT_QUERY}`

    return {authStore, toastStore, dataStore, userStore, USER_STATE_INITIAL, stravaConnectLink}
  },
  data() {
    return {
      data: {} as User,
      dataState: NaN as LoadingStates,
      stravaState: {state: NaN} as LoadingState,
      bests: [] as Result.Data[],
      results: [] as Result.Data[],
      resultsState: NaN as LoadingStates,
      externalIds: [] as ExternalId.Id[]
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
    userId(): string {
      if (this.isMe) return this.userStore.user.id
      return typeof this.$route.params.id === 'string' ? this.$route.params.id : this.$route.params.id.join('')
    }
  },
  methods: {
    canManageUsers,
    canManageResults,
    setModalVisibility(visible: boolean) {
      (this.$refs.modal as any).setVisibility(visible)
    },
    setExternalIdModalVisibility(visible: boolean) {
      (this.$refs.externalIdModal as any).setVisibility(visible)
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
      this.data = {} as User

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
    getExternalIds() {
      if (!this.authStore.is2FaOk) return

      axios.request({
        url: `/externalId/user?internalId=${this.userId}`,
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        }
      }).then(response => {
        this.externalIds = response.data
      }).catch(response => this.toastStore.addToastFromAxiosError(response))
    },
    redirectToStrava() {
      window.open(this.stravaConnectLink, '_self')
    },
    connectStrava() {
      if (this.$route.query.error) {
        this.toastStore.addErrorToast("Access to Strava denied")
      }
      if (!this.$route.query.code) return

      this.stravaState.state = LoadingStates.Loading
      axios.request({
        url: '?code=' + this.$route.query.code, method: 'post', baseURL: Const.STRAVA_API_URL,
        headers: {'Authorization': 'Bearer ' + this.authStore.token}
      }).then(() => {
        this.stravaState.state = LoadingStates.Loaded
        this.userStore.updateStrava()
        this.toastStore.addSuccessToast()
        this.$router.push('/me') // reset query params
      }).catch(error => {
        this.stravaState.state = LoadingStates.Error
        this.toastStore.addToastFromAxiosError(error)
        this.$router.push('/me') // reset query params
      })
    },
    revokeStrava() {
      axios.request({
        url: `/`,
        method: 'delete',
        baseURL: Const.STRAVA_API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        }
      })
          .then(response => {
            this.userStore.updateStrava()
            this.toastStore.addSuccessToast()
          })
          .catch(response => this.toastStore.addToastFromAxiosError(response))
    },
    loadData() {
      this.getBests()
      this.getResults()
      this.getUser()
      this.getExternalIds()
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
    this.connectStrava()
  }
})
</script>

<style scoped>

</style>
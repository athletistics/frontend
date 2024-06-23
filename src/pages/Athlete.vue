<template>
  <h1 v-if="dataState!==LoadingStates.Loaded || pref ==  'me'">{{ $t(`page.${pref}.title.account`) }}</h1>
  <TitleWithContextBtn v-else :btn-visible="canManageUsers()" :items="actions">
    {{ data.firstName }} {{ data.lastName }}
  </TitleWithContextBtn>

  <div class="white-rounded divide-y">
    <div class="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <LabeledText :state="dataState" label="glob.user.firstName" :text="data.firstName"/>
      <LabeledText :state="dataState" label="glob.user.lastName" :text="data.lastName"/>
      <LabeledText
          :state="dataState" label="glob.user.birthdate"
          :text="data.birthDate ? $d(new Date(data.birthDate)) : undefined"/>
      <LabeledText
          :state="dataState" label="glob.user.prefLang"
          :text="dataStore.getLanguageById(data.languageId)?.short"/>
      <LabeledText
          :state="dataState" label="glob.user.gender"
          :text="data.genderId ? $t('data.gender['+(data.genderId-1)+']') : undefined"/>
      <LabeledText :state="dataState" label="glob.user.oasi" :text="data.oasi"/>
      <LabeledText :state="dataState" label="glob.user.address" :text="`${data.address} ${data.houseNumber}`"/>
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

      <!-- Strava connection -->
      <UserCreateShare v-if="canManageUsers()" :user="userId"/>
      <LabeledText v-if="isMe && userStore.hasStravaToken" :state="dataState" label="page.user.strava">
        {{ $t('page.user.stravaActive') }}, <a
          class="cursor-pointer" style="color: #FC4C02"
          @click="revokeStrava">{{ $t('page.user.disconnectStrava') }}</a>
      </LabeledText>
      <LoadingBtn
          v-if="isMe && !userStore.hasStravaToken" style="background-color: #FC4C02" class="!p-0"
          :loading="stravaState" @click="redirectToStrava">
        <img src="../assets/strava/btn_strava_connectwith_orange.svg" class="inline">
      </LoadingBtn>
    </div>

    <!-- External IDs -->
    <div v-if="externalIds?.length" class="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <LabeledText
          v-for="e in externalIds" i18n
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

  <div class="flex items-center">
    <h1 class="grow">{{ $t(`page.${pref}.title.results`) }}</h1>
    <BtnResultImport
        v-if="isMe && userStore.hasStravaToken" class="mr-2"
        @click="setResultImportModalVisibility(true)"/>
    <BtnPlus v-if="canManageResults() || !route.params.id" @click="setModalVisibility(true)"/>
  </div>

  <ResultList :results="visibleResults" :show-user="false" :state="resultsState" :rows="rows" @updated="getResults"/>
  <Paginator
      :rows="rows" :total-records="resultRecords" :rows-per-page-options="[10, 25, 50]"
      class="white-rounded mt-4" :pt="customStyle" @page="updatePageState"></Paginator>

  <ModalResult ref="dialogResult" :is-personal="isMe" :user="data" @created="getResults"></ModalResult>
  <DialogCreateExternalId
      ref="dialogExternalId" :internal-id="userId" :existing-ids="externalIds"
      @success="getExternalIds()"/>
  <DialogResultImport ref="dialogImport" @success="getResults"/>

  <DialogUserCreate ref="dialogEditAthlete" :user-to-edit="data" @success="getUser"/>

</template>

<script setup lang="ts">
import axios, {AxiosError, AxiosResponse} from "axios";
import {MenuItem} from "primevue/menuitem";
import {PageState} from "primevue/paginator";
import {useToast} from "primevue/usetoast";
import {computed, onMounted, reactive, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";

import ModalResult from "@/components/results/DialogResult.vue";
import DialogResultImport from "@/components/results/DialogResultImport.vue";
import ResultCard from "@/components/results/ResultCard.vue";
import ResultEvolution from "@/components/results/ResultEvolution.vue";
import ResultLimitComparison from "@/components/results/ResultLimitComparison.vue";
import ResultList from "@/components/results/ResultTable.vue";
import DialogCreateExternalId from "@/components/user/DialogAddExternalId.vue";
import DialogUserCreate from "@/components/user/DialogUserCreate.vue";
import UserCreateShare from "@/components/user/UserCreateShare.vue";
import BtnPlus from "@/coreComponents/button/BtnPlus.vue";
import BtnResultImport from "@/coreComponents/button/BtnResultImport.vue";
import LoadingBtn from "@/coreComponents/button/LoadingBtn.vue";
import LabeledText from "@/coreComponents/LabeledText.vue";
import TitleWithContextBtn from "@/coreComponents/title/TitleWithContextBtn.vue";
import {canManageResults, canManageUsers} from "@/plugins/AccessControl";
import Const from '@/plugins/Constants'
import {routeParamToString, routeQueryToString} from "@/plugins/Helper";
import {fromAxiosError, fromErrorMessage, notImplemented, successToast} from "@/plugins/ToastWriter";
import {useAuthStore} from "@/stores/auth";
import {useDataStore} from "@/stores/data";
import {useMyUserStore} from "@/stores/user";
import {ExternalId} from "@/types/ExternalId";
import IntDialog from "@/types/IntDialog";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import Paginated from "@/types/Paginated";
import User, {USER_STATE_INITIAL,} from "@/types/User";

const route = useRoute()
const router = useRouter()
const {t} = useI18n()
const authStore = useAuthStore()
const dataStore = useDataStore()
const userStore = useMyUserStore()
const toast = useToast()
const stravaConnectLink = `${Const.STRAVA_AUTHORIZE}?client_id=${Const.STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${Const.STRAVA_REDIRECT}/me?${Const.STRAVA_REDIRECT_QUERY}`

const data = ref<User>({} as User)
const dataState = ref<LoadingStates>(NaN)
const stravaState = reactive<LoadingState>({state: NaN})
const bests = ref<Result.Data[]>([])
const results = ref<Result.Data[]>([])
const visibleResults = ref<Result.Data[]>([])
const resultsState = ref<LoadingStates>(NaN)
const externalIds = ref<ExternalId.Id[]>([])

const pref = computed(() => route.params.id ? 'user' : 'me')
const isMe = computed(() => !route.params.id)
const userId = computed((): string => {
  if (isMe.value) return userStore.user.id
  return routeParamToString(route.params.id)
})

// ------------------
// Results pagination
// ------------------
const customStyle = {
  root: {style: {'background-color': 'transparent'}},
  firstPageButton: {class: ['min-w-8', 'h-8']},
  previousPageButton: {class: ['min-w-8', 'h-8']},
  nextPageButton: {class: ['min-w-8', 'h-8']},
  lastPageButton: {class: ['min-w-8', 'h-8']},
  pageButton: {class: ['min-w-8', 'h-8']}
}
const rows = ref<number>(10)
const resultRecords = ref<number>(25)
const pageState = ref<PageState>()

const updatePageState = (event: PageState): void => {
  pageState.value = event
  rows.value = pageState.value.rows
  updateResults()
}

const updateResults = (): void => {
  const page = pageState.value?.page ?? 0

  visibleResults.value = []
  for(let i = 0; i < rows.value; i++) {
    if(rows.value * page + i < resultRecords.value){
      visibleResults.value.push(results.value[rows.value * page + i])
    }
  }
}

// ---------------
// Athlete actions
// ---------------
const actions = computed((): MenuItem[] => {
  const items: MenuItem[] = []
  let addSep = false

  items.push({label: 'Edit', icon: 'pi pi-pencil', command: editAthlete})
  items.push({separator: true})

  if (userStore.user.clubId === data.value.clubId && canManageUsers()) {
    if (externalIds.value.length < dataStore.externalIdTypes.length) {
      addSep = true
      items.push({label: t('page.user.addExternalId'), command: () => setExternalIdModalVisibility(true)})
    }

    if (data.value.userState == USER_STATE_INITIAL) {
      addSep = true
      items.push({label: t('page.user.sendInit'), command: sendLoginInitEmail})
    }
    if (data.value.id && !data.value.withLogin && data.value.primaryMail) {
      addSep = true
      items.push({label: t("page.user.createLogin"), command: createLogin})
    }
  }

  if (addSep) items.push({separator: true})
  items.push({label: 'Delete', icon: 'pi pi-trash', class: 'danger', command: deleteAthlete})

  return items
})

const dialogEditAthlete = ref<IntDialog>()
const editAthlete = (): void => void dialogEditAthlete.value?.setVisibility(true)
const deleteAthlete = (): void => toast.add(notImplemented('delete athlete'))
const createLogin = (): void => {
  axios.request({
    url: `/users/${userId.value}/create-login`,
    method: 'post',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    }
  }).then(() => {
    toast.add(successToast('login created'))
  }).catch((response: AxiosError) => {
    resultsState.value = LoadingStates.Error
    toast.add(fromAxiosError(response))
  })
}

const sendLoginInitEmail = (): void => toast.add(notImplemented('send init email'))

// ----------------------------
// Dialog visibility management
// ----------------------------
const dialogResult = ref<IntDialog>()
const dialogExternalId = ref<IntDialog>()
const dialogImport = ref<IntDialog>()
const setModalVisibility = (visible: boolean): void => {
  dialogResult.value?.setVisibility(visible)
}
const setExternalIdModalVisibility = (visible: boolean): void => {
  dialogExternalId.value?.setVisibility(visible)
}
const setResultImportModalVisibility = (visible: boolean): void => {
  dialogImport.value?.setVisibility(visible)
}

// ----------------
// API interactions
// ----------------

const evolutionChart = ref<{ resetData: Function, dataMap: Map<string, Result.Data[]> }>()
const getResults = (): void => {
  const url = isMe.value ? "/me/results" : `/results?userId=${userId.value}&page_size=99999`

  resultsState.value = LoadingStates.Loading
  axios.request({
    url,
    method: 'get',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    }
  }).then((response: AxiosResponse<Paginated<Result.Data>, any>) => {
    resultsState.value = response.data?.data.length ? LoadingStates.Loaded : LoadingStates.Empty
    if (!response.data?.data.length) return

    results.value = response.data.data
    resultRecords.value = response.data.count
    updateResults()

    // load data into evolution chart, whith user's name as a label
    const name = response.data.data[0]?.userLastName + " " + response.data.data[0]?.userFirstName
    evolutionChart.value?.dataMap.set(name, response.data.data)
  }).catch((response: AxiosError) => {
    resultsState.value = LoadingStates.Error
    toast.add(fromAxiosError(response))
  })
}
const getBests = (): void => {
  const url = isMe.value ? "/me/results/best" : `/results/best?userId=${userId.value}`

  axios.request({
    url,
    method: 'get',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    }
  }).then((response: AxiosResponse<Result.Data[], any>) => {
    bests.value = response.data
  }).catch((response: AxiosError) => toast.add(fromAxiosError(response)))
}

const getUser = (): void => {
  const url = isMe.value ? "/me" : `/users/${userId.value}`
  dataState.value = LoadingStates.Loading
  data.value = {} as User

  axios.request({
    url,
    method: 'get',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    }
  }).then((response: AxiosResponse<User, any>) => {
    data.value = response.data
    data.value.birthDateObj = new Date(data.value.birthDate)
    dataState.value = LoadingStates.Loaded
  }).catch((response: AxiosError) => {
    toast.add(fromAxiosError(response))
    dataState.value = LoadingStates.Error
  })
}

const getExternalIds = (): void => {
  if (!authStore.is2FaOk) return

  axios.request({
    url: `/externalId/user?internalId=${userId.value}`,
    method: 'get',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    }
  }).then((response: AxiosResponse<ExternalId.Id[], any>) => {
    externalIds.value = response.data
  }).catch((response: AxiosError) => toast.add(fromAxiosError(response)))
}

const redirectToStrava = (): void => {
  window.open(stravaConnectLink, '_self')
}

const connectStrava = (): void => {
  if (route.query.error) {
    toast.add(fromErrorMessage("Access to Strava denied"))
  }
  if (!route.query.code) return

  stravaState.state = LoadingStates.Loading
  axios.request({
    url: '?code=' + routeQueryToString(route.query.code), method: 'post', baseURL: Const.STRAVA_API_URL,
    headers: {'Authorization': 'Bearer ' + authStore.token}
  }).then(() => {
    stravaState.state = LoadingStates.Loaded
    userStore.updateStrava()
    toast.add(successToast())
    void router.push('/me') // reset query params
  }).catch((error: AxiosError) => {
    stravaState.state = LoadingStates.Error
    toast.add(fromAxiosError(error))
    void router.push('/me') // reset query params
  })
}

const revokeStrava = (): void => {
  axios.request({
    url: `/`,
    method: 'delete',
    baseURL: Const.STRAVA_API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    }
  }).then(() => {
    userStore.updateStrava()
    toast.add(successToast())
  }).catch((response: AxiosError) => toast.add(fromAxiosError(response)))
}

const loadData = (): void => {
  getBests()
  getResults()
  getUser()
  getExternalIds()
}

watch(() => route.params.id, () => {
  evolutionChart.value?.resetData()
  loadData()
})

onMounted(() => {
  loadData()
  connectStrava()
})
</script>

<style scoped>

</style>
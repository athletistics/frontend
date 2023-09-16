<template>
  <Dialog v-model:visible="visibilitySelectionView">

    <div class="overflow-y-scroll p-4">
      <SimpleList :state="activityState">
        <SimpleListEntry v-for="a in activities">
          <label class="block hover:cursor-pointer hover:bg-main transition-colors main-transition p-4 -m-4">
            <input v-model="selectedActivityIds" type="checkbox" :value="a.id">
            {{ a.name }} ({{ $d(a.start_date_local) }}) - Dist: {{ a.distance }}, Time: {{ a.moving_time }}
          </label>
        </SimpleListEntry>
      </SimpleList>
    </div>

    <template #header>
      <DialogTitle>{{ $t('comp.import.selectActivities') }}</DialogTitle>
    </template>

    <template #footer>
      <DialogFooter>
        <LoadingBtn outlined @click="setVisibility(false)">{{ $t('glob.btn.cancel') }}</LoadingBtn>
        <LoadingBtn outlined visual-type="primary" :disabled="!selectedActivityIds.length" @click="selectActivities()">
          {{ $t('glob.btn.next') }}
        </LoadingBtn>
      </DialogFooter>
    </template>

  </Dialog>

  <Dialog v-model:visible="visibilityResultView">

    <AutoCompleteEvent id="eventId" v-model="selectedEventId" is-personal/>

    <SimpleList>
      <SimpleListEntry v-for="a in selectedActivities">
        <form class="grid grid-cols-3 gap-2">
          <div class="col-span-3 pb-6">{{ a.name }} ({{ $d(a.start_date_local) }}) - Dist: {{ a.distance }}</div>

          <AutoCompleteDiscipline v-model="a.discipline_id" class="col-span-2"/>

          <span class="p-float-label p-fluid">
            <InputNumber v-model="a.moving_time" :max-fraction-digits="2"/>
            <label>{{ $t('glob.discipline.name') }}</label>
          </span>

        </form>
      </SimpleListEntry>
    </SimpleList>

    <template #header>
      <DialogTitle>{{ $t('comp.import.addResults') }}</DialogTitle>
    </template>

    <template #footer>
      <DialogFooter>
        <LoadingBtn outlined @click="setVisibility(false)">{{ $t('glob.btn.cancel') }}</LoadingBtn>
        <LoadingBtn
            outlined visual-type="primary"
            :loading="createState" :disabled="!selectedEventId" @click="storeResults">
          {{ $t('glob.btn.save') }}
        </LoadingBtn>
      </DialogFooter>
    </template>

  </Dialog>

</template>

<script setup lang="ts">
import axios, {AxiosError, AxiosResponse} from "axios";
import {useToast} from "primevue/usetoast";
import {computed, onMounted, reactive, ref} from 'vue'
import {useI18n} from "vue-i18n";

import LoadingBtn from "@/components/button/LoadingBtn.vue";
import DialogFooter from "@/components/dialogs/DialogFooter.vue";
import DialogTitle from "@/components/dialogs/DialogTitle.vue";
import AutoCompleteDiscipline from "@/components/form/input/AutoCompleteDiscipline.vue";
import AutoCompleteEvent from "@/components/form/input/AutoCompleteEvent.vue";
import SimpleList from "@/components/list/SimpleList.vue";
import SimpleListEntry from "@/components/list/SimpleListEntry.vue";
import Const from "@/plugins/Constants";
import {fromAxiosError, fromErrorMessage, successToast} from "@/plugins/ToastWriter";
import {useAuthStore} from "@/stores/auth";
import Event from "@/types/Event";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";

const emits = defineEmits(['success'])

const authStore = useAuthStore()
const {t} = useI18n()
const toast = useToast()

const isSelectionView = ref<boolean>(true)
const activities = ref<Result.Import[]>([])
const selectedActivities = ref<Result.Import[]>([])
const selectedActivityIds = ref<number[]>([])
const activityState = ref<LoadingStates>(NaN)

const selectActivities = (): void => {
  selectedActivities.value = activities.value.filter(a => selectedActivityIds.value.indexOf(a.id) >= 0)
  isSelectionView.value = false
}

/**
 * Get a list of strava activities.
 */
const loadActivities = (): void => {
  activityState.value = LoadingStates.Loading

  axios.request({
    url: '/activities', method: 'get', baseURL: Const.STRAVA_API_URL,
    headers: {'Authorization': 'Bearer ' + authStore.token},
  }).then((response: AxiosResponse<Result.Import[], any>) => {
    activityState.value = LoadingStates.Loaded
    activities.value = response.data
  }).catch((response: AxiosError) => {
    activityState.value = LoadingStates.Error
    toast.add(fromAxiosError(response))
  })
}


const events = ref<Event[]>([])
const selectedEventId = ref<string>("")


/**
 * Get the list of events.
 */
const getEvents = (): void => {
  axios.request({
    url: "/events",
    method: 'get',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    }
  }).then((response: AxiosResponse<Event[], any>) => {
    events.value = response.data
  }).catch((response: AxiosError) => toast.add(fromAxiosError(response)))
}


let finishedCounter = 0 as number
let errorActivities = [] as Result.Import[]

const createState = reactive<LoadingState>({state: NaN})

/**
 * Stores a series of training results.
 */
const storeResults = (): void => {
  if (!selectedEventId.value) return

  createState.state = LoadingStates.Loading
  finishedCounter = 0
  errorActivities = []

  selectedActivities.value.forEach(a => {
    // invalid data, store for next try
    if (!a.discipline_id || !a.moving_time) {
      finishedCounter++
      errorActivities.push(a)
      checkFinished()
      return
    }

    // create request body
    const newResult = {
      value: a.moving_time,
      disciplineId: a.discipline_id,
      eventId: selectedEventId.value,
    }

    // send request
    axios.request({
      url: "/me/results",
      method: 'post',
      baseURL: Const.API_URL,
      headers: {
        'Authorization': 'Bearer ' + authStore.token
      },
      data: newResult,
    }).catch(() => {
      errorActivities.push(a)
    }).finally(() => {
      finishedCounter++
      checkFinished()
    })
  })
}

/**
 * Verifies if all results were saved. This function only has an effect once all store requests received an answer.
 * If at least one fails, an error message is shown, and the concerned results are selected.
 */
const checkFinished = (): void => {
  // check if all requests are finished
  if (finishedCounter === selectedActivities.value.length) {
    createState.state = LoadingStates.Loaded
    emits('success')

    // if errorActivities is not empty, at least one result could not be stored
    if (errorActivities.length) {
      toast.add(fromErrorMessage(t('comp.import.unsuccessful')))
      selectedActivities.value = errorActivities
    } else {
      toast.add(successToast())
      setVisibility(false)
    }
  }
}

// ----------------------------
// dialog visibility management
// ----------------------------
const visible = ref<boolean>(false)
const visibilitySelectionView = computed<boolean>((): boolean => {
  return visible.value && isSelectionView.value
})
const visibilityResultView = computed<boolean>((): boolean => {
  return visible.value && !isSelectionView.value
})
const setVisibility = (v: boolean): void => {
  visible.value = v

  if (v) loadActivities()
  isSelectionView.value = true
  activities.value = [] as Result.Import[]
  selectedEventId.value = ""
  selectedActivityIds.value = []
}

defineExpose({
  setVisibility
})

onMounted((): void => {
  getEvents()
})
</script>

<style scoped>

</style>
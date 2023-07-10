<template>
  <Modal ref="modal">
    <div v-if="isSelectionView" class="grid grid-cols-1 divide-y gap-4">
      <h3>{{ $t('comp.import.selectActivities') }}</h3>

      <div class="pt-4">
        <SimpleList :state="activityState">
          <SimpleListEntry v-for="a in activities">
            <input type="checkbox" :value="a.id" v-model="selectedActivityIds">{{ a.name }} ({{
              $d(a.start_date_local)
            }}) - Dist: {{ a.distance }}, Time:
            {{ a.moving_time }}
          </SimpleListEntry>
        </SimpleList>
      </div>

      <div class="grid grid-cols-2  gap-4 pt-4">
        <LoadingBtn @click="setVisibility(false)" outlined>{{ $t('glob.btn.cancel') }}</LoadingBtn>
        <LoadingBtn @click="selectActivities()" outlined visual-type="primary" :disabled="!selectedActivityIds.length">
          {{
            $t('glob.btn.next')
          }}
        </LoadingBtn>
      </div>
    </div>

    <div v-else>
      <h3>{{ $t('comp.import.addResults') }}</h3>

      <form class="with-label">
        <div>
          <label>{{ $t('glob.event.name') }}</label>
          <select v-model="selectedEventId">
            <option v-for="e in filteredEvents" :value="e.id">{{ e.name }}, {{ e.place }} ({{ e.date }})</option>
          </select>
        </div>
      </form>

      <SimpleList>
        <SimpleListEntry v-for="a in selectedActivities">
          <form class="with-label grid grid-cols-2">
            <div class="col-span-2">{{ a.name }} ({{ $d(a.start_date_local) }}) - Dist: {{ a.distance }}</div>

            <div>
              <label>{{ $t('glob.discipline.name') }}</label>
              <select v-model="a.discipline_id">
                <option v-for="d in dataStore.disciplines" :value="d.id">
                  {{ d.i18nName ? $t('data.' + d.i18nName) : d.customName }}
                </option>
              </select>
            </div>

            <div>
              <label>{{ $t('glob.result.value') }}</label>
              <input v-model="a.moving_time">
            </div>

          </form>
        </SimpleListEntry>
      </SimpleList>

      <div class="grid grid-cols-2  gap-4 pt-4">
        <LoadingBtn @click="setVisibility(false)" outlined>{{ $t('glob.btn.cancel') }}</LoadingBtn>
        <LoadingBtn @click="storeResults" :loading="createState" outlined visual-type="primary"
                    :disabled="!selectedEventId">{{
            $t('glob.btn.save')
          }}
        </LoadingBtn>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import Modal from "./Modal.vue";
import LoadingState from "../../types/LoadingState";
import {LoadingStates} from "../../types/LoadingStates";
import Event from "../../types/Event";
import axios from "axios";
import Const from "../../plugins/Constants";
import {useAuthStore} from "../../stores/auth";
import {useToastStore} from "../../stores/toast";
import LoadingBtn from "../button/LoadingBtn.vue";
import SimpleList from "../list/SimpleList.vue";
import SimpleListEntry from "../list/SimpleListEntry.vue";
import {useDataStore} from "../../stores/data";

export default defineComponent({
  name: "ModalResultImport",
  components: {SimpleListEntry, SimpleList, LoadingBtn, Modal},
  emits: ['created'],
  setup() {
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    const dataStore = useDataStore()
    return {authStore, toastStore, dataStore}
  },
  data() {
    return {
      isSelectionView: true as boolean,
      date: {} as Date,
      events: [] as Event[],
      activities: [] as Result.Import[],
      selectedActivities: [] as Result.Import[],
      selectedActivityIds: [] as number[],
      selectedEventId: "" as string,
      activityState: NaN as LoadingStates,
      createState: {state: NaN} as LoadingState,

      finishedCounter: 0 as number,
      errorActivities: [] as Result.Import[],
    }
  },
  computed: {
    filteredEvents() {
      return this.events.filter(e => e.eventTypeId === 4)
    }
  },
  methods: {
    selectActivities() {
      this.selectedActivities = this.activities.filter(a => this.selectedActivityIds.indexOf(a.id) >= 0)
      this.isSelectionView = false
    },
    setVisibility(visible: boolean) {
      (this.$refs.modal as any).setVisibility(visible)
      if (visible) this.loadActivities()
      this.isSelectionView = true
      this.activities = [] as Result.Import[]
    },
    loadActivities() {
      this.activityState = LoadingStates.Loading

      axios.request({
        url: '/activities', method: 'get', baseURL: Const.STRAVA_API_URL,
        headers: {'Authorization': 'Bearer ' + this.authStore.token},
      }).then(response => {
        this.activityState = LoadingStates.Loaded
        this.activities = response.data
      }).catch(response => {
        this.activityState = LoadingStates.Error
        this.toastStore.addToastFromAxiosError(response)
      })
    },
    getEvents() {
      axios.request({
        url: "/events",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        }
      }).then(response => {
        this.events = response.data
      }).catch(response => this.toastStore.addToastFromAxiosError(response))
    },
    storeResults() {
      if (!this.selectedEventId) return

      this.createState.state = LoadingStates.Loading
      this.finishedCounter = 0 as number
      this.errorActivities = [] as Result.Import[]

      this.selectedActivities.forEach(a => {
        // invalid data, store for next try
        if (!a.discipline_id || !a.moving_time) {
          this.finishedCounter++
          this.errorActivities.push(a)
        }

        // create request body
        const newResult = {
          value: a.moving_time,
          disciplineId: a.discipline_id,
          eventId: this.selectedEventId,
        }

        // send request
        axios.request({
          url: "/me/results",
          method: 'post',
          baseURL: Const.API_URL,
          headers: {
            'Authorization': 'Bearer ' + this.authStore.token
          },
          data: newResult,
        }).catch(() => {
          this.errorActivities.push(a)
        }).finally(() => {
          this.finishedCounter++
          this.checkFinished()
        })
      })
    },
    checkFinished() {
      // check if all requests are finished
      if (this.finishedCounter === this.selectedActivities.length) {
        this.createState.state = LoadingStates.Loaded
        this.$emit('created')

        // if errorActivities is not empty, at least one result could not be stored
        if (this.errorActivities.length) {
          this.toastStore.addErrorToast(this.$t('comp.import.unsuccessful'))
          this.selectedActivities = this.errorActivities
        } else {
          this.toastStore.addSuccessToast()
          this.setVisibility(false)
        }
      }
    }
  },
  mounted() {
    this.getEvents()
  }
})
</script>

<style scoped>

</style>
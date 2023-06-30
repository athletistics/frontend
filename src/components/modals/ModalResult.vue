<template>
  <Modal ref="modal">
    <h3 v-if="isPersonal">{{ $t('comp.result.createTraining') }}</h3>
    <h3 v-else>{{ $t('comp.result.create') }}</h3>

    <hr>

    <div>
      <label>{{ $t('glob.result.value') }}</label>
      <input v-model="newResult.value" required>
    </div>

    <div>
      <label>{{ $t('glob.result.wind') }}</label>
      <input v-model="newResult.wind" required>
    </div>

    <div>
      <label>{{ $t('glob.result.rank') }}</label>
      <input v-model="newResult.rank" required>
    </div>

    <div v-if="!isPersonal">
      <label>{{ $t('glob.user.name') }}</label>
      <select v-model="newResult.userId" :disabled="!!user">
        <option v-for="u in dataStore.users" :value="u.id">{{ u.lastName }} {{ u.firstName }}</option>
      </select>
    </div>

    <div>
      <label>{{ $t('glob.discipline.name') }}</label>
      <select v-model="newResult.disciplineId">
        <option v-for="d in dataStore.disciplines" :value="d.id">{{ d.i18nName ?? d.customName }}</option>
      </select>
    </div>

    <div>
      <label>{{ $t('glob.event.name') }}</label>
      <select v-model="newResult.eventId" :disabled="!!event">
        <option v-for="e in filteredEvents" :value="e.id">{{ e.name }}, {{ e.place }} ({{ e.date }})</option>
      </select>
    </div>

    <hr>
    <div class="grid sm:grid-cols-2 gap-4">
      <LoadingBtn full outlined visual-type="primary" :loading="createState" @click="createResult">{{$t('glob.btn.add')}}</LoadingBtn>
      <LoadingBtn full outlined @click="setVisibility(false)">{{$t('glob.btn.cancel')}}</LoadingBtn>
    </div>
  </Modal>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import Modal from "./Modal.vue";
import axios from "axios";
import Const from "../../plugins/Constants";
import {useAuthStore} from "../../stores/auth";
import {useDataStore} from "../../stores/data";
import {useToastStore} from "../../stores/toast";
import Event from "../../types/Event";
import User from "../../types/User";
import LoadingBtn from "../button/LoadingBtn.vue";
import LoadingState from "../../types/LoadingState";
import {LoadingStates} from "../../types/LoadingStates";

export default defineComponent({
  name: "ModalResult",
  components: {LoadingBtn, Modal},
  props: {
    result: {type: Object as PropType<Result.Data | undefined>, default: undefined},
    user: {type: Object as PropType<User | undefined>, default: undefined},
    event: {type: Object as PropType<Event | undefined>, default: undefined},
    isPersonal: {type: Boolean, default: true}
  },
  setup() {
    const authStore = useAuthStore()
    const dataStore = useDataStore()
    const toastStore = useToastStore()

    return {authStore, toastStore, dataStore}
  },
  data() {
    return {
      events: [] as Event[],
      newResult: {} as Result.RequestBody,
      createState: {state: NaN} as LoadingState
    }
  },
  computed: {
    filteredEvents() {
      if (!this.isPersonal) return this.events
      return this.events.filter(e => e.eventTypeId === 4)
    }
  },
  methods: {
    setVisibility(visible: boolean) {
      (this.$refs.modal as any).setVisibility(visible)
      this.newResult = {} as Result.RequestBody

      if (this.user) this.newResult.userId = this.user.id
      if (this.event) this.newResult.eventId = this.event.id
    },
    createResult() {
      this.createState.state = LoadingStates.Loading
      const url = this.isPersonal ? "/me/results" : "/results"

      if (this.isPersonal) {
        delete (this.newResult.userId)
      }

      axios.request({
        url,
        method: 'post',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        },
        data: this.newResult,
      }).then(response => {
        this.createState.state = LoadingStates.Loaded
        this.toastStore.addSuccessToast()
        this.$emit('created')
        this.setVisibility(false)
      }).catch(response => {
        this.createState.state = LoadingStates.Error
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
  },
  mounted() {
    this.getEvents()
  }
})
</script>

<style scoped>

</style>
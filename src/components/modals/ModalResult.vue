<template>
  <Modal ref="modal">
    <h3>{{ $t('result.createTraining') }}</h3>
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

    <div v-if="!user">
      <label>{{ $t('glob.user.name') }}</label>
      <select v-model="newResult.userId">
        <option v-for="u in dataStore.users" :value="u.id">{{ u.lastName }} {{ u.firstName}}</option>
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
      <select v-model="newResult.eventId">
        <option v-for="e in filteredEvents" :value="e.id">{{ e.name }}, {{ e.place }} ({{ e.date }})</option>
      </select>
    </div>

    <hr>
    <div class="grid sm:grid-cols-2 gap-4">
      <button type="button" v-on:click="createResult()" class="btn btn-block btn-primary">Add</button>
      <button type="button" v-on:click="setVisibility(false)" class="btn btn-block">Cancel</button>
    </div>
  </Modal>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import Modal from "./Modal.vue";
import axios from "axios";
import Const from "../../plugins/Constants.ts";
import {useAuthStore} from "../../stores/auth.ts";
import {useDataStore} from "../../stores/data.ts";
import {useToastStore} from "../../stores/toast.ts";
import Event from "../../types/Event.ts";
import User from "../../types/User.ts";

export default defineComponent({
  name: "ModalResult",
  components: {Modal},
  props: {
    result: {type: Object as PropType<Result.Data | undefined>, default: undefined},
    user: {type: Object as PropType<User | undefined>, default: undefined},
    isPersonal: {type: Object as PropType<boolean>, default: true}
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
      newResult: {} as Result.RequestBody
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
    },
    createResult() {
      const url = this.isPersonal ? "/me/results" : "/results"

      if (this.isPersonal) {
        delete(this.newResult.userId)
      } else if (this.user){
        this.newResult.userId = this.user.id
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
        this.toastStore.addSuccessToast()
        this.$emit('created')
        this.setVisibility(false)
      }).catch(response => this.toastStore.addToastFromAxiosError(response))
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
<template>
  <h1>{{$t('page.event.title')}}</h1>
  <button v-on:click="setModalVisibility(true)" class="btn btn-block btn-primary">{{$t('page.event.createBtn')}}</button>
  <hr>

  <p v-for="e in events">{{ e }}</p>

  <Modal ref="modal">
    <h3>{{$t('page.event.createTitle')}}</h3>
    <hr>

    <div>
      <label>{{$t('glob.event.name')}}</label>
      <input v-model="newEvent.name" required>
    </div>

    <div>
      <label>{{$t('glob.event.place')}}</label>
      <input v-model="newEvent.place" required>
    </div>

    <div>
      <label>{{$t('glob.event.date')}}</label>
      <input v-model="newEvent.webDate" type="date" required>
    </div>

    <div>
      <label>{{$t('glob.event.type')}}</label>
      <!-- todo: replace with data from server -->
      <select v-model="newEvent.eventTypeId" required>
        <option :value="1" selected>SwissAthletics</option>
        <option :value="2" selected>UBS Kids Cup</option>
        <option :value="3" selected>Custom</option>
        <option :value="4" selected>Training</option>
      </select>
    </div>

    <div>
      <label>{{ $t('glob.event.locality') }}</label>
      <select v-model="newEvent.isOutdoor" required>
        <option :value="true">{{ $t('glob.event.outdoor') }}</option>
        <option :value="false">{{ $t('glob.event.indoor') }}</option>
      </select>
    </div>

    <div class="inline-flex">
      <input id="homologated" :value="1" type="checkbox" v-model="homologated">
      <label for="homologated">{{$t('glob.event.homologated')}}</label>
    </div>

    <hr>
    <div class="grid sm:grid-cols-2 gap-4">
      <button type="button" v-on:click="createEvent()" class="btn btn-block btn-primary">{{$t('glob.btn.add')}}</button>
      <button type="button" v-on:click="setModalVisibility(false)" class="btn btn-block">{{$t('glob.btn.cancel')}}</button>
    </div>
  </Modal>
</template>

<script lang="ts">
import Event from "../types/Event"
import {defineComponent} from "vue";
import axios from "axios";
import Const from "../plugins/Constants";
import {useToastStore} from "../stores/toast";
import {useAuthStore} from "../stores/auth";
import Modal from "../components/modals/Modal.vue";
import moment from "moment";

export default defineComponent({
  name: "Events",
  components: {Modal},
  setup() {
    const authStore = useAuthStore()
    const toastStore = useToastStore()

    return {authStore, toastStore}
  },
  data() {
    return {
      events: [] as Event[],
      newEvent: {} as Event,
      homologated: [] as number[]
    }
  },
  mounted() {
    this.loadEvents()
  },
  methods: {
    setModalVisibility(visible: boolean) {
      (this.$refs.modal as any).setVisibility(visible)
      this.newEvent = {} as Event
      this.newEvent.isOutdoor = true
    },
    createEvent() {
      this.newEvent.isHomologated = this.homologated.length > 0
      this.newEvent.date = moment(this.newEvent.webDate).format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS) + "Z"

      axios.request({
        url: "/events",
        method: 'post',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        },
        data: this.newEvent
      }).then(() => {
        this.toastStore.addSuccessToast()
        this.setModalVisibility(false)
      }).catch(error => this.toastStore.addToastFromAxiosError(error))
    },
    loadEvents() {
      axios.request({
        url: "/events",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        }
      }).then(response => {
        this.events = response.data
      }).catch(error => this.toastStore.addToastFromAxiosError(error))
    }
  }
})

</script>

<style scoped>

</style>
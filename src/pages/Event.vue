<template>
  <h1>{{ event?.name }}</h1>

  <div class="p-4 white-rounded grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <LabeledText :state="eventState" label="glob.event.name" :text="event?.name"/>
    <LabeledText :state="eventState" label="glob.event.place" :text="event?.place"/>
    <LabeledText :state="eventState" label="glob.event.date" :text="event ? $d(new Date(event.date)) : undefined"/>
    <LabeledText :state="eventState" label="glob.event.type" :text="eventType"/>
    <LabeledText :state="eventState" label="glob.event.homologation" :text="homolgation"/>
    <LabeledText :state="eventState" label="glob.event.season" :text="season"/>
  </div>

  <div class="py-5">&nbsp;</div>

  <TitleWithBtnPlus :btn-visible="canManageResults()" @btn-click="setModalVisibility(true)">
    {{ $t('page.results.title') }}
  </TitleWithBtnPlus>

  <ResultTable :results="results" :state="resultsState" :show-event="false"></ResultTable>

  <ModalResult ref="modal" :is-personal="false" @created="loadResults" :event="event"></ModalResult>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import ResultTable from "../components/results/ResultTable.vue";
import TitleWithBtnPlus from "../components/title/TitleWithBtnPlus.vue";
import ModalResult from "../components/modals/ModalResult.vue";
import {useAuthStore} from "../stores/auth";
import {useToastStore} from "../stores/toast";
import {LoadingStates} from "../types/LoadingStates";
import {canManageResults} from "../plugins/AccessControl";
import axios from "axios";
import Const from "../plugins/Constants";
import {useDataStore} from "../stores/data";
import LabeledText from "../components/LabeledText.vue";

export default defineComponent({
  name: "Event",
  components: {LabeledText, ModalResult, TitleWithBtnPlus, ResultTable},
  setup() {
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    const dataStore = useDataStore()

    return {authStore, toastStore, dataStore}
  },
  data() {
    return {
      results: [] as Result.Data[],
      resultsState: NaN as LoadingStates
    }
  },
  computed: {
    eventType(): string | undefined {
      if (!this.event) return undefined
      const type = this.dataStore.getEventTypeById(this.event.eventTypeId)
      return type ? this.$t('data.' + type.i18nName) : type
    },
    homolgation(): string | undefined {
      if (!this.event) return undefined
      return this.event.isHomologated ? this.$t('glob.event.homologated') : this.$t('glob.event.notHomologated')
    },
    season(): string | undefined {
      if (!this.event) return undefined
      return this.event.isOutdoor ? this.$t('glob.event.outdoor') : this.$t('glob.event.indoor')
    },
    eventState() {
      return this.event ? LoadingStates.Loaded : LoadingStates.Loading
    },
    event() {
      return this.dataStore.getEventById(this.$route.params.id.toString())
    }
  },
  methods: {
    canManageResults,
    setModalVisibility(visible: boolean) {
      (this.$refs.modal as any).setVisibility(visible)
    },
    loadResults() {
      this.resultsState = LoadingStates.Loading
      axios.request({
        url: "/results?eventId=" + this.$route.params.id,
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        }
      }).then(response => {
        this.results = response.data
        this.resultsState = response.data?.length ? LoadingStates.Loaded : LoadingStates.Empty
      }).catch(response => {
        this.resultsState = LoadingStates.Error
        this.toastStore.addToastFromAxiosError(response)
      })
    }
  },
  mounted() {
    this.loadResults()
  }
})
</script>

<style scoped>

</style>
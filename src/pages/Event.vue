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

  <ResultTable :results="results" :state="resultsState" :show-event="false" @updated="loadResults"/>

  <ModalResult ref="modal" :is-personal="false" :event="event" @created="loadResults"/>
</template>

<script lang="ts">
import axios, {AxiosError, AxiosResponse} from "axios";
import {defineComponent} from 'vue'

import ModalResult from "@/components/results/DialogResult.vue";
import ResultTable from "@/components/results/ResultTable.vue";
import LabeledText from "@/coreComponents/LabeledText.vue";
import TitleWithBtnPlus from "@/coreComponents/title/TitleWithBtnPlus.vue";
import {canManageResults} from "@/plugins/AccessControl";
import Const from "@/plugins/Constants";
import {routeParamToString} from "@/plugins/Helper";
import {useAuthStore} from "@/stores/auth";
import {useDataStore} from "@/stores/data";
import {useToastStore} from "@/stores/toast";
import IntDialog from "@/types/IntDialog";
import {LoadingStates} from "@/types/LoadingStates";

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
  mounted() {
    this.loadResults()
  },
  methods: {
    canManageResults,
    setModalVisibility(visible: boolean) {
      (this.$refs.modal as IntDialog).setVisibility(visible)
    },
    loadResults() {
      this.resultsState = LoadingStates.Loading
      axios.request({
        url: "/results?eventId=" + routeParamToString(this.$route.params.id),
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        }
      }).then((response: AxiosResponse<Result.Data[], any>) => {
        this.results = response.data
        this.resultsState = response.data?.length ? LoadingStates.Loaded : LoadingStates.Empty
      }).catch((response: AxiosError) => {
        this.resultsState = LoadingStates.Error
        this.toastStore.addToastFromAxiosError(response)
      })
    }
  }
})
</script>

<style scoped>

</style>
<template>
  <div>
    <h1>{{ $t('comp.limits.title') }}</h1>

    <form class="grid md:grid-cols-3 grid-cols-1 gap-4 with-label">

      <div>
        <div v-if="filteredCategories?.length">
          <label>{{ $t('comp.evolution.reference') }}</label>
          <div class="flex">
            <select v-model="category">
              <option v-for="c in filteredCategories" :value="c.id">{{ c.name }} {{
                  c.gender ? $t('glob.gender.' + c.gender) : ""
                }}
              </option>
            </select>
          </div>
        </div>
      </div>

    </form>

    <div class="grid lg:grid-cols-2 gap-4">
      <div>
        <Radar :data="chartDataTrack" :options="chartOptions"/>
      </div>
      <div>
        <Radar :data="chartDataField" :options="chartOptions"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Radar} from 'vue-chartjs'
import {
  Chart as ChartJS,
  ChartOptions,
  Filler,
  Title,
  Tooltip,
  Legend,
  LineController,
  LineElement,
  RadialLinearScale,
  PointElement,
} from 'chart.js'
import 'chartjs-adapter-moment';

import {defineComponent, PropType, ref} from 'vue'
import {useAuthStore} from "../../stores/auth";
import {useDataStore} from "../../stores/data";
import axios from "axios";
import Const from "../../plugins/Constants";
import {useToastStore} from "../../stores/toast";
import {formatResult} from "../../plugins/Helper";
import LoadingState from "../../types/LoadingState";
import {LoadingStates} from "../../types/LoadingStates";
import Category from "../../types/Category";
import {CHART_COLOR_TRANSPARENT, CHART_COLORS, transparentize} from "../../plugins/ChartUtils";

ChartJS.register(Filler, Title, Tooltip, Legend, LineController, LineElement, PointElement, RadialLinearScale)
export default defineComponent({
  name: "ResultLimitComparison",
  components: {Radar},
  props: {
    results: {type: Array as PropType<Result.Data[]>, required: true}
  },
  setup() {
    const authStore = useAuthStore()
    const dataStore = useDataStore()
    const toastStore = useToastStore()

    const MinPercent = 95
    const MaxPercent = 102
    const FullPercent = 100

    return {authStore, dataStore, toastStore, MinPercent, MaxPercent, FullPercent}
  },
  data() {
    return {
      season: "" as string,
      reference: "" as string,
      category: "" as string,
      trackReferences: [] as number[],
      trackBests: [] as number[],
      fieldReferences: [] as number[],
      fieldBests: [] as number[],
      state: {state: NaN} as LoadingState
    }
  },
  computed: {
    filteredCategories(): Category[] {
      let categories = new Set<Category>()

      this.dataStore.staticResults.forEach(r => {
        const c = this.dataStore.getCategoryById(r.categoryId)
        if (c) categories.add(c)
      })

      const categoriesArray = Array.from(categories)
      if (categoriesArray.length) this.category = categoriesArray[0].id

      return categoriesArray
    },
    chartDataField() {
      // return an empty dataset if no data is available
      if (!this.results.length) return {labels: [], datasets: []}

      return this.computeDatasets(this.results, false)
    },
    chartDataTrack() {
      // return an empty dataset if no data is available
      if (!this.results.length) return {labels: [], datasets: []}

      return this.computeDatasets(this.results, true)
    },
    chartOptions(): ChartOptions {
      return {
        responsive: true,
        scales: {
          r: {
            suggestedMax: this.MaxPercent,
            suggestedMin: this.MinPercent,
            ticks: {
              callback: (value, index, ticks) => {
                return value + '%'
              }
            },
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const formattedResult = formatResult(context.raw.val.toString(), this.dataStore.getDisciplineById(context.raw.disciplineId))
                return `${context.dataset.label}: ${formattedResult} (${context.raw.r.toFixed(2)}%)`
              }
            }
          }
        }
      }
    },
  },
  methods: {
    computeDatasets(results: Result.Data[], isDescending: boolean) {
      let labels = []
      let datasets = [{
        label: this.$t('glob.result.limit'),
        data: [],
        pointBackgroundColor: transparentize(CHART_COLORS.green, 0.5),
        backgroundColor: CHART_COLOR_TRANSPARENT,
        borderColor: CHART_COLORS.green,
      }, {
        label: this.$t('page.user.title.bestResults'),
        fill: true,
        data: [],
        backgroundColor: transparentize(CHART_COLORS.red, 0.5),
        borderColor: CHART_COLORS.red,
      }]

      // create a dataset entry for each available result set
      results.forEach((result, name) => {
        const discipline = this.dataStore.getDisciplineById(result.disciplineId)

        // only continue for existing disciplines that are sorted in ascending order
        if (!discipline || discipline.isDescending === isDescending) return

        // only continue for disciplines and categories that have a reference value
        const refValue = this.dataStore.getReferenceValue(discipline.id, this.category)
        if (!refValue) return

        // compute the percentage value. Disciplines that are sorted in descending order (lower values are better)
        // subtract the percentage difference to the limit from 100%. This results in values lower than the limit
        // being shown as >100%.
        const refVal = parseFloat(refValue.value)
        const resVal = parseFloat(result.value)
        const diff = refVal - resVal
        const percentDiff = this.FullPercent / refVal * diff
        const r = isDescending ? 100 + percentDiff : 100 - percentDiff

        // Add the achieved percentage of the limit
        labels.push(discipline.i18nName ? this.$t('data.' + discipline.i18nName) : discipline.customName)
        datasets[1].data.push({
          r,
          val: resVal,
          disciplineId: discipline.id
        })

        // add the limit value as 100%
        datasets[0].data.push({
          r: this.FullPercent,
          val: refVal,
          disciplineId: discipline.id
        })
      })

      return {
        labels,
        datasets
      }
    },
    loadResults(userId: string) {
      this.state.state = LoadingStates.Loading
      axios.request({
        url: `/results/best?userId=${userId}`,
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        }
      }).then(response => {
        this.state.state = LoadingStates.Loaded
        this.results = response.data
      }).catch(response => {
        this.state.state = LoadingStates.Error
        this.toastStore.addToastFromAxiosError(response)
      })
    }
  },
})
</script>

<style scoped>

</style>
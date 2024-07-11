<template>
  <div v-if="results?.length">
    <div class="py-5">&nbsp;</div>
    <h1>{{ $t('comp.limits.title') }}</h1>

    <form class="grid md:grid-cols-3 grid-cols-1 gap-4 with-label">

      <div>
        <label>{{ $t('page.references.referenceType') }}</label>
        <div class="flex">
          <select v-model="typeId">
            <option v-for="t in dataStore.staticResultTypes" :value="t.id">{{
                $t('data.staticResultTypes.' + t.i18nType)
              }}
            </option>
          </select>
        </div>
      </div>

      <div>
        <div v-if="filteredCategories?.length">
          <label>{{ $t('comp.evolution.category') }}</label>
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
      <div v-if="chartDataTrack?.labels?.length">
        <h3 class="text-center">{{ $t('glob.track') }}</h3>
        <Radar :data="chartDataTrack" :options="chartOptions"/>
      </div>
      <div v-if="chartDataField?.labels?.length">
        <h3 class="text-center">{{ $t('glob.field') }}</h3>
        <Radar :data="chartDataField" :options="chartOptions"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import 'chartjs-adapter-moment';

import {
  Chart as ChartJS,
  ChartOptions,
  Filler,
  Legend,
  LineController,
  LineElement,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import {defineComponent, PropType} from 'vue'
import {Radar} from 'vue-chartjs'

import {CHART_COLOR_TRANSPARENT, CHART_COLORS, transparentize} from "@/plugins/ChartUtils";
import {formatResult} from "@/plugins/Helper";
import {useAuthStore} from "@/stores/auth";
import {useDataStore} from "@/stores/data";
import Category from "@/types/Category";
import LoadingState from "@/types/LoadingState";

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

    const MinPercent = 95
    const MaxPercent = 102
    const FullPercent = 100

    return {authStore, dataStore, MinPercent, MaxPercent, FullPercent}
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
      typeId: NaN ,
      state: {state: NaN} as LoadingState
    }
  },
  computed: {
    // search for all categories that have static results for the selected static result type
    filteredCategories(): Category[] {
      // categories are stored in a set, simplifying the search for distinct categories
      const categories = new Set<Category>()

      this.dataStore.staticResults.forEach(r => {
        // reject static results of different types
        if (r.resultStaticTypeId !== this.typeId) return

        // search for the category of the current static result, and add it to the set
        const c = this.dataStore.getCategoryById(r.categoryId)
        if (c) categories.add(c)
      })

      // create an array based on the set
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
    chartOptions(): ChartOptions<"radar"> {
      return {
        responsive: true,
        scales: {
          r: {
            suggestedMax: this.MaxPercent,
            suggestedMin: this.MinPercent,
            ticks: {
              callback: (value) => {
                return value + '%'
              }
            },
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const raw = context.raw as {val: string, r: number, disciplineId: string}
                const formattedResult = formatResult(raw.val.toString(), this.dataStore.getDisciplineById(raw.disciplineId))
                return `${context.dataset.label}: ${formattedResult} (${raw.r.toFixed(2)}%)`
              }
            }
          }
        }
      }
    },
  },
  mounted() {
    // select first result type on loading
    this.typeId = this.dataStore.staticResultTypes[0].id
  },
  methods: {
    computeDatasets(results: Result.Data[], isDescending: boolean) {
      const labels = [] as string[]
      const datasets = [{
        label: this.$t('glob.result.limit'),
        data: [] as any[],
        pointBackgroundColor: transparentize(CHART_COLORS.green, 0.5),
        backgroundColor: CHART_COLOR_TRANSPARENT,
        borderColor: CHART_COLORS.green,
      }, {
        label: this.$t('page.user.title.bestResults'),
        fill: true,
        data: [] as any[],
        backgroundColor: transparentize(CHART_COLORS.red, 0.5),
        borderColor: CHART_COLORS.red,
      }]

      // create a dataset entry for each available result set
      results.forEach((result) => {
        const discipline = this.dataStore.getDisciplineById(result.disciplineId)

        // only continue for existing disciplines that are sorted in ascending order
        if (!discipline || discipline.isDescending === isDescending) return

        // only continue for disciplines and categories that have a reference value
        const refValue = this.dataStore.getReferenceValue(discipline.id, this.category, this.typeId)
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
        labels.push(discipline.i18nName ? this.$t('data.' + discipline.i18nName) : (discipline.customName ?? ""))
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
    }
  },
})
</script>

<style scoped>

</style>
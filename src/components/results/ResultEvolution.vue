<template>
  <!--  Hide element with CSS, as otherwise computed functions are not executed, -->
  <!--  causing the element to be invisible forever due to the asynchronously -->
  <!--  content -->
  <div :class="{'hidden': !visible}">
    <div class="py-5">&nbsp;</div>
    <h1>{{ $t('comp.evolution.title') }}</h1>

    <form class="grid md:grid-cols-3 grid-cols-1 gap-4 with-label">
      <div>
        <label>{{ $t('glob.discipline.name') }}</label>
        <select v-model="discipline">
          <option v-for="d in disciplines" :value="d.id">{{
              d.i18nName ? $t('data.' + d.i18nName) : d.customName
            }}
          </option>
        </select>
      </div>

      <div>
        <div>
          <label>{{ $t('comp.evolution.referenceType') }}</label>
          <div class="flex">
            <select v-model="typeId">
              <option v-for="c in dataStore.staticResultTypes" :value="c.id">
                {{ $t("data.staticResultTypes." + c.i18nType) }}
              </option>
            </select>
          </div>
        </div>
        <div v-if="filteredCategories?.length">
          <label>{{ $t('comp.evolution.category') }}</label>
          <div class="flex">
            <input v-model="showReference" type="checkbox" class="w-6 mr-2">
            <select v-model="category">
              <option v-for="c in filteredCategories" :value="c.id">{{ c.name }} {{
                  c.gender ? $t('glob.gender.' + c.gender) : ""
                }}
              </option>
            </select>
          </div>
        </div>
        <p v-else>{{ $t('comp.evolution.noCat') }}</p>
      </div>

      <div v-if="canManageResults()">
        <LoadingBtn full outlined visual-type="primary" @click="setModalVisibility(true)">
          {{ $t('comp.evolution.compare') }}
        </LoadingBtn>
      </div>
    </form>

    <Line :data="chartData" :options="chartOptions"/>
  </div>

  <Dialog v-model:visible="dialogVisible">
    <div>
      <div v-for="u in dataStore.users" class="flex hover:bg-main cursor-pointer">
        <input :id="u.id" v-model="usersToAdd" :value="u.id" type="checkbox" class="mr-2 cursor-pointer">
        <label :for="u.id" class="flex-grow py-3 cursor-pointer">{{ u.lastName }} {{ u.firstName }}</label>
      </div>
    </div>

    <template #header>
      <DialogTitle>{{ $t('comp.evolution.compare') }}</DialogTitle>
    </template>

    <template #footer>
      <DialogFooter>
        <LoadingBtn full outlined visual-type="primary" :state="state" @click="compare()">
          {{ $t('glob.btn.add') }}
        </LoadingBtn>
        <LoadingBtn full outlined @click="setModalVisibility(false)">{{ $t('glob.btn.cancel') }}</LoadingBtn>
      </DialogFooter>
    </template>
  </Dialog>

</template>

<script lang="ts">
import 'chartjs-adapter-moment';

import axios, {AxiosError, AxiosResponse} from "axios";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from 'chart.js'
import {defineComponent, PropType} from 'vue'
import {Line} from 'vue-chartjs'

import LoadingBtn from "@/coreComponents/button/LoadingBtn.vue";
import DialogFooter from "@/coreComponents/dialogs/DialogFooter.vue";
import DialogTitle from "@/coreComponents/dialogs/DialogTitle.vue";
import {canManageResults} from "@/plugins/AccessControl";
import {CHART_COLORS, namedColor, transparentize} from "@/plugins/ChartUtils";
import Const from "@/plugins/Constants";
import {formatResult} from "@/plugins/Helper";
import {useAuthStore} from "@/stores/auth";
import {useDataStore} from "@/stores/data";
import {useToastStore} from "@/stores/toast";
import Category from "@/types/Category";
import Discipline from "@/types/Discipline";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import Paginated from "@/types/Paginated";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineController, LineElement, PointElement, TimeScale)
export default defineComponent({
  name: "ResultEvolution",
  components: {DialogFooter, DialogTitle, LoadingBtn, Line},
  props: {
    defaultUser: {type: Object as PropType<string | undefined>, default: undefined}
  },
  setup() {
    const authStore = useAuthStore()
    const dataStore = useDataStore()
    const toastStore = useToastStore()

    return {authStore, dataStore, toastStore}
  },
  data() {
    return {
      discipline: "" as string,
      category: "" as string,
      showReference: false as boolean,
      dataMap: new Map<string, Result.Data[]>(),
      usersToAdd: [] as string[],
      state: {state: NaN} as LoadingState,
      typeId: NaN,
      visible: true as boolean,
      dialogVisible: false as boolean
    }
  },
  computed: {
    filteredCategories(): Category[] {
      const categories = [] as Category[]

      this.dataStore.staticResults.forEach(r => {
        if (r.disciplineId == this.discipline && r.resultStaticTypeId === this.typeId) {
          const c = this.dataStore.getCategoryById(r.categoryId)
          if (c) categories.push(c)
        }
      })

      return categories
    },
    disciplines(): Discipline[] {
      if (!this.dataMap.size) return []

      // get distinct disciplines in all result sets
      const results = new Set<Discipline>()
      this.dataMap.forEach((data) => {
        data.forEach(entry => {
          const discipline = this.dataStore.getDisciplineById(entry.disciplineId)
          if (discipline) {
            results.add(discipline)
          }
        })
      })

      // convert to array, and select first entry
      const r = Array.from(results)
      if (r.length) this.discipline = r[0].id
      return r
    },
    chartData() {
      // return an empty dataset and hide the chart if no data is available
      if (!this.dataMap.size) {
        this.visible = false
        return {labels: [], datasets: []}
      }
      this.visible = true

      let minX = 0
      let maxX = 0
      const datasets = []

      // create a dataset entry for each available result set
      this.dataMap.forEach((d, name) => {
        const xyData = [] as any[]

        // select the entries of the selected discipline
        d.forEach(d => {
          if (d.disciplineId == this.discipline) {
            // record min and max date
            if (minX === 0 || minX > new Date(d.date).getTime()) minX = new Date(d.date).getTime()
            if (maxX === 0 || maxX < new Date(d.date).getTime()) maxX = new Date(d.date).getTime()

            xyData.push({
              x: new Date(d.date).getTime(),
              y: d.value,
              isTraining: d.isTraining
            })
          }
        })

        xyData.sort((a: { x: number }, b: { x: number }) => a.x - b.x)

        datasets.push({
          label: name,
          fill: false,
          pointRadius: 4,
          pointBackgroundColor: xyData.map((d: {
            isTraining: boolean
          }) => d.isTraining ? transparentize(CHART_COLORS.grey, 0.5) : transparentize(namedColor(datasets.length), 0.5)),
          pointBorderColor: xyData.map((d: {
            isTraining: boolean
          }) => d.isTraining ? CHART_COLORS.grey : namedColor(datasets.length)),
          backgroundColor: transparentize(namedColor(datasets.length), 0.5),
          borderColor: namedColor(datasets.length),
          data: xyData
        })
      })

      // add the reference value as a horizontal line
      if (this.showReference) {
        const limit = this.dataStore.getReferenceValue(this.discipline, this.category, this.typeId)
        if (limit) {
          datasets.push({
            label: this.$t("data.staticResultTypes." + this.dataStore.getStaticTypeById(limit.resultStaticTypeId).i18nType),
            data: [
              {x: minX, y: parseFloat(limit.value)},
              {x: maxX, y: parseFloat(limit.value)}
            ]
          })
        }
      }

      return {
        labels: [],
        datasets
      }
    },
    chartOptions(): ChartOptions<"line"> {
      return {
        responsive: true,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day'
            }
          },
          y: {
            ticks: {
              callback: (value) => {
                return formatResult(value.toString(), this.dataStore.getDisciplineById(this.discipline))
              }
            },
            title: {
              display: true,
              text: this.dataStore.getDisciplineById(this.discipline)?.isDescending ? this.$t('glob.distance') : this.$t('glob.time')
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: (context) => {
                return this.$d(new Date(context[0].parsed.x))
              },
              label: (context) => {
                return context.dataset.label + ": " + formatResult(context.parsed.y.toString(), this.dataStore.getDisciplineById(this.discipline))
              }
            }
          }
        }
      }
    },
  },
  methods: {
    canManageResults,
    setModalVisibility(visible: boolean) {
      this.dialogVisible = visible

      this.usersToAdd = [] as string[]
    },
    compare() {
      // add all selected athletes to the graph
      this.usersToAdd.forEach(u => {
        this.addResultSet(u)
      })

      this.setModalVisibility(false)
    },
    addResultSet(userId: string) {
      this.state.state = LoadingStates.Loading
      axios.request({
        url: `/results?userId=${userId}&page_size=9999`,
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        }
      }).then((response: AxiosResponse<Paginated<Result.Data>, any>) => {
        this.state.state = LoadingStates.Loaded

        // create a dataMap. this is only required on first call
        if (!this.dataMap || !this.dataMap.size) {
          this.dataMap = new Map()
        } else if (!response.data?.data.length) {
          // stop here, if the additionally loaded results are empty (i.e. athlete to compare against
          // has no results)
          this.toastStore.addErrorToast(this.$t('comp.evolution.noData'))
          return
        }

        // read the athlete name from the first result entry
        const name = response.data?.data[0].userLastName + " " + response.data?.data[0].userFirstName

        this.dataMap.set(name ?? userId, response.data.data)
      }).catch((response: AxiosError) => {
        this.state.state = LoadingStates.Error
        this.toastStore.addToastFromAxiosError(response)
      })
    },
    resetData() {
      this.dataMap = new Map<string, Result.Data[]>()
    }
  },
})
</script>

<style scoped>

</style>
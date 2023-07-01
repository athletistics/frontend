<template>
  <div>
    <h1>{{ $t('comp.evolution.title') }}</h1>

    <form class="grid md:grid-cols-3 grid-cols-1 gap-4 with-label">
      <div>
        <label>{{ $t('glob.discipline.name') }}</label>
        <select v-model="discipline">
          <option v-for="d in disciplines" :value="d.id">{{ d.i18nName ?? d.customName }}</option>
        </select>
      </div>

      <div>
        <div v-if="filteredCategories?.length">
          <label>{{ $t('comp.evolution.reference') }}</label>
          <div class="flex">
            <input type="checkbox" class="w-6 mr-2" v-model="showReference">
            <select v-model="category">
              <option v-for="c in filteredCategories" :value="c.id">{{ c.name }} {{
                  c.gender ? $t('glob.gender.' + c.gender) : ""
                }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="canManageResults()">
        <LoadingBtn full outlined visual-type="primary" @click="setModalVisibility(true)">
          {{ $t('comp.evolution.compare') }}
        </LoadingBtn>
      </div>
    </form>

    <Line :data="chartData" :options="chartOptions"/>
  </div>

  <Modal ref="modal">
    <form class="space-y-4 with-label">
      <h3>{{ $t('comp.evolution.compare') }}</h3>
      <hr>

      <div>
        <div v-for="u in dataStore.users" class="flex hover:bg-main cursor-pointer">
          <input :id="u.id" :value="u.id" type="checkbox" v-model="usersToAdd" class="mr-2 cursor-pointer">
          <label :for="u.id" class="flex-grow py-3 cursor-pointer">{{ u.lastName }} {{ u.firstName }}</label>
        </div>
      </div>

      <hr>
      <div class="grid sm:grid-cols-2 gap-4">
        <LoadingBtn full outlined visual-type="primary"
                    :state="state" @click="compare()">{{ $t('glob.btn.add') }}
        </LoadingBtn>
        <LoadingBtn full outlined
                    @click="setModalVisibility(false)">{{ $t('glob.btn.cancel') }}
        </LoadingBtn>
      </div>
    </form>
  </Modal>
</template>

<script lang="ts">
import {Line} from 'vue-chartjs'
import {
  Chart as ChartJS,
  ChartOptions,
  Title,
  Tooltip,
  Legend,
  BarElement,
  TimeScale,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
} from 'chart.js'
import 'chartjs-adapter-moment';

import {defineComponent} from 'vue'
import {useAuthStore} from "../../stores/auth";
import {useDataStore} from "../../stores/data";
import {PropType} from "vue/dist/vue";
import axios from "axios";
import Const from "../../plugins/Constants";
import {useToastStore} from "../../stores/toast";
import Discipline from "../../types/Discipline";
import Modal from "../modals/Modal.vue";
import {CHART_COLORS, namedColor, transparentize} from "../../plugins/ChartUtils";
import Category from "../../types/Category";
import {canManageResults} from "../../plugins/AccessControl";
import {formatResult} from "../../plugins/Helper";
import LoadingBtn from "../button/LoadingBtn.vue";
import LoadingState from "../../types/LoadingState";
import {LoadingStates} from "../../types/LoadingStates";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineController, LineElement, PointElement, TimeScale)
export default defineComponent({
  name: "ResultEvolution",
  components: {LoadingBtn, Modal, Line},
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
      dataMap: new Map<string, Result.Data[]>() as Map<string, Result.Data[]>,
      usersToAdd: [] as string[],
      state: {state: NaN} as LoadingState
    }
  },
  computed: {
    filteredCategories(): Category[] {
      let categories = [] as Category[]

      this.dataStore.staticResults.forEach(r => {
        if (r.disciplineId == this.discipline) {
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
      this.dataMap.forEach((data, name) => {
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
      // return an empty dataset if no data is available
      if (!this.dataMap.size) return {labels: [], datasets: []}

      let minX = 0
      let maxX = 0
      let datasets = []

      // create a dataset entry for each available result set
      this.dataMap.forEach((d, name) => {
        let xyData = [] as any[]

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

        xyData.sort((a, b) => a.x - b.x)

        datasets.push({
          label: name,
          fill: false,
          pointRadius: 4,
          pointBackgroundColor: xyData.map(d => d.isTraining ? transparentize(CHART_COLORS.grey , 0.5) : transparentize(namedColor(datasets.length), 0.5)),
          pointBorderColor: xyData.map(d => d.isTraining ? CHART_COLORS.grey : namedColor(datasets.length)),
          backgroundColor: transparentize(namedColor(datasets.length), 0.5),
          borderColor: namedColor(datasets.length),
          data: xyData
        })
      })

      // add the reference value as a horizontal line
      if (this.showReference) {
        const limit = this.dataStore.getReferenceValue(this.discipline, this.category)
        if (limit) {
          datasets.push({
            label: this.$t(this.dataStore.getStaticTypeById(limit.resultStaticTypeId).i18nType),
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
    chartOptions(): ChartOptions {
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
              callback: (value, index, ticks) => {
                return formatResult(value.toString(), this.discipline)
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
                return context.dataset.label + ": " + formatResult(context.parsed.y.toString(), this.discipline)
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
      (this.$refs.modal as any).setVisibility(visible)

      this.usersToAdd = [] as string[]
    },
    compare() {
      this.usersToAdd.forEach(u => {
        this.addResultSet(u)
      })

      this.setModalVisibility(false)
    },
    addResultSet(userId: string) {
      this.state.state = LoadingStates.Loading
      axios.request({
        url: `/results?userId=${userId}`,
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        }
      }).then(response => {
        this.state.state = LoadingStates.Loaded

        if (!this.dataMap || !this.dataMap.size) this.dataMap = new Map()

        const name = response.data[0]?.userLastName + " " + response.data[0]?.userFirstName

        this.dataMap.set(name ?? userId, response.data)
      }).catch(response => {
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
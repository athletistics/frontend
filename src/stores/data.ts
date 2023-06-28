import {acceptHMRUpdate, defineStore} from 'pinia'
import Discipline from "../types/Discipline";
import axios from "axios";
import Const from "../plugins/Constants";
import {useAuthStore} from "./auth";
import User from "../types/User";
import Category from "../types/Category";
import EventType from "../types/EventType";

interface State {
  eventTypes: EventType[]
  disciplines: Discipline[]
  disciplineMap: Map<string, Discipline>
  disciplineMapIsReady: boolean
  categories: Category[]
  categoryMap: Map<string, Category>,
  staticResults: Result.Static[]
  staticResultTypes: Result.StaticType[]
  users: User[]
}

export const useDataStore = defineStore('data', {
  state: (): State => ({
    eventTypes: [] as EventType[],
    disciplines: [] as Discipline[],
    disciplineMap: new Map<string, Discipline>(),
    disciplineMapIsReady: false,
    categories: [] as Category[],
    categoryMap: new Map<string, Category>(),
    staticResults: [] as Result.Static[],
    staticResultTypes: [] as Result.StaticType[],
    users: [] as User[]
  }),
  getters: {
    getEventTypeById(state) {
      return (id: number): EventType | undefined => {
        return state.eventTypes.find(e => e.id === id)
      }
    },
    getDisciplineById(state) {
      return (id: string): Discipline | undefined => {
        if (!state.disciplineMap?.size) return {id, isOfficial: false}

        return state.disciplineMap.get(id)
      }
    },
    getCategoryById(state) {
      return (id: string): Category | undefined => {
        if (!state.categoryMap?.size) return {id, name: "", gender: ""}

        return state.categoryMap.get(id)
      }
    },
    getReferenceValue(state) {
      return (disciplineId: string, categoryId: string): Result.Static | undefined => {
        for (let i = 0; i < state.staticResults.length; i++) {
          const r = state.staticResults[i]

          if (r.categoryId == categoryId && r.disciplineId == disciplineId) {
            return r
          }
        }

        return undefined
      }
    },
    getStaticTypeById(state) {
      return (id: number): Result.StaticType => {
        for (let i = 0; i < state.staticResultTypes.length; i++) {
          if (state.staticResultTypes[i].id === id) return state.staticResultTypes[i]
        }
        return {id: 0, i18nType: ""}
      }
    }
  },
  actions: {
    updateAll() {
      this.updateDisciplines()
      this.updateUsers()
      this.updateStaticResults()
      this.updateCategories()
      this.updateEventTypes()
    },
    updateDisciplines() {
      const authStore = useAuthStore()
      this.disciplineMapIsReady = false

      axios.request({
        url: "/disciplines",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + authStore.token
        },
      }).then(response => {
        this.disciplines = response.data

        this.disciplineMap = new Map<string, Discipline>()
        this.disciplines.forEach(d => this.disciplineMap.set(d.id, d))
        this.disciplineMapIsReady = true
      }).catch(() => console.log('error reading disciplines'))
    },
    updateUsers() {
      const authStore = useAuthStore()

      axios.request({
        url: "/users",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + authStore.token
        },
      }).then(response => {
        this.users = response.data
      }).catch(() => console.log('error reading disciplines'))
    },
    updateCategories() {
      const authStore = useAuthStore()

      axios.request({
        url: "/data/categories?sport=1",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + authStore.token
        },
      }).then(response => {
        this.categories = response.data

        this.categoryMap = new Map<string, Category>()
        this.categories.forEach(c => this.categoryMap.set(c.id, c))
      }).catch(() => console.log('error reading categories'))
    },
    updateStaticResults() {
      const authStore = useAuthStore()

      axios.request({
        url: "/results/static?sport=1",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + authStore.token
        },
      }).then(response => {
        this.staticResults = response.data.results
        this.staticResultTypes = response.data.types
      }).catch(() => console.log('error reading static results'))
    },
    updateEventTypes() {
      const authStore = useAuthStore()

      axios.request({
        url: "/data/eventTypes?filter=false",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + authStore.token
        },
      }).then(response => {
        this.eventTypes = response.data
      }).catch(() => console.log('error reading event types'))
    }
  },
  persist: true
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDataStore, import.meta.hot))
}
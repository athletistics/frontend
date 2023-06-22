import {acceptHMRUpdate, defineStore} from 'pinia'
import Discipline from "../types/Discipline.ts";
import axios from "axios";
import Const from "../plugins/Constants.ts";
import {useAuthStore} from "./auth.ts";
import User from "../types/User.ts";

interface State {
  disciplines: Discipline[]
  disciplineMap: Map<string, Discipline>
  disciplineMapIsReady: boolean
  users: User[]
}

export const useDataStore = defineStore('data', {
  state: (): State => ({
    disciplines: [] as Discipline[],
    disciplineMap: new Map<string, Discipline>(),
    disciplineMapIsReady: false,
    users: [] as User[]
  }),
  getters: {},
  actions: {
    updateAll() {
      this.updateDisciplines()
      this.updateUsers()
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
        console.log('finished')
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
    }
  },
  persist: true
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDataStore, import.meta.hot))
}
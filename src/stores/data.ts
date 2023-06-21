import {acceptHMRUpdate, defineStore} from 'pinia'
import Discipline from "../types/Discipline.ts";
import axios from "axios";
import Const from "../plugins/Constants.ts";
import {useAuthStore} from "./auth.ts";

interface State {
  disciplines: Discipline[]
}

export const useDataStore = defineStore('data', {
  state: (): State => ({
    disciplines: [] as Discipline[]
  }),
  getters: {

  },
  actions: {
    updateDisciplines(){
      const authStore = useAuthStore()

      axios.request({
        url: "/disciplines",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + authStore.token
        },
      }).then(response => {
        this.disciplines = response.data
      }).catch(() => console.log('error reading disciplines'))
    }
  },
  persist: true
})

if(import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDataStore, import.meta.hot))
}
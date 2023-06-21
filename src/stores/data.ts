import {acceptHMRUpdate, defineStore} from 'pinia'

interface State {

}

export const useDataStore = defineStore('data', {
  state: (): State => ({

  }),
  getters: {

  },
  actions: {

  },
  persist: true
})

if(import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDataStore, import.meta.hot))
}
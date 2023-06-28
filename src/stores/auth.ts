import {acceptHMRUpdate, defineStore} from 'pinia'
import axios, {AxiosResponse} from "axios";
import Const from "../plugins/Constants";
import {useMyUserStore} from "./user";

interface State {
  token: string
  is2FaOk: boolean
  has2Fa: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): State => ({
    token: "",
    is2FaOk: false,
    has2Fa: false
  }),
  getters: {
  },
  actions: {
    updateFromServer(callback?: (response: AxiosResponse<any, any>) => void) {
      if (this.token == "") return

      const userStore = useMyUserStore()
      return axios.request({
        url: "/me/auth",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.token
        }
      }).then(response => {
        userStore.setRoles(response.data.authRoles)

        this.has2Fa = response.data.has2Fa
        this.is2FaOk = response.data.is2FaOk

        if (callback) callback(response)
      }).catch(() => {
        this.$reset()
        userStore.$reset()
      })
    },
    set2FaValidated(val: boolean) {
      this.is2FaOk = val
    },
    setHas2Fa(val: boolean) {
      this.has2Fa = val
    },
    clearAuth() {
      this.$reset()
    }
  },
  persist: true
})

if(import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}